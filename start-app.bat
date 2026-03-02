@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows) - Production Background Mode
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo EHR Lite - Production Launcher (Background Mode)
echo ================================================================================
echo.

REM Check if services are already running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo WARNING: Node.js processes are already running.
    echo Please run stop-services.bat to stop existing services first.
    echo.
    timeout /t 3 /nobreak >nul
    exit /b 1
)

REM ================================================================================
REM 1. Check Node.js
REM ================================================================================
echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo Node.js: !NODE_VER!

REM ================================================================================
REM 2. Dependencies
REM ================================================================================
echo.
echo [2/4] Checking dependencies...

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
REM 3. Setup Directories
REM ================================================================================
echo.
echo [3/4] Setting up directories...
if not exist "data" mkdir data
if not exist "data\patient-images" mkdir "data\patient-images"
if not exist "logs" mkdir logs
echo Directories ready.

REM ================================================================================
REM 4. Build Frontend
REM ================================================================================
echo.
echo [4/4] Checking frontend build...
cd frontend
if not exist ".next" (
    echo Building frontend...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        cd ..
        goto :error
    )
)
cd ..

REM ================================================================================
REM 5. Start Services
REM ================================================================================
echo.
echo Starting services in background...
echo.

REM Create helper batch scripts that properly redirect output
echo @echo off > _backend_run.bat
echo title EHR Backend >> _backend_run.bat
echo cd /d "%~dp0backend" >> _backend_run.bat
echo call npm run dev >> "%~dp0logs\backend.log" 2>>&1 >> _backend_run.bat

echo @echo off > _frontend_run.bat
echo title EHR Frontend >> _frontend_run.bat
echo cd /d "%~dp0frontend" >> _frontend_run.bat
echo set PORT=3000 >> _frontend_run.bat
echo call npm run start >> "%~dp0logs\frontend.log" 2>>&1 >> _frontend_run.bat

REM Start backend (minimized window)
echo Starting backend on port 4000...
start "EHR Backend" /min cmd /c "%~dp0_backend_run.bat"
echo   Backend started...

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend on port 3000...
start "EHR Frontend" /min cmd /c "%~dp0_frontend_run.bat"
echo   Frontend started...

REM Wait for services
timeout /t 8 /nobreak >nul

echo.
echo ================================================================================
echo                       EHR Lite - RUNNING
echo ================================================================================
echo.
echo Services:
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:3000
echo.
echo Logs:
echo   Backend:  logs\backend.log
echo   Frontend: logs\frontend.log
echo.
echo To stop: run stop-services.bat
echo.

REM Verify services
echo Checking services...
timeout /t 2 /nobreak >nul

powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 3|Out-Null;Write-Host '  [OK] Backend responding'-ForegroundColor Green}catch{Write-Host '  [WAIT] Backend starting...'-ForegroundColor Yellow}"

powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3|Out-Null;Write-Host '  [OK] Frontend responding'-ForegroundColor Green}catch{Write-Host '  [WAIT] Frontend starting...'-ForegroundColor Yellow}"

echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo Services running in background windows!
echo You can close this window.
echo.
timeout /t 3 /nobreak >nul

exit /b 0

:error
echo.
echo ERROR: An error occurred.
pause
exit /b 1
