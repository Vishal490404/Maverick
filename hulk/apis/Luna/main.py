from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from pymongo import MongoClient
import os
from models.user_model import User
from security.main import get_current_user
from models.question_bank_model import Question
from apis.Harry.db_init import get_curriculum_db

# Setup router
router = APIRouter(tags=["question_banks"])

def get_db():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), uuidRepresentation="standard")
    return client[os.getenv("MONOGO_QUESTION_BANK_DB")]

# Models
class QuestionBankBase(BaseModel):
    description: Optional[str] = Field(None, description="Description of the question bank")
    standard_id: str = Field(..., description="ID of the standard/grade this question bank belongs to")
    subject_id: str = Field(..., description="ID of the subject this question bank belongs to")

class QuestionBankCreate(QuestionBankBase):
    pass

class QuestionBankUpdate(BaseModel):
    description: Optional[str] = Field(None, description="Updated description of the question bank")

class QuestionBankInDB(QuestionBankBase):
    id: str = Field(..., description="Unique identifier for the question bank")
    name: str = Field(..., description="Name of the question bank (auto-generated from standard and subject)")
    question_ids: List[str] = Field(default_factory=list, description="List of question IDs in this bank")
    created_at: datetime = Field(..., description="Timestamp when the question bank was created")
    updated_at: datetime = Field(..., description="Timestamp when the question bank was last updated")
    created_by: str = Field(..., description="User ID who created this question bank")

class QuestionBankResponse(QuestionBankInDB):
    question_count: int = Field(..., description="Number of questions in this bank")
    standard_name: Optional[str] = None
    subject_name: Optional[str] = None

# CRUD Operations
@router.post("/question-banks", response_model=QuestionBankResponse, status_code=status.HTTP_201_CREATED)
async def create_question_bank(
    question_bank: QuestionBankCreate, 
    current_user: User = Depends(get_current_user)
):
    """Create a new question bank"""
    db = get_db()
    
    # Check if standard exists
    curriculum_db = get_curriculum_db()
    standard = curriculum_db.standards.find_one({"id": question_bank.standard_id})
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    # Check if subject exists
    subject = curriculum_db.subjects.find_one({
        "id": question_bank.subject_id,
        "standard_id": question_bank.standard_id
    })
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found for this standard"
        )
    
    # Generate name for the question bank
    name = f"{standard.get('name', 'Unknown Standard')} - {subject.get('name', 'Unknown Subject')}"
    
    # Check if a question bank with the same name exists for this standard and subject
    existing_bank = db.question_banks.find_one({
        "name": name,
        "standard_id": question_bank.standard_id,
        "subject_id": question_bank.subject_id
    })
    
    if existing_bank:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A question bank with this name already exists for this standard and subject"
        )
    
    # Create the question bank
    new_bank = {
        "id": str(uuid4()),
        "name": name,
        "description": question_bank.description,
        "standard_id": question_bank.standard_id,
        "subject_id": question_bank.subject_id,
        "question_ids": [],
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "created_by": current_user.id
    }
    
    db.question_banks.insert_one(new_bank)
    
    # Add names for the response
    new_bank["question_count"] = 0
    new_bank["standard_name"] = standard.get("name", "Unknown Standard")
    new_bank["subject_name"] = subject.get("name", "Unknown Subject")
    
    return new_bank

@router.get("/question-banks", response_model=List[QuestionBankResponse])
async def get_question_banks(
    standard_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all question banks, optionally filtered by standard and/or subject"""
    db = get_db()
    curriculum_db = get_curriculum_db()
    
    # Build filter
    filter_query = {}
    if standard_id:
        filter_query["standard_id"] = standard_id
    if subject_id:
        filter_query["subject_id"] = subject_id
    
    # Get question banks
    banks = list(db.question_banks.find(filter_query))
    
    # Enhance with standard and subject names and question counts
    for bank in banks:
        bank["question_count"] = len(bank.get("question_ids", []))
        
        # Get standard name
        standard = curriculum_db.standards.find_one({"id": bank["standard_id"]})
        bank["standard_name"] = standard.get("name") if standard else "Unknown Standard"
        
        # Get subject name
        subject = curriculum_db.subjects.find_one({"id": bank["subject_id"]})
        bank["subject_name"] = subject.get("name") if subject else "Unknown Subject"
    
    return banks

@router.get("/question-banks/{bank_id}", response_model=QuestionBankResponse)
async def get_question_bank(
    bank_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific question bank by ID"""
    db = get_db()
    
    bank = db.question_banks.find_one({"id": bank_id})
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question bank not found"
        )
    
    # Get standard and subject names
    curriculum_db = get_curriculum_db()
    
    standard = curriculum_db.standards.find_one({"id": bank["standard_id"]})
    bank["standard_name"] = standard.get("name") if standard else "Unknown Standard"
    
    subject = curriculum_db.subjects.find_one({"id": bank["subject_id"]})
    bank["subject_name"] = subject.get("name") if subject else "Unknown Subject"
    
    bank["question_count"] = len(bank.get("question_ids", []))
    
    return bank

