@echo off
echo ========================================
echo   ChefCode - Google Cloud Deployment
echo ========================================
echo.

echo This script will deploy ChefCode to Google Cloud Run
echo.
echo Prerequisites:
echo   1. Google Cloud CLI installed (gcloud)
echo   2. Logged in to Google Cloud (gcloud auth login)
echo   3. Project created and set
echo.

pause

echo.
echo Deploying to Google Cloud Run...
echo.

gcloud run deploy chefcode --source . --region us-central1 --platform managed --allow-unauthenticated --port 8080

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app is now live on Google Cloud Run!
echo Check the URL above to access your app.
echo.
echo Next steps:
echo   1. Set environment variables in Cloud Run Console
echo   2. Update frontend with your new backend URL
echo   3. Test at: https://your-url.run.app/health
echo.

pause

