# Directory structure
# ├── app/
# │   ├── main.py
# │   ├── db.py
# │   ├── routers/
# │   │   ├── search.py
# │   │   └── import_doc.py
# │   └── services/
# │       ├── google_books.py
# │       ├── open_library.py
# │       └── internet_archive.py
# ├── Dockerfile
# ├── docker-compose.yml
# └── README.md
# https://binkhoale1812-querysearcher.hf.space/

# app/main.py
from fastapi import FastAPI, WebSocket
from app.routers import search, import_doc

app = FastAPI()

app.include_router(search.router, prefix="/search")
app.include_router(import_doc.router, prefix="/import")

@app.websocket("/ws/documents/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    await websocket.accept()
    from app.services.ws_progress import forward_progress
    await forward_progress(websocket, document_id)
