# 🚀 快速開始指南

## 一鍵啟動（推薦）

```bash
./start.sh
```

這個腳本會自動：
- 檢查並安裝 uv
- 安裝後端依賴
- 安裝前端依賴
- 啟動後端服務 (port 8000)
- 啟動前端服務 (port 5173)
- 自動打開瀏覽器

## 手動啟動

### 方式一：使用終端機

**終端機 1 - 後端：**
```bash
cd backend
uv sync
uv run uvicorn src.api.main:app --reload --port 8000
```

**終端機 2 - 前端：**
```bash
cd frontend
pnpm install
pnpm dev
```

### 方式二：使用 VS Code

1. 安裝推薦擴展：
   - Python
   - Pylance
   - ESLint
   - Prettier

2. 打開兩個終端：
   - 終端 1：執行後端
   - 終端 2：執行前端

## 驗證安裝

### 檢查後端

訪問 `http://localhost:8000/docs` 查看 API 文檔

或使用 curl 測試：
```bash
curl -X POST "http://localhost:8000/fuzzy/washing-machine" \
  -H "Content-Type: application/json" \
  -d '{"dirt_level": 120, "grease_level": 140}'
```

### 檢查前端

訪問 `http://localhost:5173` 應該看到：
- 🧠 模糊邏輯控制器教學系統標題
- 左側輸入控制滑桿
- 歡迎訊息

## 常見問題

### Q: Port 已被占用怎麼辦？

**後端 Port 修改：**
編輯 `backend/.env`
```env
API_PORT=8001  # 改成其他 port
```

**前端 Port 修改：**
編輯 `frontend/.env`
```env
VITE_APP_PORT=5174  # 改成其他 port
VITE_API_URL=http://localhost:8001  # 對應後端 port
```

### Q: 前端無法連接後端？

1. 確認後端服務已啟動
2. 檢查 `frontend/.env` 中的 `VITE_API_URL`
3. 檢查瀏覽器 Console 是否有 CORS 錯誤
4. 確認防火牆沒有阻擋 8000 port

### Q: pnpm 相關錯誤？

```bash
# 清除並重新安裝
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q: uv 相關錯誤？

```bash
# 重新安裝 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 重新同步依賴
cd backend
uv sync --reinstall
```

### Q: React 組件無法載入？

檢查所有組件檔案是否存在：
```bash
cd frontend/src
ls components/
# 應該看到：
# InputControls.tsx
# MembershipChart.tsx
# RuleViewer.tsx
# OutputChart.tsx
```

## 開發提示

### 熱重載

- 前端：Vite 自動熱重載，修改檔案後自動更新
- 後端：使用 `--reload` 參數，修改代碼後自動重啟

### 除錯模式

**前端除錯：**
- 打開瀏覽器開發者工具 (F12)
- 查看 Console 和 Network 標籤

**後端除錯：**
- 查看終端機輸出
- 訪問 `http://localhost:8000/docs` 測試 API

### 效能優化

如果系統回應緩慢：
1. 減少視覺化點數（修改 `num_points` 參數）
2. 使用預設按鈕而非頻繁調整滑桿
3. 檢查網路連線狀況

## 下一步

閱讀完整文檔：
- [README.md](./README.md) - 完整專案說明
- [backend/README.md](./backend/README.md) - 後端 API 文檔
- [模糊邏輯理論](./README.md#-理論基礎) - 理論說明

開始使用：
1. 調整污泥程度和油污程度滑桿
2. 觀察歸屬函數圖表變化
3. 查看規則觸發狀態
4. 理解解模糊化過程
5. 嘗試不同的輸入組合

享受學習模糊邏輯的樂趣！🎓
