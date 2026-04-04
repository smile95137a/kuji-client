# Tasks: 010 — 賞品盒

**Feature**: Prize Box | **Branch**: `cli/010-prize-box` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/prizebox.ts`，定義 `PrizeBoxItem`（id, prizeId, lotteryId, lotteryTitle, storeId, storeName, level, levelName, imageUrl, prizeValue, isSelected）、`PrizeBoxGroup`（storeId, storeName, prizes: PrizeBoxItem[]）、`ShipRequest`（prizeIds, shippingMethod, recipientName, recipientPhone, address?, storeCode?, storeName?）、`RecycleRequest`（prizeIds）interface
- [ ] T002 建立 `src/services/prizebox.ts`，實作：`getPrizeBox()` → `GET /api/prize-box`；`ship(payload: ShipRequest)` → `POST /api/prize-box/ship`；`recycle(payload: RecycleRequest)` → `POST /api/prize-box/recycle`
- [ ] T003 建立 `src/services/address.ts`，實作 `getDefaultAddress()` → `GET /api/address/default`（AV-010 Deferred：404/無資料時 graceful fallback）
- [ ] T004 建立 `src/stores/prizebox.ts`，定義 Pinia store：groups / selectedIds（Set<string>）/ selectionMode / isSubmitting；computed：selectedItems、totalPrizeCount、groupedByStore；actions：toggleSelect, selectAll, clearAll, removeItems

---

## Phase 2: Foundational

- [ ] T005 [P] 建立 `src/components/prizebox/PrizeCard.vue`：顯示 imageUrl/等級 Badge（FR-CROSS-006 顏色映射）/標題/store 名稱/prizeValue；右上角複選框（selectionMode=true 時顯示）；選中時高亮 border（FR-UI-003）；多張縮圖（> 1 item → 堆疊視覺效果 FR-UI-007）
- [ ] T006 [P] 建立 `src/components/prizebox/PrizeBoxGroupSection.vue`：店家分組 Section（storeName 大標題 + 賞品數量統計）；整合 PrizeCard 列表；Section 中全選按鈕（US1 AC-4）；手機 2 列 / 桌機 4 列（FR-UI-002）
- [ ] T007 [P] 建立 `src/components/prizebox/PrizeBoxActionBar.vue`（底部 Sticky）：未選中：隱藏；選中時顯示「已選 N 件」+ 「申請出貨」+ 「回收換 Bonus」按鈕（FR-UI-006）；出貨/回收按鈕各自禁用條件（未選 = disabled）

---

## Phase 3: [US1] 瀏覽與管理賞品盒

- [ ] T008 [US1] 建立 `src/views/PrizeBox.vue`（`/prize-box`）：onMounted 呼叫 `getPrizeBox()`；整合 PrizeBoxGroupSection（依 storeId 分組）；空狀態插圖「賞品盒目前是空的」+ 「前往抽獎」按鈕（US1 AC-5）；切換 selectionMode（長按或右上角 icon）（US1 AC-3）；整合 PrizeBoxActionBar（US1 AC-4）
- [ ] T009 [US1] 在 `PrizeBox.vue` 實作 selectionMode toggle：單點卡片（selectionMode=true）→ toggleSelect(id)；selectionMode=false 狀態下卡片點擊則開啟詳情 Modal（AV-004 Deferred，暫無詳情頁 → 忽略）

---

## Phase 4: [US2] 選取賞品申請出貨

- [ ] T010 [US2] 建立 `src/components/prizebox/ShippingFormModal.vue`：步驟 1 收件方式選擇（HOME_DELIVERY / CONVENIENCE_STORE，FR-UI-008）；步驟 2 填寫資料（VeeValidate + Yup，FR-UI-010）；HOME_DELIVERY：姓名/電話/縣市/鄉鎮市區/詳細地址；CONVENIENCE_STORE：姓名/電話/超商名稱/店碼；電話格式 Regex 驗證
- [ ] T011 [US2] 在 `ShippingFormModal.vue` 整合預設地址自動帶入：onMounted 呼叫 `getDefaultAddress()`；若有資料則自動填入（US4 AC-1）；404/無資料時 graceful fallback：欄位留空（AV-010）
- [ ] T012 [US2] 建立 `src/components/prizebox/ShipResultModal.vue`，出貨成功：選取的賞品從 store 中移除、成功訊息（US2 AC-4）；失敗：錯誤訊息 + 「重試」按鈕（FR-UI-015）
- [ ] T013 [US2] 在 `PrizeBox.vue` 串接出貨流程：`PrizeBoxActionBar` 「申請出貨」→ 開啟 ShippingFormModal → 確認後呼叫 `ship(payload)`；isSubmitting=true 防重複提交（SC-001）→ 開啟 ShipResultModal（US2 AC-1~4）

---

## Phase 5: [US3] 回收賞品換 Bonus

- [ ] T014 [US3] 建立 `src/components/prizebox/RecycleConfirmModal.vue`：顯示選取的賞品清單縮圖 + 標題 + 等級（US3 AC-1）；顯示總計預估 Bonus（若後端提供 estimatedBonus，AV-007 Deferred：顯示「?」佔位）；「確認回收」→ 呼叫 `recycle({ prizeIds })`（US3 AC-2）；回收成功後選取賞品從 store 移除 + 顯示獲得 Bonus 成功 Toast（US3 AC-3）

---

## Phase 6: [US4] 預設地址自動帶入

- [ ] T015 [US4] 確認 `ShippingFormModal.vue` T011 中 `getDefaultAddress()` 整合完整：getDefaultAddress 有值時自動填入所有欄位；AV-010 確認 API 存在前顯示「載入中」骨架 1s（SC-004）；無預設地址不顯示錯誤 Toast（US4 AC-2 AV-010）

---

## Final Phase: Polish

- [ ] T016 [P] 確認 PrizeBox.vue 100 件賞品首屏渲染 ≤ 2s（SC-002）；確認 selectedIds 使用 Set 達成 O(1) 切換（SC-003）
- [ ] T017 [P] 確認多店家交叉選取（US2 AC-3：不同店家賞品可同時出貨 or 拆單，AV-011 Deferred：若後端限制同店，前端顯示「同店賞品才可合併出貨」提示）
- [ ] T018 [P] 確認 PrizeLevelBadge 使用 FR-CROSS-006 顏色映射（與 004/008 一致）；確認圖片 fallback（imageUrl 為空 → 預設賞品圖示）

---

## Dependencies

```
T001 → T002, T003, T004
T004 → T009, T013
T005, T006 → T008
T007 → T013
T010, T011 → T012 → T013
T014 → T013（PrizeBoxActionBar 觸發）
T015 → T011
```

## Parallel Opportunities

- T002, T003 可同時建立
- T005, T006, T007 可同時開發
- T012, T014 可同時開發
- T016, T017, T018 可同時完成

## Implementation Strategy

MVP = Phase 3（T008+T009 列表）+ Phase 4（T010–T013 出貨流程）；回收（Phase 5）和預設地址（Phase 6）為增強項。
