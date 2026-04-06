# Tasks: 刮刮樂獎項規則修正 — 前台實作

**Input**: `specs/015-scratch-lottery-prize-rules/` (spec-frontend.md, plan-frontend.md, data-model.md, research.md, contracts/DesignationWaitingOverlay.md)  
**Branch**: `015-scratch-lottery-prize-rules`  
**Spec**: `spec-frontend.md` (NOT spec.md — backend)  
**Date**: 2026-04-06

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files or non-overlapping sections; no incomplete dependencies)
- **[Story]**: Which frontend user story this task belongs to (FE-1 … FE-4)
- Setup / Foundational tasks: no story label
- Every task includes an exact file path

---

## Phase 1: Setup

No new project scaffolding is required. This is a purely additive change to an existing Vue 3 SPA:
- No new npm dependencies (all timer logic uses native `setInterval`)
- No new directories (new component goes into existing `src/components/ichiban/`)
- No Vite / TypeScript config changes

**→ Proceed directly to Phase 2.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Interface extensions and the new standalone component that ALL user-story phases depend on. Tasks T001 and T002 are independent and can be worked in parallel; T003–T005 depend on T001 + T002 being complete.

**⚠️ CRITICAL**: Phases 3–5 cannot begin until T001–T005 are all merged / applied.

- [X] T001 [P] Extend `SessionResponse` interface in `src/services/lotteryDrawService.ts`: add `designationDeadline?: string | null` (ISO-8601; null = no active window or designation done) and `isDesignationComplete: boolean` (true = opener has designated; default false for backwards compat) immediately after the existing `cannotDrawReason` field (line 97). Also export the new `DesignationPendingResponse` interface — add it directly below the existing `DesignationRequiredResponse` interface (after line 67): `export interface DesignationPendingResponse { awaitingDesignation: true; message: string; openerDeadline: string; }` — note `awaitingDesignation: true` is a **literal type** (discriminant field, not `boolean`).

- [X] T002 [P] Create new SFC `src/components/ichiban/DesignationWaitingOverlay.vue` from scratch.
  1. **`<script setup lang="ts">`** — declare props `{ show: boolean; openerDeadline: string; message: string }` and emits `['close', 'expired']`.
  2. **Internal state**: `const remainingSeconds = ref(0)` and `let countdownTimer: ReturnType<typeof setInterval> | null = null`.
  3. **`displayTime` computed**: `${Math.floor(remainingSeconds.value / 60).toString().padStart(2, '0')}:${(remainingSeconds.value % 60).toString().padStart(2, '0')}`.
  4. **`startTimer()` function**: compute `remainingSeconds.value = Math.max(0, Math.floor((new Date(props.openerDeadline).getTime() - Date.now()) / 1000))`; if `≤ 0` immediately emit `'expired'` and return; otherwise `countdownTimer = setInterval(tick, 1000)`.
  5. **`stopTimer()` function**: `if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }`.
  6. **`tick()` function**: `remainingSeconds.value -= 1; if (remainingSeconds.value <= 0) { stopTimer(); emit('expired'); }`.
  7. **`watch(() => props.show, (val) => { if (val) startTimer(); else stopTimer(); })`** — so re-showing the overlay re-initialises the countdown from the current `openerDeadline`.
  8. **`onUnmounted(() => stopTimer())`**.
  9. **`<template>`**: full-screen fixed overlay wrapping a centred card —
     - Root `<div class="designation-waiting-overlay" v-if="show">` (fixed, inset 0, z-index 8000)
     - Inner backdrop `<div class="designation-waiting-overlay__backdrop">`
     - Card `<div class="designation-waiting-overlay__card">`:
       - `<div class="designation-waiting-overlay__icon">` containing `<font-awesome-icon :icon="['fas', 'clock']" />`
       - `<h2 class="designation-waiting-overlay__title">等待開套者指定大獎號碼</h2>`
       - `<div class="designation-waiting-overlay__timer">{{ displayTime }}</div>`
       - `<p class="designation-waiting-overlay__message">{{ message }}</p>`
       - `<KujiButton variant="secondary" @click="emit('close')">稍後再試</KujiButton>`
  10. **`<style scoped lang="scss">`** — dark theme matching existing `IchibanDetail` overlays:
      - `.designation-waiting-overlay`: `position: fixed; inset: 0; z-index: 8000; display: flex; align-items: center; justify-content: center;`
      - `.designation-waiting-overlay__backdrop`: `position: absolute; inset: 0; background: rgba(0, 0, 0, 0.85);`
      - `.designation-waiting-overlay__card`: `position: relative; background: #1a1a2e; border-radius: 16px; padding: 32px 24px; max-width: 360px; width: 90%; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;`
      - `.designation-waiting-overlay__icon`: `font-size: 2rem; color: #ffcc00;`
      - `.designation-waiting-overlay__title`: `font-size: 1.1rem; font-weight: 700; color: #ffffff; margin: 0;`
      - `.designation-waiting-overlay__timer`: `font-family: monospace; font-size: 3rem; color: #ffcc00; letter-spacing: 0.05em;`
      - `.designation-waiting-overlay__message`: `font-size: 0.9rem; color: #cccccc; margin: 0;`

