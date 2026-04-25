# Task Checklist: 028 - 前台儲值 / 刮刮樂格子修復

> 實作 2 個 bug 修復，共涉及 3 個檔案。

---

## Phase 1 — DepositHistory 狀態篩選修復

- [x] `src/views/member/DepositHistory.vue`
  - [x] `normalizeRechargeHistory()` 中將 `o.paymentStatus` 改為 `o.paymentStatus ?? o.status`
  - [x] 確認篩選「已完成 / 待付款 / 失敗」可正確過濾紀錄

---

## Phase 2 — 刮刮樂格子固定位置修復

- [x] `src/components/ichiban/IchibanScratchStatusGrid.vue`
  - [x] Props 新增 `totalTickets?: number`
  - [x] 以 `gridCells` computed 取代 `normalizedCards`
    - [x] 計算 `size = totalTickets || max(ticketNumber in cards)`
    - [x] 建立 `new Array(size).fill(null)` 固定大小陣列
    - [x] 以 `ticketNumber - 1` 為索引放置票券物件
  - [x] Template `v-for` 改為 `(t, index) in gridCells`，`:key="index"`
  - [x] `null` 槽位渲染禁用的佔位 button（含 logo 圖示與號碼）
  - [x] `cellClass` / `getCellTitle` 型別更新為 `NonNullable<(typeof gridCells.value)[number]>`

- [x] `src/views/IchibanDetail.vue`
  - [x] `<IchibanScratchStatusGrid>` 新增 `:total-tickets="detail?.totalPrizes ?? 0"`

---

## 驗證項目

- [ ] **狀態篩選**：儲值紀錄頁，選「已完成」→ 只顯示 COMPLETED；選「待付款」→ 只顯示 PENDING
- [ ] **日期 / 交易號篩選**：確認現有前端過濾正常（無迴歸）
- [ ] **刮刮樂格子位置**：抽出第 N 格後重新進入頁面，第 N 格停在原位（不前移）
- [ ] **刮刮樂格子數量**：`null` 槽位顯示為禁用格，總格數 = `detail.totalPrizes`
- [ ] **無迴歸**：`Deposit.vue` 儲值流程、錢包餘額、儲值方案列表功能正常

---

## 受影響的檔案

| 檔案 | 修改內容 |
|------|---------|
| `src/views/member/DepositHistory.vue` | `normalizeRechargeHistory` 欄位映射修正 |
| `src/components/ichiban/IchibanScratchStatusGrid.vue` | 固定位置 `gridCells` 陣列、props 及 template 更新 |
| `src/views/IchibanDetail.vue` | 傳遞 `:total-tickets` prop |
