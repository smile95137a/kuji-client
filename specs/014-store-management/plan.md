# Implementation Plan: 014 — 商店管理

**Branch**: `cli/014-store-management` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-store-management/spec.md`

---

## Summary

實作商店列表頁（`/stores`）與商店詳情頁（`/stores/{id}`）。列表頁公開，支援客戶端搜尋（即時過濾，無 debounce 需求）。詳情頁使用 `Promise.all` 並行呼叫商店資訊 + 商品列表，顯示封面圖輪播、商店簡介、分類篩選商品格子。公開頁面（無需登入），但抽獎按鈕需登入牆。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, Swiper 10.3.1, Sass |
| **Storage** | Pinia（storeList / activeStore / storeProducts） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 列表客戶端搜尋回應 ≤ 50ms；詳情頁 `Promise.all` 並行載入 |
| **Constraints** | 公開頁面；抽獎按鈕需登入；詳情封面圖 Lazy Load |
| **Scale/Scope** | 2 頁面、3 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/014-store-management/
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
│   ├── StoreList.vue               # 商店列表頁（/stores）
│   └── StoreDetail.vue            # 商店詳情頁（/stores/{id}）
├── components/
│   └── store/
│       ├── StoreCard.vue           # 商店卡片（封面縮圖、商店名稱、商品數量）
│       ├── StoreSearchBar.vue      # 商店搜尋框（即時客戶端過濾）
│       ├── StoreCoverSwiper.vue    # 商店詳情封面輪播（Swiper 10）
│       ├── StoreProductGrid.vue    # 商品格子（分類 Tab + 無限捲動）
│       └── StoreInfoSection.vue   # 商店資訊區（Logo、名稱、簡介）
├── stores/
│   └── storeStore.ts              # storeList / searchKeyword / activeStore / storeProducts
├── services/
│   └── store.ts                   # GET /api/stores / GET /api/stores/{id} / GET /api/stores/{id}/products
└── types/
    └── store.ts                   # StoreItem / StoreDetail / StoreProduct
```

---

## 主要開發項目

### 1. 商店列表客戶端搜尋
```typescript
// 一次載入全部商店（假設數量 ≤ 100 間）
// computed 即時過濾
const filteredStores = computed(() =>
  searchKeyword.value.trim() === ''
    ? storeList.value
    : storeList.value.filter(s =>
        s.name.includes(searchKeyword.value) ||
        s.description?.includes(searchKeyword.value)
      )
)
```

### 2. 商店詳情並行載入（Promise.all）
```typescript
// StoreDetail.vue onMounted
const [storeInfo, products] = await Promise.all([
  storeService.getStore(storeId),
  storeService.getStoreProducts(storeId, { page: 1, size: 20 })
])
storeStore.setActiveStore(storeInfo)
storeStore.setStoreProducts(products.items)
```

### 3. 商店封面輪播（Swiper 10）
```typescript
// StoreCoverSwiper.vue
// coverImages: string[] (API 回應)
// 若只有 1 張則隱藏分頁點
<Swiper :slides-per-view="1" :pagination="{ clickable: true }" loop>
  <SwiperSlide v-for="img in coverImages" :key="img">
    <img :src="img" loading="lazy" />
  </SwiperSlide>
</Swiper>
```

### 4. 商店商品分類篩選
- 使用商品的 `LotteryCategory` 做 Tab 篩選（同 011 spec）
- Tab 切換為客戶端過濾（不重呼 API），避免頻繁請求

### 5. 空狀態處理
- 搜尋無結果：顯示「找不到商店「{keyword}」」
- 商店無商品：顯示「此商店目前沒有上架商品」

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| 商店商品分頁 | AV-005：商品數量多時是否有分頁需後端確認 |
| 商店排序 | AV-006：後端是否支援 sort by 人氣/新增時間 |
| 商店狀態 | AV-007：是否有「已關閉」商店需過濾（`status` 欄位） |
