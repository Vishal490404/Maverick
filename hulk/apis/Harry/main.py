from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from pymongo import MongoClient
from security.main import get_current_user
from apis.Harry.models import (
    StandardCreate, StandardUpdate, StandardResponse, 
    SubjectCreate, SubjectUpdate, SubjectResponse, 
    ChapterCreate, ChapterUpdate, ChapterResponse,
    TopicCreate, TopicUpdate, TopicResponse,
    QuestionCreate, QuestionUpdate, QuestionResponse,
    QuestionTypeCreate, QuestionTypeUpdate, QuestionTypeResponse,
    TagCreate, TagUpdate, TagResponse
)
from .db_init import get_curriculum_db

# Initialize router
router = APIRouter(prefix="/curriculum", tags=["curriculum"])

# ----- STANDARDS (GRADES) ROUTES -----

@router.post("/standards", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
async def create_standard(standard: StandardCreate, current_user = Depends(get_current_user)):
    """Create a new standard/grade"""
    db = get_curriculum_db()
    
    # Check if standard with same name already exists
    existing_standard = db.standards.find_one({"name": standard.name})
    if existing_standard:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Standard with this name already exists"
        )
    
    # Create new standard
    standard_id = str(uuid4())
    standard_dict = standard.model_dump()
    standard_dict["id"] = standard_id
    standard_dict["created_at"] = datetime.now()
    standard_dict["created_by"] = current_user.username
    
    result = db.standards.insert_one(standard_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create standard"
        )
    
    return StandardResponse(**standard_dict)

@router.get("/standards", response_model=List[StandardResponse])
async def get_all_standards(current_user = Depends(get_current_user)):
    """Get all standards/grades"""
    db = get_curriculum_db()
    standards = list(db.standards.find())
    return [StandardResponse(**standard) for standard in standards]

@router.get("/standards/{standard_id}", response_model=StandardResponse)
async def get_standard(standard_id: str, current_user = Depends(get_current_user)):
    """Get a specific standard by ID"""
    db = get_curriculum_db()
    standard = db.standards.find_one({"id": standard_id})
    
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    return StandardResponse(**standard)

