# Plan: 08 - 推薦碼系統

> Branch: `feat/08-referral-code`
> Worktree: `../kuji-client--feat-08/`
> 依賴: `fix/critical-bugs` 需先 merge；與 `feat/01-auth`（Register.vue）協調

---

## 新增檔案清單

| 檔案 | 說明 |
|------|------|
| `src/services/referralService.ts` | 5 個推薦碼 API 方法 |
| `src/composables/useReferral.ts` | 推薦碼邏輯（產生/套用/統計） |
| `src/views/member/ReferralCode.vue` | 推薦碼管理頁面 |
| `src/components/member/MyReferralCodeCard.vue` | 自己的碼 + 統計 |
| `src/components/member/ApplyReferralSection.vue` | 補綁區塊 |

---

## referralService.ts 設計

```typescript
const basePath = '/referral'

export async function generateMyCode(): Promise<ReferralCodeRes> {
  const res = await api.post(`${basePath}/generate`)
  return res.data?.data
}

export async function validateCode(code: string): Promise<ReferralValidateRes> {
  const res = await api.get(`${basePath}/validate`, { params: { code } })
  return res.data?.data
}

export async function applyCode(code: string): Promise<ReferralApplyRes> {
  const res = await api.post(`${basePath}/apply`, { code })
  return res.data?.data
}

export async function getMyStats(): Promise<ReferralStatsRes> {
  const res = await api.get(`${basePath}/stats`)
  return res.data?.data
}

export async function disableCode(id: string): Promise<void> {
  await api.post(`${basePath}/${id}/disable`)
}
```

---

## AuthService.ts 修改

```typescript
// 移除（改由 referralService.validateCode() 取代）
// export const validateReferralCode = ...
```

## useReferralCodeValidator.ts 修改

```typescript
// 改呼叫 referralService.validateCode()
import * as referralService from '@/services/referralService'
```

---

## Register.vue 修改

新增推薦碼欄位（可選）：
```typescript
// useRegister.ts 內
const referralCodeInput = ref('')
const referralValidation = ref<ReferralValidateRes | null>(null)
const isValidatingReferral = ref(false)

// debounce 500ms 驗證
watchDebounced(referralCodeInput, async (code) => {
  if (!code) { referralValidation.value = null; return }
  isValidatingReferral.value = true
  referralValidation.value = await referralService.validateCode(code)
  isValidatingReferral.value = false
}, { debounce: 500 })
```

UI 提示：
- 有效 → 「推薦人：{nickname}，雙方各得 {bonusForNew} 紅利 ✓」
- 無效 → 對應 reason 的中文說明

---

## 元件邊界

```
ReferralCode.vue（view）
  ├── MyReferralCodeCard.vue（自己的碼 + 複製 + 統計）
  └── ApplyReferralSection.vue（補綁，Google 用戶且未套用才顯示）

useReferral.ts（composable）
  - myCode: ref<ReferralCodeRes | null>
  - stats: ref<ReferralStatsRes | null>
  - canApplyReferral: computed（provider=GOOGLE && user.referralCode===null）
  - generateMyCode()
  - loadStats()
  - applyCode(code) → 成功後更新 authStore.user.referralCode + memberWallet
```

---

## ApplyReferralSection.vue 規格

```typescript
// 顯示條件
const showSection = computed(() =>
  authStore.user?.provider === 'GOOGLE' &&
  authStore.user?.referralCode === null
)
```

套用成功後：
1. `authStore.user.referralCode = code`（或重新 fetch user）
2. `memberWallet.addBonus(result.bonusEarned)`
3. 元件顯示「已成功套用推薦碼 ✓」，輸入框消失

---

## 路由新增

```typescript
// router/index.ts member-center children
{
  path: 'referral',
  name: 'ReferralCode',
  component: () => import('@/views/member/ReferralCode.vue'),
  meta: { requiresAuth: true }
}
```
