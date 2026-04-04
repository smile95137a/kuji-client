# 前端規格書（前台）：抽獎票券系統

**功能分支**：`cli/005-lottery-ticket-system`
**對應後端 Spec**：`specs/005-lottery-ticket-system/spec.md`
**建立日期**：2026-03-27
**狀態**：草稿
**介面類型**：前台用戶介面（Client App）
**存取角色**：需登入（ROLE_USER）

---

## 頁面與介面清單

### 頁面 1 — 刮刮樂開套頁（開套者指定大賞）
- **路由**：`/lottery/{id}/scratch-open`
- **存取權限**：需登入，僅開套者（`isOpener = true`）可存取
- **UI 元件**：
  - 顯示號碼格子（Revealed Number Grid）
  - 可選取位置 Checkbox（供開套者指定大賞）
  - 已指定位置標籤（大賞 / 一般 / 謝謝惠顧）
  - 保護抽數計數器（Protection Draw Counter）
  - 「確認指定」提交按鈕
  - 已指定提示 Banner（指定完成後顯示）

### 頁面 2 — 刮刮樂抽獎頁
- **路由**：`/lottery/{id}/scratch-draw`
- **存取權限**：需登入
- **UI 元件**：
  - 刮刮樂票券格子（Scratch Card Grid）
  - 顯示號碼（revealedNumber）在每張票券上
  - 刮開動畫（Scratch Reveal Animation）
  - 謝謝惠顧提示（No Prize Banner）
  - 保護倒數計時器（僅非開套者且保護期內顯示）
  - 抽獎按鈕

### 頁面 3 — 一番賞 / 扭蛋票券格子
- **路由**：`/lottery/{id}/draw`（LOTTERY_MODE）
- **UI 元件**：
  - 編號票券格子（numbered ticket grid）
  - 已抽票券覆蓋（drawn overlay with prize image）
  - 大賞標記（僅指定後）
  - 指定票選取功能

---

## 使用者情境與測試

### 使用者故事 1 — 刮刮樂開套者指定大賞位置（優先級：P1）

開套者（`isOpener = true`，`grandPrizesDesignated = false`）進入新刮刮樂套組，需先指定哪些顯示號碼對應大賞，再讓其他玩家抽獎。

**此優先級的原因**：此步驟是保護機制的前置條件，未完成指定則其他玩家無法抽獎，直接影響商品可玩性。

**獨立測試**：
1. 以開套者身份（`isOpener = true`，`grandPrizesDesignated = false`）進入 `/lottery/{id}/scratch-open`。
2. 從 `revealedNumbers` 格子中勾選要指定為大賞的位置。
3. 點擊「確認指定」。

**驗收情境**：
1. **在** 開套頁顯示，**當** `grandPrizesDesignated = false`，**則** 顯示所有 `revealedNumber` 號碼格子供選擇，頁面頂部顯示提示「請指定大賞所在位置（可選擇 X 個）」。
2. **在** 玩家已選取大賞位置，**當** 點擊「確認指定」，**則** 呼叫 `POST /api/lottery/draw/{lotteryId}/designate`，body 為 `{ prizeNumbers: [3, 7, 15] }`（revealedNumber 值）。
3. **在** 指定 API 成功，**當** 收到 `{ success: true, designatedCount: 3 }`，**則** 頁面顯示「指定完成！其他玩家現在可以開始抽獎」，同時更新 `grandPrizesDesignated = true`。
4. **在** `grandPrizesDesignated = true`，**當** 開套者再次進入開套頁，**則** 格子以唯讀模式顯示已指定位置，不允許重新指定。
5. **在** 非開套者，**當** 嘗試存取 `/lottery/{id}/scratch-open`，**則** 重新導向至 `/lottery/{id}/scratch-draw`。

### 使用者故事 2 — 刮刮樂抽獎（謝謝惠顧場景）（優先級：P1）

玩家在刮刮樂頁面刮開一張票券，結果為謝謝惠顧（prizeId = null）。

**此優先級的原因**：刮刮樂與一番賞的本質差異在於可能出現謝謝惠顧，前端必須區別處理。

**驗收情境**：
1. **在** 刮刮樂抽獎頁，**當** Draw API 返回 `prizeId = null`，**則** 顯示謝謝惠顧動畫，文字「謝謝惠顧」，不顯示獎品圖。
2. **在** 謝謝惠顧結果，**當** 玩家看到結果，**則** 結果 Modal 顯示「很遺憾，這次未中獎，繼續加油！」，並說明已消耗的點數。
3. **在** 刮刮樂票券格子，**當** 某票券為 `DRAWN` 且 `prizeId = null`，**則** 票券顯示「謝謝惠顧」文字覆蓋（灰色），不顯示賞品圖。

### 使用者故事 3 — 店家已預設大賞（`grandPrizesDesignated = true`）（優先級：P1）

