# Tasks: 001 — 首頁橫幅輪播

**Feature**: Banner Homepage | **Branch**: `cli/001-banner-homepage` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/banner.ts`，定義 `Banner` interface（id, storeId, storeName, imageUrl, displayOrder, publishTime, unpublishTime）
- [ ] T002 建立 `src/services/banner.ts`，實作 `bannerService.getBanners()` 呼叫 `GET /api/banners`，回傳 `Banner[]`
- [ ] T003 建立 `src/stores/banner.ts`，定義 Pinia store：banners / bannersLoading / bannersError / currentIndex（含 fetchBanners action，依 displayOrder 排序 + 過濾空 imageUrl）

---

## Phase 2: Foundational

- [ ] T004 [P] 建立 `src/components/banner/BannerSkeleton.vue`，保留輪播高度的骨架屏（依響應式規格：桌機 420px / 平板 300px / 手機 180px）
- [ ] T005 [P] 建立 `src/components/banner/BannerSlide.vue`，單張橫幅 slide（圖片 object-fit:cover，storeId 為空則禁用點擊，imageUrl 失敗顯示佔位圖）
- [ ] T006 [P] 建立 `src/components/home/CategoryShortcuts.vue`，4 個快捷圖示（一番賞/扭蛋/刮刮樂/卡牌），導向對應路由

---

## Phase 3: [US1] 進入首頁看到輪播橫幅

- [ ] T007 [US1] 建立 `src/components/banner/BannerSwiper.vue`，整合 Swiper 10（modules: Navigation, Pagination, Autoplay, A11y；autoplay: delay 4000ms；slideChange 事件更新 currentIndex；單張時隱藏箭頭與 Dots；空陣列時隱藏整個輪播區）
- [ ] T008 [US1] 完善 `src/views/Home.vue`：onMounted 呼叫 fetchBanners；載入中顯示 BannerSkeleton；資料載入後渲染 BannerSwiper；下方接 CategoryShortcuts 與 HotProductsSection；設定 `<title>` 為 "KUJI — 線上扭蛋・一番賞平台"（FR-UI-008）
- [ ] T009 [US1] 在 `BannerSwiper.vue` 實作點擊橫幅導向 `/stores/{storeId}`（storeId 為空時不導向，FR-UI-005）；第一張圖片 `loading="eager"`，其餘 `loading="lazy"`（SC-002）
- [ ] T010 [P] [US1] 建立 `src/components/home/HotProductsSection.vue`，熱門商品預覽區塊（UI 佔位，資料待 011 完成後接入）

---

## Phase 4: [US2] 行動裝置瀏覽橫幅

- [ ] T011 [US2] 在 `BannerSwiper.vue` 確認 Swiper 10 觸控滑動（touch enabled by default）；在 Sass 樣式中添加響應式斷點，手機 `<768px` 隱藏箭頭（CSS `.swiper-button-prev/.next { display: none }`），圖片比例 16:9 或 2:1（FR-UI-004）

---

## Phase 5: [US3] 橫幅店家已停用

- [ ] T012 [US3] 在 `src/stores/banner.ts` 的 fetchBanners action 中：過濾 imageUrl 為空或 null 的橫幅（DP-002）；過濾後為空時設定 bannersEmpty 旗標，Home.vue 顯示靜態品牌佔位圖（SM-003）
- [ ] T013 [US3] 在 `BannerSwiper.vue` 中 storeName 為 null 時安全降級（AV-006 null 保護）；img 的 alt 屬性使用 `storeName || 'KUJI Banner'`（AV-007 workaround）

---

## Final Phase: Polish

- [ ] T014 [P] 在 `src/services/banner.ts` 添加 Axios request config（headers Cache-Control: stale-while-revalidate 或 maxAge，AV-008 降級方案）
- [ ] T015 [P] 確認 `Home.vue` 的 `<title>` SEO 設定（FR-UI-008）；在 BannerSwiper 加上 ARIA 屬性（aria-label="橫幅輪播"，role="region"）確保 WCAG 2.1 AA（SC-006）

---

## Dependencies

```
T001 → T002 → T003
T003 → T007 → T008 → T009
T004, T005 → T007
T006, T010 → T008
T012, T013 → T008
```

## Parallel Opportunities

- T004, T005, T006 可同時開發（各自獨立 UI 組件）
- T010 可先建立佔位 UI，不依賴 T007 完成

## Implementation Strategy

MVP = Phase 3（T007+T008+T009）即可驗收 US1；US2/US3 為增強項。
