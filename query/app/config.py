import os
os.environ["TRANSFORMERS_CACHE"] = "/app/model_cache"
os.environ["HF_HOME"] = "/app/.cache/huggingface"
os.environ["SENTENCE_TRANSFORMERS_HOME"] = "/app/.cache/huggingface/sentence-transformers"
