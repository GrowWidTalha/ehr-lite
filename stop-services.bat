@echo off
REM ================================================================================
REM EHR Lite Service Stopper (Windows)
REM Kills services by port - works for both visible and hidden mode
REM ================================================================================

echo ================================================================================
echo Stopping EHR Lite Services
echo ================================================================================
echo.

set STOPPED=0

REM Stop by window title (legacy visible mode)
taskkill /FI "WINDOWTITLE eq EHR Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq EHR Frontend*" /F >nul 2>&1

REM Stop by port (works for headless/hidden mode)
echo Stopping backend (port 4000)...
powershell -Command "Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
if %ERRORLEVEL% EQU 0 set STOPPED=1

echo Stopping frontend (port 3000)...
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
if %ERRORLEVEL% EQU 0 set STOPPED=1

REM Fallback: kill any remaining node processes on our ports
timeout /t 1 /nobreak >nul

powershell -Command "Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo.
if %STOPPED%==1 (
    echo All services stopped.
) else (
    echo No services were running.
)
echo.

REM Cleanup helper files
del _backend_run.bat 2>nul
del _frontend_run.bat 2>nul

timeout /t 2 /nobreak >nul
