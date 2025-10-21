@echo off
echo ================================================
echo Pushing ChefCode to New Repository
echo ================================================
echo.

echo Step 1: Committing Railway fixes...
git add .
git commit -m "Fix Railway deployment and prepare for production"
echo.

echo Step 2: Removing old remote...
git remote remove origin
echo.

echo Step 3: Adding new remote (chefcode1.0)...
git remote add origin https://github.com/Mariem-Daha/chefcode1.0.git
echo.

echo Step 4: Checking remote configuration...
git remote -v
echo.

echo Step 5: Pushing to new repository...
git push -u origin main
echo.

echo ================================================
echo Repository pushed successfully!
echo ================================================
echo.
echo Your new repository: https://github.com/Mariem-Daha/chefcode1.0
echo.
echo Next: Deploy on Railway using this new repository
echo See RAILWAY_FIX.md for deployment details
echo ================================================

pause
