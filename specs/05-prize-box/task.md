# Task Checklist: 05 - 獎品盒

> Branch: `feat/05-prize-box`
> Worktree: `../kuji-client--feat-05/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## Phase 1 — Service 補齊

- [ ] `prizeBoxService.ts`: 新增 `getPrizeBoxHistory(req)` → `GET /prize-box/history`
- [ ] 確認現有 `getMyPrizeBox()`, `getPrizeBoxSummaryByStore()`, `shipPrizeBoxItems()`, `recyclePrizeBoxItems()` 路徑正確

## Phase 2 — usePrizeBox.ts

- [ ] 新建 `src/composables/usePrizeBox.ts`
- [ ] fetchItems() / fetchSummary() / ship(req) / recycle(ids)
- [ ] 回收成功後更新 memberWallet store（addBonus）

## Phase 3 — usePrizeBoxHistory.ts

- [ ] 新建 `src/composables/usePrizeBoxHistory.ts`
- [ ] 分頁 + 狀態過濾（SHIPPED / RECYCLED）

## Phase 4 — 新元件

- [ ] 新建 `src/views/member/PrizeBoxHistory.vue`（歷史紀錄列表 + 分頁）
- [ ] 新建 `src/components/member/PrizeBoxItemCard.vue`（單一獎品卡片）
- [ ] 新建 `src/components/member/ShipSelectionDialog.vue`（出貨確認：選地址）
- [ ] 新建 `src/components/member/RecycleConfirmDialog.vue`（回收確認：不可撤銷警告）

## Phase 5 — PrizeBox.vue 整合

- [ ] 新增 tab 切換（目前獎品 / 歷史紀錄）
- [ ] 整合 usePrizeBox + usePrizeBoxHistory
- [ ] ShipSelectionDialog 整合 useAddressBook（地址選擇）

## Phase 6 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] 獎品盒列表正確顯示 AVAILABLE 獎品
- [ ] 出貨流程：選地址 → 確認 → 成功後獎品從列表消失
- [ ] 回收流程：確認 Dialog → 成功後獎品消失 + 錢包紅利增加
- [ ] 歷史紀錄 tab 正確顯示 SHIPPED / RECYCLED 紀錄
