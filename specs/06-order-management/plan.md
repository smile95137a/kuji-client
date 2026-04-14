# Plan: 06 - 訂單管理

> Branch: `feat/06-order-management`
> Worktree: `../kuji-client--feat-06/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## 補齊項目

### orderService.ts 新增 submitShippingInfo()

```typescript
export async function submitShippingInfo(
  orderId: string,
  req: OrderShippingInfoReq
): Promise<void> {
  await api.post(`${basePath}/${orderId}/shipping-info`, req)
}
```

---

## 元件邊界

```
OrderHistory.vue（view）
  ├── OrderFilterBar.vue（狀態過濾）
  └── OrderCard.vue（單一訂單摘要 + 點擊跳詳情）

OrderDetail.vue（view）
  ├── OrderStatusBadge.vue（狀態 + 時間軸）
  ├── OrderItemList.vue（獎品列表）
  ├── ShippingInfoDisplay.vue（已填寫時顯示收件資訊）
  └── ShippingInfoForm.vue（PENDING 狀態才顯示，補填收件資訊）
      └── AddressSelector.vue（既有地址選擇 + 或手動填寫）

Composables:
  useOrderList.ts（列表 fetch + 過濾 + 分頁）
  useOrderDetail.ts（詳情 fetch + submitShippingInfo）
```

---

## ShippingInfoForm.vue 規格

- 只在 `order.status === 'PENDING'` 時顯示
- 兩種填法：
  1. 選擇既有地址（`useAddressBook()` 取列表）
  2. 手動填寫（city/district/detailAddress/postalCode + recipientName/Phone）
- 送出後 refresh 訂單詳情（狀態會變 PROCESSING）
- 送出後收起表單，顯示 `ShippingInfoDisplay`

---

## OrderList.vue vs OrderHistory.vue 確認

實作時開啟兩個檔案比較：
- 若 `OrderList.vue` 是舊版或空殼 → 刪除，統一用 `OrderHistory.vue`
- 若有功能差異 → 整合後刪除 `OrderList.vue`
