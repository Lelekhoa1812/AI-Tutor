FROM python:3.12-slim

# ───────────────────────────────
# ENVIRONMENT VARIABLES
# ───────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/app/model_cache \
    HF_HOME=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface/sentence-transformers

# HF_TOKEN is optional (e.g. for gated models)
ARG HF_TOKEN
ENV HF_TOKEN=${HF_TOKEN}

# ───────────────────────────────
# WORKDIR
# ───────────────────────────────
WORKDIR /app

# ───────────────────────────────
# SYSTEM DEPENDENCIES
# ───────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 git curl && \
    rm -rf /var/lib/apt/lists/*

# ───────────────────────────────
# PYTHON DEPENDENCIES
# ───────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ───────────────────────────────
# CREATE CACHE DIRS & MODEL WARM-UP
# ───────────────────────────────
RUN mkdir -p /app/model_cache /app/.cache/huggingface/sentence-transformers && \
    python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ───────────────────────────────
# CREATE NON-ROOT USER
# ───────────────────────────────
RUN useradd -m -u 1000 user && \
    chown -R user:user /app
USER user

# ───────────────────────────────
# COPY PROJECT FILES
# ───────────────────────────────
COPY . .

# ───────────────────────────────
# RUN SERVER
# ───────────────────────────────
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:7860"]
