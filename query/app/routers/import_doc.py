# app/routers/import.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import db, grid_fs_bucket
from app.services import google_books, open_library, internet_archive
from app.services.ingest import parse_and_index
import aiofiles, uuid, os
import asyncio
import httpx

router = APIRouter()

class ImportRequest(BaseModel):
    candidate_id: str
    title: str
    source: str
    ref: dict

@router.post("")
async def import_book(req: ImportRequest):
    source_lookup = {
        "google": google_books.fetch,
        "openlibrary": open_library.fetch,
        "ia": internet_archive.fetch
    }
    if req.source not in source_lookup:
        raise HTTPException(400, "Invalid source")

    result = await source_lookup[req.source](req.ref)
    print(f"[DEBUG] Import source result: {result}")  # We need to debug out the result from Google API
    
    # Debugs
    if not result:
        print("[INFO] No download result returned from fetch().")
        raise HTTPException(403, "Download not permitted")
    if not result.get("download_url"):
        print(f"[INFO] No download URL. Viewability: {result.get('viewability', 'N/A')}")
        raise HTTPException(403, "Download not permitted")

    # Write temp file and save as Pdf from downloadable link
    download_url = result["download_url"]
    file_path = f"/tmp/{req.candidate_id}.pdf"

    async with aiofiles.open(file_path, mode='wb') as f:
        async with httpx.AsyncClient() as client:
            r = await client.get(download_url)
            await f.write(r.content)

    with open(file_path, "rb") as f:
        await grid_fs_bucket.upload_from_stream(f"{req.candidate_id}.pdf", f)

    os.remove(file_path)
    doc = {
        "_id": req.candidate_id,
        "title": req.title,
        "status": "queued",
        "metadata": result
    }
    asyncio.create_task(parse_and_index(req.candidate_id))

    return {"document_id": req.candidate_id, "status": "queued"}

