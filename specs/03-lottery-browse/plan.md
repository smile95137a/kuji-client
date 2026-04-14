# Plan: 03 - 商品瀏覽

> Branch: `feat/03-lottery-browse`
> Worktree: `../kuji-client--feat-03/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## 修正項目

### storeService.ts 路徑修正

```typescript
// 現況
const res = await api.get(`${basePath}`)          // GET /stores
// 正確
const res = await api.get(`${basePath}/list`)      // GET /stores/list
```

---

## 元件邊界確認

```
IchibanList.vue（view）
  ├── ThemeNavigation.vue（分類/主題過濾 tabs）
  ├── IchibanProductList.vue（商品格狀列表）
  │   └── IchibanKujiCard.vue（單一商品卡片）
  └── composables/useLotteryBrowse.ts（fetch + filter + pagination）

IchibanDetail.vue（view，依 playMode 分流）
  ├── OfficialIchibanView.vue（LOTTERY_MODE 非 GACHA，一番賞/卡牌）
  ├── GachaView.vue（LOTTERY_MODE + category='GACHA'，扭蛋）
  └── ScratchCard.vue（SCRATCH_MODE，刮刮樂）
```

---

## useLotteryBrowse.ts（新建/確認）

```typescript
// 職責: 商品列表 fetch + 分類過濾 + 分頁
export function useLotteryBrowse() {
  const items = ref<LotteryBrowseRes[]>([])
  const isLoading = ref(false)
  const filters = ref<BrowseLotteryListReq>({ page: 1, size: 20 })

  async function load() { ... }
  function applyFilter(f: Partial<BrowseLotteryListReq>) { ... }

  return { items, isLoading, filters, load, applyFilter }
}
```

---

## playMode 分流邏輯（IchibanDetail.vue）

```typescript
// 決定顯示哪個子元件
const drawComponent = computed(() => {
  if (lottery.value?.playMode === 'SCRATCH_MODE') return ScratchCard
  if (lottery.value?.category === 'GACHA') return GachaView
  return OfficialIchibanView
})
```

分流邏輯集中在 `IchibanDetail.vue`，子元件不負責判斷。
