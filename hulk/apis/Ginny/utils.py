from pymongo import MongoClient
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=".env")

_test_db = None

def set_test_db(db):
    global _test_db
    _test_db = db

def get_mongo_client() -> MongoClient:
    client = MongoClient(os.getenv("MONGO_URI"))
    return client

def get_auth_db():
    global _test_db
    if _test_db is not None:
        return _test_db
        
    client = get_mongo_client()
    db = client[os.getenv("MONGO_AUTH_DB")]
    return db