- [X] T003 Add four new reactive state variables to `src/views/IchibanDetail.vue`
  ```typescript
  // === DesignationWaiting overlay state ===
  const showWaitingOverlay = ref(false);
  const waitingOpenerDeadline = ref('');
  const waitingMessage = ref('');
  let waitingPollInterval: ReturnType<typeof setInterval> | null = null;
  ```
  Note: `waitingPollInterval` is a plain `let` (not a `ref`) — it is a raw interval ID managed imperatively.

- [X] T004 Add two helper functions `showDesignationWaitingOverlay()` and `stopWaitingOverlay()` to `src/views/IchibanDetail.vue`
  ```typescript
  const stopWaitingOverlay = () => {
    if (waitingPollInterval) {
      clearInterval(waitingPollInterval);
      waitingPollInterval = null;
    }
    showWaitingOverlay.value = false;
  };

  const showDesignationWaitingOverlay = (deadline: string, message: string) => {
    waitingOpenerDeadline.value = deadline;
    waitingMessage.value = message;
    showWaitingOverlay.value = true;

    // 30-second polling: auto-close when opener completes designation
    if (waitingPollInterval) clearInterval(waitingPollInterval);
    waitingPollInterval = setInterval(async () => {
      await executeApi({
        fn: () => getLotterySession(kujiId.value),
        showCatchDialog: false,
        showFailDialog: false,
        onSuccess: (data: SessionResponse | null) => {
          if (data?.isDesignationComplete === true || data?.designationDeadline === null) {
            stopWaitingOverlay();
            reload();
          }
        },
      });
    }, 30_000);
  };
  ```
  Import `SessionResponse` at the top of the file if it is not already imported from `@/services/lotteryDrawService`.

- [X] T005 In `src/views/IchibanDetail.vue`, add `onUnmounted` to the Vue import
  ```typescript
  onUnmounted(() => {
    if (waitingPollInterval) {
      clearInterval(waitingPollInterval);
      waitingPollInterval = null;
    }
  });
  ```

**Checkpoint**: `T001`–`T005` complete — interfaces typed, new component exists, IchibanDetail has overlay state + helpers + cleanup. All user-story phases can now start.

---

## Phase 3: FE-2 — 非開套玩家等待 Overlay（Draw-Intercept 路徑）(Priority: P1)

**Goal**: When a non-opener player calls the draw API and receives `awaitingDesignation: true`, the overlay fires with a live countdown. Also wires up the overlay's `@close` and `@expired` event handlers. Covers FE-2 Acceptance Scenarios 1, 2, 4.

**Independent Test**:
1. In a dev environment, mock `handleScratch()`'s `onSuccess` to return `{ awaitingDesignation: true, openerDeadline: '<30 seconds from now>', message: '開套者正在指定' }`.
2. Confirm `DesignationWaitingOverlay` appears with a live countdown.
3. Wait for countdown to reach 0 → confirm `reload()` is called and an info dialog appears.
4. Re-trigger the overlay and click "稍後再試" → confirm overlay closes without calling `reload()`.

- [X] T006 [P] [FE-2] In `src/views/IchibanDetail.vue`, locate `handleScratch()` (around line 817). Insert `awaitingDesignation` branch.
  ```typescript
  // Step 1b: awaitingDesignation 攔截（非開套玩家等待中）
  if ((data as DesignationPendingResponse)?.awaitingDesignation === true) {
    showDesignationWaitingOverlay(
      (data as DesignationPendingResponse).openerDeadline,
      (data as DesignationPendingResponse).message || '開套者正在指定大獎位置，請稍候',
    );
    return;
  }
  ```
  Also add `DesignationPendingResponse` to the import from `@/services/lotteryDrawService` at the top of the file.

