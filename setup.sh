#!/bin/bash

# EHR Lite One-Time Setup Script (Linux/Mac/WSL)
# Run this script when you update the codebase or on first-time setup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKUP_DIR="$PROJECT_ROOT/backups"
BACKEND_DATA_DIR="$BACKEND_DIR/data"
IMAGES_DIR="$BACKEND_DATA_DIR/patient-images"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  EHR Lite One-Time Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create required directories
echo -e "${YELLOW}[*] Creating directories...${NC}"
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKEND_DATA_DIR"
mkdir -p "$IMAGES_DIR"
echo -e "${GREEN}  ✓ Directories created${NC}"
echo ""

# Step 1: Backup existing database and images
echo -e "${YELLOW}[*] Step 1: Backing up existing data...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -f "$BACKEND_DATA_DIR/database.db" ]; then
    BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.db"
    cp "$BACKEND_DATA_DIR/database.db" "$BACKUP_FILE"
    echo -e "${GREEN}  ✓ Database backed up to: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}  ! No existing database found${NC}"
fi

if [ -d "$IMAGES_DIR" ] && [ "$(ls -A $IMAGES_DIR 2>/dev/null)" ]; then
    IMAGE_BACKUP_DIR="$BACKUP_DIR/patient-images_$TIMESTAMP"
    cp -r "$IMAGES_DIR"/* "$IMAGE_BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}  ✓ Patient images backed up to: $IMAGE_BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}  ! No patient images to backup${NC}"
fi
echo ""

# Step 2: Stop any running servers
echo -e "${YELLOW}[*] Step 2: Stopping any running servers...${NC}"
pkill -f "node.*backend" 2>/dev/null || true
pkill -f "next.*frontend" 2>/dev/null || true
fuser -k 4000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 2
echo -e "${GREEN}  ✓ Servers stopped${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[*] Step 3: Installing dependencies...${NC}"

# Backend dependencies
echo -e "  → Installing backend dependencies..."
cd "$BACKEND_DIR"
if command -v pnpm &> /dev/null; then
    pnpm install --silent
else
    npm install --silent
fi
echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"

# Frontend dependencies
echo -e "  → Installing frontend dependencies..."
cd "$FRONTEND_DIR"
if command -v pnpm &> /dev/null; then
    pnpm install --silent
else
    npm install --silent
fi
echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"
echo ""

# Step 4: Build frontend
echo -e "${YELLOW}[*] Step 4: Building frontend...${NC}"
npm run build
echo -e "${GREEN}  ✓ Frontend built successfully${NC}"
echo ""

# Step 5: Seed lookup data
echo -e "${YELLOW}[*] Step 5: Seeding lookup data...${NC}"
cd "$BACKEND_DIR"

if [ -f "migrations/seed.js" ]; then
    node migrations/seed.js
    echo -e "${GREEN}  ✓ Lookup data seeded${NC}"
else
    echo -e "${YELLOW}  ! No seed script found${NC}"
fi
echo ""

# Done
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "To start the application, run:"
echo -e "  ${YELLOW}./start.sh${NC}"
echo ""
echo "Note: This script only needs to be run when:"
echo "  - First time setup"
echo "  - After pulling code changes"
echo "  - After database schema changes"
echo ""
