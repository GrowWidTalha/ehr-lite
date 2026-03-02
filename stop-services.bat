@echo off
REM ================================================================================
REM EHR Lite Service Stopper (Windows)
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo Stopping EHR Lite Services
echo ================================================================================
echo.

echo Stopping all Node.js processes...

REM Stop all node.exe processes
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM node.exe >nul 2>&1
    echo   Stopped Node.js processes
) else (
    echo   No Node.js processes found
)

REM Also stop cmd windows running npm (just in case)
timeout /t 1 /nobreak >nul
wmic process where "name='cmd.exe'" call terminate 2>nul >nul

echo.
echo ================================================================================
echo All services stopped
echo ================================================================================
echo.
timeout /t 2 /nobreak >nul
