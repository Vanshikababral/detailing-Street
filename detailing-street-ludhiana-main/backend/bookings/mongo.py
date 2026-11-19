import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(ROOT_DIR / '.env.local')
load_dotenv(BASE_DIR / '.env')

_client: MongoClient | None = None

def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        uri = os.environ.get('MONGODB_URI')
        if not uri:
            raise ValueError('MONGODB_URI not found in environment variables.')
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=5,
            maxIdleTimeMS=45000,
        )
    return _client

def get_db() -> Database:
    client = get_mongo_client()
    database_name = os.environ.get('MONGODB_DATABASE', 'test').strip()
    if not database_name:
        raise ValueError('MONGODB_DATABASE must not be empty.')
    return client[database_name]

def get_collection(name: str) -> Collection:
    db = get_db()
    return db[name]
