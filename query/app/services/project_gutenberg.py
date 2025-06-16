# app/services/project_gutenberg.py
import httpx, logging, re, urllib.parse
from tenacity import retry, stop_after_attempt, wait_fixed

logger = logging.getLogger("book-query")

GUTENDEX = "https://gutendex.com/books/?search="

# Query for items return
@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
async def search(q: str):
    """Return at most 5 PDF-downloadable results from Gutendex."""
    url = f"{GUTENDEX}{urllib.parse.quote_plus(q)}"
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        r = await client.get(url)
        r.raise_for_status()
        books = r.json().get("results", [])[:10]

    results = []
    for b in books:
        # Find a PDF format, ignore non-PDF rows
        pdf_link = next(
            (v for k, v in b["formats"].items() if k.endswith("pdf")), None
        )
        if not pdf_link:
            logger.debug(f"[GUT] skipped (no PDF): {b['title']}")
            continue

        results.append(
            {
                "title": b["title"],
                "author": ", ".join(a["name"] for a in b["authors"]),
                "edition": "",  # not supplied
                "year": b.get("copyright_year"),
                "source": "gutenberg",
                "isbn": "",
                "download_available": True,
                "download_url": pdf_link,
                "ref": {"id": b["id"]},
            }
        )
    logger.info(f"[GUT] returned {len(results)} pdf titles for “{q}”")
    return results

# Fetch items
async def fetch(ref: dict):
    """For import: just return the same direct PDF link."""
    gid = ref.get("id")
    if not gid:
        return None
    url = f"https://gutendex.com/books/{gid}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        if r.status_code != 200:
            return None
        data = r.json()
        pdf_link = next(
            (v for k, v in data["formats"].items() if k.endswith("pdf")), None
        )
        if pdf_link:
            return {"download_available": True, "download_url": pdf_link}
    return None
