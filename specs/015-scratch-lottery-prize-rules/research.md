# Research: 刮刮樂獎項規則修正 — 前台

**Feature**: `015-scratch-lottery-prize-rules` (Frontend)  
**Phase**: 0 — Unknowns resolved before design

---

## Overview

All clarification questions were answered in the `spec-frontend.md` Clarifications section (Session 2026-04-06). This document records the final decisions and their rationale, with codebase evidence where applicable.

---

## Decision 1 — Waiting UI: Full-Screen Overlay vs. In-Page Block

**Decision**: Full-screen overlay component (`DesignationWaitingOverlay.vue`), standalone SFC, **not** using the existing Pinia `useOverlayStore`.

**Rationale**:
- The Pinia overlay is a global singleton (`z-index: 9999`) used to lock UI during async operations (draw animations, result dialogs). Reusing it for the waiting overlay would conflict with those flows — e.g. if the opener dialog is already open, two overlays would compete.
- A standalone component controlled by `IchibanDetail.vue` with `showWaitingOverlay` ref gives precise lifecycle control: the waiting overlay must persist across multiple user actions (polling, countdown), not just a single async operation.
- `z-index: 8000` (below Pinia overlay at 9999) ensures draw result dialogs can still appear on top if needed during edge cases.

**Alternatives considered**:
- Reuse `BaseOverlay.vue` — rejected; it reads `isOpen` from the global Pinia store and cannot be independently controlled.
- In-page banner block — rejected by spec clarification; spec explicitly requires full-screen overlay for non-opener waiting.

**Source**: `spec-frontend.md` Clarifications Q1, `src/components/common/BaseOverlay.vue` (uses `useOverlayStore`).

---

## Decision 2 — Countdown Timer Implementation

**Decision**: `setInterval(tick, 1000)` in the `DesignationWaitingOverlay` component, started when `props.show` becomes `true`, cleared on `onUnmounted` and on `close`/`expired` emission.

**Rationale**:
- Native, zero-dependency.
- ±1s drift per tick is acceptable given the spec's ±5s tolerance.
- `watch(() => props.show, (val) => { if (val) startTimer(); else stopTimer(); })` pattern ensures the timer restarts correctly if the overlay is hidden and re-shown (e.g. user closes then another draw is intercepted).

**Edge case — deadline already past on mount**: If `new Date(props.openerDeadline).getTime() - Date.now() ≤ 0`, set `remainingSeconds = 0` and immediately emit `expired` (no negative countdown displayed). This matches spec: "若 `openerDeadline` 在計算時已過期，立即觸發 reload，不顯示負數倒數".

**Alternatives considered**:
- `requestAnimationFrame` loop — overkill for 1-second granularity; `setInterval` is idiomatic for countdown timers.
- Computed from `Date.now()` reactive value — Vue has no built-in reactive clock; would require a global timer store.

**Source**: `spec-frontend.md` FR-FE-004 Edge Cases, Assumptions.

---

## Decision 3 — Session Polling Strategy

**Decision**: `setInterval(pollFn, 30_000)` started in `showDesignationWaitingOverlay()`, cleared in `stopWaitingOverlay()` and on `onUnmounted`.

**Poll condition to auto-close**: `data?.designationDeadline === null || data?.isDesignationComplete === true`

**Rationale**:
- Spec explicitly requires 30-second interval ("保守策略").
- Two conditions cover the backend's behaviour: `designationDeadline: null` signals "window closed / designation done", and `isDesignationComplete: true` is the explicit done signal.
- Using `executeApi` with `showCatchDialog: false` / `showFailDialog: false` ensures network errors during polling don't interrupt the user with dialogs.

**Alternatives considered**:
- WebSocket / SSE — not available in the current backend; overkill for this feature.
- Shorter poll interval — rejected; 30 s is the spec requirement.

**Source**: `spec-frontend.md` FE-4 Acceptance Scenarios 3, FR-FE-005 Polling logic.

---

## Decision 4 — `designationDone` Signal

**Decision**: `session.value?.isDesignationComplete === true` (single boolean from backend `SessionResponse`).

**Rationale**:
- `designatedWinningNumbers.length > 0` is ambiguous: the array could be empty before the first session fetch, or could contain stale data.
- A dedicated boolean field from the backend eliminates all ambiguity.
- Spec clarification explicitly requires this: "要求後端在 `SessionResponse` 新增 `isDesignationComplete: boolean` 欄位作為明確訊號".

**Frontend changes needed**:
- Add `isDesignationComplete: boolean` to `SessionResponse` in `lotteryDrawService.ts`.
- Replace all implicit `designatedWinningNumbers.length > 0` designation-done checks with `designationDone.value` computed ref.

