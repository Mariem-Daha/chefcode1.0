"""
ChefCode - Combined FastAPI app for Hugging Face Spaces
Serves both backend API and frontend from a single application
"""

import os
import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add backend to Python path
sys.path.append(str(Path(__file__).parent / "backend"))

# Import backend components
from backend.database import SessionLocal, engine
import backend.models
from backend.routes import inventory, recipes, tasks, data, actions, web_recipes, ai_assistant

# Create database tables
backend.models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="ChefCode - AI Restaurant Management",
    description="AI-powered restaurant inventory and recipe management system",
    version="1.0.0"
)

# CORS configuration for Hugging Face Spaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include backend API routes
app.include_router(inventory.router, prefix="/api", tags=["inventory"])
app.include_router(recipes.router, prefix="/api", tags=["recipes"]) 
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(data.router, prefix="/api", tags=["data"])
app.include_router(actions.router, prefix="/api", tags=["actions"])
app.include_router(web_recipes.router, prefix="/api/web-recipes", tags=["web-recipes"])
app.include_router(ai_assistant.router, prefix="/api/ai-assistant", tags=["ai-assistant"])

# Mount static files (frontend)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "ChefCode API is running"}

# Root endpoint - serve the main HTML file
@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    return FileResponse("frontend/index.html")

# Catch-all route for frontend routing (SPA support)
@app.get("/{full_path:path}")
async def serve_frontend_routes(full_path: str):
    # If it's an API call, let FastAPI handle it
    if full_path.startswith("api/"):
        return {"error": "API endpoint not found"}
    
    # For all other routes, serve the frontend
    return FileResponse("frontend/index.html")

# Update frontend config for Hugging Face Spaces
def update_frontend_config():
    """Update frontend configuration for Hugging Face Spaces deployment"""
    config_file = Path("frontend/config.js")
    if config_file.exists():
        config_content = config_file.read_text()
        
        # Update API URL to use the current domain
        updated_content = config_content.replace(
            "API_URL: 'http://localhost:8000'",
            "API_URL: window.location.origin"
        )
        
        config_file.write_text(updated_content)

# Update config on startup
update_frontend_config()

if __name__ == "__main__":
    # Get port from environment (Hugging Face Spaces sets this)
    port = int(os.getenv("PORT", 7860))
    
    # Run the application
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
