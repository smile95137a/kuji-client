# Implementation Plan: 002 — 物流出貨

**Branch**: `cli/002-express-shipping` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-express-shipping/spec.md`

---

## Summary

實作出貨申請流程與訂單追蹤頁。玩家在賞品盒選取賞品後，透過出貨表單（手機全頁 `/prize-box/ship`、桌機 Modal）填寫宅配或超商取貨資訊，呼叫 `POST /api/prize-box/ship`。Response 永遠為 `{ orders: [...] }` 陣列格式（已澄清 Q1）。出貨完成後導向 `GET /api/orders/{id}` 訂單詳情頁，顯示狀態時間軸。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, VeeValidate 4.14.7 + Yup 1.4.0, Sass |
| **Storage** | Pinia (pinia-plugin-persistedstate) |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile browsers |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 表單提交 API ≤ 3s (P95)；欄位驗證 ≤ 100ms (onBlur) |
| **Constraints** | 需登入（JWT）；`shippingMethod` = HOME_DELIVERY / CONVENIENCE_STORE |
| **Scale/Scope** | 2 頁面（出貨表單、訂單詳情），3 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/002-express-shipping/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成（Q1 回應格式已澄清）
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── ShipForm.vue                  # 出貨表單頁（/prize-box/ship）
│   └── OrderDetail.vue              # 訂單詳情頁（/orders/{id}）
├── components/
│   └── shipping/
│       ├── ShippingMethodSelector.vue  # 宅配/超商 Radio 選擇器
│       ├── HomeDeliveryFields.vue       # 宅配專用欄位
│       ├── ConvenienceStoreFields.vue   # 超商專用欄位
│       ├── AddressDropdown.vue          # 已儲存地址下拉選單
│       ├── MultiStoreWarning.vue        # 多店家拆單警告橫幅
│       └── OrderStatusTimeline.vue     # 狀態時間軸組件
├── stores/
│   └── shipping.ts                   # shippingMethod / savedAddresses / isSubmitting
├── services/
│   ├── shipping.ts                   # POST /api/prize-box/ship
│   ├── address.ts                    # GET /api/address
│   └── order.ts                      # GET /api/orders/{id}
└── types/
    └── shipping.ts                   # ShipRequest / ShipResponse / OrderDetail
```

---

## 主要開發項目

### 1. API Services
- `shippingService.ship(payload)` → `POST /api/prize-box/ship`
  - Response: `{ orders: [{ orderId, orderNo, storeName, prizeCount }] }` (永遠陣列，Q1 已澄清)
- `addressService.getAddresses()` → `GET /api/address`
- `orderService.getOrderDetail(id)` → `GET /api/orders/{id}`

### 2. 表單驗證（VeeValidate + Yup）

| 欄位 | 規則 | 錯誤訊息 |
|------|------|---------|
| 收件人姓名 | 必填，2–20 字元 | 「請輸入收件人姓名（2–20 字）」 |
| 收件人電話 | 必填，`/^09\d{8}$/` | 「請輸入有效的手機號碼」 |
| 收件地址 | 必填（宅配），≥ 10 字 | 「請輸入完整地址」 |
| 超商店碼 | 必填（超商），`/^\d{6}$/` | 「請輸入有效的超商店碼（6位數）」 |
| 超商店名 | 必填（超商），2–50 字 | 「請輸入超商店名」 |

### 3. 多店家拆單邏輯
```
selectedPrizes → 依 storeId 分組 → 若分組數 > 1 → 顯示警告橫幅
POST /api/prize-box/ship response.orders.length > 1 → 列出所有 orderNo
```

### 4. 訂單狀態時間軸
- 固定節點：PENDING → PREPARING → SHIPPED → COMPLETED
- 已完成節點：填色圓點 + 顯示 `timestamp`
- 當前節點：脈衝動畫圓點
- 未到達節點：空心灰色

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| `trackingNumber` 缺失 | 快遞單號待後端補充 |
| `GET /api/address/default` | 存在於 010 spec，002 未列 — 統一用 `GET /api/address` + `isDefault` 過濾 |
| `addressType` 語意不明 | 延後至後端確認 |
