# Plan: 02 - 個人資料

> Branch: `feat/02-user-profile`
> Worktree: `../kuji-client--feat-02/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## 補齊項目

### 1. userService.ts 路徑修正

`uploadAvatar()` 改為 `POST /user/me/avatar`（移除多餘的路徑段）

### 2. 新增 changePassword()

```typescript
// userService.ts
export async function changePassword(req: ChangePasswordReq): Promise<void> {
  await api.post(`${basePath}/me/change-password`, req)
  // 204 無 body
}
```

---

## 元件邊界

```
MemberProfile.vue（view）
  └── ProfileInfoCard.vue（顯示頭像/暱稱/Email）

ProfileEdit.vue（view）
  ├── ProfileEditForm.vue（暱稱/電話等基本資料）
  ├── AvatarUpload.vue（頭像上傳，multipart/form-data）
  └── ChangePasswordSection.vue（只有 EMAIL provider 才顯示，GOOGLE 隱藏）

AddressBook.vue（view）
  ├── AddressCard.vue（單一地址 + 編輯/刪除/設預設）
  └── AddressForm.vue（新增/編輯地址 dialog）
```

---

## Composables

### useUserProfile.ts

```typescript
// 職責: 個人資料 CRUD + 頭像上傳
const { user, isLoading, fetchMe, updateMe, uploadAvatar } = useUserProfile()
```

### useChangePassword.ts

```typescript
// 職責: 密碼修改 form state + validation + submit
const { form, isLoading, error, submit } = useChangePassword()
```

### useAddressBook.ts

```typescript
// 職責: 地址 CRUD + 切換預設
const { addresses, defaultAddress, fetchAll, create, update, remove, setDefault } = useAddressBook()
```

---

## AvatarUpload.vue 規格

- input type="file" accept="image/jpeg,image/png,image/webp"
- client-side 大小限制 5MB（超過直接 toast 提示）
- 上傳中顯示進度或 loading overlay
- 上傳成功後更新 `authStore.user.avatarUrl`

---

## ChangePasswordSection.vue 規格

- `v-if="authStore.user?.provider === 'EMAIL'"` 才顯示
- form fields: currentPassword, newPassword, confirmNewPassword
- 送出前 `newPassword !== confirmNewPassword` → 顯示錯誤
- 成功後 toast「密碼修改成功」，清空表單