`playMode = SCRATCH_MODE` 且 `grandPrizesDesignated = true`（店家已預設大賞位置），開套者不需指定，直接進入刮刮樂頁面抽獎。此模式與「開套者指定」模式同屬 `SCRATCH_MODE`，差異僅在 `grandPrizesDesignated` 初始值（`true` vs `false`）與 `isOpener` 標記。

**驗收情境**：
1. **在** `playMode = SCRATCH_MODE` 且 `grandPrizesDesignated = true`，**當** 玩家進入商品頁，**則** 直接顯示抽獎格子，無需指定位置步驟。
2. **在** 上述情境，**當** `isOpener = true`，**則** 開套者同樣直接進入抽獎頁，不顯示指定提示。

### 使用者故事 4 — 開套者保護退款（優先級：P2）

刮刮樂開套者在保護抽數內抽中大賞，系統退還點數。

**此優先級的原因**：保護退款是前端需要正確顯示的特殊結果。

**驗收情境**：
1. **在** `isOpener = true`，**當** 在保護抽數內抽中大賞，**則** 結果 Modal 顯示「🎉 恭喜中大賞！保護機制退還點數 XXX」，`remainingGold`/`remainingBonus` 顯示退款後正確餘額。
2. **在** 開套頁，**當** 保護計數顯示，**則** 顯示「保護抽數：已用 X / 總計 Y 次」進度條。

### 使用者故事 5 — 一番賞隨機模式與指定模式切換（優先級：P1）

一番賞玩家可在隨機抽和指定票號之間切換。

**驗收情境**：
1. **在** 一番賞票券格子，**當** 玩家未點選任何票券，**則** 抽獎按鈕顯示「隨機抽 1 次 — XXX 點」。
2. **在** 玩家點選票券 #42，**當** 票券被選中，**則** 按鈕更新為「抽 #42 — XXX 點」，點擊後 request 包含 `ticket: ["ticket-uuid"]`。
3. **在** 玩家再次點選已選中的票券 #42，**當** 取消選取，**則** 恢復隨機模式按鈕。

---

## API 串接規格

### 票券系統

| 動作 | Method | 端點 | 主要 Request 欄位 | 主要 Response 欄位 | 前端 UI 狀態 |
|------|--------|------|------------------|--------------------|-------------|
| 取得票券列表與 Session | GET | `/api/lottery/draw/{lotteryId}/tickets` | 無 | `tickets[].id`, `tickets[].ticketNumber`, `tickets[].status`, `tickets[].revealedNumber`(SCRATCH), `session.isOpener`, `session.protectionEndTime`, `session.grandPrizesDesignated` | 初始化票券格子 |
| 執行抽獎 | POST | `/api/lottery/draw/{lotteryId}/draw` | `count`, `ticket`(optional) | 陣列：`ticketNumber`, `prizeId`(null=謝謝惠顧), `prizeName`, `prizeLevel`, `isGrandPrize`, `isFinalPrize`, `remainingGold`, `remainingBonus` | 抽獎動畫 → 結果 Modal |
| 指定大賞位置（開套者）| POST | `/api/lottery/draw/{lotteryId}/designate` | `prizeNumbers: [revealedNumber, ...]` | `success`, `designatedCount` | 完成指定提示 |

#### 票券 Response 結構（SCRATCH 模式）
```json
{
  "tickets": [
    {
      "id": "ticket-uuid-1",
      "ticketNumber": 1,
      "status": "AVAILABLE",
      "revealedNumber": 23
    },
    {
      "id": "ticket-uuid-2",
      "ticketNumber": 2,
      "status": "DRAWN",
      "revealedNumber": 7,
      "prizeInfo": {
        "prizeName": "B賞",
        "prizeLevel": "B",
        "prizeImageUrl": "..."
      }
    }
  ],
  "session": {
    "isOpener": true,
    "protectionEndTime": "2026-03-28T12:00:00",
    "grandPrizesDesignated": false
  }
}
```

**安全重要事項**：
- `AVAILABLE` 票券：`prizeInfo` 欄位**不得**存在於 Response（後端不返回，前端不顯示）
- `revealedNumber` 僅在刮刮樂模式（SCRATCH）的票券中存在
- `AVAILABLE` 票券的 `revealedNumber` 與大賞的對應關係**不得**揭露給非開套者

---

## 功能需求（前端 UI）

### 票券格子（通用）

- **FR-UI-001**：票券格子使用 CSS Grid 排列，手機 5 列、平板 8 列、桌機 10 列。
- **FR-UI-002**：`AVAILABLE` 票券：白色背景，顯示票券號碼（或刮刮樂的 revealedNumber）。
- **FR-UI-003**：`DRAWN` 票券：深灰色蒙層，若有 `prizeInfo` 顯示小縮圖；若 `prizeId = null` 顯示「謝謝惠顧」文字。
- **FR-UI-004**：票券總數顯示（`已抽 X / 共 Y 張`）在格子頂部。

### 刮刮樂特有

