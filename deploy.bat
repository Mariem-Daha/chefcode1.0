@echo off
REM ChefCode Quick Deployment Script for Windows
REM This script prepares your app for deployment

echo.
echo 🍳 ChefCode Deployment Preparation
echo ==================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo # Python
        echo __pycache__/
        echo *.py[cod]
        echo *$py.class
        echo *.so
        echo .Python
        echo env/
        echo venv/
        echo Backend/venv/
        echo *.egg-info/
        echo dist/
        echo build/
        echo.
        echo # Database
        echo *.db
        echo *.sqlite
        echo *.sqlite3
        echo Backend/chefcode.db
        echo.
        echo # Environment
        echo .env
        echo .env.local
        echo Backend/.env
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo *~
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Node
        echo node_modules/
        echo frontend/mobile/node_modules/
        echo.
        echo # Android
        echo frontend/mobile/android/build/
        echo frontend/mobile/android/app/build/
        echo *.apk
        echo.
        echo # Logs
        echo *.log
        echo logs/
        echo.
        echo # Secrets
        echo google-service-account.json
        echo Backend/google-service-account.json
    ) > .gitignore
    echo ✅ .gitignore created
)

REM Add all files
echo 📦 Adding files to Git...
git add .

REM Show status
echo.
echo 📊 Git Status:
git status --short

echo.
echo ✅ Deployment preparation complete!
echo.
echo 🚀 Next steps:
echo 1. Commit changes:
echo    git commit -m "Ready for deployment"
echo.
echo 2. Create GitHub repository at https://github.com/new
echo.
echo 3. Push to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/chefcode.git
echo    git push -u origin main
echo.
echo 4. Deploy on Render:
echo    - Go to https://render.com
echo    - Click 'New' → 'Blueprint'
echo    - Connect your GitHub repo
echo    - Add OPENAI_API_KEY in environment variables
echo.
echo 📖 See DEPLOY_NOW.md for detailed instructions
echo.
pause
