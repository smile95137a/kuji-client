<!-- src/views/News.vue -->
<template>
  <section class="news-page">
    <div class="news-page__inner">
      <!-- 頁面標題 -->
      <h2 class="news-page__title">最新消息</h2>

      <!-- 說明文字 / 副標 -->
      <p class="news-page__subtitle">
        第一時間掌握一番賞活動公告、補貨資訊與系統維護訊息。
      </p>

      <!-- Loading -->
      <div v-if="loading" class="newsDetail-page__notfound">載入中...</div>

      <!-- Error -->
      <div v-else-if="error" class="newsDetail-page__notfound">
        讀取失敗，請稍後再試。
      </div>

      <!-- Empty -->
      <div v-else-if="newsList.length === 0" class="newsDetail-page__notfound">
        目前沒有最新消息。
      </div>

      <!-- 消息列表 -->
      <div v-else class="news-list">
        <article v-for="item in newsList" :key="item.id" class="news-card">
          <!-- 左側縮圖 -->
          <div class="news-card__thumb">
            <img :src="item.coverImage" :alt="item.title" />
          </div>

          <!-- 右側文字內容 -->
          <div class="news-card__content">
            <div class="news-card__meta">
              <span class="news-card__category">{{ item.category }}</span>
              <time class="news-card__date">{{ item.date }}</time>
            </div>

            <h3 class="news-card__title">
              <RouterLink
                :to="{ name: 'NewsDetail', params: { id: item.id } }"
                class="news-card__title-link"
              >
                {{ item.title }}
              </RouterLink>
            </h3>

            <p class="news-card__excerpt" v-html="item.excerpt"></p>

            <div class="news-card__footer">
              <RouterLink
                :to="{ name: 'NewsDetail', params: { id: item.id } }"
                class="news-card__more"
              >
                看詳細內容
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getPublishedNews } from '@/services/newsService';

interface NewsItem {
  id: string; // ✅ 後端是 String id（uuid）
  title: string;
  category: string;
  date: string;
  coverImage: string;
  excerpt: string;
}

const loading = ref(false);
const error = ref(false);
const newsList = ref<NewsItem[]>([]);

/** 安全轉成 yyyy-MM-dd */
const formatDate = (input?: string) => {
  if (!input) return '';
  // 常見：2025-11-21T12:34:56 / 2025-11-21 12:34:56 / 2025-11-21
  return String(input).slice(0, 10);
};

/** 從內文產生摘要（最多 N 字） */
const toExcerpt = (content: any, max = 60) => {
  if (!content) return '';
  const text = Array.isArray(content)
    ? content.join(' ')
    : String(content).replace(/\s+/g, ' ');
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

/** Mapping：把後端 NewsRes 轉成畫面需要的 NewsItem */
const mapToNewsItem = (n: any): NewsItem => {
  return {
    id: String(n?.id ?? ''),
    title: String(n?.title ?? ''),
    category: String(n?.category ?? n?.type ?? '最新消息'),
    date: formatDate(
      n?.publishTime ?? n?.publishedAt ?? n?.createdAt ?? n?.updatedAt
    ),
    coverImage: String(
      n?.coverImage ??
        n?.coverImg ??
        n?.imageUrl ??
        n?.bannerUrl ??
        'https://placehold.co/600x400?text=News'
    ),
    excerpt: String(n?.excerpt ?? n?.summary ?? toExcerpt(n?.content)),
  };
};

const fetchNewsList = async () => {
  loading.value = true;
  error.value = false;

  try {
    const res = await getPublishedNews(); // ✅ 不帶 limit = 全部
    const raw = (res as any)?.data ?? res; // ✅ 兼容：ApiResponse 或裸陣列
    const list = Array.isArray(raw) ? raw : [];

    newsList.value = list.map(mapToNewsItem);
  } catch (e) {
    console.error(e);
    error.value = true;
    newsList.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchNewsList();
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap');

.news-page {
  min-height: 100vh;
  background: #f3f3f3;
  padding: 32px 0 64px;
}

.news-page__inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 標題 & 副標 */
.news-page__title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 8px;
  font-family: 'Roboto', 'Noto Sans TC', system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.news-page__subtitle {
  text-align: center;
  font-size: 0.92rem;
  color: #666;
  margin-bottom: 24px;
}

/* 列表 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 卡片 */
.news-card {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

/* 縮圖 */
.news-card__thumb {
  width: 220px;
  max-width: 40%;
  flex-shrink: 0;
  background: #fafafa;
}

.news-card__thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* 內容 */
.news-card__content {
  flex: 1;
  padding: 14px 18px 12px;
  display: flex;
  flex-direction: column;
}

/* meta：分類 + 日期 */
.news-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.news-card__category {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #fff4e5;
  color: #e65100;
}

.news-card__date {
  font-size: 0.78rem;
  color: #999;
}

/* 標題 */
.news-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.news-card__title-link {
  color: #222;
  text-decoration: none;
}

.news-card__title-link:hover {
  text-decoration: underline;
}

/* 摘要 */
.news-card__excerpt {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

/* footer */
.news-card__footer {
  margin-top: auto;
}

.news-card__more {
  display: inline-block;
  font-size: 0.85rem;
  color: #e53935;
  text-decoration: none;
}

.news-card__more::after {
  content: ' ＞';
}

.news-card__more:hover {
  text-decoration: underline;
}

/* RWD */
@media (max-width: 767px) {
  .news-page {
    padding: 24px 0 40px;
  }

  .news-card {
    flex-direction: column;
  }

  .news-card__thumb {
    width: 100%;
    max-width: 100%;
    height: 180px;
  }

  .news-card__content {
    padding: 12px 14px 12px;
  }
}
</style>
