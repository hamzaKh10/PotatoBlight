@echo off
echo ==========================================
echo Starting PotatoSite backend and frontend...
echo ==========================================

cd /d "%~dp0backend"

if not exist ".venv\" (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing required Python packages (this may take a moment on first run)...
pip install -r requirements.txt

echo Starting backend server in a new window...
start cmd /k "title PotatoSite Backend API & uvicorn app:app --reload --host 127.0.0.1 --port 8000"

echo Opening Frontend in your default browser...
cd /d "%~dp0frontend"
timeout /t 3 /nobreak > nul
start index.html

echo ==========================================
echo Done! 
echo Keep the other black window open. That is the AI Backend running.
echo You can test the website in your browser now.
echo ==========================================
pause
