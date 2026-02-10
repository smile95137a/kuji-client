# 🚀 前端 ENUM 快速查詢表

> **快速參考**：各頁面該拿什麼 Category / SubCategory / Status

---

## 📋 所有商品分類一覽

### 主分類（Category）

| 代碼 | 顯示名稱 | 路由 | 專屬列表頁 |
|-----|---------|------|-----------|
| `OFFICIAL_ICHIBAN` | 官方一番賞 | `/ichiban/:id` | ❌ |
| `CUSTOM_GACHA` | 自製賞 | `/ichiban/:id` | ❌ |
| `PRIZE_CAPSULE` | 扭蛋 | `/gacha/:id` | ✅ `/gacha` |
| `SCRATCH_CARD` | 刮刮樂 | `/scratch/:id` | ✅ `/scratch` |
| `CARD_DRAW` | 卡牌抽選 | `/ichiban/:id` | ❌ |

---

## 🗂️ 各頁面使用的篩選條件

### 1. **首頁** (`Home.vue`)

```typescript
// 顯示所有上架商品
category: undefined  // 不限制
status: ['ON_SHELF', 'IN_PROGRESS']
```

---

### 2. **商品列表** (`IchibanList.vue`)

```typescript
// 可篩選的 Category
const filters = [
  { label: '全部', value: '' },
  { label: '一番賞', value: 'OFFICIAL_ICHIBAN' },
  { label: '自製賞', value: 'CUSTOM_GACHA' },
  { label: '扭蛋', value: 'PRIZE_CAPSULE' },
  { label: '刮刮樂', value: 'SCRATCH_CARD' },
  { label: '卡牌', value: 'CARD_DRAW' },
];

// 只顯示前台可見狀態
status: ['ON_SHELF', 'IN_PROGRESS', 'ENDED']
```

---

### 3. **商品詳情** (`IchibanDetail.vue`)

```typescript
// 根據 category 選擇動畫

OFFICIAL_ICHIBAN → 撕卡動畫 (gachaTearDialog) + 結果總覽 (ichibanResultDialog)
CUSTOM_GACHA → 根據 subCategory 決定：
  - LOTTERY_MODE → 撕卡 + 總覽
  - SCRATCH_MODE → 刮刮樂 (scratchCardDialog)
  - SCRATCH_CARD_MODE → 翻牌 (ichibanResultCardDialog)
PRIZE_CAPSULE → 扭蛋機 (gotchaDialog)
SCRATCH_CARD → 刮刮樂 (scratchCardDialog)
CARD_DRAW → 翻牌 (ichibanResultCardDialog)
```

---

### 4. **扭蛋專區** (`GachaList.vue`)

```typescript
// 固定篩選
category: 'PRIZE_CAPSULE'
status: ['ON_SHELF', 'IN_PROGRESS']
```

---

### 5. **刮刮樂專區** (`ScratchCardList.vue`)

```typescript
// 固定篩選
category: 'SCRATCH_CARD'
status: ['ON_SHELF', 'IN_PROGRESS']
```

---

### 6. **店家商品頁** (`StoreLotteries.vue`)

```typescript
// 可篩選的 Category
const filters = [
  { label: '全部', value: '' },
  { label: '官方一番賞', value: 'OFFICIAL_ICHIBAN' },
  { label: '自製賞', value: 'CUSTOM_GACHA' },
  { label: '扭蛋', value: 'PRIZE_CAPSULE' },
  { label: '刮刮樂', value: 'SCRATCH_CARD' },
  { label: '卡牌抽選', value: 'CARD_DRAW' },
];

// 店家ID
storeId: route.params.id
```

---

## 🎨 Category → 動畫映射表

