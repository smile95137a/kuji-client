# Task Checklist: 02 - 個人資料

> Branch: `feat/02-user-profile`
> Worktree: `../kuji-client--feat-02/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## Phase 1 — Service 修正

- [ ] `userService.ts`: uploadAvatar() 路徑改 `POST /user/me/avatar`（原 `/user/avatar`）
- [ ] `userService.ts`: 新增 `changePassword(req: ChangePasswordReq)` → `POST /user/me/change-password`
- [ ] 新建 `ChangePasswordReq` interface（或從 `@/types/` import）

## Phase 2 — useUserProfile.ts

- [ ] 新建 `src/composables/useUserProfile.ts`
- [ ] 方法: fetchMe() / updateMe() / uploadAvatar()
- [ ] 上傳成功後同步 `authStore.user.avatarUrl`

## Phase 3 — useChangePassword.ts

- [ ] 新建 `src/composables/useChangePassword.ts`
- [ ] form: currentPassword, newPassword, confirmNewPassword
- [ ] client-side: newPassword !== confirmNewPassword → 阻止 submit
- [ ] submit → userService.changePassword() → toast 成功 → 清空表單
- [ ] 錯誤: 400（舊密碼錯）→ 顯示明確提示

## Phase 4 — useAddressBook.ts

- [ ] 新建 `src/composables/useAddressBook.ts`
- [ ] fetchAll / create / update / remove / setDefault
- [ ] 刪除前確認 Dialog

## Phase 5 — AvatarUpload.vue

- [ ] 新建 `src/components/member/AvatarUpload.vue`
- [ ] input accept="image/jpeg,image/png,image/webp" + size 限制 5MB
- [ ] 上傳中顯示 loading spinner
- [ ] 成功後顯示新頭像

## Phase 6 — ChangePasswordSection.vue

- [ ] 新建 `src/components/member/ChangePasswordSection.vue`
- [ ] `v-if="authStore.user?.provider === 'EMAIL'"` 條件顯示
- [ ] 引入 useChangePassword composable

## Phase 7 — ProfileEdit.vue 整合

- [ ] 引入 AvatarUpload.vue
- [ ] 引入 ChangePasswordSection.vue
- [ ] 引入 useUserProfile composable

## Phase 8 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] EMAIL 用戶可見並使用修改密碼區塊
- [ ] GOOGLE 用戶不可見修改密碼區塊
- [ ] 頭像上傳成功後即時更新顯示
- [ ] 地址 CRUD 全部操作正常