**Source**: `spec-frontend.md` Clarifications Q6, FR-FE-001.

---

## Decision 5 — `triggerDesignationFromSession()` Probe Ticket

**Decision**: Use `availableTicketIds.value[0]` (first AVAILABLE ticket UUID) as the probe ticket for the draw call that triggers `designationRequired`.

**Rationale**:
- The backend will intercept the draw request with `designationRequired: true` before validating the specific ticket. Any valid AVAILABLE ticket UUID is sufficient to reach the designation gate.
- `availableTicketIds` is a computed ref already present in `IchibanDetail.vue` (line 670–674), filtered from `statusCards`.
- Guard: if `availableTicketIds.value.length === 0`, show info dialog "目前無可用格數，無法開始指定流程" and abort.

**Source**: `spec-frontend.md` Clarifications Q5, FR-FE-008, `IchibanDetail.vue` lines 670–674.

---

## Decision 6 — `POST /designate` Failure Handling

**Decision**: On API error, show error info dialog with backend message (or fallback "指定失敗，請稍後再試"), **do not forcibly close** `PrizeDesignationDialog`. The current `handleDesignatePrize` flow uses a sequential `for` loop over `grandPrizes` — on failure, catch the error and re-invoke `showDesignationUI` for the failing prize so the dialog stays alive.

**Implementation detail**: The `try/catch` wraps only the `designatePrizePositions` API call. On catch:
1. Show error info dialog.
2. Re-invoke `showDesignationUI(availableNumbers, prize.quantity, prize, usedNumbersSoFar)` for the same prize.
3. If user re-selects and the retry call succeeds, continue the outer `for` loop.

**Source**: `spec-frontend.md` Clarifications Q7, Edge Cases §`POST /designate` 失敗.

---

## Decision 7 — Concurrent Guard for Non-Opener Waiting

**Decision**: `handleScratchCardSelect()` and `handleScratchFromPanel()` check `showWaitingOverlay.value` at the top and return early if `true`. This is a UI-level soft block, not an absolute API block.

**Rationale**:
- Spec requirement: "並發保護：倒數期間，非開套玩家嘗試點格子，UI 應直接阻擋（顯示 toast 或 info dialog），不再呼叫 draw API 來被攔截".
- After the user **manually closes** the overlay, the guard is removed (`showWaitingOverlay.value = false`). The user can then attempt to scratch and will be re-intercepted by the draw API if the opener still hasn't designated — which re-shows the overlay. This matches the spec assumption: "非開套玩家關閉等待 overlay 後，若試圖點格子，`handleScratchCardSelect()` 應再次呼叫 draw，被後端攔截後重新顯示 overlay".

**Source**: `spec-frontend.md` FR-FE-009, Assumptions last bullet.

---

## Codebase Findings

### Key locations in `IchibanDetail.vue`

| Item | Line(s) | Notes |
|------|---------|-------|
| `session` ref | 353 | `ref<any>(null)` — will receive new `isDesignationComplete` and `designationDeadline` fields |
| `isOpener` computed | 405 | `!!session.value?.isOpener` — already correct |
| `isScratchMode` computed | 441–444 | Checks `playMode` (SCRATCH_MODE / SCRATCH_CARD_MODE), **not** `gameMode` |
| `availableTicketIds` | 670–674 | Filters AVAILABLE tickets, returns UUID array |
| `handleScratch()` `onSuccess` | 817–825 | `designationRequired` is handled at Step 1 — `awaitingDesignation` goes between Step 1 and Step 2 |
| `handleScratchCardSelect()` | 729–744 | `ensureCanDraw()` check is first; waiting guard goes immediately after |
| `handleScratchFromPanel()` | 1085–1091 | Loop over tickets; waiting guard goes before the loop |
| `reload()` | 1350–1380 | Session refresh at line 1373; post-session check goes after |
| `refreshSession()` | 1337–1348 | Updates `session.value` from `getLotterySession` |
| `handleDesignatePrize()` | 976–1050 | `designatePrizePositions` call at line 1029; wrap in try/catch |
| Vue imports | 281 | `onUnmounted` not imported — must be added |

### Key interface gap in `lotteryDrawService.ts`

`SessionResponse` (lines 86–98) is missing `designationDeadline` and `isDesignationComplete`. No type casting needed in the Vue component since `session` is `ref<any>`, but the interface extension documents the contract and enables TypeScript checks.

### Styling reference

Opener banner should match the `protection-badge` style (lines 1471–1508 of `IchibanDetail.vue`) — orange gradient instead of purple, font-awesome trophy icon instead of shield.
