#!/usr/bin/env python3
"""
Railway startup script for ChefCode
Handles directory navigation and starts the FastAPI app
"""
import os
import sys
from pathlib import Path

# Get the directory where this script is located
script_dir = Path(__file__).parent.absolute()
backend_dir = script_dir / "Backend"

print(f"🚀 Starting ChefCode...")
print(f"📁 Script directory: {script_dir}")
print(f"📁 Backend directory: {backend_dir}")
print(f"🐍 Python version: {sys.version}")
print(f"🌐 Port: {os.getenv('PORT', '8000')}")

# Check if Backend directory exists
if not backend_dir.exists():
    print(f"❌ ERROR: Backend directory not found at {backend_dir}")
    print(f"📂 Contents of {script_dir}:")
    for item in script_dir.iterdir():
        print(f"  - {item.name}")
    sys.exit(1)

# Change to Backend directory
os.chdir(backend_dir)
print(f"✅ Changed to Backend directory")
print(f"📂 Backend contents:")
for item in backend_dir.iterdir():
    print(f"  - {item.name}")

# Add Backend to Python path
sys.path.insert(0, str(backend_dir))

# Import and run uvicorn
try:
    import uvicorn
    print(f"✅ Starting uvicorn...")
    
    port = int(os.getenv("PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        timeout_keep_alive=120,
        log_level="info"
    )
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

