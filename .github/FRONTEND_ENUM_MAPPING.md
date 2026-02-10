# 🎯 前端 ENUM 完整分類與頁面映射指南

> **最後更新**：2026-02-07  
> **專案**：KUJI Client (Vue 3 + TypeScript)  
> **版本**：1.0.0  
> **對應後端文檔**：ENUM_CLASSIFICATION_GUIDE.md

---

## 📊 目錄

1. [商品分類總覽](#商品分類總覽)
2. [前端頁面映射](#前端頁面映射)
3. [Category vs SubCategory 完整對照](#category-vs-subcategory-完整對照)
4. [動畫系統映射](#動畫系統映射)
5. [路由與篩選配置](#路由與篩選配置)
6. [TypeScript 類型定義](#typescript-類型定義)
7. [實際使用範例](#實際使用範例)

---

## 🎮 商品分類總覽

### 後端 ENUM 定義

#### 1️⃣ **LotteryCategoryEnum** - 主分類（Category）

| 後端代碼 | 前端顯示名稱 | 說明 | 前端路由 |
|---------|------------|------|---------|
| `OFFICIAL_ICHIBAN` | 官方一番賞 / 一番賞 | 官方授權的一番賞商品 | `/ichiban/:id` |
| `CUSTOM_GACHA` | 自製賞 | 店家自製的抽獎商品 | `/ichiban/:id` |
| `PRIZE_CAPSULE` | 扭蛋 | 扭蛋機類型商品 | `/gacha/:id` |
| `SCRATCH_CARD` | 刮刮樂 / 刮刮卡 | 刮獎卡片類型 | `/scratch/:id` |
| `CARD_DRAW` | 卡牌抽選 / 卡牌 | 卡牌翻牌類型 | `/ichiban/:id` |
| `GACHA` | 扭蛋（舊） | ⚠️ 已廢棄，請使用 `PRIZE_CAPSULE` | - |
| `TRADING_CARD` | 交易卡（舊） | ⚠️ 已廢棄，請使用 `CARD_DRAW` | - |

> **注意**：前端代碼中存在 `GACHA` 和 `TRADING_CARD`，但後端文檔中這兩個分類已被重新定義。請統一使用新的分類代碼。

---

#### 2️⃣ **LotterySubCategoryEnum** - 遊戲模式（SubCategory）

| 後端代碼 | 前端顯示名稱 | 操作方式 | 動畫類型 | 保護時間 |
|---------|------------|---------|---------|---------|
| `LOTTERY_MODE` | 抽籤型 | 點擊抽獎按鈕 | 撕卡動畫 → 結果總覽 | ✅ 7秒 |
| `SCRATCH_MODE` | 刮刮樂型 | 手指刮開 | 刮獎動畫 | ❌ 無 |
| `SCRATCH_CARD_MODE` | 刮刮卡型 | 點擊卡片 | 翻牌動畫 | ❌ 無 |

---

#### 3️⃣ **LotteryStatusEnum** - 商品狀態

| 後端代碼 | 前端顯示 | 前台可見 | 可抽獎 | 說明 |
|---------|---------|---------|-------|------|
| `DRAFT` | 草稿 | ❌ | ❌ | 編輯中 |
| `OFF_SHELF` | 下架 | ❌ | ❌ | 已下架 |
| `ON_SHELF` | 上架 | ✅ | ✅ | 正常販售 |
| `IN_PROGRESS` | 進行中 | ✅ | ✅ | 已有人抽獎 |
| `ENDED` | 已結束 | ✅ | ❌ | 已抽完 |
| `FORCED_OFF` | 強制下架 | ❌ | ❌ | 違規下架 |

**前端篩選邏輯**：
```typescript
// 顯示在前台的商品
const visibleStatuses = ['ON_SHELF', 'IN_PROGRESS', 'ENDED'];

// 可以抽獎的商品
const drawableStatuses = ['ON_SHELF', 'IN_PROGRESS'];
```

---

#### 4️⃣ **PrizeLevel** - 獎項等級

| 後端代碼 | 顯示名稱 | 排序權重 | 特殊說明 |
|---------|---------|---------|---------|
| `A` | A賞 | 1 | 最高等級 |
| `B` | B賞 | 2 | 次高等級 |
| `C` | C賞 | 3 | - |
| `D` | D賞 | 4 | - |
| `E` | E賞 | 5 | - |
| `F` | F賞 | 6 | - |
| `G` | G賞 | 7 | - |
| `LAST` | 最後賞 | 98 | 🎯 最後一張自動觸發 |
| `GRAND` | 大賞 | 99 | 🏆 影響降價機制 |

**等級顏色映射**（建議）：
```typescript
const PRIZE_LEVEL_COLORS = {
  'GRAND': '#FFD700',  // 金色
  'LAST': '#FF6347',   // 番茄紅
  'A': '#87CEEB',      // 天藍
  'B': '#98D8C8',      // 薄荷綠
  'C': '#F7DC6F',      // 檸檬黃
  'D': '#BB8FCE',      // 薰衣草紫
  'E': '#F8B500',      // 橙色
  'F': '#85C1E2',      // 淺藍
  'G': '#C0C0C0',      // 銀色
};
```

---

#### 5️⃣ **PrizeTypeEnum** - 獎品類型

| 後端代碼 | 顯示名稱 | 需要配送 | 領取方式 |
|---------|---------|---------|---------|
| `PHYSICAL` | 實體獎品 | ✅ | 填寫配送地址 → 店家出貨 |
| `DIGITAL` | 數位獎品 | ❌ | 顯示兌換碼 / 序號 |
| `POINT` | 點數獎品 | ❌ | 自動加入帳戶 |

---

## 🗺️ 前端頁面映射

### 主要頁面與對應 Category

| 頁面路徑 | 頁面名稱 | 對應 Category | 說明 |
|---------|---------|--------------|------|
| `/` | `Home.vue` | 全部分類 | 首頁，顯示所有類型輪播 |
| `/ichiban` | `IchibanList.vue` | ALL | 所有商品列表（含篩選） |
| `/ichiban/:id` | `IchibanDetail.vue` | ALL | 商品詳情頁（根據 category 切換動畫） |
| `/gacha` | `GachaList.vue` | `PRIZE_CAPSULE` | 扭蛋專區列表 |
| `/scratch` | `ScratchCardList.vue` | `SCRATCH_CARD` | 刮刮樂專區列表 |
| `/store/:id/lotteries` | `StoreLotteries.vue` | ALL | 店家商品頁（含篩選） |

---

### 頁面使用的 Category 篩選

#### 1. **IchibanList.vue** - 商品列表頁

**可篩選的 Category**：
```typescript
const categories: CategoryValue[] = [
  'OFFICIAL_ICHIBAN',  // 一番賞
  'CUSTOM_GACHA',      // 自製賞
  'PRIZE_CAPSULE',     // 扭蛋
  'SCRATCH_CARD',      // 刮刮樂
  'CARD_DRAW',         // 卡牌
];
```

**實際代碼位置**：`src/views/IchibanList.vue` (lines 43-47)

---

#### 2. **IchibanDetail.vue** - 商品詳情頁

**支援的 Category 與動畫映射**：

| Category | 動畫類型 | 動畫 Dialog | SubCategory |
|----------|---------|------------|-------------|
| `OFFICIAL_ICHIBAN` | 撕卡 → 總覽 | `gachaTearDialog` + `ichibanResultDialog` | `LOTTERY_MODE` |
| `CUSTOM_GACHA` | 撕卡 → 總覽 | `gachaTearDialog` + `ichibanResultDialog` | `LOTTERY_MODE` / `SCRATCH_MODE` / `SCRATCH_CARD_MODE` |
| `PRIZE_CAPSULE` | 扭蛋機 | `gotchaDialog` | `LOTTERY_MODE` |
| `SCRATCH_CARD` | 刮刮樂 | `scratchCardDialog` | `SCRATCH_MODE` |
| `CARD_DRAW` | 翻牌 | `ichibanResultCardDialog` | `SCRATCH_CARD_MODE` |

**實際代碼位置**：`src/views/IchibanDetail.vue` (lines 527-595)

---

#### 3. **GachaList.vue** - 扭蛋專區

**固定 Category**：
```typescript
const filters = {
  category: 'PRIZE_CAPSULE',  // 只顯示扭蛋
};
```

---

#### 4. **ScratchCardList.vue** - 刮刮樂專區

**固定 Category**：
```typescript
const filters = {
  category: 'SCRATCH_CARD',  // 只顯示刮刮樂
};
```

**實際代碼位置**：`src/views/ScratchCardList.vue` (line 179)

---

#### 5. **StoreLotteries.vue** - 店家商品頁

**可篩選的 Category**：
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

**實際代碼位置**：`src/views/StoreLotteries.vue` (lines 121-127)

---

## 🎨 Category vs SubCategory 完整對照

### 每個 Category 可用的 SubCategory

| Category | 可用 SubCategory | 前端動畫 | 說明 |
|----------|-----------------|---------|------|
| **OFFICIAL_ICHIBAN** | `LOTTERY_MODE` | 撕卡 + 總覽 | 官方一番賞只支援抽籤模式 |
| **CUSTOM_GACHA** | `LOTTERY_MODE` | 撕卡 + 總覽 | 自製賞的抽籤模式 |
| **CUSTOM_GACHA** | `SCRATCH_MODE` | 刮刮樂 | 自製賞的刮獎模式 |
| **CUSTOM_GACHA** | `SCRATCH_CARD_MODE` | 翻牌 | 自製賞的卡片模式 |
| **PRIZE_CAPSULE** | `LOTTERY_MODE` | 扭蛋機 | 扭蛋只支援抽籤模式 |
| **SCRATCH_CARD** | `SCRATCH_MODE` | 刮刮樂 | 刮刮樂專用 |
| **CARD_DRAW** | `SCRATCH_CARD_MODE` | 翻牌 | 卡牌抽選專用 |

> **關鍵規則**：只有 `CUSTOM_GACHA` 支援多種 SubCategory，其他 Category 都有固定的 SubCategory。

---

## 🎬 動畫系統映射

### Category → 動畫 Dialog 映射表

| Category | Dialog 函數 | 檔案位置 | 動畫效果 | 是否有跳過按鈕 |
|----------|------------|---------|---------|--------------|
| `OFFICIAL_ICHIBAN` | `gachaTearDialog` + `ichibanResultDialog` | `utils/dialog/kujiRevealStripDialog.ts` + `ichibanResultDialog.ts` | 撕卡動畫 → 結果總覽 | ✅ 單筆跳過 / 全部跳過 |
| `CUSTOM_GACHA` (LOTTERY_MODE) | `gachaTearDialog` + `ichibanResultDialog` | 同上 | 撕卡動畫 → 結果總覽 | ✅ 單筆跳過 / 全部跳過 |
| `PRIZE_CAPSULE` | `gotchaDialog` | `utils/dialog/gotchaDialog.ts` | 扭蛋機動畫 | ❌ |
| `SCRATCH_CARD` | `scratchCardDialog` | `utils/dialog/scratchCardDialog.ts` | 刮刮樂動畫 | ❌ |
| `CARD_DRAW` | `ichibanResultCardDialog` | `utils/dialog/ichibanResultCardDialog.ts` | 翻牌動畫 | ❌ |

---

### Dialog 參數規格

#### 1. **gachaTearDialog** - 撕卡動畫

```typescript
interface GachaTearDialogParams {
  pulls: Array<{
    index: number;
    id: string;
    name: string;
    image: string;
    grade: string;
    title: string;  // 例：'今日一番賞・第 1 抽'
  }>;
}

// 使用範例
const pulls = items.map((item, index) => ({
  index,
  ...item,
  title: `今日一番賞・第 ${index + 1} 抽`,
}));

const tearResult = await gachaTearDialog({ pulls });
if (!tearResult) return; // 用戶關閉動畫
```

---

#### 2. **ichibanResultDialog** - 結果總覽

```typescript
interface IchibanResultDialogParams {
  remain: number;       // 剩餘數量
  count: number;        // 抽獎數量
  totalPrice: number;   // 總花費
  items: Array<{
    id: string;
    name: string;
    image: string;
    grade: string;
  }>;
}

// 使用範例
await ichibanResultDialog({
  remain: remainingQuantity.value - results.length,
  count: results.length,
  totalPrice,
  items,
});
```

---

#### 3. **gotchaDialog** - 扭蛋動畫

```typescript
interface GotchaDialogParams {
  title: string;
  pulls: Array<{
    id: string;
    name: string;
    image: string;
    grade: string;
  }>;
  speed?: number;  // 動畫速度 (預設 1)
}

// 使用範例
await gotchaDialog({
  title: '扭蛋結果',
  pulls: items,
  speed: 1,
});
```

---

#### 4. **scratchCardDialog** - 刮刮樂動畫

```typescript
interface ScratchCardDialogParams {
  title: string;
  imageSrc: string;      // 獎品圖片
  revealText: string;    // 揭曉文字
  grade: string;         // 獎項等級
}

// 使用範例（需逐一顯示）
for (const item of items) {
  await scratchCardDialog({
    title: '刮刮樂',
    imageSrc: item.image,
    revealText: item.name ? `🎉 恭喜獲得 ${item.name}！` : '謝謝惠顧',
    grade: item.grade,
  });
}
```

---

#### 5. **ichibanResultCardDialog** - 翻牌動畫

```typescript
interface IchibanResultCardDialogParams {
  remain: number;
  count: number;
  totalPrice: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    grade: string;
  }>;
}

// 使用範例
await ichibanResultCardDialog({
  remain: remainingQuantity.value - results.length,
  count: results.length,
  totalPrice,
  items,
});
```

---

## 🧭 路由與篩選配置

### 前端路由定義

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/ichiban',
    name: 'IchibanList',
    component: () => import('@/views/IchibanList.vue'),
    meta: { title: '商品列表' }
  },
  {
    path: '/ichiban/:id',
    name: 'IchibanDetail',
    component: () => import('@/views/IchibanDetail.vue'),
    meta: { title: '商品詳情' }
  },
  {
    path: '/gacha',
    name: 'GachaList',
    component: () => import('@/views/GachaList.vue'),
    meta: { title: '扭蛋專區' }
  },
  {
    path: '/scratch',
    name: 'ScratchCardList',
    component: () => import('@/views/ScratchCardList.vue'),
    meta: { title: '刮刮樂專區' }
  },
  {
    path: '/store/:id/lotteries',
    name: 'StoreLotteries',
    component: () => import('@/views/StoreLotteries.vue'),
    meta: { title: '店家商品' }
  },
];
```

---

### API 查詢參數

#### 查詢商品列表

```typescript
// GET /api/lottery/browse
interface BrowseParams {
  category?: 'OFFICIAL_ICHIBAN' | 'CUSTOM_GACHA' | 'PRIZE_CAPSULE' | 'SCRATCH_CARD' | 'CARD_DRAW';
  subCategory?: 'LOTTERY_MODE' | 'SCRATCH_MODE' | 'SCRATCH_CARD_MODE';
  status?: 'ON_SHELF' | 'IN_PROGRESS' | 'ENDED';
  storeId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

// 範例：查詢所有上架中的官方一番賞
const params = {
  category: 'OFFICIAL_ICHIBAN',
  status: 'ON_SHELF',
  page: 0,
  size: 20,
};
```

---

## 📝 TypeScript 類型定義

### 建議新增的全域類型定義

在 `src/types/lottery.ts` 或 `src/vite-env.d.ts` 中新增：

```typescript
/**
 * 商品主分類
 */
export type LotteryCategory =
  | 'OFFICIAL_ICHIBAN'  // 官方一番賞
  | 'CUSTOM_GACHA'      // 自製賞
  | 'PRIZE_CAPSULE'     // 扭蛋
  | 'SCRATCH_CARD'      // 刮刮樂
  | 'CARD_DRAW';        // 卡牌抽選

/**
 * 遊戲模式
 */
export type LotterySubCategory =
  | 'LOTTERY_MODE'         // 抽籤型
  | 'SCRATCH_MODE'         // 刮刮樂型
  | 'SCRATCH_CARD_MODE';   // 刮刮卡型

/**
 * 商品狀態
 */
export type LotteryStatus =
  | 'DRAFT'         // 草稿
  | 'OFF_SHELF'     // 下架
  | 'ON_SHELF'      // 上架
  | 'IN_PROGRESS'   // 進行中
  | 'ENDED'         // 已結束
  | 'FORCED_OFF';   // 強制下架

/**
 * 獎項等級
 */
export type PrizeLevel =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  | 'LAST'   // 最後賞
  | 'GRAND'; // 大賞

/**
 * 獎品類型
 */
export type PrizeType =
  | 'PHYSICAL'  // 實體獎品
  | 'DIGITAL'   // 數位獎品
  | 'POINT';    // 點數獎品

/**
 * 商品完整資料結構
 */
export interface LotteryData {
  id: string;
  name: string;
  category: LotteryCategory;
  categoryName: string;
  subCategory: LotterySubCategory;
  status: LotteryStatus;
  price: number;
  totalQuantity: number;
  remainingQuantity: number;
  imageUrl: string;
  description: string;
  storeId: string;
  storeName: string;
  prizes: Prize[];
}

/**
 * 獎品資料結構
 */
export interface Prize {
  id: string;
  name: string;
  level: PrizeLevel;
  type: PrizeType;
  quantity: number;
  imageUrl: string;
}

/**
 * Category 顯示標籤映射
 */
export const CATEGORY_LABELS: Record<LotteryCategory, string> = {
  OFFICIAL_ICHIBAN: '官方一番賞',
  CUSTOM_GACHA: '自製賞',
  PRIZE_CAPSULE: '扭蛋',
  SCRATCH_CARD: '刮刮樂',
  CARD_DRAW: '卡牌抽選',
};

/**
 * SubCategory 顯示標籤映射
 */
export const SUBCATEGORY_LABELS: Record<LotterySubCategory, string> = {
  LOTTERY_MODE: '抽籤型',
  SCRATCH_MODE: '刮刮樂型',
  SCRATCH_CARD_MODE: '刮刮卡型',
};

/**
 * Status 顯示標籤映射
 */
export const STATUS_LABELS: Record<LotteryStatus, string> = {
  DRAFT: '草稿',
  OFF_SHELF: '下架',
  ON_SHELF: '上架',
  IN_PROGRESS: '進行中',
  ENDED: '已結束',
  FORCED_OFF: '強制下架',
};

/**
 * PrizeLevel 顯示標籤映射
 */
export const PRIZE_LEVEL_LABELS: Record<PrizeLevel, string> = {
  A: 'A賞',
  B: 'B賞',
  C: 'C賞',
  D: 'D賞',
  E: 'E賞',
  F: 'F賞',
  G: 'G賞',
  LAST: '最後賞',
  GRAND: '大賞',
};

/**
 * PrizeType 顯示標籤映射
 */
export const PRIZE_TYPE_LABELS: Record<PrizeType, string> = {
  PHYSICAL: '實體獎品',
  DIGITAL: '數位獎品',
  POINT: '點數獎品',
};
```

---

## 🚀 實際使用範例

### 範例 1：根據 Category 顯示不同標籤

```typescript
// src/components/LotteryCard.vue
import { CATEGORY_LABELS, type LotteryCategory } from '@/types/lottery';

const getCategoryLabel = (category: LotteryCategory): string => {
  return CATEGORY_LABELS[category] || '其他';
};

// 使用
const categoryLabel = getCategoryLabel(lotteryData.category);
// 輸出：'官方一番賞' / '自製賞' / '扭蛋' ...
```

---

### 範例 2：根據 Category 選擇動畫

```typescript
// src/views/IchibanDetail.vue
const showDrawResult = async (results: any[], totalPrice: number) => {
  const category = lotteryData.value?.category as LotteryCategory;
  
  switch (category) {
    case 'OFFICIAL_ICHIBAN':
    case 'CUSTOM_GACHA':
      // 撕卡動畫
      const pulls = items.map((item, index) => ({
        index,
        ...item,
        title: `今日一番賞・第 ${index + 1} 抽`,
      }));
      
      const tearResult = await gachaTearDialog({ pulls });
      if (!tearResult) return;
      
      await ichibanResultDialog({
        remain: remainingQuantity.value - results.length,
        count: results.length,
        totalPrice,
        items,
      });
      break;

    case 'PRIZE_CAPSULE':
      // 扭蛋動畫
      await gotchaDialog({
        title: '扭蛋結果',
        pulls: items,
        speed: 1,
      });
      break;

    case 'SCRATCH_CARD':
      // 刮刮樂動畫（逐一顯示）
      for (const item of items) {
        await scratchCardDialog({
          title: '刮刮樂',
          imageSrc: item.image,
          revealText: item.name ? `🎉 恭喜獲得 ${item.name}！` : '謝謝惠顧',
          grade: item.grade,
        });
      }
      break;

    case 'CARD_DRAW':
      // 翻牌動畫
      await ichibanResultCardDialog({
        remain: remainingQuantity.value - results.length,
        count: results.length,
        totalPrice,
        items,
      });
      break;
  }
};
```

---

### 範例 3：篩選器配置

```typescript
// src/views/IchibanList.vue
import { CATEGORY_LABELS, type LotteryCategory } from '@/types/lottery';

const categoryFilters = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  label,
  value: value as LotteryCategory,
}));

// 輸出：
// [
//   { label: '官方一番賞', value: 'OFFICIAL_ICHIBAN' },
//   { label: '自製賞', value: 'CUSTOM_GACHA' },
//   { label: '扭蛋', value: 'PRIZE_CAPSULE' },
//   { label: '刮刮樂', value: 'SCRATCH_CARD' },
//   { label: '卡牌抽選', value: 'CARD_DRAW' },
// ]
```

---

### 範例 4：判斷商品是否可抽獎

```typescript
import { type LotteryStatus } from '@/types/lottery';

const canDraw = (status: LotteryStatus): boolean => {
  return ['ON_SHELF', 'IN_PROGRESS'].includes(status);
};

// 使用
const isDrawable = canDraw(lotteryData.status);
```

---

### 範例 5：根據 PrizeLevel 顯示顏色

```typescript
import { type PrizeLevel } from '@/types/lottery';

const PRIZE_LEVEL_COLORS: Record<PrizeLevel, string> = {
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

const getPrizeLevelColor = (level: PrizeLevel): string => {
  return PRIZE_LEVEL_COLORS[level] || '#C0C0C0';
};

// 使用
const cardColor = getPrizeLevelColor(prize.level);
```

---

## 📊 完整分類對照表

### 所有 Category 的完整資訊

| Category | 中文名稱 | SubCategory | 動畫類型 | 專屬頁面 | 篩選標籤 |
|----------|---------|-------------|---------|---------|---------|
| `OFFICIAL_ICHIBAN` | 官方一番賞 | `LOTTERY_MODE` | 撕卡 + 總覽 | `/ichiban` | 一番賞 |
| `CUSTOM_GACHA` | 自製賞 | `LOTTERY_MODE` / `SCRATCH_MODE` / `SCRATCH_CARD_MODE` | 根據 SubCategory 決定 | `/ichiban` | 自製賞 |
| `PRIZE_CAPSULE` | 扭蛋 | `LOTTERY_MODE` | 扭蛋機 | `/gacha` | 扭蛋 |
| `SCRATCH_CARD` | 刮刮樂 | `SCRATCH_MODE` | 刮刮樂 | `/scratch` | 刮刮樂 |
| `CARD_DRAW` | 卡牌抽選 | `SCRATCH_CARD_MODE` | 翻牌 | `/ichiban` | 卡牌 |

---

## ⚠️ 常見錯誤與注意事項

### 錯誤 1：前後端 Category 代碼不一致

**問題**：前端使用 `GACHA`，但後端使用 `PRIZE_CAPSULE`

**解決**：統一使用後端 ENUM 代碼
```typescript
// ❌ 錯誤
const category = 'GACHA';

// ✅ 正確
const category = 'PRIZE_CAPSULE';
```

---

### 錯誤 2：忘記檢查 SubCategory

**問題**：`CUSTOM_GACHA` 有多種 SubCategory，但只處理一種

**解決**：根據 SubCategory 選擇正確動畫
```typescript
// ❌ 錯誤
if (category === 'CUSTOM_GACHA') {
  await gachaTearDialog({ pulls });
}

// ✅ 正確
if (category === 'CUSTOM_GACHA') {
  if (subCategory === 'LOTTERY_MODE') {
    await gachaTearDialog({ pulls });
  } else if (subCategory === 'SCRATCH_MODE') {
    await scratchCardDialog({ ... });
  } else if (subCategory === 'SCRATCH_CARD_MODE') {
    await ichibanResultCardDialog({ ... });
  }
}
```

---

### 錯誤 3：不過濾商品狀態

**問題**：顯示所有狀態的商品，包括草稿和下架

**解決**：只顯示前台可見狀態
```typescript
// ❌ 錯誤
const allLotteries = await lotteryBrowseService.browse({});

// ✅ 正確
const visibleLotteries = await lotteryBrowseService.browse({
  status: 'ON_SHELF,IN_PROGRESS,ENDED',  // 只取前台可見狀態
});
```

---

## 🎯 總結檢查清單

在開發新功能時，請確認以下項目：

- [ ] 使用正確的 `LotteryCategory` 代碼（不使用已廢棄的 `GACHA` / `TRADING_CARD`）
- [ ] 為 `CUSTOM_GACHA` 檢查 `subCategory` 並選擇正確動畫
- [ ] 只顯示前台可見的商品狀態（`ON_SHELF`, `IN_PROGRESS`, `ENDED`）
- [ ] 根據 `category` 切換正確的動畫 Dialog
- [ ] 為獎項等級設定正確的顏色映射
- [ ] 根據 `prizeType` 顯示正確的領取流程
- [ ] 在 TypeScript 中正確定義類型，避免 `any`

---

**如有疑問或需要補充，請隨時更新此文檔！** 🚀
