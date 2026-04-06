# Component Contract: `DesignationWaitingOverlay`

**Path**: `src/components/ichiban/DesignationWaitingOverlay.vue`  
**Feature**: `015-scratch-lottery-prize-rules` (Frontend)

---

## Overview

Full-screen overlay displayed to **non-opener players** in `SCRATCH_PLAYER` mode while waiting for the opener to designate prize numbers. Shows a live countdown timer (`MM:SS`) and a close button. Emits `expired` when the deadline passes and `close` when the user dismisses it manually.

---

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `show` | `boolean` | ✅ | — | Controls overlay visibility. Use `v-if` or `v-show` on the root element keyed to this prop. When `show` changes from `false` → `true`, the countdown is (re-)initialised from `openerDeadline`. |
| `openerDeadline` | `string` | ✅ | — | ISO-8601 timestamp. The countdown counts down to this target. Example: `"2026-04-06T10:15:00.000Z"`. If this timestamp is already in the past when the component mounts with `show = true`, the component immediately emits `expired`. |
| `message` | `string` | ✅ | — | Descriptive text displayed below the countdown. Comes directly from the backend `DesignationPendingResponse.message`. Example: `"開套玩家正在指定大獎位置，請稍候"`. |

---

## Emits

| Event | Payload | Trigger condition |
|-------|---------|------------------|
| `close` | — | User clicks the 「稍後再試」 button. The parent should call `stopWaitingOverlay()` which sets `showWaitingOverlay = false` and clears the poll interval. **Does NOT trigger a page reload.** |
| `expired` | — | Internal countdown reaches `remainingSeconds ≤ 0`. The parent should call `stopWaitingOverlay()`, call `reload()`, and show a toast/info dialog. |

---

## Internal Behaviour

### Timer Lifecycle

1. `watch(() => props.show)`:
   - `true`: compute `remainingSeconds = Math.max(0, Math.floor((new Date(props.openerDeadline).getTime() - Date.now()) / 1000))`. If `≤ 0`, emit `expired` immediately (no countdown shown). Otherwise start `setInterval(tick, 1000)`.
   - `false` or `undefined`: call `stopTimer()` (clear the interval).

2. `tick()` (called every 1 000 ms):
   - Decrement `remainingSeconds` by 1.
   - If `remainingSeconds ≤ 0`: call `stopTimer()`, emit `'expired'`.

3. `onUnmounted`: always call `stopTimer()`.

### Display Format

- `displayTime` computed: `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`

---

## UI Structure

```
.designation-waiting-overlay         (fixed, inset 0, z-index 8000)
  .designation-waiting-overlay__backdrop   (rgba(0,0,0,0.85), full bleed)
  .designation-waiting-overlay__card       (centred, max-width 360px)
    .designation-waiting-overlay__icon     (⏳ or clock icon)
    h2.designation-waiting-overlay__title  "等待開套者指定大獎號碼"
    .designation-waiting-overlay__timer    displayTime  (large mono font)
    p.designation-waiting-overlay__message {{ message }}
    KujiButton(variant="secondary" @click="emit('close')")  "稍後再試"
```

---

## SCSS Guidelines

- `z-index: 8000` — below Pinia global overlay (`9999`) so draw result dialogs still appear on top.
- Background: `rgba(0, 0, 0, 0.85)` — matches `DesignationWaitingOverlay` dark theme in spec.
- Timer font: `font-family: monospace`, `font-size: 3rem`, `color: #ffcc00` (gold, high contrast on dark bg).
- Card: `background: #1a1a2e`, `border-radius: 16px`, `padding: 32px 24px`.

---

## Usage in `IchibanDetail.vue`

```html
<DesignationWaitingOverlay
  :show="showWaitingOverlay"
  :opener-deadline="waitingOpenerDeadline"
  :message="waitingMessage"
  @close="onWaitingOverlayClose"
  @expired="onWaitingOverlayExpired"
/>
```

```typescript
import DesignationWaitingOverlay from '@/components/ichiban/DesignationWaitingOverlay.vue';
```

---

## Acceptance Criteria Mapping

| AC | Test signal |
|----|------------|
| FE-2 SC1: Shows overlay with countdown when `awaitingDesignation: true` | `showWaitingOverlay.value === true` after draw intercept |
| FE-2 SC2: `@expired` fires when countdown reaches 0 | `remainingSeconds` reaches 0 → `expired` emitted |
| FE-2 SC4: `@close` fires when user dismisses | Click 稍後再試 → `close` emitted |
| FE-4 SC1: Overlay auto-shown on page load | `reload()` post-session check → `showDesignationWaitingOverlay` called |
| FE-4 SC3: Poll detects early completion | `setInterval` poll → `isDesignationComplete: true` → `close` + `reload()` |
| SC-FE-003: Countdown accuracy ≤ 5 s | `setInterval(1000)` with upfront `Math.floor` calculation |
