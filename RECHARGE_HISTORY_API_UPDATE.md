# 儲值紀錄 API 更新說明

## 📅 更新日期
2026-02-08

---

## ⚠️ 重大變更：棄用錢包交易 API

### 舊版（已廢棄）❌
```
GET /api/wallet/transactions
```
**問題**：
- 混合了所有交易類型（抽獎、儲值、回收...）
- 需要用 `transactionType: 'RECHARGE'` 過濾
- 資料結構不完整（缺少儲值方案資訊、紅利等）

---

## ✅ 新版：儲值記錄專用 API

### 端點
```
GET /api/recharge/history?page=1&size=10
```

### 後端實作
```java
@GetMapping("/history")
public ResponseEntity<List<RechargeRes>> getMyRechargeHistory(
    @RequestParam(defaultValue = "1") Integer page,
    @RequestParam(defaultValue = "10") Integer size) {
    String userId = SecurityUtils.getCurrentUserId();
    List<RechargeRes> history = rechargeService.getUserRechargeHistory(userId, page, size);
    return ResponseEntity.ok(history);
}
```

### Response 結構
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "planId": "68bcafb9-2ab8-4b17-a5d0-8b91c6c4d5e6",
      "amount": 500,
      "goldCoins": 500,
      "bonusCoins": 50,
      "paymentMethod": "ECPAY",
      "paymentStatus": "COMPLETED",
      "paymentGateway": "ECPAY",
      "transactionId": "2026020812345678",
      "failReason": null,
      "createdAt": "2026-02-08T10:30:00Z",
      "paidAt": "2026-02-08T10:31:00Z"
    }
  ]
}
```

---

## 🔧 前端更新

### 1. `src/services/rechargeService.ts`

**新增函數**：
```typescript
/**
 * 查詢我的儲值記錄 GET /api/recharge/history
 */
export const getMyRechargeHistory = async (
  page: number = 1,
  size: number = 10
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await api.get(`${basePath}/history`, {
      params: { page, size },
    });
    return res.data;
  } catch (e) {
    console.error('Recharge - getMyRechargeHistory error:', e);
    throw e;
  }
};
```

---

### 2. `src/views/member/DepositHistory.vue`

#### 變更 1：Import 改變
```typescript
// ❌ 舊版
import { getMyWalletTransactions } from '@/services/walletService';

// ✅ 新版
import { getMyRechargeHistory } from '@/services/rechargeService';
```

#### 變更 2：Type 定義更新
```typescript
// ❌ 舊版
type PayMethod = 'CREDIT_CARD' | 'ATM' | 'CVS' | string;
type Status = 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED' | 'SUCCESS' | string;

type DepositHistoryRow = {
  id: string;
  createdAt: string;
  orderNo: string;
  amount: number;
  payMethod: PayMethod;
  status: Status;
};

// ✅ 新版
type PayMethod = 'ECPAY' | 'OPAY' | 'CREDIT_CARD' | string;
type Status = 'PENDING' | 'COMPLETED' | 'FAILED' | string;

type DepositHistoryRow = {
  id: string;
  createdAt: string;
  orderNo: string;
  amount: number;
  goldCoins: number;        // ✅ 新增
  bonusCoins: number;       // ✅ 新增
  payMethod: PayMethod;
  status: Status;
  paidAt?: string;          // ✅ 新增
};
```

#### 變更 3：載入資料邏輯
```typescript
// ❌ 舊版
const res = await getMyWalletTransactions({
  condition: { transactionType: 'RECHARGE' },
  sortBy: 'created_at',
  sortOrder: 'DESC',
});

// ✅ 新版
const res = await getMyRechargeHistory(1, 100);
```

#### 變更 4：資料映射
```typescript
// ❌ 舊版
rows.value = res.data.map((t: any) => ({
  id: String(t.id || ''),
  createdAt: formatDate(t.createdAt),
  orderNo: t.orderId || t.id || '',
  amount: Number(t.amount ?? 0),
  payMethod: t.paymentMethod || 'CREDIT_CARD',
  status: t.status || 'PAID',
}));

// ✅ 新版
rows.value = res.data.map((r: any) => ({
  id: String(r.id || ''),
  createdAt: formatDateTime(r.createdAt),
  orderNo: r.id || '',
  amount: Number(r.amount ?? 0),
  goldCoins: Number(r.goldCoins ?? 0),
  bonusCoins: Number(r.bonusCoins ?? 0),
  payMethod: r.paymentMethod || 'ECPAY',
  status: r.paymentStatus || 'PENDING',
  paidAt: r.paidAt ? formatDateTime(r.paidAt) : undefined,
}));
```

#### 變更 5：狀態標籤
```typescript
// ❌ 舊版
const statusLabel = (s: Status) => {
  if (s === 'PAID' || s === 'SUCCESS') return '已付款';
  if (s === 'PENDING') return '待付款';
  if (s === 'FAILED') return '失敗';
  if (s === 'CANCELED') return '已取消';
  return s;
};

// ✅ 新版
const statusLabel = (s: Status) => {
  if (s === 'COMPLETED') return '已完成';
  if (s === 'PENDING') return '待付款';
  if (s === 'FAILED') return '失敗';
  return s;
};
```

#### 變更 6：支付方式標籤
```typescript
// ❌ 舊版
const payLabel = (m: PayMethod) => {
  if (m === 'CREDIT_CARD') return '信用卡';
  if (m === 'ATM') return 'ATM 轉帳';
  if (m === 'CVS') return '超商代碼';
  return m;
};

