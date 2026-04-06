# Implementation Plan: 刮刮樂獎項規則修正 — 前台

**Branch**: `015-scratch-lottery-prize-rules` | **Date**: 2026-04-06 | **Spec**: `specs/015-scratch-lottery-prize-rules/spec-frontend.md`

---

## Summary

Implement three interlocking frontend features to support the backend's `SCRATCH_PLAYER` designation flow:

1. **`DesignationWaitingOverlay` component** — full-screen countdown timer for non-opener players waiting for the opener to designate prize positions. Includes 30-second session polling that auto-closes the overlay when the opener completes designation.
2. **Opener "designate now" banner** — proactive warning strip in `IchibanDetail.vue` shown to the opener on page load when `SCRATCH_PLAYER` mode and designation is not yet complete, with a one-click button that fires `triggerDesignationFromSession()`.
3. **`SessionResponse` interface extension** — add `designationDeadline?: string | null` and `isDesignationComplete: boolean` so the page can proactively determine waiting/opener state on load without needing a draw API round-trip.

The feature also hardens the `handleScratch()` `onSuccess` path to handle the new `awaitingDesignation: true` response, and adds a pre-flight guard in `handleScratchCardSelect()` / `handleScratchFromPanel()` to block draw calls while the overlay is visible.

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Vue 3.4 (Composition API), Vite 5, SCSS (scoped per-component)  
**Storage**: N/A (frontend only; state is in-memory `ref`s)  
**Testing**: Vitest (unit), Playwright (e2e) — no existing test suite for these components; tests are out of scope for this plan  
**Target Platform**: Browser (SPA, served via Vite/Nginx)  
**Project Type**: Vue 3 SPA frontend  
**Performance Goals**: Countdown timer accuracy ≤ ±5 s; overlay auto-close latency ≤ 30 s after opener completes designation  
**Constraints**: No new runtime dependencies; all timer logic via native `setInterval`; cleanup on `onUnmounted`  
**Scale/Scope**: 2 files modified (`lotteryDrawService.ts`, `IchibanDetail.vue`), 1 new SFC (`DesignationWaitingOverlay.vue`)

---

## Constitution Check

*Constitution file is an unfilled template — no project-specific gates are defined. Standard Vue 3 / TypeScript conventions apply:*

| Gate | Status | Notes |
|------|--------|-------|
| No new runtime npm dependencies | ✅ PASS | Using native `setInterval`, Vue reactivity, existing SCSS variables |
| Single-file component pattern (`.vue` with `<script setup lang="ts">`) | ✅ PASS | All new code follows existing SFC pattern |
| No `any` in new interfaces | ✅ PASS | All new `SessionResponse` fields are typed; `DesignationWaitingOverlay` props are fully typed |
| Existing `designatedWinningNumbers` banner logic unaffected | ✅ PASS | `designationDone` check replaced by `isDesignationComplete`, which is a cleaner signal; old `designatedWinningNumbers.length` template guard untouched |
| SCRATCH_STORE / LOTTERY_MODE / GACHA flows unaffected | ✅ PASS | All new logic guarded by `gameMode === 'SCRATCH_PLAYER'` check |

---

## Project Structure

### Documentation (this feature)

```text
specs/015-scratch-lottery-prize-rules/
├── plan.md              # Backend implementation plan (existing)
├── plan-frontend.md     # This file — frontend implementation plan
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── DesignationWaitingOverlay.md   # Component API contract
```

### Source Code (repository root)

```text
src/
├── services/
│   └── lotteryDrawService.ts          # MODIFY: extend SessionResponse + add DesignationPendingResponse
├── views/
│   └── IchibanDetail.vue              # MODIFY: overlay state, polling, opener banner, guard
└── components/
    └── ichiban/
        └── DesignationWaitingOverlay.vue  # NEW: countdown overlay component
```

**Structure Decision**: Single-project Vue SPA. No new directories needed; new component goes in the existing `src/components/ichiban/` directory alongside `IchibanScratchStatusGrid.vue` and `IchibanScratchPanel.vue`.

---

## Phase 0 Research Summary

→ See `research.md` for full findings.

