# app/routers/import.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import db, grid_fs_bucket
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

    result = await source_lookup[req.source](req.ref)
    logger.debug(f"🔎 Fetch result for ref {req.ref}: {result}")
    
    # Debugs
    if not result:
        logger.warning(f"⛔️ No fetch result for {req.source} with ref {req.ref}")
        raise HTTPException(403, "Download not permitted")
    if not result.get("download_url"):
        logger.warning(f"📄 No download URL from {req.source}. Viewability: {result.get('viewability', 'unknown')}")
        raise HTTPException(403, "Download not permitted")

    # Write temp file and save as Pdf from downloadable link
    download_url = result["download_url"]
    file_path = f"/tmp/{req.candidate_id}.pdf"
    logger.info(f"⬇️ Downloading from: {download_url}")

    # Read and write file 
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
    
    # Save to bucket
    try:
        with open(file_path, "rb") as f:
            await grid_fs_bucket.upload_from_stream(f"{req.candidate_id}.pdf", f)
        os.remove(file_path)
    except Exception as e:
        logger.error(f"💥 Failed to upload to GridFS: {e}")
        raise HTTPException(500, "Storage failed")
    
    # Doc tags
    doc = {
        "_id": req.candidate_id,
        "title": req.title,
        "status": "queued",
        "metadata": result
    }
    await db.documents.insert_one(doc)
    asyncio.create_task(parse_and_index(req.candidate_id))
    logger.info(f"📚 Document {req.candidate_id} queued for indexing")
    return {"document_id": req.candidate_id, "status": "queued"}