| Category | SubCategory | 動畫 Dialog | 特殊功能 |
|----------|-------------|------------|---------|
| `OFFICIAL_ICHIBAN` | `LOTTERY_MODE` | `gachaTearDialog` → `ichibanResultDialog` | ✅ 跳過按鈕 |
| `CUSTOM_GACHA` | `LOTTERY_MODE` | `gachaTearDialog` → `ichibanResultDialog` | ✅ 跳過按鈕 |
| `CUSTOM_GACHA` | `SCRATCH_MODE` | `scratchCardDialog` | ❌ |
| `CUSTOM_GACHA` | `SCRATCH_CARD_MODE` | `ichibanResultCardDialog` | ❌ |
| `PRIZE_CAPSULE` | `LOTTERY_MODE` | `gotchaDialog` | ❌ |
| `SCRATCH_CARD` | `SCRATCH_MODE` | `scratchCardDialog` | ❌ |
| `CARD_DRAW` | `SCRATCH_CARD_MODE` | `ichibanResultCardDialog` | ❌ |

---

## 📦 商品狀態（Status）篩選

### 前台顯示規則

```typescript
// 前台可見狀態
const VISIBLE_STATUSES = ['ON_SHELF', 'IN_PROGRESS', 'ENDED'];

// 可抽獎狀態
const DRAWABLE_STATUSES = ['ON_SHELF', 'IN_PROGRESS'];
```

| Status | 前台可見 | 可抽獎 | 使用場景 |
|--------|---------|-------|---------|
| `DRAFT` | ❌ | ❌ | 草稿，編輯中 |
| `OFF_SHELF` | ❌ | ❌ | 已下架 |
| `ON_SHELF` | ✅ | ✅ | 正常販售 |
| `IN_PROGRESS` | ✅ | ✅ | 已有人抽獎 |
| `ENDED` | ✅ | ❌ | 已抽完，僅展示 |
| `FORCED_OFF` | ❌ | ❌ | 違規下架 |

---

## 🏆 獎項等級（PrizeLevel）

| 代碼 | 顯示 | 排序 | 顏色建議 | 說明 |
|-----|------|-----|---------|------|
| `GRAND` | 大賞 | 99 | `#FFD700` (金色) | 特殊獎，影響降價 |
| `LAST` | 最後賞 | 98 | `#FF6347` (紅色) | 最後一張自動觸發 |
| `A` | A賞 | 1 | `#87CEEB` (天藍) | 最高等級 |
| `B` | B賞 | 2 | `#98D8C8` (薄荷綠) | - |
| `C` | C賞 | 3 | `#F7DC6F` (檸檬黃) | - |
| `D` | D賞 | 4 | `#BB8FCE` (薰衣草紫) | - |
| `E` | E賞 | 5 | `#F8B500` (橙色) | - |
| `F` | F賞 | 6 | `#85C1E2` (淺藍) | - |
| `G` | G賞 | 7 | `#C0C0C0` (銀色) | - |

---

## 🎁 獎品類型（PrizeType）

| 代碼 | 顯示 | 需配送 | 領取流程 |
|-----|------|-------|---------|
| `PHYSICAL` | 實體獎品 | ✅ | 填寫配送地址 → 店家出貨 |
| `DIGITAL` | 數位獎品 | ❌ | 顯示兌換碼 / 序號 |
| `POINT` | 點數獎品 | ❌ | 自動加入帳戶餘額 |

---

## 🔧 TypeScript 類型定義（複製使用）

```typescript
// src/types/lottery.ts

export type LotteryCategory =
  | 'OFFICIAL_ICHIBAN'
  | 'CUSTOM_GACHA'
  | 'PRIZE_CAPSULE'
  | 'SCRATCH_CARD'
  | 'CARD_DRAW';

export type LotterySubCategory =
  | 'LOTTERY_MODE'
  | 'SCRATCH_MODE'
  | 'SCRATCH_CARD_MODE';

export type LotteryStatus =
  | 'DRAFT'
  | 'OFF_SHELF'
  | 'ON_SHELF'
  | 'IN_PROGRESS'
  | 'ENDED'
  | 'FORCED_OFF';

export type PrizeLevel =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  | 'LAST' | 'GRAND';

export type PrizeType =
  | 'PHYSICAL'
  | 'DIGITAL'
  | 'POINT';
```

---

## 📊 API 查詢範例

### 查詢官方一番賞（上架中）

```typescript
GET /api/lottery/browse
{
  category: 'OFFICIAL_ICHIBAN',
  status: 'ON_SHELF',
  page: 0,
  size: 20
}
```

