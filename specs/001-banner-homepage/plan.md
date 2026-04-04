# Implementation Plan: 001 — 首頁橫幅輪播

**Branch**: `cli/001-banner-homepage` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-banner-homepage/spec.md`

---

## Summary

實作 KUJI 前台首頁 `/`，核心功能為橫幅輪播（Banner Carousel）。使用已安裝的 **Swiper.js 10** 實作觸控滑動、鍵盤導航、自動播放（4 秒間隔），搭配 `GET /api/banners` 取得 `PUBLISHED` 橫幅資料並依 `displayOrder` 排列。頁面下方含分類快捷區與熱門商品預覽區（商品資料可延後至 011-product-lottery 完成後引入）。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, **Swiper 10.3.1**, Sass |
| **Storage** | Pinia (pinia-plugin-persistedstate → localStorage) |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + iOS Safari 15+ / Chrome Android |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | LCP ≤ 2.5s (3G)；首張橫幅 `loading="eager"`，其餘 `loading="lazy"` |
| **Constraints** | 無需登入；橫幅 API 失敗時靜默降級（不顯示錯誤）；mobile-first |
| **Scale/Scope** | 1 頁面，3 個主要 UI 區塊，1 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/001-banner-homepage/
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
│   └── Home.vue                     # 首頁主組件（已存在，需完善）
├── components/
│   └── banner/
│       ├── BannerSwiper.vue          # Swiper 輪播容器（已存在）
│       ├── BannerSlide.vue           # 單張橫幅 slide
│       └── BannerSkeleton.vue        # 骨架屏
│   └── home/
│       ├── CategoryShortcuts.vue     # 分類快捷區（一番賞/扭蛋/刮刮樂/卡牌）
│       └── HotProductsSection.vue   # 熱門商品區塊
├── stores/
│   └── banner.ts                     # bannersLoading / bannersError / currentIndex
├── services/
│   └── banner.ts                     # GET /api/banners
└── types/
    └── banner.ts                     # Banner interface
```

---

## 主要開發項目

### 1. API Service
- `bannerService.getBanners()` → `GET /api/banners`
- 回傳類型：`Banner[]`（id, storeId, storeName, imageUrl, displayOrder, publishTime, unpublishTime）

### 2. Pinia Store (`banner.ts`)
| State | 類型 | 說明 |
|-------|------|------|
| `banners` | `Banner[]` | API 回傳後依 displayOrder 排序 + 過濾空 imageUrl |
| `bannersLoading` | `boolean` | 骨架屏控制 |
| `bannersError` | `boolean` | 靜默失敗旗標 |
| `currentIndex` | `number` | 當前輪播索引 |
| `autoPlayTimer` | `number \| null` | setInterval ID，組件 onUnmounted 清除 |

### 3. BannerSwiper.vue
- Swiper 10 初始化：`autoplay: { delay: 4000, disableOnInteraction: true }`
- modules: Navigation, Pagination, Autoplay, A11y
- 事件：`slideChange` → 更新 `currentIndex`
- 空陣列 → 隱藏整個輪播區（不顯示錯誤）
- 單張橫幅 → 隱藏箭頭與 Dots

### 4. 響應式規格
| 裝置 | 輪播高度 | 箭頭 |
|------|---------|------|
| 桌機（≥1024px） | 420px | 顯示 |
| 平板（768–1023px） | 300px | 顯示 |
| 手機（<768px） | 180px | 隱藏（滑動手勢） |

---

## 已知缺口（Deferred）

| 項目 | 說明 | 處理方式 |
|------|------|---------|
| `altText` 欄位缺失 | Response 無此欄位 | 前端改用 `storeName` 作為 img alt |
| `linkType` 欄位 | 目前固定導向店家頁 | 延後至後端擴充 |
| API 快取策略 | `stale-while-revalidate` | 規劃階段決定（可用 Axios interceptor） |
