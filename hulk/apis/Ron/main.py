from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Dict, Optional, Union, Set
from pydantic import BaseModel, Field, field_validator
from uuid import uuid4
from datetime import datetime
from pymongo import MongoClient
import os
import random
from models.user_model import User
from security.main import get_current_user
from apis.Harry.db_init import get_curriculum_db
from apis.Hermione.main import get_question_db

router = APIRouter(prefix="/papers", tags=["papers"])


class TopicSelection(BaseModel):
    id: str = Field(..., description="Topic ID")
    weight: Optional[float] = Field(1.0, description="Weight for this topic (higher values increase question selection probability)")

class ChapterSelection(BaseModel):
    id: str = Field(..., description="Chapter ID")
    topics: Optional[List[TopicSelection]] = Field(None, description="Selected topics within this chapter")
    weight: Optional[float] = Field(1.0, description="Weight for this chapter (higher values increase question selection probability)")

class QuestionTypeDistribution(BaseModel):
    question_type_id: str = Field(..., description="Question type ID")
    marks_percentage: float = Field(..., ge=0, le=100, description="Percentage of total marks for this question type")
    
    @field_validator("marks_percentage")
    def validate_percentage(cls, value):
        if value < 0 or value > 100:
            raise ValueError("Percentage must be between 0 and 100")
        return value

class PaperGenerationRequest(BaseModel):
    title: str = Field(..., description="Title of the paper")
    question_bank_ids: List[str] = Field(..., description="List of question bank IDs to use for generation")
    total_marks: int = Field(..., gt=0, le=500, description="Total marks for the paper")
    selected_chapters: Optional[List[ChapterSelection]] = Field(None, description="Chapters to include in the paper")
    question_type_distribution: Optional[List[QuestionTypeDistribution]] = Field(None, description="Distribution of question types by marks percentage")
    difficulty_distribution: Optional[Dict[str, float]] = Field(None, description="Distribution of difficulty levels (e.g. {'easy': 30, 'medium': 50, 'hard': 20})")

class QuestionPaperItem(BaseModel):
    question_id: str = Field(..., description="ID of the question")
    question_text: str = Field(..., description="Text of the question")
    question_type_name: str = Field(..., description="Name of the question type")
    marks: int = Field(..., description="Marks assigned to this question")
    difficulty_level: str = Field(..., description="Difficulty level of the question")
    image_required: bool = Field(..., description="Whether the question requires an image")
    images: Optional[List[str]] = Field(None, description="List of image URLs for the question")
    topic_name: str = Field(..., description="Name of the topic")
    chapter_name: str = Field(..., description="Name of the chapter")

class Section(BaseModel):
    title: str = Field(..., description="Title of the section")
    description: Optional[str] = Field(None, description="Description of the section")
    questions: List[QuestionPaperItem] = Field(..., description="Questions in this section")
    total_marks: int = Field(..., description="Total marks for this section")

class GeneratedPaper(BaseModel):
    id: str = Field(..., description="Unique ID of the generated paper")
    title: str = Field(..., description="Title of the paper")
    standard_name: str = Field(..., description="Name of the standard/grade")
    subject_name: str = Field(..., description="Name of the subject")
    total_marks: int = Field(..., description="Total marks for the paper")
    sections: List[Section] = Field(..., description="Sections of the paper")
    created_at: datetime = Field(..., description="Timestamp when the paper was created")
    created_by: str = Field(..., description="User who created the paper")

# ----- HELPER FUNCTIONS -----

def get_db():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), uuidRepresentation="standard")
    return client[os.getenv("MONOGO_QUESTION_BANK_DB")]

# ----- ROUTES -----

