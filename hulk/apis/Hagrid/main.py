from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..Ginny.utils import get_auth_db
from models.user_model import UserCreate, UserResponse, UserPrivileges
from security.main import get_password_hash, verify_password, create_access_token, Token, get_current_user, get_current_admin_user
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

router = APIRouter(prefix="/auth", tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

@router.post('/register', status_code=201, response_model=UserResponse)
async def register(user_create: UserCreate, current_admin = Depends(get_current_admin_user)):
    if user_create.password != user_create.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    db = get_auth_db()
    users_collection = db["users"]
    
    existing_user = users_collection.find_one({"username": user_create.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = users_collection.find_one({"email": user_create.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = user_create.model_dump(exclude={"password_confirm"})
    user_dict["is_superuser"] = user_create.is_superuser if user_create.is_superuser is not None else False  
    
    # Ensure privileges is initialized as an empty list if not provided
    if "privileges" not in user_dict:
        user_dict["privileges"] = []
    
    hashed_password = get_password_hash(user_create.password)
    user_dict["password"] = hashed_password
    
    result = users_collection.insert_one(user_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return UserResponse(**{k: v for k, v in user_dict.items() if k != "password"})


@router.post('/initial-admin-setup', status_code=201, response_model=UserResponse)
async def create_initial_admin(user_create: UserCreate):
    
    if user_create.password != user_create.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    db = get_auth_db()
    users_collection = db["users"]
    
    existing_users_count = users_collection.count_documents({})
    if existing_users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Initial admin setup can only be performed when no users exist in the system"
        )
    
    user_dict = user_create.model_dump(exclude={"password_confirm"})
    user_dict["is_superuser"] = True
    if "privileges" not in user_dict:
        user_dict["privileges"] = [UserPrivileges.ALL]
    
    hashed_password = get_password_hash(user_create.password)
    user_dict["password"] = hashed_password
    
    result = users_collection.insert_one(user_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create initial admin user"
        )
    
    return UserResponse(**{k: v for k, v in user_dict.items() if k != "password"})


@router.post('/login', response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_auth_db()
    users_collection = db["users"]
    user = users_collection.find_one({"username": form_data.username})
    
    if not user:
        user = users_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["username"],
            "is_superuser": user.get("is_superuser", False)
        }, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get('/me', response_model=UserResponse)
async def get_current_user_info(token_data = Depends(get_current_user)):
    db = get_auth_db()
    users_collection = db["users"]
    user = users_collection.find_one({"username": token_data.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse(**{k: v for k, v in user.items() if k != "password"})



