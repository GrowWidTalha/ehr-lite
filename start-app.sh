#!/bin/bash

##############################################################################
# EHR Lite Application Launcher (Linux/WSL)
# Starts both backend and frontend servers with all prerequisites
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}================================================================================================${NC}"
echo -e "${CYAN}EHR Lite - Local First Electronic Health Record System${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo ""

##############################################################################
# 1. Check and Install Node.js
##############################################################################
echo -e "${YELLOW}[1/6] Checking Node.js installation...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Installing Node.js...${NC}"

    # Check if we're on WSL
    if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "Detected WSL environment. Installing Node.js via nvm..."

        # Install nvm if not present
        if [ ! -d "$HOME/.nvm" ]; then
            echo "Installing nvm (Node Version Manager)..."
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

            # Source nvm
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        fi

        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        # Install latest LTS Node.js
        echo "Installing Node.js LTS..."
        nvm install --lts
        nvm use --lts

        echo -e "${GREEN}Node.js installed successfully!${NC}"
    else
        echo -e "${RED}Please install Node.js manually:${NC}"
        echo "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
        echo "  Or visit: https://nodejs.org/"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js is installed: $NODE_VERSION${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Installing npm...${NC}"
    sudo apt-get install -y npm
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}npm is installed: $NPM_VERSION${NC}"
fi

##############################################################################
# 2. Check and Install Dependencies
##############################################################################
echo ""
echo -e "${YELLOW}[2/6] Checking and installing dependencies...${NC}"

# Backend dependencies
if [ ! -d "backend/node_modules" ] || [ ! -f "backend/package-lock.json" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}Backend dependencies installed.${NC}"
else
    echo -e "${GREEN}Backend dependencies already installed.${NC}"
fi

# Frontend dependencies
if [ ! -d "frontend/node_modules" ] || [ ! -f "frontend/package-lock.json" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}Frontend dependencies installed.${NC}"
else
    echo -e "${GREEN}Frontend dependencies already installed.${NC}"
fi

##############################################################################
# 3. Ensure Data Directory Exists
##############################################################################
echo ""
echo -e "${YELLOW}[3/6] Ensuring data directory exists...${NC}"
mkdir -p data
mkdir -p data/patient-images
echo -e "${GREEN}Data directories ready.${NC}"

##############################################################################
# 4. Initialize Database
##############################################################################
echo ""
echo -e "${YELLOW}[4/6] Checking database...${NC}"
cd backend
if [ ! -f "../data/database.db" ]; then
    echo "Creating database..."
    npm run init-db
    echo -e "${GREEN}Database created.${NC}"
else
    echo -e "${GREEN}Database already exists.${NC}"
fi
cd "$SCRIPT_DIR"

##############################################################################
# 5. Start Iriun Webcam
##############################################################################
echo ""
echo -e "${YELLOW}[5/6] Starting Iriun Webcam...${NC}"

# Check if Iriun Webcam is installed
IRIUN_PATHS=(
    "$HOME/.local/share/applications/iriunwebcam.desktop"
    "/opt/iriunwebcam/iriunwebcam"
    "/usr/bin/iriunwebcam"
    "$HOME/iriunwebcam/iriunwebcam.AppImage"
)

IRIUN_FOUND=0
IRIUN_CMD=""

for path in "${IRIUN_PATHS[@]}"; do
    if [ -f "$path" ]; then
        IRIUN_FOUND=1
        IRIUN_CMD="$path"
        break
    fi
done

# Also check for AppImage in common locations
if [ $IRIUN_FOUND -eq 0 ]; then
    for dir in "$HOME/Applications" "$HOME/Desktop" "$HOME/Downloads" "/opt"; do
        if [ -f "$dir/IriunWebcam.AppImage" ]; then
            IRIUN_FOUND=1
            IRIUN_CMD="$dir/IriunWebcam.AppImage"
            break
        fi
    done
fi

if [ $IRIUN_FOUND -eq 1 ]; then
    echo -e "${GREEN}Found Iriun Webcam at: $IRIUN_CMD${NC}"

    # Check if it's already running
    if pgrep -f "iriunwebcam" > /dev/null; then
        echo -e "${GREEN}Iriun Webcam is already running.${NC}"
    else
        echo "Starting Iriun Webcam in background..."
        chmod +x "$IRIUN_CMD" 2>/dev/null || true

        # Start based on file type
        if [[ "$IRIUN_CMD" == *.AppImage ]]; then
            nohup "$IRIUN_CMD" > /dev/null 2>&1 &
        elif [[ "$IRIUN_CMD" == *.desktop ]]; then
            nohup gtk-launch iriunwebcam > /dev/null 2>&1 &
        else
            nohup "$IRIUN_CMD" > /dev/null 2>&1 &
        fi

        sleep 2

        if pgrep -f "iriunwebcam" > /dev/null; then
            echo -e "${GREEN}Iriun Webcam started successfully!${NC}"
        else
            echo -e "${YELLOW}Iriun Webcam was launched but may not be running yet.${NC}"
        fi
    fi
else
    echo -e "${YELLOW}Iriun Webcam not found. Please install it from https://iriun.com/${NC}"
    echo "Camera features may not work without it."
fi

##############################################################################
# 6. Start Servers
##############################################################################
echo ""
echo -e "${YELLOW}[6/6] Starting servers...${NC}"
echo ""
echo -e "${CYAN}Backend:  ${BLUE}http://localhost:4000${NC}"
echo -e "${CYAN}Frontend: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd backend
nohup npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

echo -e "${GREEN}================================================================================================${NC}"
echo -e "${GREEN}Servers started successfully!${NC}"
echo -e "${GREEN}================================================================================================${NC}"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Show server URLs
echo -e "${CYAN}Server Status:${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:4000${NC} ${GREEN}(PID: $BACKEND_PID)${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:3000${NC} ${GREEN}(PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo -e "  Backend:  ${YELLOW}logs/backend.log${NC}"
echo -e "  Frontend: ${YELLOW}logs/frontend.log${NC}"
echo ""

# Open browser (works on WSL with Windows browser)
echo -e "${YELLOW}Opening application in browser...${NC}"

# Try different methods to open browser
if command -v xdg-open &> /dev/null; then
    # Linux GUI
    xdg-open http://localhost:3000 2>/dev/null || true
elif grep -qi microsoft /proc/version 2>/dev/null; then
    # WSL - try to open in Windows browser
    /mnt/c/Windows/System32/cmd.exe /c start http://localhost:3000 2>/dev/null || true
    powershell.exe -Command "Start-Process http://localhost:3000" 2>/dev/null || true
elif command -v wslview &> /dev/null; then
    # WSL with wslu installed
    wslview http://localhost:3000 2>/dev/null || true
fi

echo ""
echo -e "${YELLOW}Running... Press Ctrl+C to stop.${NC}"
echo ""

# Monitor servers - keep script running
while true; do
    # Check if servers are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}Backend server has stopped!${NC}"
        echo "Check logs/backend.log for details."
        break
    fi

    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}Frontend server has stopped!${NC}"
        echo "Check logs/frontend.log for details."
        break
    fi

    sleep 5
done

# Wait for processes to finish
wait $BACKEND_PID $FRONTEND_PID

cleanup
