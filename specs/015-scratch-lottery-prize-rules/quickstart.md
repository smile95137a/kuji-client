# Quickstart: 刮刮樂獎項規則修正 — 前台開發指南

**Feature**: `015-scratch-lottery-prize-rules` (Frontend)

---

## Prerequisites

- Node.js ≥ 18 (project uses Vite 5)
- Yarn (lockfile present: `yarn.lock`)
- Backend running on `http://localhost:8080` (or configured proxy in `vite.config.ts`)

---

## Setup

```bash
# 1. Switch to feature branch
git checkout 015-scratch-lottery-prize-rules

# 2. Install dependencies (if not already done)
yarn install

# 3. Start dev server
yarn dev
```

---

## Build

```bash
yarn build
# Output: dist/
```

Type-check only (no bundle):

```bash
yarn vue-tsc --noEmit
```

---

## Files to Modify / Create

| Action | Path |
|--------|------|
| MODIFY | `src/services/lotteryDrawService.ts` |
| MODIFY | `src/views/IchibanDetail.vue` |
| CREATE | `src/components/ichiban/DesignationWaitingOverlay.vue` |

Implementation order (respects dependencies):

1. `lotteryDrawService.ts` — interface changes (T01)
2. `DesignationWaitingOverlay.vue` — new component (T02)
3. `IchibanDetail.vue` — state, helpers, template, cleanup (T03–T10)
4. Build verification (T11)

---

## Manual Testing Checklist

### Setup: Use a `SCRATCH_PLAYER` product with at least 5 AVAILABLE tickets.

#### Test 1 — Non-opener sees waiting overlay on page load

1. Log in as Player A; open the product detail page.
2. Player A becomes the opener — session shows `isOpener: true`.
3. Log in as Player B in a different browser/incognito.
4. Open the same product detail page as Player B.
5. **Expected**: `DesignationWaitingOverlay` appears automatically; shows countdown from `designationDeadline`.

#### Test 2 — Non-opener sees waiting overlay after draw intercept

1. With Player B's session active (overlay closed or not yet shown):
2. Click any AVAILABLE scratch tile.
3. **Expected**: Overlay appears with countdown from `openerDeadline` in the backend response.

#### Test 3 — Pre-flight guard prevents draw while waiting

1. Overlay is showing.
2. Attempt to click a scratch tile (via the grid or panel).
3. **Expected**: No API call is made; nothing happens.

#### Test 4 — Overlay closes + reloads when opener completes designation

1. Player B sees waiting overlay.
2. Player A (opener) completes `POST /designate`.
3. Wait up to 30 seconds.
4. **Expected**: Overlay closes automatically; page reloads; designated winning numbers banner appears.

#### Test 5 — Countdown expiry triggers reload

1. Let countdown reach 00:00.
2. **Expected**: Page reloads; if Player B is now the opener, the opener banner appears.

#### Test 6 — Opener sees designation banner on page load

1. Log in as the opener; page loads.
2. `session.isDesignationComplete = false`.
3. **Expected**: Orange "立即指定" banner visible in the info aside.

#### Test 7 — Opener clicks "立即指定"

1. Click the "立即指定" button.
2. **Expected**: `PrizeDesignationDialog` opens for the first grand prize.

#### Test 8 — `POST /designate` failure keeps dialog open

1. Opener is in `PrizeDesignationDialog`.
2. Simulate a network error / backend 400 response.
3. **Expected**: Error info dialog appears; `PrizeDesignationDialog` remains open; opener can retry.

#### Test 9 — SCRATCH_STORE product unaffected

1. Open a `SCRATCH_STORE` product detail page.
2. **Expected**: No opener banner, no waiting overlay, normal scratch flow.

#### Test 10 — LOTTERY_MODE / GACHA unaffected

1. Open a `LOTTERY_MODE` or `GACHA` product.
2. **Expected**: No designation-related UI appears; draw flow works normally.

---

## Key Constants

| Constant | Value | Location |
|----------|-------|----------|
| Session poll interval | 30 000 ms | `IchibanDetail.vue` `showDesignationWaitingOverlay` |
| Countdown tick interval | 1 000 ms | `DesignationWaitingOverlay.vue` |
| Overlay z-index | 8 000 | `DesignationWaitingOverlay.vue` SCSS |
| Global overlay z-index | 9 999 | `BaseOverlay.vue` SCSS |

---

## Backend API Reference

| Endpoint | Change |
|----------|--------|
| `GET /lottery/draw/{id}/session` | Now returns `designationDeadline` and `isDesignationComplete` |
| `POST /lottery/draw/{id}/draw` | May return `{ awaitingDesignation: true, message, openerDeadline }` for non-opener players |
| `POST /lottery/draw/{id}/designate` | Unchanged |

See `specs/015-scratch-lottery-prize-rules/spec-frontend.md` §API Contract for full interface definitions.
