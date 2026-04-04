# Implementation Plan: 005 — 抽獎票券系統（刮刮樂）

**Branch**: `cli/005-lottery-ticket-system` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-lottery-ticket-system/spec.md`

---

## Summary

實作刮刮樂（`SCRATCH_MODE`）票券系統。`PlayMode` 只有 `LOTTERY_MODE` / `SCRATCH_MODE`（Q4 已澄清，SCRATCH_STORE/SCRATCH_PLAYER 廢棄）。子模式由 `isOpener + grandPrizesDesignated` 組合決定：開套者未指定 → 開套頁；已指定 → 直接抽獎；非開套者等待 → 每 10 秒輪詢（Q2 已澄清）。保護倒數純前端計算（Q2 已澄清）。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, GSAP 3.13.0, Sass |
| **Storage** | Pinia (pinia-plugin-persistedstate) |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 刮刮樂動畫 ≥ 30fps（低階 Android 中階機型）；輪詢間隔 10s |
| **Constraints** | 需登入；`AVAILABLE` 票券不得在 DOM/Network 洩漏 prizeInfo；安全優先 |
| **Scale/Scope** | 3 個路由、3 個 API 端點、10s 輪詢機制 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/005-lottery-ticket-system/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成（Q2/Q4 已澄清）
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── ScratchOpenPage.vue           # 開套者指定大賞頁（/lottery/{id}/scratch-open）
│   ├── ScratchDrawPage.vue           # 刮刮樂抽獎頁（/lottery/{id}/scratch-draw）
│   └── DrawPage.vue                  # 一番賞/扭蛋票券格子（/lottery/{id}/draw）
├── components/
│   └── scratch/
│       ├── ScratchCardGrid.vue       # 刮刮樂票券格子（顯示 revealedNumber）
│       ├── ScratchCard.vue           # 單張刮刮樂票券（刮開動畫）
│       ├── DesignationGrid.vue       # 開套者指定大賞格子
│       ├── DesignationLockOverlay.vue # 鎖定狀態遮罩（等待指定時）
│       └── ScratchProtectionTimer.vue # 保護倒數計時器（純前端）
├── stores/
│   └── scratch.ts                   # playMode / tickets / sessionInfo / designatedNumbers
├── composables/
│   ├── useProtectionTimer.ts        # 純前端倒數（Page Visibility API 防暫停）
│   └── useDesignationPoller.ts      # 10s 輪詢 GET .../tickets 偵測 grandPrizesDesignated
├── services/
│   └── ticket.ts                    # GET tickets / POST draw / POST designate
└── types/
    └── ticket.ts                    # Ticket / TicketSession / DesignateRequest
```

---

## 主要開發項目

### 1. PlayMode 路由邏輯（廢棄 SCRATCH_STORE/SCRATCH_PLAYER）

```typescript
// router guard（/lottery/{id}/draw 進入時判斷）
const session = ticketStore.sessionInfo
if (product.playMode === 'SCRATCH_MODE') {
  if (session.isOpener && !session.grandPrizesDesignated) {
    return redirect(`/lottery/${id}/scratch-open`)
  }
  return redirect(`/lottery/${id}/scratch-draw`)
}
// LOTTERY_MODE → /lottery/{id}/draw
```

### 2. 開套者指定大賞（ScratchOpenPage）
- 顯示所有 `revealedNumber` 格子，勾選後儲存至 `designatedNumbers`
- `POST /api/lottery/draw/{id}/designate { prizeNumbers: [revealedNumber, ...] }`
- 成功 → `grandPrizesDesignated = true` → 跳轉至抽獎頁

### 3. 10 秒輪詢（useDesignationPoller）
```typescript
const poller = useDesignationPoller(lotteryId, {
  interval: 10_000,
  onDesignated: () => ticketStore.unlockScratch()
})
// 在 ScratchDrawPage onMounted 啟動，onUnmounted 停止
```

### 4. 刮刮樂動畫（GSAP）
- 點擊票券 → 銀色消散特效，時長 0.8s
- `prizeId = null` → 謝謝惠顧動畫（灰色）
- 大賞 → canvas-confetti 慶祝

### 5. 安全需求
- `AVAILABLE` 票券：`prizeInfo` 欄位不得在前端 state 中存在
- `revealedNumber` 只顯示號碼，不顯示 `ticketNumber`（避免推算大賞位置）

### 6. 子模式判斷表（FR-CROSS-008）

| `isOpener` | `grandPrizesDesignated` | 行為 |
|-----------|------------------------|------|
| true | false | 進入開套頁 → 指定大賞 |
| true | true | 直接進入抽獎頁 |
| false | false | 格子鎖定 + 10s 輪詢 |
| false | true | 直接抽獎 |

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| 大賞數量上限 | AV-008：`designate` API 未說明最多可指定數量，需後端在 Session 中提供 |
| 輪詢停止條件 | 組件 unmount 時停止；Tab 切回時重啟 |
