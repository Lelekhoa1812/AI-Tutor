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
        pdf_link = next(
            (v for k, v in b["formats"].items() if k.lower().endswith("pdf")), None
        )
        # Link not from public details
        if not pdf_link:
            try:
                # Attempt fallback hardcoded PDF URL
                fallback_url = f"https://www.gutenberg.org/files/{b['id']}/{b['id']}-pdf.pdf"
                async with httpx.AsyncClient(timeout=5) as client:
                    head_resp = await client.head(fallback_url)
                    if head_resp.status_code == 200:
                        pdf_link = fallback_url
            # PDF not accessible from 
            except Exception as e:
                logger.debug(f"[GUT] fallback failed for {b['id']}: {e}")
        # Fallback book not having preview/download url from both details and hardcode method
        if not pdf_link:
            logger.debug(f"[GUT] skipped (no PDF): {b['title']}")
            continue
        # Final JSON
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
    """For import: return direct PDF link if available via Gutendex or fallback to Gutenberg."""
    gid = ref.get("id")
    if not gid:
        return None
    # Trailing to preview page for PDF confirmation
    gutendex_url = f"https://gutendex.com/books/{gid}/"  # ensure trailing slash
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            r = await client.get(gutendex_url)
            if r.status_code == 200:
                data = r.json()
                pdf_link = next(
                    (v for k, v in data["formats"].items() if k.lower().endswith("pdf")),
                    None
                )
                if pdf_link:
                    return {"download_available": True, "download_url": pdf_link}
    except Exception as e:
        logger.warning(f"[GUT] Gutendex metadata failed for {gid}: {e}")
    # Fallback to static Gutenberg URL
    fallback_url = f"https://www.gutenberg.org/files/{gid}/{gid}-pdf.pdf"
    async with httpx.AsyncClient(timeout=10) as client:
        head = await client.head(fallback_url)
        if head.status_code == 200:
            logger.info(f"[GUT] Using fallback PDF: {fallback_url}")
            return {"download_available": True, "download_url": fallback_url}
    # Log
    logger.warning(f"[GUT] No PDF for book {gid}")
    return None
