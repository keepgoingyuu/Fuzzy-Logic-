# 前後端連接問題根本原因分析報告

## 問題概述

**症狀**: 前端無法連接到後端，出現 404 錯誤
- 錯誤訊息: `GET http://localhost:8200/fuzzy/visualize?dirt=120&grease=140 404 Not Found`
- 觀察到的異常行為:
  1. 使用 GET 方法而非 POST
  2. 參數在 URL query string 中，而非 request body
  3. 已清除快取、重啟、無痕模式仍然失敗

## 證據收集

### 後端配置 ✅ 正確
**檔案**: `/backend/src/api/main.py:139`
```python
@app.post("/fuzzy/visualize")
async def get_visualization_data(input_data: VisualizationInput):
```
- ✅ 正確使用 `@app.post` decorator
- ✅ CORS 配置包含 `http://localhost:5178`
- ✅ 接受 JSON body: `VisualizationInput` model

### 前端程式碼 ✅ 正確
**檔案**: `/frontend/src/api.ts:36`
```typescript
const response = await api.post('/fuzzy/visualize', {
  dirt_level: dirtLevel,
  grease_level: greaseLevel,
  num_points: numPoints,
});
```
- ✅ 正確使用 `api.post()`
- ✅ 資料在 body 中，不是 query parameters
- ✅ Axios 正確配置

### 環境配置 ⚠️ 潛在問題
**檔案**: `/.env` (專案根目錄)
```env
VITE_API_URL=http://localhost:8200
API_PORT=8200
VITE_APP_PORT=5178
```

**檔案**: `/frontend/vite.config.ts:7-9`
```typescript
const projectRoot = path.resolve(__dirname, '..')
const env = loadEnv(mode, projectRoot, 'VITE_')
```

**發現**:
- ✅ `.env` 存在於專案根目錄
- ✅ `vite.config.ts` 配置從父目錄載入 .env
- ⚠️ **但** Vite 的 `loadEnv` 在 config 中只影響 Vite 本身的配置（如 server.port）
- ⚠️ 應用程式執行時的 `import.meta.env` 需要 Vite 在**啟動時**讀取環境變數

### 自動觸發的 API 請求 ℹ️
**檔案**: `/frontend/src/components/InputControls.tsx:20-22`
```typescript
useEffect(() => {
  onInputChange(dirtLevel, greaseLevel);
}, [dirtLevel, greaseLevel, onInputChange]);
```
- 組件掛載時立即觸發
- 使用初始值: `dirt=120, grease=140`
- 這解釋了為什麼錯誤訊息中有這些特定數值

## 根本原因假說

### 🎯 主要假說: 環境變數載入問題

**問題**: 雖然 `vite.config.ts` 配置了從專案根目錄讀取 `.env`，但 Vite 預設行為是從**當前工作目錄**（即 `frontend/`）尋找 `.env` 檔案。

**證據鏈**:
1. `frontend/src/api.ts:7` → `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'`
2. 預設值是 `8000`，但錯誤訊息顯示 `8200`
3. 這表示**某些時候**讀到了正確的環境變數，但可能不一致

**驗證方法**:
```typescript
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
// 如果輸出 undefined → 環境變數未載入
// 如果輸出 http://localhost:8200 → 環境變數正確但有其他問題
```

### 🔍 次要假說: GET 請求之謎

**矛盾**:
- 程式碼明確使用 `api.post()`
- 但瀏覽器顯示 `GET` 請求

**可能原因**:

1. **CORS Preflight 失敗**
   - 瀏覽器先發送 OPTIONS 預檢請求
   - 預檢失敗，POST 請求根本沒發送
   - DevTools 可能誤報或顯示重定向

2. **Axios 配置錯誤**
   - baseURL 未正確設定
   - 請求被錯誤轉換

3. **Service Worker 或 Proxy 干擾**
   - 中間層修改請求方法

4. **瀏覽器快取未完全清除**
   - 雖然用戶聲稱已清除，但可能是磁碟快取

### 📊 Query Parameters 之謎

**矛盾**: POST body 資料怎麼會變成 URL query parameters?

**可能原因**:
1. **錯誤的堆疊追蹤**: 使用者看到的可能是另一個請求
2. **Axios 參數錯誤**: 雖然程式碼看起來正確，但執行時可能有問題
3. **瀏覽器重試機制**: 某些瀏覽器在 POST 失敗時會嘗試 GET

## 系統化調查計劃

### Phase 1: 環境變數驗證 (最高優先級)

**目標**: 確認 `import.meta.env.VITE_API_URL` 的實際值

**步驟**:
1. 已在 `api.ts` 中加入 debug logging（已完成）
2. 重啟開發伺服器
3. 檢查瀏覽器 Console 輸出

**預期結果**:
- ✅ 如果顯示 `http://localhost:8200` → 環境變數正確，問題在其他地方
- ❌ 如果顯示 `http://localhost:8000` 或 `undefined` → 環境變數問題

