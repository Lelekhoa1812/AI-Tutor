# app/health/check_status.py
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging

router = APIRouter()
logger = logging.getLogger("book-query")

@router.get("")
async def get_status():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
        db = client[os.getenv("MONGODB_DB", "querysearcher")]

        docs = await db.documents.find().sort("_id", -1).limit(5).to_list(length=5)
        doc_count = await db.documents.count_documents({})
        embed_count = await db.embeddings.count_documents({})

        return {
            "status": "ok",
            "documents_total": doc_count,
            "embeddings_total": embed_count,
            "recent_documents": [
                {
                    "id": doc.get("_id"),
                    "title": doc.get("title"),
                    "status": doc.get("status"),
                }
                for doc in docs
            ]
        }
    except Exception as e:
        logger.exception("❌ Health check failed")
        return {"status": "error", "error": str(e)}
