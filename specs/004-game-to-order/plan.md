# Implementation Plan: 004 — 遊戲至訂單流程

**Branch**: `cli/004-game-to-order` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-game-to-order/spec.md`

---

## Summary

實作「抽獎結果 → 賞品盒 → 出貨/回收 → 訂單列表」的完整用戶旅程。核心頁面：賞品盒頁（`/prize-box`，依店家分組，支援多選 + 出貨/回收）、訂單列表頁（`/orders`，客戶端狀態篩選）。出貨 Response 永遠為陣列（Q1 已澄清）；等級顏色依 A→Z + FINAL/LAST 映射（Q3 已澄清）。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, Sass |
| **Storage** | Pinia (pinia-plugin-persistedstate) |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 賞品盒 50 件渲染 ≤ 1s；勾選響應 ≤ 50ms（純客戶端） |
| **Constraints** | 需登入（JWT）；回收操作不可逆，需二次確認 |
| **Scale/Scope** | 4 頁面（結果 Modal、賞品盒、回收確認、訂單列表），4 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/004-game-to-order/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成（Q1/Q3 已澄清）
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── PrizeBox.vue                 # 賞品盒頁（/prize-box）
│   └── OrderList.vue               # 訂單列表頁（/orders）
├── components/
│   └── prize-box/
│       ├── PrizeBoxGroup.vue        # 單店家分組區塊（含全選 Checkbox）
│       ├── PrizeCard.vue            # 賞品卡片（圖、名稱、等級標籤、入盒時間）
│       ├── PrizeLevelBadge.vue      # 等級標籤（顏色依 FR-CROSS-006 映射）
│       ├── StickyActionBar.vue      # 底部固定行動列（申請出貨/回收換分）
│       ├── RecycleConfirmModal.vue  # 回收確認 Modal（含 Bonus 合計）
│       └── MultiStoreWarning.vue   # 多店家警告橫幅
│   └── order/
│       └── OrderCard.vue           # 訂單卡片（orderNo, status badge, storeName）
├── stores/
│   ├── prizeBox.ts                  # prizeBoxItems / selectedPrizeIds / groupedPrizes
│   └── order.ts                    # orders / activeStatusFilter / filteredOrders
├── composables/
│   └── usePrizeSelection.ts        # 多選邏輯、全選、跨店家偵測
├── services/
│   ├── prizeBox.ts                  # GET /api/prize-box / POST recycle
│   └── order.ts                    # GET /api/orders
└── types/
    └── prizeBox.ts                  # PrizeBoxItem / RecycleResponse / OrderSummary
```

---

## 主要開發項目

### 1. 賞品盒分組與多選

```typescript
// groupedPrizes computed
const groupedPrizes = computed(() => {
  const map = new Map<string, { storeName: string; prizes: PrizeBoxItem[] }>()
  for (const item of prizeBoxItems.value) {
    if (!map.has(item.storeId)) map.set(item.storeId, { storeName: item.storeName, prizes: [] })
    map.get(item.storeId)!.prizes.push(item)
  }
  return map
})
```

### 2. 等級顏色映射（FR-CROSS-006）
| prizeLevel | 顏色 |
|-----------|------|
| A | 金色 `#FFD700` |
| B | 紅色 `#E53E3E` |
| C | 橙色 `#ED8936` |
| D | 綠色 `#38A169` |
| E 以後 | 藍色 `#3182CE` |
| FINAL | 紫色 `#805AD5` |
| LAST | 深藍色 `#2B6CB0` |
| prizeId=null | 灰色 `#718096` |

### 3. 回收確認 Modal
- `estimatedBonusTotal = selectedPrizes.reduce((sum, p) => sum + p.recycleBonus, 0)`
- 確認後：`POST /api/prize-box/recycle { prizeBoxIds: [...] }`
- 成功後：更新全域 `bonusCoins`（`newBonusBalance`）、樂觀更新 status → RECYCLED

### 4. 訂單列表
- 一次性載入所有訂單（`GET /api/orders`）
- 客戶端 Tab 過濾（`ALL / PENDING / PREPARING / SHIPPED / COMPLETED`）
- 過濾響應 ≤ 50ms

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| 賞品盒分頁 | AV-004：後端目前無分頁，大量賞品時效能風險，延後確認 |
| `recycleBonus` 欄位確認 | AV-005：確認 `GET /api/prize-box` Response 中存在此欄位 |
