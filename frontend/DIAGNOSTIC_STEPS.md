# 前後端連接診斷步驟

## 問題摘要
- **症狀**: 前端顯示 404 錯誤，Console 顯示使用 GET 方法請求 `/fuzzy/visualize?dirt=120&grease=140`
- **預期**: 應該使用 POST 方法，參數在 request body 中，不是 URL query parameters

## 根本原因分析

### 已確認的事實
1. ✅ 後端路由正確: `@app.post("/fuzzy/visualize")` (POST only)
2. ✅ 前端程式碼正確: `api.post('/fuzzy/visualize', {...})` (使用 POST)
3. ✅ .env 檔案存在於專案根目錄，配置正確:
   - `VITE_API_URL=http://localhost:8200`
   - `API_PORT=8200`
4. ✅ Vite 配置正確讀取 .env 從專案根目錄
5. ❌ 瀏覽器顯示 GET 請求（與程式碼矛盾）

### 可能的根本原因

**主要假說**: 環境變數未在執行時正確載入

雖然 vite.config.ts 配置了從父目錄讀取 .env，但這只影響 Vite 的開發伺服器配置（例如 port）。
應用程式本身讀取 `import.meta.env.VITE_API_URL` 時，Vite 需要在**啟動時**就讀取這個變數。

**次要假說**:
1. TypeScript 編譯快取
2. 瀏覽器 Service Worker 干擾
3. CORS Preflight 失敗被誤報為 GET

## 診斷步驟

### 步驟 1: 驗證環境變數載入

在 `src/api.ts` 中加入 debug logging:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// DEBUG: 加入這行
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 All env vars:', import.meta.env);
```

重新啟動開發伺服器並檢查 Console 輸出。

**預期結果**: 應該看到 `http://localhost:8200`
**如果看到**: `http://localhost:8000` → 環境變數未載入

### 步驟 2: 驗證 Axios 請求配置

在 `src/api.ts` 中加入 request interceptor:

```typescript
api.interceptors.request.use(request => {
  console.log('🚀 Axios Request:', {
    method: request.method,
    url: request.url,
    baseURL: request.baseURL,
    data: request.data,
    params: request.params
  });
  return request;
});
```

**預期結果**: 應該看到 method: 'post', data: {dirt_level: 120, ...}
**如果看到**: method: 'get' 或 params 有值 → Axios 配置問題

### 步驟 3: 檢查 Network Tab

1. 開啟瀏覽器開發者工具
2. 切換到 Network 標籤
3. 刷新頁面
4. 點擊 `/fuzzy/visualize` 請求
5. 檢查:
   - Request Method (應該是 POST)
   - Request Headers (Content-Type: application/json)
   - Request Payload (應該有 dirt_level, grease_level)

### 步驟 4: 驗證後端 CORS 設定

檢查後端 console 輸出，確認:
```
INFO:     127.0.0.1:xxxxx - "OPTIONS /fuzzy/visualize HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /fuzzy/visualize HTTP/1.1" 200 OK
```

如果看到:
```
INFO:     127.0.0.1:xxxxx - "OPTIONS /fuzzy/visualize HTTP/1.1" 403 Forbidden
```
→ CORS 問題

### 步驟 5: 完全清除並重建

```bash
# 在 frontend 目錄
rm -rf node_modules .vite dist
pnpm install
pnpm dev

# 在新的 terminal，確認環境變數
cd /Users/yuu/NUTC/W5行動式嵌入路式系統/模糊推論/fuzzy-logic-demo
cat .env | grep VITE_API_URL
```

## 快速修復方案

### 方案 A: 確保 .env 在正確位置並重啟

```bash
# 確認 .env 在專案根目錄
ls -la /Users/yuu/NUTC/W5行動式嵌入路式系統/模糊推論/fuzzy-logic-demo/.env

# 完全停止所有開發伺服器 (Ctrl+C)
# 然後重新啟動

cd /Users/yuu/NUTC/W5行動式嵌入路式系統/模糊推論/fuzzy-logic-demo/frontend
pnpm dev
```

### 方案 B: 在 frontend/.env.local 建立本地環境變數

```bash
# 建立 frontend/.env.local (Vite 預設讀取位置)
cd /Users/yuu/NUTC/W5行動式嵌入路式系統/模糊推論/fuzzy-logic-demo/frontend
cat > .env.local << EOF
VITE_API_URL=http://localhost:8200
VITE_APP_PORT=5178
EOF
```

然後重啟開發伺服器。

### 方案 C: 硬編碼 API URL (臨時測試用)

修改 `src/api.ts`:
```typescript
// 臨時硬編碼用於測試
const API_BASE_URL = 'http://localhost:8200';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

**注意**: 這只是測試用，不要 commit 這個修改。

## 驗證成功

當修復成功時，你應該看到:
1. ✅ Console 無錯誤訊息
2. ✅ Network Tab 顯示 `POST /fuzzy/visualize` 狀態 200
3. ✅ 頁面顯示模糊推論結果圖表
4. ✅ 調整滑桿時即時更新

## 額外檢查事項

1. **Port 衝突**: 確認沒有其他程式佔用 8200
   ```bash
   lsof -i :8200
   ```

2. **後端是否正在運行**:
   ```bash
   curl http://localhost:8200/
   # 應該回傳 JSON with API info
   ```

3. **前端開發伺服器 port**:
   ```bash
   lsof -i :5178
   # 應該顯示 node/vite 程序
   ```
