# Task Checklist: 05-ship 賞品盒出貨確認流程

---

## Phase 1 — Service 補型別

- [ ] `prizeBoxService.ts`：補 `PrizeBoxShipReq` interface
- [ ] `prizeBoxService.ts`：補 `ShipResultRes` interface
- [ ] `shipPrizeBoxItems()` 泛型改為 `ApiResponse<ShipResultRes>`

## Phase 2 — usePrizeBoxShip composable

- [ ] 新建 `src/composables/usePrizeBoxShip.ts`
- [ ] `storeGroups` computed：依 storeId 分組傳入的 items
- [ ] `form` reactive：recipientName / recipientPhone / zipCode / city / district / address / note
- [ ] `addresses` + `fetchAddresses()`：使用 useAddressBook 載入
- [ ] `applyAddress(addr)`：覆寫 form 欄位
- [ ] 預設地址自動套用（isDefault = true）
- [ ] `submit()`：逐 storeGroup 呼叫 shipPrizeBoxItems，全成功 return true
- [ ] `error` ref：失敗時存入錯誤訊息
- [ ] `isSubmitting` ref

## Phase 3 — PrizeBoxShipDialog 元件

- [ ] 新建 `src/components/member/PrizeBoxShipDialog.vue`
- [ ] Props: `visible`, `items`
- [ ] Emit: `close`, `success`
- [ ] 區塊一：出貨清單（依店家分組 + 分單提示）
- [ ] 區塊二：地址本 select（切換後自動填入欄位）
- [ ] 區塊三：表單欄位（recipientName, phone, city, district, address, zipCode, note）
- [ ] 區塊四：費用摘要（件數 + 免費 + 說明）
- [ ] 確認按鈕：disabled 條件（submitting 或 表單未完整）
- [ ] 關閉前 dirty check
- [ ] `@success` emit → 父元件 reload

## Phase 4 — PrizeBox.vue 接線

- [ ] 新增 `shipDialogOpen` + `shipDialogItems` ref
- [ ] `shipOne(row)` 開 Dialog（傳入 [row]）
- [ ] `batchShip()` 開 Dialog（傳入 Array.from(checkedIds) 對應的 rows）
- [ ] 掛載 `<PrizeBoxShipDialog>`
- [ ] 監聽 `@success` → clearChecked + loadPrizeBox()

## Phase 5 — 驗收

- [ ] 單筆出貨：點「申請出貨」開 Dialog，填地址，送出成功
- [ ] 批次出貨同一家店：一筆訂單
- [ ] 批次出貨跨兩家店：自動分成兩筆訂單，分單提示正確
- [ ] 預設地址自動填入 recipientName + phone + 地址欄位
- [ ] 切換地址 → 欄位自動更新
- [ ] 必填欄位空白 → 按鈕 disabled / 表單 validate
- [ ] 送出成功 → Dialog 關閉 + 清單重載
