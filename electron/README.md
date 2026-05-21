# Electron Wrapper Setup

This directory contains the Electron wrapper for EHR Lite.

## Files

- `main.js` - Main Electron process (spawns backend and frontend servers)
- `preload.js` - Preload script for IPC bridge
- `assets/` - Application icons and resources

## Build Process

1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && npm install`
3. Install Electron dependencies: `npm install` (from root)
4. Test in dev mode: `npm run electron:dev`
5. Build installer: `npm run dist`

## Required Assets

Place `icon.ico` (256x256 minimum) in `electron/assets/` directory before building the installer.

## Node.js Binary

Download the Node.js Windows binary zip, extract `node.exe` into `node-win/` at the project root. This ensures child processes run with the correct Node version.

- Download: https://nodejs.org/dist/v20.x.x/node-v20.x.x-win-x64.zip
- Extract `node.exe` to `node-win/` directory

## Output

The Windows installer will be created at: `dist/EHR Lite Setup 1.0.0.exe`