---

### 查詢扭蛋專區（進行中 + 上架中）

```typescript
GET /api/lottery/browse
{
  category: 'PRIZE_CAPSULE',
  status: 'ON_SHELF,IN_PROGRESS',
  page: 0,
  size: 20
}
```

---

### 查詢店家所有商品

```typescript
GET /api/lottery/browse
{
  storeId: 'store-uuid',
  status: 'ON_SHELF,IN_PROGRESS,ENDED',
  page: 0,
  size: 20
}
```

---

## ⚡ 快速複製：篩選器配置

### 商品分類篩選器

```typescript
const categoryOptions = [
  { label: '全部', value: '' },
  { label: '官方一番賞', value: 'OFFICIAL_ICHIBAN' },
  { label: '自製賞', value: 'CUSTOM_GACHA' },
  { label: '扭蛋', value: 'PRIZE_CAPSULE' },
  { label: '刮刮樂', value: 'SCRATCH_CARD' },
  { label: '卡牌抽選', value: 'CARD_DRAW' },
];
```

---

### 狀態篩選器（前台）

```typescript
const statusOptions = [
  { label: '全部', value: '' },
  { label: '販售中', value: 'ON_SHELF' },
  { label: '進行中', value: 'IN_PROGRESS' },
  { label: '已結束', value: 'ENDED' },
];
```

---

### 獎項等級篩選器

```typescript
const prizeLevelOptions = [
  { label: 'A賞', value: 'A' },
  { label: 'B賞', value: 'B' },
  { label: 'C賞', value: 'C' },
  { label: 'D賞', value: 'D' },
  { label: 'E賞', value: 'E' },
  { label: 'F賞', value: 'F' },
  { label: 'G賞', value: 'G' },
  { label: '最後賞', value: 'LAST' },
  { label: '大賞', value: 'GRAND' },
];
```

---

## 🎯 常用判斷邏輯

### 判斷是否可抽獎

```typescript
const canDraw = (status: LotteryStatus): boolean => {
  return ['ON_SHELF', 'IN_PROGRESS'].includes(status);
};
```

---

### 判斷是否為實體獎品

```typescript
const needsShipping = (prizeType: PrizeType): boolean => {
  return prizeType === 'PHYSICAL';
};
```

---

### 根據 Category 取得顯示名稱

```typescript
const getCategoryLabel = (category: LotteryCategory): string => {
  const labels: Record<LotteryCategory, string> = {
    OFFICIAL_ICHIBAN: '官方一番賞',
    CUSTOM_GACHA: '自製賞',
    PRIZE_CAPSULE: '扭蛋',
    SCRATCH_CARD: '刮刮樂',
    CARD_DRAW: '卡牌抽選',
  };
  return labels[category] || '其他';
};
```

---

### 根據等級取得顏色

```typescript
const getPrizeLevelColor = (level: PrizeLevel): string => {
  const colors: Record<PrizeLevel, string> = {
    GRAND: '#FFD700',
    LAST: '#FF6347',
    A: '#87CEEB',
    B: '#98D8C8',
    C: '#F7DC6F',
    D: '#BB8FCE',
    E: '#F8B500',
    F: '#85C1E2',
    G: '#C0C0C0',
  };
  return colors[level] || '#C0C0C0';
};
```

---

## 📝 待處理事項

### ⚠️ 前後端不一致問題

目前前端代碼中仍存在以下已廢棄的代碼：

1. **`GACHA`** → 應改為 `PRIZE_CAPSULE`
2. **`TRADING_CARD`** → 應改為 `CARD_DRAW`

**建議修正位置**：
- 檢查所有 `.vue` 文件中的 category 引用
- 更新 TypeScript 類型定義
- 統一使用後端 ENUM 代碼

---

## 🔗 相關文檔

- **後端 ENUM 完整指南**：`ENUM_CLASSIFICATION_GUIDE.md`
- **前端詳細映射**：`FRONTEND_ENUM_MAPPING.md`
- **Copilot 開發指南**：`copilot-instructions.md`

---

**最後更新**：2026-02-07  
**維護者**：Frontend Team
