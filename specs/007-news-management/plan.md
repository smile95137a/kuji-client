# Implementation Plan: 007 — 最新消息

**Branch**: `cli/007-news-management` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-news-management/spec.md`

---

## Summary

實作消息列表頁（`/news`）與詳情頁（`/news/{id}`）。列表頁含分類 Tab 篩選（ALL/ANNOUNCEMENT/EVENT/SYSTEM）、關鍵字搜尋（500ms debounce）、重要消息置頂排序；詳情頁使用 DOMPurify 安全渲染 HTML 富文本，並顯示同分類推薦消息。兩頁均公開，無需登入。

---

## Technical Context

| 項目 | 值 |
|------|----|
| **Language/Version** | TypeScript 5.x, Vue 3.4.21 |
| **Primary Dependencies** | Vite 5.2, Pinia 2.2.6, Axios 1.7.7, **DOMPurify**, Sass |
| **Storage** | Pinia（activeCategory / newsItems / searchKeyword） |
| **Testing** | Vitest + @vue/test-utils |
| **Target Platform** | Web SPA — modern browsers + mobile |
| **Project Type** | Vue 3 SPA (Client App) |
| **Performance Goals** | 列表 20 筆首次渲染 ≤ 1s；Tab 切換 ≤ 500ms |
| **Constraints** | 公開頁面（無需登入）；XSS 防護必要（DOMPurify 消毒 `content`） |
| **Scale/Scope** | 2 頁面、2 個 API 端點 |

---

## Constitution Check

> N/A — `.specify/memory/constitution.md` 未在此專案中找到。

---

## Project Structure

### Documentation (this feature)

```text
specs/007-news-management/
├── plan.md              ✅ This file
├── spec.md              ✅ 已完成
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # /speckit.tasks output
```

### Source Code

```text
src/
├── views/
│   ├── News.vue                     # 消息列表頁（已存在，需完善）
│   └── NewsDetail.vue              # 消息詳情頁（已存在，需完善）
├── components/
│   └── news/
│       ├── NewsCard.vue             # 消息卡片（封面圖、標題、摘要、重要 Badge）
│       ├── NewsCategoryTabs.vue     # 分類 Tab 列（sticky）
│       ├── NewsSearchBar.vue        # 搜尋框（含 debounce 500ms）
│       └── RelatedNews.vue         # 相關消息（詳情頁底部）
├── stores/
│   └── news.ts                     # activeCategory / newsItems / searchKeyword / currentPage
├── composables/
│   └── useDebounce.ts              # debounce 通用 composable（若未有）
├── services/
│   └── news.ts                     # POST /api/news/list / GET /api/news/{id}
└── types/
    └── news.ts                     # NewsItem / NewsDetail / NewsCategory
```

---

## 主要開發項目

### 1. 消息列表 API 呼叫
```typescript
// services/news.ts
POST /api/news/list {
  condition: { category: activeCategory || undefined, keyword },
  page, size: 20
}
// 回應排序：前端再做重要消息置頂
newsItems.sort((a, b) => {
  if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1
  return new Date(b.publishTime) - new Date(a.publishTime)
})
```

### 2. 分類 Tab

| Tab | Request category |
|-----|-----------------|
| 全部 | 省略 category 欄位（或傳 "ALL"，待後端確認 AV-009） |
| 公告 | `"ANNOUNCEMENT"` |
| 活動 | `"EVENT"` |
| 系統 | `"SYSTEM"` |

### 3. 詳情頁 HTML 渲染（安全）
```typescript
import DOMPurify from 'dompurify'

// 消毒配置：允許 h2-h4、p、strong、a、img
const sanitized = DOMPurify.sanitize(newsDetail.content, {
  ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'strong', 'em', 'a', 'img', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height']
})
// 所有 <a> 自動添加 target="_blank" rel="noopener noreferrer"
```

### 4. 時間顯示格式
- ≤ 24 小時：「X 小時前」、「X 分鐘前」（相對時間）
- > 24 小時：「YYYY/MM/DD HH:mm」
- Tooltip（hover）：絕對時間

### 5. 無限捲動 / 載入更多
- 依 `totalPages` / `hasMore` 判斷（待後端確認 AV-004 分頁 metadata）
- 降級方案：若無分頁 metadata，使用「載入更多」按鈕（固定每頁 20 筆）

---

## 已知缺口（Deferred）

| 項目 | 說明 |
|------|------|
| 分頁 metadata | AV-004：後端需返回 `totalPages` 或 `hasMore` |
| `categoryName` i18n | AV-005：確認後端是否返回中文；若只返回枚舉則前端自行映射 |
| `readCount` / `likes` | AV-006：目前不實作，延後 |
