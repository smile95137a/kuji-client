# Task Checklist: 07 - 錢包與儲值

> Branch: `feat/07-wallet-recharge`
> Worktree: `../kuji-client--feat-07/`
> 依賴: `fix/critical-bugs` 需先 merge（walletService basePath 修正）

---

## Phase 1 — 確認 Bug 修正

- [ ] 確認 `walletService.basePath === '/wallet'`（fix/critical-bugs 已修）
- [ ] `GET /wallet` 回應 200（非 404）

## Phase 2 — useWallet.ts

- [ ] 新建 `src/composables/useWallet.ts`
- [ ] refresh() → getMyWallet() → 同步 memberWallet store

## Phase 3 — useRechargePlans.ts

- [ ] 新建 `src/composables/useRechargePlans.ts`
- [ ] 方案列表 fetch（rechargePlanService）
- [ ] createRecharge(planId): 建立儲值 → 判斷 paymentUrl

## Phase 4 — useTransactionHistory.ts

- [ ] 新建 `src/composables/useTransactionHistory.ts`
- [ ] POST /wallet/transactions + 類型過濾 + 分頁

## Phase 5 — 新元件

- [ ] 新建 `src/components/wallet/WalletBalanceCard.vue`（金幣/紅利餘額顯示）
- [ ] 新建 `src/components/wallet/RechargePlanList.vue`（方案選擇）
- [ ] 新建 `src/components/wallet/RechargeConfirmDialog.vue`（確認 + 測試模式提示）
- [ ] 新建 `src/components/wallet/TransactionItem.vue`（單筆交易）

## Phase 6 — Deposit.vue 整合

- [ ] 引入 WalletBalanceCard
- [ ] 引入 RechargePlanList（選擇方案觸發 RechargeConfirmDialog）
- [ ] paymentUrl = null → toast 測試模式直接成功 + refresh wallet
- [ ] paymentUrl 有值 → `window.location.href = paymentUrl`（預留）

## Phase 7 — TransactionHistory.vue 整合

- [ ] 整合 useTransactionHistory（類型過濾 + 分頁）
- [ ] 各交易類型顯示對應圖示/顏色（收入綠/支出紅）

## Phase 8 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] 錢包餘額正確顯示
- [ ] 測試模式儲值成功後餘額更新
- [ ] 交易記錄分頁與類型過濾正確