@router.put("/question-banks/{bank_id}", response_model=QuestionBankResponse)
async def update_question_bank(
    bank_id: str,
    update_data: QuestionBankUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a question bank"""
    db = get_db()
    
    # Check if the bank exists
    bank = db.question_banks.find_one({"id": bank_id})
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question bank not found"
        )
    
    # Build update data
    update_fields = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if not update_fields:
        # No fields to update
        return await get_question_bank(bank_id, current_user)
    
    # Update the bank
    update_fields["updated_at"] = datetime.now()
    
    db.question_banks.update_one(
        {"id": bank_id},
        {"$set": update_fields}
    )
    
    return await get_question_bank(bank_id, current_user)

@router.delete("/question-banks/{bank_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_bank(
    bank_id: str,
    cascade: bool = True,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a question bank
    
    If cascade=True (default), all questions in the bank will be deleted including their images.
    """
    db = get_db()
    questions_db = get_db()
    
    # Check if the bank exists
    bank = db.question_banks.find_one({"id": bank_id})
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question bank not found"
        )
    
    # If cascade is true, delete all questions and their related resources
    if cascade and bank.get("question_ids"):
        # Get all question IDs
        question_ids = bank.get("question_ids", [])
        
        for q_id in question_ids:
            # Get the question to find related resources
            question = questions_db.questions.find_one({"id": q_id})
            if question:
                # Delete any images associated with the question
                if question.get("images"):
                    for image_id in question.get("images"):
                        questions_db.images.delete_one({"id": image_id})
                
                # Delete the question itself
                questions_db.questions.delete_one({"id": q_id})
    
    # Delete the question bank
    db.question_banks.delete_one({"id": bank_id})
    
    return None

@router.post("/question-banks/{bank_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_question_to_bank(
    bank_id: str,
    question_id: str,
    current_user: User = Depends(get_current_user)
):
    """Add a question to a question bank"""
    db = get_db()
    questions_db = get_db()
    
    # Check if the bank exists
    bank = db.question_banks.find_one({"id": bank_id})
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question bank not found"
        )
    
    # Check if the question exists
    question = questions_db.questions.find_one({"id": question_id})
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if the question is already in the bank
    if question_id in bank.get("question_ids", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is already in this bank"
        )
    
    # Add question to bank
    db.question_banks.update_one(
        {"id": bank_id},
        {
            "$push": {"question_ids": question_id},
            "$set": {"updated_at": datetime.now()}
        }
    )
    
    return None

@router.delete("/question-banks/{bank_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_question_from_bank(
    bank_id: str,
    question_id: str,
    delete_question: bool = False,
    current_user: User = Depends(get_current_user)
):
    """
    Remove a question from a question bank
    
    If delete_question=True, the question will be completely deleted, not just removed from the bank
    """
    db = get_db()
    questions_db = get_db()
    
    # Check if the bank exists
    bank = db.question_banks.find_one({"id": bank_id})
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question bank not found"
        )
    
    # Check if the question is in the bank
    if question_id not in bank.get("question_ids", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is not in this bank"
        )
    
    # Remove question from bank
    db.question_banks.update_one(
        {"id": bank_id},
        {
            "$pull": {"question_ids": question_id},
            "$set": {"updated_at": datetime.now()}
        }
    )
    
    # If delete_question is true, also delete the question itself
    if delete_question:
        # Get the question to find related resources
        question = questions_db.questions.find_one({"id": question_id})
        if question:
            # Delete any images associated with the question
            if question.get("images"):
                for image_id in question.get("images"):
                    questions_db.images.delete_one({"id": image_id})
            
            # Delete the question itself
            questions_db.questions.delete_one({"id": question_id})
    
    return None

@router.get("/question-banks/{bank_id}/questions", response_model=List[Question])
async def get_questions_in_bank(
    bank_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all questions in a specific question bank"""
    db = get_db()
    questions_db = get_db()
    
    # Check if the bank exists
    bank = db.question_banks.find_one({"id": bank_id})
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question bank not found"
        )
    
    # Get questions
    questions = []
    for q_id in bank.get("question_ids", []):
        question = questions_db.questions.find_one({"id": q_id})
        if question:
            questions.append(question)
    
    return questions