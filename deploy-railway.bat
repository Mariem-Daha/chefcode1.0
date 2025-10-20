@echo off
echo ================================================
echo ChefCode - Railway Deployment Preparation
echo ================================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Prepare for Railway deployment"
echo.

echo Step 4: Pushing to GitHub...
git push
echo.

echo ================================================
echo Git preparation complete!
echo ================================================
echo.
echo Next steps:
echo 1. Go to https://railway.app
echo 2. Sign up with GitHub
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose your ChefCode repository
echo 6. Add PostgreSQL database
echo 7. Add environment variables (see RAILWAY_DEPLOY.md)
echo.
echo Your app will be live at: https://[your-project].up.railway.app
echo ================================================

pause
