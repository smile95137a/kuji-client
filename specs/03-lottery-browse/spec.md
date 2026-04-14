# Spec: 03 - 商品瀏覽

> 來源: `specs/03-lottery-browse.md`
> Branch: `feat/03-lottery-browse`
> 所有端點為**公開**（不需 Token）

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/lottery/browse/list` | 商品列表（含過濾/分頁） |
| GET | `/lottery/browse/{id}/detail` | 商品詳情 |
| GET | `/stores/list` | 店家列表 ← 目前程式碼打 `/stores`（缺 /list） |
| GET | `/stores/{id}` | 店家詳情 |

---

## 商品分類欄位（前端決策邏輯）

```typescript
type PlayMode = 'LOTTERY_MODE' | 'SCRATCH_MODE'
type Category = 'OFFICIAL_ICHIBAN' | 'GACHA' | 'TRADING_CARD' | 'CUSTOM_GACHA'
```

**抽獎路由決策**（只讀 `playMode` + `category`）:

| playMode | category | 抽獎 API |
|---------|---------|---------|
| `LOTTERY_MODE` | `GACHA` | `POST /lottery/random/{id}/draw?count=N` |
| `LOTTERY_MODE` | 其他 | `POST /lottery/draw/{id}/draw` |
| `SCRATCH_MODE` | 任何 | `POST /lottery/draw/{id}/draw` |

---

## LotteryBrowseRes（商品詳情關鍵欄位）

```typescript
interface LotteryBrowseRes {
  id: string
  name: string
  category: Category
  playMode: PlayMode
  subCategory?: string
  pricePerDraw: number      // 每次抽獎費用（金幣）
  totalTickets: number
  remainingTickets: number
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT'
  storeId: string
  storeName: string
  coverImageUrl: string | null
  prizes: PrizeSummary[]
}
```

---

## 重要規則

- ❌ 不要顯示未抽籤位的 `prizeId` / `prizeLevel`（後端不回傳 AVAILABLE ticket 的獎品資訊）
- ✅ `remainingTickets === 0` 時顯示售完狀態
- ✅ `status === 'INACTIVE'` 時顯示下架狀態（423 錯誤）
