# Implementation Plan: 008 — 訂單管理

**Branch**: `cli/008-order-management` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-order-management/spec.md`

---

## Summary

實作訂單列表頁（`/orders`）與訂單詳情頁（`/orders/{id}`）。訂單列表一次性載入，客戶端 Tab 過濾（不重呼 API）。詳情頁顯示狀態時間軸（固定 4 節點 PENDING→PREPARING→SHIPPED→COMPLETED）、賞品清單（等級顏色依 Q3 映射）、收件資訊（唯讀）。004 spec 已涵蓋此頁面，此 spec 主要完善詳情頁細節。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, Sass |
| **Storage** | Pinia（orders / activeStatusFilter / orderDetail） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 50 筆訂單列表渲染 ≤ 1s；Tab 切換 ≤ 50ms（客戶端） |
| **Constraints** | 需登入（JWT）；收件資訊唯讀（不可編輯） |
| **Scale/Scope** | 2 頁面、2 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/008-order-management/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成（Q3 顏色映射已更新）
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── OrderList.vue               # 訂單列表頁（/orders）— 與 004 共用
│   └── OrderDetail.vue            # 訂單詳情頁（/orders/{id}）
├── components/
│   └── order/
│       ├── OrderCard.vue           # 訂單卡片（orderNo, status, storeName）
│       ├── OrderStatusBadge.vue    # 狀態 Badge（顏色依規格）
│       ├── OrderStatusTimeline.vue # 狀態時間軸（4 節點固定結構）
│       ├── PrizeList.vue           # 賞品清單（圖片 + 等級標籤 + 名稱 + 價值）
│       └── RecipientInfoCard.vue  # 收件資訊唯讀卡（宅配/超商分支顯示）
├── stores/
│   └── order.ts                   # orders / activeStatusFilter / orderDetail
├── services/
│   └── order.ts                   # GET /api/orders / GET /api/orders/{id}
└── types/
    └── order.ts                   # Order / OrderDetail / StatusHistory
```

---

## 主要開發項目

### 1. 訂單狀態 Badge 顏色

| 狀態 | 英文值 | Badge 顏色 |
|------|--------|-----------|
| 待出貨 | PENDING | 藍色 `#3182CE` |
| 準備中 | PREPARING | 黃色 `#D69E2E` |
| 已出貨 | SHIPPED | 橙色 `#DD6B20` |
| 已完成 | COMPLETED | 綠色 `#38A169` |

### 2. 狀態時間軸（OrderStatusTimeline）
```typescript
const TIMELINE_STEPS = ['PENDING', 'PREPARING', 'SHIPPED', 'COMPLETED']

// 計算每個節點狀態
function getStepStatus(step: string) {
  const currentIdx = TIMELINE_STEPS.indexOf(currentStatus.value)
  const stepIdx = TIMELINE_STEPS.indexOf(step)
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'active'   // 脈衝動畫
  return 'pending'                                // 灰色空心
}
```

### 3. 賞品等級顏色（FR-CROSS-006）
- A=金 / B=紅 / C=橙 / D=綠 / E+=藍 / FINAL=紫 / LAST=深藍 / prizeId=null=灰色

### 4. 收件資訊（依出貨方式顯示不同欄位）
| 方式 | 顯示欄位 |
|------|---------|
| HOME_DELIVERY | 姓名、電話、收件地址 |
| CONVENIENCE_STORE | 姓名、電話、超商名稱、店碼、超商地址 |

### 5. 客戶端 Tab 過濾（computed）
```typescript
const filteredOrders = computed(() =>
  activeStatusFilter.value === 'ALL'
    ? orders.value
    : orders.value.filter(o => o.status === activeStatusFilter.value)
)
```

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| `trackingNumber` 缺失 | AV-007：快遞單號待後端補充 |
| `lotteryId` 缺失 | AV-006：「再次前往此商品」功能待後端補充 |
| 訂單列表分頁 | AV-005：後端目前無分頁，大量訂單時效能風險 |
| statusHistory status 語意 | AV-009：英文枚舉→中文名稱前端自行 mapping |
