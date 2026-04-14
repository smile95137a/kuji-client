# Plan: 05 - 獎品盒

> Branch: `feat/05-prize-box`
> Worktree: `../kuji-client--feat-05/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## 補齊項目

### prizeBoxService.ts 新增 getPrizeBoxHistory()

```typescript
export async function getPrizeBoxHistory(req: PrizeBoxHistoryReq) {
  const res = await api.get('/prize-box/history', { params: { ...req } })
  return res.data?.data
}
```

---

## 元件邊界

```
PrizeBox.vue（view）
  ├── PrizeBoxTabs.vue（tab: 目前獎品 | 歷史紀錄）
  ├── PrizeBoxAvailable.vue（AVAILABLE 獎品 + 操作）
  │   ├── PrizeBoxItemCard.vue（單一獎品卡片）
  │   ├── ShipSelectionDialog.vue（選地址 + 確認出貨）
  │   └── RecycleConfirmDialog.vue（回收不可撤銷確認）
  └── PrizeBoxHistory.vue（歷史紀錄列表 + 分頁）

Composables:
  usePrizeBox.ts（AVAILABLE 獎品 + 出貨 + 回收）
  usePrizeBoxHistory.ts（歷史紀錄 + 分頁 + 狀態過濾）
```

---

## usePrizeBox.ts 設計

```typescript
export function usePrizeBox() {
  const items = ref<PrizeBoxItemRes[]>([])
  const summary = ref<PrizeBoxSummary[]>([])

  async function fetchItems() { ... }
  async function fetchSummary() { ... }

  // 出貨: 先 getPrizeBoxSummaryByStore() 確認店家分組，再 ship()
  async function ship(req: ShipReq) {
    await prizeBoxService.shipPrizeBoxItems(req)
    await fetchItems()   // 更新列表
  }

  async function recycle(ids: string[]) {
    const res = await prizeBoxService.recyclePrizeBoxItems({ ids })
    memberWallet.addBonus(res.bonusEarned)
    await fetchItems()
  }

  return { items, summary, fetchItems, fetchSummary, ship, recycle }
}
```

---

## ShipSelectionDialog.vue 規格

1. 顯示選擇的獎品列表（依店家分組）
2. 選擇收件地址（從 `useAddressBook()` 取得列表）
3. 確認後呼叫 `ship()`
4. 成功後 toast「申請出貨成功，訂單已建立」

## RecycleConfirmDialog.vue 規格

- 顯示「回收後不可撤銷，確定換取 N 紅利？」
- 確認後呼叫 `recycle()`
- 成功後 toast「回收成功，獲得 N 紅利」+ 更新 memberWallet store
