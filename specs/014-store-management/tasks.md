# Tasks: 014 — 店家管理

**Feature**: Store Management | **Branch**: `cli/014-store-management` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [x] T001 建立 `src/services/storeService.ts`，定義 `Store`、`StoreDetail` interface，實作 `getStores()`、`getStoreDetail(id)`、`getStoreProducts(id)`
- [x] T002 `src/services/storeService.ts` 已建立（types 整合於同一檔案）
- [ ] T003 建立 `src/stores/storeList.ts`，定義 Pinia store（目前 StoreList.vue 使用 local state，可後續提取）

---

## Phase 2: Foundational

- [x] T004 [P] 建立 `src/components/store/StoreCard.vue`：logoUrl / 名稱 / description（2 行 line-clamp）/ address；isActive=false → 灰階 overlay「暫停服務」；cursor: pointer；Skeleton 於 StoreList.vue 內建
- [x] T005 [P] 搜尋功能整合於 `src/views/StoreList.vue`（含 searchCount Badge + 清空按鈕）
- [x] T006 [P] 建立 `src/components/store/StoreCoverSwiper.vue`（Swiper 10，autoplay 3s，fallback logoUrl，16:9）

---

## Phase 3: [US1] 瀏覽店家列表

- [x] T007 [US1] 建立 `src/views/StoreList.vue`（`/store`）：getStores() + StoreCard 格子 + 搜尋 + 空狀態 + 活躍店家排序
- [x] T008 [US1] 路由 `/store/:id` 已加入 `src/router/index.ts`（StoreList, StoreDetail 路由）

---

## Phase 4: [US2] 查看店家詳情與商品

- [x] T009 [US2] 建立 `src/views/StoreDetail.vue`（`/store/:id`）：Promise.allSettled 並行載入 + StoreCoverSwiper + 商品格子 + isActive=false 橫幅
- [x] T010 [US2] `StoreDetail.vue` 已實作 404/403 錯誤處理與「返回店家列表」按鈕

---

## Phase 5: [US3] 從橫幅進入店家頁

- [x] T011 [US3] `/store/:id` 路由已加入 router；SPA fallback 由 Vite 原本設定處理

---

## Phase 6: [US4] 顯示店家營業時間

- [x] T012 [US4] 建立 `src/components/store/BusinessHoursDisplay.vue`：一週 7 天循環顯示（isClosed=true → 紅色「休息」）；今日日期高亮；businessHours 為空/null → 顯示「營業時間：請洽店家」降級
- [x] T013 [US4] 在 `StoreDetail.vue` 整合 BusinessHoursDisplay：`v-if="store.businessHours !== undefined"` 條件顯示

---

## Phase 7: [US5] 行動裝置友善佈局

- [x] T014 [US5] `StoreList.vue` 手機 1 列 / 640px+ 2 列 / 1024px+ 3 列；`StoreDetail.vue` 商品格子手機 2 列 / 640px+ 3 列 / 1024px+ 4 列；StoreCoverSwiper 100% 寬度（CSS 已實作）

---

## Final Phase: Polish

- [x] T015 [P] StoreList 使用 client-side computed filter（instant）；StoreDetail Promise.allSettled 並行請求；效能由瀏覽器 + Vite 優化保障
- [x] T016 [P] StoreDetail 商品卡片為 inline 實作（不重複建立元件）；Skeleton 共用 shimmer CSS animation

---

## Dependencies

```
T001 → T002 → T003
T004, T005, T006 → T007 → T008
T009 → T010
T011 → T008
T012, T013 → T009
T014 → T007, T009
```

## Parallel Opportunities

- T004, T005, T006 可同時開發
- T007（列表）與 T009（詳情）可並行
- T010, T011 可同時進行
- T012, T013 可同時進行
- T015, T016 可同時完成

## Implementation Strategy

MVP = Phase 3（T007 店家列表）+ Phase 4（T009+T010 詳情 + Promise.all）；US3 橫幅連結（T011）+ US5 行動版（T014）可快速完成；US4 營業時間（Phase 6）為選配功能。
