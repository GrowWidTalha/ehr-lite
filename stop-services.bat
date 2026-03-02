@echo off
REM ================================================================================
REM EHR Lite Service Stopper
REM ================================================================================

echo ================================================================================
echo Stopping EHR Lite Services
echo ================================================================================
echo.

echo Stopping all Node.js processes...

REM Kill all node.exe processes (this terminates both backend and frontend)
taskkill /IM node.exe /F >nul 2>&1

REM Also kill any cmd processes running our scripts
wmic process where "name='cmd.exe' and commandline like '%_run_backend.bat%'" delete 2>nul >nul
wmic process where "name='cmd.exe' and commandline like '%_run_frontend.bat%'" delete 2>nul >nul

if %ERRORLEVEL% EQU 0 (
    echo Services stopped successfully.
) else (
    echo No services were running.
)

echo.
timeout /t 2 /nobreak >nul
