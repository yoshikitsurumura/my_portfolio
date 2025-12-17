@echo off
echo ====================================
echo   CraneAI Portfolio Server
echo ====================================
echo.
echo Starting local server on http://localhost:8001
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0.."
python -m http.server 8001

