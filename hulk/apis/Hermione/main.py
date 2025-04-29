from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status, Form
from typing import  List, Optional
import os
import re
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv
import json
import tempfile
import fitz
from openai import OpenAI
from PIL import Image
from io import BytesIO
from uuid import UUID, uuid4
from datetime import datetime
from gridfs import GridFS
from pymongo import MongoClient
from fastapi.responses import StreamingResponse
from security.main import get_current_user
from models.question_bank_model import DifficultyLevel
from pydantic import BaseModel, Field
import asyncio
import time
from functools import wraps

# ----- QUESTION MODELS -----

class QuestionCreate(BaseModel):
    question_text: str = Field(..., description="The text of the question (can be in LaTeX format)")
    question_type_id: str = Field(..., description="ID of the question type")
    difficulty_level: DifficultyLevel = Field(..., description="Difficulty level of the question")
    marks: int = Field(..., gt=0, le=100, description="Marks assigned to the question", example=5)
    image_required: bool = Field(..., description="Indicates if the question requires an image/diagram")
    tags: Optional[List[str]] = Field(None, description="List of tags associated with the question")

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(None, description="The text of the question (can be in LaTeX format)")
    question_type_id: Optional[str] = Field(None, description="ID of the question type") 
    difficulty_level: Optional[DifficultyLevel] = Field(None, description="Difficulty level of the question")
    marks: Optional[int] = Field(None, gt=0, le=100, description="Marks assigned to the question")
    image_required: Optional[bool] = Field(None, description="Indicates if the question requires an image/diagram")
    images: Optional[List[UUID]] = Field(None, description="List of image identifiers associated with the question")
    options: Optional[List[str]] = Field(None, description="List of options for multiple choice/true-false questions")
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

load_dotenv(dotenv_path=".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Create two separate routers
router = APIRouter(
    prefix="/question-extractor", 
    tags=["question-extraction"]
)

questions_router = APIRouter(
    prefix="/questions", 
    tags=["questions"]
)

# Connect to MongoDB and get GridFS
def get_question_db():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), uuidRepresentation="standard")
    return client["question_bank"]

def get_grid_fs():
    db = get_question_db()
    return GridFS(db)

def get_curriculum_db():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"), uuidRepresentation="standard")
    return client["examcraft"]

@router.post("/scan-pdf", status_code=status.HTTP_200_OK)
async def scan_pdf(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not set in environment variables"
        )

    if not file.content_type == 'application/pdf':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF document"
        )

    temp_pdf_path = None
    try:
        # Make sure rate limiter is initialized with enough permits
        await pdf_rate_limiter.start()
        
        # Temporarily increase semaphore to match max concurrency
        pdf_rate_limiter.semaphore = asyncio.Semaphore(12)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(await file.read())
            temp_pdf_path = temp_pdf.name

        combined_data = {"questions": []}

        with fitz.open(temp_pdf_path) as pdf_document:
            num_pages = len(pdf_document)
            print(f"Processing {num_pages} pages concurrently")
            
            # Pre-process pages to load them before passing to tasks
            pages = [pdf_document[page_num] for page_num in range(num_pages)]
            
            # Create tasks for concurrent processing
            tasks = [process_page(page, page_num) for page_num, page in enumerate(pages)]
            
            # Process pages concurrently
            page_results = await asyncio.gather(*tasks)
            
            # Combine all questions from all pages
            for questions in page_results:
                combined_data["questions"].extend(questions)
        
        print(f"Finished processing {num_pages} pages")     
        # Run the final processing on the combined data
        combined_data = get_checked_from_openai_response(combined_data)
        return combined_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF file: {str(e)}"
        )
    finally:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.unlink(temp_pdf_path)
            except PermissionError:
                pass

