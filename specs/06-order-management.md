# 06 - 訂單管理

> **路由前綴**：`/order`（均需 Authorization Token）  
> 訂單由「申請出貨（POST /prize-box/ship）」自動建立，不需要玩家手動建立。

---

## API 列表

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/order/list` | 查詢訂單列表 |
| GET | `/order/{orderId}` | 取得訂單詳情 |
| POST | `/order/{orderId}/shipping-info` | 更新物流資訊（補填）|

---

## 訂單資料結構

```typescript
interface OrderRes {
  id: string;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  totalAmount: number;           // 訂單總金額（目前為 0，以金幣為主）
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  city: string;
  district: string;
  address: string;
  note: string | null;
  trackingNumber: string | null; // 物流追蹤號碼（出貨後才有）
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: OrderItemRes[];
}

interface OrderItemRes {
  id: string;
  prizeBoxId: string;
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string;
  isGrandPrize: boolean;
  lotteryTitle: string;
}

type OrderStatus =
  | 'PENDING'      // 待處理
  | 'CONFIRMED'    // 已確認
  | 'SHIPPING'     // 出貨中
  | 'DELIVERED'    // 已送達
  | 'CANCELLED'    // 已取消
  | 'RETURNED';    // 已退回
```

---

## 查詢訂單列表

```
POST /api/order/list
Authorization: Bearer {token}
```

```typescript
interface OrderListReq {
  condition?: {
    status?: OrderStatus;
    keyword?: string;       // 模糊搜尋訂單 ID 或商品名稱
    createdAtStart?: string;
    createdAtEnd?: string;
  };
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

> 後端自動過濾：只返回**當前登入玩家**的訂單，不需傳 `userId`。

---

## 取得訂單詳情

```
GET /api/order/{orderId}
Authorization: Bearer {token}
```

> 如果訂單不屬於當前玩家，後端回傳 `403 Forbidden`。

---

## 更新收件資訊

```
POST /api/order/{orderId}/shipping-info
Authorization: Bearer {token}
```

```typescript
interface ShipInfoReq {
  recipientName: string;
  recipientPhone: string;
  zipCode?: string;
  city: string;
  district: string;
  address: string;
  note?: string;
}
```

> ⚠️ 僅限 `status = PENDING` 的訂單可修改，其他狀態回傳 `400`。

---

## 訂單狀態流轉

```
申請出貨（/prize-box/ship）
        │
        ▼
    PENDING（待處理）
        │
        │ 店家確認
        ▼
    CONFIRMED（已確認）
        │
        │ 店家出貨（填入追蹤號）
        ▼
    SHIPPING（出貨中）
        │
        │ 送達確認
        ▼
    DELIVERED（已送達）
```

---

## 前端 UI 建議

### 訂單列表頁
- Tab 切換訂單狀態
- 顯示：店家名稱、訂單建立時間、商品縮圖（前 3 個）、狀態 Badge
- 點擊進入詳情頁

### 訂單詳情頁
- 顯示完整收件地址
- 顯示物流追蹤號（`trackingNumber`）- 有值才顯示
- 顯示商品列表（獎品圖 + 名稱 + 等級）
- `status = PENDING` 時：顯示「修改地址」按鈕
- `status = SHIPPING` 時：可顯示外部物流追蹤連結
