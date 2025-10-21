"""
Railway entry point for ChefCode
This file imports the FastAPI app from Backend/main.py
"""
import sys
import os
from pathlib import Path

# Add Backend directory to Python path
backend_dir = Path(__file__).parent / "Backend"
sys.path.insert(0, str(backend_dir))

# Change to Backend directory so relative imports work
os.chdir(backend_dir)

# Import the FastAPI app
from main import app

# This is what uvicorn will use
__all__ = ['app']
