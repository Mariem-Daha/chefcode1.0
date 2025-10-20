@echo off
echo ========================================
echo   ChefCode FastAPI Backend Starter
echo ========================================
echo.

cd /d "%~dp0Backend"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo.
echo Installing/Updating dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting FastAPI Backend...
echo   Port: 8000
echo   API Docs: http://localhost:8000/docs
echo   Health: http://localhost:8000/health
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
