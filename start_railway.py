#!/usr/bin/env python3
"""
Railway startup script for ChefCode
Reads PORT from environment and starts the FastAPI app
"""
import os
import sys

# Add project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    
    # Get PORT from Railway environment variable
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting ChefCode on port {port}")
    
    # Start uvicorn with Backend.main:app
    uvicorn.run(
        "Backend.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )

