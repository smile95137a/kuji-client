# Spec: 07 - 錢包與儲值

> 來源: `specs/07-wallet-recharge.md`
> Branch: `feat/07-wallet-recharge`
> 路徑前綴: `/wallet`、`/recharge`、`/recharge-plan`

---

## Endpoints

| 方法 | 路徑 | 需 Token | 說明 |
|------|------|---------|------|
| GET | `/wallet` | ✅ | 錢包餘額 |
| POST | `/wallet/transactions` | ✅ | 查詢交易記錄 |
| GET | `/recharge-plan/list` | ✅ | 儲值方案列表 |
| GET | `/recharge-plan/{id}` | ✅ | 單一方案詳情 |
| POST | `/recharge` | ✅ | 建立儲值訂單 |
| GET | `/recharge/history` | ✅ | 儲值紀錄 |
| POST | `/recharge/{id}/confirm` | ✅ | 支付成功回呼（金流用） |
| POST | `/recharge/{id}/failure` | ✅ | 支付失敗回呼（金流用） |

---

## WalletRes

```typescript
interface WalletRes {
  userId: string
  goldBalance: number        // 金幣餘額
  bonusBalance: number       // 紅利餘額
  totalRecharge: number      // 歷史累計儲值金額（台幣）
  updatedAt: string
}
```

---

## 雙幣說明

| 幣種 | 說明 | 取得方式 | 抽獎優先度 |
|------|------|---------|----------|
| Gold（金幣） | 儲值購買，主要貨幣 | 儲值 | 優先扣 |
| Bonus（紅利） | 系統贈送，補充用 | 推薦碼、回收獎品 | 不足時補差額 |

---

## WalletTransactionType

```typescript
type WalletTransactionType =
  | 'RECHARGE'         // 儲值
  | 'DRAW_GOLD'        // 抽獎扣減（金幣）
  | 'DRAW_BONUS'       // 抽獎扣減（紅利）
  | 'RECYCLE_BONUS'    // 回收獎品獲得紅利
  | 'REFERRAL_BONUS'   // 推薦獎勵
  | 'ADMIN_ADJUST'     // 管理員手動調整
  | 'EXPIRE'           // 紅利到期
```

---

## RechargePlanRes

```typescript
interface RechargePlanRes {
  id: string
  name: string              // 如「小包」「超值包」
  price: number             // 台幣金額
  goldAmount: number        // 獲得金幣
  bonusAmount: number       // 贈送紅利
  description: string | null
  isActive: boolean
  validFrom: string | null
  validUntil: string | null
}
```

---

## 儲值測試模式 ⚠️

目前 `POST /recharge` 後金幣**直接到帳**，`paymentUrl = null`，不跳轉支付頁。
UI 需：
- 顯示「測試模式」提示
- 預留 `paymentUrl` 有值時的跳轉邏輯（正式上線時會啟用）

---

## walletService basePath Bug

`basePath = '/api/wallet'` 已在 `fix/critical-bugs` 修正為 `'/wallet'`。
本 spec 確認修正後端點正常運作。
