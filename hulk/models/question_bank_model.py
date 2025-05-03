from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    FILL_IN_BLANK = "fill_in_blank"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# questions will be in latex language
class Question(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique identifier for the question")
    question_text: str = Field(..., description="The text of the question maybe in latex format and multilingual")
    question_type_id: QuestionType = Field(..., description="Type of the question")
    image_required: bool = Field(..., description="Indicates if the question requires an image/diagram to be understood")
    images: Optional[List[UUID]] = Field(None, description="List of image identifiers associated with the question")
    difficulty_level: DifficultyLevel = Field(..., description="Difficulty level of the question")
    marks: int = Field(..., description="Marks assigned to the question", example=1, gt=0, le=100)
    passage_id: Optional[UUID] = Field(None, description="Reference to the associated passage")
    created_at: datetime = Field(default_factory=datetime.now, description="Timestamp when the question was created")
    updated_at: datetime = Field(default_factory=datetime.now, description="Timestamp when the question was last updated")
    created_by: str = Field(..., description="Identifier of the user who created the question")
    updated_by: Optional[str] = Field(None, description="Identifier of the user who last updated the question")
    tags: Optional[List[str]] = Field(None, description="List of tags associated with the question")
    options: Optional[List[str]] = Field(None, description="List of options for multiple choice questions")


class QuestionImage(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique identifier for the image")
    question_id: UUID = Field(..., description="Reference to the associated question")
    image_url: str = Field(..., description="URL or path of the stored image")
    uploaded_at: datetime = Field(default_factory=datetime.now, description="When the image was uploaded")


class Passage(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique identifier for the passage")
    passage_text: str = Field(..., description="The text of the passage maybe in latex format and multilingual")
    images: Optional[List[UUID]] = Field(None, description="List of image identifiers associated with the passage")


class UploadType(str, Enum):
    PDF = "pdf"
    EXCEL = "excel"
    IMAGE = "image"
    MANUAL = "manual"


class QuestionBankUpload(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique identifier for the upload")
    upload_type: UploadType = Field(..., description="Type of upload (PDF, Excel, Image, Manual)")
    file_path: Optional[str] = Field(None, description="Path to the uploaded file if applicable")
    processing_status: str = Field(default="pending", description="Status of the processing (pending, processing, completed, failed)")
    questions_extracted: int = Field(default=0, description="Number of questions extracted from the upload")
    passages_extracted: int = Field(default=0, description="Number of passages extracted from the upload")
    created_at: datetime = Field(default_factory=datetime.now, description="Timestamp when the upload was created")
    created_by: str = Field(..., description="Identifier of the user who uploaded the file")
    error_message: Optional[str] = Field(None, description="Error message if processing failed")


