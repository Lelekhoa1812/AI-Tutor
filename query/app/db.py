# app/db.py
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket

MONGO_URI = os.getenv("MONGODB_URI")
MONGO_DB_NAME = os.getenv("MONGODB_DB", "querysearcher")

# Create client safely (without loop binding)
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB_NAME]
grid_fs_bucket = AsyncIOMotorGridFSBucket(db)
