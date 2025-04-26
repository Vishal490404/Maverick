import pytest
from datetime import timedelta
import jwt
from hulk.security.main import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    SECRET_KEY,
    ALGORITHM
)

@pytest.mark.auth
@pytest.mark.unit
class TestSecurity:
    
    def test_password_hashing(self):
        """Test that password hashing and verification works correctly"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Hashed password should be different from original
        assert hashed != password
        
        # Verification should work correctly
        assert verify_password(password, hashed) == True
        assert verify_password("wrongpassword", hashed) == False
    
    def test_create_access_token(self):
        """Test that access token generation works correctly"""
        # Create token with test data
        data = {"sub": "testuser", "is_superuser": False}
        expires = timedelta(minutes=30)
        token = create_access_token(data, expires)
        
        # Token should be a string
        assert isinstance(token, str)
        
        # Verify token contents
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "testuser"
        assert payload["is_superuser"] == False
        assert "exp" in payload  # Expiration time should be present