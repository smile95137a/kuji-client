# Task Checklist: 026-frontend-auth-ux

> 注意：FR-001 ～ FR-004、FR-006 ～ FR-009 均已完成（詳見 plan.md 審計表）。
> 本 task 僅追蹤**剩餘缺口**（FR-005 的兩個 gap）。

---

## Phase 1 — VerifyEmail 錯誤狀態補按鈕（FR-005）

- [X] T001 [P] [US3] `src/views/VerifyEmail.vue`：error state 替換「前往登入頁」為「重新發送驗證信」主按鈕 + 「前往登入頁」次要按鈕
- [X] T002 [P] [US3] `src/views/VerifyEmail.vue`：新增 `goResend()` 函式，跳轉至 `{ name: 'Login', query: { action: 'resend' } }`

## Phase 2 — Login.vue 接收 ?action=resend hint（US2）

- [X] T003 [US2] `src/views/Login.vue`：新增 `infoMessage` ref
- [X] T004 [US2] `src/views/Login.vue`：`onMounted` 讀取 `route.query.action`，若為 `'resend'` 則寫入 `infoMessage`
- [X] T005 [US2] `src/views/Login.vue`：template 在 Email input 上方顯示 info banner（`v-if="infoMessage"`）

## Phase 3 — 驗收確認

- [X] T006 有效 token：VerifyEmail 顯示成功狀態 + 「前往登入」按鈕
- [X] T007 失效 token：VerifyEmail 顯示「重新發送驗證信」+ 「前往登入頁」兩個按鈕
- [X] T008 點擊「重新發送驗證信」→ 跳轉 `/login?action=resend`，登入頁顯示 info banner
- [X] T009 用未驗證帳號登入 → EMAIL_NOT_VERIFIED 錯誤訊息 + 重送按鈕 60 秒倒數（回歸確認，不需修改）
- [X] T010 密碼錯誤 → remainingAttempts 提示（回歸確認）
- [X] T011 帳號鎖定 → ACCOUNT_LOCKED 提示 + 登入按鈕 disabled（回歸確認）
- [X] T012 登出（桌面）→ 呼叫 `POST /api/auth/logout` 後清除並導向 Home（回歸確認）
- [X] T013 登出（手機漢堡）→ 同上（回歸確認）
- [X] T014 登出 API 失敗（斷網）→ 仍正常清除並導向 Home（回歸確認）
