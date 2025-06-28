@echo off
REM Lotus Direct Care Policy Manual - Deployment Script for Windows
REM This script helps deploy the policy manual to Netlify

echo =====================================
echo Lotus Direct Care Policy Manual
echo Deployment Script
echo =====================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if netlify-cli is installed
where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Netlify CLI...
    call npm install -g netlify-cli
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Check for .env file
if not exist .env (
    echo.
    echo Warning: .env file not found!
    echo Please create a .env file with your Google credentials.
    echo See .env.example for the template.
    echo.
    set /p continue="Do you want to continue without .env? (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

REM Initialize Netlify site
echo.
echo Initializing Netlify site...
call netlify init

REM Deploy to Netlify
echo.
echo Deploying to Netlify...
call netlify deploy --prod

echo.
echo =====================================
echo Deployment Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Go to your Netlify dashboard
echo 2. Add environment variables:
echo    - GOOGLE_SERVICE_ACCOUNT_KEY
echo    - COMPLIANCE_SPREADSHEET_ID
echo 3. Redeploy from Netlify dashboard
echo.
echo For detailed instructions, see GOOGLE_WORKSPACE_SETUP.md
pause