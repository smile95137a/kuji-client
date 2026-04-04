# Tasks: 003 — 遊戲抽獎機制

**Feature**: Game Management | **Branch**: `cli/003-game-management` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/draw.ts`，定義 `Ticket`（id, ticketNumber, status, prizeInfo?）、`DrawResult`（ticketNumber, prizeId, prizeName, prizeLevel, prizeImageUrl, isGrandPrize, isFinalPrize, pointsConsumed, remainingGold, remainingBonus）、`SessionInfo`（isOpener, protectionEndTime, grandPrizesDesignated）interface
- [ ] T002 建立 `src/services/draw.ts`，實作：`getTickets(lotteryId)` → `GET /api/lottery/draw/{lotteryId}/tickets`；`executeDraw(lotteryId, payload)` → `POST /api/lottery/draw/{lotteryId}/draw`；`designate(lotteryId, payload)` → `POST /api/lottery/draw/{lotteryId}/designate`；`incrementHot(lotteryId)` → `POST /api/lottery/browse/{lotteryId}/hot`（fire-and-forget）
- [ ] T003 建立 `src/stores/draw.ts`，定義 Pinia store：tickets / sessionInfo / isDrawing / selectedTicketId / lastDrawResult
- [ ] T004 建立 `src/composables/useProtectionTimer.ts`：接收 protectionEndTime，每秒計算剩餘秒數，Page Visibility API 防止 tab 切換後停止，歸零後 emit unlock 事件

---

## Phase 2: Foundational

- [ ] T005 [P] 建立 `src/components/draw/TicketCell.vue`，單張票券：AVAILABLE（白色/顯示號碼/可選中高亮）、DRAWN（深灰蒙層 + 賞品縮圖或「謝謝惠顧」）、`AVAILABLE` 不渲染 prizeId/prizeLevel（安全需求 FR-UI-002）
- [ ] T006 [P] 建立 `src/components/draw/GrandPrizeConfetti.vue`，canvas-confetti 慶祝效果，isGrandPrize=true 時觸發，時長 3s（FR-UI-006）
- [ ] T007 [P] 建立 `src/components/draw/PrizeRevealAnimation.vue`，GSAP 翻牌/閃光動畫（1.5s 一般獎品，1.0s 謝謝惠顧），動畫播放期間全螢幕遮罩防誤觸（FR-UI-005）

---

## Phase 3: [US1] 執行隨機抽獎

- [ ] T008 [US1] 建立 `src/components/draw/TicketGrid.vue`：依 ticketNumber 升序渲染 TicketCell；手機 5 列 / 桌機 10 列（CSS Grid）；超過 50 張顯示「顯示更多」折疊（FR-UI-001/004）
- [ ] T009 [US1] 建立 `src/components/draw/DrawButton.vue`：顯示費用（pricePerDraw）；金幣不足時禁用並提示（SC-006，客戶端驗證）；isDrawing 時 Spinner 禁用防重複（FR-UI-003 in 003）
- [ ] T010 [US1] 建立 `src/components/draw/DrawResultModal.vue`：顯示賞品名稱/等級/圖片；謝謝惠顧（prizeId=null）顯示安慰圖示（FR-UI-007）；isFinalPrize=true 顯示「🎉 最後一張！」（FR-UI-008）；「繼續抽」/「前往賞品盒」/「查看結果」按鈕
- [ ] T011 [US1] 建立 `src/views/DrawPage.vue`（`/lottery/{id}/draw`）：onMounted 呼叫 getTickets + incrementHot（fire-and-forget）；抽獎流程：驗證餘額 → 按鈕禁用 → executeDraw → PrizeRevealAnimation → DrawResultModal；Draw Response 永遠取 result[0]（US1）；成功後更新全域 goldCoins/bonusCoins（remainingGold/remainingBonus）

---

## Phase 4: [US2] 指定票券抽獎

- [ ] T012 [US2] 在 `TicketCell.vue` 加入選中狀態：點擊 AVAILABLE 票券切換選中/取消選中；選中時高亮樣式；再次點擊取消選中（US2 AC-3）
- [ ] T013 [US2] 在 `DrawButton.vue` 依 selectedTicketId 切換文字：未選中「隨機抽 1 次 — XXX 點」/ 已選中「抽 #XX — XXX 點」；executeDraw 時若有 selectedTicketId 則 Request body 包含 `ticket: [ticketId]`（US2 AC-2）

---

## Phase 5: [US3] 保護時間鎖定

- [ ] T014 [P] [US3] 建立 `src/components/draw/ProtectionTimer.vue`，整合 useProtectionTimer composable，顯示「保護時間剩餘 HH:MM:SS」；歸零後自動解鎖按鈕，隱藏 Timer（US3 AC-2）
- [ ] T015 [US3] 在 `DrawPage.vue` 整合保護邏輯：sessionInfo.isOpener=false 且 protectionEndTime 未到期 → 顯示 ProtectionTimer，DrawButton 禁用（US3 AC-1）；isOpener=true → 不顯示 Timer（US3 AC-3）；SCRATCH_MODE + isOpener + !grandPrizesDesignated → 顯示「請先指定大賞」並跳轉 scratch-open（US3 AC-4，路由守衛）

---

## Phase 6: [US4] 熱門計數觸發

- [ ] T016 [US4] 確認 `DrawPage.vue` onMounted 中 `incrementHot(lotteryId)` 為 fire-and-forget（不 await，不顯示任何 UI 反饋，錯誤靜默忽略）（US4 AC-1）

---

## Final Phase: Polish

- [ ] T017 [P] 確認 `TicketGrid.vue` 在 100 張票券時渲染時間 ≤ 300ms（SC-002）；確認動畫幀率 ≥ 30fps（SC-001）
- [ ] T018 [P] 確認 `DrawPage.vue` 中抽獎按鈕點擊到 PrizeRevealAnimation 啟動 ≤ 500ms（SC-001）；確認餘額在 DrawResultModal 顯示時已更新（SC-005）

---

## Dependencies

```
T001 → T002 → T003
T004 → T014 → T015
T005 → T008
T006, T007 → T010
T008, T009, T010 → T011
T012, T013 → T011
T014, T015 → T011
```

## Parallel Opportunities

- T005, T006, T007 可同時開發（各自獨立 UI 組件）
- T009, T010 可同時開發
- T012, T013 可同時完善 TicketCell 和 DrawButton

## Implementation Strategy

MVP = Phase 3（T008–T011）完成隨機抽獎基本流程；US2（指定票）Phase 4；US3（保護）Phase 5。
