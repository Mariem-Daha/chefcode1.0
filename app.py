"""
Railway entry point for ChefCode
This file imports and runs the FastAPI app from Backend/main.py
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Import the FastAPI app using absolute imports
from Backend.main import app

# This is what uvicorn will use
__all__ = ['app']

# If run directly, start uvicorn with proper port handling
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting ChefCode Backend on port {port}")
    print(f"📁 Project root: {project_root}")
    print(f"📁 Current directory: {os.getcwd()}")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info",
        access_log=True
    )
