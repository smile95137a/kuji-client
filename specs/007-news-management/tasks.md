# Tasks: 007 — 最新消息

**Feature**: News Management | **Branch**: `cli/007-news-management` | **Date**: 2026-03-31
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup

- [ ] T001 建立 `src/types/news.ts`，定義 `NewsItem`（id, title, summary, category, categoryName, isImportant, imageUrl, publishTime）、`NewsDetail`（+ content, author）、`NewsCategory`（ALL/ANNOUNCEMENT/EVENT/SYSTEM）type
- [ ] T002 建立 `src/services/news.ts`，實作：`getNewsList(condition, page, size)` → `POST /api/news/list`；`getNewsDetail(id)` → `GET /api/news/{id}`
- [ ] T003 建立 `src/stores/news.ts`，定義 Pinia store：activeCategory / newsItems / searchKeyword / currentPage / hasMore / newsDetail
- [ ] T004 確認（或建立）`src/composables/useDebounce.ts`，通用 debounce composable（若已存在則復用）

---

## Phase 2: Foundational

- [ ] T005 [P] 建立 `src/components/news/NewsCategoryTabs.vue`，分類 Tab 列（全部/公告/活動/系統）；sticky 固定頂部（FR-UI-001）；切換時 emit activeCategory；Tab 切換不觸發頁面捲動（FR-UI-007）
- [ ] T006 [P] 建立 `src/components/news/NewsSearchBar.vue`，搜尋框（500ms debounce，FR-UI-006）；搜尋中顯示 Spinner；輸入後觸發 news store 更新 searchKeyword → 重新呼叫 API
- [ ] T007 [P] 建立 `src/components/news/NewsCard.vue`：封面圖（imageUrl 為空顯示預設圖）/分類標籤/重要 Badge（isImportant=true 紅色「！重要」FR-UI-004）/標題/summary（最多 2 行 CSS line-clamp FR-UI-005）/publishTime（相對時間，FR-UI-012）；桌機 2 欄 / 手機單欄（FR-UI-003）；重要消息加紅色框線或橘色背景（US3 AC-1）

---

## Phase 3: [US1] 瀏覽消息列表並依分類篩選

- [ ] T008 [US1] 完善 `src/views/News.vue`（已存在）：onMounted 呼叫 `getNewsList({ category: 'ALL' }, 1, 20)`；整合 NewsCategoryTabs（切換時重新請求）+ NewsSearchBar + NewsCard 列表；前端排序：isImportant=true 置頂（US1 AC-3）；空狀態插圖「目前沒有此分類的消息」（US1 AC-4）；「載入更多」按鈕（依 hasMore，US1 AC-5 降級方案）
- [ ] T009 [US1] 在 `News.vue` 整合 NewsSearchBar debounce：輸入停頓 500ms 後呼叫 `getNewsList({ category, keyword })`（US1 AC-5）；URL query 保留分類狀態（路由返回時恢復 Tab）

---

## Phase 4: [US2] 閱讀消息詳情

- [ ] T010 [US2] 完善 `src/views/NewsDetail.vue`（已存在）：onMounted 呼叫 `getNewsDetail(id)`；顯示標題（`<h1>` FR-UI-011）/分類/isImportant Badge/封面圖（16:9，骨架屏）/作者/publishTime（格式 YYYY/MM/DD HH:mm，懸停 Tooltip 絕對時間 FR-UI-012）/正文（DOMPurify 消毒，FR-UI-008）
- [ ] T011 [US2] 在 `NewsDetail.vue` 正文渲染實作：`import DOMPurify from 'dompurify'`；sanitize config（允許 h2-h4/p/strong/em/a/img/ul/ol/li）；`v-html="sanitizedContent"`；所有 `<a>` 自動 `target="_blank" rel="noopener noreferrer"`（FR-UI-010）；正文圖片 `max-width: 100%; height: auto`（FR-UI-009，SC-004）
- [ ] T012 [US2] 建立 `src/components/news/RelatedNews.vue`，詳情頁底部顯示最多 3 筆同分類最新消息（客戶端從已載入的 newsItems 中過濾，或另行 API 請求）（US2 AC-5）
- [ ] T013 [US2] 在 `NewsDetail.vue` 添加「返回列表」按鈕：使用 `router.back()` 恢復捲動位置與分類 Tab 狀態（US2 AC-4）

---

## Phase 5: [US3] 重要消息快速識別

- [ ] T014 [US3] 確認 `NewsCard.vue` 中 isImportant=true 的卡片有紅色框線或橘色背景（US3 AC-1）；確認前端排序邏輯：重要消息 > 普通消息，同級依 publishTime 降序（US1 AC-3）
- [ ] T015 [P] [US3] 若全域 nav 有未讀消息紅點需求（US3 AC-2），在 news store 新增 `hasUnreadImportant` computed（`receivedAt` 比較方式，AV-008 Deferred 時保留 UI 但不顯示）

---

## Phase 6: [US4] 行動裝置閱讀體驗

- [ ] T016 [US4] 確認 `NewsDetail.vue` 正文圖片在手機版 `max-width: 100%; height: auto` 不溢出螢幕（SC-004）；確認 `NewsCard.vue` 手機版全寬卡片（非格子布局，FR-UI-003）；封面圖在上文字在下（US4 AC-2）

---

## Final Phase: Polish

- [ ] T017 [P] 確認 `NewsDetail.vue` 的 `<title>` 動態設定（SEO，FR-UI-011）；確認 DOMPurify 消毒無 XSS 漏洞（SC-003）
- [ ] T018 [P] 確認列表首屏 20 筆渲染 ≤ 1s（SC-001）；Tab 切換後列表更新 ≤ 500ms（SC-002）；搜尋 debounce 500ms 控制（SC-006）

---

## Dependencies

```
T001 → T002 → T003
T004 → T006 → T009
T005, T006, T007 → T008
T010, T011, T012, T013 → NewsDetail.vue 完整
T014 → T008（確認排序）
```

## Parallel Opportunities

- T005, T006, T007 可同時開發
- T010, T011, T012, T013 可同時開發 NewsDetail 各節
- T015, T016 可同時進行（各自獨立）

## Implementation Strategy

MVP = Phase 3+4（T008–T013）完成列表 + 詳情；US3 重要消息（Phase 5）和 US4 行動裝置（Phase 6）為增強項。
