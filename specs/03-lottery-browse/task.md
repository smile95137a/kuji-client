# Task Checklist: 03 - 商品瀏覽

> Branch: `feat/03-lottery-browse`
> Worktree: `../kuji-client--feat-03/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## Phase 1 — Service 修正

- [ ] `storeService.ts`: `getStores()` URL 改為 `GET /stores/list`（加 /list 後綴）
- [ ] 確認 `lotteryBrowseService.queryBrowseLotteries()` 打 `POST /lottery/browse/list`（已正確）
- [ ] 確認 `lotteryBrowseService.getBrowseLotteryById()` 打 `GET /lottery/browse/{id}/detail`（已正確）

## Phase 2 — useLotteryBrowse.ts

- [ ] 新建/確認 `src/composables/useLotteryBrowse.ts` 存在
- [ ] items, isLoading, filters, load(), applyFilter()
- [ ] 分頁 pagination support

## Phase 3 — IchibanDetail.vue 分流確認

- [ ] playMode = SCRATCH_MODE → 顯示 ScratchCard.vue
- [ ] playMode = LOTTERY_MODE + category = GACHA → 顯示 GachaView.vue
- [ ] playMode = LOTTERY_MODE + category ≠ GACHA → 顯示 OfficialIchibanView.vue
- [ ] 分流邏輯集中在 IchibanDetail.vue（子元件不重複判斷）

## Phase 4 — 商品卡片/列表確認

- [ ] IchibanKujiCard.vue: 顯示 remainingTickets / totalTickets
- [ ] IchibanKujiCard.vue: status = 'SOLD_OUT' 時顯示售完樣式
- [ ] IchibanKujiCard.vue: status = 'INACTIVE' 時顯示下架樣式
- [ ] 確認未抽籤位不顯示 prizeId/prizeLevel

## Phase 5 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] 商品列表正常載入
- [ ] 店家列表 `/stores/list` 200 回應
- [ ] playMode 分流正確（GACHA 顯示扭蛋介面，其他顯示一番賞介面）
