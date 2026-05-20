# EHR Lite One-Time Setup Script
# Run this script when you update the codebase or on first-time setup
# This script will backup old data, install dependencies, build the application, and seed lookup data

$ErrorActionPreference = "Continue"

# Configuration
$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BackupDir = Join-Path $ProjectRoot "backups"
$BackendDataDir = Join-Path $BackendDir "data"
$ImagesDir = Join-Path $BackendDataDir "patient-images"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  EHR Lite One-Time Setup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Create required directories
Write-Host "[*] Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
New-Item -ItemType Directory -Force -Path $BackendDataDir | Out-Null
New-Item -ItemType Directory -Force -Path $ImagesDir | Out-Null
Write-Host "  ✓ Directories created" -ForegroundColor Green
Write-Host ""

# Step 1: Backup existing database and images
Write-Host "[*] Step 1: Backing up existing data..." -ForegroundColor Yellow
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (Test-Path (Join-Path $BackendDataDir "database.db")) {
    $BackupFile = Join-Path $BackupDir "database_backup_$Timestamp.db"
    Copy-Item (Join-Path $BackendDataDir "database.db") $BackupFile
    Write-Host "  ✓ Database backed up to: $BackupFile" -ForegroundColor Green
} else {
    Write-Host "  ! No existing database found" -ForegroundColor DarkYellow
}

if (Test-Path $ImagesDir) {
    $ImageBackupDir = Join-Path $BackupDir "patient-images_$Timestamp"
    if (Get-ChildItem $ImagesDir -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0) {
        Copy-Item -Path "$ImagesDir\*" -Destination $ImageBackupDir -Recurse -Force
        Write-Host "  ✓ Patient images backed up to: $ImageBackupDir" -ForegroundColor Green
    } else {
        Write-Host "  ! No patient images to backup" -ForegroundColor DarkYellow
    }
}
Write-Host ""

# Step 2: Stop any running servers
Write-Host "[*] Step 2: Stopping any running servers..." -ForegroundColor Yellow
Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -eq "node" -and $_.MainWindowTitle -like "*backend*" -or $_.MainWindowTitle -like "*frontend*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Kill processes on ports
$Ports = @(3000, 4000)
foreach ($Port in $Ports) {
    $PortProcess = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($PortProcess) {
        Stop-Process -Id $PortProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Stopped process on port $Port" -ForegroundColor Green
    }
}
Write-Host ""

# Step 3: Install dependencies
Write-Host "[*] Step 3: Installing dependencies..." -ForegroundColor Yellow

# Backend dependencies
Write-Host "  → Installing backend dependencies..." -ForegroundColor Cyan
Set-Location $BackendDir
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install --silent
} else {
    npm install --silent
}
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green

# Frontend dependencies
Write-Host "  → Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location $FrontendDir
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install --silent
} else {
    npm install --silent
}
Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 4: Build frontend
Write-Host "[*] Step 4: Building frontend..." -ForegroundColor Yellow
Set-Location $FrontendDir
npm run build
Write-Host "  ✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Seed lookup data
Write-Host "[*] Step 5: Seeding lookup data..." -ForegroundColor Yellow
Set-Location $BackendDir

if (Test-Path "migrations\seed.js") {
    node migrations\seed.js
    Write-Host "  ✓ Lookup data seeded" -ForegroundColor Green
} else {
    Write-Host "  ! No seed script found" -ForegroundColor DarkYellow
}
Write-Host ""

# Done
Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor White
Write-Host "  .\start.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: This script only needs to be run when:" -ForegroundColor DarkGray
Write-Host "  - First time setup" -ForegroundColor DarkGray
Write-Host "  - After pulling code changes" -ForegroundColor DarkGray
Write-Host "  - After database schema changes" -ForegroundColor DarkGray
Write-Host ""

# Return to project root
Set-Location $ProjectRoot