// ✅ 新版
const payLabel = (m: PayMethod) => {
  if (m === 'ECPAY') return '綠界支付';
  if (m === 'OPAY') return '歐付寶';
  if (m === 'CREDIT_CARD') return '信用卡';
  return m;
};
```

#### 變更 7：狀態選項（Template）
```vue
<!-- ❌ 舊版 -->
<select class="depositHistory__input" v-model="status">
  <option value="">全部</option>
  <option value="PAID">已付款</option>
  <option value="PENDING">待付款</option>
  <option value="FAILED">失敗</option>
  <option value="CANCELED">已取消</option>
</select>

<!-- ✅ 新版 -->
<select class="depositHistory__input" v-model="status">
  <option value="">全部</option>
  <option value="COMPLETED">已完成</option>
  <option value="PENDING">待付款</option>
  <option value="FAILED">失敗</option>
</select>
```

---

## 📊 資料對照表

| 舊欄位 (Wallet Transactions) | 新欄位 (Recharge History) | 說明 |
|------------------------------|---------------------------|------|
| `t.id` | `r.id` | 記錄 ID |
| `t.orderId` | `r.id` | 訂單號（儲值記錄 ID） |
| `t.amount` | `r.amount` | 儲值金額（台幣） |
| `t.paymentMethod` | `r.paymentMethod` | 支付方式 |
| `t.status` | `r.paymentStatus` | 支付狀態 |
| ❌ 無 | `r.goldCoins` | ✅ 獲得金幣 |
| ❌ 無 | `r.bonusCoins` | ✅ 獲得紅利 |
| ❌ 無 | `r.planId` | ✅ 儲值方案 ID |
| ❌ 無 | `r.paidAt` | ✅ 支付時間 |
| ❌ 無 | `r.transactionId` | ✅ 支付網關交易 ID |

---

## 🎯 優勢比較

### 舊版（Wallet Transactions API）
- ❌ 需要用 `transactionType: 'RECHARGE'` 過濾
- ❌ 回傳所有交易（抽獎/儲值/回收...混在一起）
- ❌ 缺少儲值方案資訊
- ❌ 缺少紅利贈送資訊
- ❌ 資料結構不明確

### 新版（Recharge History API）
- ✅ 專門用於儲值記錄
- ✅ 完整的儲值資訊（方案、金幣、紅利）
- ✅ 支付狀態清晰（PENDING/COMPLETED/FAILED）
- ✅ 包含支付時間（`paidAt`）
- ✅ 包含支付網關交易 ID（`transactionId`）
- ✅ 資料結構與後端 `RechargeRes` 一致

---

## ✅ 測試檢查清單

- [ ] 進入儲值紀錄頁面自動載入資料
- [ ] 顯示儲值金額、獲得金幣、獲得紅利
- [ ] 顯示支付方式（綠界/歐付寶/信用卡）
- [ ] 顯示支付狀態（待付款/已完成/失敗）
- [ ] 狀態過濾正常運作
- [ ] 日期過濾正常運作
- [ ] 關鍵字搜尋正常運作
- [ ] 分頁功能正常運作

---

## 🚀 後續建議

### 1. 增強顯示資訊
目前只顯示基本資訊，可以新增：
- 儲值方案名稱（需要從 `planId` 關聯查詢）
- 支付網關交易 ID（`transactionId`）
- 支付時間（`paidAt`）

### 2. 新增操作按鈕
- 「查看詳情」按鈕（顯示完整儲值資訊）
- 「重新支付」按鈕（針對 PENDING 狀態）
- 「下載收據」按鈕（針對 COMPLETED 狀態）

### 3. 優化過濾功能
- 新增「本月」、「上月」、「近三個月」快速過濾
- 新增金額範圍過濾

---

## 📝 相關檔案

### 已更新
- ✅ `src/services/rechargeService.ts` — 新增 `getMyRechargeHistory()`
- ✅ `src/views/member/DepositHistory.vue` — 改用 recharge API

### 已廢棄
- ❌ `GET /api/wallet/transactions` — 不再用於儲值紀錄查詢
- ⚠️ 此 API 仍可用於查詢其他交易類型（抽獎、回收等）

---

## 💡 開發筆記

### 為何廢棄 Wallet Transactions API？
1. **語義不明確**：錢包交易包含多種類型，儲值只是其中一種
2. **資料不完整**：無法獲取儲值方案、紅利贈送等資訊
3. **效能問題**：需要過濾大量非儲值交易
4. **維護性差**：後端修改錢包交易結構會影響多個功能

### 新 API 的設計優勢
1. **單一職責**：專門處理儲值記錄
2. **完整資料**：包含所有儲值相關資訊
3. **類型安全**：與後端 `RechargeRes` 完全對應
4. **擴展性強**：容易新增儲值特有功能（重新支付、下載收據等）

---

## ✅ 更新完成

- ✅ 前端改用 `/api/recharge/history` 查詢儲值記錄
- ✅ 資料映射更新（新增 goldCoins、bonusCoins、paidAt）
- ✅ 狀態標籤更新（COMPLETED/PENDING/FAILED）
- ✅ 支付方式標籤更新（ECPAY/OPAY/CREDIT_CARD）
- ✅ TypeScript 編譯通過
- ✅ 無錯誤、無警告
