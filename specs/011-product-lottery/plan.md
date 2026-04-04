# Implementation Plan: 011 — 商品抽獎列表

**Branch**: `cli/011-product-lottery` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-product-lottery/spec.md`

---

## Summary

實作一番賞商品列表頁（`/ichiban`，已有 `IchibanList.vue`）與商品詳情頁（`/ichiban/{id}`，已有 `IchibanDetail.vue`）。列表頁含分類 Tab（`OFFICIAL_ICHIBAN/GACHA/TRADING_CARD/CUSTOM_GACHA`，注意 SCRATCH 是 PlayMode 不是 LotteryCategory）、無限捲動、登入牆（未登入時顯示 LoginPromptOverlay）。詳情頁顯示賞品池（等級分組）、剩餘票數進度條、單/10 連抽。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, GSAP 3.13.0, canvas-confetti, Sass |
| **Storage** | Pinia（productList / activeCategory / productDetail） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 列表 ≤ 1.5s；抽獎動畫 ≥ 30fps；大賞煙火 ≤ 100ms 啟動 |
| **Constraints** | 未登入可瀏覽列表（但操作受限）；需登入才能抽獎；不洩漏未揭曉賞品 |
| **Scale/Scope** | 2 頁面（已有雛形）、4 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/011-product-lottery/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成（Q3/Q4 澄清確認）
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── IchibanList.vue             # 商品列表頁（已存在，需完善）
│   └── IchibanDetail.vue          # 商品詳情頁（已存在，需完善）
├── components/
│   └── lottery/
│       ├── ProductCard.vue         # 商品卡片（封面圖、標題、分類 Badge、剩餘 %）
│       ├── CategoryTabs.vue        # 分類 Tab（OFFICIAL_ICHIBAN...CUSTOM_GACHA）
│       ├── PrizePoolSection.vue    # 賞品池（依等級 A/B/C... 分組展示）
│       ├── PrizeLevelGroup.vue     # 等級分組卡片（等級標籤 + 賞品清單）
│       ├── DrawControls.vue        # 抽獎控制區（1 連/10 連 + 金幣/獎勵幣切換）
│       ├── DrawResultModal.vue     # 抽獎結果 Modal（飛牌動畫）
│       ├── TicketProgressBar.vue   # 剩餘票券進度條（可抽/已抽/未知）
│       └── LoginPromptOverlay.vue  # 未登入時遮罩提示
├── stores/
│   └── lottery.ts                 # productList / activeCategory / productDetail / drawResult
├── composables/
│   └── useDrawAnimation.ts        # GSAP 飛牌動畫 + canvas-confetti 大賞特效
├── services/
│   └── lottery.ts                 # GET /api/lottery / GET /api/lottery/{id} / POST /api/lottery/draw/{id}
└── types/
    └── lottery.ts                 # LotteryProduct / LotteryDetail / PrizePool / DrawResult
```

---

## 主要開發項目

### 1. 分類 Tab（LotteryCategory 枚舉）

| Tab 標籤 | API 值 |
|---------|--------|
| 全部 | 省略 category |
| 官方一番賞 | `OFFICIAL_ICHIBAN` |
| 扭蛋 | `GACHA` |
| 集換式卡牌 | `TRADING_CARD` |
| 自訂扭蛋 | `CUSTOM_GACHA` |

> **注意**：SCRATCH 是 `PlayMode` 不是 `LotteryCategory`，不出現在此 Tab 列表中。

### 2. 無限捲動（Intersection Observer）
```typescript
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !isLoading.value && hasMore.value) {
    loadNextPage()
  }
}, { threshold: 0.1 })
observer.observe(loadMoreTrigger.value!)
```

### 3. 抽獎 API 及結果處理
```typescript
// 回應永遠是陣列（Q1 澄清）
const result = await lotteryService.draw(lotteryId, { count: 1, useBonus: false })
// result[0] → 單抽；result.length = 1 or 10
// prizeId = null → 謝謝惠顧（灰色動畫）
// prizeLevel = FINAL → canvas-confetti 大賞特效
```

### 4. 抽獎後餘額更新
```typescript
// draw API 回應後更新 Pinia auth store
authStore.goldCoins = drawResult.remainingGold
authStore.bonusCoins = drawResult.remainingBonus
```

### 5. `currentPrice` vs `pricePerDraw`（AV-007 Deferred）
- 目前暫時統一使用 `pricePerDraw` 顯示「每抽 X 金幣」
- 若後端補充 `currentPrice` 欄位（動態折扣），優先使用

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| `currentPrice` vs `pricePerDraw` | AV-007：兩欄位語意不同，待後端確認 |
| SCRATCH_MODE 詳情入口 | SCRATCH 商品由此頁進入後，路由守衛（005 spec）接管 |
| 無限捲動分頁 | AV-004：需後端確認 `hasMore`/`totalPages` 欄位格式 |
| 10 連抽折扣 | AV-008：UI 是否顯示折扣標籤待後端確認 |
