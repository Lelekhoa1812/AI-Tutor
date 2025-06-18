import asyncio
import logging
from fastapi import WebSocket
from app.db import get_db

logger = logging.getLogger("book-query")

async def forward_progress(websocket: WebSocket, document_id: str):
    db = get_db()
    try:
        while True:
            doc = await db.documents.find_one({"_id": document_id})
            if not doc:
                await websocket.send_json({"status": "NOT_FOUND"})
                await asyncio.sleep(2)
                continue

            status = doc.get("status", "UNKNOWN")
            await websocket.send_json({"status": status})
            if status in {"READY", "FAILED"}:
                break

            await asyncio.sleep(2)
    except Exception as e:
        logger.exception(f"📡 WebSocket failed for doc {document_id}: {e}")
        await websocket.send_json({"status": "ERROR"})
    finally:
        await websocket.close()
