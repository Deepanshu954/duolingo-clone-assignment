#!/bin/bash
# ============================================================
# launch.sh — Start the Duolingo Clone (Backend + Frontend)
# ============================================================
# Usage:
#   chmod +x launch.sh
#   ./launch.sh          # Start both backend and frontend
#   ./launch.sh --backend   # Start backend only
#   ./launch.sh --frontend  # Start frontend only
#   ./launch.sh --setup     # First-time setup (install deps)
#   ./launch.sh --test      # Run all tests
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_banner() {
    echo ""
    echo -e "${GREEN}${BOLD}"
    echo "  🦉 ╔═══════════════════════════════════════╗"
    echo "     ║      Duolingo Clone Launcher          ║"
    echo "     ║   Next.js 14 + FastAPI + SQLite       ║"
    echo "     ╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ---------------------------------------------------------------
# Check prerequisites
# ---------------------------------------------------------------
check_prereqs() {
    print_status "Checking prerequisites..."

    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11+."
        exit 1
    fi
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    print_success "Python $PYTHON_VERSION"

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+."
        exit 1
    fi
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION"

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION"

    echo ""
}

# ---------------------------------------------------------------
# Setup (first-time install)
# ---------------------------------------------------------------
do_setup() {
    print_banner
    print_status "Running first-time setup..."
    echo ""

    check_prereqs

    # Backend setup
    print_status "Setting up backend..."
    cd "$BACKEND_DIR"

    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi

    print_status "Installing backend dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt --quiet
    deactivate
    print_success "Backend dependencies installed"

    # Frontend setup
    print_status "Setting up frontend..."
    cd "$FRONTEND_DIR"

    print_status "Installing frontend dependencies..."
    npm install --silent 2>/dev/null
    print_success "Frontend dependencies installed"

    echo ""
    print_success "Setup complete! Run ./launch.sh to start the app."
    echo ""
}

free_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        print_status "Freeing port $port (stale PIDs: $pids)..."
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

# ---------------------------------------------------------------
# Start Backend
# ---------------------------------------------------------------
start_backend() {
    free_port $BACKEND_PORT
    print_status "Starting FastAPI backend on port $BACKEND_PORT..."
    cd "$BACKEND_DIR"

    if [ ! -d "venv" ]; then
        print_error "Backend venv not found. Run: ./launch.sh --setup"
        exit 1
    fi

    source venv/bin/activate

    # Ensure db directory exists
    mkdir -p "$ROOT_DIR/db"

    # Start uvicorn
    PYTHONPATH="$BACKEND_DIR" uvicorn app.main:app \
        --host 0.0.0.0 \
        --port $BACKEND_PORT \
        --reload \
        --log-level info &

    BACKEND_PID=$!
    echo $BACKEND_PID > "$ROOT_DIR/.backend.pid"

    # Wait for backend to be ready
    print_status "Waiting for backend to start..."
    for i in $(seq 1 30); do
        if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" > /dev/null 2>&1; then
            print_success "Backend running at http://localhost:$BACKEND_PORT"
            print_success "API docs at http://localhost:$BACKEND_PORT/docs"
            return 0
        fi
        sleep 1
    done

    print_warning "Backend may still be starting up..."
}

# ---------------------------------------------------------------
# Start Frontend
# ---------------------------------------------------------------
start_frontend() {
    free_port $FRONTEND_PORT
    print_status "Starting Next.js frontend on port $FRONTEND_PORT..."
    cd "$FRONTEND_DIR"

    if [ ! -d "node_modules" ]; then
        print_error "node_modules not found. Run: ./launch.sh --setup"
        exit 1
    fi

    npm run dev -- --port $FRONTEND_PORT &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$ROOT_DIR/.frontend.pid"

    # Wait for frontend to be ready
    print_status "Waiting for frontend to start..."
    for i in $(seq 1 30); do
        if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
            print_success "Frontend running at http://localhost:$FRONTEND_PORT"
            return 0
        fi
        sleep 1
    done

    print_warning "Frontend may still be starting up..."
}

# ---------------------------------------------------------------
# Stop all services
# ---------------------------------------------------------------
stop_services() {
    echo ""
    print_status "Shutting down services..."

    if [ -f "$ROOT_DIR/.backend.pid" ]; then
        BACKEND_PID=$(cat "$ROOT_DIR/.backend.pid")
        kill $BACKEND_PID 2>/dev/null && print_success "Backend stopped" || true
        rm -f "$ROOT_DIR/.backend.pid"
    fi

    if [ -f "$ROOT_DIR/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$ROOT_DIR/.frontend.pid")
        kill $FRONTEND_PID 2>/dev/null && print_success "Frontend stopped" || true
        rm -f "$ROOT_DIR/.frontend.pid"
    fi

    # Kill any remaining processes on the ports
    lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true

    print_success "All services stopped."
    exit 0
}

# ---------------------------------------------------------------
# Run tests
# ---------------------------------------------------------------
do_test() {
    print_banner
    echo ""

    # Backend tests
    print_status "Running backend tests..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    echo ""
    PYTHONPATH="$BACKEND_DIR" python -m pytest tests -v
    BACKEND_RESULT=$?
    deactivate
    echo ""

    if [ $BACKEND_RESULT -eq 0 ]; then
        print_success "Backend tests PASSED"
    else
        print_error "Backend tests FAILED"
    fi

    echo ""

    # Frontend lint
    print_status "Running frontend lint..."
    cd "$FRONTEND_DIR"
    npm run lint
    LINT_RESULT=$?
    echo ""

    if [ $LINT_RESULT -eq 0 ]; then
        print_success "Frontend lint PASSED"
    else
        print_error "Frontend lint FAILED"
    fi

    echo ""

    # Frontend build
    print_status "Running frontend build..."
    npm run build
    BUILD_RESULT=$?
    echo ""

    if [ $BUILD_RESULT -eq 0 ]; then
        print_success "Frontend build PASSED"
    else
        print_error "Frontend build FAILED"
    fi

    echo ""
    echo "═══════════════════════════════════════"
    echo "  Test Summary"
    echo "═══════════════════════════════════════"
    [ $BACKEND_RESULT -eq 0 ] && print_success "Backend pytest: PASSED" || print_error "Backend pytest: FAILED"
    [ $LINT_RESULT -eq 0 ] && print_success "Frontend lint:  PASSED" || print_error "Frontend lint:  FAILED"
    [ $BUILD_RESULT -eq 0 ] && print_success "Frontend build: PASSED" || print_error "Frontend build: FAILED"
    echo ""
}

# ---------------------------------------------------------------
# Main
# ---------------------------------------------------------------
case "${1:-}" in
    --setup)
        do_setup
        ;;
    --backend)
        print_banner
        check_prereqs
        start_backend
        echo ""
        print_success "Backend running. Press Ctrl+C to stop."
        trap stop_services SIGINT SIGTERM
        wait
        ;;
    --frontend)
        print_banner
        check_prereqs
        start_frontend
        echo ""
        print_success "Frontend running. Press Ctrl+C to stop."
        trap stop_services SIGINT SIGTERM
        wait
        ;;
    --test)
        do_test
        ;;
    --stop)
        stop_services
        ;;
    *)
        print_banner
        check_prereqs

        # Trap Ctrl+C to stop both services
        trap stop_services SIGINT SIGTERM

        start_backend
        echo ""
        start_frontend

        echo ""
        echo -e "${GREEN}${BOLD}═══════════════════════════════════════${NC}"
        echo -e "${GREEN}${BOLD}  🦉 Duolingo Clone is running!${NC}"
        echo -e "${GREEN}${BOLD}═══════════════════════════════════════${NC}"
        echo ""
        echo -e "  🌐 App:      ${BOLD}http://localhost:$FRONTEND_PORT${NC}"
        echo -e "  🔌 API:      ${BOLD}http://localhost:$BACKEND_PORT${NC}"
        echo -e "  📚 API Docs: ${BOLD}http://localhost:$BACKEND_PORT/docs${NC}"
        echo ""
        echo -e "  Press ${BOLD}Ctrl+C${NC} to stop all services."
        echo ""

        # Wait for background processes
        wait
        ;;
esac
