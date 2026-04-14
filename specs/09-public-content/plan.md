# Plan: 09 - 公開內容

> Branch: `feat/09-public-content`
> Worktree: `../kuji-client--feat-09/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## ⚠️ 重要：先查 Swagger 確認路徑

修改任何路徑前，先訪問 `http://localhost:8080/api/swagger-ui.html` 確認後端支援的路徑：

| Service | 現況 | 懷疑正確 | 需確認 |
|---------|------|---------|--------|
| `bannerService` | GET `/banner/carousel` | GET `/banner/list` | 查 Swagger |
| `marqueeService` | GET `/marquee` | GET `/marquee/list` | 查 Swagger |
| `newsService` | GET `/news` | GET `/news/list` | 查 Swagger |

若後端只支援現有路徑（即 spec 文件描述有誤），則**不修改前端**。

---

## 元件確認

### BannerSwiper.vue

確認從 `bannerService` 取得的資料結構符合 `BannerRes[]`：
- `imageUrl` → 圖片 src
- `linkUrl` → 點擊跳轉（null 時不跳轉）

### BulletMarquee.vue

確認從 `marqueeService` 取得的資料結構符合 `MarqueeRes[]`：
- 只顯示 `isActive=true` 的項目
- `content` 文字跑馬燈顯示

### News.vue / NewsDetail.vue

確認新聞列表/詳情資料結構符合 `NewsRes` / `NewsDetailRes`。

---

## 無需大幅修改

這個 batch 主要是**確認對齊**，若 Swagger 顯示路徑與前端一致則無需修改。
重點是把現有功能確認正常，不引入新功能。
