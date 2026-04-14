# Spec: 06 - 訂單管理

> 來源: `specs/06-order-management.md`
> Branch: `feat/06-order-management`
> 路徑前綴: `/order`（均需 Token）

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/order/list` | 查詢我的訂單（分頁） |
| GET | `/order/{orderId}` | 訂單詳情 |
| POST | `/order/{orderId}/shipping-info` | 補填/更新收件資訊 ← **目前程式碼缺失** |

---

## /order/{orderId}/shipping-info 請求規格

```typescript
interface OrderShippingInfoReq {
  recipientName: string
  recipientPhone: string
  addressId?: string       // 使用既有地址 ID（二選一）
  address?: {              // 或直接填寫地址（二選一）
    city: string
    district: string
    detailAddress: string
    postalCode: string
  }
}
```

**業務規則**:
- 只有 `PENDING` 狀態的訂單可更新收件資訊
- 更新後訂單進入 `PROCESSING`
- `addressId` 與 `address` 擇一填寫

---

## 訂單狀態流程

```
PENDING → PROCESSING → SHIPPED → DELIVERED
                              ↘ CANCELLED
```

---

## OrderRes 型別（關鍵欄位）

```typescript
interface OrderRes {
  orderId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  storeId: string
  storeName: string
  items: OrderItemRes[]
  totalPrice: number
  recipientName: string | null      // PENDING 時可能為空
  recipientPhone: string | null
  shippingAddress: string | null
  trackingNumber: string | null     // SHIPPED 後有值
  createdAt: string
}
```