All unknowns from the spec were already resolved in the Clarifications section (`Session 2026-04-06`). Key decisions:

| Decision | Rationale |
|----------|-----------|
| `DesignationWaitingOverlay` is a standalone SFC (not using the Pinia `useOverlayStore`) | The Pinia overlay store is a singleton — it can only show one overlay at a time and uses a shared backdrop. The waiting overlay must coexist with normal page content and be controlled locally by `IchibanDetail.vue`. |
| Countdown via `setInterval` (1 000 ms) | Native, no deps, well-supported. Component clears interval on `onUnmounted` and when `expired`/`close` fires. |
| `designationDone` signal = `session.value?.isDesignationComplete === true` | Single, explicit boolean from backend avoids `designatedWinningNumbers.length > 0` ambiguity on partial/corrupt data. |
| Session polling at 30 s | Conservative; per spec. Uses `setInterval` cleared in same cleanup block as countdown. |
| Opener uses `availableTicketIds.value[0]` as probe UUID | Per clarification: cheapest path to trigger `designationRequired` response from backend without needing a separate API. Guard: if no AVAILABLE tickets, show info dialog and abort. |
| `POST /designate` failure keeps `PrizeDesignationDialog` open | Per clarification: avoids wasting 10-minute designation window; user can fix and retry. |

---

## Phase 1 Design

→ See `data-model.md` for interface definitions and state model.  
→ See `contracts/DesignationWaitingOverlay.md` for component API.  
→ See `quickstart.md` for development setup and manual testing checklist.

### FR-FE-001 — `lotteryDrawService.ts` changes

**`SessionResponse`** — add two fields:

```typescript
export interface SessionResponse {
  // ... existing fields unchanged ...
  designationDeadline?: string | null;  // ISO-8601; null = no active designation window
  isDesignationComplete: boolean;       // true = opener has designated prize numbers
}
```

**`DesignationPendingResponse`** — new export:

```typescript
export interface DesignationPendingResponse {
  awaitingDesignation: true;
  message: string;
  openerDeadline: string; // ISO-8601
}
```

---

### FR-FE-002 — `DesignationWaitingOverlay.vue` (new file)

Path: `src/components/ichiban/DesignationWaitingOverlay.vue`

**Props**:
```typescript
props: {
  show: boolean,            // v-if gate
  openerDeadline: string,   // ISO-8601 countdown target
  message: string,          // backend hint text
}
```

**Emits**:
```typescript
emits: ['close', 'expired']
```

**Internal state**:
```typescript
const remainingSeconds = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;
```

**Key logic**:
- `watch(() => props.show)` → when `true`, compute `remainingSeconds = Math.max(0, Math.floor((new Date(props.openerDeadline).getTime() - Date.now()) / 1000))`, start `setInterval(tick, 1000)`
- `tick()`: decrement `remainingSeconds`; when `≤ 0`, clear interval, emit `'expired'`
- Close button: clear interval, emit `'close'`
- `onUnmounted`: clear interval
- `displayTime` computed: `MM:SS` format from `remainingSeconds`
- If `remainingSeconds === 0` on mount (deadline already past): immediately emit `'expired'` without showing countdown

**UI elements** (scoped SCSS, dark overlay theme):
- Full-screen fixed overlay, `z-index: 8000` (below Pinia overlay at 9999)
- `rgba(0,0,0,0.85)` backdrop
- Centred card with:
  - 大型倒數計時器 (`MM:SS`)
  - Title: `等待開套者指定大獎號碼`
  - Subtitle (from `message` prop)
  - `稍後再試` close button (secondary style matching `KujiButton variant="secondary"`)

---

### FR-FE-003 — `IchibanDetail.vue` changes

#### New state refs

```typescript
const showWaitingOverlay = ref(false);
const waitingOpenerDeadline = ref('');
const waitingMessage = ref('');
let waitingPollInterval: ReturnType<typeof setInterval> | null = null;
```

#### `onUnmounted` cleanup

```typescript
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
// ...
onUnmounted(() => {
  if (waitingPollInterval) {
    clearInterval(waitingPollInterval);
    waitingPollInterval = null;
  }
});
```

