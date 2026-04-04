# Implementation Plan: 003 — 遊戲抽獎機制

**Branch**: `cli/003-game-management` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-game-management/spec.md`

---

## Summary

實作抽獎頁核心互動：票券格子顯示、隨機/指定抽獎、抽獎動畫（GSAP + canvas-confetti）、結果 Modal、保護時間倒數計時器。Draw Response 永遠為陣列格式（已確認），單次抽獎取 `result[0]`。`prizeId = null` 表示謝謝惠顧。大賞 (`isGrandPrize = true`) 觸發 canvas-confetti 慶祝動畫。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, **GSAP 3.13.0**, **canvas-confetti**, Sass |
| **Storage** | Pinia (pinia-plugin-persistedstate) |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 票券格子 100 張渲染 ≤ 300ms；抽獎按鈕點擊到動畫開始 ≤ 500ms |
| **Constraints** | 需登入；安全需求：`AVAILABLE` 票券不得顯示 prizeId/prizeLevel（後端保證） |
| **Scale/Scope** | 2 頁面（抽獎頁 + 結果 Modal），5 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/003-game-management/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   └── DrawPage.vue                  # 抽獎主頁（/lottery/{id}/draw）
├── components/
│   └── draw/
│       ├── TicketGrid.vue            # 票券格子（LOTTERY_MODE）
│       ├── TicketCell.vue            # 單張票券
│       ├── DrawButton.vue            # 抽獎按鈕（含點數費用）
│       ├── ProtectionTimer.vue       # 保護時間倒數計時器
│       ├── DrawResultModal.vue       # 抽獎結果 Modal
│       ├── PrizeRevealAnimation.vue  # GSAP 翻牌/閃光動畫
│       └── GrandPrizeConfetti.vue   # canvas-confetti 慶祝效果
├── stores/
│   └── draw.ts                      # tickets / sessionInfo / isDrawing / lastDrawResult
├── composables/
│   └── useProtectionTimer.ts        # setInterval 倒數，Page Visibility API 防暫停
├── services/
│   └── draw.ts                      # GET tickets / POST draw / POST designate / POST hot
└── types/
    └── draw.ts                      # Ticket / DrawResult / SessionInfo
```

---

## 主要開發項目

### 1. 票券格子
- 依 `ticketNumber` 升序排列
- `AVAILABLE`：白色背景，顯示號碼
- `DRAWN`：深灰蒙層 + 賞品縮圖（或「謝謝惠顧」文字）
- 超過 50 張：「顯示更多」折疊
- 手機 5 列 / 桌機 10 列（CSS Grid）

### 2. 抽獎流程
```
點擊「抽一次」
→ 驗證點數餘額（客戶端）
→ 按鈕禁用
→ POST /api/lottery/draw/{id}/draw { count: 1, ticket?: [uuid] }
→ 收到陣列 → result[0]
→ GSAP 動畫（1.5s）
→ DrawResultModal
→ 更新全域 goldCoins/bonusCoins（remainingGold/remainingBonus）
```

### 3. 保護倒數計時器（useProtectionTimer）
```typescript
// 每秒更新，Page Visibility API 防止 tab 切換後停止
const remaining = computed(() => {
  return Math.max(0, differenceInSeconds(new Date(protectionEndTime), now.value))
})
// 歸零後自動解鎖按鈕，不需重整
```

### 4. 動畫規格
| 場景 | 動畫 | 時長 |
|------|------|------|
| 一般獎品 | GSAP 翻牌/閃光 | 1.5s |
| 大賞（isGrandPrize） | canvas-confetti + 閃光 | 3s |
| 謝謝惠顧（prizeId=null） | 灰色動畫 + 安慰圖示 | 1.0s |
| 最終獎（isFinalPrize） | 加顯「🎉 最後一張！」橫幅 | — |

### 5. 熱門計數
- `onMounted` 靜默呼叫 `POST /api/lottery/browse/{id}/hot`（Fire-and-forget，不阻塞渲染）

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| 商品基本資訊（title, pricePerDraw）| AV-008：需另呼叫 `GET /api/lottery/browse/{id}` 或由 011 共享 store |
| `maxDraws` 達限後按鈕禁用 | AV-007：後端自動 COMPLETED，前端偵測 `isFinalPrize` 響應 |
| `designate` prizeNumbers 語意 | AV-009：確認為 revealedNumber（已在 005 spec 澄清） |
