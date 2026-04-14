# Task Checklist: 08 - 推薦碼系統

> Branch: `feat/08-referral-code`
> Worktree: `../kuji-client--feat-08/`
> 依賴: `fix/critical-bugs` 需先 merge；與 `feat/01-auth` 協調（Register.vue）

---

## Phase 1 — 建立 referralService.ts

- [ ] 新建 `src/services/referralService.ts`（basePath = '/referral'）
- [ ] 方法: generateMyCode() / validateCode(code) / applyCode(code) / getMyStats() / disableCode(id)
- [ ] 確認型別: ReferralCodeRes / ReferralValidateRes / ReferralApplyRes / ReferralStatsRes

## Phase 2 — 清理舊驗證邏輯

- [ ] `AuthService.ts`: 移除 `validateReferralCode()`（或標記 @deprecated）
- [ ] `src/composables/useReferralCodeValidator.ts`: 改呼叫 `referralService.validateCode()`

## Phase 3 — Register.vue 推薦碼欄位

- [ ] `useRegister.ts`: 新增 referralCodeInput ref + debounce 驗證邏輯
- [ ] 驗證中顯示 loading spinner
- [ ] valid=true: 顯示「推薦人: {nickname}，雙方各得 {bonusForNew} 紅利 ✓ 」
- [ ] valid=false: 對應 reason 的中文提示
- [ ] `Register.vue`: 新增推薦碼欄位 UI（可選，放在表單最後）

## Phase 4 — useReferral.ts

- [ ] 新建 `src/composables/useReferral.ts`
- [ ] myCode / stats / canApplyReferral computed
- [ ] generateMyCode() / loadStats() / applyCode(code)
- [ ] applyCode 成功後: authStore.user.referralCode 更新 + memberWallet 更新

## Phase 5 — 會員中心頁面

- [ ] 新建 `src/views/member/ReferralCode.vue`
- [ ] 引入 MyReferralCodeCard + ApplyReferralSection
- [ ] 新建 `src/components/member/MyReferralCodeCard.vue`（自己的碼 + 複製按鈕 + 統計）
- [ ] 新建 `src/components/member/ApplyReferralSection.vue`

## Phase 6 — ApplyReferralSection.vue 邏輯

- [ ] `v-if="canApplyReferral"` 條件顯示（provider=GOOGLE && referralCode=null）
- [ ] 輸入框 + debounce 驗證 + 套用按鈕
- [ ] 套用成功後: 顯示「已套用 ✓」，輸入框消失（不可再改）

## Phase 7 — 路由新增

- [ ] `router/index.ts`: member-center children 加 `/referral` 路由
- [ ] `meta: { requiresAuth: true }`

## Phase 8 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] Email 註冊填有效推薦碼 → 後端自動套用 → 紅利到帳
- [ ] Email 註冊填無效推薦碼 → 即時錯誤提示 + 可繼續送出（推薦碼清空）
- [ ] Google 登入 → 推薦碼頁面可補綁
- [ ] 補綁成功 → 不再顯示補綁區塊
- [ ] 自循環套用（自己的碼）→ SELF_REFERRAL 錯誤
- [ ] 已套用 → ALREADY_USED 錯誤
