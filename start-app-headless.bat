@echo off
REM ================================================================================
REM EHR Lite - Headless Windows Launcher
REM Runs completely invisible - no terminal windows
REM Auto-detects git changes, rebuilds, runs migrations
REM ================================================================================

setlocal EnableDelayedExpansion

REM --- Project root ---
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

REM --- Log file ---
if not exist "%ROOT%\logs" mkdir "%ROOT%\logs"
set "LOG=%ROOT%\logs\startup.log"
set "TIMESTAMP=%date% %time:~0,8%"

echo. >> "%LOG%" 2>&1
echo ================================================================================ >> "%LOG%" 2>&1
echo [%TIMESTAMP%] EHR Lite Headless Startup >> "%LOG%" 2>&1
echo ================================================================================ >> "%LOG%" 2>&1

REM ================================================================================
REM 0. Kill any existing instances on our ports
REM ================================================================================
echo [%TIMESTAMP%] Stopping existing services... >> "%LOG%" 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >> "%LOG%" 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >> "%LOG%" 2>&1
timeout /t 2 /nobreak >nul

REM ================================================================================
REM 1. Check Node.js
REM ================================================================================
echo [%TIMESTAMP%] Checking Node.js... >> "%LOG%" 2>&1
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [%TIMESTAMP%] ERROR: Node.js not found >> "%LOG%" 2>&1
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [%TIMESTAMP%] Node.js: %NODE_VER% >> "%LOG%" 2>&1

REM ================================================================================
REM 2. Setup Directories
REM ================================================================================
if not exist "%ROOT%\data" mkdir "%ROOT%\data"
if not exist "%ROOT%\data\patient-images" mkdir "%ROOT%\data\patient-images"
if not exist "%ROOT%\logs" mkdir "%ROOT%\logs"

REM ================================================================================
REM 3. Install Dependencies (always run to catch missing packages)
REM ================================================================================
echo [%TIMESTAMP%] Installing dependencies... >> "%LOG%" 2>&1
cd /d "%ROOT%\backend"
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
cd /d "%ROOT%\frontend"
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
cd /d "%ROOT%"
echo [%TIMESTAMP%] Dependencies installed >> "%LOG%" 2>&1

REM ================================================================================
REM 4. Run Database Migrations (always run - uses CREATE IF NOT EXISTS)
REM ================================================================================
echo [%TIMESTAMP%] Running database migrations... >> "%LOG%" 2>&1
cd /d "%ROOT%\backend"
call npm run init-db >> "%LOG%" 2>&1
cd /d "%ROOT%"
echo [%TIMESTAMP%] Database migrations complete >> "%LOG%" 2>&1

REM ================================================================================
REM 5. Git Change Detection & Auto-Rebuild
REM ================================================================================
echo [%TIMESTAMP%] Checking for code changes... >> "%LOG%" 2>&1

set "REBUILD_FRONTEND=0"
set "REBUILD_BACKEND=0"
set "CURRENT_HASH="
set "LAST_HASH="

if exist "%ROOT%\.last-build-hash" set /p LAST_HASH=<"%ROOT%\.last-build-hash"
for /f "tokens=*" %%h in ('git -C "%ROOT%" rev-parse HEAD 2^>nul') do set CURRENT_HASH=%%h

if not defined CURRENT_HASH (
    echo [%TIMESTAMP%] Not a git repo, skipping change detection >> "%LOG%" 2>&1
    goto :skip_git
)

if not defined LAST_HASH (
    echo [%TIMESTAMP%] First run, building everything >> "%LOG%" 2>&1
    set "REBUILD_FRONTEND=1"
    set "REBUILD_BACKEND=1"
    goto :do_build
)

if "%LAST_HASH%"=="%CURRENT_HASH%" (
    echo [%TIMESTAMP%] No git changes detected (%CURRENT_HASH:~0,8%) >> "%LOG%" 2>&1
    goto :skip_build
)

echo [%TIMESTAMP%] Git changes detected: %LAST_HASH:~0,8% =^> %CURRENT_HASH:~0,8% >> "%LOG%" 2>&1

for /f %%c in ('git -C "%ROOT%" diff --name-only "%LAST_HASH%" "%CURRENT_HASH%" -- frontend/ 2^>nul ^| find /c /v ""') do set FE_CHANGED=%%c
if %FE_CHANGED% GTR 0 (
    echo [%TIMESTAMP%] Frontend changes detected (%FE_CHANGED% files) >> "%LOG%" 2>&1
    set "REBUILD_FRONTEND=1"
)

for /f %%c in ('git -C "%ROOT%" diff --name-only "%LAST_HASH%" "%CURRENT_HASH%" -- backend/ 2^>nul ^| find /c /v ""') do set BE_CHANGED=%%c
if %BE_CHANGED% GTR 0 (
    echo [%TIMESTAMP%] Backend changes detected (%BE_CHANGED% files) >> "%LOG%" 2>&1
    set "REBUILD_BACKEND=1"
)

