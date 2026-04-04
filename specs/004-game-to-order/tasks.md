# Tasks: 004 — 遊戲至訂單流程

**Feature**: Game to Order | **Branch**: `cli/004-game-to-order` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/prizeBox.ts`，定義 `PrizeBoxItem`（id, lotteryId, lotteryTitle, storeId, storeName, prizeName, prizeLevel, prizeImageUrl, status, receivedAt, isShippable, isRecyclable, recycleBonus）、`RecycleResponse`（bonusEarned, newBonusBalance, recycledCount）、`OrderSummary` interface
- [ ] T002 建立 `src/services/prizeBox.ts`，實作：`getPrizeBox()` → `GET /api/prize-box`；`recycle(payload)` → `POST /api/prize-box/recycle`
- [ ] T003 建立 `src/services/order.ts`（若未存在），實作 `getOrders()` → `GET /api/orders`
- [ ] T004 建立 `src/stores/prizeBox.ts`，定義 Pinia store：prizeBoxItems / selectedPrizeIds（Set）/ activeStatusTab；computed：groupedPrizes（依 storeId 分組 Map）/ filteredItems（依 tab 過濾）
- [ ] T005 建立 `src/stores/order.ts`，定義 Pinia store：orders / activeStatusFilter；computed：filteredOrders（客戶端過濾）
- [ ] T006 建立 `src/composables/usePrizeSelection.ts`，多選邏輯：toggle / selectAll（同店家）/ 跨店家偵測（storeId 集合 > 1）/ hasShippable / hasRecyclable / hasInvalidRecyclable

---

## Phase 2: Foundational

- [ ] T007 [P] 建立 `src/components/prize-box/PrizeLevelBadge.vue`，等級標籤（FR-CROSS-006 顏色映射：A=金色#FFD700 / B=紅色#E53E3E / C=橙色#ED8936 / D=綠色#38A169 / E+=藍色#3182CE / FINAL=紫色#805AD5 / LAST=深藍#2B6CB0 / prizeId=null=灰色#718096）
- [ ] T008 [P] 建立 `src/components/prize-box/MultiStoreWarning.vue`（若 002 未建立共用版則此處建立），黃色警告橫幅
- [ ] T009 [P] 建立 `src/components/order/OrderCard.vue`，訂單卡片（orderNo, storeName, prizeCount, shippingMethodName, createdAt, status Badge）；Badge 顏色：PENDING=藍/PREPARING=黃/SHIPPED=橙/COMPLETED=綠（FR-UI-008）

---

## Phase 3: [US1] 抽獎後選擇前往賞品盒

- [ ] T010 [US1] 在 `src/stores/draw.ts` 中，DrawResultModal 「前往賞品盒」按鈕：導向 `/prize-box` 並將 lastDrawResult 的 prizeIds 存入 prizeBox store 的 `newlyAcquiredIds`，供高亮顯示
- [ ] T011 [US1] 建立 `src/views/PrizeBox.vue`（`/prize-box`）基本骨架：onMounted 呼叫 `getPrizeBox()`；顯示 `newlyAcquiredIds` 的賞品閃爍動畫（高亮 24 小時內新獲取賞品）；依 receivedAt 降序排列（US1 AC-2）

---

## Phase 4: [US2] 選取賞品申請出貨

- [ ] T012 [US2] 建立 `src/components/prize-box/PrizeCard.vue`：賞品圖/名稱/等級 PrizeLevelBadge/店家名稱/入盒時間/狀態標籤；IN_BOX 且 isShippable=true 時 Checkbox 啟用；SHIPPED/RECYCLED 半透明 + Checkbox 禁用；isShippable=false 時 Tooltip「此賞品無法出貨」（US2 AC-4）
- [ ] T013 [US2] 建立 `src/components/prize-box/PrizeBoxGroup.vue`：單店家分組（標題列 + 全選 Checkbox + 已選數量），整合 usePrizeSelection.selectAll（US2 AC-2）
- [ ] T014 [US2] 建立 `src/components/prize-box/StickyActionBar.vue`：selectedPrizeIds 非空時出現（slide up 入場動畫）；顯示「已選 X 件 ｜ 申請出貨 ｜ 回收換分」；hasShippable=false 時出貨按鈕禁用 + Tooltip；hasInvalidRecyclable=true 時回收按鈕禁用（FR-UI-005~008）
- [ ] T015 [US2] 完善 `PrizeBox.vue`：整合 PrizeBoxGroup + StickyActionBar + MultiStoreWarning；申請出貨點擊 → 跨店家時先顯示警告確認 Modal → 導向 `/prize-box/ship`（將 selectedPrizeIds 傳入 shipping store）

---

## Phase 5: [US3] 回收賞品換 Bonus

- [ ] T016 [US3] 建立 `src/components/prize-box/RecycleConfirmModal.vue`：列出待回收賞品清單（縮圖+名稱+個別 recycleBonus）；金色大字顯示 estimatedBonusTotal；紅色不可逆警告文字「⚠️ 回收後無法復原」（US3 AC-3）；確認按鈕呼叫 `prizeBox.recycle()`
- [ ] T017 [US3] 在 `PrizeBox.vue` 整合 RecycleConfirmModal：回收成功後 Toast「🎉 回收成功！獲得 {bonusEarned} Bonus 點」；樂觀更新 prizeBoxItems status → RECYCLED；更新全域 bonusCoins（newBonusBalance）（US3 AC-4）

---

## Phase 6: [US4] 瀏覽訂單列表

- [ ] T018 [P] [US4] 建立 `src/views/OrderList.vue`（`/orders`）：onMounted 呼叫 `getOrders()`；顯示 OrderCard 列表（依 createdAt 降序）；狀態 Tab 過濾（客戶端 computed，響應 ≤ 50ms）（US4 AC-2）；空狀態：插圖 + 「前往商品頁」按鈕（US4 AC-3）

---

## Final Phase: Polish

- [ ] T019 [P] 確認 `PrizeCard.vue` 中 prizeImageUrl 為空時顯示預設佔位圖（FR-UI-003）；確認「NEW」標籤（receivedAt 距今 < 24h，FR-UI-005 in 010）在 PrizeCard 中顯示
- [ ] T020 [P] 確認 `StickyActionBar.vue` 入場動畫流暢（200ms，SC-005）；確認 PrizeBox 50 件賞品首次渲染 ≤ 1s（SC-001）

---

## Dependencies

```
T001 → T002, T004
T003 → T005
T004, T006 → T012, T013, T014
T007 → T012
T008 → T015
T009 → T018
T010 → T011
T012, T013, T014 → T015
T015 → T016, T017
T018 → T019, T020
```

## Parallel Opportunities

- T002, T003 可同時建立
- T007, T008, T009 可同時開發
- T012, T013, T014 可同時開發

## Implementation Strategy

MVP = Phase 3+4（T010–T015）完成賞品盒顯示與出貨選取；Phase 5（回收）；Phase 6（訂單列表）。
