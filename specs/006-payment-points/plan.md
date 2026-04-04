# Implementation Plan: 006 — 付款與點數系統

**Branch**: `cli/006-payment-points` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-payment-points/spec.md`

---

## Summary

實作錢包頁、儲值頁、交易/消費記錄頁。關鍵架構決策（Q5 已澄清）：**`POST /api/recharge` 的 `paymentUrl` 一律存在**，前端永遠以 `window.location.href = paymentUrl` 導向第三方付款頁，付款後後端 callback 更新餘額，前端在回傳頁 `/wallet/topup/return` 重呼叫 `GET /api/user/me` 取得新餘額。全域 `goldCoins/bonusCoins` 統一由 `GET /api/user/me` 取得（AV-001 建議）。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, Sass |
| **Storage** | Pinia (pinia-plugin-persistedstate) + sessionStorage（transactionId 保留） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 錢包頁載入 ≤ 1.5s (P90)；Header 餘額更新 ≤ 200ms |
| **Constraints** | 需登入（JWT）；`paymentUrl` 一律存在（Q5 澄清）；密碼類資訊不出現在 URL/storage |
| **Scale/Scope** | 5 頁面（錢包、儲值、回傳、交易記錄、消費記錄），6 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/006-payment-points/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成（Q5 paymentUrl 流程已澄清）
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── Wallet.vue                   # 錢包總覽頁（/wallet）
│   ├── WalletTopup.vue              # 儲值頁（/wallet/topup）
│   ├── WalletTopupReturn.vue        # 付款回傳頁（/wallet/topup/return）
│   ├── Transaction.vue              # 交易記錄頁（/wallet/transactions）已存在
│   └── Consumption.vue             # 消費記錄頁（/wallet/consumption）
├── components/
│   └── wallet/
│       ├── BalanceCard.vue          # 金幣/獎勵幣餘額卡片
│       ├── RechargePlanCard.vue     # 儲值方案卡片（推薦 Badge）
│       ├── TransactionItem.vue      # 交易記錄項目（正/負顏色）
│       ├── ConsumptionItem.vue      # 消費記錄項目
│       └── PaymentReturnHandler.vue # 回傳頁處理（transactionId 核對 + 重取餘額）
├── stores/
│   └── wallet.ts                   # goldCoins / bonusCoins / totalRecharged（全域共享）
├── services/
│   ├── wallet.ts                   # GET /api/wallet / GET /api/wallet/transactions
│   ├── recharge.ts                 # GET /api/recharge/plans / POST /api/recharge
│   └── consumption.ts              # GET /api/consumption
└── types/
    └── wallet.ts                   # Rechargeplan / Transaction / Consumption
```

---

## 主要開發項目

### 1. 全域餘額狀態（統一來源）
```typescript
// stores/auth.ts（已有）或 stores/wallet.ts
// 統一用 GET /api/user/me 取得 goldCoins / bonusCoins
// 每次抽獎後：goldCoins = remainingGold；bonusCoins = remainingBonus
// 每次儲值返回後：重呼叫 GET /api/user/me
```

### 2. 儲值付款流程（一律重新導向）
```
用戶選擇方案 → 點擊「確認付款」
→ POST /api/recharge { planId, paymentMethod: "CREDIT_CARD" }
→ 收到 { transactionId, paymentUrl }
→ sessionStorage.setItem('pendingTransactionId', transactionId)
→ window.location.href = paymentUrl
→ [第三方付款頁]
→ 付款完成後後端 callback 更新餘額
→ 前端被導回 /wallet/topup/return
```

### 3. 付款回傳頁（WalletTopupReturn.vue）
```typescript
// onMounted
const txId = sessionStorage.getItem('pendingTransactionId')
sessionStorage.removeItem('pendingTransactionId')
// 重新呼叫 GET /api/user/me 更新全域餘額
await authStore.refreshUser()
// 顯示「儲值成功！」Modal 或根據 URL query 判斷成功/失敗
```

### 4. 交易記錄展示
- 正數金幣變化：綠色 `+XXX`；負數：紅色 `-XXX`
- 類型圖示：RECHARGE=💰 / DRAW=🎯 / RECYCLE=♻️ / ADJUST=⚙️ / SHIPPING=📦
- `balanceAfterGold` 顯示為「交易後餘額」

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| `GET /api/wallet` 與 `GET /api/user/me` 重複 | 前端統一用 `/api/user/me`，`/api/wallet` 作為備用 |
| 交易記錄分頁 | AV-004：需確認後端是否支援 page/size 參數 |
| `paymentMethod` 多選項 | AV-006：目前只有 CREDIT_CARD，UI 保留擴充空間 |
| 限時方案倒數 | AV-008：目前 Response 無 `endTime` 欄位，跳過 |
| 方案排序 | AV-009：前端依 `price` 升序顯示（後端若補 `sortOrder` 欄位則改用） |
