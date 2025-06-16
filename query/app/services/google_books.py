# app/services/google_books.py
import httpx, os
from tenacity import retry, stop_after_attempt, wait_fixed
import logging
logger = logging.getLogger("book-query")

@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
async def search(q):
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(f"https://www.googleapis.com/books/v1/volumes?q={q}&key={os.getenv('GOOGLE_BOOKS_KEY')}")
        data = res.json().get("items", [])
        return [
            {
                "title": b["volumeInfo"].get("title"),
                "author": ", ".join(b["volumeInfo"].get("authors", [])),
                "edition": b["volumeInfo"].get("subtitle", ""),
                "year": b["volumeInfo"].get("publishedDate", "")[:4],
                "source": "google",
                "isbn": b["volumeInfo"].get("industryIdentifiers", [{}])[0].get("identifier", ""),
                "download_available": False,  # Google Books rarely allows this
                "download_url": None,
                "ref": {"id": b["id"]},
                # "web_reader_url": b["accessInfo"].get("webReaderLink"),                           # Access site, not always available
                "web_reader_url": f"https://books.google.com/books/about?id={b['id']}&redir_esc=y", # Info site, easy visible
                "viewability": b["accessInfo"]["viewability"],
            } for b in data
        ]

async def fetch(ref):
    logger = logging.getLogger("book-query")
    logger.debug(f"[Google] fetch() called with ref={ref}")
    return None  # Always returns None, so import will 403

