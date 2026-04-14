# Task Checklist: 04 - 抽獎核心流程

> Branch: `feat/04-draw-flow`
> Worktree: `../kuji-client--feat-04/`
> 依賴: `fix/critical-bugs` 需先 merge；`feat/03-lottery-browse` 建議先完成

---

## Phase 1 — Service 型別修正

- [ ] `lotteryDrawService.ts`: `DrawResult.ticketNumber` 型別改 `string`（原 `number`）
- [ ] `lotteryDrawService.ts`: `SessionResponse` 欄位對齊後端實際（`isDesignationComplete` 等）
- [ ] 確認 `designate()` 請求格式符合後端（`revealedNumber` 非 `ticketNumber`）

## Phase 2 — useDrawFlow.ts

- [ ] 新建/確認 `src/composables/useDrawFlow.ts`
- [ ] 正確處理三種回應（results / designationRequired / designationPending）
- [ ] 開獎後更新 memberWallet store（remainingGold + remainingBonus）

## Phase 3 — useSessionPoller.ts

- [ ] 新建 `src/composables/useSessionPoller.ts`
- [ ] 間隔 3 秒 setInterval 輪詢 `GET /lottery/draw/{id}/session`
- [ ] `isDesignationComplete = true` 時停止輪詢並 callback
- [ ] `onUnmounted` 時確保 clearInterval（防 memory leak）

## Phase 4 — useProtectionTimer.ts

- [ ] 新建/確認 `src/composables/useProtectionTimer.ts`
- [ ] 從 `protectionEndTime`（ISO 8601）計算剩餘秒數
- [ ] `ref<number>` 倒數，`setInterval` 每秒更新
- [ ] 到期自動停止（clearInterval）+ `onUnmounted` 清理

## Phase 5 — 元件確認

- [ ] ProtectionTimer.vue: 只在 `protectionEndTime` 有值時顯示
- [ ] PrizeDesignationDialog.vue: 傳入 `availableNumbers` 和 `grandPrizes` 正確
- [ ] DesignationWaitingOverlay.vue: `designationPending=true` 時顯示 + 呼叫 startPolling

## Phase 6 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] 一番賞抽獎 → 正常顯示開獎結果
- [ ] 刮刮樂 → 三種情況 UI 各自正確
- [ ] 保護計時器倒數正確
- [ ] 離開頁面時輪詢停止（不持續 API 呼叫）
