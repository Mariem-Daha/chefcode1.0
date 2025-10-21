#!/bin/bash
# Railway start script for ChefCode
cd Backend
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
