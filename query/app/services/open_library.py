# app/services/open_library.py
import httpx
from tenacity import retry, stop_after_attempt, wait_fixed

@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
async def search(q):
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(f"https://openlibrary.org/search.json?q={q}")
        docs = res.json().get("docs", [])
        return [
            {
                "title": d.get("title"),
                "author": ", ".join(d.get("author_name", [])),
                "edition": d.get("edition_key", [""])[0],
                "year": d.get("first_publish_year"),
                "source": "openlibrary",
                "isbn": d.get("isbn", [""])[0] if d.get("isbn") else "",
                "download_available": bool(d.get("public_scan_b")),
                "download_url": f"https://openlibrary.org/books/{d['edition_key'][0]}.pdf" if d.get("public_scan_b") else None,
                "ref": {"edition": d.get("edition_key", [""])[0]}
            } for d in docs[:5] if d.get("edition_key")
        ]

async def fetch(ref):
    edition = ref.get("edition")
    if not edition:
        return None
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(f"https://openlibrary.org/books/{edition}.json")
        data = res.json()
        if data.get("public_scan"):
            return {
                "download_available": True,
                "download_url": f"https://openlibrary.org/books/{edition}.pdf"
            }
    return {"download_available": False}