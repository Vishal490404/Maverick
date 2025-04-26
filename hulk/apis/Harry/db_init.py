from pymongo import MongoClient
import os


def get_curriculum_db():
    """Get MongoDB curriculum database connection"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    return client.examcraft

