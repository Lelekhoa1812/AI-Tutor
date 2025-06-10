# app/routers/search.py
from fastapi import APIRouter, Query
from uuid import uuid4
import asyncio
from app.services import google_books, open_library, internet_archive

router = APIRouter()

@router.get("")
async def search_books(q: str = Query(...)):
    results = await asyncio.gather(
        google_books.search(q),
        open_library.search(q),
        internet_archive.search(q)
    )
    merged = [
        {"candidate_id": str(uuid4()), **item} for source in results for item in source
    ]
    return merged

