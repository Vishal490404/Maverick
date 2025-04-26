from pydantic import BaseModel, Field, EmailStr
from .types.phone_number import IndianPhoneNumberType
from typing import List, Optional
from enum import Enum


class UserPrivileges(str, Enum):
    READ = "read"
    WRITE = "write"
    ALL = "all"

class User(BaseModel):
    username: str = Field(..., description="Unique username for the user")
    email: EmailStr = Field(..., description="Email address of the user")
    password: str = Field(..., description="Password for the user account", min_length=8, max_length=40)
    full_name: str = Field(..., description="Full name of the user")
    contact_number: Optional[IndianPhoneNumberType] = Field(
        default=None,
        description="List of contact phone numbers for the user"
    )
    is_superuser: bool = Field(
        default=False,
        description="Indicates if the user has superuser privileges"
    )
    privileges: List[int] = Field(
        default=[],
        description="List of privileges assigned to the user"
    )

    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "full_name": self.full_name,
            "contact_numbers": self.contact_number,
            "is_superuser": self.is_superuser,
            "privileges": self.privileges
        }


class UserInDB(User):
    """Database representation of a user with hashed password."""
    hashed_password: str


class UserResponse(BaseModel):
    """Response model that excludes sensitive information."""
    username: str
    email: EmailStr
    full_name: str
    contact_number: Optional[IndianPhoneNumberType] = None
    is_superuser: bool
    privileges: List[int]


class UserLogin(BaseModel):
    """Login model that takes username or email and password."""
    username: str
    password: str


class UserCreate(User):
    """User creation model with password confirmation."""
    password_confirm: str = Field(..., description="Confirmation of the password")




