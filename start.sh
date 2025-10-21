#!/bin/bash
# Railway start script for ChefCode
set -e  # Exit on error

echo "🚀 Starting ChefCode..."
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Port: ${PORT:-8000}"

cd Backend
echo "Changed to Backend directory: $(pwd)"
echo "Contents: $(ls -la)"

echo "Starting uvicorn..."
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --timeout-keep-alive 120