@router.put("/standards/{standard_id}", response_model=StandardResponse)
async def update_standard(
    standard_id: str, 
    standard_update: StandardUpdate,
    current_user = Depends(get_current_user)
):
    """Update a standard/grade"""
    db = get_curriculum_db()
    
    # Check if standard exists
    existing_standard = db.standards.find_one({"id": standard_id})
    if not existing_standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    # Check if new name conflicts with another standard
    if standard_update.name:
        name_conflict = db.standards.find_one({
            "name": standard_update.name,
            "id": {"$ne": standard_id}
        })
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another standard with this name already exists"
            )
    
    # Update standard
    update_data = {k: v for k, v in standard_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    update_data["updated_by"] = current_user.username
    
    result = db.standards.update_one(
        {"id": standard_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    updated_standard = db.standards.find_one({"id": standard_id})
    return StandardResponse(**updated_standard)

@router.delete("/standards/{standard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_standard(standard_id: str, current_user = Depends(get_current_user)):
    db = get_curriculum_db()
    
    # Check if standard has subjects
    subjects_count = db.subjects.count_documents({"standard_id": standard_id})
    if subjects_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete standard with {subjects_count} associated subjects. Remove subjects first."
        )
    
    result = db.standards.delete_one({"id": standard_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    return None

# ----- SUBJECTS ROUTES -----

@router.post("/standards/{standard_id}/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    standard_id: str,
    subject: SubjectCreate,
    current_user = Depends(get_current_user)
):
    """Create a new subject for a standard"""
    db = get_curriculum_db()
    
    # Check if standard exists
    standard = db.standards.find_one({"id": standard_id})
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    # Check if subject with same name already exists for this standard
    existing_subject = db.subjects.find_one({
        "standard_id": standard_id,
        "name": subject.name
    })
    if existing_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject with this name already exists for this standard"
        )
    
    # Create new subject
    subject_id = str(uuid4())
    subject_dict = subject.model_dump()
    subject_dict["id"] = subject_id
    subject_dict["standard_id"] = standard_id
    subject_dict["created_at"] = datetime.now()
    subject_dict["created_by"] = current_user.username
    
    result = db.subjects.insert_one(subject_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subject"
        )
    
    return SubjectResponse(**subject_dict)

@router.get("/standards/{standard_id}/subjects", response_model=List[SubjectResponse])
async def get_subjects_by_standard(
    standard_id: str,
    current_user = Depends(get_current_user)
):
    """Get all subjects for a specific standard"""
    db = get_curriculum_db()
    
    # Check if standard exists
    standard = db.standards.find_one({"id": standard_id})
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    subjects = list(db.subjects.find({"standard_id": standard_id}))
    return [SubjectResponse(**subject) for subject in subjects]

@router.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific subject by ID"""
    db = get_curriculum_db()
    subject = db.subjects.find_one({"id": subject_id})
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    return SubjectResponse(**subject)

@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    subject_update: SubjectUpdate,
    current_user = Depends(get_current_user)
):
    """Update a subject"""
    db = get_curriculum_db()
    
    # Check if subject exists
    existing_subject = db.subjects.find_one({"id": subject_id})
    if not existing_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # If name is changed, check for conflicts
    if subject_update.name:
        name_conflict = db.subjects.find_one({
            "standard_id": existing_subject["standard_id"],
            "name": subject_update.name,
            "id": {"$ne": subject_id}
        })
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another subject with this name already exists for this standard"
            )
    
    # Update subject
    update_data = {k: v for k, v in subject_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    update_data["updated_by"] = current_user.username
    
    result = db.subjects.update_one(
        {"id": subject_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    updated_subject = db.subjects.find_one({"id": subject_id})
    return SubjectResponse(**updated_subject)

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str, current_user = Depends(get_current_user)):
    """Delete a subject"""
    db = get_curriculum_db()
    
    # Check if subject has chapters
    chapters_count = db.chapters.count_documents({"subject_id": subject_id})
    if chapters_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete subject with {chapters_count} associated chapters. Remove chapters first."
        )
    
    result = db.subjects.delete_one({"id": subject_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    return None

# ----- CHAPTERS ROUTES -----

@router.post("/subjects/{subject_id}/chapters", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    subject_id: str,
    chapter: ChapterCreate,
    current_user = Depends(get_current_user)
):
    """Create a new chapter for a subject"""
    db = get_curriculum_db()
    
    # Check if subject exists
    subject = db.subjects.find_one({"id": subject_id})
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Check if chapter with same name already exists for this subject
    existing_chapter = db.chapters.find_one({
        "subject_id": subject_id,
        "name": chapter.name
    })
    if existing_chapter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chapter with this name already exists for this subject"
        )
    
    # Create new chapter
    chapter_id = str(uuid4())
    chapter_dict = chapter.model_dump()
    chapter_dict["id"] = chapter_id
    chapter_dict["subject_id"] = subject_id
    chapter_dict["created_at"] = datetime.now()
    chapter_dict["created_by"] = current_user.username
    
    result = db.chapters.insert_one(chapter_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chapter"
        )
    
    return ChapterResponse(**chapter_dict)

@router.get("/subjects/{subject_id}/chapters", response_model=List[ChapterResponse])
async def get_chapters_by_subject(
    subject_id: str,
    current_user = Depends(get_current_user)
):
    """Get all chapters for a specific subject"""
    db = get_curriculum_db()
    
    # Check if subject exists
    subject = db.subjects.find_one({"id": subject_id})
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    chapters = list(db.chapters.find({"subject_id": subject_id}))
    return [ChapterResponse(**chapter) for chapter in chapters]

@router.get("/chapters/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(
    chapter_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific chapter by ID"""
    db = get_curriculum_db()
    chapter = db.chapters.find_one({"id": chapter_id})
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    return ChapterResponse(**chapter)

@router.put("/chapters/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(
    chapter_id: str,
    chapter_update: ChapterUpdate,
    current_user = Depends(get_current_user)
):
    """Update a chapter"""
    db = get_curriculum_db()
    
    # Check if chapter exists
    existing_chapter = db.chapters.find_one({"id": chapter_id})
    if not existing_chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # If name is changed, check for conflicts
    if chapter_update.name:
        name_conflict = db.chapters.find_one({
            "subject_id": existing_chapter["subject_id"],
            "name": chapter_update.name,
            "id": {"$ne": chapter_id}
        })
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another chapter with this name already exists for this subject"
            )
    
    # Update chapter
    update_data = {k: v for k, v in chapter_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    update_data["updated_by"] = current_user.username
    
    result = db.chapters.update_one(
        {"id": chapter_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    updated_chapter = db.chapters.find_one({"id": chapter_id})
    return ChapterResponse(**updated_chapter)

@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(chapter_id: str, current_user = Depends(get_current_user)):
    """Delete a chapter"""
    db = get_curriculum_db()
    
    # Check if chapter has topics
    topics_count = db.topics.count_documents({"chapter_id": chapter_id})
    if topics_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete chapter with {topics_count} associated topics. Remove topics first."
        )
    
    result = db.chapters.delete_one({"id": chapter_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    return None

# ----- TOPICS ROUTES -----

@router.post("/chapters/{chapter_id}/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    chapter_id: str,
    topic: TopicCreate,
    current_user = Depends(get_current_user)
):
    """Create a new topic for a chapter"""
    db = get_curriculum_db()
    
    # Check if chapter exists
    chapter = db.chapters.find_one({"id": chapter_id})
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Check if topic with same name already exists for this chapter
    existing_topic = db.topics.find_one({
        "chapter_id": chapter_id,
        "name": topic.name
    })
    if existing_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this name already exists for this chapter"
        )
    
    # Create new topic
    topic_id = str(uuid4())
    topic_dict = topic.model_dump()
    topic_dict["id"] = topic_id
    topic_dict["chapter_id"] = chapter_id
    topic_dict["created_at"] = datetime.now()
    topic_dict["created_by"] = current_user.username
    
    result = db.topics.insert_one(topic_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create topic"
        )
    
    return TopicResponse(**topic_dict)

@router.get("/chapters/{chapter_id}/topics", response_model=List[TopicResponse])
async def get_topics_by_chapter(
    chapter_id: str,
    current_user = Depends(get_current_user)
):
    """Get all topics for a specific chapter"""
    db = get_curriculum_db()
    
    # Check if chapter exists
    chapter = db.chapters.find_one({"id": chapter_id})
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    topics = list(db.topics.find({"chapter_id": chapter_id}))
    return [TopicResponse(**topic) for topic in topics]

@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific topic by ID"""
    db = get_curriculum_db()
    topic = db.topics.find_one({"id": topic_id})
    
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    return TopicResponse(**topic)

@router.put("/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: str,
    topic_update: TopicUpdate,
    current_user = Depends(get_current_user)
):
    """Update a topic"""
    db = get_curriculum_db()
    
    # Check if topic exists
    existing_topic = db.topics.find_one({"id": topic_id})
    if not existing_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    # If name is changed, check for conflicts
    if topic_update.name:
        name_conflict = db.topics.find_one({
            "chapter_id": existing_topic["chapter_id"],
            "name": topic_update.name,
            "id": {"$ne": topic_id}
        })
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another topic with this name already exists for this chapter"
            )
    
    # Update topic
    update_data = {k: v for k, v in topic_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    update_data["updated_by"] = current_user.username
    
    result = db.topics.update_one(
        {"id": topic_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    updated_topic = db.topics.find_one({"id": topic_id})
    return TopicResponse(**updated_topic)

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(topic_id: str, current_user = Depends(get_current_user)):
    """Delete a topic"""
    db = get_curriculum_db()
    
    # Check if topic has questions
    questions_count = db.questions.count_documents({"topic_id": topic_id})
    if questions_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete topic with {questions_count} associated questions. Remove questions first."
        )
    
    result = db.topics.delete_one({"id": topic_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    return None

# ----- QUESTION TYPE ROUTES -----

@router.post("/question-types", response_model=QuestionTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_question_type(
    question_type: QuestionTypeCreate,
    current_user = Depends(get_current_user)
):
    """Create a new question type"""
    db = get_curriculum_db()
    
    # Check if question type with same code already exists
    existing_question_type = db.question_types.find_one({"name": question_type.name})
    if existing_question_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question type with this code already exists"
        )
    
    # Create new question type
    question_type_id = str(uuid4())
    question_type_dict = question_type.model_dump()
    question_type_dict["id"] = question_type_id
    question_type_dict["created_at"] = datetime.now()
    question_type_dict["created_by"] = current_user.username
    
    result = db.question_types.insert_one(question_type_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create question type"
        )
    
    return QuestionTypeResponse(**question_type_dict)

@router.get("/question-types", response_model=List[QuestionTypeResponse])
async def get_all_question_types(current_user = Depends(get_current_user)):
    """Get all question types"""
    db = get_curriculum_db()
    question_types = list(db.question_types.find())
    return [QuestionTypeResponse(**question_type) for question_type in question_types]

@router.get("/question-types/{question_type_id}", response_model=QuestionTypeResponse)
async def get_question_type(question_type_id: str, current_user = Depends(get_current_user)):
    """Get a specific question type by ID"""
    db = get_curriculum_db()
    question_type = db.question_types.find_one({"id": question_type_id})
    
    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )
    
    return QuestionTypeResponse(**question_type)

@router.put("/question-types/{question_type_id}", response_model=QuestionTypeResponse)
async def update_question_type(
    question_type_id: str, 
    question_type_update: QuestionTypeUpdate,
    current_user = Depends(get_current_user)
):
    """Update a question type"""
    db = get_curriculum_db()
    
    # Check if question type exists
    existing_question_type = db.question_types.find_one({"id": question_type_id})
    if not existing_question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )
    
    # Update question type
    update_data = {k: v for k, v in question_type_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    update_data["updated_by"] = current_user.username
    
    result = db.question_types.update_one(
        {"id": question_type_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )
    
    updated_question_type = db.question_types.find_one({"id": question_type_id})
    return QuestionTypeResponse(**updated_question_type)

@router.delete("/question-types/{question_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_type(question_type_id: str, current_user = Depends(get_current_user)):
    """Delete a question type"""
    db = get_curriculum_db()
    
    # Check if any questions use this question type
    questions_count = db.questions.count_documents({"question_type_id": question_type_id})
    if questions_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete question type with {questions_count} associated questions. Update or remove these questions first."
        )
    
    result = db.question_types.delete_one({"id": question_type_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )
    
    return None
# ----- TAG ROUTES -----

@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: TagCreate,
    current_user = Depends(get_current_user)
):
    """Create a new tag"""
    db = get_curriculum_db()
    
    # Check if tag with same name already exists
    existing_tag = db.tags.find_one({"name": tag.name})
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name already exists"
        )
    
    # Create new tag
    tag_id = str(uuid4())
    tag_dict = tag.model_dump()
    tag_dict["id"] = tag_id
    tag_dict["created_at"] = datetime.now()
    tag_dict["created_by"] = current_user.username
    tag_dict["usage_count"] = 0  # Initialize usage count
    
    result = db.tags.insert_one(tag_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag"
        )
    
    return TagResponse(**tag_dict)

@router.get("/tags", response_model=List[TagResponse])
async def get_all_tags(
    current_user = Depends(get_current_user)
):
    """Get all tags"""
    db = get_curriculum_db()
    tags = list(db.tags.find())
    
    # Update usage counts (optional - can be expensive on large collections)
    for tag in tags:
        # Count questions using this tag
        tag["usage_count"] = db.questions.count_documents({"tags": tag["id"]})
    
    return [TagResponse(**tag) for tag in tags]

@router.get("/tags/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific tag by ID"""
    db = get_curriculum_db()
    tag = db.tags.find_one({"id": tag_id})
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Update usage count
    tag["usage_count"] = db.questions.count_documents({"tags": tag_id})
    
    return TagResponse(**tag)

@router.put("/tags/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: str,
    tag_update: TagUpdate,
    current_user = Depends(get_current_user)
):
    """Update a tag"""
    db = get_curriculum_db()
    
    # Check if tag exists
    existing_tag = db.tags.find_one({"id": tag_id})
    if not existing_tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Check for name conflicts if name is being updated
    if tag_update.name and tag_update.name != existing_tag["name"]:
        name_conflict = db.tags.find_one({
            "name": tag_update.name,
            "id": {"$ne": tag_id}
        })
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another tag with this name already exists"
            )
    
    # Update tag
    update_data = {k: v for k, v in tag_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    update_data["updated_by"] = current_user.username
    
    result = db.tags.update_one(
        {"id": tag_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Get updated tag
    updated_tag = db.tags.find_one({"id": tag_id})
    
    # Update usage count
    updated_tag["usage_count"] = db.questions.count_documents({"tags": tag_id})
    
    return TagResponse(**updated_tag)

@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: str,
    force: bool = False,
    current_user = Depends(get_current_user)
):
    """
    Delete a tag. 
    If force=false (default), it will only delete unused tags.
    If force=true, it will remove the tag from all questions using it and then delete.
    """
    db = get_curriculum_db()
    
    # Check if tag exists
    tag = db.tags.find_one({"id": tag_id})
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Check if tag is in use
    usage_count = db.questions.count_documents({"tags": tag_id})
    
    if usage_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete tag with {usage_count} associated questions. Set force=true to remove the tag from these questions."
        )
    
    # If force is true and tag is in use, remove the tag from all questions
    if usage_count > 0 and force:
        # Remove this tag from all questions
        db.questions.update_many(
            {"tags": tag_id},
            {"$pull": {"tags": tag_id}}
        )
    
    # Delete the tag
    result = db.tags.delete_one({"id": tag_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    return None