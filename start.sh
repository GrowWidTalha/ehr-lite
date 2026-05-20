#!/bin/bash

# EHR Lite Startup Script (Linux/Mac/WSL)
# Run this script daily to start the backend and frontend servers

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

# Function to check if port is in use
port_in_use() {
    lsof -i ":$1" &>/dev/null || netstat -an 2>/dev/null | grep ":$1.*LISTEN" &>/dev/null
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting EHR Lite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if servers are already running
echo -e "${YELLOW}[*] Checking for existing servers...${NC}"
BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if port_in_use 4000; then
    echo -e "${YELLOW}  ! Backend already running on port 4000${NC}"
    BACKEND_RUNNING=true
fi

if port_in_use 3000; then
    echo -e "${YELLOW}  ! Frontend already running on port 3000${NC}"
    FRONTEND_RUNNING=true
fi

# Start backend if not running
if [ "$BACKEND_RUNNING" = false ]; then
    echo -e "  → Starting backend...${NC}"
    cd "$BACKEND_DIR"
    mkdir -p logs
    nohup npm start > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > logs/backend.pid
    echo -e "${GREEN}  ✓ Backend started (PID: $BACKEND_PID)${NC}"
    echo -e "     Logs: $BACKEND_DIR/logs/backend.log${NC}"
fi

# Start frontend if not running
if [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "  → Starting frontend...${NC}"
    cd "$FRONTEND_DIR"
    mkdir -p logs
    nohup npm start > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    echo -e "${GREEN}  ✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    echo -e "     Logs: $FRONTEND_DIR/logs/frontend.log${NC}"
fi

echo ""
echo -e "${YELLOW}[*] Waiting for servers to be ready...${NC}"

# Wait for backend
for i in {1..15}; do
    if curl -s http://localhost:4000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Backend is ready${NC}"
        break
    fi
    sleep 1
done

# Wait for frontend
for i in {1..15}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Frontend is ready${NC}"
        break
    fi
    sleep 1
done

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Application Status${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Backend:  http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo ""

# Open browser
echo -e "${YELLOW}[*] Opening browser...${NC}"

# Detect OS and open browser appropriately
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    elif command -v gnome-open &> /dev/null; then
        gnome-open http://localhost:3000
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start http://localhost:3000
else
    # WSL - try to open in Windows browser
    if command -v cmd.exe &> /dev/null; then
        cmd.exe /c start http://localhost:3000
    fi
fi

echo -e "${GREEN}  ✓ Browser opened${NC}"
echo ""
echo "To stop the servers, run:"
echo -e "  ${YELLOW}./stop.sh${NC}"
echo ""
