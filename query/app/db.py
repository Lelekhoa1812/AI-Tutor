# app/db.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pymongo.uri_parser import parse_uri
import os, logging

logger          = logging.getLogger("book-query")
MONGO_URI       = os.getenv("MONGODB_URI")
MONGO_DB_NAME   = os.getenv("MONGODB_DB", "querysearcher")
TEXTBOOK_URI    = os.getenv("TEXTBOOK_URI")         

# ────────────────────────────────────────────────────────────────
# helpers for the main “query-searcher” DB
# ────────────────────────────────────────────────────────────────
def get_client():
    return AsyncIOMotorClient(MONGO_URI)

def get_db():
    return get_client()[MONGO_DB_NAME]

def get_gridfs():
    return AsyncIOMotorGridFSBucket(get_db())

# ────────────────────────────────────────────────────────────────
# ONE canonical helper for the *textbook* bucket
# ────────────────────────────────────────────────────────────────
def _get_textbook_fs() -> AsyncIOMotorGridFSBucket:
    """
    Build (and cache) a GridFS bucket that points to the textbook replica.
    Works whether TEXTBOOK_URI ends with '/<db>' or not.
    """
    if not TEXTBOOK_URI:
        raise RuntimeError("TEXTBOOK_URI not set in environment")

    parsed   = parse_uri(TEXTBOOK_URI)
    db_name  = parsed.get("database") or "textbooks"      # fallback name
    client   = AsyncIOMotorClient(TEXTBOOK_URI)
    return AsyncIOMotorGridFSBucket(client[db_name])

# ── public wrappers ─────────────────────────────────────────────
async def save_to_textbook_fs(doc_id: str, file_path: str):
    try:
        bucket = _get_textbook_fs()
        with open(file_path, "rb") as fp:
            await bucket.upload_from_stream(f"{doc_id}.pdf", fp)
        logger.info(f"📦 textbook PDF stored for {doc_id} → {TEXTBOOK_URI}")
    except Exception as e:
        logger.warning(f"⚠️ textbook GridFS save failed: {e}")

# Fetch to view PDF on frontend
async def fetch_textbook_pdf(doc_id: str):
    bucket = _get_textbook_fs()
    return await bucket.open_download_stream_by_name(f"{doc_id}.pdf")

# Delete textbook when handshake failed
async def delete_textbook_pdf(doc_id: str):
    bucket = _get_textbook_fs()
    try:
        file = await bucket.find({"filename": f"{doc_id}.pdf"}).to_list(1)
        if file:
            await bucket.delete(file[0]["_id"])
    except Exception:
        pass
