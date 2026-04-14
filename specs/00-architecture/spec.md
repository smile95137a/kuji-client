# Spec: 00 - 整體架構

> 來源: `specs/00-architecture.md`
> Branch: `feat/00-architecture`

---

## API 基礎設定

- Base URL: `http://localhost:8080/api`
- 所有 API 回應統一包裝為 `ApiResponse<T>`
- accessToken 有效期 ~30 分鐘，refreshToken ~7 天

## ApiResponse\<T\> 型別

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
  meta: { timestamp: string; requestId: string }
}
```

取資料方式: `response.data.data`（兩層 data）

## HTTP 狀態碼語意

| Code | 含義 | 前端行為 |
|------|------|---------|
| 200/201 | 成功 | 讀 data |
| 204 | 無 body 成功 | 忽略 body |
| 400 | 參數錯誤 | 顯示 error.message |
| 401 | Token 過期/未登入 | 自動 refresh |
| 403 | 無權限/帳號停用 | 顯示提示訊息 |
| 404 | 資源不存在 | 顯示找不到 |
| 409 | 衝突（Email 重複等） | 顯示具體訊息 |
| 423 | 商品下架/無法操作 | 顯示狀態說明 |
| 500 | 伺服器錯誤 | 顯示「稍後再試」 |

## 公開端點（不需 Token）

```
GET  /stores/list
POST /lottery/browse/list
GET  /lottery/browse/{id}/detail
GET  /recharge-plan/list, /recharge-plan/{id}
GET  /news/**, /banner/**, /marquee/**
POST /auth/register, /auth/login, /auth/google
POST /auth/refresh, /auth/forgot-password, /auth/reset-password
```

## 需要登入的端點

```
GET/PUT  /user/me, /user/me/avatar, /user/me/change-password
GET/POST /user/addresses/**
POST     /lottery/draw/{id}/draw, /lottery/draw/{id}/designate
GET      /lottery/draw/{id}/session
POST     /lottery/random/{id}/draw
GET/POST /prize-box/**
POST/GET /order/**, /order/{id}/shipping-info
GET/POST /wallet/**, /wallet/transactions
POST     /recharge, GET /recharge/history
GET/POST /referral/**
```

## 孤兒檔案（待清理）

| 檔案 | 問題 | 行動 |
|------|------|------|
| `src/views/About copy.vue` | 重複檔案 | 刪除 |
| `src/views/DialogTestPage.vue` | dev 測試頁，未掛路由 | 刪除 |
| `router` 的 `/demo-dialogs` | dev 路由 | 移除路由 + 刪除 DemoDialogs.vue |
| `src/views/member/OrderList.vue` | 未掛路由，疑似舊版 | 確認後刪除 |

## Transaction 路由說明

- `/transaction`（公開）→ `Transaction.vue` = 活動/促銷紀錄頁
- `/member-center/transaction-history`（需登入）→ `TransactionHistory.vue` = 個人帳務
