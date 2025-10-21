"""
Railway entry point for ChefCode
This file imports and runs the FastAPI app from Backend/main.py
"""
import sys
import os
from pathlib import Path

# If run directly, start uvicorn with proper port handling
if __name__ == "__main__":
    import uvicorn
    
    # Get PORT from Railway environment
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting ChefCode Backend on port {port}")
    print(f"📁 Current directory: {os.getcwd()}")
    
    # Start uvicorn - it will handle the imports correctly
    # The key is to run from project root and use Backend.main:app notation
    uvicorn.run(
        "Backend.main:app",
        host="0.0.0.0", 
        port=port,
        log_level="info",
        access_log=True,
        reload=False
    )
