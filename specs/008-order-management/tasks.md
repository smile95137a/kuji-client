# Tasks: 008 — 訂單管理

**Feature**: Order Management | **Branch**: `cli/008-order-management` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/order.ts`，定義 `Order`（id, orderNo, status, statusName, storeName, prizeCount, shippingMethod, shippingMethodName, createdAt）、`OrderDetail`（+ prizes[], shippingInfo{recipientName, recipientPhone, address, storeCode?, storeName?}, statusHistory[{status, timestamp}]）interface
- [ ] T002 建立 `src/services/order.ts`（若未存在），實作：`getOrders()` → `GET /api/orders`；`getOrderDetail(id)` → `GET /api/orders/{id}`
- [ ] T003 建立 `src/stores/order.ts`，定義 Pinia store：orders / activeStatusFilter（ALL/PENDING/PREPARING/SHIPPED/COMPLETED）/ orderDetail；computed：filteredOrders（客戶端過濾）/ statusCounts（各 Tab 數量）

---

## Phase 2: Foundational

- [ ] T004 [P] 建立 `src/components/order/OrderStatusBadge.vue`，狀態 Badge（PENDING=藍色#3182CE / PREPARING=黃色#D69E2E / SHIPPED=橙色#DD6B20 / COMPLETED=綠色#38A169，FR-UI-002）
- [ ] T005 [P] 建立 `src/components/order/OrderStatusTimeline.vue`，固定 4 節點 PENDING/PREPARING/SHIPPED/COMPLETED；已完成：填色圓點 + timestamp（YYYY/MM/DD HH:mm）；當前：脈衝動畫圓點；未到達：空心灰色；節點圖示（⏳/📦/🚚/✅）（FR-UI-005~007）
- [ ] T006 [P] 建立 `src/components/order/PrizeList.vue`，賞品清單：圖片（imageUrl 為空顯示預設圖 US2 AC-5）+ 等級標籤（FR-CROSS-006 顏色映射）+ 名稱 + prizeValue（小字「參考價值：NT$ XXX」FR-UI-009）

---

## Phase 3: [US1] 瀏覽個人訂單列表

- [ ] T007 [US1] 建立 `src/components/order/OrderCard.vue`：顯示 orderNo/storeName/prizeCount 件/shippingMethodName/createdAt/OrderStatusBadge；整個卡片可點擊（cursor: pointer，FR-UI-003）→ 導向 `/orders/{id}`；Tab 標籤旁顯示數量（「待出貨 (3)」FR-UI-001）
- [ ] T008 [US1] 建立 `src/views/OrderList.vue`（`/orders`）：onMounted 呼叫 `getOrders()`；顯示 OrderCard 列表（依 createdAt 降序）；狀態 Tab 篩選（客戶端 filteredOrders computed，響應 ≤50ms SC-002 FR-UI-004）；空狀態：插圖（包裹圖示）+ 「尚無訂單記錄」+ 「前往商品頁」按鈕（→ `/lottery`，US1 AC-4/SC-005）；點擊卡片導向詳情（US1 AC-5）

---

## Phase 4: [US2] 查看訂單詳情與出貨狀態

- [ ] T009 [US2] 建立 `src/components/order/RecipientInfoCard.vue`，收件資訊唯讀卡（純展示，無 input 元素 SC-006）；HOME_DELIVERY：姓名/電話/地址；CONVENIENCE_STORE：姓名/電話/超商名稱/店碼/超商地址（US3 AC-1/2）；顯示「此資訊為出貨時確認，不可更改」文字（US2 AC-4）；出貨方式圖示（🏠/🏪，US3 AC-3）
- [ ] T010 [US2] 建立 `src/views/OrderDetail.vue`（`/orders/{id}`）：onMounted 呼叫 `getOrderDetail(id)`；顯示：訂單號/大型狀態 Badge/店家名稱 + OrderStatusTimeline + PrizeList + RecipientInfoCard；「返回訂單列表」按鈕（US2 AC-1）；statusHistory 最新狀態在頂部（US2 AC-2）；當前節點高亮（US2 AC-3）
- [ ] T011 [US2] 確認 `OrderStatusTimeline.vue` 的 getStepStatus 邏輯（completed/active/pending）；active 節點脈衝動畫不產生 Layout Shift（SC-004）

---

## Phase 5: [US3] 不同出貨方式的收件資訊

- [ ] T012 [US3] 確認 `RecipientInfoCard.vue` 在 HOME_DELIVERY/CONVENIENCE_STORE 分別顯示正確欄位（US3 AC-1/2）；AV-004 Deferred：若後端超商 shippingInfo 缺 storeCode，前端顯示「-」佔位（不崩潰）

---

## Phase 6: [US4] 訂單完成後跳轉至商品頁

- [ ] T013 [US4] 在 `OrderDetail.vue` 底部添加「再次前往此商品」按鈕，若 orderDetail.lotteryId 存在則導向 `/lottery/{lotteryId}`（AV-006 Deferred：若 lotteryId 缺失則隱藏按鈕）（US4 AC-1）

---

## Final Phase: Polish

- [ ] T014 [P] 確認 `OrderList.vue` 50 筆訂單首次渲染 ≤ 1s（SC-001）；確認 `OrderDetail.vue` 詳情頁 API 完成後 ≤300ms 渲染（SC-003）
- [ ] T015 [P] 確認 statusHistory 的 status 值（英文枚舉）在前端自行 mapping 為中文標籤（PENDING→待出貨 etc.，AV-009 workaround）；確認 prizes[].level 顏色映射與 FR-CROSS-006 一致（AV-008）

---

## Dependencies

```
T001 → T002 → T003
T004 → T007 → T008
T005, T006 → T010
T009 → T010
T011 → T010
T013 → T010
T012 → T009
```

## Parallel Opportunities

- T004, T005, T006 可同時開發
- T007, T009 可同時開發
- T011, T012, T013 可在 T010 的同時完成整合

## Implementation Strategy

MVP = Phase 3（T007+T008 訂單列表）+ Phase 4（T009+T010 詳情）；US3 收件資訊（Phase 5）與 US4（Phase 6）為增強項。
