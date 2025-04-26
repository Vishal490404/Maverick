from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID
import random
from datetime import datetime

from security.main import get_current_user
from models.question_bank_model import DifficultyLevel, QuestionType

router = APIRouter(prefix="/papers", tags=["papers"])

# Models for the paper generation request
class TopicSelection(BaseModel):
    id: str

class ChapterSelection(BaseModel):
    id: str
    topics: List[str] = []

class PaperGenerationRequest(BaseModel):
    title: str
    total_marks: int = Field(..., gt=0, le=100)
    total_time: int = Field(..., gt=0)
    standard_id: str
    subject_id: str
    question_bank_id: str
    generation_type: str
    selected_chapters: List[ChapterSelection] = []
    selected_question_types: List[str] = []

# Models for the paper generation response
class QuestionInPaper(BaseModel):
    id: str
    question_text: str
    question_type: str
    marks: int
    difficulty_level: str
    image_required: bool = False
    images: List[str] = []
    passage_id: Optional[str] = None

class Section(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionInPaper] = []
    total_marks: int = 0

class GeneratedPaper(BaseModel):
    id: str
    title: str
    standard: str
    subject: str
    total_marks: int
    total_time: int
    creation_date: datetime = Field(default_factory=datetime.now)
    sections: List[Section] = []

# Mocked database functions (replace with actual DB queries)
async def get_questions_from_db(
    question_bank_id: str,
    standard_id: str,
    subject_id: str,
    chapters: List[ChapterSelection],
    question_types: List[str]
) -> List[Dict[str, Any]]:
    """
    Fetch questions from the database based on the selection criteria.
    This is a placeholder function - replace with actual DB queries.
    """
    # In a real implementation, this would query the database
    # For now, we'll return mock data
    
    # Simulate some questions of different types and difficulties
    mock_questions = []
    question_type_mapping = {
        "1": QuestionType.MULTIPLE_CHOICE,
        "2": QuestionType.TRUE_FALSE,
        "3": QuestionType.SHORT_ANSWER,
        "4": QuestionType.LONG_ANSWER,
        "5": QuestionType.FILL_IN_BLANK
    }
    
    difficulty_levels = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD]
    
    # Generate 50 mock questions with different types and difficulties
    for i in range(1, 51):
        question_type_id = random.choice(question_types)
        question_type_value = question_type_mapping.get(
            question_type_id, 
            random.choice(list(QuestionType))
        )
        
        mock_questions.append({
            "id": f"q-{i}",
            "question_text": f"This is a sample question #{i} in LaTeX format. What is $x + {i}$ if $x = {i+5}$?",
            "question_type": question_type_value,
            "difficulty_level": random.choice(difficulty_levels),
            "marks": random.choice([1, 2, 3, 5, 10]),
            "image_required": random.choice([True, False]),
            "chapter_id": random.choice([c.id for c in chapters]) if chapters else "ch-1"
        })
    
    return mock_questions

async def get_standard_name(standard_id: str) -> str:
    """Get standard name from ID - placeholder function"""
    # Replace with actual DB lookup
    standards = {
        "std-1": "Class 10",
        "std-2": "Class 11",
        "std-3": "Class 12"
    }
    return standards.get(standard_id, "Unknown Standard")

async def get_subject_name(subject_id: str) -> str:
    """Get subject name from ID - placeholder function"""
    # Replace with actual DB lookup
    subjects = {
        "sub-1": "Mathematics",
        "sub-2": "Physics",
        "sub-3": "Chemistry",
        "sub-4": "Biology"
    }
    return subjects.get(subject_id, "Unknown Subject")

