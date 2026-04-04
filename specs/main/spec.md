# KUJI 前端規格書 — 跨功能澄清紀錄

**專案**：kuji-client（前台）
**分支**：main
**建立日期**：2026-03-31
**狀態**：澄清完成（5/5）

此文件記錄跨越多個功能模組（specs/001–014）的設計決策與澄清結果，作為所有子規格書的統一參照。

---

## 澄清內容索引

| 問題 | 影響模組 | 狀態 |
|------|----------|------|
| `POST /api/prize-box/ship` Response 格式 | 002, 004, 010 | ✅ 已解決 |
| 即時狀態同步機制（保護計時器/指定完成） | 003, 005 | ✅ 已解決 |
| `prizeLevel` 枚舉值定義與色彩映射 | 003, 004, 008, 010, 011 | ✅ 已解決 |
| `PlayMode` 枚舉與刮刮樂子模式區分 | 005, 011 | ✅ 已解決 |
| 付款 `paymentUrl` 流程架構 | 006 | ✅ 已解決 |

---

## Clarifications

### Session 2026-03-31

- Q: `POST /api/prize-box/ship` 在多店家拆單時的 Response 格式為何？ → A: 永遠回傳陣列格式 `{ orders: [{ orderId, orderNo, storeName, prizeCount }] }`，單店出貨時陣列長度為 1。
- Q: 當開套者完成大賞指定後，其他玩家的畫面如何更新？ → A: 本地倒數 + 短輪詢：保護計時器純前端倒數；玩家在抽獎頁時每 10 秒靜默重新取得 `/tickets`，偵測 `grandPrizesDesignated` 變化後自動解鎖。
- Q: `prizeLevel` 的正式枚舉值與色彩映射為何？ → A: 以 data-model.md 為準，等級為字母順序（A、B、C、D...至後端實際提供的字母），加上 FINAL（最終獎）與 LAST（最後一張）；謝謝惠顧以 `prizeId = null` 識別，不佔用 prizeLevel 欄位；各規格書中的 S/SP 描述廢棄。
- Q: 刮刮樂 PlayMode 子類型 SCRATCH_STORE/SCRATCH_PLAYER 如何處理？ → A: 廢棄 SCRATCH_STORE/SCRATCH_PLAYER；統一用 `SCRATCH_MODE`（data-model.md 定義），子行為由 `session.isOpener + session.grandPrizesDesignated` 組合判斷。
- Q: 付款 `paymentUrl` 是否一定存在？ → A: 一律重新導向；`paymentUrl` 為必需欄位，前端永遠 redirect 至第三方付款頁，後端 callback 更新點數，前端在回傳頁 `/wallet/topup/return` 重新取得餘額。

---

## 功能需求補充（跨模組）

### 出貨訂單 Response 統一格式（影響 002、004、010）

- **FR-CROSS-001**：`POST /api/prize-box/ship` 的成功 Response **永遠**回傳陣列格式：
  ```json
  {
    "orders": [
      { "orderId": "uuid", "orderNo": "ORD-xxx", "storeName": "店家名", "prizeCount": 2 }
    ]
  }
  ```
  單一店家出貨時陣列長度為 1；多店家拆單時陣列包含多筆。前端統一以 `response.orders` 處理，不需分支判斷。

- **FR-CROSS-002**：出貨成功後的 Toast 文字：單店 — 「出貨申請成功！訂單號：{orders[0].orderNo}」；多店 — 「出貨申請成功！已建立 {orders.length} 筆訂單」。

### 賞品等級（PrizeLevel）統一定義（影響 003、004、008、010、011）

- **FR-CROSS-004**：`prizeLevel` 正式枚舉採用 **data-model.md** 定義：`'A' | 'B' | 'C' | 'D' | ... | 'FINAL' | 'LAST'`，字母依後端商品設定依序排列（A 為最高等級）。規格書中舊有的 S、SP 描述**廢棄**。

- **FR-CROSS-005**：「謝謝惠顧」以 **`prizeId = null`** 識別，**不佔用** `prizeLevel` 欄位值。

- **FR-CROSS-006**：前端色彩映射規則（以字母順位為準）：

  | prizeLevel | 顯示顏色 | 說明 |
  |-----------|---------|------|
  | A | 金色 `#FFD700` | 最高等級 |
  | B | 紅色 `#E53E3E` | |
  | C | 橙色 `#ED8936` | |
  | D | 綠色 `#38A169` | |
  | E 以後 | 藍色 `#3182CE` | 依後端實際提供字母 |
  | FINAL | 紫色 `#805AD5` | 最終獎品 |
  | LAST | 深藍色 `#2B6CB0` | 最後一張特殊標記 |
  | `prizeId=null` | 灰色 `#718096` | 謝謝惠顧 |

### PlayMode 統一定義（影響 005、011）

- **FR-CROSS-007**：`PlayMode` 採 data-model.md 定義：`'LOTTERY_MODE' | 'SCRATCH_MODE'`。舊規格中的 `SCRATCH_STORE`、`SCRATCH_PLAYER` 枚舉值**廢棄**。

- **FR-CROSS-008**：刮刮樂子模式判斷邏輯（`playMode === 'SCRATCH_MODE'` 時）：

  | `isOpener` | `grandPrizesDesignated` | 行為 |
  |-----------|------------------------|------|
  | `true` | `false` | 開套者需先指定大賞位置（進入開套頁） |
  | `true` | `true` | 開套者直接進入抽獎頁 |
  | `false` | `false` | 非開套者等待指定（格子鎖定，10s 輪詢） |
  | `false` | `true` | 非開套者直接抽獎 |