**解決方案（如果環境變數未載入）**:
```bash
# 方案 A: 在 frontend/ 建立 .env.local
cd frontend
echo "VITE_API_URL=http://localhost:8200" > .env.local

# 方案 B: 使用命令行傳遞
VITE_API_URL=http://localhost:8200 pnpm dev
```

### Phase 2: 請求驗證 (中優先級)

**目標**: 確認 Axios 實際發送的請求

**步驟**:
1. 已在 `api.ts` 中加入 request/response interceptors（已完成）
2. 重啟開發伺服器
3. 觀察 Console 輸出的 "🚀 Axios Request" 日誌

**預期結果**:
- ✅ `method: 'POST'`
- ✅ `data: {dirt_level: 120, grease_level: 140, num_points: 200}`
- ✅ `params: undefined`
- ✅ `fullURL: 'http://localhost:8200/fuzzy/visualize'`

**如果不符合預期**: 有 Axios 配置問題

### Phase 3: 網路層驗證 (中優先級)

**目標**: 確認瀏覽器實際發送的請求

**步驟**:
1. 開啟 Chrome DevTools → Network 標籤
2. 勾選 "Preserve log"
3. 刷新頁面
4. 找到 `/fuzzy/visualize` 請求
5. 檢查:
   - Request Method
   - Request Headers
   - Request Payload / Form Data
   - Response

**可能發現**:
- 如果看到 OPTIONS 請求失敗 → CORS 問題
- 如果看到 POST 200 但前端仍報錯 → 回應格式問題
- 如果真的是 GET → 需要深入調查請求來源

### Phase 4: 後端驗證 (低優先級)

**目標**: 確認後端收到什麼請求

**步驟**:
1. 在後端 `main.py` 的 `get_visualization_data` 函數開頭加入:
```python
@app.post("/fuzzy/visualize")
async def get_visualization_data(input_data: VisualizationInput):
    print(f"🔍 Received request: dirt={input_data.dirt_level}, grease={input_data.grease_level}")
```

2. 觀察後端 terminal 輸出

**預期**: 應該看到 POST 請求日誌

## 立即行動方案

### 🚨 緊急修復（臨時測試用）

如果需要立即驗證其他部分是否正常，可以暫時硬編碼 API URL:

```typescript
// 在 api.ts 中
const API_BASE_URL = 'http://localhost:8200';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

⚠️ **注意**: 這只是測試用，驗證後必須改回來

### 🔧 推薦解決方案

**建立 frontend/.env.local**（Vite 預設讀取位置）:

```bash
cd /Users/yuu/NUTC/W5行動式嵌入路式系統/模糊推論/fuzzy-logic-demo/frontend

cat > .env.local << 'EOF'
# Frontend 本地環境變數（優先於 .env）
VITE_API_URL=http://localhost:8200
VITE_APP_PORT=5178
EOF

# 完全重啟開發伺服器
# 1. Ctrl+C 停止現有伺服器
# 2. 重新啟動
pnpm dev
```

**為什麼這樣做**:
1. `.env.local` 是 Vite 的本地覆蓋檔案
2. 優先級高於專案根目錄的 `.env`
3. 不會被 git 追蹤（已在 .gitignore）
4. 更符合 Vite 的慣例

## 驗證成功標準

修復後，Console 應該顯示:

```
🔍 API Configuration:
  - API_BASE_URL: http://localhost:8200
  - VITE_API_URL: http://localhost:8200
  - All VITE_ vars: ['VITE_API_URL', 'VITE_APP_PORT']

🚀 Axios Request:
  method: POST
  url: /fuzzy/visualize
  baseURL: http://localhost:8200
  fullURL: http://localhost:8200/fuzzy/visualize
  hasData: true
  data: {dirt_level: 120, grease_level: 140, num_points: 200}
  hasParams: false

✅ Axios Response:
  status: 200
  url: /fuzzy/visualize
  dataKeys: ['inference_result', 'membership_curves', 'aggregated_output']
```

## 後續預防措施

1. **環境變數文件化**
   - 在 README 中說明環境變數設定
   - 提供 `.env.example` 範本

2. **開發環境檢查**
   - 在應用啟動時驗證關鍵環境變數
   - 如果 `VITE_API_URL` 未設定，顯示警告

3. **錯誤處理改進**
   - 提供更明確的連接錯誤訊息
   - 區分 CORS 錯誤 vs 404 錯誤 vs 網路錯誤

4. **監控和日誌**
   - 保留當前的 debug logging（或用環境變數控制）
   - 幫助快速診斷未來問題

## 結論

**最可能的根本原因**: 環境變數 `VITE_API_URL` 未在應用執行時正確載入，導致使用預設值 `http://localhost:8000`，或者配置讀取時機問題。

**建議解決方案**: 在 `frontend/.env.local` 建立本地環境變數檔案，確保 Vite 能正確讀取。

**下一步**: 執行 Phase 1 診斷步驟，檢查 Console 輸出確認環境變數狀態。