- [X] T007 [FE-2] In `src/views/IchibanDetail.vue`, add overlay event-handler functions and template component.
  ```typescript
  const onWaitingOverlayClose = () => {
    stopWaitingOverlay();
    // Do NOT reload — user dismissed voluntarily. Guard in handleScratchCardSelect
    // ensures scratch calls continue to hit the API and be re-intercepted if needed.
  };

  const onWaitingOverlayExpired = async () => {
    stopWaitingOverlay();
    await reload();
    await ichibanInfoDialog({
      title: '計時結束',
      content: '計時結束，您已可嘗試成為開套者，請重新進入抽獎流程。',
    });
  };
  ```
  Then, in the `<template>`, add the `<DesignationWaitingOverlay>` component at the **root level** of `<div class="ichibanDetail">` (as the last child, just before `</div>`):
  ```html
  <DesignationWaitingOverlay
    :show="showWaitingOverlay"
    :opener-deadline="waitingOpenerDeadline"
    :message="waitingMessage"
    @close="onWaitingOverlayClose"
    @expired="onWaitingOverlayExpired"
  />
  ```
  Also add the import at the top of `<script setup>`:
  ```typescript
  import DesignationWaitingOverlay from '@/components/ichiban/DesignationWaitingOverlay.vue';
  ```

**Checkpoint**: FE-2 draw-intercept path fully wired. Non-opener players who trigger `handleScratch()` and receive `awaitingDesignation: true` will now see the overlay, can close it, and when the timer expires the page reloads.

---

## Phase 4: FE-1 — 開套玩家進場橫幅（Opener Proactive Banner）(Priority: P1)

**Goal**: When a SCRATCH_PLAYER opener loads the page and `isDesignationComplete` is false, a prominent orange banner appears with a "立即指定" button that directly opens the prize designation flow. Covers FE-1 Acceptance Scenarios 1, 2, 3.

**Independent Test**:
1. Mock `session.value` to `{ isOpener: true, isDesignationComplete: false, designationDeadline: '<future>' }` and `detail.value.gameMode = 'SCRATCH_PLAYER'`.
2. Confirm the `.ichibanDetail__designation-banner` is visible with "立即指定" button.
3. Click "立即指定" → mock `availableTicketIds.value = ['uuid-1']` → confirm `drawLottery()` is called with `{ count: 1, ticket: ['uuid-1'] }`.
4. Mock `isDesignationComplete: true` → confirm banner disappears.

- [X] T008 [P] [FE-1] In `src/views/IchibanDetail.vue` `<script setup>`, add `designationDone` and `showOpenerBanner` computed properties.
  ```typescript
  /** 開套者是否已完成指定 — 後端明確訊號，取代 designatedWinningNumbers.length 判斷 */
  const designationDone = computed(
    () => session.value?.isDesignationComplete === true,
  );

  /** 顯示「請立即指定」橫幅的條件 */
  const showOpenerBanner = computed(
    () =>
      isScratchMode.value &&
      String(detail.value?.gameMode ?? '').toUpperCase() === 'SCRATCH_PLAYER' &&
      (session.value?.isOpener === true) &&
      !designationDone.value,
  );
  ```
  Note: `isScratchMode` is already a computed at lines 441-444 (checks `playMode`, NOT `gameMode`). `showOpenerBanner` additionally checks `gameMode === 'SCRATCH_PLAYER'` to guard against SCRATCH_STORE openers.

- [X] T009 [FE-1] In `src/views/IchibanDetail.vue` `<script setup>`, add `triggerDesignationFromSession()` function.
  ```typescript
  const triggerDesignationFromSession = async () => {
    const probeTicketId = availableTicketIds.value[0];
    if (!probeTicketId) {
      await ichibanInfoDialog({
        title: '提示訊息',
        content: '目前無可用格數，無法開始指定流程。',
      });
      return;
    }

    await executeApi({
      fn: () => drawLottery(kujiId.value, { count: 1, ticket: [probeTicketId] }),
      onSuccess: async (data: any) => {
        if (data?.designationRequired === true) {
          await handleDesignatePrize(
            data.availableNumbers ?? [],
            data.grandPrizes ?? [],
          );
        }
      },
      onFail: async () => {
        await ichibanInfoDialog({
          title: '錯誤',
          content: '無法取得指定流程資訊，請稍後再試。',
        });
      },
    });
  };
  ```
  (`availableTicketIds` is the existing computed at lines 670-674 that returns UUID strings for all AVAILABLE tickets. `handleDesignatePrize` is the existing function at lines 976-1050. `drawLottery`, `executeApi`, `ichibanInfoDialog`, `kujiId` are all already in scope.)