@router.post("/scan-excel", status_code=status.HTTP_200_OK)
async def scan_excel(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Extract questions from Excel/CSV files"""
    if not file.content_type in ['application/vnd.ms-excel', 
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                                'text/csv', 
                                'application/csv']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel or CSV document"
        )
    
    temp_file_path = None
    try:
        # Save the uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name
            
        # Read the Excel/CSV file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(temp_file_path)
        else:
            df = pd.read_excel(temp_file_path)
        
        # Check for required columns
        required_columns = ['question_text']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File must contain the following columns: {', '.join(required_columns)}"
            )
        
        # Extract questions from dataframe
        questions = []
        for _, row in df.iterrows():
            question = {
                "question_text": row['question_text'],
                "image_required": bool(row.get('image_required', False))
            }
            questions.append(question)
        
        # Create response data
        result_data = {
            "questions": questions,
        }
        
        
        return result_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing Excel/CSV file: {str(e)}"
        )
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except PermissionError:
                pass

@router.post("/scan-image", status_code=status.HTTP_200_OK)
async def scan_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Extract questions from image files"""
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not set in environment variables"
        )
        
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        result_data = await extract_questions_from_image(image)
        result_data = get_checked_from_openai_response(result_data)
        return result_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image file: {str(e)}"
        )

@questions_router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_text: str = Form(..., description="The text of the question (can be in LaTeX format)"),
    question_type_id: str = Form(..., description="ID of the question type"),
    difficulty_level: str = Form(..., description="Difficulty level of the question"),
    marks: int = Form(..., description="Marks assigned to the question"),
    image_required: bool = Form(..., description="Indicates if the question requires an image/diagram"),
    topic_id: str = Form(..., description="Topic ID for the question"),
    tags: Optional[str] = Form(None, description="Comma-separated list of tags associated with the question"),
    image: Optional[UploadFile] = File(None, description="Image file for the question if required"),
    current_user = Depends(get_current_user)
):
    """Create a new question with optional image upload"""
    question_db = get_question_db()
    curriculum_db = get_curriculum_db()
    
    # Parse tags from comma-separated string if provided
    tag_list = None
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',')]
    
    # Validate difficulty level
    try:
        difficulty = DifficultyLevel(difficulty_level)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid difficulty level. Valid options are: {[level.value for level in DifficultyLevel]}"
        )
    
    # Validate topic_id and get related information
    topic = curriculum_db.topics.find_one({"id": topic_id})
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    chapter = curriculum_db.chapters.find_one({"id": topic["chapter_id"]})
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    subject = curriculum_db.subjects.find_one({"id": chapter["subject_id"]})
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    standard = curriculum_db.standards.find_one({"id": subject["standard_id"]})
    if not standard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard not found"
        )
    
    # Validate question_type_id
    question_type = curriculum_db.question_types.find_one({"id": question_type_id})
    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )
    
    
    # Validate image requirement
    if image_required and not image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This question requires an image but none was provided"
        )
    
    # Create new question
    question_id = str(uuid4())
    current_time = datetime.now()
    
    question_dict = {
        "id": question_id,
        "question_text": question_text,
        "question_type_id": question_type_id,
        "difficulty_level": difficulty.value,
        "marks": marks,
        "image_required": image_required,
        "tags": tag_list,
        "created_at": current_time,
        "updated_at": current_time,
        "created_by": current_user.username,
        "updated_by": current_user.username,
        "topic_id": topic_id,
        "chapter_id": chapter["id"],
        "subject_id": subject["id"],
        "standard_id": standard["id"],
        "images": []  # Initialize with empty list
    }
    
    # Handle options field for multiple choice questions
    if question_type["name"].lower() in ["multiple_choice", "true_false"]:
        question_dict["options"] = []  # Initialize with empty list
    
    # Handle image upload if provided
    if image and image.filename:
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Read file content
        file_content = await image.read()
        
        # Generate a unique file_id
        file_id = uuid4()
        
        # Store file in GridFS with metadata
        fs = get_grid_fs()
        metadata = {
            "filename": image.filename,
            "content_type": image.content_type,
            "question_id": question_id,
            "uploaded_by": current_user.username,
            "uploaded_at": datetime.now(),
            "file_id": str(file_id)
        }
        
        # Save to GridFS
        fs.put(file_content, **metadata)
        
        # Add image reference to question
        question_dict["images"] = [file_id]
    
    # Insert question into database
    result = question_db.questions.insert_one(question_dict)
    
    if not result.acknowledged:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create question"
        )
    
    # Prepare response
    response_data = {
        **question_dict,
        "question_type_name": question_type["name"]
    }
    
    return QuestionResponse(**response_data)