def generate_balanced_paper(
    questions: List[Dict[str, Any]],
    total_marks: int,
    selected_question_types: List[str]
) -> List[Section]:
    """
    Generate a balanced question paper based on difficulty levels and question types.
    Returns sections organized by question types with questions balanced by difficulty.
    """
    # Group questions by type
    questions_by_type = {}
    for q in questions:
        q_type = q["question_type"].value
        if q_type not in questions_by_type:
            questions_by_type[q_type] = []
        questions_by_type[q_type].append(q)
    
    # For each question type, balance by difficulty
    # Easy: 30%, Medium: 50%, Hard: 20%
    sections = []
    remaining_marks = total_marks
    section_number = 1
    
    for q_type, type_questions in questions_by_type.items():
        # Skip if no questions of this type or type not selected
        if not type_questions:
            continue
            
        # Allocate marks for this section (roughly proportional)
        section_marks = min(
            remaining_marks,
            max(
                int(total_marks * len(type_questions) / len(questions) * 1.5),
                min(10, remaining_marks)  # At least 10 marks per section if possible
            )
        )
        
        if section_marks <= 0:
            continue
        
        # Sort by difficulty and marks
        easy = [q for q in type_questions if q["difficulty_level"] == DifficultyLevel.EASY]
        medium = [q for q in type_questions if q["difficulty_level"] == DifficultyLevel.MEDIUM]
        hard = [q for q in type_questions if q["difficulty_level"] == DifficultyLevel.HARD]
        
        # Calculate target marks for each difficulty
        easy_target = int(section_marks * 0.3)
        medium_target = int(section_marks * 0.5)
        hard_target = section_marks - easy_target - medium_target
        
        # Helper function to select questions to meet a target mark count
        def select_questions_for_marks(questions_list, target_marks):
            selected = []
            current_marks = 0
            
            # Sort by marks to optimize selection
            questions_list.sort(key=lambda q: q["marks"])
            
            # First pass: try to find exact matches
            for q in questions_list[:]:
                if current_marks + q["marks"] <= target_marks:
                    selected.append(q)
                    questions_list.remove(q)
                    current_marks += q["marks"]
                    
                    if current_marks == target_marks:
                        return selected
            
            # Second pass: get as close as possible
            for q in questions_list[:]:
                if current_marks + q["marks"] <= target_marks:
                    selected.append(q)
                    questions_list.remove(q)
                    current_marks += q["marks"]
            
            return selected
        
        # Select questions for each difficulty level
        selected_easy = select_questions_for_marks(easy, easy_target)
        selected_medium = select_questions_for_marks(medium, medium_target)
        selected_hard = select_questions_for_marks(hard, hard_target)
        
        # Combine all selected questions
        selected_questions = selected_easy + selected_medium + selected_hard
        
        # Calculate actual marks for this section
        actual_marks = sum(q["marks"] for q in selected_questions)
        
        # Create a section with these questions
        if selected_questions:
            # Format questions for the response
            formatted_questions = [
                QuestionInPaper(
                    id=q["id"],
                    question_text=q["question_text"],
                    question_type=q["question_type"].value,
                    marks=q["marks"],
                    difficulty_level=q["difficulty_level"].value,
                    image_required=q["image_required"]
                )
                for q in selected_questions
            ]
            
            # Determine section title based on question type
            section_titles = {
                QuestionType.MULTIPLE_CHOICE.value: "Multiple Choice Questions",
                QuestionType.TRUE_FALSE.value: "True/False Questions",
                QuestionType.SHORT_ANSWER.value: "Short Answer Questions",
                QuestionType.LONG_ANSWER.value: "Long Answer Questions",
                QuestionType.FILL_IN_BLANK.value: "Fill in the Blanks"
            }
            
            section_title = section_titles.get(q_type, f"Section {section_number}")
            
            # Add section to paper
            sections.append(Section(
                title=section_title,
                description=f"Answer all questions in this section. Total marks: {actual_marks}",
                questions=formatted_questions,
                total_marks=actual_marks
            ))
            
            # Update remaining marks and section counter
            remaining_marks -= actual_marks
            section_number += 1
    
    return sections

@router.post("/generate", response_model=GeneratedPaper)
async def generate_paper(
    paper_request: PaperGenerationRequest,
    current_user = Depends(get_current_user)
):
    """
    Generate a balanced question paper based on the provided parameters.
    """
    try:
        # Fetch questions from the database based on the request parameters
        questions = await get_questions_from_db(
            paper_request.question_bank_id,
            paper_request.standard_id,
            paper_request.subject_id,
            paper_request.selected_chapters,
            paper_request.selected_question_types
        )
        
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found matching the selected criteria"
            )
        
        # Get standard and subject names
        standard_name = await get_standard_name(paper_request.standard_id)
        subject_name = await get_subject_name(paper_request.subject_id)
        
        # Generate balanced paper
        sections = generate_balanced_paper(
            questions,
            paper_request.total_marks,
            paper_request.selected_question_types
        )
        
        # Check if we have enough questions to meet the marks requirement
        total_allocated_marks = sum(section.total_marks for section in sections)
        if total_allocated_marks < paper_request.total_marks * 0.8:  # At least 80% of requested marks
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough questions to generate a paper with {paper_request.total_marks} marks. Only able to allocate {total_allocated_marks} marks."
            )
        
        # Create and return the paper
        paper = GeneratedPaper(
            id=f"paper-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title=paper_request.title,
            standard=standard_name,
            subject=subject_name,
            total_marks=total_allocated_marks,
            total_time=paper_request.total_time,
            sections=sections
        )
        
        # In a real implementation, you would save the paper to the database here
        
        return paper
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error generating paper: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate paper: {str(e)}"
        )

