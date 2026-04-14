# Task Checklist: Critical Bug Fixes

> Branch: `fix/critical-bugs`
> Worktree: `../kuji-client--fix-critical-bugs/`
> ⚠️ 所有其他 feature branch 等本 branch merge 後才能開始

---

## Phase 1 — useAuthStore 重構（其他都依賴這個）

- [ ] 移除 `token` 從 localStorage 讀取，改為純 `ref<string>('')`
- [ ] 移除 `LS_TOKEN = 'kujiToken'` 常數（不再存 accessToken 到 localStorage）
- [ ] 新增 `setAuth(res: AuthRes)` action（token.value + saveState refreshKujiToken/kujiUser）
- [ ] 新增 `silentRefresh(): Promise<boolean>` action（用裸 axios，非 api instance）
- [ ] `initAuth()` 改為：還原 user from localStorage + await silentRefresh()
- [ ] `logout()` 確認清除 token.value + removeAllState() + user.value = null
- [ ] 新增 `isInitializing` ref（App.vue 用於顯示 loading）
- [ ] 確認 `isLogin` computed 讀 `!!token.value`

## Phase 2 — AuthService.ts 修正

- [ ] `getAuthToken()` 改為 `() => useAuthStore().token`（不從 localStorage 讀）
- [ ] `getRefreshToken()` 確認讀 `loadState('refreshKujiToken')`
- [ ] 確認 `login()` 成功後呼叫 `authStore.setAuth(res.data)` 而非手動 saveState
- [ ] 確認 `loginWithGoogle()` 成功後同上

## Phase 3 — FrontAPI.ts 修正

- [ ] Bug #1: refresh URL 改為 `${VITE_BASE_API_URL}/api/auth/refresh`（移除 /admin）
- [ ] Bug #2: refresh 成功後改呼叫 `authStore.setAuth(payload.data)`
- [ ] Bug #2: 移除手動 `saveState('token', ...)` / `saveState('refreshToken', ...)` / `saveState('tokenType', ...)` / `saveState('expiresIn', ...)`
- [ ] request interceptor: 讀 token 確認是讀 `useAuthStore().token`（透過 getAuthToken()）
- [ ] 確認 resolveQueue(newAccessToken) 時機正確（在 setAuth 之後）
- [ ] refresh 失敗路徑確認呼叫 `authStore.logout()`

## Phase 4 — App.vue

- [ ] `onMounted` 改為 `await authStore.initAuth()`
- [ ] 加入 `isInitializing` 判斷，載入完成前顯示 loading overlay

## Phase 5 — walletService.ts

- [ ] `basePath = '/api/wallet'` → `'/wallet'`

## Phase 6 — router/index.ts

- [ ] 新增 `router.beforeEach` guard（requiresAuth + isLogin 判斷）
- [ ] 未登入導向 `{ name: 'Login', query: { redirect: to.fullPath } }`
- [ ] 確認 meta typing（`RouteMeta` 需包含 `requiresAuth?: boolean`）

## Phase 7 — Login.vue

- [ ] 登入成功後讀 `route.query.redirect as string`
- [ ] 有 redirect → `router.push(redirect)`，否則 → `/member-center/profile`

## Phase 8 — 測試驗收

- [ ] `npm run build` 無 TypeScript 錯誤
- [ ] 登入 → F5 重整 → 確認仍是登入狀態（silentRefresh 成功）
- [ ] 未登入訪問 `/member-center/prize-box` → 跳轉 `/login?redirect=...`
- [ ] 登入後自動跳回 redirect 路徑
- [ ] accessToken 過期期間發 API → 自動 refresh + 請求重送，不登出
- [ ] refreshToken 也過期 → 清除狀態，導向 /login
- [ ] 錢包頁 `GET /wallet` → 200 回應（basePath 修正後）
- [ ] 多個同時 401 → 只發一次 refresh（pending queue 正確運作）
