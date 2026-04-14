# Spec: 04 - 抽獎核心流程

> 來源: `specs/04-draw-flow.md` ← 必讀
> Branch: `feat/04-draw-flow`
> ⚠️ 抽獎均需 Token

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/lottery/draw/{id}/draw` | 票券制抽獎（一番賞/卡牌/刮刮樂） |
| POST | `/lottery/random/{id}/draw?count=N` | 加權隨機抽獎（扭蛋） |
| POST | `/lottery/draw/{id}/designate` | 刮刮樂 Opener 指定大獎位置 |
| GET | `/lottery/draw/{id}/session` | 查詢當前 session 狀態 |

---

## 票券制抽獎 — 三種回應結構

### 情況 1: 正常開獎

```typescript
interface DrawNormalRes {
  results: DrawResult[]
  protectionEndTime: string | null  // ISO 8601，null 代表無保護期
  remainingGold: number
  remainingBonus: number
}
```

### 情況 2: 刮刮樂 Opener 需指定大獎位置

```typescript
interface DrawDesignationRequiredRes {
  designationRequired: true
  availableNumbers: string[]    // 可選的籤號
  grandPrizes: GrandPrize[]     // 需指定的大獎清單
}
// 需指定數量: grandPrizes.reduce((sum, p) => sum + p.quantity, 0)
```

### 情況 3: 等待 Opener 指定中

```typescript
interface DrawDesignationPendingRes {
  designationPending: true
}
// → 輪詢 GET /lottery/draw/{id}/session 確認狀態
```

---

## DrawResult 型別

```typescript
interface DrawResult {
  ticketNumber: string     // ⚠️ string 非 number，格式如 "042"
  prizeId: string
  prizeName: string
  prizeLevel: string       // 如 "A賞", "B賞", "LAST"
  prizeImageUrl: string | null
}
```

---

## 保護計時器

```typescript
const { protectionEndTime } = drawResponse
if (protectionEndTime) {
  // 顯示倒數計時至 new Date(protectionEndTime)
  // 保護期間：仍可隨機抽，但無法指定特定籤位
}
```

---

## 雙幣扣款規則

- 後端自動處理：優先扣 `goldCoins`，不足時 `bonusCoins` 補差額
- 前端只顯示回傳的 `remainingGold` + `remainingBonus`，不自行計算

---

## SessionResponse 欄位（實際後端回傳）

```typescript
interface SessionResponse {
  sessionId: string
  status: string
  isDesignationComplete: boolean
  openerNickname: string | null
  canDraw: boolean
  cannotDrawReason: string | null
  protectionDraws: number
  freeDrawEnabled: boolean
}
```

> ⚠️ spec 文件描述的 `grandPrizesDesignated` 欄位實際為 `isDesignationComplete`，以後端 Swagger 為準