for /f %%c in ('git -C "%ROOT%" diff --name-only "%LAST_HASH%" "%CURRENT_HASH%" -- backend/src/db/ 2^>nul ^| find /c /v ""') do set DB_CHANGED=%%c
if %DB_CHANGED% GTR 0 (
    echo [%TIMESTAMP%] Database schema changes detected, re-running migrations >> "%LOG%" 2>&1
    cd /d "%ROOT%\backend"
    call npm run init-db >> "%LOG%" 2>&1
    cd /d "%ROOT%"
)

:do_build
if "%REBUILD_FRONTEND%"=="1" (
    echo [%TIMESTAMP%] Rebuilding frontend... >> "%LOG%" 2>&1
    cd /d "%ROOT%\frontend"
    if exist ".next" rmdir /s /q ".next" 2>nul
    call npm run build >> "%LOG%" 2>&1
    cd /d "%ROOT%"
    echo [%TIMESTAMP%] Frontend build complete >> "%LOG%" 2>&1
)

if "%REBUILD_BACKEND%"=="1" (
    echo [%TIMESTAMP%] Reinstalling backend dependencies... >> "%LOG%" 2>&1
    cd /d "%ROOT%\backend"
    call npm install --no-audit --no-fund >> "%LOG%" 2>&1
    cd /d "%ROOT%"
    echo [%TIMESTAMP%] Backend deps updated >> "%LOG%" 2>&1
)

:skip_git
REM Always check if frontend build exists
if not exist "%ROOT%\frontend\.next\BUILD_ID" (
    echo [%TIMESTAMP%] No valid frontend build found, building... >> "%LOG%" 2>&1
    cd /d "%ROOT%\frontend"
    if exist ".next" rmdir /s /q ".next" 2>nul
    call npm run build >> "%LOG%" 2>&1
    cd /d "%ROOT%"
)

:skip_build
if defined CURRENT_HASH echo %CURRENT_HASH%> "%ROOT%\.last-build-hash"

REM ================================================================================
REM 6. Create helper scripts for hidden service launch
REM ================================================================================
echo [%TIMESTAMP%] Creating service launchers... >> "%LOG%" 2>&1

echo @echo off > "%ROOT%\logs\_run_backend.bat"
echo cd /d "%ROOT%\backend" >> "%ROOT%\logs\_run_backend.bat"
echo call npm run dev >> "%ROOT%\logs\backend.log" 2>&1 >> "%ROOT%\logs\_run_backend.bat"

echo @echo off > "%ROOT%\logs\_run_frontend.bat"
echo cd /d "%ROOT%\frontend" >> "%ROOT%\logs\_run_frontend.bat"
echo set PORT=3000 >> "%ROOT%\logs\_run_frontend.bat"
echo call npm run start >> "%ROOT%\logs\frontend.log" 2>&1 >> "%ROOT%\logs\_run_frontend.bat"

REM ================================================================================
REM 7. Start Services (Completely Hidden - No Windows)
REM ================================================================================
echo [%TIMESTAMP%] Starting backend... >> "%LOG%" 2>&1
powershell -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"%ROOT%\logs\_run_backend.bat\"' -WindowStyle Hidden" >> "%LOG%" 2>&1

REM Wait for backend to be ready
echo [%TIMESTAMP%] Waiting for backend... >> "%LOG%" 2>&1
set BE_READY=0
for /L %%i in (1,1,30) do (
    if !BE_READY!==0 (
        powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 2 -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
        if !ERRORLEVEL!==0 (
            set BE_READY=1
            echo [%TIMESTAMP%] Backend ready after %%i seconds >> "%LOG%" 2>&1
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)
if %BE_READY%==0 echo [%TIMESTAMP%] WARNING: Backend did not start within 30s >> "%LOG%" 2>&1

echo [%TIMESTAMP%] Starting frontend... >> "%LOG%" 2>&1
powershell -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"%ROOT%\logs\_run_frontend.bat\"' -WindowStyle Hidden" >> "%LOG%" 2>&1

REM Wait for frontend to be ready
echo [%TIMESTAMP%] Waiting for frontend... >> "%LOG%" 2>&1
set FE_READY=0
for /L %%i in (1,1,30) do (
    if !FE_READY!==0 (
        powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 2 -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
        if !ERRORLEVEL!==0 (
            set FE_READY=1
            echo [%TIMESTAMP%] Frontend ready after %%i seconds >> "%LOG%" 2>&1
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)
if %FE_READY%==0 echo [%TIMESTAMP%] WARNING: Frontend did not start within 30s >> "%LOG%" 2>&1

REM ================================================================================
REM 8. Open Browser
REM ================================================================================
echo [%TIMESTAMP%] Opening browser... >> "%LOG%" 2>&1
start "" "http://localhost:3000"

echo [%TIMESTAMP%] EHR Lite started successfully >> "%LOG%" 2>&1
echo [%TIMESTAMP%] Backend:  http://localhost:4000 >> "%LOG%" 2>&1
echo [%TIMESTAMP%] Frontend: http://localhost:3000 >> "%LOG%" 2>&1
echo [%TIMESTAMP%] Logs: %ROOT%\logs\ >> "%LOG%" 2>&1

exit /b 0
