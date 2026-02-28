@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows)
REM Starts both backend and frontend servers with all prerequisites
REM ================================================================================

setlocal EnableDelayedExpansion

REM Colors for Windows 10+ (if supported)
set "INFO=[91m"
set "SUCCESS=[92m"
set "WARNING=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "RESET=[0m"

echo ================================================================================
echo EHR Lite - Local First Electronic Health Record System
echo ================================================================================
echo.

REM ================================================================================
REM 1. Check and Install Node.js
REM ================================================================================
echo [1/6] Checking Node.js installation...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Attempting to install via winget...

    REM Try winget first (Windows 10+)
    winget list OpenJS.NodeJS >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo Node.js is already installed via winget but not in PATH. Please restart your terminal.
        pause
        exit /b 1
    )

    REM Try to install Node.js using winget
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements -h
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ================================================================================
        echo Node.js installed successfully!
        echo IMPORTANT: Please CLOSE this window and open a NEW terminal window,
        echo then run this script again.
        echo ================================================================================
        pause
        exit /b 0
    ) else (
        echo.
        echo Failed to install Node.js automatically.
        echo Please install Node.js manually from: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo Node.js is installed: !NODE_VER!
    echo npm is installed: !NPM_VER!
)

REM ================================================================================
REM 2. Check and Install Dependencies
REM ================================================================================
echo.
echo [2/6] Checking and installing dependencies...

REM Backend dependencies
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo Backend dependencies installed.
) else (
    echo Backend dependencies already installed.
)

REM Frontend dependencies
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo Frontend dependencies installed.
) else (
    echo Frontend dependencies already installed.
)

REM ================================================================================
REM 3. Ensure Data Directory Exists
REM ================================================================================
echo.
echo [3/6] Ensuring data directory exists...
if not exist "data" mkdir data
if not exist "data\patient-images" mkdir "data\patient-images"
echo Data directories ready.

REM ================================================================================
REM 4. Initialize Database
REM ================================================================================
echo.
echo [4/6] Checking database...
cd backend
if not exist "..\data\database.db" (
    echo Creating database...
    call npm run init-db
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Database initialization had issues
    )
    echo Database created.
) else (
    echo Database already exists.
)
cd ..

REM ================================================================================
REM 5. Start Iriun Webcam
REM ================================================================================
echo.
echo [5/6] Starting Iriun Webcam...

REM Common paths for Iriun Webcam
set "IRIUN_FOUND=0"

REM Check Program Files
if exist "C:\Program Files\IriunWebcam\IriunWebcam.exe" (
    set "IRIUN_PATH=C:\Program Files\IriunWebcam\IriunWebcam.exe"
    set "IRIUN_FOUND=1"
)

REM Check Program Files (x86)
if exist "C:\Program Files (x86)\IriunWebcam\IriunWebcam.exe" (
    set "IRIUN_PATH=C:\Program Files (x86)\IriunWebcam\IriunWebcam.exe"
    set "IRIUN_FOUND=1"
)

REM Check AppData\Local
if exist "%LOCALAPPDATA%\IriunWebcam\IriunWebcam.exe" (
    set "IRIUN_PATH=%LOCALAPPDATA%\IriunWebcam\IriunWebcam.exe"
    set "IRIUN_FOUND=1"
)

REM Check user profiles
for %%D in ("%USERPROFILE%\Desktop", "%USERPROFILE%\Downloads", "%USERPROFILE%\Applications") do (
    if exist "%%~D\IriunWebcam.exe" (
        set "IRIUN_PATH=%%~D\IriunWebcam.exe"
        set "IRIUN_FOUND=1"
    )
)

REM Check if already running
tasklist /FI "IMAGENAME eq IriunWebcam.exe" 2>NUL | find /I /N "IriunWebcam.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Iriun Webcam is already running.
) else (
    if "!IRIUN_FOUND!"=="1" (
        echo Found Iriun Webcam at: !IRIUN_PATH!
        echo Starting Iriun Webcam in background...
        start "" "!IRIUN_PATH!" >nul 2>&1

        REM Wait a bit and check if it started
        timeout /t 3 /nobreak >nul

        tasklist /FI "IMAGENAME eq IriunWebcam.exe" 2>NUL | find /I /N "IriunWebcam.exe">NUL
        if "%ERRORLEVEL%"=="0" (
            echo Iriun Webcam started successfully!
        ) else (
            echo Iriun Webcam was launched but may not be running yet.
        )
    ) else (
        echo Iriun Webcam not found. Please install it from https://iriun.com/
        echo Camera features may not work without it.
    )
)

REM ================================================================================
REM 6. Start Servers
REM ================================================================================
echo.
echo [6/6] Starting servers...
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each server window to stop that server
echo.

REM Create logs directory
if not exist "logs" mkdir logs

REM Start backend in new window
start "EHR Lite Backend" cmd /k "title EHR Lite Backend && cd backend && echo Starting backend server... && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "EHR Lite Frontend" cmd /k "title EHR Lite Frontend && cd frontend && echo Starting frontend server... && npm run dev"

REM Wait for frontend to be ready
echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ================================================================================
echo Servers started successfully!
echo ================================================================================
echo.
echo Server Status:
echo   Backend:  Running in separate window
echo   Frontend: Running in separate window
echo.
echo Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ================================================================================
echo EHR Lite is running!
echo ================================================================================
echo.
echo Two server windows have been opened:
echo   - EHR Lite Backend (port 4000)
echo   - EHR Lite Frontend (port 3000)
echo.
echo Your browser should have opened automatically.
echo.
echo Close this window to keep servers running.
echo Close the SERVER windows to stop the application.
echo.
pause
