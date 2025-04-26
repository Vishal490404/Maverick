from pydantic import BaseModel, Field
from typing import Optional, List
from hulk.types.phone_number import IndianPhoneNumberType

# Remember to change how id's are generated in the database
# and how they are referenced in the code.
class Grade(BaseModel):
    id: str = Field(..., description="Unique identifier for the standard")
    name: str = Field(..., description="Name of the standard") # Remember to use enum
    description: Optional[str] = Field(None, description="Description of the standard")


class School(BaseModel):
    id: str = Field(..., description="Unique identifier for the school")
    name: str = Field(..., description="Name of the school")
    description: Optional[str] = Field(None, description="Description of the school")
    address: Optional[str] = Field(None, description="Address of the school")   
    contact_numbers: Optional[List[IndianPhoneNumberType]] = Field(
        default=None,
        description="List of contact phone numbers for the school"
    )
    email: Optional[str] = Field(None, description="Email address of the school")
    website: Optional[str] = Field(None, description="Website of the school")

