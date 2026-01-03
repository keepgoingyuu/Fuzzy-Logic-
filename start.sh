#!/bin/bash

# Fuzzy Logic Demo Startup Script
# 模糊邏輯教學系統啟動腳本

set -e

echo "🧠 模糊邏輯控制器教學系統"
echo "=============================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}⚠️  uv 未安裝，正在安裝...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm 未安裝，請先安裝 pnpm${NC}"
    echo "   npm install -g pnpm"
    exit 1
fi

# Start backend
echo -e "${BLUE}📦 啟動後端服務...${NC}"
cd backend
uv sync --quiet
uv run uvicorn src.api.main:app --reload --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✅ 後端服務已啟動 (PID: $BACKEND_PID, Port: 8000)${NC}"
cd ..

# Wait for backend to start
echo "⏳ 等待後端服務啟動..."
sleep 3

# Start frontend
echo -e "${BLUE}🎨 啟動前端服務...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 安裝前端依賴..."
    pnpm install --silent
fi
pnpm dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ 前端服務已啟動 (PID: $FRONTEND_PID, Port: 5173)${NC}"
cd ..

echo ""
echo -e "${GREEN}=============================="
echo "🚀 系統已成功啟動！"
echo "=============================="
echo ""
echo "📊 前端: http://localhost:5173"
echo "🔧 後端: http://localhost:8000"
echo "📚 API 文檔: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服務"
echo "=============================="
echo -e "${NC}"

# Trap Ctrl+C to kill both processes
trap "echo ''; echo '🛑 正在停止服務...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for both processes
wait
