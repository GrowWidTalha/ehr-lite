#!/bin/bash

##############################################################################
# EHR Lite Service Stopper
# Stops backend and frontend services
##############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKEND_PID_FILE=".backend.pid"
FRONTEND_PID_FILE=".frontend.pid"

echo "Stopping EHR Lite services..."
echo ""

STOPPED=0

# Stop backend
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠ Backend process not running${NC}"
    fi
    rm -f "$BACKEND_PID_FILE"
    STOPPED=1
else
    # Try to find any node processes on our ports
    BACKEND_PROC=$(lsof -ti:4000 2>/dev/null)
    if [ -n "$BACKEND_PROC" ]; then
        kill $BACKEND_PROC 2>/dev/null
        echo -e "${GREEN}✓ Backend stopped (port 4000)${NC}"
        STOPPED=1
    fi
fi

# Stop frontend
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        wait $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend process not running${NC}"
    fi
    rm -f "$FRONTEND_PID_FILE"
    STOPPED=1
else
    # Try to find any node processes on our ports
    FRONTEND_PROC=$(lsof -ti:3000 2>/dev/null)
    if [ -n "$FRONTEND_PROC" ]; then
        kill $FRONTEND_PROC 2>/dev/null
        echo -e "${GREEN}✓ Frontend stopped (port 3000)${NC}"
        STOPPED=1
    fi
fi

if [ $STOPPED -eq 0 ]; then
    echo -e "${YELLOW}No services were running${NC}"
else
    echo ""
    echo -e "${GREEN}All services stopped${NC}"
fi