- [X] T010 [FE-1] In `src/views/IchibanDetail.vue` `<template>`, insert opener designation banner after protection-badge block.
  ```html
  <!-- 開套者指定大獎橫幅 (FE-1) -->
  <div v-if="showOpenerBanner" class="ichibanDetail__designation-banner">
    <div class="designation-badge">
      <span class="designation-icon" aria-hidden="true">
        <font-awesome-icon :icon="['fas', 'trophy']" />
      </span>
      <div class="designation-content">
        <div class="designation-title">指定大獎號碼</div>
        <div class="designation-message">
          您是開套者，請先指定大獎號碼才能開始抽獎。
        </div>
      </div>
      <KujiButton variant="primary" size="sm" @click="triggerDesignationFromSession">
        立即指定
      </KujiButton>
    </div>
  </div>
  ```

- [X] T011 [P] [FE-1] In `src/views/IchibanDetail.vue` `<style scoped lang="scss">`, add banner SCSS after protection-badge styles.
  ```scss
  // === 開套者指定大獎橫幅 (FE-1) ===
  .ichibanDetail__designation-banner {
    margin: 8px 0;
  }

  .designation-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
    border-radius: 12px;
    color: #fff;
  }

  .designation-icon {
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .designation-content {
    flex: 1;
    min-width: 0;
  }

  .designation-title {
    font-size: 0.85rem;
    font-weight: 700;
    opacity: 0.9;
  }

  .designation-message {
    font-size: 0.8rem;
    margin-top: 2px;
    line-height: 1.4;
  }
  ```

**Checkpoint**: FE-1 complete. `SCRATCH_PLAYER` openers see the orange banner on page load. Clicking "立即指定" triggers the existing `handleDesignatePrize` flow.

---

## Phase 5: FE-4 — 頁面載入主動偵測 + 前置阻擋（Proactive Page-Load + Guard）(Priority: P1)

**Goal**: When the page loads (or reloads) and `session` shows a non-opener with an active `designationDeadline`, proactively show the waiting overlay immediately — without the user needing to attempt a scratch first. Also adds pre-flight guards so that while the overlay is visible, scratch attempts are silently blocked at the UI layer. Covers FE-4 Acceptance Scenarios 1, 2, 3.

**Independent Test**:
1. Mock `session.value = { isOpener: false, isDesignationComplete: false, designationDeadline: '<3 minutes from now>' }` and `detail.value.gameMode = 'SCRATCH_PLAYER'`.
2. Call `reload()` manually → confirm `DesignationWaitingOverlay` becomes visible without any user interaction.
3. Mock poll returning `{ isDesignationComplete: true }` → confirm overlay auto-closes and `reload()` fires.
4. While `showWaitingOverlay.value === true`, call `handleScratchCardSelect('some-ticket-id')` → confirm it returns early without calling `drawLottery`.

- [X] T012 [FE-4] In `src/views/IchibanDetail.vue`, extend `reload()` with proactive SCRATCH_PLAYER waiting check.
  ```typescript
  // Proactive SCRATCH_PLAYER waiting / opener check (FE-4 + FE-6)
  const gameModeForCheck = detail.value?.gameMode as string | undefined;
  if (gameModeForCheck?.toUpperCase() === 'SCRATCH_PLAYER' && session.value) {
    const deadline = session.value.designationDeadline;
    const isOpenerLocal = session.value.isOpener === true;
    const designationDoneLocal = session.value.isDesignationComplete === true;

    if (!designationDoneLocal && deadline && new Date(deadline) > new Date()) {
      if (!isOpenerLocal && !showWaitingOverlay.value) {
        // Non-opener: proactively show waiting overlay
        showDesignationWaitingOverlay(deadline, '開套者正在指定大獎位置，請稍候。');
      }
      // Opener: showOpenerBanner computed handles banner display reactively
    }
  }
  ```

