# EHR Lite - Troubleshooting Guide

## Port 4000 Not Ready Issue

This issue occurs when the backend server fails to start properly in the Electron app.

### Why This Happens

1. **Different Data Directory in Production**: Electron uses `app.getPath('userData')` which stores data in:
   - Windows: `%APPDATA%\EHR Lite\data`
   - Development: `backend/data/`

2. **Old Installation Leftovers**: Previous installations may have:
   - Corrupted database files
   - Incompatible schema
   - Locked files

3. **Backend Startup Timeout**: The 3-second timeout may not be enough on slower systems

### Debug Steps

1. **Check Backend Logs**: 
   - Open Windows Event Viewer or check console output
   - Look for `[backend]` log messages
   - Check for database errors

2. **Verify Data Directory**:
   - Press Win+R, type: `%APPDATA%\EHR Lite\data`
   - Check if `database.db` exists
   - Note the file size (should be > 0)

3. **Test Backend Manually**:
   ```bash
   cd "C:\Users\YourUsername\AppData\Local\Programs\ehr-lite\resources\app\backend"
   set DATA_DIR=%APPDATA%\EHR-Lite\data
   node src/server.js
   ```

### Fix Options

#### Option 1: Clean Reinstall (Recommended)

1. **Uninstall the App**:
   - Go to Settings > Apps > Installed Apps
   - Find "EHR Lite" and uninstall
   - This removes the app but NOT your data

2. **Remove User Data** (CAUTION: Deletes all patient data):
   ```powershell
   # Press Win+R and run:
   %APPDATA%\EHR Lite
   # Delete the entire folder
   ```

3. **Kill Any Leftover Processes**:
   ```powershell
   # Open Task Manager (Ctrl+Shift+Esc)
   # Look for node.exe processes and end them
   # Or run in PowerShell as Admin:
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

4. **Reinstall**: Run the installer again

#### Option 2: Reset Database Only (Preserves App)

1. **Close the App completely**

2. **Navigate to Data Folder**:
   - Press Win+R, type: `%APPDATA%\EHR Lite`

3. **Backup Current Data** (optional):
   - Copy the `data` folder somewhere safe

4. **Delete Database**:
   - Delete `database.db` 
   - Delete `.seeded` file
   - Keep `patient-images` folder if you want to preserve images

5. **Restart App**: It will create a fresh database

#### Option 3: Port Conflict Resolution

If another app is using ports 3000 or 4000:

1. **Find What's Using the Ports**:
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :4000
   ```

2. **Kill the Process**:
   ```powershell
   # Replace PID with the process ID from above
   taskkill /PID <PID> /F
   ```

### Enhanced Startup Script

The updated main.js includes:
- Better error messages
- Longer startup timeout (5 seconds)
- Detailed logging

### Preventive Measures

1. **Always Close Properly**: Use the X button, don't kill the process
2. **Regular Backups**: Use the Settings > Backup feature
3. **Before Updates**: Export your data as Excel

### Still Having Issues?

1. Check Windows Event Viewer for crash logs:
   - Win+R → `eventvwr`
   - Windows Logs > Application
   - Filter for "node.exe" or "EHR Lite"

2. Enable Verbose Logging:
   - The app now logs to console
   - In production, check `%APPDATA%\EHR Lite\logs`

3. Contact Support with:
   - Screenshot of the error
   - Contents of `%APPDATA%\EHR Lite\data`
   - Windows version
