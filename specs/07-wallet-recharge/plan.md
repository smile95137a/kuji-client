# Plan: 07 - 錢包與儲值

> Branch: `feat/07-wallet-recharge`
> Worktree: `../kuji-client--feat-07/`
> 依賴: `fix/critical-bugs` 需先 merge（walletService basePath 已修正）

---

## 前提確認

`fix/critical-bugs` 已修正 `walletService.basePath = '/wallet'`，
本 batch 在確認修正後進行 UI 功能完善。

---

## 元件邊界

```
Deposit.vue（view）
  ├── WalletBalanceCard.vue（金幣/紅利餘額，從 memberWallet store 或直接 getMyWallet()）
  ├── RechargePlanList.vue（方案列表，選擇後觸發儲值）
  └── RechargeConfirmDialog.vue（確認 + 金額說明 + 測試模式提示）

DepositHistory.vue（view）
  └── RechargeHistoryList.vue（儲值紀錄列表）

TransactionHistory.vue（view）
  ├── TransactionFilter.vue（類型/時間範圍過濾）
  └── TransactionList.vue（交易列表）
      └── TransactionItem.vue（單筆：類型圖示 + 金額 + 說明）

Composables:
  useWallet.ts（getMyWallet + 餘額更新）
  useRechargePlans.ts（方案列表 + 選擇 + 建立儲值）
  useTransactionHistory.ts（交易記錄 + 分頁 + 過濾）
```

---

## 測試模式 UI 規格

```typescript
const recharge = await rechargeService.createRechargeRequest({ planId })
if (!recharge.paymentUrl) {
  // 測試模式：直接顯示成功
  toast.success('儲值成功（測試模式）')
  memberWallet.refresh()
} else {
  // 正式模式：跳轉支付
  window.location.href = recharge.paymentUrl
}
```

---

## memberWallet store 整合

確認以下操作後會更新 memberWallet store：
- 抽獎（`DrawNormalRes.remainingGold + remainingBonus`）
- 儲值成功
- 回收換紅利（`ReferralApplyRes.newBonusBalance`）
- 推薦碼套用（`ReferralApplyRes.newBonusBalance`）

---

## useWallet.ts 設計

```typescript
export function useWallet() {
  const wallet = ref<WalletRes | null>(null)
  const isLoading = ref(false)

  async function refresh() {
    wallet.value = await walletService.getMyWallet()
    // 同步到 memberWallet store
    memberWalletStore.setBalance(wallet.value.goldBalance, wallet.value.bonusBalance)
  }

  return { wallet, isLoading, refresh }
}
```