#### Helper: `showDesignationWaitingOverlay(deadline, message)`

```typescript
const showDesignationWaitingOverlay = (deadline: string, message: string) => {
  waitingOpenerDeadline.value = deadline;
  waitingMessage.value = message;
  showWaitingOverlay.value = true;

  // Start 30s polling to detect early completion
  if (waitingPollInterval) clearInterval(waitingPollInterval);
  waitingPollInterval = setInterval(async () => {
    await executeApi({
      fn: () => getLotterySession(kujiId.value),
      showCatchDialog: false,
      showFailDialog: false,
      onSuccess: (data: any) => {
        if (data?.designationDeadline === null || data?.isDesignationComplete === true) {
          stopWaitingOverlay();
          reload();
        }
      },
    });
  }, 30_000);
};
```

#### Helper: `stopWaitingOverlay()`

```typescript
const stopWaitingOverlay = () => {
  if (waitingPollInterval) {
    clearInterval(waitingPollInterval);
    waitingPollInterval = null;
  }
  showWaitingOverlay.value = false;
};
```

#### Overlay event handlers

```typescript
const onWaitingOverlayClose = () => {
  stopWaitingOverlay();
  // Do NOT reload — user dismissed voluntarily
};

const onWaitingOverlayExpired = async () => {
  stopWaitingOverlay();
  await reload();
  await ichibanInfoDialog({
    title: '計時結束',
    content: '計時結束，您已可嘗試成為開套者，請重新進入抽獎流程',
  });
};
```

#### `handleScratch()` — add `awaitingDesignation` branch

In the `onSuccess` callback, **after** the `designationRequired` check and **before** `Array.isArray(data?.results)`:

```typescript
// Step 1b: awaitingDesignation 攔截（非開套玩家等待中）
if (data?.awaitingDesignation === true) {
  showDesignationWaitingOverlay(data.openerDeadline, data.message || '開套者正在指定大獎位置，請稍候');
  return;
}
```

#### `handleScratchCardSelect()` — pre-flight guard

At the top of the function, after the `ensureCanDraw()` check:

```typescript
if (showWaitingOverlay.value) return; // already waiting, do not call draw
```

#### `handleScratchFromPanel()` — pre-flight guard

At the top of `handleScratchFromPanel`, before the loop:

```typescript
if (showWaitingOverlay.value) return;
```

#### `reload()` — post-session proactive waiting check

After `await refreshSession()` completes, append:

```typescript
// Proactive SCRATCH_PLAYER waiting / opener check
const gameMode = detail.value?.gameMode;
if (gameMode === 'SCRATCH_PLAYER' && session.value) {
  const deadline = session.value.designationDeadline;
  const isOpenerLocal = session.value.isOpener;
  const designationDone = session.value.isDesignationComplete === true;

  if (!designationDone && deadline && new Date(deadline) > new Date()) {
    if (!isOpenerLocal && !showWaitingOverlay.value) {
      showDesignationWaitingOverlay(deadline, '開套者正在指定大獎位置，請稍候');
    }
    // isOpenerLocal → opener banner shown via computed (see below)
  }
}
```

#### `triggerDesignationFromSession()` — new function

```typescript
const triggerDesignationFromSession = async () => {
  const probeTicketId = availableTicketIds.value[0];
  if (!probeTicketId) {
    await ichibanInfoDialog({
      title: '提示訊息',
      content: '目前無可用格數，無法開始指定流程',
    });
    return;
  }

  await executeApi({
    fn: () => drawLottery(kujiId.value, { count: 1, ticket: [probeTicketId] }),
    onSuccess: async (data: any) => {
      if (data?.designationRequired) {
        await handleDesignatePrize(data.availableNumbers || [], data.grandPrizes || []);
      }
    },
    onFail: async () => {
      await ichibanInfoDialog({ title: '錯誤', content: '無法取得指定流程資訊，請稍後再試' });
    },
  });
};
```

#### `designationDone` computed

```typescript
const designationDone = computed(() => session.value?.isDesignationComplete === true);
```

#### `showOpenerBanner` computed

