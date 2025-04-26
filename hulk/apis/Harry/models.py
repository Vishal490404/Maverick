from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from uuid import UUID

# Keep the enum for backward compatibility but will primarily use database values
class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# ----- STANDARD (GRADE) MODELS -----

class StandardCreate(BaseModel):
    name: int = Field(..., description="Number of the standard/grade", example="10")
    description: Optional[str] = Field(None, description="Description of the standard")

class StandardUpdate(BaseModel):
    name: int = Field(None, description="Number of the standard/grade")
    description: Optional[str] = Field(None, description="Description of the standard")

class StandardResponse(BaseModel):
    id: str
    name: int
    description: Optional[str] = None
    created_at: datetime
    created_by: str
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ----- SUBJECT MODELS -----

class SubjectCreate(BaseModel):
    name: str = Field(..., description="Name of the subject", example="Mathematics")
    description: Optional[str] = Field(None, description="Description of the subject")

class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the subject")
    description: Optional[str] = Field(None, description="Description of the subject")

class SubjectResponse(BaseModel):
    id: str
    name: str
    standard_id: str
    description: Optional[str] = None
    created_at: datetime
    created_by: str
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ----- CHAPTER MODELS -----

class ChapterCreate(BaseModel):
    name: str = Field(..., description="Name of the chapter", example="Algebra")
    description: Optional[str] = Field(None, description="Description of the chapter")

class ChapterUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the chapter")
    description: Optional[str] = Field(None, description="Description of the chapter")

class ChapterResponse(BaseModel):
    id: str
    name: str
    subject_id: str
    description: Optional[str] = None
    created_at: datetime
    created_by: str
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ----- TOPIC MODELS -----

class TopicCreate(BaseModel):
    name: str = Field(..., description="Name of the topic", example="Linear Equations")
    description: Optional[str] = Field(None, description="Description of the topic")

class TopicUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the topic")
    description: Optional[str] = Field(None, description="Description of the topic")

class TopicResponse(BaseModel):
    id: str
    name: str
    chapter_id: str
    description: Optional[str] = None
    created_at: datetime
    created_by: str
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ----- TAG MODELS -----

class TagCreate(BaseModel):
    name: str = Field(..., description="Name of the tag", example="Calculus")
    color: Optional[str] = Field("#3498db", description="Color code for the tag (hex format)", example="#3498db")
    description: Optional[str] = Field(None, description="Description of the tag")

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the tag")
    color: Optional[str] = Field(None, description="Color code for the tag (hex format)")
    description: Optional[str] = Field(None, description="Description of the tag")

class TagResponse(BaseModel):
    id: str
    name: str
    color: str
    description: Optional[str] = None
    usage_count: int = 0
    created_at: datetime
    created_by: str
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ----- QUESTION TYPE MODELS -----

class QuestionTypeCreate(BaseModel):
    name: str = Field(..., description="Name of the question type", example="Multiple Choice")
    description: Optional[str] = Field(None, description="Description of the question type")

class QuestionTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the question type")
    description: Optional[str] = Field(None, description="Description of the question type")

class QuestionTypeResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    created_by: str
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ----- QUESTION MODELS -----

class QuestionCreate(BaseModel):
    question_text: str = Field(..., description="The text of the question (can be in LaTeX format)")
    question_type_id: str = Field(..., description="ID of the question type")
    difficulty_level: DifficultyLevel = Field(..., description="Difficulty level of the question")
    marks: int = Field(..., gt=0, le=100, description="Marks assigned to the question", example=5)
    image_required: bool = Field(..., description="Indicates if the question requires an image/diagram")
    passage_id: Optional[str] = Field(None, description="ID of the passage associated with the question")
    correct_answer: Optional[str] = Field(None, description="The correct answer to the question")
    tags: Optional[List[str]] = Field(None, description="List of tags associated with the question")

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(None, description="The text of the question (can be in LaTeX format)")
    question_type_id: Optional[str] = Field(None, description="ID of the question type") 
    difficulty_level: Optional[DifficultyLevel] = Field(None, description="Difficulty level of the question")
    marks: Optional[int] = Field(None, gt=0, le=100, description="Marks assigned to the question")
    image_required: Optional[bool] = Field(None, description="Indicates if the question requires an image/diagram")
    images: Optional[List[UUID]] = Field(None, description="List of image identifiers associated with the question")
    options: Optional[List[str]] = Field(None, description="List of options for multiple choice/true-false questions")
    correct_answer: Optional[str] = Field(None, description="The correct answer to the question")
    tags: Optional[List[str]] = Field(None, description="List of tags associated with the question")

class QuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type_id: str
    question_type_name: str
    difficulty_level: str
    marks: int
    image_required: bool
    images: Optional[List[UUID]] = None
    topic_id: str
    chapter_id: str
    subject_id: str
    standard_id: str
    tags: Optional[List[str]] = None
    created_at: datetime
    created_by: str
    updated_at: datetime
    updated_by: str