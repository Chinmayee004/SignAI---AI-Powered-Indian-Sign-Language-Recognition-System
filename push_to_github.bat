@echo off
REM SignAI GitHub Push Script - Windows Batch
REM This script pushes the SignAI project to GitHub

cd /d "%~dp0"

echo ============================================
echo   SignAI GitHub Push - Windows Script
echo ============================================
echo.

echo [1] Removing stale git lock if present...
if exist ".git\index.lock" (
    del /f /q ".git\index.lock" 2>nul
    echo    Lock file removed
)

echo [2] Initializing/Resetting git repository...
git init
git config user.email "signai@example.com"
git config user.name "SignAI"

echo [3] Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git

echo [4] Staging all project files...
git add -A

echo [5] Git status:
git status --short

echo.
echo [6] Creating initial commit...
git commit -m "Initial commit: SignAI - AI-Powered Indian Sign Language Recognition System"

echo.
echo [7] Pushing to GitHub main branch...
echo.
echo    Authenticating with GitHub (you may be prompted for credentials)...
echo.
git push -u origin HEAD:main

echo.
echo ============================================
if %errorlevel% equ 0 (
    echo    SUCCESS! Project pushed to GitHub
) else (
    echo    ⚠  Push encountered issues
    echo    Check if you need to authenticate or configure SSH
)
echo ============================================
echo.
pause
