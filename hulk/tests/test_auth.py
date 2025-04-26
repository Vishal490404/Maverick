import pytest
from fastapi import status
import json
from hulk.models.user_model import User, UserResponse

@pytest.mark.auth
@pytest.mark.integration
class TestAuthentication:
    
    def test_register_user_requires_admin(self, client, test_user_data):
        """Test that only admins can register new users"""
        # Try to register without admin token
        response = client.post("/auth/register", json=test_user_data)
        
        # Should be rejected with 401 Unauthorized
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_register_user_with_admin(self, client, test_user_data, test_admin_token):
        """Test that an admin can register a new user"""
        # Register with admin token
        response = client.post(
            "/auth/register", 
            json=test_user_data,
            headers={"Authorization": f"Bearer {test_admin_token}"}
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == test_user_data["username"]
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
        assert "password" not in data
        assert data["is_superuser"] == False
    
    def test_login_user(self, client, create_test_user):
        """Test that a user can login with valid credentials"""
        login_data = {
            "username": create_test_user["username"],
            "password": "testpassword123"
        }
        
        # Send form data for OAuth2 password flow
        response = client.post(
            "/auth/login", 
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_initial_admin_setup(self, client, test_admin_data):
        """Test that the initial admin can be created when no users exist"""
        response = client.post("/auth/initial-admin-setup", json=test_admin_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == test_admin_data["username"]
        assert data["email"] == test_admin_data["email"]
        assert data["is_superuser"] == True
    
    def test_initial_admin_setup_fails_if_users_exist(self, client, test_admin_data, create_test_user):
        """Test that initial admin setup fails if users already exist"""
        response = client.post("/auth/initial-admin-setup", json=test_admin_data)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_get_me_endpoint(self, client, test_user_token):
        """Test that a logged-in user can access their own information"""
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"
        assert "password" not in data
    
    def test_protected_route(self, client, test_user_token):
        """Test that a protected route requires authentication"""
        # Without token
        response = client.get("/protected")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # With token
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "This is a protected route"
        assert data["user"] == "testuser"