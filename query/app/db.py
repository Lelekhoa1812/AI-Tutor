# app/db.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import os

MONGO_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGO_URI)
MONGO_DB_NAME = os.getenv("MONGODB_DB", "querysearcher") # fallback default
db = client[MONGO_DB_NAME]
grid_fs_bucket = AsyncIOMotorGridFSBucket(db)