- [X] T013 [P] [FE-4] In `src/views/IchibanDetail.vue`, add pre-flight guards in `handleScratchCardSelect` and `handleScratchFromPanel`.

  **Location 1** — `handleScratchCardSelect()` (around line 729): After the existing `ensureCanDraw()` check and its early-return, add:
  ```typescript
  // Pre-flight: block draw while waiting overlay is visible (FE-4 FR-FE-009)
  if (showWaitingOverlay.value) return;
  ```

  **Location 2** — `handleScratchFromPanel()` (around line 1085): At the very top of the function body, before the for-loop over tickets, add:
  ```typescript
  // Pre-flight: block draw while waiting overlay is visible (FE-4 FR-FE-009)
  if (showWaitingOverlay.value) return;
  ```

  Both guards implement a **soft UI block**: when the user dismisses the overlay, the guard is lifted and subsequent scratch attempts will call `drawLottery()` normally, which allows the backend to re-intercept and re-show the overlay if the opener still hasn't designated (per spec Assumptions last bullet).

**Checkpoint**: FE-4 complete. Non-opener players entering the page now see the overlay immediately. Scratch attempts while overlay is open are dropped at the UI layer.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Harden error paths that affect multiple user stories; final build verification.

- [X] T014 In `src/views/IchibanDetail.vue`, harden `handleDesignatePrize()` with try/catch for `designatePrizePositions` failure.

  ```typescript
  // Before (approximate existing code):
  const designateResult = await designatePrizePositions(kujiId.value, { designations });
  // ... success path ...

  // After:
  let designateResult: any;
  try {
    designateResult = await designatePrizePositions(kujiId.value, { designations });
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      '指定失敗，請稍後再試。';
    await ichibanInfoDialog({ title: '指定失敗', content: msg });
    // Re-invoke showDesignationUI for the same prize so dialog stays alive:
    await showDesignationUI(availableNumbers, prize.quantity, prize, usedNumbersSoFar);
    continue; // skip the success-path for this prize, let the outer for-loop re-handle
  }
  ```

  This change ensures that a network error or backend rejection on `POST /designate` displays an error info dialog while leaving `PrizeDesignationDialog` open, letting the opener fix their selection and retry without losing the 10-minute designation window (per spec Edge Cases and Clarifications Q7).

- [X] T015 Run `yarn build` — ✅ Exit code 0, zero errors, `dist/` generated successfully.
  - Exit code 0
  - Zero TypeScript errors
  - Zero Vue template compilation errors
  - `dist/` output generated successfully
  If errors occur, fix them before closing this task. Common issues to check: missing `DesignationPendingResponse` import in `IchibanDetail.vue`; `onUnmounted` not added to Vue import line; `SessionResponse` type mismatch in poll callback.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 2 — Foundational (T001–T005)
    ├── T001 [P] + T002 [P]   ← no deps; start immediately in parallel
    ├── T003                  ← depends on T001, T002 being complete
    ├── T004                  ← depends on T003
    └── T005                  ← depends on T003

Phase 3 — FE-2 (T006, T007)
    ├── T006 [P]              ← depends on T001 (DesignationPendingResponse type), T004
    └── T007                  ← depends on T002 (component exists), T004

Phase 4 — FE-1 (T008, T009, T010, T011)
    ├── T008 [P]              ← depends on T003 (session refs in scope)
    ├── T009                  ← depends on T008 (designationDone computed)
    ├── T010                  ← depends on T009 (triggerDesignationFromSession in scope)
    └── T011 [P]              ← depends on T010 (CSS class names established)

Phase 5 — FE-4 (T012, T013)
    ├── T012                  ← depends on T004 (showDesignationWaitingOverlay), T008 (designationDone)
    └── T013 [P]              ← depends on T003 (showWaitingOverlay ref)

Phase 6 — Polish (T014, T015)
    ├── T014                  ← depends on T003–T004 (overlay helpers in scope)
    └── T015                  ← depends on T001–T014 all applied
