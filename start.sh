#!/bin/bash
cd Backend
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
