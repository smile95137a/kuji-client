# 05 - 獎品盒管理

> **路由前綴**：`/prize-box`（均需 Authorization Token）  
> 抽獎後獎品會先進入獎品盒，玩家自行決定要「出貨（寄送）」還是「回收（換紅利）」。

---

## API 列表

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/prize-box` | 取得目前獎品盒（AVAILABLE 狀態） |
| GET | `/prize-box/history` | 取得獎品盒歷史紀錄 |
| GET | `/prize-box/summary` | 取得可出貨摘要（依店家分組） |
| POST | `/prize-box/ship` | 申請出貨（建立訂單） |
| POST | `/prize-box/recycle` | 回收換紅利 |

---

## 獎品盒資料結構

```typescript
interface PrizeBoxItemRes {
  id: string;                    // PrizeBox ID（出貨/回收時使用）
  lotteryId: string;
  lotteryTitle: string;
  storeId: string;
  storeName: string;
  prizeId: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string;
  isGrandPrize: boolean;
  status: 'AVAILABLE' | 'SHIPPED' | 'RECYCLED' | 'SHIPPING';
  recycleBonus: number;          // 可換紅利點數
  createdAt: string;             // 抽到的時間
  updatedAt: string;
}
```

---

## 取得目前獎品盒

```
GET /api/prize-box?status=AVAILABLE
Authorization: Bearer {token}
```

| 參數 | 說明 | 預設 |
|------|------|------|
| `status` | 篩選狀態（不填 = 返回 AVAILABLE） | `AVAILABLE` |

返回目前「可操作」的獎品。

---

## 取得歷史紀錄

```
GET /api/prize-box/history?status=&page=1&size=20
Authorization: Bearer {token}
```

| 參數 | 說明 |
|------|------|
| `status` | `SHIPPED` / `RECYCLED` / `SHIPPING`（不填 = 全部） |
| `page` | 頁碼（從 1 開始） |
| `size` | 每頁筆數 |

### 回應
```typescript
interface PageResult<PrizeBoxItemRes> {
  items: PrizeBoxItemRes[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
```

---

## 取得可出貨摘要（依店家分組）

```
GET /api/prize-box/summary
Authorization: Bearer {token}
```

### 回應（依店家分組，方便出貨 UI 選取）
```typescript
interface PrizeBoxSummaryRes {
  storeId: string;
  storeName: string;
  storeLogo: string;
  availableCount: number;       // 可出貨數量
  totalRecycleBonus: number;    // 全部回收可得紅利總計
  items: PrizeBoxItemRes[];     // 該店家的獎品列表
}
```

---

## 申請出貨（建立訂單）

```
POST /api/prize-box/ship
Authorization: Bearer {token}
```

```typescript
interface PrizeBoxShipReq {
  prizeBoxIds: string[];         // 要出貨的 PrizeBox ID 列表（必須同一家店）
  recipientName: string;
  recipientPhone: string;
  zipCode?: string;
  city: string;
  district: string;
  address: string;
  note?: string;                 // 備註
}
```

> ⚠️ **同一張訂單只能包含同一家店的獎品**，跨店需分別申請。

### 回應
```typescript
interface ShipResult {
  orderId: string;              // 建立的訂單 ID
  prizeBoxCount: number;        // 本次出貨獎品數量
  totalItems: number;
}
```

---

## 回收換紅利

```
POST /api/prize-box/recycle
Authorization: Bearer {token}
```

```typescript
interface PrizeBoxRecycleReq {
  prizeBoxIds: string[];         // 要回收的 PrizeBox ID 列表（可跨店）
}
```

### 回應
```typescript
interface RecycleResultRes {
  recycledCount: number;
  bonusEarned: number;          // 本次獲得紅利點數
  newBonusBalance: number;      // 回收後紅利餘額
}
```

---

## 狀態流轉圖

```
抽獎成功
    │
    ▼
AVAILABLE ──→ 選擇出貨 ──→ SHIPPING ──→ 店家出貨後 ──→ SHIPPED
    │
    └─────────→ 選擇回收 ──→ RECYCLED（紅利+N）
```

---

## 前端 UI 建議

### 獎品盒頁面
- 顯示所有 `AVAILABLE` 的獎品卡片
- 每張卡片顯示：獎品圖、名稱、等級、可回收紅利
- 底部固定「多選出貨」和「多選回收」按鈕
- 選取模式：可選擇多個獎品
  - 選擇出貨：跳出填寫地址彈窗
  - 選擇回收：確認對話框（顯示共可得 X 紅利）

### 出貨表單
- 預設帶入 `GET /user/addresses/default`（如果有）
- 允許手動輸入或從地址本選取
- 送出前確認提示：本次出貨 N 件，請確認地址

### 歷史紀錄
- Tab 切換：全部 / 已出貨 / 已回收
- 顯示時間、店家名稱、獎品圖（縮圖）
