# Spec: 05 - 獎品盒

> 來源: `specs/05-prize-box.md`
> Branch: `feat/05-prize-box`
> 路徑前綴: `/prize-box`（均需 Token）

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/prize-box` | 取得目前獎品盒（AVAILABLE 狀態） |
| GET | `/prize-box/history` | 歷史紀錄（SHIPPED/RECYCLED）← **目前程式碼缺失** |
| GET | `/prize-box/summary` | 依店家彙總（出貨前確認用） |
| POST | `/prize-box/ship` | 申請出貨 |
| POST | `/prize-box/recycle` | 回收換紅利 |

---

## /prize-box/history 請求規格

```typescript
interface PrizeBoxHistoryReq {
  condition?: {
    status?: 'SHIPPED' | 'RECYCLED'
  }
  page?: number   // 從 1 開始
  size?: number
}
```

---

## PrizeBoxItemRes 型別

```typescript
interface PrizeBoxItemRes {
  id: string
  lotteryId: string
  lotteryName: string
  storeId: string
  storeName: string
  prizeName: string
  prizeLevel: string
  prizeImageUrl: string | null
  status: 'AVAILABLE' | 'SHIPPED' | 'RECYCLED'
  recycleBonus: number    // 回收可得紅利數量
  wonAt: string           // 抽到時間
}
```

---

## 出貨業務規則

- 同一張訂單只能包含**同一家店**的獎品（跨店須分別申請）
- 申請出貨前需選擇收件地址
- 出貨後狀態變 `SHIPPED`，產生對應訂單

## 回收業務規則

- 立即換算紅利（比例依商品設定的 `recycleBonus`）
- 回收後狀態變 `RECYCLED`，**不可撤銷**
- 需顯示確認提示（不可撤銷警告）
