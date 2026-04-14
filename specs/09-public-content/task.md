# Task Checklist: 09 - 公開內容

> Branch: `feat/09-public-content`
> Worktree: `../kuji-client--feat-09/`
> 依賴: `fix/critical-bugs` 需先 merge

---

## ⚠️ 先做確認，再修改

修改任何 API 路徑前，先查 Swagger `http://localhost:8080/api/swagger-ui.html`。

---

## Phase 1 — Swagger 確認

- [ ] 查 Swagger: `/banner/list` vs `/banner/carousel`，記錄哪個有效
- [ ] 查 Swagger: `/marquee/list` vs `/marquee`，記錄哪個有效
- [ ] 查 Swagger: `/news/list` vs `/news`，記錄哪個有效

## Phase 2 — 依確認結果修正

- [ ] 若 Swagger 顯示 `/banner/list` → 修正 `bannerService` 路徑
- [ ] 若 Swagger 顯示 `/marquee/list` → 修正 `marqueeService` 路徑
- [ ] 若 Swagger 顯示 `/news/list` → 修正 `newsService` 路徑
- [ ] 若路徑相符（spec 文件有誤）→ 不修改

## Phase 3 — 元件資料格式確認

- [ ] `BannerSwiper.vue`: 確認 `imageUrl` / `linkUrl` 欄位正確讀取
- [ ] `BulletMarquee.vue`: 確認 `content` 欄位正確讀取
- [ ] `News.vue`: 確認列表資料格式符合
- [ ] `NewsDetail.vue`: 確認詳情資料格式符合

## Phase 4 — 驗收

- [ ] `npm run build` 無 TS 錯誤
- [ ] Banner 正常顯示（圖片 + 連結）
- [ ] 跑馬燈正常顯示
- [ ] 新聞列表 + 詳情正常顯示
