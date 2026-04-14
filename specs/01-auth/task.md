# Task Checklist: 01 - 認證流程

> Branch: `feat/01-auth`
> Worktree: `../kuji-client--feat-01/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## Phase 1 — useLogin.ts

- [ ] 新建 `src/composables/useLogin.ts`
- [ ] form state: email, password, isLoading, errorMessage
- [ ] submitLogin(): 呼叫 AuthService.login() → authStore.setAuth() → redirect
- [ ] 錯誤處理: 401 / 403 / 400 各自對應中文提示

## Phase 2 — Login.vue 更新

- [ ] 引入 useLogin.ts，移除 view 內的業務邏輯
- [ ] 登入成功後讀 `route.query.redirect` 跳轉
- [ ] 無 redirect 時跳 `/member-center/profile`
- [ ] SUSPENDED/INACTIVE 帳號顯示明確錯誤訊息
- [ ] Google OAuth 帳號以 Email 登入 → 顯示提示「請使用 Google 登入」

## Phase 3 — useRegister.ts

- [ ] 新建 `src/composables/useRegister.ts`
- [ ] form state: email, password, confirmPassword, nickname, referralCode
- [ ] 即時驗證: password !== confirmPassword → `isPasswordMismatch` computed
- [ ] referralCode debounce 500ms → referralService.validateCode()（feat/08 建立後再勾）
- [ ] submitRegister(): AuthService.register() → authStore.setAuth() → push profile

## Phase 4 — Register.vue 更新

- [ ] 引入 useRegister.ts，移除 view 內業務邏輯
- [ ] 新增推薦碼輸入欄位（可選）+ 驗證提示
- [ ] password mismatch 即時顯示紅字提示
- [ ] 送出時若 referralCode 無效 → 阻止送出並提示

## Phase 5 — Google OAuth

- [ ] 確認 POST /auth/google 成功後呼叫 authStore.setAuth()
- [ ] 首次登入（user.referralCode === null）→ 導向 /member-center/referral?firstLogin=true

## Phase 6 — 忘記/重設密碼

- [ ] 確認 ForgotPassword 頁面發送 POST /auth/forgot-password
- [ ] 確認 ResetPassword 頁面從 URL query 讀取 token 並送 POST /auth/reset-password
- [ ] 成功後導向 /login

## Phase 7 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] Email 登入成功 → 跳轉 redirect 或 profile
- [ ] 錯誤訊息對應正確（401/403/400）
- [ ] 註冊成功 → 自動登入狀態
