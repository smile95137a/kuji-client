# Plan: 00 - 整體架構清理

> Branch: `feat/00-architecture`
> Worktree: `../kuji-client--feat-00/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## 目標

1. 建立統一型別定義（`src/types/`）
2. 清理孤兒開發用檔案
3. 確認 Transaction.vue 定位

---

## 新建 `src/types/api.ts`

集中放所有通用 API 型別：

```typescript
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
  meta: { timestamp: string; requestId: string }
}

export interface PageResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
```

---

## 新建 `src/types/enums.ts`

集中所有 enum 型別（目前散落在各 service 內）：

```typescript
export type WalletTransactionType = 'RECHARGE' | 'DRAW_GOLD' | 'DRAW_BONUS' | 'RECYCLE_BONUS' | 'REFERRAL_BONUS' | 'ADMIN_ADJUST' | 'EXPIRE'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type UserProvider = 'EMAIL' | 'GOOGLE'
export type PlayMode = 'LOTTERY_MODE' | 'SCRATCH_MODE'
export type LotteryCategory = 'OFFICIAL_ICHIBAN' | 'GACHA' | 'TRADING_CARD' | 'CUSTOM_GACHA'
export type PrizeBoxStatus = 'AVAILABLE' | 'SHIPPED' | 'RECYCLED'
```

---

## 孤兒檔案清理

| 動作 | 對象 |
|------|------|
| 刪除 | `src/views/About copy.vue` |
| 刪除 | `src/views/DialogTestPage.vue` |
| router 移除路由 + 刪除檔案 | `DemoDialogs.vue` + `/demo-dialogs` 路由 |
| 確認後決定 | `src/views/member/OrderList.vue`（取代還是刪除） |

---

## Transaction.vue 定位確認

打開 `Transaction.vue` 確認內容，若是活動/促銷紀錄加上 JSDoc 說明；
若是個人帳務的重複版本則刪除並移除路由。

---

## RouteMeta 型別補充

`router/index.ts` 加上 `RouteMeta` 擴充：

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}
```
