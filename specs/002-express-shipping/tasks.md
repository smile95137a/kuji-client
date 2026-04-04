# Tasks: 002 — 物流出貨

**Feature**: Express Shipping | **Branch**: `cli/002-express-shipping` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/shipping.ts`，定義 `ShipRequest`（prizeBoxIds, shippingMethod, recipientName, recipientPhone, recipientAddress?, storeCode?, storeName?, storeAddress?）、`ShipResponse`（orders[]: {orderId, orderNo, storeName, prizeCount}）、`SavedAddress`、`OrderDetail` interface
- [ ] T002 建立 `src/services/shipping.ts`，實作 `shippingService.ship(payload)` → `POST /api/prize-box/ship`
- [ ] T003 [P] 建立 `src/services/address.ts`，實作 `addressService.getAddresses()` → `GET /api/address`
- [ ] T004 [P] 建立 `src/services/order.ts`（若未存在），實作 `orderService.getOrderDetail(id)` → `GET /api/orders/{id}`
- [ ] T005 建立 `src/stores/shipping.ts`，定義 Pinia store：shippingMethod / savedAddresses / isSubmitting / submitError / selectedPrizeIds

---

## Phase 2: Foundational

- [ ] T006 [P] 建立 `src/components/shipping/ShippingMethodSelector.vue`，Radio Button 或 Tab 選擇宅配/超商，切換時 emit 事件更新父組件 shippingMethod
- [ ] T007 [P] 建立 `src/components/shipping/AddressDropdown.vue`，下拉選單顯示已儲存地址，預設地址排第一並標示「預設」，選擇後自動填入表單欄位
- [ ] T008 [P] 建立 `src/components/shipping/MultiStoreWarning.vue`，偵測選取賞品的 storeId 集合 > 1 時顯示黃色警告橫幅

---

## Phase 3: [US1] 選擇宅配出貨

- [ ] T009 [US1] 建立 `src/components/shipping/HomeDeliveryFields.vue`，包含：收件人姓名（Yup: 必填, 2–20 字）、收件人電話（Yup: `/^09\d{8}$/`）、收件地址（Yup: 必填, ≥10 字）三個 VeeValidate 欄位，onBlur 即時驗證（FR-UI-008）
- [ ] T010 [US1] 建立 `src/views/ShipForm.vue`，整合 ShippingMethodSelector + HomeDeliveryFields + AddressDropdown + MultiStoreWarning；手機版全螢幕頁面（`/prize-box/ship`）、桌機版 Modal（max-width 600px）；「確認出貨」按鈕提交期間 Spinner 禁用（FR-UI-003）
- [ ] T011 [US1] 在 `ShipForm.vue` 中，表單提交時呼叫 `shippingService.ship()`；成功後關閉 Modal + Toast「出貨申請成功！」+ 導向 `/orders/{orderId}`（從 response.orders[0].orderId 取得）；失敗時顯示 submitError（FR-UI-004）
- [ ] T012 [US1] 在 `ShipForm.vue` onMounted 呼叫 `addressService.getAddresses()`，預設地址自動填入 HomeDeliveryFields（FR-UI-002）

---

## Phase 4: [US2] 選擇超商取貨

- [ ] T013 [US2] 建立 `src/components/shipping/ConvenienceStoreFields.vue`，包含：超商店碼（Yup: 必填, `/^\d{6}$/`）、超商店名（Yup: 2–50 字）、超商地址三個 VeeValidate 欄位
- [ ] T014 [US2] 在 `ShipForm.vue` 整合 ConvenienceStoreFields：shippingMethod = CONVENIENCE_STORE 時顯示超商欄位，隱藏宅配地址欄位（動畫過渡 ≤300ms，FR-UI-001）；電話欄位使用 `type="tel"`（FR-UI-007）；送出時 Request body 正確帶入 storeCode/storeName/storeAddress

---

## Phase 5: [US3] 多店家拆單警告

- [ ] T015 [US3] 在 `ShipForm.vue` 計算已選賞品的 storeId 集合，若 > 1 顯示 MultiStoreWarning；表單送出後 response.orders.length > 1 時，在成功後 Modal 或 Toast 列出所有 orderNo（US3 AC-2）

---

## Phase 6: [US4] 查看出貨狀態

- [ ] T016 [P] [US4] 建立 `src/components/shipping/OrderStatusTimeline.vue`，固定 4 節點（PENDING/PREPARING/SHIPPED/COMPLETED）；已完成節點：填色圓點 + timestamp；當前節點：脈衝動畫；未到達：空心灰色（FR-UI-005~007）
- [ ] T017 [US4] 建立（或完善）`src/views/OrderDetail.vue`（`/orders/{id}`），onMounted 呼叫 `orderService.getOrderDetail(id)`；顯示 OrderStatusTimeline + 收件資訊唯讀卡 + 賞品列表；`shippingMethod` 決定顯示宅配或超商欄位

---

## Final Phase: Polish

- [ ] T018 [P] 確認 `ShipForm.vue` 的響應式行為（手機全頁 vs 桌機 Modal）；確認 `<input type="tel">` 在 iOS/Android 觸發數字鍵盤
- [ ] T019 [P] 將 OrderStatusTimeline 樣式中脈衝動畫確認不產生 Layout Shift（SC-004）

---

## Dependencies

```
T001 → T002 → T010 → T011
T003 → T007 → T012
T004 → T017
T005 → T010
T006, T008 → T010
T009 → T010
T013 → T014
T016 → T017
```

## Parallel Opportunities

- T002, T003, T004 可同時建立（各自獨立 service）
- T009, T013 可同時開發（各自欄位組件）
- T016 可獨立開發後接入 T017

## Implementation Strategy

MVP = Phase 3（T009–T012）完成宅配出貨；超商（Phase 4）、拆單（Phase 5）、詳情頁（Phase 6）依序完成。
