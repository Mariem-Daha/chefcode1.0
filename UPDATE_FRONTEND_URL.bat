@echo off
echo ========================================
echo   Update Frontend Backend URL
echo ========================================
echo.
echo This script will update your frontend to use your Google Cloud deployment.
echo.
echo First, deploy your app to Google Cloud Run and get the URL.
echo Then run this script with your URL.
echo.

set /p CLOUD_URL="Enter your Google Cloud Run URL (e.g., https://chefcode-xxxxx-uc.a.run.app): "

if "%CLOUD_URL%"=="" (
    echo Error: No URL provided
    pause
    exit /b 1
)

echo.
echo Updating frontend configuration...
echo.

REM Update the main config file
powershell -Command "(Get-Content 'frontend\mobile\assets\config.js') -replace 'https://chefcode-xxxxx-uc.a.run.app', '%CLOUD_URL%' | Set-Content 'frontend\mobile\assets\config.js'"

echo ✅ Updated frontend/mobile/assets/config.js
echo.

REM Check if other config files exist and update them
if exist "frontend\shared\config.js" (
    powershell -Command "(Get-Content 'frontend\shared\config.js') -replace 'https://chefcode.onrender.com', '%CLOUD_URL%' | Set-Content 'frontend\shared\config.js'"
    echo ✅ Updated frontend/shared/config.js
)

if exist "frontend\mobile\src\BackendConfig.js" (
    powershell -Command "(Get-Content 'frontend\mobile\src\BackendConfig.js') -replace 'https://chefcode.onrender.com', '%CLOUD_URL%' | Set-Content 'frontend\mobile\src\BackendConfig.js'"
    echo ✅ Updated frontend/mobile/src/BackendConfig.js
)

echo.
echo ========================================
echo   Frontend URL Updated!
echo ========================================
echo.
echo Your frontend is now configured to use:
echo %CLOUD_URL%
echo.
echo Next steps:
echo   1. Test your frontend
echo   2. Commit and push changes
echo.

pause