@router.post("/generate", response_model=GeneratedPaper, status_code=status.HTTP_201_CREATED)
async def generate_paper(
    paper_request: PaperGenerationRequest = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a question paper based on specified parameters and question banks.
    
    The paper will be created using questions from the selected question banks,
    following the specified distribution of marks across question types,
    difficulty levels, and topics.
    """
    question_db = get_question_db()
    curriculum_db = get_curriculum_db()
    papers_db = get_db()
    
    # Validate question banks
    question_bank_ids = paper_request.question_bank_ids
    valid_banks = []
    all_question_ids = set()
    
    # We'll extract standard and subject from the first question bank
    standard_id = None
    subject_id = None
    standard_name = None
    subject_name = None
    
    for bank_id in question_bank_ids:
        bank = papers_db.question_banks.find_one({"id": bank_id})
        if not bank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question bank with ID {bank_id} not found"
            )
            
        # Set standard and subject from the first bank
        if standard_id is None:
            standard_id = bank.get("standard_id")
            subject_id = bank.get("subject_id")
            
            # Get standard and subject names
            standard = curriculum_db.standards.find_one({"id": standard_id})
            if not standard:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Standard not found"
                )
            standard_name = standard.get("name", "Unknown Standard")
            
            subject = curriculum_db.subjects.find_one({
                "id": subject_id,
                "standard_id": standard_id
            })
            if not subject:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Subject not found for this standard"
                )
            subject_name = subject.get("name", "Unknown Subject")
        
        # Check if all banks belong to the same standard and subject
        if bank.get("standard_id") != standard_id or bank.get("subject_id") != subject_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question bank {bank.get('name')} belongs to a different standard/subject than other selected banks"
            )
            
        valid_banks.append(bank)
        all_question_ids.update(bank.get("question_ids", []))
    
    if not valid_banks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid question banks found"
        )
        
    if not all_question_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected question banks contain no questions"
        )
    
    # Fetch all questions from the selected banks
    all_questions = list(question_db.questions.find({"id": {"$in": list(all_question_ids)}}))
    
    if not all_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No questions found in the selected question banks"
        )
    
    # Check for question type distribution and validate
    if paper_request.question_type_distribution:
        total_percentage = sum(qt.marks_percentage for qt in paper_request.question_type_distribution)
        if abs(total_percentage - 100) > 0.01:  # Allow for small floating point errors
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question type distribution percentages must sum to 100% (got {total_percentage}%)"
            )
            
        # Validate question type IDs
        for qt in paper_request.question_type_distribution:
            question_type = curriculum_db.question_types.find_one({"id": qt.question_type_id})
            if not question_type:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Question type with ID {qt.question_type_id} not found"
                )
            
        
    filtered_questions = all_questions
    selected_topic_ids = set()
    selected_chapter_ids = set()
    
    if paper_request.selected_chapters:
        selected_chapter_ids = {ch.id for ch in paper_request.selected_chapters}
        
        # Validate chapter IDs
        for ch_id in selected_chapter_ids:
            chapter = curriculum_db.chapters.find_one({
                "id": ch_id, 
                "subject_id": subject_id
            })
            if not chapter:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Chapter with ID {ch_id} not found in this subject"
                )
        
        # Collect all selected topic IDs
        for chapter in paper_request.selected_chapters:
            if chapter.topics:
                for topic in chapter.topics:
                    # Validate topic ID
                    db_topic = curriculum_db.topics.find_one({
                        "id": topic.id,
                        "chapter_id": chapter.id
                    })
                    if not db_topic:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Topic with ID {topic.id} not found in chapter {chapter.id}"
                        )
                    selected_topic_ids.add(topic.id)
            
        # If chapters are selected but no specific topics, include all topics from those chapters
        if not selected_topic_ids:
            topics_in_chapters = curriculum_db.topics.find({"chapter_id": {"$in": list(selected_chapter_ids)}})
            selected_topic_ids = {topic["id"] for topic in topics_in_chapters}
            
        # Filter questions by selected topics
        if selected_topic_ids:
            filtered_questions = [q for q in filtered_questions if q.get("topic_id") in selected_topic_ids]
    
    if not filtered_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No questions found matching the selected chapters and topics"
        )
    
    # Group questions by question type
    question_types_map = {}
    for question in filtered_questions:
        q_type_id = question.get("question_type_id")
        if q_type_id not in question_types_map:
            question_types_map[q_type_id] = []
        question_types_map[q_type_id].append(question)
    
    # Create distribution if not provided
    if not paper_request.question_type_distribution:
        # Create even distribution across available question types
        question_types = curriculum_db.question_types.find({})
        available_types = [qt for qt in question_types if qt["id"] in question_types_map]
        
        if not available_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid question types found in the selected questions"
            )
            
        equal_percentage = 100.0 / len(available_types)
        paper_request.question_type_distribution = [
            QuestionTypeDistribution(
                question_type_id=qt["id"],
                marks_percentage=equal_percentage
            ) for qt in available_types
        ]
    
    # Create difficulty distribution if not provided
    if not paper_request.difficulty_distribution:
        paper_request.difficulty_distribution = {
            "easy": 30.0,
            "medium": 50.0,
            "hard": 20.0
        }
    
    # Calculate marks distribution
    marks_by_type = {}
    for qt in paper_request.question_type_distribution:
        marks_by_type[qt.question_type_id] = int(paper_request.total_marks * qt.marks_percentage / 100)
    
    # Adjust for rounding errors
    total_allocated = sum(marks_by_type.values())
    if total_allocated != paper_request.total_marks:
        # Add or subtract the difference from the type with the most marks
        max_type = max(marks_by_type.items(), key=lambda x: x[1])[0]
        marks_by_type[max_type] += (paper_request.total_marks - total_allocated)
    
    # Generate the paper
    paper_sections = []
    total_paper_marks = 0
    question_type_names = {qt["id"]: qt["name"] for qt in curriculum_db.question_types.find()}
    
    # Prepare lookup maps for topic and chapter names
    topic_names = {}
    chapter_names = {}
    
    for topic in curriculum_db.topics.find({}):
        topic_names[topic["id"]] = topic.get("name", "Unknown Topic")
        
    for chapter in curriculum_db.chapters.find({}):
        chapter_names[chapter["id"]] = chapter.get("name", "Unknown Chapter")
    
    # Create sections by question type
    for question_type_id, total_marks in marks_by_type.items():
        if question_type_id not in question_types_map or not question_types_map[question_type_id]:
            continue
            
        available_questions = question_types_map[question_type_id]
        
        # Sort questions by difficulty level
        easy_questions = [q for q in available_questions if q.get("difficulty_level", "").lower() == "easy"]
        medium_questions = [q for q in available_questions if q.get("difficulty_level", "").lower() == "medium"]
        hard_questions = [q for q in available_questions if q.get("difficulty_level", "").lower() == "hard"]
        
        # Calculate marks for each difficulty level
        easy_marks = int(total_marks * paper_request.difficulty_distribution.get("easy", 30) / 100)
        medium_marks = int(total_marks * paper_request.difficulty_distribution.get("medium", 50) / 100)
        hard_marks = total_marks - (easy_marks + medium_marks)  # Ensure we exactly hit the total
        
        section_questions = []
        section_marks = 0
        
        # Helper function to select questions while respecting topic diversity
        def select_questions(questions, target_marks):
            if not questions:
                return [], 0
                
            # Group questions by topic for diversity
            questions_by_topic = {}
            for q in questions:
                topic_id = q.get("topic_id")
                if topic_id not in questions_by_topic:
                    questions_by_topic[topic_id] = []
                questions_by_topic[topic_id].append(q)
            
            # Apply topic weights if specified in the request
            topic_weights = {}
            if paper_request.selected_chapters:
                for chapter in paper_request.selected_chapters:
                    if chapter.topics:
                        for topic in chapter.topics:
                            topic_weights[topic.id] = topic.weight
            
            # Adjust weights for each topic's questions
            weighted_topics = {}
            for topic_id, qs in questions_by_topic.items():
                # Default weight is 1.0, use specified weight if available
                weight = topic_weights.get(topic_id, 1.0)
                weighted_topics[topic_id] = (qs, weight)
            
            # Prepare weighted selection using the weights
            topic_ids = list(weighted_topics.keys())
            if not topic_ids:
                return [], 0
                
            # Normalize weights for selection
            weights = [weighted_topics[tid][1] for tid in topic_ids]
            total_weight = sum(weights)
            if total_weight > 0:
                normalized_weights = [w/total_weight for w in weights]
            else:
                normalized_weights = [1.0/len(weights)] * len(weights)
            
            # Shuffle questions within each topic
            for topic_id in topic_ids:
                random.shuffle(weighted_topics[topic_id][0])
            
            selected = []
            current_marks = 0
            
            # Keep selecting until we meet or exceed the target marks
            while current_marks < target_marks:
                # Select a topic based on weights
                try:
                    topic_index = random.choices(range(len(topic_ids)), weights=normalized_weights, k=1)[0]
                except IndexError:
                    # If weighted selection fails (e.g., all weights are 0), use uniform selection
                    if topic_ids:
                        topic_index = random.randint(0, len(topic_ids)-1)
                    else:
                        break
                
                current_topic = topic_ids[topic_index]
                questions_for_topic = weighted_topics[current_topic][0]
                
                if not questions_for_topic:
                    # Remove this topic from consideration
                    topic_ids.pop(topic_index)
                    normalized_weights.pop(topic_index)
                    if not topic_ids:
                        break
                    continue
                
                # Get the next question from this topic
                question = questions_for_topic.pop(0)
                q_marks = question.get("marks", 0)
                
                # If this question would exceed the target by too much, look for a better fit
                # but be more flexible as we get closer to the target
                max_exceed = max(5, target_marks * 0.1)  # Allow 10% or 5 marks overage, whichever is greater
                
                if current_marks + q_marks > target_marks + max_exceed:
                    # Try to find a question with fewer marks from any topic
                    smaller_question_found = False
                    for t_id in topic_ids:
                        t_questions = weighted_topics[t_id][0]
                        for i, q in enumerate(t_questions):
                            if q.get("marks", 0) <= target_marks - current_marks:
                                smaller_question_found = True
                                selected.append(t_questions.pop(i))
                                current_marks += q.get("marks", 0)
                                break
                        if smaller_question_found:
                            break
                    
                    if not smaller_question_found:
                        # If we couldn't find a smaller question, use this one anyway if we're below target
                        if current_marks < target_marks:
                            selected.append(question)
                            current_marks += q_marks
                    
                    # Return if we're close enough to target
                    if current_marks >= target_marks * 0.9:
                        break
                else:
                    # Add this question
                    selected.append(question)
                    current_marks += q_marks
                    
                    # If we're at or above target, we can stop
                    if current_marks >= target_marks:
                        break
                
                # If this topic has no questions left, remove it
                if not questions_for_topic:
                    topic_ids.pop(topic_index)
                    normalized_weights.pop(topic_index)
                    if not topic_ids:
                        break
            
            return selected, current_marks
        
        # Select questions for each difficulty level
        easy_selected, easy_actual = select_questions(easy_questions, easy_marks)
        medium_selected, medium_actual = select_questions(medium_questions, medium_marks)
        hard_selected, hard_actual = select_questions(hard_questions, hard_marks)
        
        # Combine all selected questions
        all_selected = easy_selected + medium_selected + hard_selected
        random.shuffle(all_selected)  # Mix difficulties within the section
        
        # Create question paper items
        for question in all_selected:
            section_marks += question.get("marks", 0)
            
            # Get topic and chapter names
            topic_name = topic_names.get(question.get("topic_id"), "Unknown Topic")
            chapter_name = chapter_names.get(question.get("chapter_id"), "Unknown Chapter")
            
            question_item = QuestionPaperItem(
                question_id=question.get("id"),
                question_text=question.get("question_text", ""),
                question_type_name=question_type_names.get(question.get("question_type_id"), "Unknown Type"),
                marks=question.get("marks", 0),
                difficulty_level=question.get("difficulty_level", "medium"),
                image_required=question.get("image_required", False),
                images=[str(img) for img in question.get("images", [])],
                topic_name=topic_name,
                chapter_name=chapter_name
            )
            section_questions.append(question_item)
        
        # Only create a section if we have questions
        if section_questions:
            section = Section(
                title=question_type_names.get(question_type_id, "Unknown Type"),
                description=f"{section_marks} marks",
                questions=section_questions,
                total_marks=section_marks
            )
            paper_sections.append(section)
            total_paper_marks += section_marks
    
    if not paper_sections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not generate paper - insufficient questions matching criteria"
        )
    
    # Create the paper
    paper_id = str(uuid4())
    paper = {
        "id": paper_id,
        "title": paper_request.title,
        "standard_id": standard_id,
        "standard_name": standard_name,
        "subject_id": subject_id, 
        "subject_name": subject_name,
        "total_marks": total_paper_marks,
        "sections": [section.model_dump() for section in paper_sections],
        "created_at": datetime.now(),
        "created_by": current_user.username,
        "question_bank_ids": paper_request.question_bank_ids
    }
    
    # Save to database
    papers_db.papers.insert_one(paper)
    
    # Return as expected model
    return GeneratedPaper(**paper)

@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_papers(current_user: User = Depends(get_current_user)):
    """
    Get all papers generated by the authenticated user
    """
    papers_db = get_db()
    papers = list(papers_db.papers.find({"created_by": current_user.username}))
    return papers

@router.get("/{paper_id}", status_code=status.HTTP_200_OK)
async def get_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific paper by ID
    """
    papers_db = get_db()
    paper = papers_db.papers.find_one({"id": paper_id})
    
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    
    # Check if user has access to this paper
    if paper.get("created_by") != current_user.username and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this paper"
        )
    
    return paper

@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific paper by ID
    """
    papers_db = get_db()
    paper = papers_db.papers.find_one({"id": paper_id})
    
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper not found"
        )
    
    # Check if user has access to delete this paper
    if paper.get("created_by") != current_user.username and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this paper"
        )
    
    papers_db.papers.delete_one({"id": paper_id})
    return None