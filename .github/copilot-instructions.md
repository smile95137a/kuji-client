# kuji-client Copilot 指南

> 本文件為前端 Vue3 專案的 Copilot 快速參考。所有後端邏輯請參閱 `.github/agents/copilot-instructions.md`。

---

## 摘要

| 項目 | 內容 |
|------|------|
| 框架 | **Vue 3** (Composition API) + **Vite** |
| 語言 | **TypeScript** |
| 狀態管理 | **Pinia** |
| HTTP 客戶端 | **Axios**（封裝於 `src/services/FrontAPI.ts`） |
| 路由 | **Vue Router 4** |
| 樣式 | CSS / SCSS（`src/assets/styles/`） |
| 環境變數 | `VITE_BASE_API_URL`（`.env` 中設定） |

---

## 快速命令

```bash
npm run dev       # 開發模式（Vite HMR）
npm run build     # 正式打包
npm run preview   # 預覽打包結果
```

---

## 核心架構

### 目錄結構

```
src/
├── assets/          # 圖片、樣式
├── components/      # 共用元件（common/、front/、header/ 等子目錄）
├── composables/     # 可重用組合式函數（useXxx.ts）
├── layouts/         # 頁面布局（FrontLayout.vue）
├── router/          # 路由設定（index.ts）
├── services/        # API 服務層（每個功能一個 .ts 檔）
│   └── FrontAPI.ts  # Axios 實例 + 攔截器（核心，勿輕易改動）
├── stores/          # Pinia stores
│   ├── useAuthStore.ts    # 登入狀態、token 管理
│   ├── memberWallet.ts    # 錢包餘額
│   └── overlay.ts         # UI overlay 狀態
├── utils/           # 工具函數（Localstorage.ts 等）
└── views/           # 頁面元件（含 member/ 子目錄）
```

### FrontAPI.ts — Axios 攔截器

`FrontAPI.ts` 是所有 API 呼叫的入口，不要直接引入 `axios`：

```typescript
import { api } from '@/services/FrontAPI';
```

**行為說明：**
- `baseURL` = `${VITE_BASE_API_URL}/api`，所有 service 中的 `basePath` 都是相對路徑（如 `/auth`、`/news`）
- 每次請求自動從 localStorage 讀取 token，附加 `Authorization: Bearer {token}` header
- 收到 401 時自動嘗試 **Refresh Token**（`POST /api/admin/auth/refresh-token`）
- Refresh 成功 → 更新 localStorage，重送原始請求
- Refresh 失敗 → 清除所有認證狀態，跳轉至 `/login`
- 同時發出多個 401 時使用 `pendingQueue` 防止重複 refresh

### useAuthStore — 登入狀態

```typescript
import { useAuthStore } from '@/stores/useAuthStore';
const authStore = useAuthStore();

authStore.isLogin        // computed: 是否已登入
authStore.user           // 當前使用者資訊
authStore.token          // 存取 token
authStore.setAuth(res)   // 登入成功後呼叫，傳入後端 AuthRes
authStore.logout()       // 清除所有登入狀態
authStore.initAuth()     // App 啟動時還原 localStorage 狀態（在 App.vue 呼叫）
```

**LocalStorage keys：**

| Key | 內容 |
|-----|------|
| `kujiToken` | 存取 token |
| `refreshKujiToken` | refresh token |
| `kujiTokenType` | token 類型（預設 `Bearer`） |
| `kujiUser` | 使用者物件 |

---

## Service 層慣例

每個 service 檔案格式：

```typescript
import { api } from './FrontAPI';

const basePath = '/xxx';  // 相對於 /api，不要加 /api 前綴

export async function getXxx(): Promise<XxxRes> {
  const res = await api.get(`${basePath}/detail`);
  return res.data?.data;  // 後端統一格式：res.data = ApiResponse
}
```

### Service basePath 速查

