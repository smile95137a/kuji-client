# Tasks: 005 — 抽獎票券系統（刮刮樂）

**Feature**: Lottery Ticket System | **Branch**: `cli/005-lottery-ticket-system` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/ticket.ts`，定義 `Ticket`（id, ticketNumber, status, revealedNumber?, prizeInfo?）、`TicketSession`（isOpener, protectionEndTime, grandPrizesDesignated）、`DesignateRequest`（prizeNumbers: number[]）interface；確認 AVAILABLE 票券的 prizeInfo 欄位不出現（安全需求 SC-003）
- [ ] T002 建立 `src/services/ticket.ts`，實作：`getTickets(lotteryId)` → `GET /api/lottery/draw/{lotteryId}/tickets`；`executeDraw(lotteryId, payload)` → `POST /api/lottery/draw/{lotteryId}/draw`；`designate(lotteryId, payload: DesignateRequest)` → `POST /api/lottery/draw/{lotteryId}/designate`
- [ ] T003 建立 `src/stores/scratch.ts`，定義 Pinia store：playMode / tickets / sessionInfo / designatedNumbers（Set of revealedNumber）/ isDesignating / lastDrawResult
- [ ] T004 確認（或建立）`src/composables/useProtectionTimer.ts`（與 003 共用）；建立 `src/composables/useDesignationPoller.ts`：接收 lotteryId + interval(10000ms)，setInterval 呼叫 getTickets，偵測 grandPrizesDesignated=true 時呼叫 onDesignated callback，onUnmounted 清除 interval（AV-007 已澄清）

---

## Phase 2: Foundational

- [ ] T005 [P] 建立 `src/components/scratch/ScratchProtectionTimer.vue`，整合 useProtectionTimer，顯示保護倒數「保護時間剩餘 HH:MM:SS」；歸零後隱藏；Page Visibility API 防止 tab 切換後停止（SC-004）
- [ ] T006 [P] 建立 `src/components/scratch/DesignationLockOverlay.vue`：isOpener=true + grandPrizesDesignated=false 時顯示鎖定遮罩「請先完成大賞指定」（FR-UI-007）；isOpener=false + grandPrizesDesignated=false 時顯示「等待開套者指定大賞中...（10s 後自動更新）」

---

## Phase 3: [US1] 刮刮樂開套者指定大賞位置

- [ ] T007 [US1] 建立 `src/components/scratch/DesignationGrid.vue`：顯示所有 AVAILABLE 票券的 revealedNumber 格子；開套者可勾選指定為大賞（最多 X 個，AV-008 Deferred 時顯示「剩餘可指定：未知」）；已選取項目以高亮顯示；grandPrizesDesignated=true 時格子為唯讀（US1 AC-4）
- [ ] T008 [US1] 建立 `src/views/ScratchOpenPage.vue`（`/lottery/{id}/scratch-open`）：路由守衛：非開套者（isOpener=false）重新導向 scratch-draw（US1 AC-5）；頁面頂部顯示「請指定大賞所在位置」提示；整合 DesignationGrid；「確認指定」按鈕呼叫 `designate({ prizeNumbers: [...designatedNumbers] })`；成功後更新 grandPrizesDesignated=true 並顯示「指定完成！」Banner，5 秒後導向 scratch-draw（US1 AC-3）

---

## Phase 4: [US2] 刮刮樂抽獎（謝謝惠顧場景）

- [ ] T009 [US2] 建立 `src/components/scratch/ScratchCard.vue`：顯示 revealedNumber（不顯示 ticketNumber，FR-UI-005）；AVAILABLE：可點擊刮開動畫（GSAP 銀色消散，0.8s，FR-UI-006）；DRAWN + prizeInfo：顯示賞品縮圖；DRAWN + prizeId=null：顯示「謝謝惠顧」灰色覆蓋（US2 AC-3）
- [ ] T010 [US2] 建立 `src/components/scratch/ScratchCardGrid.vue`：CSS Grid，手機 5 列 / 平板 8 列 / 桌機 10 列（FR-UI-001）；顯示「已抽 X / 共 Y 張」計數（FR-UI-004）；整合 ScratchCard + DesignationLockOverlay
- [ ] T011 [US2] 建立 `src/views/ScratchDrawPage.vue`（`/lottery/{id}/scratch-draw`）：onMounted 呼叫 getTickets；grandPrizesDesignated=false + isOpener=false → 啟動 useDesignationPoller 輪詢（US2/3 等待場景）；grandPrizesDesignated=true → 允許抽獎；點擊 ScratchCard → executeDraw → prizeId=null 時顯示謝謝惠顧動畫 + Modal（US2 AC-1/2）

---

## Phase 5: [US3] 店家已預設大賞（grandPrizesDesignated=true）

- [ ] T012 [US3] 在路由守衛（或 DrawPage.vue onMounted）實作 PlayMode 路由邏輯：product.playMode=SCRATCH_MODE + isOpener=true + grandPrizesDesignated=false → redirect scratch-open；SCRATCH_MODE + grandPrizesDesignated=true → redirect scratch-draw（US3 AC-1/2）

---

## Phase 6: [US4] 開套者保護退款

- [ ] T013 [US4] 在 DrawResultModal（或 ScratchDrawPage 的結果 Modal）中：isOpener=true + 大賞場景 → 顯示「🎉 恭喜中大賞！保護機制退還點數 XXX」；remainingGold/remainingBonus 顯示退款後正確餘額（US4 AC-1）
- [ ] T014 [US4] 在 `ScratchOpenPage.vue` 顯示保護進度條（若後端提供 protectionDrawsUsed/protectionDrawsTotal，AV-005；若無則顯示 N/A）（US4 AC-2 Deferred）

---

## Phase 7: [US5] 一番賞隨機/指定模式切換

- [ ] T015 [US5] 確認 `DrawPage.vue`（LOTTERY_MODE）中 TicketCell 點選切換邏輯（與 003-T012 整合）：未選中 → 「隨機抽 1 次 — XXX 點」；選中 → 「抽 #XX — XXX 點」；再次點擊取消選中（US5 AC-1/2/3）

---

## Final Phase: Polish

- [ ] T016 [P] 確認 ScratchCard 刮開動畫在低階 Android 手機 ≥ 30fps（SC-001）；確認 AVAILABLE 票券的 prizeInfo 完全不出現在 DOM/JS 變數（SC-003）
- [ ] T017 [P] 確認 useDesignationPoller 在 onUnmounted 時清除 interval；Tab 切回時重啟（若使用 Page Visibility API）；確認輪詢 10s 間隔不在 tab 隱藏時累積（SC-005）

---

## Dependencies

```
T001 → T002 → T003
T004 → T006, T011
T005 → T011
T007 → T008
T009, T010 → T011
T012 → T008, T011
T013 → T011
```

## Parallel Opportunities

- T005, T006 可同時開發
- T009, T010 可同時開發
- T013, T014 可同時開發
- T015 可獨立進行（依賴 003 的 DrawPage）

## Implementation Strategy

MVP = US1（Phase 3，開套者指定）+ US2（Phase 4，刮刮樂抽獎）；US3 路由邏輯 Phase 5；US4/5 為增強項。
