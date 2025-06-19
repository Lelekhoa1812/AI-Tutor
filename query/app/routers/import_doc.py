# app/routers/import_doc.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.db import get_db, get_gridfs, save_to_textbook_fs, fetch_textbook_pdf
from app.services import google_books, open_library, internet_archive, project_gutenberg
from app.services.ingest import parse_and_index
import aiofiles, uuid, os
import asyncio
import httpx

import logging
logger = logging.getLogger("book-query")

router = APIRouter()

class ImportRequest(BaseModel):
    candidate_id: str
    title: str
    source: str
    ref: dict

# Embedding, query and PDF saver to buckets
@router.post("")
async def import_book(req: ImportRequest):
    logger.info(f"📥 Received import request: {req.dict()}")
    source_lookup = {
        "google": google_books.fetch,
        "openlibrary": open_library.fetch,
        "ia": internet_archive.fetch,
        "gutenberg": project_gutenberg.fetch, 
    }
    if req.source not in source_lookup:
        logger.warning(f"❌ Invalid source: {req.source}")
        raise HTTPException(400, "Invalid source")
   # Insert placeholder doc immediately so WebSocket has something to track
    db = get_db()
    placeholder_doc = {
        "_id": req.candidate_id,
        "title": req.title,
        "status": "PENDING",
        "metadata": {
            "source": req.source,
            "ref": req.ref
        }
    }
    await db.documents.replace_one({"_id": req.candidate_id}, placeholder_doc, upsert=True) 
    # Try to fetch from source
    result = await source_lookup[req.source](req.ref)
    logger.debug(f"🔎 Fetch result for ref {req.ref}: {result}")
    # Invalid URL
    if not result:
        logger.warning(f"⛔️ No fetch result for {req.source} with ref {req.ref}")
        raise HTTPException(403, "Download not permitted")
    # Preview only
    if not result.get("download_url"):
        logger.warning(f"📄 No download URL from {req.source}. Viewability: {result.get('viewability', 'unknown')}")
        raise HTTPException(403, "Download not permitted")
    # Download PDF to temp path
    download_url = result["download_url"]
    file_path = f"/tmp/{req.candidate_id}.pdf"
    logger.info(f"⬇️ Downloading from: {download_url}")
    # Read and Write
    try:
        async with aiofiles.open(file_path, mode='wb') as f:
            async with httpx.AsyncClient() as client:
                r = await client.get(download_url)
                r.raise_for_status()
                await f.write(r.content)
        logger.info(f"✅ PDF saved to {file_path}")
    except Exception as e:
        logger.error(f"🚨 Failed to download or write PDF: {e}")
        raise HTTPException(500, "Failed to download PDF")
    # Save to both buckets
    try:
        grid_fs_bucket = get_gridfs()
        with open(file_path, "rb") as f:
            await grid_fs_bucket.upload_from_stream(f"{req.candidate_id}.pdf", f)
        await save_to_textbook_fs(req.candidate_id, file_path)
        os.remove(file_path)
    except Exception as e:
        logger.error(f"💥 Failed to upload to GridFS: {e}")
        raise HTTPException(500, "Storage failed")
    # Update document metadata after download
    await db.documents.update_one(
        {"_id": req.candidate_id},
        {
            "$set": {
                "status": "DOWNLOADING",
                "metadata": result
            }
        }
    )
    # Trigger async embedding
    asyncio.create_task(parse_and_index(req.candidate_id))
    logger.info(f"📚 Document {req.candidate_id} queued for indexing")
    # Return info to frontend
    uri = f"/import/textbook/{req.candidate_id}"
    return {
        "status": "QUEUED",
        "id": req.candidate_id,
        "title": req.title,
        "source": req.source,
        "documentId": req.candidate_id,
        "uri": uri
    }


# Fetch textbook on id
@router.get("/textbook/{doc_id}")
async def get_textbook(doc_id: str):
    try:
        stream = await fetch_textbook_pdf(doc_id)
        return StreamingResponse(stream, media_type="application/pdf")
    except Exception as e:
        logger.error(f"❌ Failed to serve textbook {doc_id}: {e}")
        raise HTTPException(404, "Textbook not found")