```

### User Story Dependencies

| Story | Prerequisite Phase | Can Run in Parallel With |
|-------|--------------------|--------------------------|
| FE-2 (P1) — Overlay draw-intercept | Phase 2 (T001–T005) | FE-1, FE-4 |
| FE-1 (P1) — Opener banner | Phase 2 (T001–T005) | FE-2, FE-4 |
| FE-3 (P1) — SessionResponse fields | Covered by T001 (foundational) | — |
| FE-4 (P1) — Proactive page-load | Phase 2 + T008 (designationDone) | FE-2 |

---

## Parallel Execution Examples

### Phase 2 — Start T001 and T002 simultaneously

```
Task A (T001): Edit src/services/lotteryDrawService.ts
  → Add designationDeadline + isDesignationComplete to SessionResponse
  → Add DesignationPendingResponse export

Task B (T002): Create src/components/ichiban/DesignationWaitingOverlay.vue
  → Write full SFC from scratch (script + template + style)

Both complete → then start T003 in IchibanDetail.vue
```

### Phase 4 — T008 and T011 can proceed in parallel

```
Task A (T008): Add designationDone + showOpenerBanner computeds to script section
Task B (T011): Add SCSS for .designation-badge to style section
  (non-overlapping sections of the same file)
→ After both: start T009 (function needs T008 computed) → T010 (template needs T009 fn)
```

---

## Implementation Strategy

### MVP Scope (All Stories are P1 — deliver together)

All four frontend user stories (FE-1 through FE-4) are Priority 1 and tightly coupled through shared state (`showWaitingOverlay`, `designationDone`). The recommended delivery order:

1. **Complete Phase 2** (T001–T005) — foundation for everything
2. **Complete Phase 3** (T006–T007) — FE-2 draw-intercept: soonest user-visible fix
3. **Complete Phase 4** (T008–T011) — FE-1 opener banner
4. **Complete Phase 5** (T012–T013) — FE-4 proactive page-load
5. **Complete Phase 6** (T014–T015) — Polish + build confirm

### Validation Checklist (manual, after T015 passes)

- [ ] `SCRATCH_PLAYER` 商品、開套者進頁面 → 橙色「立即指定」橫幅顯示（FE-1 SC1）
- [ ] 點「立即指定」→ `PrizeDesignationDialog` 打開（FE-1 SC2）
- [ ] 指定完成後橫幅消失，正常刮格（FE-1 SC3）
- [ ] 非開套玩家進頁面（有 `designationDeadline`）→ 自動顯示等待 overlay（FE-4 SC1）
- [ ] 等待 overlay 可手動關閉，polling 停止（FE-4 SC2）
- [ ] Poll 偵測到 `isDesignationComplete: true` → overlay 自動關閉 + `reload()`（FE-4 SC3）
- [ ] 非開套玩家點格子觸發 draw → `awaitingDesignation: true` → overlay 顯示（FE-2 SC1）
- [ ] 倒數歸零 → 自動 `reload()` + info dialog（FE-2 SC2）
- [ ] `SCRATCH_STORE` 商品進頁面 → 無指定相關 UI（SC-FE-004）
- [ ] 一番賞 / 扭蛋現有流程正常（SC-FE-005）
- [ ] `POST /designate` 失敗 → 顯示錯誤 dialog，`PrizeDesignationDialog` 保持開啟（Edge Case）

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 15 (T001–T015) |
| Files modified | 2 (`lotteryDrawService.ts`, `IchibanDetail.vue`) |
| Files created | 1 (`DesignationWaitingOverlay.vue`) |
| Tasks by story | FE-2: T006–T007 (2) · FE-1: T008–T011 (4) · FE-4: T012–T013 (2) |
| Foundational tasks | T001–T005 (5, no story label) |
| Polish tasks | T014–T015 (2, no story label) |
| Parallelisable tasks [P] | T001, T002, T006, T008, T011, T013 (6) |
| Tests generated | None (not requested in spec; `spec-frontend.md` marks testing as out of scope) |
| MVP scope | All 4 user stories are P1 — deliver together |

---

## Notes

- `[P]` tasks touch different files or non-overlapping sections of the same file
- `[FE-N]` label maps each task to `spec-frontend.md` user story
- `waitingPollInterval` is a plain `let`, **not** a `ref` — imperative management only
- `designationDone` (computed) **replaces** all previous `designatedWinningNumbers.length > 0` designation-done checks — if other spots in `IchibanDetail.vue` use that pattern for gate-keeping, update them too
- The `DesignationWaitingOverlay` uses `z-index: 8000` — below Pinia overlay at `9999` — so draw result dialogs can still appear on top
- After each task, commit incrementally; each phase checkpoint is a safe merge point
