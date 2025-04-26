from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from apis.Hagrid.main import router as auth_router
from apis.Hermione.main import router as question_extractor_router
from apis.Ron.main import router as paper_generation_router
from apis.Harry.main import router as curriculum_router
from security.main import get_current_user

app = FastAPI(
    title="ExamCraft API",
    description="API for the ExamCraft application",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(question_extractor_router)
app.include_router(paper_generation_router)
app.include_router(curriculum_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to ExamCraft API"}

# Protected test endpoint to verify auth
@app.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {
        "message": "This is a protected route",
        "user": current_user.username
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)