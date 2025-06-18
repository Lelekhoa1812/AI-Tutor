# app/db.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import os

MONGO_URI = os.getenv("MONGODB_URI")
MONGO_DB_NAME = os.getenv("MONGODB_DB", "querysearcher")

# Return a fresh client for current event loop
def get_client():
    return AsyncIOMotorClient(MONGO_URI)

def get_db():
    return get_client()[MONGO_DB_NAME]

def get_gridfs():
    return AsyncIOMotorGridFSBucket(get_db())
