# Task Checklist: 00 - 整體架構清理

> Branch: `feat/00-architecture`
> Worktree: `../kuji-client--feat-00/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## Phase 1 — 型別集中化

- [ ] 新建 `src/types/api.ts`（ApiResponse\<T\>, PageResult\<T\>）
- [ ] 新建 `src/types/enums.ts`（WalletTransactionType, OrderStatus, PlayMode, LotteryCategory 等）
- [ ] 各 service 中 inline 的重複型別改為從 `@/types/` import
- [ ] `tsconfig.json` 確認 paths alias `@` 正確指向 `src/`

## Phase 2 — Router RouteMeta 型別

- [ ] `router/index.ts` 加入 RouteMeta 擴充：`interface RouteMeta { requiresAuth?: boolean }`

## Phase 3 — 孤兒檔案清理

- [ ] 刪除 `src/views/About copy.vue`
- [ ] 刪除 `src/views/DialogTestPage.vue`
- [ ] `router/index.ts` 移除 `/demo-dialogs` 路由
- [ ] 刪除 `src/views/DemoDialogs.vue`（確認無其他引用）
- [ ] 開啟 `src/views/member/OrderList.vue`，確認與 `OrderHistory.vue` 差異後刪除（若是舊版）

## Phase 4 — Transaction.vue 確認

- [ ] 開啟 `src/views/Transaction.vue` 確認用途
- [ ] 加入 JSDoc 說明此頁面的定位（活動/促銷 vs 個人帳務）
- [ ] 若與 TransactionHistory.vue 重複 → 刪除並移除路由

## Phase 5 — 驗收

- [ ] `npm run build` 無 TypeScript 錯誤
- [ ] `npm run build` 無未使用 import 警告
