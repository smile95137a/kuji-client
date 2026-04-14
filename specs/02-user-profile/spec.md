# Spec: 02 - 個人資料

> 來源: `specs/02-user-profile.md`
> Branch: `feat/02-user-profile`
> 路徑前綴: `/user`（均需 Token）

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/user/me` | 取得個人資料 |
| PUT | `/user/me` | 更新個人資料（nickname 等） |
| POST | `/user/me/avatar` | 上傳頭像 |
| POST | `/user/me/change-password` | 修改密碼 ← **目前程式碼缺失** |
| GET | `/user/addresses` | 收件地址列表 |
| GET | `/user/addresses/default` | 預設地址 |
| GET | `/user/addresses/{id}` | 單一地址詳情 |
| POST | `/user/addresses` | 新增地址 |
| PUT | `/user/addresses/{id}` | 更新地址 |
| PUT | `/user/addresses/{id}/default` | 設為預設地址 |
| DELETE | `/user/addresses/{id}` | 刪除地址 |

---

## change-password 規格

```typescript
interface ChangePasswordReq {
  currentPassword: string
  newPassword: string         // ≥8 字元
  confirmNewPassword: string  // 需與 newPassword 一致
}
```

**業務規則**:
- 舊密碼錯誤 → `400`
- `provider=GOOGLE` 帳號無密碼，不可修改 → `400`
- 成功 → `204`（無 body）

---

## avatar 上傳規格

- Content-Type: `multipart/form-data`
- field name: `file`
- 支援格式: JPG / PNG / WebP
- 最大: 5MB
- 回傳: `{ avatarUrl: string }`

---

## 已知路徑錯誤

`userService.uploadAvatar()` 目前打 `POST /user/avatar`
spec 定義是 `POST /user/me/avatar`
需修正。

---

## UserRes 型別（GET /user/me 回傳）

```typescript
interface UserRes {
  id: string
  email: string
  nickname: string
  avatarUrl: string | null
  provider: 'EMAIL' | 'GOOGLE'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  phoneNumber: string | null
  goldCoins: number
  bonusCoins: number
  referralCode: string | null
  createdAt: string
}
```
