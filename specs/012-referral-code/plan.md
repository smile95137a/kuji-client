# Implementation Plan: 012 — 推薦碼系統

**Branch**: `cli/012-referral-code` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-referral-code/spec.md`

---

## Summary

實作推薦碼相關功能：(1) 分享我的推薦碼頁（`/profile/referral`），可複製連結或分享給朋友；(2) 注冊頁推薦碼驗證（已有 `Register.vue`）：URL 參數 `?ref=CODE` 自動填入、輸入後 600ms debounce 呼叫驗證 API、驗證結果圖示提示；(3) 推薦獎勵記錄頁（`/profile/referral-rewards`）。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, VeeValidate 4.14.7, Yup 1.4.0, Sass |
| **Storage** | Pinia（referralCode / referralStats / rewardHistory） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 推薦碼驗證 ≤ 300ms；debounce 600ms 防抖 |
| **Constraints** | 需登入（推薦碼頁）；注冊頁公開；AbortController 取消重疊請求 |
| **Scale/Scope** | 3 頁面（注冊整合 + 推薦碼 + 獎勵記錄）、4 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/012-referral-code/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── Register.vue                # 注冊頁（已存在，需整合推薦碼欄位）
│   ├── ReferralPage.vue            # 我的推薦碼頁（/profile/referral）
│   └── ReferralRewards.vue         # 推薦獎勵記錄（/profile/referral-rewards）
├── components/
│   └── referral/
│       ├── ReferralCodeInput.vue   # 推薦碼輸入框（debounce 600ms + AbortController）
│       ├── ReferralCodeCard.vue    # 我的推薦碼卡片（複製連結、分享按鈕）
│       ├── ReferralStatsCard.vue   # 統計卡片（已推薦人數、已獲獎勵）
│       └── ReferralRewardItem.vue  # 獎勵記錄項目（被推薦人名稱遮蔽、金額、時間）
├── stores/
│   └── referral.ts                # referralCode / stats / rewardHistory
├── composables/
│   └── useReferralCodeValidator.ts # debounce 600ms + AbortController 驗證邏輯
├── services/
│   └── referral.ts                # GET /api/referral/my / POST /api/referral/validate / GET /api/referral/rewards
└── types/
    └── referral.ts                # ReferralInfo / RewardRecord / ValidateResult
```

---

## 主要開發項目

### 1. 注冊頁推薦碼自動填入
```typescript
// Register.vue onMounted
const route = useRoute()
const refCode = route.query.ref as string | undefined
if (refCode) {
  formFields.referralCode = refCode
  // 自動觸發驗證
}
```

### 2. 推薦碼驗證（debounce 600ms + AbortController）
```typescript
// composables/useReferralCodeValidator.ts
let abortController: AbortController | null = null

const debouncedValidate = useDebounceFn(async (code: string) => {
  if (abortController) abortController.abort()
  abortController = new AbortController()

  try {
    const result = await referralService.validate(code, abortController.signal)
    validationState.value = result.valid ? 'valid' : 'invalid'
  } catch (e) {
    if ((e as Error).name === 'AbortError') return // 被取消，不更新狀態
    validationState.value = 'error'
  }
}, 600)
```

### 3. 驗證狀態指示器
| 狀態 | 圖示 | 顏色 |
|------|------|------|
| 驗證中 | ⏳ 轉圈 | 灰色 |
| 有效 | ✅ | 綠色 |
| 無效 | ❌ | 紅色 |
| 空白 | 無 | — |

### 4. 我的推薦碼分享
```typescript
// 複製連結
const shareUrl = `${window.location.origin}/register?ref=${myReferralCode.value}`
navigator.clipboard.writeText(shareUrl)
// Web Share API（若支援）
if (navigator.share) {
  await navigator.share({ title: '加入一番賞', url: shareUrl })
}
```

### 5. 隱私保護
- 獎勵記錄中被推薦人顯示為「{名字前1字}***{名字後1字}」，保護隱私

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| 推薦碼有效期 | AV-004：推薦碼是否永久有效或限期使用 |
| 獎勵類型多樣性 | AV-007：目前只有金幣獎勵，未來可能有其他類型 |
| 注冊頁面整合 | 需與現有 Register.vue 整合（避免重複開發） |
