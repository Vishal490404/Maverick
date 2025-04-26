import pytest
from fastapi.testclient import TestClient
import sys
import os
from pymongo import MongoClient
from datetime import datetime, timedelta

# Add the root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Now we can import from our project
from hulk.security.main import create_access_token, get_password_hash
from hulk.apis.Ginny.utils import set_test_db

@pytest.fixture
def app():
    """
    Get application for testing
    """
    from hulk.main import app
    return app

@pytest.fixture
def client(app, test_db):
    """
    Create a test client for the FastAPI application
    """
    # Set the test database for the application to use
    set_test_db(test_db)
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up after the test
    set_test_db(None)

@pytest.fixture(scope="function")
def test_db():
    """
    Create a test database and clean it up after test is complete
    """
    # Connect to MongoDB using test DB name
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    test_db_name = "examcraft_auth_test"
    db = client[test_db_name]
    
    # Clear any existing data
    client.drop_database(test_db_name)
    
    # Return the test database
    yield db
    
    # Clean up after test
    client.drop_database(test_db_name)
    client.close()

@pytest.fixture
def test_user_data():
    """
    Return test user data for authentication tests
    """
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "password_confirm": "testpassword123",
        "full_name": "Test User",
        "is_superuser": False,
        "privileges": []  # Add empty privileges list
    }

@pytest.fixture
def test_admin_data():
    """
    Return test admin data for authentication tests
    """
    return {
        "username": "admin",
        "email": "admin@example.com",
        "password": "adminpassword123",
        "password_confirm": "adminpassword123",
        "full_name": "Admin User",
        "is_superuser": True,
        "privileges": []  # Add empty privileges list
    }

@pytest.fixture
def create_test_user(test_db, test_user_data):
    """
    Create a test user in the database
    """
    user_data = test_user_data.copy()
    user_data["password"] = get_password_hash(user_data["password"])
    del user_data["password_confirm"]
    
    # Insert user into database
    test_db["users"].insert_one(user_data)
    
    return user_data

@pytest.fixture
def create_test_admin(test_db, test_admin_data):
    """
    Create a test admin in the database
    """
    admin_data = test_admin_data.copy()
    admin_data["password"] = get_password_hash(admin_data["password"])
    del admin_data["password_confirm"]
    
    # Insert admin into database
    test_db["users"].insert_one(admin_data)
    
    return admin_data

@pytest.fixture
def test_user_token(create_test_user):
    """
    Create a valid token for the test user
    """
    access_token = create_access_token(
        data={"sub": create_test_user["username"], "is_superuser": False},
        expires_delta=timedelta(minutes=30)
    )
    return access_token

@pytest.fixture
def test_admin_token(create_test_admin):
    """
    Create a valid token for the test admin
    """
    access_token = create_access_token(
        data={"sub": create_test_admin["username"], "is_superuser": True},
        expires_delta=timedelta(minutes=30)
    )
    return access_token