# Tasks: 011 — 商品列表與一番賞詳情

**Feature**: Product Lottery | **Branch**: `cli/011-product-lottery` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立/確認 `src/types/lottery.ts`，定義 `LotteryProduct`（id, title, storeName, storeId, category, playMode, pricePerDraw, currentPrice?, totalTickets, remainingTickets, soldPercentage, imageUrl, previewImages[], isActive, isSoldOut）、`LotteryPrize`（id, level, levelName, imageUrl, prizeValue, quantity, remainingCount）、`LotteryDetail`（extends LotteryProduct: prizes[], description, rules）；確認 LotteryCategory 枚舉（LOTTERY_MODE / SCRATCH_MODE）與 spec.md 一致
- [ ] T002 建立 `src/services/lottery.ts`（若未存在），實作：`getLotteries(category?)` → `GET /api/lotteries?category=xxx`；`getLotteryDetail(id)` → `GET /api/lotteries/{id}`
- [ ] T003 建立 `src/stores/lottery.ts`，定義 Pinia store：products / activeCategory / lotteryDetail / isLoading / hasMore；computed：filteredProducts（客戶端 category 過濾）；actions：loadMore（Intersection Observer 觸發）

---

## Phase 2: Foundational

- [ ] T004 [P] 建立 `src/components/lottery/CategoryTabs.vue`，分類 Tab（全部/LOTTERY_MODE/SCRATCH_MODE）；SCRATCH_MODE Tab 對應「刮刮樂」中文；sticky 置頂（FR-UI-001）；切換 emit activeCategory
- [ ] T005 [P] 建立 `src/components/lottery/ProductCard.vue`：封面圖（isSoldOut → 灰階半透明 overlay「已售完」US1 AC-4）；標題 / 店家名稱 / 分類 Badge（FR-UI-003）；pricePerDraw 售價（currentPrice 若不同顯示原價刪除線 AV-003 Deferred）；剩餘數量進度條（soldPercentage FR-UI-004）；Skeleton Loader（FR-UI-002）；手機 2 列 / 桌機 4 列
- [ ] T006 [P] 建立 `src/components/lottery/PrizeLevelBadge.vue`，等級 Badge 使用 FR-CROSS-006 顏色映射（若 004/008/010 已存在則引用，不重複建立）
- [ ] T007 [P] 建立 `src/components/lottery/PrizePoolSection.vue`：按等級分組顯示獎品（level A→Z + FINAL/LAST；prizeId=null=謝謝惠顧灰色）；等級 Badge + 獎品圖 + 名稱 + remainingCount（已售完項目灰階 US2 AC-3）

---

## Phase 3: [US1] 瀏覽商品列表並篩選分類

- [ ] T008 [US1] 完善 `src/views/IchibanList.vue`（已存在，`/lottery`）：整合 CategoryTabs（上方固定）；onMounted 呼叫 `getLotteries()`；整合 ProductCard 格子列表；Intersection Observer 實作無限捲動（US1 AC-3，loadMore action）；空狀態「目前沒有商品」插圖（US1 AC-5）
- [ ] T009 [US1] 在 `IchibanList.vue` 整合分類切換邏輯：切換 Tab → 更新 activeCategory → 重新呼叫 `getLotteries(category)` + 重設 hasMore + 回捲至頂（US1 AC-1/2）；保留 URL query `?category=xxx` 支援直連（US1 AC-6）

---

## Phase 4: [US2] 查看商品詳情與獎品清單

- [ ] T010 [US2] 完善 `src/views/IchibanDetail.vue`（已存在，`/lottery/{id}`）：onMounted 呼叫 `getLotteryDetail(id)`；顯示：PreviewImageSwiper（Swiper 10 縮圖列，FR-UI-006）/ 標題 / 店家連結 / 分類 Badge / PlayMode Badge / 描述 / rules / PrizePoolSection；骨架屏（FR-UI-002）；404/isSoldOut 狀態顯示對應錯誤頁（US2 AC-4）
- [ ] T011 [US2] 建立 `src/components/lottery/PreviewImageSwiper.vue`（Swiper 10）：主圖 + 縮圖 Rail；thumbs 模組；圖片點擊放大 Lightbox（US2 AC-1）

---

## Phase 5: [US3] 未登入使用者抽獎牆

- [ ] T012 [US3] 建立 `src/components/lottery/LoginPromptOverlay.vue`：覆蓋在 DrawControls 上方半透明遮罩；「請先登入以繼續抽獎」+ 「立即登入」按鈕；點擊登入 → `router.push({ name: 'Login', query: { redirectTo: route.fullPath } })`（US3 AC-1/2）；登入後自動回到詳情頁繼續（US3 AC-3）
- [ ] T013 [US3] 在 `IchibanDetail.vue` 整合 LoginPromptOverlay：isAuthenticated=false 時顯示 Overlay（US3 AC-1）；isAuthenticated=true 時顯示 DrawControls

---

## Phase 6: [US4] 從商品詳情進入抽獎頁

- [ ] T014 [US4] 建立 `src/components/lottery/DrawControls.vue`：顯示 pricePerDraw / goldCoins 餘額；「立即抽一次」按鈕（goldCoins >= pricePerDraw 才啟用，不足時灰色 + hover tooltip「金幣不足，請儲值」FR-UI-010）；「前往抽獎」按鈕：LOTTERY_MODE → `/lottery/{id}/draw`；SCRATCH_MODE + isOpener → `/lottery/{id}/scratch-open`；SCRATCH_MODE + !isOpener → `/lottery/{id}/scratch-draw`（US4 AC-1/2）
- [ ] T015 [US4] 在 `IchibanDetail.vue` 整合 DrawControls（底部 Sticky Bar）：isSoldOut=true → 顯示「已售完」禁用狀態（US4 AC-3）；不再顯示 LoginPromptOverlay（US3 條件已處理）

---

## Final Phase: Polish

- [ ] T016 [P] 確認 ProductCard Skeleton 載入 → 實際資料 Transition 無 Layout Shift（SC-004）；確認無限捲動 Intersection Observer 清除（onUnmounted）（SC-005）
- [ ] T017 [P] 確認 IchibanList 首屏 20 件商品渲染 ≤ 1.5s（SC-001）；IchibanDetail API 完成後 ≤ 500ms 渲染（SC-002）；PrizePoolSection 60 件獎品渲染 ≤ 300ms（SC-003）

---

## Dependencies

```
T001 → T002 → T003
T004, T005 → T008 → T009
T006 → T007 → T010
T010, T011 → IchibanDetail 完整
T012 → T013 → T015
T014 → T015
```

## Parallel Opportunities

- T004, T005, T006, T007 可同時開發
- T008+T009（列表）與 T010+T011（詳情）可並行
- T012, T013 可同時開發
- T014, T015 可同時開發

## Implementation Strategy

MVP = Phase 3（T008+T009 列表）+ Phase 4（T010+T011 詳情）；US3 登入牆（Phase 5）+ US4 抽獎進入（Phase 6）接續完成。
