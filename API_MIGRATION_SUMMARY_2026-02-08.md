# API 遷移摘要 (2026-02-08)

## 🚨 重大變更：錢包合併至使用者表

### 架構變更說明
- **原架構**：金幣（goldCoins）、紅利（bonusCoins）、累計儲值（totalRecharged）同時存在 `user` 表和 `user_wallet` 表
- **新架構**：統一存在 `user` 表，`user_wallet` 表已廢棄
- **API 行為**：`GET /api/wallet` 仍可用，但底層改為讀取 `user` 表

---

## ✅ 已完成的前端更新

### 1. 錢包 API 欄位名稱變更

**影響的檔案**：
- ✅ `src/views/member/MemberProfile.vue`
- ✅ `src/components/member/MemberSidebar.vue`

**變更內容**：
```typescript
// ❌ 舊版
const res = await getMyWallet();
const gold = res.data.balance;
const bonus = res.data.bonus;

// ✅ 新版
const res = await getMyWallet();
const gold = res.data.goldCoins;
const bonus = res.data.bonusCoins;
const totalRecharged = res.data.totalRecharged; // 新增欄位
```

### 2. User API 新增錢包欄位

**影響的 API**：
- `GET /api/user/me` — 回應新增 `goldCoins`, `bonusCoins`, `totalRecharged`
- `PUT /api/user/me` — 回應新增上述欄位
- `POST /api/user/avatar/update` — 回應新增上述欄位

**建議做法**：
```typescript
// 💡 建議：直接從 user API 取得餘額，減少一次 API 呼叫
const user = await getMyProfile();
const gold = user.data.goldCoins;
const bonus = user.data.bonusCoins;
const totalRecharged = user.data.totalRecharged;
```

---

## 📋 完整變更清單（先前已完成）

### Phase 1 - 核心服務更新
- ✅ `src/services/prizeBoxService.ts` - shipPrizes 改為完整配送資訊
- ✅ `src/services/enumService.ts` - basePath `/enums` → `/enum`
- ✅ `src/services/FrontAPI.ts` - Token refresh 新增 `token` 欄位
- ✅ `src/stores/useAuthStore.ts` - AuthResLike 新增 `token` 欄位

### Phase 2 - 會員中心更新
- ✅ `src/views/member/TransactionHistory.vue` - 交易類型更新
- ✅ `src/views/member/OrderList.vue` - 訂單欄位映射更新
- ✅ `src/views/member/AddressBook.vue` - 收件地址欄位對齊
- ✅ `src/views/member/PrizeBox.vue` - 完整重構出貨流程
  - 新增出貨 Dialog（支援宅配/超商取貨）
  - 移除舊的 addressId 模式
  - 新增單一/批次回收功能
  - 狀態更新：IN_BOX/SHIPPED/RECYCLED

### Phase 3 - 錢包欄位更新（本次）
- ✅ `src/views/member/MemberProfile.vue` - goldBalance → goldCoins, bonusBalance → bonusCoins
- ✅ `src/components/member/MemberSidebar.vue` - 同上

---

## 🔍 API 回應格式對照

### Wallet API (`GET /api/wallet`)

**舊版回應**：
```json
{
  "success": true,
  "data": {
    "balance": 10000,        // ❌ 已移除
    "bonus": 500,            // ❌ 已移除
    "currency": "TWD",       // ❌ 已移除
    "totalBalance": 10500    // ❌ 已移除
  }
}
```

**新版回應**：
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "userId": "user-uuid",
    "userNickname": "玩家暱稱",    // ✅ 新增
    "userEmail": "user@example.com", // ✅ 新增
    "goldCoins": 10000,             // ✅ 更名
    "bonusCoins": 500,              // ✅ 更名
    "totalRecharged": 15000,        // ✅ 新增
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": "2026-02-08T10:30:00"
  }
}
```

### User API (`GET /api/user/me`)

**新增欄位**：
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "nickname": "玩家暱稱",
    "goldCoins": 10000,        // ✅ 新增
    "bonusCoins": 500,         // ✅ 新增
    "totalRecharged": 15000,   // ✅ 新增
    // ... 其他欄位
  }
}
```

---

## 📝 待辦事項 (Optional)

### 優化建議
- [ ] 考慮將 `MemberProfile.vue` 和 `MemberSidebar.vue` 改用 `getMyProfile()` 取得餘額
  - 優點：減少一次 API 呼叫
  - 缺點：需要調整 user profile 回應處理邏輯

### 已知問題
- `src/components/member/MemberSidebar.vue` 有 TypeScript 錯誤（無關本次更新）：
  ```
  Property 'badge' does not exist on type '{ name: string; label: string; icon: string[]; }'.
  ```
  - 解決方式：在 navItems 類型定義中加入 `badge?: number`

---

## ✅ 測試檢查清單

### 功能測試
- [ ] 會員資料頁面正確顯示金幣/紅利餘額
- [ ] 側邊欄正確顯示錢包資訊
- [ ] 儲值後餘額正確更新
- [ ] 交易記錄正確顯示
- [ ] 訂單列表正確顯示
- [ ] 賞品盒出貨功能正常
- [ ] 賞品盒回收功能正常

### API 測試
- [ ] `GET /api/wallet` 回傳正確欄位
- [ ] `GET /api/user/me` 包含錢包欄位
- [ ] `PUT /api/user/me` 回應包含錢包欄位
- [ ] `POST /api/wallet/transactions` 正常運作

---

## 📚 參考文件
- 完整 API 文檔：`.github/FRONTEND_API_COMPLETE_REFERENCE.md`
- 更新日期：2026-02-08
- 更新版本：v2.0.0
