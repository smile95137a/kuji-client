# Plan: 028 - 前台儲值 / 刮刮樂格子修復

> 本次實作範圍根據 spec 028 討論結果確定，僅修復兩個 bug。
> Spec 中 Section 2/3（儲值方案、儲值流程）、Section 5（出貨訂單）已在前次 session 正確實作，本次不動。

---

## 現況評估

### 已正確實作（不需變動）

| 功能 | 檔案 | 狀態 |
|------|------|------|
| 儲值方案列表 | `rechargePlanService.ts`、`RechargePlanList.vue` | ✅ 欄位正確（`price/isHot/sortOrder`）|
| 儲值建立流程 | `Deposit.vue`、`useRechargePlans.ts` | ✅ 測試模式/正式模式均正確 |
| 錢包餘額顯示 | `WalletBalanceCard.vue`、`memberWallet.ts` | ✅ |
| 出貨訂單 | `prizeBoxService.ts`、`PrizeBoxShipDialog.vue` | ✅ 上一 session 完成 |

### 需修復的 Bug

#### Bug 1 — DepositHistory 狀態篩選無效

**根本原因**: `normalizeRechargeHistory` 寫死讀取 `o.paymentStatus`，
但後端 `RechargeRes` 介面的欄位是 `status`。
導致所有紀錄的 `paymentStatus` 永遠是預設值 `'PENDING'`，
狀態篩選（「已完成/待付款/失敗」）完全失效。

**修復方案**: 改為 `o.paymentStatus ?? o.status`，同時相容兩種欄位名稱。

**注意**: 現有篩選 UI（日期範圍、狀態、交易號）已是純前端過濾設計，
`loadHistory` 一次載入 `size: 1000` 全量資料，不需改動 UI 或 API 呼叫。

#### Bug 2 — 刮刮樂格子位置位移

**根本原因**: `IchibanScratchStatusGrid.vue` 使用排序陣列搭配 CSS grid 自動排版。
當後端重新載入後只回傳 AVAILABLE 票券（已刮的格子不在陣列中），
剩餘格子的 DOM 位置前移，造成號碼錯位（例如票 6 顯示在票 5 的格子位置）。

**修復方案**: 改用固定大小陣列（`new Array(totalTickets).fill(null)`），
以 `ticketNumber - 1` 作為索引，確保每張票永遠佔據同一個 DOM 槽位。
`null` 槽位渲染為禁用的佔位 button（視覺上等同已刮格子）。

---

## 修改内容

### 修改 1：`src/views/member/DepositHistory.vue`

```
normalizeRechargeHistory() 函數，約第 285 行：

Before:
  paymentStatus: (o.paymentStatus ?? 'PENDING') as PaymentStatus,

After:
  paymentStatus: ((o.paymentStatus ?? o.status) ?? 'PENDING') as PaymentStatus,
```

### 修改 2：`src/components/ichiban/IchibanScratchStatusGrid.vue`

1. Props 新增 `totalTickets?: number`
2. 以 `gridCells` computed 取代 `normalizedCards`：
   - `size = totalTickets (若 > 0) || max(ticketNumber in data)`
   - `grid = new Array(size).fill(null)`
   - 每張票放入 `grid[ticketNumber - 1]`
   - 回傳含 `null` 槽位的陣列
3. Template 改為 `v-for="(t, index) in gridCells" :key="index"`
   - `t !== null` → 正常渲染（available/scratched 邏輯不變）
   - `t === null` → disabled 佔位 button

### 修改 3：`src/views/IchibanDetail.vue`

`<IchibanScratchStatusGrid>` 新增 prop：

```
:total-tickets="detail?.totalPrizes ?? 0"
```

---

## Spec 欄位對照說明（User 確認結論）

| Spec 記載 | 實際程式碼 | 結論 |
|-----------|-----------|------|
| `GET /api/recharge-plans` | `GET /api/recharge-plan/list` | 以程式碼為準 |
| `amount, isPromotional, displayOrder` | `price, isHot, sortOrder` | 以程式碼為準 |
| Section 5: `POST /api/order` + GoMyPay | `POST /api/prize-box/ship`（上一 session） | Spec 舊版，跳過 |
| DepositHistory filters | 純前端過濾 | 不需打後端 filter API |
| Scratch grid bug | `ticketNumber - 1` 固定索引 | 本次修復 |
