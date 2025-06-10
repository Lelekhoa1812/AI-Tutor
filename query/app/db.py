
# app/db.py
import motor.motor_asyncio
from gridfs import GridFSBucket
import os

MONGO_URI = os.getenv("MONGODB_URI")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()
grid_fs_bucket = GridFSBucket(db)
