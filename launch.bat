@echo off
title ClaimDesk - Insurance Platform
color 0B

echo.
echo  ================================================
echo    ClaimDesk Insurance Platform - Launcher
echo  ================================================
echo.

REM ── 1. Backend API (Node/Express) on port 4000 ──────────────────────────────
echo  [1/3] Starting Backend API  (port 4000)...
start "ClaimDesk Backend" cmd /k "cd /d %~dp0backend && npm run dev"

REM Wait 3 seconds using ping (works in all Windows shells)
ping -n 4 127.0.0.1 > nul

REM ── 2. ML Service (FastAPI/Python) on port 8000 ─────────────────────────────
echo  [2/3] Starting ML Service   (port 8000)...
start "ClaimDesk ML Service" cmd /k "cd /d %~dp0ml-service && python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"

ping -n 5 127.0.0.1 > nul

REM ── 3. Frontend (Vite) on port 5173 ─────────────────────────────────────────
echo  [3/3] Starting Frontend     (port 5173)...
start "ClaimDesk Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

ping -n 6 127.0.0.1 > nul

echo.
echo  ================================================
echo    All three services are running!
echo.
echo    Frontend   :  http://localhost:5173
echo    Backend    :  http://localhost:4000
echo    ML Service :  http://localhost:8000
echo    ML Docs    :  http://localhost:8000/docs
echo.
echo    Close the three terminal windows to stop.
echo  ================================================
echo.

start "" "http://localhost:5173"

echo  Browser opened. You can close this window.
echo.
pause
