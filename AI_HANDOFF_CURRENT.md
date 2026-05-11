# AI 交接現況（kuji-client）

最後更新：2026-05-11

## 收尾狀態

1. 本 repo 已完成 commit + push。
2. 目前分支狀態：`main...origin/main`（工作樹乾淨）。
3. 可由下一位 AI 直接承接既有型別阻斷修正與 smoke 驗證。

## 本輪重點

1. 已啟動與後端 `kuji-admin` 的 auth 契約同步。
2. `src/services/AuthService.ts` 已補強：
   - `AuthUserRes` 新增 `avatar` 相容欄位（保留 `avatarUrl`）
   - `AuthRes` 新增 `forceChangePassword`
   - 註解明確化：註冊成功不一定回傳 token（需先 Email 驗證）

## 目前狀態

1. `src/composables/useRegister.ts` 已採「註冊成功導回登入」流程。
2. `src/views/ResetPassword.vue` 已調整為舊流程停用提示頁。
3. build 目前有既有型別阻斷：`IchibanDetail.vue` 使用 `designatedWinningNumbers`，型別建議 `designatedNumbers`（非本包新增）。

## 下一步（接手者）

1. 優先處理 `IchibanDetail.vue` 型別欄位對齊（不改 UI）。
2. 完成後再做 auth 流程 smoke（login/refresh/logout/verify-email）。
3. 完成後更新本檔並 `commit + push`。
