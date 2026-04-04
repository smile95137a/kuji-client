# Tasks: 006 — 付款與點數系統

**Feature**: Payment & Points | **Branch**: `cli/006-payment-points` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/wallet.ts`，定義 `RechargePlan`（id, goldAmount, bonusAmount, price, isActive, description）、`Transaction`（id, type, goldChange, bonusChange, reason, relatedOrderNo, createdAt, balanceAfterGold, balanceAfterBonus）、`Consumption`（id, type, goldSpent, bonusSpent, relatedId, relatedTitle, createdAt）interface
- [ ] T002 建立 `src/services/wallet.ts`，實作：`getWallet()` → `GET /api/wallet`；`getTransactions()` → `GET /api/wallet/transactions`
- [ ] T003 [P] 建立 `src/services/recharge.ts`，實作：`getPlans()` → `GET /api/recharge/plans`；`createRecharge(planId, paymentMethod)` → `POST /api/recharge`，回傳 `{ transactionId, paymentUrl }`
- [ ] T004 [P] 建立 `src/services/consumption.ts`，實作 `getConsumptions()` → `GET /api/consumption`
- [ ] T005 建立 `src/stores/wallet.ts`，定義全域 Pinia store：goldCoins / bonusCoins / totalRecharged / selectedPlanId / isPaymentProcessing / transactionFilter / transactions / consumptions；expose `refreshBalance()` action（呼叫 GET /api/user/me 並更新 goldCoins/bonusCoins）

---

## Phase 2: Foundational

- [ ] T006 [P] 建立 `src/components/wallet/BalanceCard.vue`，顯示金幣/獎勵幣餘額（千分位格式 FR-SC-006）；金幣餘額=0 時「立即儲值」按鈕強調色突顯（US1 AC-3）
- [ ] T007 [P] 建立 `src/components/wallet/RechargePlanCard.vue`，方案卡片（price/goldAmount/bonusAmount/description）；選中高亮；isActive=false 不顯示（FR-UI-003）；手機單列 / 桌機 3 列（FR-UI-004）；推薦方案顯示「推薦」Badge（FR-UI-002）
- [ ] T008 [P] 建立 `src/components/wallet/TransactionItem.vue`，交易記錄項目：類型圖示（RECHARGE=💰 / DRAW=🎯 / RECYCLE=♻️ / ADJUST=⚙️ / SHIPPING=📦 FR-UI-009）；goldChange 正數綠色+/負數紅色-（FR-UI-008）；balanceAfterGold 顯示「交易後餘額」（FR-UI-010）；relatedOrderNo 有值時顯示「查看訂單」連結

---

## Phase 3: [US1] 查看錢包餘額

- [ ] T009 [US1] 建立 `src/views/Wallet.vue`（`/wallet`）：onMounted 呼叫 `wallet.refreshBalance()`（統一使用 GET /api/user/me，AV-001）；整合 BalanceCard（金幣/獎勵幣）；顯示 totalRecharged；「立即儲值」CTA 導向 `/wallet/topup`；下方快捷列 Tab（交易記錄/消費記錄）（US1 AC-1~4）
- [ ] T010 [US1] 確認全域 Header/Navbar 顯示金幣餘額：登入後可見，未登入隱藏（FR-UI-005）；金幣餘額由 wallet store 的 goldCoins 取得（FR-UI-006）；點擊導向 `/wallet`（US1 AC-4）

---

## Phase 4: [US2] 選擇儲值方案並付款

- [ ] T011 [US2] 建立 `src/views/WalletTopup.vue`（`/wallet/topup`）：onMounted 呼叫 `recharge.getPlans()`，依 price 升序排列（AV-009 workaround）；過濾 isActive=false；整合 RechargePlanCard 格子（US2 AC-1）；點擊卡片更新 selectedPlanId + 顯示明細（US2 AC-2）
- [ ] T012 [US2] 在 `WalletTopup.vue` 實作付款流程：「確認付款」按鈕（未選方案時禁用，US2 AC-6）→ 呼叫 `recharge.createRecharge(selectedPlanId, 'CREDIT_CARD')`，isPaymentProcessing=true 防重複（FR-UI-013）→ 收到 `{ paymentUrl, transactionId }` → `sessionStorage.setItem('pendingTransactionId', transactionId)` → `window.location.href = paymentUrl`（FR-UI-013/014，US2 AC-3）

---

## Phase 5: 付款回傳頁

- [ ] T013 建立 `src/views/WalletTopupReturn.vue`（`/wallet/topup/return`）：onMounted 取出並清除 `sessionStorage.pendingTransactionId`；呼叫 `wallet.refreshBalance()` 取得新餘額（FR-UI-015）；顯示「儲值成功！」或「付款失敗」Modal（依 URL query `?status=success|fail`）；Header 餘額立即更新（SC-002）

---

## Phase 6: [US3] 查看交易記錄

- [ ] T014 [P] [US3] 建立 `src/views/Transaction.vue`（已存在，完善）：onMounted 呼叫 `wallet.getTransactions()`；整合 TransactionItem 列表（依 createdAt 降序）；類型篩選器 Tab（全部/儲值/抽獎/回收/調整/出貨，客戶端 computed 過濾，響應 ≤50ms SC-004）（US3 AC-1~4）

---

## Phase 7: [US4] 查看消費記錄

- [ ] T015 [P] [US4] 建立 `src/components/wallet/ConsumptionItem.vue`，消費記錄項目（type/goldSpent/bonusSpent/relatedTitle/createdAt/relatedId 連結）
- [ ] T016 [P] [US4] 建立 `src/views/Consumption.vue`（`/wallet/consumption`）：onMounted 呼叫 `consumption.getConsumptions()`；整合 ConsumptionItem 列表；DRAW/SHIPPING 類型篩選（US4 AC-1~3）

---

## Final Phase: Polish

- [ ] T017 [P] 在 `WalletTopup.vue` 添加 FR-UI-011/012（點數使用優先說明 / 金幣 vs 獎勵幣差異說明）
- [ ] T018 [P] 確認付款按鈕在 API 回應前持續禁用（SC-005）；確認 Wallet 頁面載入 ≤ 1.5s（SC-001）；確認金幣以千分位逗號格式顯示（SC-006）

---

## Dependencies

```
T001 → T002, T003, T004
T002, T003, T004 → T005
T005 → T009, T010, T011, T014, T016
T006 → T009
T007 → T011
T008 → T014
T011 → T012 → T013
T015 → T016
```

## Parallel Opportunities

- T002, T003, T004 可同時建立
- T006, T007, T008 可同時開發
- T014, T015, T016 可同時開發

## Implementation Strategy

MVP = Phase 3+4+5（T009–T013）完成錢包餘額顯示 + 儲值付款流程；交易/消費記錄（Phase 6/7）為增強項。