```typescript
const showOpenerBanner = computed(() =>
  isScratchMode.value &&
  String(detail.value?.gameMode ?? '').toUpperCase() === 'SCRATCH_PLAYER' &&
  isOpener.value &&
  !designationDone.value,
);
```

#### `handleDesignatePrize()` — error handling improvement

Wrap the `designatePrizePositions` call in try/catch to keep `PrizeDesignationDialog` open on failure:

```typescript
try {
  const designateResult = await designatePrizePositions(kujiId.value, { designations });
  // ... success path unchanged ...
} catch (err: any) {
  const msg = err?.response?.data?.message || err?.message || '指定失敗，請稍後再試';
  await ichibanInfoDialog({ title: '指定失敗', content: msg });
  // Do NOT return — keep dialog open by not calling overlay.close() here
  // The outer finally will still close the overlay; re-show designation UI
  // Actually: we need to NOT close the dialog here, just show error and let user retry
  // Re-open the designation UI for the last prize is complex; instead show toast + keep overlay open
  return; // exits handleDesignatePrize, overlay.close() in finally will run
}
```

> **Note**: The spec says the dialog must stay open. The current `handleDesignatePrize` wraps everything in `overlay.open()` / `overlay.close()`. On failure, we show the error dialog and return early — `overlay.close()` in the `finally` block will fire. To truly keep `PrizeDesignationDialog` open (since it is already hidden inside `handleDesignatePrize`'s sequential UI), we need to re-invoke `showDesignationUI` for the failed prize. See `data-model.md` §State Transitions for the exact retry pattern.

#### Template additions

```html
<!-- Opener designation banner (inside ichibanDetail__info aside, after protection badge) -->
<div v-if="showOpenerBanner" class="ichibanDetail__designation-banner">
  <div class="designation-badge">
    <span class="designation-icon" aria-hidden="true">
      <font-awesome-icon :icon="['fas', 'trophy']" />
    </span>
    <div class="designation-content">
      <div class="designation-title">指定大獎號碼</div>
      <div class="designation-message">您是開套者，請先指定大獎號碼才能開始抽獎</div>
    </div>
    <KujiButton variant="primary" @click="triggerDesignationFromSession">
      立即指定
    </KujiButton>
  </div>
</div>

<!-- Waiting overlay (at root of <div class="ichibanDetail">) -->
<DesignationWaitingOverlay
  :show="showWaitingOverlay"
  :opener-deadline="waitingOpenerDeadline"
  :message="waitingMessage"
  @close="onWaitingOverlayClose"
  @expired="onWaitingOverlayExpired"
/>
```

---

## Complexity Tracking

No constitution violations. No new architecture complexity introduced — all logic is additive to existing patterns.

---

## Task List (ordered by dependency)

| ID | Title | Files | Depends On |
|----|-------|-------|------------|
| `T01` | Extend `SessionResponse` + add `DesignationPendingResponse` | `lotteryDrawService.ts` | — |
| `T02` | Create `DesignationWaitingOverlay.vue` component | new SFC | — |
| `T03` | Add waiting overlay state refs + helpers to `IchibanDetail.vue` | `IchibanDetail.vue` | T01, T02 |
| `T04` | Add `awaitingDesignation` branch in `handleScratch()` | `IchibanDetail.vue` | T03 |
| `T05` | Add pre-flight guards in `handleScratchCardSelect` + `handleScratchFromPanel` | `IchibanDetail.vue` | T03 |
| `T06` | Add `designationDone` + `showOpenerBanner` computed; `triggerDesignationFromSession()` | `IchibanDetail.vue` | T03 |
| `T07` | Extend `reload()` with proactive waiting/opener check | `IchibanDetail.vue` | T03, T06 |
| `T08` | Add opener banner + `DesignationWaitingOverlay` to template | `IchibanDetail.vue` | T06, T02 |
| `T09` | Harden `handleDesignatePrize()` with try/catch for `POST /designate` failure | `IchibanDetail.vue` | T03 |
| `T10` | Import `onUnmounted` + add cleanup block | `IchibanDetail.vue` | T03 |
| `T11` | Build verification (`yarn build` or `vite build`) | — | T01–T10 |