@questions_router.get("/{question_id}/images/{image_id}")
async def get_question_image(
    question_id: str,
    image_id: str,
    current_user = Depends(get_current_user)
):
    """Retrieve an image for a question from GridFS"""
    try:
        image_uuid = UUID(image_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image ID format"
        )
    
    question_db = get_question_db()
    fs = get_grid_fs()
    
    # Check if question exists
    question = question_db.questions.find_one({"id": question_id})
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if image ID is associated with the question
    question_images = question.get("images", [])
    if str(image_uuid) not in [str(img) for img in question_images]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found for this question"
        )
    
    # Find the file in GridFS
    file = fs.find_one({"file_id": str(image_uuid)})
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found in storage"
        )
    
    # Return file contents
    grid_out = fs.get(file._id)
    return StreamingResponse(
        grid_out,
        media_type=grid_out.metadata.get('content_type', 'image/jpeg')
    )

class Question(BaseModel):
    question_text: str
    image_required: bool
def sanitize_latex(response_text):
    if isinstance(response_text, str):
        return re.sub(r'(?<=\$)(.*?)(?=\$)', lambda m: m.group(1).replace("\\", "\\\\"), response_text)
    return response_text

def get_checked_from_openai_response(response_text):
    try:
        client = OpenAI(
                base_url=os.environ["OPENAI_API_BASE"],
                api_key=os.environ["GITHUB_TOKEN"],
        )
        
        # If response_text is already a dictionary, convert it to JSON string
        if isinstance(response_text, dict):
            input_json = json.dumps(response_text)
        else:
            input_json = sanitize_latex(response_text)
        
        system_content = """
        You are a LaTeX expert with deep knowledge of formatting content in JSON. 
        Your task is to fix LaTeX syntax in the question data while maintaining valid JSON structure. Strictly follow the instructions the response format
        """
        
        # Create user content without problematic literal JSON example in the f-string
        user_content = """
        You are provided with a JSON object containing questions that use LaTeX syntax. Your task is to sanitize and correct the LaTeX content while preserving the original JSON structure.

        Instructions:
        1. **Fix LaTeX Syntax**:
        - Ensure all LaTeX expressions compile correctly on the frontend.
        - Replace \\n with \\newline
        
        2. **Content Cleanup**:
        - Remove any images, diagrams, tables, or flowcharts embedded in the `question_text`.
        - If a question refers to an image or diagram, remove that reference.
        
        3. **JSON Structure**:
        - Ensure LaTeX formatting is correctly applied in the `question_text`.
        - Maintain the `"image_required"` field, ensuring it's set to `true` for questions that require a diagram and `false` for others.

        4. **Final Output**:
        - Should not include text like "Answer the following questions" or "Solve any four of the following". or "Fill in the blanks and complete the sentences", just separate those sub-questions into different question_texts or objects of the JSON.
        
        For Example, transform this:
        {"questions": [{"question_text": "1) The \\dots is an important method of geography.\\newline 2) \\dots city is the IT centre in India.\\newline 3) Somali current is in the \\dots ocean.\\newline 4) \\dots is the main occupation in the village.", "image_required": false}]}
        
        Into this format:
        {"questions": [{"question_text": "1) The \\dots is an important method of geography.", "image_required": false}, {"question_text": "2) \\dots city is the IT centre in India.", "image_required": false}, {"question_text": "3) Somali current is in the \\dots ocean.", "image_required": false}, {"question_text": "4) \\dots is the main occupation in the village.", "image_required": false}]}
        
        - Return the corrected JSON object with properly formatted LaTeX content, ensuring no syntax errors or missing fields.

        Here is the JSON object to process:
        """
        
        # Add the input JSON separately to avoid format string issues
        user_content = user_content + input_json

        # Use OpenAI API to process the extracted questions
        response = client.chat.completions.create(
            model=get_openai_model(),  # Using fallback mechanism
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content},
            ],
            temperature=0.2
        )

        response_text = response.choices[0].message.content.strip()
        response_text = sanitize_latex(response_text)
        
        if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        
        try:
            parsed_data = json.loads(response_text)
            if "questions" in parsed_data:
                validated_questions = []
                for q in parsed_data["questions"]:
                    try:
                        question = Question(**q)
                        question.question_text = question.question_text.strip()
                        validated_questions.append(question.model_dump())
                    except Exception as ve:
                        print(f"Validation error for question: {ve}")
                return {"questions": validated_questions}
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {str(e)}")
            print(f"Response text was: {response_text[:200]}...")
            return {"questions": []}
            
    except Exception as e:
        print(f"Error parsing JSON 2 : {str(e)}")
        return {"questions": []}
    
    return {"questions": []}


