# Plan: Critical Bug Fixes

> Branch: `fix/critical-bugs`
> Worktree: `../kuji-client--fix-critical-bugs/`

---

## 影響範圍

| 檔案 | 修改內容 |
|------|---------|
| `src/stores/useAuthStore.ts` | token 改 memory ref、新增 silentRefresh/setAuth |
| `src/services/FrontAPI.ts` | refresh URL 修正、改呼叫 authStore.setAuth() |
| `src/services/AuthService.ts` | getAuthToken() 改讀 Pinia store |
| `src/services/walletService.ts` | basePath 修正 |
| `src/router/index.ts` | 新增 beforeEach guard |
| `src/App.vue` | initAuth 改為 silentRefresh |

---

## Bug #1 + #3 修法（簡單）

**FrontAPI.ts** refresh URL 改為：
```typescript
`${import.meta.env.VITE_BASE_API_URL}/api/auth/refresh`
```

**walletService.ts**:
```typescript
const basePath = '/wallet'   // 移除多餘的 /api
```

---

## Bug #2 修法 — Pinia Memory Token 架構

### useAuthStore 新架構

```typescript
// state
const token = ref<string>('')              // ← memory only，不存 localStorage
const user = ref<AuthUser | null>(loadState(LS_USER) || null)

// LocalStorage keys
const LS_REFRESH = 'refreshKujiToken'
const LS_USER = 'kujiUser'

// actions
function setAuth(res: AuthRes) {
  token.value = res.accessToken
  saveState(LS_REFRESH, res.refreshToken)
  saveState(LS_USER, res.user)
  user.value = res.user
}

async function silentRefresh(): Promise<boolean> {
  const rt = loadState<string>(LS_REFRESH)
  if (!rt) return false
  try {
    // 直接用 axios（不走 api 實例，避免攔截器循環）
    const res = await axios.post(`${VITE_BASE_API_URL}/api/auth/refresh`, { refreshToken: rt })
    if (res.data?.success) {
      setAuth(res.data.data)
      return true
    }
    return false
  } catch {
    logout()
    return false
  }
}

async function initAuth() {
  user.value = loadState(LS_USER)     // 先還原 user（畫面不閃）
  await silentRefresh()               // 取新 accessToken
}

function logout() {
  token.value = ''
  user.value = null
  removeAllState()
}
```

### AuthService.ts 變更

```typescript
// 改從 Pinia store 讀，而非 localStorage
import { useAuthStore } from '@/stores/useAuthStore'
export const getAuthToken = () => useAuthStore().token
export const getRefreshToken = () => loadState<string>('refreshKujiToken')
```

### FrontAPI.ts 變更

refresh 成功後改呼叫 authStore：
```typescript
import { useAuthStore } from '@/stores/useAuthStore'
// ...
const authStore = useAuthStore()
authStore.setAuth(payload.data)
resolveQueue(payload.data.accessToken)
```
移除手動 `saveState('token', ...)` 等三行。

### App.vue 變更

```typescript
onMounted(async () => {
  await authStore.initAuth()  // silentRefresh 完成前 isLogin 為 false
})
```

---

## Bug #4 修法 — Router Guard

`router/index.ts` 尾端加入：
```typescript
import { useAuthStore } from '@/stores/useAuthStore'

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLogin) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

**Login.vue** 登入成功後：
```typescript
const redirect = route.query.redirect as string
router.push(redirect || '/member-center/profile')
```

---

## 關鍵注意事項

1. `silentRefresh` 必須用裸 `axios`（非 `api` 實例），否則會觸發自身攔截器造成無限遞迴
2. App.vue `initAuth()` 是 async，router guard 在 `isLogin` 為 false 時可能誤判（F5 剛載入時 token 還在 refresh）
   - 解法：App.vue 加 `isInitializing` ref，`initAuth` 完成前顯示 loading，不顯示頁面內容
3. refresh 後 pending queue 的請求需正確取到新 token（`resolveQueue(newAccessToken)` 時機正確）
