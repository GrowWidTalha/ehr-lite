#!/bin/bash

##############################################################################
# EHR Lite Application Launcher (Linux/WSL) - Production Mode
# Builds and runs both backend and frontend servers in background
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# PID files for tracking processes
BACKEND_PID_FILE=".backend.pid"
FRONTEND_PID_FILE=".frontend.pid"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"

    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID 2>/dev/null || true
            wait $BACKEND_PID 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID 2>/dev/null || true
            wait $FRONTEND_PID 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    echo -e "${GREEN}Services stopped.${NC}"
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Check if services are already running
check_running_services() {
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${YELLOW}Backend is already running (PID: $BACKEND_PID)${NC}"
            echo "Run 'stop-services.sh' to stop it first, or kill it manually."
            exit 1
        else
            rm -f "$BACKEND_PID_FILE"
        fi
    fi

    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${YELLOW}Frontend is already running (PID: $FRONTEND_PID)${NC}"
            echo "Run 'stop-services.sh' to stop it first, or kill it manually."
            exit 1
        else
            rm -f "$FRONTEND_PID_FILE"
        fi
    fi
}

echo -e "${BLUE}================================================================================================${NC}"
echo -e "${CYAN}EHR Lite - Production Launcher${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo ""

# Check if already running
check_running_services

##############################################################################
# 1. Check and Install Node.js
##############################################################################
echo -e "${YELLOW}[1/7] Checking Node.js installation...${NC}"

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
        echo -e "${YELLOW}Please run this script again to continue.${NC}"
        exit 0
    else
        echo -e "${RED}Please install Node.js manually:${NC}"
        echo "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
        echo "  Or visit: https://nodejs.org/"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}Node.js: $NODE_VERSION | npm: $NPM_VERSION${NC}"
fi

##############################################################################
# 2. Check and Install Dependencies
##############################################################################
echo ""
echo -e "${YELLOW}[2/7] Checking dependencies...${NC}"

# Backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install --silent --no-audit --no-fund
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies OK${NC}"
fi

# Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install --silent --no-audit --no-fund
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies OK${NC}"
fi

##############################################################################
# 3. Ensure Data Directory Exists
##############################################################################
echo ""
echo -e "${YELLOW}[3/7] Setting up data directories...${NC}"
mkdir -p data/patient-images
mkdir -p logs
echo -e "${GREEN}✓ Data directories ready${NC}"

##############################################################################
# 4. Initialize Database
##############################################################################
echo ""
echo -e "${YELLOW}[4/7] Checking database...${NC}"
if [ ! -f "data/database.db" ]; then
    echo "Creating database..."
    cd backend
    npm run init-db > /dev/null 2>&1
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi

##############################################################################
# 5. Build Applications (Smart Build Detection)
##############################################################################
echo ""
echo -e "${YELLOW}[5/7] Checking if rebuild is needed...${NC}"

# Function to check if rebuild is needed
needs_rebuild() {
    local build_dir="$1"
    local marker_file="$2"
    local source_files=("${@:3}")

    # If build directory doesn't exist, rebuild is needed
    if [ ! -d "$build_dir" ]; then
        return 0
    fi

    # If marker file doesn't exist, rebuild is needed
    if [ ! -f "$marker_file" ]; then
        return 0
    fi

    # Check if any source file is newer than the marker file
    for source_file in "${source_files[@]}"; do
        if [ -f "$source_file" ] && [ "$source_file" -nt "$marker_file" ]; then
            return 0
        fi
    done

    return 1
}

# Check frontend build
echo "Checking frontend..."
cd frontend

# Key frontend files to monitor for changes
FRONTEND_SOURCES=(
    "package.json"
    "next.config.js"
    "tsconfig.json"
    "tailwind.config.js"
    "app/layout.tsx"
    "app/page.tsx"
    "components/ui/button.tsx"
)

if needs_rebuild ".next" ".next/BUILD_ID" "${FRONTEND_SOURCES[@]}"; then
    echo -e "${YELLOW}  → Source changes detected. Rebuilding frontend...${NC}"

    # Clean previous build for fresh start
    rm -rf .next 2>/dev/null || true

    echo "  → Running: npm run build"
    if npm run build --silent; then
        echo -e "${GREEN}✓ Frontend built successfully${NC}"

        # Create build marker with current timestamp
        date > .next/BUILD_ID
    else
        echo -e "${RED}✗ Frontend build failed. Check logs above.${NC}"
        echo -e "${YELLOW}Continuing with dev mode fallback...${NC}"
    fi
else
    echo -e "${GREEN}✓ Frontend build up to date${NC}"
fi
cd "$SCRIPT_DIR"

# Check backend build (if needed)
echo "Checking backend..."
cd backend

