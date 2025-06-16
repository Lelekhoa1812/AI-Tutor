# app/routers/search.py
from fastapi import APIRouter, Query
from uuid import uuid4
import asyncio, logging, re

from app.services import (
    google_books,
    open_library,
    internet_archive,
    project_gutenberg,  
)

logger = logging.getLogger("book-query")
router = APIRouter()

def _tokenize(text: str):
    """lower-case & keep only alnum tokens"""
    return re.findall(r"[a-z0-9]+", text.lower())

def _title_matches(title: str, query_tokens: list[str]) -> bool:
    title_lc = title.lower()
    joined = "".join(query_tokens)  # “specialistmath” use-case
    return all(tok in title_lc for tok in query_tokens) or joined in title_lc

@router.get("")
async def search_books(q: str = Query(...)):
    query_tokens = _tokenize(q)
    logger.info(f"🔍 /search called with query={q!r} tokens={query_tokens}")

    # 1. gather raw results
    raw = await asyncio.gather(
        google_books.search(q),
        open_library.search(q),
        internet_archive.search(q),
        project_gutenberg.search(q),     
    )

    # 2. flatten & filter by title tokens
    merged, dropped = [], []
    for source_list in raw:
        for item in source_list:
            if item["title"] and _title_matches(item["title"], query_tokens):
                merged.append({"candidate_id": str(uuid4()), **item})
            else:
                dropped.append(item["title"])

    logger.debug(f"✅ kept {len(merged)} / ❌ dropped {len(dropped)} titles")
    if dropped:
        logger.debug(f"🚮 truncated titles: {dropped[:10]}")

    # Limit to 20 best matches
    return merged[:20]
