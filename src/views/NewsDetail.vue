<!-- src/views/NewsDetail.vue -->
<template>
  <section class="newsDetail-page">
    <div class="newsDetail-page__inner">
      <!-- 回上一頁 -->
      <button class="newsDetail-page__back" type="button" @click="goBack">
        ＜ 返回最新消息
      </button>

      <!-- Loading -->
      <div v-if="loading" class="newsDetail-page__notfound">載入中...</div>

      <!-- Error / Not Found -->
      <div v-else-if="error || !news" class="newsDetail-page__notfound">
        找不到這則消息，可能已被移除。
      </div>

      <!-- 內容 -->
      <article v-else class="newsDetail">
        <!-- 標題區 -->
        <header class="newsDetail__header">
          <p class="newsDetail__category">{{ news.category }}</p>
          <h1 class="newsDetail__title">{{ news.title }}</h1>
          <time class="newsDetail__date">{{ news.date }}</time>
        </header>

        <!-- Hero 圖 -->
        <div class="newsDetail__hero">
          <img :src="news.coverImage" :alt="news.title" />
        </div>

        <!-- ✅ 內文（v-html 渲染 CKEditor HTML） -->
        <div class="newsDetail__content">
          <div class="newsDetail__html" v-html="news.contentHtml"></div>

          <ul v-if="news.highlights?.length" class="newsDetail__list">
            <li v-for="(h, i) in news.highlights" :key="i">
              {{ h }}
            </li>
          </ul>

          <p v-if="news.note" class="newsDetail__note">※ {{ news.note }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNewsDetail } from '@/services/newsService';

interface NewsDetailItem {
  id: string;
  title: string;
  category: string;
  date: string;
  coverImage: string;
  contentHtml: string; // ✅ 改成 HTML 字串
  highlights?: string[];
  note?: string;
}

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref(false);
const news = ref<NewsDetailItem | null>(null);

const newsId = computed(() => String(route.params.id ?? ''));

const formatDate = (input?: string) => {
  if (!input) return '';
  return String(input).slice(0, 10);
};

const mapToDetail = (n: any): NewsDetailItem => {
  return {
    id: String(n?.id ?? ''),
    title: String(n?.title ?? ''),
    category: String(n?.category ?? n?.type ?? '最新消息'),
    date: formatDate(
      n?.publishTime ?? n?.publishedAt ?? n?.createdAt ?? n?.updatedAt
    ),
    coverImage: String(
      n?.imageUrl ?? // ✅ 你的後端欄位是 imageUrl
        n?.coverImage ??
        n?.coverImg ??
        n?.bannerUrl ??
        'https://placehold.co/900x500?text=News'
    ),
    contentHtml: String(n?.content ?? n?.detail ?? n?.body ?? ''),
    highlights: Array.isArray(n?.highlights) ? n.highlights : undefined,
    note: n?.note ? String(n.note) : undefined,
  };
};

const fetchDetail = async (id: string) => {
  if (!id) {
    news.value = null;
    return;
  }

  loading.value = true;
  error.value = false;
  news.value = null;

  try {
    const res = await getNewsDetail(id);
    const raw = (res as any)?.data ?? res;
    news.value = raw ? mapToDetail(raw) : null;
  } catch (e) {
    console.error(e);
    error.value = true;
    news.value = null;
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'News' });
  }
};

onMounted(() => {
  fetchDetail(newsId.value);
});

watch(
  () => newsId.value,
  (newId) => {
    fetchDetail(newId);
  }
);
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap');

.newsDetail-page {
  min-height: 100vh;
  background: #f3f3f3;
  padding: 32px 0 64px;
}

.newsDetail-page__inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 返回按鈕 */
.newsDetail-page__back {
  border: none;
  background: transparent;
  color: #e53935;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
}

/* 找不到 */
.newsDetail-page__notfound {
  padding: 32px 20px;
  background: #ffffff;
  border-radius: 16px;
  text-align: center;
}

/* 主體 */
.newsDetail {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

/* 標題區 */
.newsDetail__header {
  margin-bottom: 16px;
}

.newsDetail__category {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #fff4e5;
  color: #e65100;
  margin-bottom: 6px;
}

.newsDetail__title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.newsDetail__date {
  font-size: 0.82rem;
  color: #999;
}

/* hero 圖 */
.newsDetail__hero {
  margin: 12px 0 18px;
  border-radius: 14px;
  overflow: hidden;
}

.newsDetail__hero img {
  width: 100%;
  display: block;
  object-fit: cover;
}

/* 內文 */
.newsDetail__content {
  font-size: 0.96rem;
  line-height: 1.8;
  color: #444;
}

/* ✅ 讓 CKEditor HTML 好看一點 */
.newsDetail__html :deep(p) {
  margin: 0 0 10px;
}

.newsDetail__html :deep(ul),
.newsDetail__html :deep(ol) {
  padding-left: 1.2em;
  margin: 10px 0;
}

.newsDetail__html :deep(img) {
  max-width: 100%;
  border-radius: 10px;
}

.newsDetail__list {
  margin-top: 14px;
  margin-bottom: 4px;
  padding-left: 1.2em;
  font-size: 0.94rem;
}

.newsDetail__list li {
  margin-bottom: 6px;
}

.newsDetail__note {
  margin-top: 10px;
  font-size: 0.86rem;
  color: #888;
}

/* RWD */
@media (max-width: 767px) {
  .newsDetail-page {
    padding: 24px 0 40px;
  }

  .newsDetail {
    padding: 16px 14px 22px;
  }

  .newsDetail__title {
    font-size: 1.3rem;
  }
}
</style>
