# Directory structure
# ├── app/
# │   ├── main.py
# │   ├── db.py
# │   ├── routers/
# │   │   ├── search.py
# │   │   └── import_doc.py
# │   │   └── ws_progress.py
# │   ├── services/
# │   │   ├── google_books.py
# │   │   ├── open_library.py
# │   │   └── internet_archive.py
# │   │   └── project_gutenberg.py
# │   └── health/
# │       └── check_status.py
# ├── Dockerfile
# ├── docker-compose.yml
# └── README.md
# https://binkhoale1812-querysearcher.hf.space/

# app/main.py
from fastapi import FastAPI, WebSocket
from app.routers import search, import_doc
from app.health import check_status
import app.config

# Debugger
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
    force=True
)
logger = logging.getLogger("book-query")
logger.setLevel(logging.DEBUG)
# Silence noisy pymongo logs
for noisy_module in ["pymongo", "pymongo.server_selection", "pymongo.topology", "pymongo.connection"]:
    logging.getLogger(noisy_module).setLevel(logging.WARNING)
logger.info("🚀 Starting Tutor Book Querier...")

app = FastAPI()

app.include_router(search.router, prefix="/search")
app.include_router(import_doc.router, prefix="/import")
app.include_router(check_status.router, prefix="/health")

@app.websocket("/ws/documents/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    await websocket.accept()
    from app.routers.ws_progress import forward_progress
    await forward_progress(websocket, document_id)
