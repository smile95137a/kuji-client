# Spec: Critical Bug Fixes

> Branch: `fix/critical-bugs`
> Priority: **BLOCKING** — 所有其他 feature branch 必須在本 branch merge 後的 main 上建立

---

## Bug #1 — Refresh Token 打到錯誤端點

**位置**: `src/services/FrontAPI.ts`
**現況**: `POST ${VITE_BASE_API_URL}/api/admin/auth/refresh-token`
**正確**: `POST ${VITE_BASE_API_URL}/api/auth/refresh`
**影響**: 每次 accessToken 過期（401）時，refresh 請求打到後台管理員端點，必定失敗，導致所有前台用戶被強制登出

---

## Bug #2 — Token localStorage key 不一致 + accessToken 安全性問題

**位置**: `src/services/FrontAPI.ts` + `src/stores/useAuthStore.ts` + `src/services/AuthService.ts`

### key 不一致詳細

FrontAPI.ts refresh 成功後儲存：
```
saveState('token', newAccessToken)       ← key: 'token'
saveState('refreshToken', newRefreshToken)
saveState('tokenType', newTokenType)
```

AuthService.ts 讀取時使用：
```
loadState('kujiToken')       ← key: 'kujiToken'  ⚠️ 不同！
loadState('refreshKujiToken')
loadState('kujiTokenType')
```

**結果**: refresh 成功，但下一個 API 請求讀到的 token 仍是舊的（或空的），再次 401，形成無限循環最終登出。

### 安全性升級需求

accessToken 存在 localStorage 有 XSS 風險（任意 JS 可讀取）。
升級方向：
- `accessToken` 改存 **Pinia memory**（`ref<string>`，不寫 localStorage）
- `refreshToken` 繼續存 localStorage，key 統一為 `refreshKujiToken`
- 頁面重整（F5）後執行 **silent refresh**：用 `refreshKujiToken` 打 `POST /auth/refresh` 取新 accessToken

---

## Bug #3 — walletService basePath 重複 `/api`

**位置**: `src/services/walletService.ts` line 4
**現況**: `const basePath = '/api/wallet'`
**正確**: `const basePath = '/wallet'`
**影響**: FrontAPI baseURL 已含 `/api`，實際請求路徑為 `/api/api/wallet` → 404，錢包頁面完全無法使用

---

## Bug #4 — Router Guard 缺失（requiresAuth 完全無效）

**位置**: `src/router/index.ts`
**現況**: 所有受保護路由都有 `meta: { requiresAuth: true }` 設定，但 `router.beforeEach` **完全不存在**
**影響**: 未登入用戶可直接訪問 `/member-center/prize-box`、`/member-center/deposit` 等所有受保護頁面

**期望行為**:
- 未登入訪問 `requiresAuth` 頁面 → 導向 `/login?redirect=原路徑`
- 登入成功後自動跳回 `redirect` 參數的頁面
