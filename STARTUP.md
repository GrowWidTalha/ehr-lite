# EHR Lite - Quick Start Guide

## Windows Users

### First-Time Setup (Run Once)
When you first clone the repository or after pulling code changes:

```powershell
.\setup.ps1
```

This will:
- Backup existing database and images
- Install all dependencies
- Build the frontend
- Seed lookup data

### Daily Startup
To start the application:

```powershell
.\start.ps1
```

This will:
- Start backend server (port 4000)
- Start frontend server (port 3000)
- Automatically open the application in your browser

### Stop Servers
To stop the running servers:

```powershell
.\stop.ps1
```

## Linux/Mac/WSL Users

### First-Time Setup (Run Once)
```bash
./setup.sh
```

### Daily Startup
```bash
./start.sh
```

### Stop Servers
```bash
./stop.sh
```

## What Each Script Does

### `setup.ps1` / `setup.sh` (One-Time Setup)
- Creates required directories
- Backs up existing database.db to `backups/` folder
- Backs up patient images to `backups/` folder
- Stops any running servers
- Installs backend dependencies (npm/pnpm install)
- Installs frontend dependencies (npm/pnpm install)
- Builds frontend for production
- Seeds lookup data into database

### `start.ps1` / `start.sh` (Daily Startup)
- Checks if servers are already running
- Starts backend server on port 4000
- Starts frontend server on port 3000
- Opens browser to http://localhost:3000
- Saves process PIDs for clean shutdown

### `stop.ps1` / `stop.sh` (Stop Servers)
- Stops backend server
- Stops frontend server
- Cleans up PID files

## Troubleshooting

### Port Already in Use
If you see an error about ports 3000 or 4000 being in use:
1. Run `./stop.sh` (or `.\stop.ps1` on Windows)
2. Try starting again

### Database Errors
If you encounter database errors:
1. Check `backups/` folder for your backup
2. Delete `backend/data/database.db`
3. Run `./setup.sh` again to recreate with fresh migrations

### Dependencies Issues
If you see npm/pnpm errors:
1. Delete `node_modules` folders in both backend and frontend
2. Run `./setup.sh` again

## File Locations

- **Database**: `backend/data/database.db`
- **Backups**: `backups/`
- **Patient Images**: `backend/data/patient-images/`
- **Backend Logs**: `backend/logs/backend.log`
- **Frontend Logs**: `frontend/logs/frontend.log`

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health
