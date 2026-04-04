# Tasks: 012 — 推薦碼系統

**Feature**: Referral Code | **Branch**: `cli/012-referral-code` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [x] T001 確認/更新 `src/services/AuthService.ts`，新增 `validateReferralCode(code, signal?)` → `GET /auth/referral/validate?code=xxx`
- [x] T002 `src/services/AuthService.ts` 已有完整 register / login / refreshToken 等函式

---

## Phase 2: Foundational

- [x] T003 建立 `src/composables/useReferralCodeValidator.ts`：600ms debounce + AbortController；isValidating / isValid / ownerName / validationError / validate(code) / reset()

---

## Phase 3: [US1] 無推薦碼正常註冊

- [x] T004 [US1] 確認 `src/views/Register.vue`（已存在）VeeValidate + Yup 驗證 schema：username（3-20 字元英數字）/ password（8 位以上含英數字）/ confirmPassword（相符）/ email（RFC 格式）/ referralCode（optional，max 20 字）；已整合 onMounted ?ref=CODE 自動填入

---

## Phase 4: [US2] 有效推薦碼驗證與回饋

- [x] T005 [US2] `src/components/register/RegisterMainSection.vue` 已整合 useReferralCodeValidator（inline 實作，功能等同獨立元件）：input maxlength=20；isValid=true → ✅ 有效推薦碼（ownerName）；驗證中 → ⏳；isValid=false → ❌；清空 → reset；aria-describedby="referralCode-status" 已加入（T012 a11y）

---

## Phase 5: [US3] 無效推薦碼處理

- [x] T006 [US3] `RegisterMainSection.vue` 顯示 referralError 訊息（US3 AC-1）；Modal 確認對話框為 deferred
- [x] T007 [US3] errorCode REFERRAL_CODE_EXPIRED / REFERRAL_CODE_MAXED 各自對應中文訊息（實作於 useReferralCodeValidator.ts）

---

## Phase 6: [US4] URL ?ref=CODE 自動填入

- [x] T008 [US4] `src/views/Register.vue` onMounted 讀取 `route.query.ref` 並 `setFieldValue('referralCode', refCode)`（US4 AC-1/2）

---

## Phase 7: [US5] 表單即時驗證

- [x] T009 [US5] `RegisterMainSection.vue` watch(referralCode) → 600ms debounce 即時驗證已整合；composable 內建 AbortController
- [x] T010 [US5] `Register.vue` isSubmitting ref + provide；`RegisterOtherSection.vue` 按鈕 :disabled="isSubmitting"，顯示「送出中...」（FR-UI-006 防重複提交）；成功後導向 Login 頁

---

## Final Phase: Polish

- [x] T011 [P] AbortController 在 code 變更時正確 abort（composable 內建），600ms debounce clearTimeout 於 onUnmounted 呼叫 reset()
- [x] T012 [P] referralCode input 已加入 `aria-describedby="referralCode-status"`；status p 標籤對應 id（a11y FR-UI-007）

---

## Dependencies

```
T001 → T002 → T003
T003 → T005 → T004
T004, T005 → T006
T007 → T006
T008 → T004（onMounted 整合）
T009, T010 → T004（Register.vue 最終整合）
T011, T012 → T005（ReferralCodeInput 最終確認）
```

## Parallel Opportunities

- T001, T002 可同時確認/建立
- T005, T006 可同時開發（共用 useReferralCodeValidator）
- T007 可與 T006 並行（errorCode 處理邏輯）
- T009, T010 可同時進行

## Implementation Strategy

MVP = US1（T004 基礎表單）+ US2（T003+T005 有效推薦碼）+ US3（T006 無效處理）；US4 URL 自填（T008）和 US5 即時驗證（T009+T010）最後整合。