# Function to extract questions from image
async def extract_questions_from_image(image):
    
    try:
        # Initialize Gemini model with vision capabilities
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Prepare the prompt for question extraction - optimized for structured question papers
        prompt = """
        You are an expert at extracting questions from educational question papers and exam sheets. The image you are processing contains a structured question paper with multiple questions.

        Please perform the following tasks:
        2. Do not include any associated metadata such as marks, question numbers.
        3. Do **not extract tables, diagrams, or images**.
        4. Preserve any mathematical symbols and expressions in **proper LaTeX formatting**.
        6. For each question, determine whether an image is required to solve it (e.g., if a diagram or chart is referenced), and include a field `"image_required": true` or `"image_required": false`.

        Return the results as valid JSON with the following structure:

        {
            "questions": [
                {
                    "question_text": "Full question text with proper LaTeX formatting",
                    "image_required": true|false
                }
            ]
        }

        For Example:
        {
            "questions": [
                {
                    "question_text": "Divide and write the quotient $\\frac{64y^4}{16y^2}$.",
                    "image_required": false
                },
                {
                    "question_text": "Write adjectives from the following: $\\newline(a) \\textit{technology} \\newline(b) \\textit{surgery}$",
                    "image_required": false
                }
            ]
        }

        Please ensure that:
        - Only the main question is extracted — no marks, no question numbers, nothing like Solve any four of the following it should be just question.
        - The formatting and mathematical expressions are preserved in LaTeX.
        - Only text is included — no images, tables, or diagrams.
        - The `"image_required"` field indicates whether a diagram or image is needed to answer the question.

        """
        response = model.generate_content([prompt, image], stream=False )
        response_text = sanitize_latex(response.text)
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            response_text = response_text[json_start:json_end].strip()
      
        try:
            parsed_data = json.loads(response_text)
            if "questions" in parsed_data:
                validated_questions = []
                for q in parsed_data["questions"]:
                    try:
                        question = Question(**q)
                        question.question_text = question.question_text.strip()
                        validated_questions.append(question.model_dump())
                    except json.JSONDecodeError as ve:
                        print(f"Validation error for question: {ve}")
                return {"questions": validated_questions}
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from image: {str(e)}")
            print(f"Response text was: {response_text[:200]}...")
            return {"questions": []}
            
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {"questions": []}

