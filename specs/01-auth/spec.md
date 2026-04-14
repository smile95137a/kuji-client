# Spec: 01 - 認證流程

> 來源: `specs/01-auth.md`
> Branch: `feat/01-auth`
> 所有路徑前綴: `/auth`（公開，不需 Token）

---

## AuthRes 回應型別

```typescript
interface AuthRes {
  accessToken: string
  refreshToken: string
  expiresIn: number           // accessToken 有效秒數（~1800）
  tokenType: 'Bearer'
  user: {
    id: string
    email: string
    nickname: string
    avatarUrl: string | null
    provider: 'EMAIL' | 'GOOGLE'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    goldCoins: number
    bonusCoins: number
    referralCode: string | null  // 自己的推薦碼（已產生時有值）
    createdAt: string
  }
}
```

---

## Endpoints

### POST /auth/register

```typescript
interface AuthRegisterReq {
  email: string            // 必填，格式驗證
  password: string         // 必填，≥8 字元
  confirmPassword: string  // 必填，需與 password 一致
  nickname?: string
  referralCode?: string    // 可選；填後後端自動套用，雙方獲得紅利
}
```

**業務規則**:
- Email 已存在 → `409`
- `password !== confirmPassword` → `400`
- 成功直接回傳 `AuthRes`（不需再次登入）
- 有 `referralCode` → 後端自動套用（等同於 POST /referral/apply）

### POST /auth/login

```typescript
interface AuthLoginReq { email: string; password: string }
```

- 帳號不存在/密碼錯 → `401`
- `INACTIVE` / `SUSPENDED` → `403`
- `provider=GOOGLE` 帳號不可用此端點 → `400`

### POST /auth/google

```typescript
interface GoogleLoginReq { idToken: string }
```

- 傳入前端從 Google SDK 取得的 ID Token
- 首次登入自動建立帳號
- 無密碼，`provider=GOOGLE`

### POST /auth/refresh

```typescript
interface RefreshReq { refreshToken: string }
```

- refreshToken 過期/無效 → `401`
- 成功回傳新 `AuthRes`（refreshToken **一次性**，舊的立即失效）

### POST /auth/forgot-password

```typescript
interface ForgotPasswordReq { email: string }
```

- 無論 email 是否存在都回 `200`（防止枚舉攻擊）

### POST /auth/reset-password

```typescript
interface ResetPasswordReq {
  token: string           // 信件中的 token
  newPassword: string
  confirmPassword: string
}
```
