# Data Model: 刮刮樂獎項規則修正 — 前台

**Feature**: `015-scratch-lottery-prize-rules` (Frontend)  
**Phase**: 1 — Entities, Interfaces, State

---

## 1. Service Layer Interfaces (`lotteryDrawService.ts`)

### 1.1 `SessionResponse` — Extended

```typescript
export interface SessionResponse {
  sessionId: string;
  isOpener: boolean;
  openerNickname: string | null;
  protectionDraws: number;
  protectionEndTime: string | null;
  openerDrawCount: number;
  freeDrawEnabled: boolean;
  status: string; // 'ACTIVE' | 'EXPIRED'
  canDraw?: boolean;
  cannotDrawReason?: string | null;
  // ─── NEW FIELDS ───────────────────────────────────────────────
  designationDeadline?: string | null;  // ISO-8601; null = no active window or already done
  isDesignationComplete: boolean;       // true = opener has designated prize numbers
}
```

**Validation rules**:
- `isDesignationComplete` defaults to `false` if absent (backwards compat with old backend)
- `designationDeadline` is `undefined | null | string`; treat `undefined` same as `null`

---

### 1.2 `DesignationPendingResponse` — New Export

```typescript
export interface DesignationPendingResponse {
  awaitingDesignation: true;   // discriminant field
  message: string;             // human-readable hint from backend
  openerDeadline: string;      // ISO-8601 countdown target
}
```

**Type narrowing pattern** (in `handleScratch` onSuccess callback):

```typescript
if ((data as DesignationPendingResponse)?.awaitingDesignation === true) {
  // narrow to DesignationPendingResponse
}
```

---

## 2. Component State (`IchibanDetail.vue`)

### 2.1 New Reactive Refs

| Ref | Type | Initial | Purpose |
|-----|------|---------|---------|
| `showWaitingOverlay` | `Ref<boolean>` | `false` | Controls visibility of `DesignationWaitingOverlay` |
| `waitingOpenerDeadline` | `Ref<string>` | `''` | ISO-8601 deadline passed to overlay |
| `waitingMessage` | `Ref<string>` | `''` | Backend message passed to overlay |

### 2.2 New Timer/Interval Handles

| Variable | Type | Purpose |
|----------|------|---------|
| `waitingPollInterval` | `ReturnType<typeof setInterval> \| null` | 30-second session polling |

> **Note**: Variable is `let`, not a `ref`. It is a raw interval ID, not reactive. Managed entirely inside `showDesignationWaitingOverlay` / `stopWaitingOverlay` / `onUnmounted`.

### 2.3 New Computed Properties

| Computed | Type | Formula |
|----------|------|---------|
| `designationDone` | `ComputedRef<boolean>` | `session.value?.isDesignationComplete === true` |
| `showOpenerBanner` | `ComputedRef<boolean>` | `isScratchMode.value && detail.value?.gameMode === 'SCRATCH_PLAYER' && isOpener.value && !designationDone.value` |

---

## 3. `DesignationWaitingOverlay` Component State

### 3.1 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `show` | `boolean` | ✅ | Visibility gate |
| `openerDeadline` | `string` | ✅ | ISO-8601 countdown target time |
| `message` | `string` | ✅ | Descriptive text from backend |

### 3.2 Emits

| Event | Payload | When |
|-------|---------|------|
| `close` | — | User clicks 稍後再試 |
| `expired` | — | `remainingSeconds` reaches 0 |

### 3.3 Internal State

| State | Type | Initial | Description |
|-------|------|---------|-------------|
| `remainingSeconds` | `Ref<number>` | `0` | Seconds until `openerDeadline` |
| `countdownTimer` | `ReturnType<typeof setInterval> \| null` | `null` | Handle for 1s tick interval |

### 3.4 Internal Computed

| Computed | Formula | Example |
|----------|---------|---------|
| `displayTime` | `MM:SS` from `remainingSeconds` | `09:43` |

---

## 4. State Transitions

### 4.1 Non-Opener Waiting Flow

```
Page Load
  └─ reload() → refreshSession()
       └─ session.value.isOpener = false
          session.value.designationDeadline = "2026-04-06T10:15:00Z"  (future)
          session.value.isDesignationComplete = false
          ─→ showDesignationWaitingOverlay(deadline, "開套者正在指定大獎位置，請稍候")
               └─ showWaitingOverlay = true
                  waitingOpenerDeadline = deadline
                  waitingPollInterval = setInterval(poll, 30000)

Poll fires (every 30s)
  └─ getLotterySession()
       ├─ isDesignationComplete = true → stopWaitingOverlay() + reload()
       └─ isDesignationComplete = false → continue polling

Countdown reaches 0 (overlay @expired)
  └─ stopWaitingOverlay()
     reload()
     ichibanInfoDialog("計時結束，您已可嘗試成為開套者")

User closes overlay (@close)
  └─ stopWaitingOverlay()
     // No reload; user can browse but cannot scratch (guard in handleScratchCardSelect)
```

### 4.2 Opener Designation Flow

```
Page Load
  └─ reload() → refreshSession()
       └─ session.value.isOpener = true
          session.value.isDesignationComplete = false
          ─→ showOpenerBanner = true (computed)

User clicks "立即指定"
  └─ triggerDesignationFromSession()
       └─ availableTicketIds[0] (probe UUID)
          drawLottery({ count: 1, ticket: [probeUUID] })
          ─→ backend: { designationRequired: true, availableNumbers, grandPrizes }
          ─→ handleDesignatePrize(availableNumbers, grandPrizes)
               └─ showDesignationUI (for each grandPrize)
                  PrizeDesignationDialog shown
                  User selects numbers → onDesignationConfirm
                  designatePrizePositions(kujiId, { designations })
                  ─→ success: reload()
                  ─→ failure: ichibanInfoDialog(error) + re-open dialog for same prize

After successful designation
  └─ reload() → refreshSession()
       └─ session.value.isDesignationComplete = true
          ─→ showOpenerBanner = false (computed)
          ─→ designatedWinningNumbers banner shown (existing logic)
```

### 4.3 Non-Opener Draw Intercept Flow

```
User clicks scratch tile (handleScratchCardSelect)
  └─ ensureCanDraw() → ok
     showWaitingOverlay.value === true → return (pre-flight guard)
     OR
     showWaitingOverlay.value === false
       └─ handleScratch(ticketId)
            └─ drawLottery()
                 └─ backend: { awaitingDesignation: true, openerDeadline, message }
                    ─→ showDesignationWaitingOverlay(openerDeadline, message)
```

---

## 5. Data Flow Summary

```
GET /lottery/draw/{id}/session
  └─ SessionResponse
       ├─ designationDeadline: string | null   (NEW)
       └─ isDesignationComplete: boolean       (NEW)
           └─ IchibanDetail.vue session.value
                ├─ designationDone (computed)
                ├─ showOpenerBanner (computed)
                └─ reload() post-session check
                     ├─ showDesignationWaitingOverlay()  [non-opener]
                     └─ showOpenerBanner = true           [opener]

POST /lottery/draw/{id}/draw
  └─ DesignationPendingResponse (awaitingDesignation: true)
       └─ handleScratch() onSuccess
            └─ showDesignationWaitingOverlay(openerDeadline, message)
```
