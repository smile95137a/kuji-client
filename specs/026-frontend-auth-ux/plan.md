# Plan: 026-frontend-auth-ux

**Branch**: `026-frontend-auth-ux`  
**Created**: 2026-04-22  
**Author**: Auto-generated from spec audit  
**Status**: Ready for implementation

---

## 現況審計（Audit）

> 在開始規劃前先逐一對照 spec FR-001 ～ FR-009，確認哪些已完成，哪些仍缺。

| FR | 需求 | 狀態 | 負責檔案 |
|----|------|------|----------|
| FR-001 | 所有登出按鈕呼叫 `POST /api/auth/logout` 再清除 local token | ✅ 完成 | `Header.vue handleLogout()` → `logoutApi()` + `authStore.logout()` |
| FR-002 | 登出 API 失敗時仍執行本地清除 | ✅ 完成 | `logoutApi()` 內部 try/catch，失敗只 warn，不 throw |
| FR-003 | 前端路由包含 `/verify-email`，接收 `?token=xxx` | ✅ 完成 | `router/index.ts` 已有 VerifyEmail route（公開路由）|
| FR-004 | 進入驗證頁面自動呼叫後端 API，不需手動點擊 | ✅ 完成 | `VerifyEmail.vue` `onMounted` 自動呼叫 `verifyEmail(token)` |
| FR-005 | 驗證結果成功/失敗分頁：成功提供「前往登入」；**失敗提供「重新發送驗證信」** | ❌ **缺** | `VerifyEmail.vue` 錯誤狀態目前只有「前往登入頁」，沒有重送按鈕 |
| FR-006 | 登入失敗依 errorCode 顯示對應訊息 | ✅ 完成 | `useLogin.ts applyErrorFields()` 完整處理三種 errorCode |
| FR-007 | 重送驗證信按鈕 60 秒冷卻倒數 | ✅ 完成 | `useLogin.ts startResendCooldown()` + Login.vue resend UI |
| FR-008 | resend-verification 攜帶 Authorization header | ✅ 完成 | `AuthService.resendVerification(unverifiedToken)` 自動帶 header |
| FR-009 | 後端 429 時顯示「請稍後再試」並維持不可點擊 | ✅ 完成 | `useLogin.ts sendVerificationEmail()` catch 429 處理 |

**Mobile 登出路徑**：`MobileHeaderMenu.vue` emit `'logout'` → `Header.vue` `@logout="handleLogout"` → 同一個 `handleLogout()`，FR-001/002 皆覆蓋。✅

---

## 缺口分析

### Gap 1 — VerifyEmail.vue 錯誤狀態缺少「重新發送驗證信」按鈕（FR-005）

**問題**：用戶點擊失效連結後，只能看到「前往登入頁」按鈕，不知道接下來要做什麼。

**決策**：  
錯誤頁顯示「重新發送驗證信」按鈕，點擊後跳轉登入頁並帶 `?action=resend` hint。  
（此方案不需在 VerifyEmail 頁面存取 token，避免在誤 context 下呼叫 API）

**實作路徑**：
```
VerifyEmail.vue (error state)
  → 按鈕 "重新發送驗證信"
  → router.push({ name: 'Login', query: { action: 'resend' } })

Login.vue
  → 偵測 route.query.action === 'resend'
  → 顯示 info banner："您的驗證連結已失效，請登入後點擊「重新發送驗證信」"
```

### Gap 2 — Login.vue 缺少 ?action=resend banner 處理

**問題**：從 VerifyEmail 跳過來的用戶不知道流程，需要引導提示。

**實作路徑**：`Login.vue` `onMounted` 讀取 `route.query.action`，若為 `'resend'` 則設定 `infoMessage` ref，在表單上方顯示 info 橫幅。

---

## 不需要修改的部分

以下在程式碼中均已完成，**不要重複實作**：

- `AuthService.ts`：`logoutApi()`、`verifyEmail()`、`resendVerification()` ← 已存在
- `useAuthStore.ts`：`logout()` ← 單純清除 memory + localStorage
- `Header.vue`：`handleLogout()` ← 已完整實作
- `MobileHeaderMenu.vue`：已 emit `logout`，並已在 Header 接線
- `useLogin.ts`：完整 errorCode 處理邏輯
- `VerifyEmail.vue`：成功狀態、loading 狀態、`goLogin()` 中已判斷 isLogin

---

## 實作計畫

### Phase 1 — VerifyEmail 錯誤狀態補上按鈕

**檔案**：`src/views/VerifyEmail.vue`

**變更**：
```diff
  <!-- Error -->
  <template v-else>
    <div class="verifyEmail__icon">⚠️</div>
    <h1 class="verifyEmail__title">驗證連結已失效</h1>
    <p class="verifyEmail__desc">
      此驗證連結已失效或已被使用，請重新登入後申請新的驗證信。
    </p>
-   <button class="verifyEmail__btn verifyEmail__btn--secondary" @click="goLogin">
-     前往登入頁
-   </button>
+   <button class="verifyEmail__btn verifyEmail__btn--primary" @click="goResend">
+     重新發送驗證信
+   </button>
+   <button class="verifyEmail__btn verifyEmail__btn--secondary" @click="goLogin" style="margin-top:8px">
+     前往登入頁
+   </button>
  </template>
```

**新增 `goResend()`**：
```typescript
const goResend = () => {
  router.push({ name: 'Login', query: { action: 'resend' } });
};
```

---

### Phase 2 — Login.vue 接收 ?action=resend hint

**檔案**：`src/views/Login.vue`

**變更**：
1. 新增 `infoMessage` ref
2. `onMounted` 讀取 `route.query.action`：若為 `'resend'` 則設 `infoMessage.value = '您的驗證連結已失效，請輸入帳號密碼後再點擊「重新發送驗證信」'`
3. 在 Email input 上方顯示 info banner（樣式與 `login__text--error` 類似但用 info 色）

---

## 驗收清單

- [ ] **FR-005 成功 path**：有效 token → VerifyEmail 顯示「Email 驗證成功！」+「前往登入」按鈕
- [ ] **FR-005 失敗 path**：失效 token → 顯示「驗證連結已失效」+「重新發送驗證信」+「前往登入頁」兩個按鈕
- [ ] 點擊「重新發送驗證信」→ 跳轉 `/login?action=resend`
- [ ] 登入頁出現 `?action=resend` → 顯示 info banner 提示
- [ ] 用未驗證帳號嘗試登入 → 顯示「尚未驗證」訊息 + 重送按鈕（現有邏輯確認正常）
- [ ] 點擊重送 → 60 秒倒數（現有邏輯確認正常）
- [ ] 登出（桌面）→ 呼叫 `/api/auth/logout` 後清除並導向 Home
- [ ] 登出（手機漢堡選單）→ 同上
- [ ] 登出 API 失敗（斷網模擬）→ 仍正常清除並導向 Home
- [ ] 密碼錯誤 3 次 → 顯示「還剩 N 次機會」
- [ ] 密碼錯誤 5 次 → 顯示「帳號已鎖定 N 分鐘」，登入按鈕 disabled

---

## 檔案異動總覽

| 檔案 | 類型 | 說明 |
|------|------|------|
| `src/views/VerifyEmail.vue` | 修改 | Error state 加「重新發送」按鈕 + `goResend()` |
| `src/views/Login.vue` | 修改 | `onMounted` 讀取 `?action=resend`，顯示 info banner |

> 其他檔案**不需要修改**。

---

## Commit Message

```
feat(026): verify email error state add resend button + login action=resend hint
```