| Service | basePath | 說明 |
|---------|----------|------|
| `AuthService` | `/auth` | 登入、註冊、Google OAuth、忘記密碼 |
| `bannerService` | `/banner` | 輪播 Banner |
| `categoryService` | `/category` | 分類、主題、標籤 |
| `consumptionRecordService` | `/consumption-records` | 消費紀錄 |
| `districtService` | `/district` | 地區資料 |
| `enumService` | `/enums` | 枚舉值查詢 |
| `lotteryBrowseService` | `/lottery/browse` | 商品列表 / 詳情 |
| `lotteryDrawService` | `/lottery/draw` | 一番賞抽獎（選號制） |
| `lotteryRandomService` | `/lottery/random` | 扭蛋抽獎（隨機制） |
| `marqueeService` | `/marquee` | 跑馬燈公告 |
| `newsService` | `/news` | 最新消息 |
| `orderService` | `/order` | 訂單查詢 |
| `prizeBoxService` | `/prize-box` | 賞品盒 |
| `rechargePlanService` | `/recharge-plan` | 儲值方案 |
| `rechargeService` | `/recharge` | 儲值 |
| `storeService` | `/stores` | 店家 |
| `userService` | `/user` | 會員資料 |
| `userAddressService` | `/user/addresses` | 收件地址 |
| `walletService` | ⚠️ `/api/wallet` | 錢包（注意：含 `/api` 前綴，實際路徑為 `/api/api/wallet`，需修正） |

> ⚠️ **已知問題**：`walletService.ts` 的 `basePath = '/api/wallet'` 含有多餘的 `/api` 前綴（FrontAPI 的 baseURL 已含 `/api`），實際請求路徑會是 `/api/api/wallet`。修改時請留意。

### ApiResponse 解析

後端統一回傳格式：

```typescript
// 成功
{ success: true, code: "OK", message: "success", data: { ... } }

// 失敗
{ success: false, code: "BUSINESS_ERROR", error: { message: "..." }, data: null }
```

取得 data：

```typescript
const res = await api.post(`${basePath}/list`, req);
const data = res.data?.data;          // 資料主體
const success = res.data?.success;    // 是否成功
```

---

## 路由設定

路由定義在 `src/router/index.ts`，所有頁面以 `FrontLayout` 為父層：

```
/home           → Home.vue
/news           → News.vue（需登入）
/store          → StoreList.vue
/store/:id      → StoreDetail.vue
/member/*       → MemberCenter.vue（下轄子路由，需登入）
```

**路由守衛：** 在 `router/index.ts` 的 `router.beforeEach` 中，依據 `authStore.isLogin` 判斷是否需要登入。

---

## 常見問題排查

### 401 / Token 過期
1. 確認 `kujiToken` 在 localStorage 中存在
2. 確認 `VITE_BASE_API_URL` 在 `.env` 中正確設定（不要以 `/` 結尾）
3. Refresh token 流程由 `FrontAPI.ts` 自動處理，無需手動干預

### 登入後狀態不同步
- 確認 `App.vue` 的 `onMounted` 有呼叫 `authStore.initAuth()`
- 確認 `authStore.setAuth(res)` 在登入 API 成功回調中被呼叫

### 新增 Service
1. 在 `src/services/` 建立 `xxxService.ts`
2. 設定 `const basePath = '/xxx'`（**勿加 `/api` 前綴**）
3. 用 `api` 實例呼叫（從 `FrontAPI.ts` 引入）

### Pinia store hydration
- 建立新的 store 時，初始值從 `loadState<T>(key)` 取得
- 異動後呼叫 `saveState(key, value)` 持久化

---

## 不得隨意更動的部分

| 檔案 / 方法 | 原因 |
|------------|------|
| `src/services/FrontAPI.ts` | Axios 實例與攔截器，影響全部 API 呼叫及 token 刷新邏輯 |
| `useAuthStore.initAuth()` | App 啟動鉤子，確保 localStorage 狀態還原 |
| `router/index.ts` 的路由守衛 | 控制所有頁面的存取權限 |
| LocalStorage keys（`kujiToken` 等） | 改動後舊資料無法讀取，導致登出 |
