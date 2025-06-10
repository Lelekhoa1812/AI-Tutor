# app/services/internet_archive.py
import httpx
from tenacity import retry, stop_after_attempt, wait_fixed

@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
async def search(q):
    url = f"https://archive.org/advancedsearch.php?q={q}&output=json&rows=5"
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(url)
        docs = res.json().get("response", {}).get("docs", [])
        return [
            {
                "title": d.get("title"),
                "author": d.get("creator", ""),
                "edition": d.get("identifier"),
                "year": d.get("year"),
                "source": "ia",
                "isbn": d.get("isbn", [""])[0] if d.get("isbn") else "",
                "download_available": "public" in d.get("rights", "").lower(),
                "download_url": f"https://archive.org/download/{d['identifier']}/{d['identifier']}.pdf" if "public" in d.get("rights", "").lower() else None,
                "ref": {"id": d.get("identifier")}
            } for d in docs if d.get("identifier")
        ]

async def fetch(ref):
    identifier = ref.get("id")
    if not identifier:
        return None
    url = f"https://archive.org/metadata/{identifier}"
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get(url)
        metadata = res.json()
        rights = metadata.get("metadata", {}).get("rights", "")
        if "public" in rights.lower():
            return {
                "download_available": True,
                "download_url": f"https://archive.org/download/{identifier}/{identifier}.pdf"
            }
    return {"download_available": False}
