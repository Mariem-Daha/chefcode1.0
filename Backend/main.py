from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Configure logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    logger.info("Importing database and models...")
    from database import SessionLocal, engine
    import models
    
    logger.info("Importing routes...")
    from routes import inventory, recipes, tasks, data, actions, ocr, web_recipes, ai_assistant
    
    logger.info("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created successfully")
except Exception as e:
    logger.error(f"❌ Initialization error: {str(e)}", exc_info=True)
    import traceback
    traceback.print_exc()
    raise

app = FastAPI(
    title="ChefCode Backend",
    description="FastAPI backend for ChefCode inventory management system",
    version="1.0.0"
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 ChefCode Backend is starting up...")
    logger.info(f"📊 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"🔌 Port: {os.getenv('PORT', '8000')}")
    logger.info(f"💾 Database: {os.getenv('DATABASE_URL', 'sqlite:///./chefcode.db')[:50]}...")
    logger.info("✅ Application startup complete")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("⚠️ ChefCode Backend is shutting down...")

# CORS configuration to allow frontend connections
# In production, replace with specific frontend URLs
# Allow all origins for development (includes file:// protocol and localhost)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",") if os.getenv("ALLOWED_ORIGINS") != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Include routers
logger.info("Registering API routes...")
app.include_router(inventory.router, prefix="/api", tags=["inventory"])
app.include_router(recipes.router, prefix="/api", tags=["recipes"]) 
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(data.router, prefix="/api", tags=["data"])
app.include_router(actions.router, prefix="/api", tags=["actions"])
app.include_router(ocr.router, prefix="/api", tags=["ocr"])
app.include_router(web_recipes.router, prefix="/api/web-recipes", tags=["web-recipes"])
app.include_router(ai_assistant.router, prefix="/api/ai-assistant", tags=["ai-assistant"])
logger.info("✅ All routes registered")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# Health check endpoint (must be before static files)
@app.get("/health")
def health():
    return {"status": "ok"}

# Check if frontend directory exists (for production deployment)
frontend_path = Path(__file__).parent.parent / "frontend" / "mobile" / "assets"
if frontend_path.exists():
    # Mount static files for production
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")
    
    # Serve index.html for root and catch-all routes
    @app.get("/")
    async def serve_frontend():
        return FileResponse(str(frontend_path / "index.html"))
    
    # Catch-all route for frontend SPA routing (must be last)
    @app.get("/{full_path:path}")
    async def serve_frontend_routes(full_path: str):
        # If it's an API call that doesn't exist, return 404
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if file exists in static directory
        file_path = frontend_path / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        
        # For all other routes, serve index.html (SPA routing)
        return FileResponse(str(frontend_path / "index.html"))
else:
    # Fallback for development when frontend is not in expected location
    @app.get("/")
    async def root():
        return {"message": "ChefCode FastAPI Backend", "version": "1.0.0", "docs": "/docs"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("Backend.main:app", host="0.0.0.0", port=port)