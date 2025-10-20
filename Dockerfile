# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY Backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY Backend/ ./backend/

# Copy frontend assets
COPY frontend/mobile/assets/ ./frontend/

# Create a simple HTTP server for frontend
RUN pip install aiofiles

# Create a combined FastAPI app that serves both API and frontend
COPY app.py .

# Expose port (Hugging Face Spaces will set PORT environment variable)
EXPOSE 7860

# Set environment variables
ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./chefcode.db

# Run the application
CMD ["python", "app.py"]