# Backend uses dev mode, but we check if dependencies need update
if [ "package.json" -nt "../.backend_deps_installed" ] 2>/dev/null || [ ! -f "../.backend_deps_installed" ]; then
    if [ "package.json" -nt "node_modules/.package-lock.json" ] 2>/dev/null; then
        echo -e "${YELLOW}  → Dependencies changed. Reinstalling...${NC}"
        npm install --silent --no-audit --no-fund
        date > "../.backend_deps_installed"
        echo -e "${GREEN}✓ Backend dependencies updated${NC}"
    else
        date > "../.backend_deps_installed"
    fi
else
    echo -e "${GREEN}✓ Backend dependencies up to date${NC}"
fi

cd "$SCRIPT_DIR"

##############################################################################
# 6. Start Iriun Webcam
##############################################################################
echo ""
echo -e "${YELLOW}[6/7] Starting Iriun Webcam...${NC}"

IRIUN_FOUND=0
IRIUN_CMD=""

# Check common paths
for path in \
    "$HOME/.local/share/applications/iriunwebcam.desktop" \
    "/opt/iriunwebcam/iriunwebcam" \
    "/usr/bin/iriunwebcam" \
    "$HOME/Applications/IriunWebcam.AppImage" \
    "$HOME/Desktop/IriunWebcam.AppImage" \
    "$HOME/Downloads/IriunWebcam.AppImage"
do
    if [ -f "$path" ]; then
        IRIUN_FOUND=1
        IRIUN_CMD="$path"
        break
    fi
done

if [ $IRIUN_FOUND -eq 1 ]; then
    if pgrep -f "iriunwebcam" > /dev/null; then
        echo -e "${GREEN}✓ Iriun Webcam already running${NC}"
    else
        echo "Starting Iriun Webcam..."
        chmod +x "$IRIUN_CMD" 2>/dev/null || true

        if [[ "$IRIUN_CMD" == *.AppImage ]]; then
            nohup "$IRIUN_CMD" > /dev/null 2>&1 &
        elif [[ "$IRIUN_CMD" == *.desktop ]]; then
            nohup gtk-launch iriunwebcam > /dev/null 2>&1 &
        else
            nohup "$IRIUN_CMD" > /dev/null 2>&1 &
        fi

        sleep 2
        if pgrep -f "iriunwebcam" > /dev/null; then
            echo -e "${GREEN}✓ Iriun Webcam started${NC}"
        else
            echo -e "${YELLOW}⚠ Iriun Webcam launched (may take a moment)${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Iriun Webcam not found (optional)${NC}"
fi

##############################################################################
# 7. Start Services (Background)
##############################################################################
echo ""
echo -e "${YELLOW}[7/7] Starting services in background...${NC}"
echo ""

# Start backend
echo "→ Starting backend on port 4000..."
cd backend
nohup npm run dev > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$SCRIPT_DIR/$BACKEND_PID_FILE"
cd "$SCRIPT_DIR"

# Wait for backend to start
echo -n "  Waiting for backend..."
for i in {1..15}; do
    if curl -s http://localhost:4000 > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 0.3
    echo -n "."
done
echo ""

# Start frontend
echo "→ Starting frontend on port 3000..."
cd frontend
PORT=3000 nohup npm run start > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$SCRIPT_DIR/$FRONTEND_PID_FILE"
cd "$SCRIPT_DIR"

# Wait for frontend to start
echo -n "  Waiting for frontend..."
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    sleep 0.3
    echo -n "."
done
echo ""

##############################################################################
# Display Status
##############################################################################
echo ""
echo -e "${MAGENTA}════════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                      EHR Lite - RUNNING${NC}"
echo -e "${MAGENTA}════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Services:${NC}"
echo -e "  • Backend:  ${BLUE}http://localhost:4000${NC} ${GREEN}(PID: $BACKEND_PID)${NC}"
echo -e "  • Frontend: ${BLUE}http://localhost:3000${NC} ${GREEN}(PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo -e "  • Backend:  ${YELLOW}logs/backend.log${NC}"
echo -e "  • Frontend: ${YELLOW}logs/frontend.log${NC}"
echo ""
echo -e "${CYAN}Commands:${NC}"
echo -e "  • View logs: ${GREEN}tail -f logs/backend.log${NC} or ${GREEN}tail -f logs/frontend.log${NC}"
echo -e "  • Stop all:  ${GREEN}./stop-services.sh${NC} or ${GREEN}Ctrl+C${NC}"
echo ""

# Open browser
sleep 1
echo "Opening browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 2>/dev/null || true
elif grep -qi microsoft /proc/version 2>/dev/null; then
    /mnt/c/Windows/System32/cmd.exe /c start http://localhost:3000 2>/dev/null || true
    powershell.exe -Command "Start-Process http://localhost:3000" 2>/dev/null || true
elif command -v wslview &> /dev/null; then
    wslview http://localhost:3000 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}EHR Lite is running in the background!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Monitor services
while true; do
    sleep 5

    # Check backend
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}✗ Backend has stopped! Check logs/backend.log${NC}"
        break
    fi

    # Check frontend
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}✗ Frontend has stopped! Check logs/frontend.log${NC}"
        break
    fi
done

cleanup