# Rate limiter class for API requests
class RateLimiter:
    def __init__(self, max_calls=12, period=60):
        """
        Initialize a rate limiter that allows max_calls in period seconds.
        Default: 12 calls per minute (60 seconds)
        """
        self.max_calls = max_calls
        self.period = period
        self.calls = []
        self.lock = asyncio.Lock()
        
        # Semaphore to control concurrent access (allows up to max_calls concurrent operations)
        self.semaphore = asyncio.Semaphore(max_calls)
        
        # Start a background task to replenish tokens
        self.replenish_task = None
    
    async def start(self):
        """Start the token replenishment background task"""
        if self.replenish_task is None:
            self.replenish_task = asyncio.create_task(self._replenish_tokens())
    
    async def stop(self):
        """Stop the token replenishment background task"""
        if self.replenish_task:
            self.replenish_task.cancel()
            try:
                await self.replenish_task
            except asyncio.CancelledError:
                pass
            self.replenish_task = None
    
    async def _replenish_tokens(self):
        """Background task that releases semaphore permits over time"""
        try:
            while True:
                # Sleep for the time needed to allow one more call within the period
                await asyncio.sleep(self.period / self.max_calls)
                
                # Try to release a token if needed
                async with self.lock:
                    now = time.time()
                    self.calls = [t for t in self.calls if now - t <= self.period]
                    
                    # If we have capacity for more calls
                    if len(self.calls) < self.max_calls:
                        # Try to increase the semaphore count if it's not at max
                        if self.semaphore._value < self.max_calls:
                            self.semaphore._value += 1
                            
        except asyncio.CancelledError:
            # Clean exit when the task is cancelled
            raise
        except Exception as e:
            print(f"Error in token replenishment: {str(e)}")
    
    async def acquire(self):
        """
        Acquire permission to make a call.
        Returns immediately if under rate limit, or waits for a token if at the limit.
        """
        # Ensure the replenishment task is running
        await self.start()
        
        # Wait for a semaphore permit
        await self.semaphore.acquire()
        
        # Record this call 
        async with self.lock:
            self.calls.append(time.time())
        
        return True
    
    async def release(self):
        """Release the permit when done"""
        self.semaphore.release()

# Create global rate limiter instance for PDF processing
pdf_rate_limiter = RateLimiter(max_calls=12, period=60)  # 12 requests per minute

# Helper function to process a single page with rate limiting
async def process_page(page, page_num):
    """Process a single page from the PDF with rate limiting"""
    start_time = time.time()
    print(f"Starting to process page {page_num + 1} at {datetime.now().strftime('%H:%M:%S.%f')}")
    try:
        # Acquire a permit from the rate limiter - this will be immediate if under the rate limit
        # or will wait for a permit to become available if at the rate limit
        await pdf_rate_limiter.acquire()
        
        # Process the page once we have a permit
        pix = page.get_pixmap(dpi=300)
        image_bytes = pix.tobytes("png")
        page_image = Image.open(BytesIO(image_bytes))
        
        # Process the page
        page_data = await extract_questions_from_image(page_image)
        end_time = time.time()
        processing_time = end_time - start_time
        # print(f"Successfully processed page {page_num + 1} in {processing_time:.2f} seconds at {datetime.now().strftime('%H:%M:%S.%f')}")
        return page_data.get("questions", [])
    except Exception as e:
        print(f"Error processing page {page_num + 1}: {str(e)}")
        return []
    finally:
        # Make sure to release the permit when done, even if there was an error
        await pdf_rate_limiter.release()

def get_openai_model(preferred_model="gpt-4o"):
    """
    Returns the appropriate OpenAI model, implementing fallback logic if needed.
    Tracks usage to prevent exceeding daily limits.
    """
    if not hasattr(get_openai_model, "usage_counter"):
        get_openai_model.usage_counter = {}
    
    # Initialize counter for the preferred model if it doesn't exist
    if preferred_model not in get_openai_model.usage_counter:
        get_openai_model.usage_counter[preferred_model] = 0
    
    # Model tiers from most capable to least capable
    model_tiers = ["gpt-4o", "gpt-4o-mini"]
    
    # Model daily limits (adjust based on your OpenAI plan)
    model_limits = {
        "gpt-4o": 50,  
        "gpt-4o-mini": 50
    }
    
    # Start with preferred model
    model_to_use = preferred_model
    
    # Check if we've hit the limit for the preferred model
    if get_openai_model.usage_counter[model_to_use] >= model_limits.get(model_to_use, 50):
        # Find the next available model
        started_looking = False
        for model in model_tiers:
            if model == preferred_model:
                started_looking = True
                continue
                
            if started_looking:
                # Initialize counter for this model if it doesn't exist
                if model not in get_openai_model.usage_counter:
                    get_openai_model.usage_counter[model] = 0
                    
                # Check if this model is still under the limit
                if get_openai_model.usage_counter[model] < model_limits.get(model, 50):
                    model_to_use = model
                    print(f"Falling back to {model} due to rate limiting")
                    break
    
    # Increment usage counter for selected model
    get_openai_model.usage_counter[model_to_use] += 1
    
    return model_to_use
