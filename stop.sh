#!/bin/bash

# EHR Lite Stop Script (Linux/Mac/WSL)
# Run this script to stop the backend and frontend servers

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Stopping EHR Lite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to stop process by PID file
stop_by_pid_file() {
    local PID_FILE=$1
    local NAME=$2

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE" 2>/dev/null)
        if [ -n "$PID" ]; then
            if kill "$PID" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Stopped $NAME (PID: $PID)${NC}"
                rm -f "$PID_FILE"
                return 0
            fi
        fi
        rm -f "$PID_FILE"
    fi
    return 1
}

# Stop servers using PID files
STOPPED=false
stop_by_pid_file "$BACKEND_DIR/logs/backend.pid" "Backend" && STOPPED=true
stop_by_pid_file "$FRONTEND_DIR/logs/frontend.pid" "Frontend" && STOPPED=true

# Fallback: Stop by port or process name
if [ "$STOPPED" = false ]; then
    echo -e "${YELLOW}[*] Stopping servers by port...${NC}"

    # Kill by port
    for PORT in 3000 4000; do
        PID=$(lsof -ti :"$PORT" 2>/dev/null)
        if [ -n "$PID" ]; then
            kill "$PID" 2>/dev/null || true
            SERVICE_NAME=$([ "$PORT" -eq 4000 ] && echo "Backend" || echo "Frontend")
            echo -e "${GREEN}  ✓ Stopped $SERVICE_NAME on port $PORT${NC}"
        fi
    done

    # Also kill by process name as fallback
    pkill -f "node.*backend" 2>/dev/null || true
    pkill -f "next.*frontend" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✓ All servers stopped${NC}"
echo ""
