# Spec: 09 - 公開內容

> 來源: `specs/09-public-content.md`
> Branch: `feat/09-public-content`
> 所有端點**公開**（不需 Token）

---

## Endpoints

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/banner/list` | Banner 列表 |
| GET | `/marquee/list` | 跑馬燈列表 |
| GET | `/news/list` | 新聞列表（分頁） |
| GET | `/news/{id}` | 新聞詳情 |

---

## 現況 vs Spec 路徑差異

| Service | 現況路徑 | Spec 路徑 | 狀態 |
|---------|---------|---------|------|
| `bannerService` | GET `/banner/carousel` | GET `/banner/list` | ⚠️ 需確認 |
| `marqueeService` | GET `/marquee` | GET `/marquee/list` | ⚠️ 需確認 |
| `newsService` | GET `/news` | GET `/news/list` | ⚠️ 需確認 |

> **重要**: 修改前需查 Swagger 確認後端實際支援的路徑，避免破壞正在運作的功能

---

## BannerRes

```typescript
interface BannerRes {
  id: string
  imageUrl: string
  linkUrl: string | null
  title: string | null
  sortOrder: number
  isActive: boolean
}
```

## MarqueeRes

```typescript
interface MarqueeRes {
  id: string
  content: string
  isActive: boolean
  sortOrder: number
}
```

## NewsRes

```typescript
interface NewsRes {
  id: string
  title: string
  summary: string | null
  coverImageUrl: string | null
  publishedAt: string
  status: 'PUBLISHED' | 'DRAFT'
}
```
