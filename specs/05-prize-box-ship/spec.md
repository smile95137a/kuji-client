# 05-ship - 賞品盒出貨確認流程

> 本 spec 補充 `05-prize-box.md`，專注於出貨確認 Dialog 的設計與規格。

---

## 問題描述

目前點擊「批次出貨」或「申請出貨」時，直接呼叫後端 API，使用者看不到：

- 將要出貨的項目清單（獎品名稱、所屬店家）
- 個人資訊（受件人姓名、電話）
- 配送地址
- 費用摘要

---

## 出貨流程（新）

```
勾選獎品
    │
    ▼
點擊「批次出貨」或「申請出貨」
    │
    ▼
開啟 PrizeBoxShipDialog
    │
    ├─ 顯示出貨清單（依店家分組）
    ├─ 個人資訊（預設帶入 default address 的 recipientName/phone）
    ├─ 配送地址（整合地址本，可選現有或手動輸入）
    ├─ 費用摘要（目前免費）
    └─ 備註（可選）
         │
         ▼ 點擊「確認出貨」
         │
         ├─ 依 storeId 自動分組 → 每組呼叫一次 POST /prize-box/ship
         ├─ 全部成功 → 成功提示 → 關閉 Dialog → 重新載入清單
         └─ 任一失敗 → 顯示錯誤，不關閉 Dialog（保留填入資料）
```

---

## 跨店自動分單規則

- 選取的 `prizeBoxIds` 依 `storeId` 分組
- 每組分別呼叫一次 `POST /prize-box/ship`，共用同一份配送資訊
- Dialog 頂部顯示提示：「本次將建立 N 筆訂單（A 店 2 件 / B 店 1 件）」
- 若只有一家店，不顯示分單提示

---

## 後端 API 規格

```typescript
// POST /api/prize-box/ship
interface PrizeBoxShipReq {
  prizeBoxIds: string[];    // 必須同一家店
  recipientName: string;
  recipientPhone: string;
  zipCode?: string;
  city: string;
  district: string;
  address: string;
  note?: string;
}

// Response（無 paymentUrl，目前出貨免費）
interface ShipResult {
  orderId: string;
  prizeBoxCount: number;
  totalItems: number;
}
```

---

## PrizeBoxShipDialog 內容區塊

### 區塊一：出貨清單

| 欄位 | 說明 |
|------|------|
| 店家名稱 | 分組標題 |
| 獎品縮圖 | 60×60 |
| 獎品名稱 + 等級 | `prizeName（prizeLevel賞）` |
| 小計筆數 | 每店家幾件 |
| 總件數提示 | 共 N 件 / N 家店 |

### 區塊二：配送資訊

- 地址本選取下拉（`GET /user/addresses`）
- 預設選中 `isDefault = true` 的地址
- 選取後自動填入下方欄位（可手動覆寫）
- 或不選（新地址：手動填全部欄位）

| 欄位 | 必填 | 說明 |
|------|------|------|
| recipientName | ✅ | 受件人姓名 |
| recipientPhone | ✅ | 手機號碼 |
| city | ✅ | 縣市 |
| district | ✅ | 鄉鎮區 |
| address | ✅ | 詳細地址 |
| zipCode | ❌ | 郵遞區號（可選） |
| note | ❌ | 備註 |

### 區塊三：費用摘要

| 項目 | 顯示 |
|------|------|
| 出貨件數 | N 件 |
| 運費 | 目前免費 |
| 付款方式 | 說明「出貨費用由店家承擔」或「目前免費」 |

---

## 地址整合邏輯

1. Dialog 開啟時，呼叫 `GET /user/addresses` 取得地址本
2. 找到 `isDefault = true` 的地址 → 自動填入所有欄位（包含 recipientName / recipientPhone）
3. 使用者可從 select 切換地址（每切換一次，自動覆寫欄位）
4. 使用者也可在欄位上手動覆寫，不影響地址本
5. 無地址本（空陣列）→ 所有欄位留空讓使用者填

---

## UI 注意事項

- Dialog 採全螢幕覆蓋（overlay）形式，不是 inline
- 確認按鈕 label：「確認出貨（N 件）」
- 提交中：按鈕 disabled + loading spinner
- 關閉前若有未送出的資料 → 詢問是否確認離開（簡單 `window.confirm` 即可）
