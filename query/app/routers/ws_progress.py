# app/routers/ws_progress.py
import asyncio, logging, contextlib
from fastapi import WebSocket, WebSocketDisconnect
from bson import ObjectId
from app.db import get_db, get_gridfs, delete_textbook_pdf

logger = logging.getLogger("book-query")

async def _delete_everything(doc_id: str):
    """Remove embeddings, GridFS file & textbook copy if the user vanished."""
    db           = get_db()
    gridfs_query = get_gridfs()
    # remove metadata + embeddings
    await db.documents.delete_one({"_id": doc_id})
    await db.embeddings.delete_many({"document_id": doc_id})
    # remove original PDF from the main bucket
    with contextlib.suppress(Exception):
        file = await gridfs_query.find({"filename": f"{doc_id}.pdf"}).to_list(1)
        if file:
            await gridfs_query.delete(file[0]["_id"])
    # remove textbook replica
    with contextlib.suppress(Exception):
        await delete_textbook_pdf(doc_id)
    logger.info(f"🗑️  cleaned up artefacts of {doc_id}")


async def forward_progress(websocket: WebSocket, document_id: str):
    """Handle state change allowing frontend to connect and update seamlessly."""
    logger.info(f"📡 WebSocket accepted for doc {document_id}")
    try:
        db = get_db()
        doc = await db.documents.find_one({"_id": document_id})
        if not doc:
            await websocket.send_json({"status": "NOT_FOUND"})
            return
        # Valid doc
        while True:
            doc = await db.documents.find_one({"_id": document_id})
            if not doc:
                await websocket.send_json({"status": "NOT_FOUND"})
                return
            # Get status real-time
            status = doc.get("status")
            if status == "READY":
                await websocket.send_json({
                    "status": "READY",
                    "id": doc["_id"],
                    "title": doc.get("title"),
                    "source": doc.get("metadata", {}).get("source", "unknown"),
                    "documentId": doc["_id"],
                    "uri": f"/import/textbook/{doc['_id']}",
                })
                break
            elif status == "FAILED":
                await websocket.send_json({"status": "FAILED"})
                break
            await asyncio.sleep(1.5)
    except Exception as e:
        logger.exception(f"📡 WebSocket failed for doc {document_id}: {e}")
        try:
            await websocket.send_json({"status": "ERROR"})
            await websocket.close()
        except Exception:
            pass
    finally:
        logger.info(f"📡 WebSocket closed for doc {document_id}")
