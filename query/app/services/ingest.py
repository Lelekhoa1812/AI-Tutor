# app/services/ingest.py
import os
import fitz  # PyMuPDF - convert PDF to plaintext for semantic embedding
import io
from app.db import db, grid_fs_bucket
from sentence_transformers import SentenceTransformer

async def parse_and_index(document_id: str):
    print(f"[INFO] Starting ingestion for document: {document_id}")
    try:
        # Lazy model load
        model = SentenceTransformer("all-MiniLM-L6-v2")

        # Load PDF from GridFS
        buffer = io.BytesIO()
        await grid_fs_bucket.download_to_stream_by_name(f"{document_id}.pdf", buffer)
        buffer.seek(0)

        # Extract text from PDF
        text_chunks = []
        with fitz.open(stream=buffer.read(), filetype="pdf") as doc:
            for page in doc:
                text = page.get_text("text")
                if text.strip():
                    text_chunks.append(text.strip())

        if not text_chunks:
            raise ValueError("No text extracted from PDF.")

        # Embed chunks
        embeddings = model.encode(text_chunks, convert_to_tensor=True)

        # Store in MongoDB
        entries = [
            {
                "document_id": document_id,
                "chunk_id": i,
                "text": chunk,
                "embedding": embedding.tolist()
            }
            for i, (chunk, embedding) in enumerate(zip(text_chunks, embeddings))
        ]
        await db.embeddings.insert_many(entries)
        await db.documents.update_one({"_id": document_id}, {"$set": {"status": "READY"}})

        print(f"[INFO] Finished indexing {len(entries)} chunks from document: {document_id}")

    except Exception as e:
        print(f"[ERROR] Ingestion failed for {document_id}: {e}")
        await db.documents.update_one({"_id": document_id}, {"$set": {"status": "FAILED"}})
