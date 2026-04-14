# Spec: 08 - 推薦碼系統

> 來源: `specs/08-referral-code.md`
> Branch: `feat/08-referral-code`
> 路徑前綴: `/referral`（均需 Token）

---

## 核心業務規則

- 每位玩家**終生只能套用一次**推薦碼，無法撤銷
- 套用後：被推薦人 + 推薦人雙方各得紅利
- 不能套用自己的推薦碼（`SELF_REFERRAL`）

## 推薦碼入口規則

| 用戶類型 | 輸入推薦碼的時機 |
|---------|--------------|
| Email 註冊 | 只在**註冊表單**期間輸入（`AuthRegisterReq.referralCode`） |
| Google 登入 | 可在**會員中心**補綁（前提：尚未套用過，`user.referralCode === null`） |

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/referral/generate` | 產生自己的推薦碼（已有則回傳現有） |
| GET | `/referral/validate?code=XXX` | 驗證推薦碼是否有效 |
| POST | `/referral/apply` | 套用推薦碼（終生一次） |
| GET | `/referral/stats` | 取得推薦統計 |
| POST | `/referral/{id}/disable` | 停用自己的推薦碼 |

---

## ReferralCodeRes

```typescript
interface ReferralCodeRes {
  id: string
  code: string           // 格式如 "KUJI-XXXX"
  userId: string
  usedCount: number
  maxUsage: number | null  // null = 無上限
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}
```

---

## ReferralValidateRes

```typescript
interface ReferralValidateRes {
  valid: boolean
  code: string
  reason: 'CODE_NOT_FOUND' | 'CODE_DISABLED' | 'SELF_REFERRAL' | 'ALREADY_USED' | 'CODE_EXPIRED' | null
  referrerNickname?: string    // valid=true 時附帶
  bonusForReferrer?: number
  bonusForNew?: number
}
```

---

## ReferralApplyRes

```typescript
interface ReferralApplyRes {
  success: boolean
  bonusEarned: number           // 被推薦人獲得
  referrerBonusEarned: number   // 推薦人獲得
  newBonusBalance: number       // 套用後被推薦人的紅利餘額
}
```

---

## 現況缺口（程式碼尚不存在）

- `referralService.ts` 尚未建立
- `AuthService.validateReferralCode()` 路徑錯（打 `/auth/referral/validate`，應改到 `/referral/validate`）
- `useReferralCodeValidator.ts` 需改呼叫新 service
- `Register.vue` 缺少推薦碼欄位
- `views/member/ReferralCode.vue` 頁面不存在
- `/member-center/referral` 路由不存在
