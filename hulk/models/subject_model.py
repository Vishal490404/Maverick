from pydantic import BaseModel, Field
from typing import Optional

class Subject(BaseModel):
    id: str = Field(..., description="Unique identifier for the subject")
    grade_id: str = Field(..., description="Identifier of the associated grade")
    school_id: str = Field(..., description="Identifier of the associated school")
    name: str = Field(..., description="Name of the subject")
    description: Optional[str] = Field(None, description="Description of the subject")


class Chapter(BaseModel):
    id: str = Field(..., description="Unique identifier for the chapter")
    subject_id: str = Field(..., description="Identifier of the associated subject")
    name: str = Field(..., description="Name of the chapter")
    description: Optional[str] = Field(None, description="Description of the chapter")


class Topic(BaseModel):
    id: str = Field(..., description="Unique identifier for the topic")
    chapter_id: str = Field(..., description="Identifier of the associated chapter")
    name: str = Field(..., description="Name of the topic")
    description: Optional[str] = Field(None, description="Description of the topic")