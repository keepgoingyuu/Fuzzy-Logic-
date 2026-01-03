# 📖 使用指南

## 系統概述

這是一個基於 Mamdani 模糊推論法的洗衣機控制系統教學演示。

### 輸入變數
1. **污泥程度 (Dirt Level)**: 0-200
   - SD (Small Dirty): 小量污泥
   - MD (Medium Dirty): 中等污泥
   - LD (Large Dirty): 大量污泥

2. **油污程度 (Grease Level)**: 0-200
   - NG (No Grease): 無油污
   - MG (Medium Grease): 中等油污
   - LG (Large Grease): 重油污

### 輸出變數
**清洗時間 (Wash Time)**: 0-60 分鐘
- VS (Very Short): 極短 (0-10分)
- S (Short): 短 (0-25分)
- M (Medium): 中等 (10-40分)
- L (Long): 長 (25-60分)
- VL (Very Long): 極長 (40-60分)

## 使用場景

### 場景 1: 輕度髒污衣物
**輸入設定：**
- 污泥程度: 50
- 油污程度: 30

**預期結果：**
- 清洗時間: ~16-18 分鐘
- 主要啟動規則: SD + NG → VS

**適用情況：**
- 日常換洗衣物
- 輕微汗漬
- 短時間穿著的衣物

### 場景 2: 中度髒污衣物
**輸入設定：**
- 污泥程度: 120
- 油污程度: 140

**預期結果：**
- 清洗時間: ~33-35 分鐘
- 主要啟動規則: MD + MG → M, MD + LG → L

**適用情況：**
- 運動後衣物
- 有明顯污漬
- 廚房工作服

### 場景 3: 重度髒污衣物
**輸入設定：**
- 污泥程度: 180
- 油污程度: 180

**預期結果：**
- 清洗時間: ~42-45 分鐘
- 主要啟動規則: LD + LG → VL

**適用情況：**
- 工作服
- 嚴重油污
- 戶外活動衣物

## 操作步驟

### 1. 基本操作

```
1. 打開系統 (http://localhost:5173)
2. 在左側控制面板調整滑桿
3. 觀察右側圖表變化
4. 查看最終輸出結果
```

### 2. 預設場景測試

點擊左側預設按鈕快速測試：
- 🧼 輕度髒污 (50, 30)
- 🧽 中度髒污 (120, 140)
- 🧴 重度髒污 (180, 180)

### 3. 自定義測試

手動調整滑桿探索不同組合：
- 試試邊界值 (0, 200)
- 測試相同污泥但不同油污
- 測試相同油污但不同污泥

## 理解視覺化

### 歸屬函數圖 (Membership Functions)

**X 軸**: 輸入/輸出變數的值
**Y 軸**: 歸屬度 (μ, 0-1)
**紅色虛線**: 當前輸入值

**如何解讀：**
- 查看紅線與各曲線的交點
- 交點的 Y 值 = 該模糊集的歸屬度
- 多個交點 = 輸入同時屬於多個模糊集

**示例：**
```
污泥程度 = 100
- SD 歸屬度 = 0.0 (完全不屬於)
- MD 歸屬度 = 1.0 (完全屬於)
- LD 歸屬度 = 0.0 (完全不屬於)
```

### 規則觸發狀態 (Rule Activations)

**觸發強度條：**
- 灰色: 未啟動 (0.0)
- 黃色: 弱啟動 (0.0-0.3)
- 橙色: 中啟動 (0.3-0.6)
- 紅色: 強啟動 (0.6-1.0)

**排序：**
- 規則按觸發強度降序排列
- 最強的規則在最上方

**MIN 運算：**
```
IF dirt is MD (0.6) AND grease is LG (0.4)
THEN wash_time is L

觸發強度 = MIN(0.6, 0.4) = 0.4
```

### 解模糊化輸出 (Defuzzification)

**藍色區域**: 聚合的輸出歸屬函數
**紅色虛線**: 重心位置 (COG)
**結果數值**: 最終清洗時間

**重心法公式：**
```
y⁰ = ∫μ(y)·y dy / ∫μ(y) dy
```

**物理意義：**
- 找出藍色區域的"質心"
- 平衡所有規則的影響
- 得出單一明確的輸出值

## 教學建議

### 實驗 1: 單一變數影響
1. 固定油污程度 = 100
2. 逐步增加污泥程度 0 → 200
3. 觀察清洗時間變化曲線

### 實驗 2: 規則觸發觀察
1. 設定污泥 = 100, 油污 = 100
2. 注意哪條規則觸發強度最高
3. 微調輸入值觀察規則切換

### 實驗 3: MAX-MIN 運算理解
1. 選擇會觸發多條規則的輸入
2. 觀察每條規則的 MIN 計算
3. 查看輸出如何 MAX 聚合

### 實驗 4: 重心法驗證
1. 選擇極端輸入 (0,0) 或 (200,200)
2. 觀察輸出歸屬函數形狀
3. 驗證重心位置是否合理

## 常見問題

**Q: 為什麼輸出不是整數？**
A: 重心法計算的是連續值，反映了模糊邏輯的本質。

**Q: 多條規則觸發時如何計算？**
A: 使用 MAX 運算聚合，取最大歸屬度。

**Q: 為什麼有時候清洗時間跳躍變化？**
A: 當主導規則切換時會發生，這是模糊推論的特性。

**Q: 如何驗證結果正確性？**
A: 可以手動計算簡單案例，或參考測試腳本輸出。

## API 使用

如果想要在自己的程式中使用：

```python
import requests

response = requests.post(
    "http://localhost:8000/fuzzy/washing-machine",
    json={"dirt_level": 120, "grease_level": 140}
)

result = response.json()
wash_time = result["wash_time"]
print(f"清洗時間: {wash_time:.2f} 分鐘")
```

```javascript
const response = await fetch('http://localhost:8000/fuzzy/washing-machine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ dirt_level: 120, grease_level: 140 })
});

const result = await response.json();
console.log(`清洗時間: ${result.wash_time.toFixed(2)} 分鐘`);
```

## 進階功能

### 修改規則庫

編輯 `backend/src/fuzzy/engine.py` 中的 `create_washing_machine_engine()`:

```python
rule_table = [
    # 加入新規則
    ({"dirt": "SD", "grease": "NG"}, ("wash_time", "VS")),
    # ... 更多規則
]
```

### 自定義歸屬函數

編輯 `backend/src/fuzzy/membership.py` 中的 `create_washing_machine_variables()`:

```python
dirt.add_mf(TriangularMF("SD", 0, 0, 100))  # 修改參數
```

### 添加新變數

1. 在 `membership.py` 定義新變數
2. 在 `engine.py` 加入推論規則
3. 在前端新增對應的圖表組件

## 學習資源

- [模糊邏輯理論](./README.md#-理論基礎)
- [API 文檔](http://localhost:8000/docs)
- [原始教材](../fuzzyCh9/)

享受模糊邏輯的學習之旅！🎓
