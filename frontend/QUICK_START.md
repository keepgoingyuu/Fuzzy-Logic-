# 🚀 前後端連接問題 - 快速解決指南

## TL;DR (太長不看版)

**問題**: 前端顯示 404，無法連接後端
**原因**: 環境變數 `VITE_API_URL` 未正確載入
**快速修復**:

```bash
cd /Users/yuu/NUTC/W5行動式嵌入路式系統/模糊推論/fuzzy-logic-demo/frontend

# 方法 1: 執行自動修復腳本
./fix-env.sh

# 方法 2: 手動建立 .env.local
echo "VITE_API_URL=http://localhost:8200" > .env.local
echo "VITE_APP_PORT=5178" >> .env.local

# 重啟開發伺服器
pnpm dev
```

## 為什麼會有這個問題？

1. ✅ 專案根目錄有 `.env` 檔案，配置正確
2. ✅ `vite.config.ts` 配置從父目錄讀取 `.env`
3. ❌ **但** Vite 執行時讀取環境變數的優先順序是:
   - `frontend/.env.local` (最高優先)
   - `frontend/.env`
   - 專案根目錄的 `.env` (最低優先)

4. ❌ 因為 `frontend/` 沒有 `.env.local` 或 `.env`，而 Vite 預設不會自動從父目錄讀取應用程式的環境變數（只有在 vite.config.ts 中明確配置才會）

## 診斷步驟

已在程式碼中加入 debug logging。重啟後檢查瀏覽器 Console:

### ✅ 成功時應該看到:

```
🔍 API Configuration:
  - API_BASE_URL: http://localhost:8200    ← 正確！
  - VITE_API_URL: http://localhost:8200    ← 正確！

🚀 Axios Request:
  method: POST                              ← 正確！
  fullURL: http://localhost:8200/fuzzy/visualize

✅ Axios Response:
  status: 200                               ← 成功！
```

### ❌ 失敗時會看到:

```
🔍 API Configuration:
  - API_BASE_URL: http://localhost:8000    ← 錯誤！應該是 8200
  - VITE_API_URL: undefined                ← 環境變數未載入

❌ Axios Error:
  status: 404                               ← 因為連到錯誤的 port
```

## 詳細檔案

- **ROOT_CAUSE_ANALYSIS.md** - 完整的根本原因分析報告
- **DIAGNOSTIC_STEPS.md** - 系統化診斷步驟
- **fix-env.sh** - 自動修復腳本

## 驗證後端是否正常運行

```bash
# 檢查後端 port 8200 是否開啟
lsof -i :8200

# 測試後端 API
curl http://localhost:8200/

# 應該回傳類似:
# {"message":"Fuzzy Logic Controller API","version":"0.1.0",...}
```

## 常見問題

### Q: 我已經重啟過了，為什麼還是不行？

A: 重啟是必要的，但關鍵是確保 `.env.local` 檔案存在於 `frontend/` 目錄。

### Q: 為什麼不直接在程式碼中硬編碼 URL？

A: 可以，但這是臨時測試方案。正確的做法是使用環境變數，以便在不同環境（開發、測試、生產）使用不同配置。

### Q: 我看到 GET 請求而不是 POST，為什麼？

A: 這可能是:
1. CORS preflight 失敗
2. 瀏覽器快取舊版本的程式碼
3. 實際上是其他錯誤的請求（檢查完整的 Network tab）

加入 debug logging 後可以清楚看到 Axios 實際發送的是什麼請求。

### Q: 清除快取後仍然失敗？

A: 嘗試:
1. 使用無痕模式（已確認無效）
2. 清除 `node_modules/.vite` 快取:
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```
3. 檢查是否有 Service Worker 在運行

## 需要幫助？

如果問題仍然存在，請提供:
1. 瀏覽器 Console 的 "🔍 API Configuration" 輸出
2. 瀏覽器 Console 的 "🚀 Axios Request" 輸出
3. 瀏覽器 Console 的錯誤訊息
4. Network Tab 中 `/fuzzy/visualize` 請求的詳細資訊

這些資訊可以幫助精確定位問題。
