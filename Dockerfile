# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy Backend requirements and install dependencies
COPY Backend/requirements.txt /app/Backend/requirements.txt
RUN pip install --no-cache-dir -r Backend/requirements.txt

# Copy the entire project
COPY . /app

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8080

# Change to Backend directory and run the app
CMD cd Backend && uvicorn main:app --host 0.0.0.0 --port ${PORT}
