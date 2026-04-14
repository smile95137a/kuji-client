# Task Checklist: 06 - 訂單管理

> Branch: `feat/06-order-management`
> Worktree: `../kuji-client--feat-06/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## Phase 1 — Service 補齊

- [ ] `orderService.ts`: 新增 `submitShippingInfo(orderId, req)` → `POST /order/{orderId}/shipping-info`
- [ ] 確認 `getMyOrders()` / `getOrderDetail()` 路徑正確

## Phase 2 — useOrderList.ts

- [ ] 新建 `src/composables/useOrderList.ts`
- [ ] 列表 fetch（POST /order/list）+ 狀態過濾 + 分頁

## Phase 3 — useOrderDetail.ts

- [ ] 新建 `src/composables/useOrderDetail.ts`
- [ ] fetchDetail(orderId) / submitShippingInfo(req)
- [ ] 提交後重新 fetch 更新狀態

## Phase 4 — 新元件

- [ ] 新建 `src/components/order/ShippingInfoForm.vue`
  - [ ] 只在 status=PENDING 時顯示
  - [ ] 兩種填法：既有地址選擇 / 手動填寫
  - [ ] 整合 useAddressBook（地址下拉）
- [ ] 新建 `src/components/order/ShippingInfoDisplay.vue`（已填寫時顯示）
- [ ] 新建 `src/components/order/OrderStatusBadge.vue`（狀態標籤）
- [ ] 新建 `src/components/order/AddressSelector.vue`（地址選擇下拉）

## Phase 5 — OrderDetail.vue 整合

- [ ] 引入 useOrderDetail composable
- [ ] PENDING 時顯示 ShippingInfoForm.vue
- [ ] 非 PENDING 時顯示 ShippingInfoDisplay.vue
- [ ] 提交後 refresh 訂單，表單消失改顯示 ShippingInfoDisplay

## Phase 6 — OrderList.vue vs OrderHistory.vue

- [ ] 開啟 `src/views/member/OrderList.vue` 確認內容
- [ ] 若是空殼或舊版 → 刪除（保留 OrderHistory.vue）

## Phase 7 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] 訂單列表正確顯示
- [ ] PENDING 訂單顯示補填收件資訊表單
- [ ] 填寫後訂單狀態更新為 PROCESSING
- [ ] 非 PENDING 訂單不顯示表單
