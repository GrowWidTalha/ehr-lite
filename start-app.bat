@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows) - Hidden Background Mode
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo EHR Lite - Production Launcher
echo ================================================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed.
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

REM Get script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM ================================================================================
REM 1. Dependencies
REM ================================================================================
echo [1/4] Checking dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install --silent --no-audit --no-fund
    cd ..
)
echo Backend dependencies OK.

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --silent --no-audit --no-fund
    cd ..
)
echo Frontend dependencies OK.

REM ================================================================================
REM 2. Setup Directories
REM ================================================================================
echo.
echo [2/4] Setting up directories...
if not exist "data" mkdir data
if not exist "data\patient-images" mkdir "data\patient-images"
if not exist "logs" mkdir logs
echo Directories ready.

REM ================================================================================
REM 3. Build Frontend
REM ================================================================================
echo.
echo [3/4] Checking frontend build...
cd frontend
if not exist ".next" (
    echo Building frontend...
    call npm run build
)
cd ..

REM ================================================================================
REM 4. Start Services (Hidden in Background)
REM ================================================================================
echo.
echo [4/4] Starting services in background...
echo.

REM Create helper scripts that will run the services
echo @echo off > _run_backend.bat
echo cd /d "%SCRIPT_DIR%backend" >> _run_backend.bat
echo npm run dev 2^>^&1 >> "%SCRIPT_DIR%logs\backend.log"

echo @echo off > _run_frontend.bat
echo cd /d "%SCRIPT_DIR%frontend" >> _run_frontend.bat
echo set PORT=3000 >> _run_frontend.bat
echo npm run start 2^>^&1 >> "%SCRIPT_DIR%logs\frontend.log"

REM Start backend in hidden window
echo Starting backend on port 4000...
powershell -Command "Start-Process cmd -ArgumentList '/c \"%SCRIPT_DIR%_run_backend.bat\"' -WindowStyle Hidden"
echo   Backend started in background...

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend in hidden window
echo Starting frontend on port 3000...
powershell -Command "Start-Process cmd -ArgumentList '/c \"%SCRIPT_DIR%_run_frontend.bat\"' -WindowStyle Hidden"
echo   Frontend started in background...

REM Wait for services
timeout /t 8 /nobreak >nul

echo.
echo ================================================================================
echo                       EHR Lite - RUNNING
echo ================================================================================
echo.
echo Services are running in the background (no visible windows):
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:3000
echo.
echo Logs:
echo   Backend:  logs\backend.log
echo   Frontend: logs\frontend.log
echo.
echo To stop: run stop-services.bat
echo.

REM Check services
echo Checking services...
timeout /t 2 /nobreak >nul

powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 3|Out-Null;Write-Host '[OK] Backend responding'-ForegroundColor Green}catch{Write-Host '[WAIT] Backend starting...'-ForegroundColor Yellow}"

powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3|Out-Null;Write-Host '[OK] Frontend responding'-ForegroundColor Green}catch{Write-Host '[WAIT] Frontend starting...'-ForegroundColor Yellow}"

echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo Press any key to close this window...
echo (Services will continue running in background)
pause >nul

REM Cleanup helper files
del _run_backend.bat 2>nul
del _run_frontend.bat 2>nul

exit /b 0
