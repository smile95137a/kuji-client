# Plan: 024-member-system-enhancement

**Branch**: `024-member-system-enhancement`  
**Created**: 2026-04-22  
**Status**: Not applicable — backend only

---

## 結論

Feature 024 的所有工作項目（Email 驗證強制執行、帳號鎖定、server-side logout、登入記錄追蹤、審計日誌、Admin 手動調整點數）**均為後端實作範疇**，不在 kuji-client 前端需要開發的項目內。

---

## 前端影響範圍對照

| 024 User Story | kuji-client 前端 | 說明 |
|----------------|-----------------|------|
| Story 1 — Email 驗證強制執行 | ✅ 已由 **Feature 026** 處理 | Auth UX 改版：VerifyEmail 落地頁、登入錯誤處理 |
| Story 2 — 登入失敗帳號鎖定 | ✅ 已由 **Feature 026** 處理 | `useLogin.ts` errorCode 處理、鎖定訊息 UI |
| Story 3 — 前台 Logout | ✅ 已由 **Feature 026** 處理 | `Header.vue handleLogout()` 呼叫 `logoutApi()` |
| Story 4 — 登入記錄追蹤 | 🚫 後端功能 | 後台 Admin 查詢，不影響前台前端 |
| Story 5 — 後台操作審計日誌 | 🚫 後端功能 | 後台系統，不在 kuji-client 範圍 |
| Story 6 — Admin 手動調整點數 | 🚫 後端功能 | Admin 後台 API，不在 kuji-client 範圍 |

---

## 前端所有待辦

→ 全部轉移至 [026-frontend-auth-ux/plan.md](../026-frontend-auth-ux/plan.md)