- **FR-UI-005**：刮刮樂票券上顯示 `revealedNumber`（不顯示 `ticketNumber`），避免玩家根據 `ticketNumber` 推算大賞位置。
- **FR-UI-006**：刮刮樂動畫：點擊票券後顯示「刮開」動畫效果（銀色消散特效），時長 0.8 秒。
- **FR-UI-007**：`playMode = SCRATCH_MODE` 且 `isOpener = true` 且 `grandPrizesDesignated = false` 時，刮刮樂格子顯示鎖定狀態，Overlay 顯示「請先完成大賞指定」。

### 狀態管理

- **SM-001**：`playMode` — 從商品詳情取得：`LOTTERY_MODE` | `SCRATCH_MODE`（依 data-model.md 定義；舊規格的 SCRATCH_STORE/SCRATCH_PLAYER 已廢棄，改由 `isOpener + grandPrizesDesignated` 組合判斷）— 已澄清（2026-03-31）。
- **SM-002**：`tickets` — 票券陣列，每次抽獎後 patch 對應票券狀態。
- **SM-003**：`sessionInfo` — `{ isOpener, protectionEndTime, grandPrizesDesignated }`。
- **SM-004**：`designatedNumbers` — 開套者指定頁面中已選取的 revealedNumbers Set。
- **SM-005**：`isDesignating` — 指定 API 呼叫中狀態。

---

## API 驗證清單

- **AV-001** ✅：`tickets[].revealedNumber` 只在 SCRATCH 模式存在，LOTTERY_MODE 不需要此欄位。
- **AV-002** ✅：`AVAILABLE` 票券的 `prizeInfo` 不包含在 Response，安全需求已知。
- **AV-003** ✅：`designate` API 使用 `prizeNumbers`（revealedNumber 值），而非 ticket UUID。
- **AV-004** ✅：`playMode` 枚舉採 data-model.md 定義：`'LOTTERY_MODE' | 'SCRATCH_MODE'`。「店家預設大賞」與「開套者指定大賞」同屬 `SCRATCH_MODE`，差異由 `session.grandPrizesDesignated`（`true` = 店家已設/已指定，`false` = 待指定）搭配 `session.isOpener` 判斷；SCRATCH_STORE/SCRATCH_PLAYER 枚舉值廢棄 — 已澄清（2026-03-31）。
- **AV-005** ⚠️：`session.protectionDrawsUsed` 和 `session.protectionDrawsTotal` 是否在 Session Response 中？需要這兩個值才能顯示保護進度條。
- **AV-006** ❌：`GET .../tickets` 在 SCRATCH_PLAYER 模式且開套者尚未指定時，Response 是否仍返回所有 `revealedNumber`？若是，非開套者能看到 `revealedNumber` 而後端需確保 `prizeNumbers` 映射不洩漏。
- **AV-007** ✅：保護時間到期採**純前端倒數**（由 `protectionEndTime` 計算），無需伺服器確認即可自動解鎖按鈕。當玩家在抽獎頁等待開套者指定大賞時，頁面每 10 秒靜默重新呼叫 `GET .../tickets`，偵測到 `grandPrizesDesignated = true` 後立即解鎖，不依賴 WebSocket — 已澄清（2026-03-31）。
- **AV-008** ❌：`designate` API 未說明最多可指定幾個位置（大賞數量） — 開套者需知道還可以指定幾個，需後端在 Session 或 Designate Response 中提供此數值。

凡例：✅ 已確認一致 | ⚠️ 需要確認 | ❌ 發現缺口

---

## Clarifications

### Session 2026-03-31

- Q: 刮刮樂模式子類型（SCRATCH_STORE vs SCRATCH_PLAYER）如何區分？ → A: 以 data-model.md 為準，使用 `SCRATCH_MODE` + `isOpener` + `grandPrizesDesignated` 組合判斷；SCRATCH_STORE/SCRATCH_PLAYER 廢棄。
- Q: 保護時間到期與大賞指定完成的狀態同步機制為何？ → A: 保護時間純前端倒數（`protectionEndTime`）；指定完成狀態每 10 秒輪詢 `GET .../tickets`，偵測到 `grandPrizesDesignated = true` 後立即解鎖，不用 WebSocket。

---

## 成功標準

- **SC-001**：刮刮樂動畫在低階手機（e.g., Chrome 安卓中階機型）上運行流暢，幀率 ≥ 30fps。
- **SC-002**：大賞揭示動畫不同於普通獎品動畫，有明顯差異（慶祝效果）。
- **SC-003**：`AVAILABLE` 票券的大賞位置資訊完全不出現在 DOM 或 JavaScript 變數中（DevTools Network 和 Elements 面板均無洩漏）。
- **SC-004**：保護倒數計時器精準到秒，不因 tab 切換或瀏覽器最小化停止計時。
- **SC-005**：指定完成後，頁面狀態立即反映（不需要重整）；其他玩家的抽獎按鈕透過**每 10 秒輪詢** `GET .../tickets` 自動解鎖（`grandPrizesDesignated` 從 `false` 變 `true`），不使用 WebSocket。
