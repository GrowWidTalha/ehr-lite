@echo off
REM ================================================================================
REM EHR Lite Service Stopper (Windows)
REM ================================================================================

echo ================================================================================
echo Stopping EHR Lite Services
echo ================================================================================
echo.

set STOPPED=0

REM Stop by window title (the named windows we started)
echo Stopping backend...
taskkill /FI "WINDOWTITLE eq EHR Backend*" /F >nul 2>&1
if %ERRORLEVEL% EQU 0 set STOPPED=1

echo Stopping frontend...
taskkill /FI "WINDOWTITLE eq EHR Frontend*" /F >nul 2>&1
if %ERRORLEVEL% EQU 0 set STOPPED=1

REM Fallback: kill all node processes
echo Checking for remaining Node.js processes...
timeout /t 1 /nobreak >nul
taskkill /IM node.exe /F >nul 2>&1
if %ERRORLEVEL% EQU 0 set STOPPED=1

echo.
if %STOPPED%==1 (
    echo All services stopped.
) else (
    echo No services were running.
)
echo.

REM Cleanup helper files if they exist
del _backend_run.bat 2>nul
del _frontend_run.bat 2>nul

timeout /t 2 /nobreak >nul
