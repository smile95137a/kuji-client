# Implementation Plan: 010 — 獎品箱

**Branch**: `cli/010-prize-box` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-prize-box/spec.md`

---

## Summary

實作獎品箱頁（`/prize-box`）。顯示所有已抽到且待處理的賞品，依「商店分組」呈現（Q1 已澄清：`POST /api/prize-box/ship` 回應永遠是 `{ orders: [...] }` 陣列）。支援多選賞品、查看詳情、發起配送（宅配/超商 VeeValidate 表單）或以 100 元/個回收換金幣。發送後顯示訂單摘要 Modal。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, VeeValidate 4.14.7, Yup 1.4.0, Sass |
| **Storage** | Pinia（prizeBoxItems / selectedPrizeIds / shippingInfo） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 100 件賞品一次渲染 ≤ 1.5s；sticky 底部 Action Bar |
| **Constraints** | 需登入；回收不可逆（需確認 Modal）；配送表單完整驗證 |
| **Scale/Scope** | 1 主頁面、1 個 Modal（出貨）、1 個 Modal（回收確認）、4 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/010-prize-box/
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
│   └── PrizeBox.vue                # 獎品箱主頁（/prize-box）
├── components/
│   └── prize-box/
│       ├── PrizeBoxGroupSection.vue # 依商店分組（storeName 標題 + 賞品列表）
│       ├── PrizeCard.vue           # 賞品卡片（等級標籤 + 圖片 + 名稱 + 複選框）
│       ├── PrizeDetailBottomSheet.vue # 賞品詳情（滑出）
│       ├── ShippingFormModal.vue   # 出貨表單 Modal（宅配/超商分頁籤）
│       ├── RecycleConfirmModal.vue # 回收確認 Modal（不可逆警告）
│       ├── ShipResultModal.vue     # 出貨結果 Modal（orderNo 列表）
│       └── PrizeBoxActionBar.vue   # sticky 底部 Action Bar（已選 X 件）
├── stores/
│   └── prizeBox.ts                # prizeBoxItems / selectedPrizeIds / groupedByStore
├── composables/
│   └── usePrizeBoxShipping.ts     # 出貨/回收業務邏輯（分離 UI 與 API 呼叫）
├── services/
│   ├── prizeBox.ts                # GET /api/prize-box / POST /api/prize-box/ship
│   └── recycle.ts                 # POST /api/prize-box/recycle（含 abort controller）
└── types/
    └── prizeBox.ts                # PrizeBoxItem / ShipRequest / RecycleRequest / ShipResult
```

---

## 主要開發項目

### 1. 賞品箱分組顯示
```typescript
// computed（store 中）
const groupedByStore = computed(() => {
  const map = new Map<string, PrizeBoxItem[]>()
  for (const item of prizeBoxItems.value) {
    if (!map.has(item.storeName)) map.set(item.storeName, [])
    map.get(item.storeName)!.push(item)
  }
  return [...map.entries()].map(([storeName, items]) => ({ storeName, items }))
})
```

### 2. 配送出貨（Q1 澄清：response 永遠是陣列）
```typescript
// POST /api/prize-box/ship
const response = await prizeBoxService.ship({
  prizeIds: selectedPrizeIds,
  shippingInfo: { type: 'HOME_DELIVERY', ...formData }
})
// response 永遠是 { orders: [{ orderId, orderNo, storeName, prizeCount }] }
// 顯示 ShipResultModal 列出所有 orderNo
```

### 3. 回收換金幣（不可逆確認）
```typescript
// RecycleConfirmModal 顯示：回收 X 件，共獲得 ${ X * 100 } 金幣
// 確認後：POST /api/prize-box/recycle { prizeIds: selectedPrizeIds }
// 成功後：重新呼叫 GET /api/user/me 更新金幣餘額；重新呼叫 GET /api/prize-box 刷新列表
```

### 4. 賞品等級顏色標籤（FR-CROSS-006）
```typescript
const PRIZE_LEVEL_COLORS = {
  A: '#FFD700', // 金
  B: '#E53E3E', // 紅
  C: '#DD6B20', // 橙
  D: '#38A169', // 綠
  E: '#3182CE', // 藍（E 及以後）
  FINAL: '#805AD5', // 紫
  LAST: '#2B6CB0', // 深藍
  null: '#A0AEC0'  // 謝謝惠顧→灰色
}
```

### 5. 出貨表單驗證（VeeValidate + Yup）
- 宅配：姓名（必填）、電話（10 碼）、地址（必填）
- 超商：姓名、電話 + 超商 ID 選擇（先呼叫 `GET /api/address/default` 預填）

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| `GET /api/address/default` | AV-009：此 API 在 010 spec 中存在但 002 spec 中未提及，需後端確認 |
| 分頁支援 | AV-005：賞品箱是否有分頁尚未確認 |
| 圖片 fallback | AV-006：`imageUrl` 為 null 時的預設圖片 |
| 出貨表單超商 API | AV-008：超商門市選擇 API（便利帶）需另外整合 |
