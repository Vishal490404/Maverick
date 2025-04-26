from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from typing import Dict, Any
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import tempfile
import fitz
from openai import OpenAI
from PIL import Image
from io import BytesIO

from security.main import get_current_user

load_dotenv(dotenv_path=".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/question-extractor", tags=["question-extraction"])

async def extract_questions_from_pdf_page(page_image: Image.Image, page_num: int) -> Dict[str, Any]:
    prompt = f"""
    You are given a scanned image from a question paper.
    
    Extract questions from this image and convert to LaTeX format, strictly follow this.

    IMPORTANT: All question_text MUST be formatted in LaTeX syntax. This includes:
    - Mathematical equations and symbols using LaTeX math mode ($...$)
    - Special characters properly escaped
    - Fractions as \\frac{{a}}{{b}}
    - Superscripts as ^{{n}} and subscripts as _{{n}}
    - Greek letters with \\alpha, \\beta, etc.
    - \\n should be replaced with \\
    - Use \\textbf{{text}} for bold text and \\textit{{text}} for italic text.
    - Use \\underline{{text}} for underlined text.
    - Use \\text{{text}} for normal text in math mode.
    - Use \\textcolor{{color}}{{text}} for colored text.
    - Don't include any tables, flowcharts, or diagrams in the output.

    IMPORTANT: Only question text should be extracted. Do not include any other text or instructions. The options should also be included in question text.
    For each question, determine if it requires an image or diagram to be understood fully and set image_required flag accordingly. Don't include question number etc. in the question text.
    For each question, determine if a passage is required to understand the question and set passage_required flag accordingly.
    Give output such that it will be easy to parse with a Latex compiler. 
    Don't include any images or diagrams including tables, flowchart, etc in the output. No visual representation is needed. Only text is required. 

    If there are any passages associated with the questions, identify them separately.
    The passage_text should also be in LaTeX format.
    Format the response as JSON with the following structure:
    {{
        "questions": [
            {{
                "question_text": "LaTeX formatted question",
                "image_required": true/false,
                "passage_required": true/false
            }},
            ...
        ],
        "passages": [
            {{
                "passage_text": "LaTeX formatted passage text"
            }},
            ...
        ]
    }}


    DO NOT add any fields that aren't in this structure. Focus only on question extraction.
    Your response must be a valid JSON object.
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content([prompt, page_image])

        if not response or not response.text:
            raise ValueError("Empty response from Gemini API")
        response_text = response.text.strip()
        if response_text.startswith("```json") and response_text.endswith("```"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```") and response_text.endswith("```"):
            response_text = response_text[3:-3].strip()

        try:
            result = json.loads(response_text)
        except json.JSONDecodeError as e:
            if "Invalid \\escape" in str(e):
                fixed_text = response_text.replace('\\', '\\\\')
                fixed_text = fixed_text.replace('\\\\"', '\\"')
                fixed_text = fixed_text.replace('\\\\n', '\\n')
                
                try:
                    result = json.loads(fixed_text)
                    print(f"Successfully fixed escape characters on page {page_num + 1}")
                except json.JSONDecodeError as e2:
                    print(f"Failed to fix JSON after escaping backslashes on page {page_num + 1}: {str(e2)}")
                    try:
                        import re
                        latex_patterns = [
                            (r'\\textbf', r'\\\\textbf'),
                            (r'\\begin', r'\\\\begin'),
                            (r'\\end', r'\\\\end'),
                            (r'\\hline', r'\\\\hline'),
                            (r'\\bar', r'\\\\bar'),
                            (r'\\sum', r'\\\\sum'),
                            (r'\\frac', r'\\\\frac'),
                            (r'\\includegraphics', r'\\\\includegraphics')
                        ]
                        
                        fixed_text = response_text
                        for pattern, replacement in latex_patterns:
                            fixed_text = re.sub(pattern, replacement, fixed_text)
                            
                        result = json.loads(fixed_text)
                        print(f"Successfully fixed escape characters with pattern replacement on page {page_num + 1}")
                    except Exception:
                        print(f"Attempting manual JSON construction for page {page_num + 1}")
                        result = {"questions": [], "passages": []}
                        print(f"Failed to parse JSON from Gemini API on page {page_num + 1}: {response_text}")
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Invalid JSON response from Gemini API on page {page_num + 1}: {str(e)}"
                        )
            else:
                # For other JSON errors, raise the exception
                print(f"Invalid JSON response from Gemini API on page {page_num + 1}: {response_text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Invalid JSON response from Gemini API on page {page_num + 1}: {str(e)}"
                )
        
        # Validate and fix the structure
        if "questions" not in result:
            result["questions"] = []
        
        if "passages" not in result:
            result["passages"] = []
        
        return result
    except Exception as e:
        print(f"Error extracting questions from page {page_num + 1}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting questions from page {page_num + 1}: {str(e)}"
        )

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
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(await file.read())
            temp_pdf_path = temp_pdf.name

        combined_data = {"questions": [], "passages": []}

        with fitz.open(temp_pdf_path) as pdf_document:
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                
                pix = page.get_pixmap(dpi=300) 
                image_bytes = pix.tobytes("png")
                page_image = Image.open(BytesIO(image_bytes))
                # debug_image_path = f"page_{page_num + 1}.png"
                # page_image.save(debug_image_path)
                # print(f"Saved sample image for page {page_num + 1} at {debug_image_path}")
                
                page_data = await extract_questions_from_pdf_page(page_image, page_num)
                system_content = """
                You are a LaTeX expert with deep knowledge of formatting content in JSON. 
                Your task is to fix LaTeX syntax in the question data while maintaining valid JSON structure. Strictly follow the instructions the response format
                """
                
                user_content = f"""
                Review and fix this JSON data to ensure all LaTeX syntax is correct:
                {json.dumps(page_data)}
                
                Important fixes to make:
                - Replace \\n with \\
                - Replace ₹ with \\rupee and whatever special characters are there in the question_text should compile correctly on the frontend
                - Refer to Latex syntax if you need any help
                - Remove any images, diagrams, tables, or flowcharts in the question_text
                - Ensure all backslashes in LaTeX commands are properly escaped for JSON
                
                Return only the corrected JSON with the same structure.
                """
                
                
                
                client = OpenAI(
                    base_url=os.environ["OPENAI_API_BASE"],
                    api_key=os.environ["GITHUB_TOKEN"],
                )
                
                try:
                    response = client.chat.completions.create(
                        messages=[
                            {
                                "role": "system",
                                "content": system_content,
                            },
                            {
                                "role": "user",
                                "content": user_content,
                            }
                        ],
                        model="gpt-4o-mini",
                        temperature=0.2,  # Lower temperature for more consistent output
                        max_tokens=4096,
                        top_p=1
                    )
                    # print(response)
                    
                    if not response or not response.choices or not response.choices[0].message.content:
                        raise ValueError("Empty response from OpenAI API")
                        
                    # Parse the response text
                    response_text = response.choices[0].message.content.strip()
                    
                    # Remove markdown code blocks if present
                    if response_text.startswith("```json") and response_text.endswith("```"):
                        response_text = response_text[7:-3].strip()
                    elif response_text.startswith("```") and response_text.endswith("```"):
                        response_text = response_text[3:-3].strip()
                    
                    try:
                        corrected_data = json.loads(response_text)
                        combined_data["questions"].extend(corrected_data.get("questions", []))
                        combined_data["passages"].extend(corrected_data.get("passages", []))
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON from OpenAI response on page {page_num + 1}: {str(e)}")
                        # If parsing fails, use the original data
                        combined_data["questions"].extend(page_data.get("questions", []))
                        combined_data["passages"].extend(page_data.get("passages", []))
                
                except Exception as e:
                    print(f"Error with OpenAI API on page {page_num + 1}: {str(e)}")
                    # Fallback to original data if OpenAI call fails
                    combined_data["questions"].extend(page_data.get("questions", []))
                    combined_data["passages"].extend(page_data.get("passages", []))

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
