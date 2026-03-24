@echo off
REM Simple batch script to run SignAI backend

cd /d "%~dp0..\"
call .\.venv\Scripts\activate.bat
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
