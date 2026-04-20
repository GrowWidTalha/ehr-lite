@echo off
REM ================================================================================
REM EHR Lite - Headless Windows Launcher
REM Runs completely invisible - no terminal windows
REM Auto-detects git changes, rebuilds, runs migrations
REM ================================================================================

setlocal EnableDelayedExpansion

REM --- Project root ---
set "ROOT=%~dp0"
REM Remove trailing backslash
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
echo [%TIMESTAMP%] Checking for existing services... >> "%LOG%" 2>&1

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
REM 3. Install Dependencies (if missing)
REM ================================================================================
echo [%TIMESTAMP%] Checking dependencies... >> "%LOG%" 2>&1

if not exist "%ROOT%\backend\node_modules" (
    echo [%TIMESTAMP%] Installing backend dependencies... >> "%LOG%" 2>&1
    cd /d "%ROOT%\backend"
    call npm install --silent --no-audit --no-fund >> "%LOG%" 2>&1
    cd /d "%ROOT%"
)

if not exist "%ROOT%\frontend\node_modules" (
    echo [%TIMESTAMP%] Installing frontend dependencies... >> "%LOG%" 2>&1
    cd /d "%ROOT%\frontend"
    call npm install --silent --no-audit --no-fund >> "%LOG%" 2>&1
    cd /d "%ROOT%"
)

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

REM --- Read last known commit hash ---
set "LAST_HASH="
if exist "%ROOT%\.last-build-hash" (
    set /p LAST_HASH=<"%ROOT%\.last-build-hash"
)

REM --- Get current HEAD ---
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

REM --- Check what changed between last build and now ---
echo [%TIMESTAMP%] Git changes detected: %LAST_HASH:~0,8% -^> %CURRENT_HASH:~0,8% >> "%LOG%" 2>&1

REM Check if frontend files changed
for /f %%c in ('git -C "%ROOT%" diff --name-only "%LAST_HASH%" "%CURRENT_HASH%" -- frontend/ 2^>nul ^| find /c /v ""') do set FE_CHANGED=%%c
if %FE_CHANGED% GTR 0 (
    echo [%TIMESTAMP%] Frontend changes detected (%FE_CHANGED% files) >> "%LOG%" 2>&1
    set "REBUILD_FRONTEND=1"
)

REM Check if backend files changed
for /f %%c in ('git -C "%ROOT%" diff --name-only "%LAST_HASH%" "%CURRENT_HASH%" -- backend/ 2^>nul ^| find /c /v ""') do set BE_CHANGED=%%c
if %BE_CHANGED% GTR 0 (
    echo [%TIMESTAMP%] Backend changes detected (%BE_CHANGED% files) >> "%LOG%" 2>&1
    set "REBUILD_BACKEND=1"
)

REM Check if schema changed
for /f %%c in ('git -C "%ROOT%" diff --name-only "%LAST_HASH%" "%CURRENT_HASH%" -- backend/src/db/ 2^>nul ^| find /c /v ""') do set DB_CHANGED=%%c
if %DB_CHANGED% GTR 0 (
    echo [%TIMESTAMP%] Database schema changes detected, re-running migrations >> "%LOG%" 2>&1
    cd /d "%ROOT%\backend"
    call npm run init-db >> "%LOG%" 2>&1
    cd /d "%ROOT%"
)

:do_build
REM --- Rebuild frontend if needed ---
if "%REBUILD_FRONTEND%"=="1" (
    echo [%TIMESTAMP%] Rebuilding frontend... >> "%LOG%" 2>&1
    cd /d "%ROOT%\frontend"
    if exist ".next" rmdir /s /q ".next" 2>nul
    call npm run build >> "%LOG%" 2>&1
    cd /d "%ROOT%"
    echo [%TIMESTAMP%] Frontend build complete >> "%LOG%" 2>&1
)

REM --- Rebuild backend deps if needed ---
if "%REBUILD_BACKEND%"=="1" (
    echo [%TIMESTAMP%] Reinstalling backend dependencies... >> "%LOG%" 2>&1
    cd /d "%ROOT%\backend"
    call npm install --silent --no-audit --no-fund >> "%LOG%" 2>&1
    cd /d "%ROOT%"
    echo [%TIMESTAMP%] Backend deps updated >> "%LOG%" 2>&1
)

:skip_git
REM Also check if frontend was never built
if not exist "%ROOT%\frontend\.next" (
    echo [%TIMESTAMP%] No frontend build found, building... >> "%LOG%" 2>&1
    cd /d "%ROOT%\frontend"
    call npm run build >> "%LOG%" 2>&1
    cd /d "%ROOT%"
)

:skip_build
REM --- Save current hash as last build ---
if defined CURRENT_HASH (
    echo %CURRENT_HASH%> "%ROOT%\.last-build-hash"
)

REM ================================================================================
REM 6. Start Services (Completely Hidden - No Windows)
REM ================================================================================
echo [%TIMESTAMP%] Starting services... >> "%LOG%" 2>&1

REM --- Start backend hidden ---
powershell -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c cd /d \"%ROOT%\backend\" && npm run dev >> \"%ROOT%\logs\backend.log\" 2>&1' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id" > "%ROOT%\.backend.winpid" 2>&1

echo [%TIMESTAMP%] Backend starting... >> "%LOG%" 2>&1

REM Wait for backend
timeout /t 6 /nobreak >nul

REM --- Start frontend hidden ---
powershell -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c cd /d \"%ROOT%\frontend\" && set PORT=3000 && npm run start >> \"%ROOT%\logs\frontend.log\" 2>&1' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id" > "%ROOT%\.frontend.winpid" 2>&1

echo [%TIMESTAMP%] Frontend starting... >> "%LOG%" 2>&1

REM Wait for frontend
timeout /t 8 /nobreak >nul

REM ================================================================================
REM 7. Verify Services
REM ================================================================================
echo [%TIMESTAMP%] Verifying services... >> "%LOG%" 2>&1

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 5 -UseBasicParsing; Write-Output '[OK] Backend responding' } catch { Write-Output '[WAIT] Backend not ready yet' }" >> "%LOG%" 2>&1

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing; Write-Output '[OK] Frontend responding' } catch { Write-Output '[WAIT] Frontend not ready yet' }" >> "%LOG%" 2>&1

REM ================================================================================
REM 8. Open Browser
REM ================================================================================
echo [%TIMESTAMP%] Opening browser... >> "%LOG%" 2>&1
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo [%TIMESTAMP%] EHR Lite started successfully >> "%LOG%" 2>&1
echo [%TIMESTAMP%] Backend:  http://localhost:4000 >> "%LOG%" 2>&1
echo [%TIMESTAMP%] Frontend: http://localhost:3000 >> "%LOG%" 2>&1
echo [%TIMESTAMP%] Logs: %ROOT%\logs\ >> "%LOG%" 2>&1

exit /b 0
