# Plan: 05-ship 賞品盒出貨確認流程

---

## 架構規劃

```
src/
├── services/
│   └── prizeBoxService.ts       ← 補 PrizeBoxShipReq / ShipResult 型別
├── composables/
│   └── usePrizeBoxShip.ts       ← NEW：分單邏輯 + API 提交
└── components/
    └── member/
        └── PrizeBoxShipDialog.vue ← NEW：出貨確認 Dialog
views/
└── member/
    └── PrizeBox.vue              ← 替換 shipByIds() 為開 Dialog
```

---

## 新增檔案

### 1. `usePrizeBoxShip.ts`

```typescript
interface ShipFormData {
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  city: string;
  district: string;
  address: string;
  note: string;
}

interface StoreGroup {
  storeId: string;
  storeName: string;
  items: PrizeBoxItem[];
}

export function usePrizeBoxShip(items: Ref<PrizeBoxItem[]>) {
  // 依 storeId 分組
  const storeGroups: ComputedRef<StoreGroup[]>

  // 表單狀態
  const form: Reactive<ShipFormData>

  // 地址本整合
  const { addresses, fetchAll } = useAddressBook()
  const selectedAddressId: Ref<string>
  const applyAddress(addr): void // 覆寫 form 欄位

  // 提交
  const isSubmitting: Ref<boolean>
  async function submit(): Promise<boolean>
  // → 每個 storeGroup 呼叫一次 shipPrizeBoxItems()
  // → 全部成功 return true，任一失敗 return false（錯誤訊息存 error.value）
  const error: Ref<string>
}
```

### 2. `PrizeBoxShipDialog.vue`

Props:
```typescript
{
  visible: boolean;
  items: PrizeBoxItem[];  // 已勾選的項目（可能跨店）
}
```

Emits:
```typescript
{
  'close': void;
  'success': void;  // 全部成功後 emit，讓父元件 reload
}
```

內部使用 `usePrizeBoxShip(props.items)`

---

## 修改現有檔案

### `prizeBoxService.ts`

補充型別：

```typescript
export interface PrizeBoxShipReq {
  prizeBoxIds: string[];
  recipientName: string;
  recipientPhone: string;
  zipCode?: string;
  city: string;
  district: string;
  address: string;
  note?: string;
}

export interface ShipResultRes {
  orderId: string;
  prizeBoxCount: number;
  totalItems: number;
}
```

`shipPrizeBoxItems` 泛型改為 `ApiResponse<ShipResultRes>`

### `PrizeBox.vue`

- 將 `shipByIds()` 替換為：  
  1. 設定 `shipDialogItems.value = selectedItems`
  2. `shipDialogOpen.value = true`
- 新增 `<PrizeBoxShipDialog>` slot
- 監聽 `@success` → reload + 清空 checkedIds

---

## 不動範圍

- `usePrizeBox.ts`（composable，不需修改）
- 回收流程（不在此次範圍）
- 地址本 CRUD（已有 `useAddressBook`，本次只讀取）
