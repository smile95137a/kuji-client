# AI 接手指引（kuji-client）

最後更新：2026-05-11

## 接手起點

1. 目前已是乾淨接手點（`main...origin/main`）。
2. 下一位 AI 先處理型別阻斷，再進 auth smoke。

## 一句話

auth 契約已開始對齊，下一包先修既有型別阻斷，再做流程 smoke。

## 本包邊界

1. 先修 `IchibanDetail.vue` 與 `LotteryDetailRes` 欄位名稱一致性。
2. 不在同包做 UI 重構與樣式改造。
3. 完成後需 `commit + push`。

## 驗證

1. build 成功（或至少 typecheck 無阻斷）。
2. 回報 login/refresh/logout/verify-email 路徑結果。
3. 更新 `AI_HANDOFF_CURRENT.md`。
4. 收尾：執行 `commit + push`。
