# 🧠 Fuzzy Logic Washing Machine Controller

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://fuzzylogic.yuudemo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)

Educational fuzzy logic washing machine controller with interactive visualization. Implements Mamdani inference method based on academic textbook specifications (Chapter 9).

🌐 **Live Demo**: [https://fuzzylogic.yuudemo.com](https://fuzzylogic.yuudemo.com)

## ✨ 功能特色

- 📊 **即時視覺化** - 歸屬函數、規則觸發、解模糊化過程
- 🎛️ **互動式控制** - 拖動滑桿即時觀察模糊推論變化
- 🎓 **教學導向** - 步驟化展示 Mamdani 推論過程
- 📈 **完整圖表** - 使用 Recharts 呈現專業圖表
- ⚡ **高性能** - Vite + React 前端，FastAPI 後端

## 🏗️ 技術架構

### 前端
- **框架**: Vite + React 19 + TypeScript
- **圖表**: Recharts
- **狀態管理**: React Hooks
- **HTTP 客戶端**: Axios
- **包管理**: pnpm

### 後端
- **框架**: FastAPI
- **計算引擎**: NumPy
- **推論方法**: Mamdani (Max-Min 合成)
- **包管理**: uv (現代化 Python 包管理器)

## 📦 安裝與啟動

### 前置需求

- Node.js >= 18
- Python >= 3.12
- pnpm
- uv

### 快速開始

#### 1. 安裝 uv (如果尚未安裝)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 2. 啟動後端服務

```bash
cd backend

# 安裝依賴
uv sync

# 啟動 API 服務器 (port 8000)
uv run uvicorn src.api.main:app --reload --port 8000
```

#### 3. 啟動前端服務

```bash
cd frontend

# 安裝依賴
pnpm install

# 啟動開發服務器 (port 5173)
pnpm dev
```

#### 4. 訪問應用

打開瀏覽器訪問 `http://localhost:5173`

## 🎮 使用說明

1. **調整輸入參數**
   - 使用左側滑桿調整污泥程度 (0-200)
   - 調整油污程度 (0-200)
   - 或點擊預設按鈕快速測試

2. **觀察視覺化結果**
   - 輸入歸屬函數圖：顯示當前輸入值的模糊化結果
   - 規則觸發狀態：查看哪些規則被啟動及其觸發強度
   - 解模糊化輸出：最終清洗時間計算結果

3. **理解推論過程**
   - 步驟 1：模糊化 (Fuzzification)
   - 步驟 2：規則評估 (Rule Evaluation with MIN)
   - 步驟 3：聚合 (Aggregation with MAX)
   - 步驟 4：解模糊化 (Defuzzification with COG)

## 📁 專案結構

```
fuzzy-logic-demo/
├── backend/                    # Python 後端
│   ├── src/
│   │   ├── fuzzy/             # 模糊邏輯引擎
│   │   │   ├── membership.py  # 歸屬函數定義
│   │   │   └── engine.py      # Mamdani 推論引擎
│   │   └── api/
│   │       └── main.py        # FastAPI 應用
│   ├── pyproject.toml         # uv 配置文件
│   ├── .env                   # 環境變數 (可修改 port)
│   └── README.md
│
└── frontend/                   # React 前端
    ├── src/
    │   ├── components/        # React 組件
    │   │   ├── InputControls.tsx
    │   │   ├── MembershipChart.tsx
    │   │   ├── RuleViewer.tsx
    │   │   └── OutputChart.tsx
    │   ├── types.ts           # TypeScript 類型定義
    │   ├── api.ts             # API 客戶端
    │   ├── App.tsx            # 主應用組件
    │   └── App.css            # 樣式
    ├── package.json
    ├── .env                   # 環境變數 (可修改 port)
    └── README.md
```

## ⚙️ 配置說明

### 後端 Port 配置

編輯 `backend/.env`:

```env
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true
```

### 前端 Port 配置

編輯 `frontend/.env`:

```env
VITE_APP_PORT=5173
VITE_API_URL=http://localhost:8000
VITE_API_PORT=8000
```

修改 port 後需要重啟服務。

## 🧪 API 端點

- `GET /` - API 文檔
- `POST /fuzzy/washing-machine` - 計算清洗時間
- `GET /fuzzy/membership-functions` - 獲取歸屬函數定義
- `GET /fuzzy/rules` - 獲取模糊規則庫
- `POST /fuzzy/visualize` - 獲取完整視覺化數據

## 📚 理論基礎

### Mamdani 模糊推論法

1. **模糊化 (Fuzzification)**
   - 將實數輸入值轉換為模糊集合的隸屬度

2. **規則評估 (Rule Evaluation)**
   - 使用 MIN 運算計算每條規則的觸發強度
   - 規則格式：IF x is A AND y is B THEN z is C

3. **聚合 (Aggregation)**
   - 使用 MAX 運算聚合所有規則的輸出

4. **解模糊化 (Defuzzification)**
   - 使用重心法 (COG) 將模糊輸出轉換為實數
   - 公式：y⁰ = ∫μ(y)·y dy / ∫μ(y) dy

### 洗衣機控制規則

| 污泥程度 | 油污程度 | 清洗時間 |
|---------|---------|---------|
| SD      | NG      | VS      |
| SD      | MG      | M       |
| SD      | LG      | L       |
| MD      | NG      | S       |
| MD      | MG      | M       |
| MD      | LG      | L       |
| LD      | NG      | M       |
| LD      | MG      | L       |
| LD      | LG      | VL      |

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🙏 致謝

基於 Chapter 9 模糊控制理論及其應用教材開發。
