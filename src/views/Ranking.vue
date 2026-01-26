<!-- src/views/Ranking.vue -->
<template>
  <section class="ranking-page">
    <div class="ranking-page__inner">
      <!-- 頁面標題 -->
      <h2 class="ranking-page__title">即時榜單</h2>

      <!-- 上方 Banner（單張，無 Swiper） -->
      <div class="ranking-page__banner-card">
        <div class="ranking-page__hero">
          <img
            :src="heroBanner.image"
            :alt="heroBanner.title"
            class="ranking-page__hero-img"
          />

          <!-- 疊在 banner 上的文字 -->
          <div class="ranking-page__hero-overlay">
            <p class="ranking-page__hero-tag">熱門活動</p>
            <h3 class="ranking-page__hero-title">
              {{ heroBanner.title }}
            </h3>
            <p class="ranking-page__hero-subtitle">
              {{ heroBanner.subtitle }}
            </p>
          </div>
        </div>
      </div>

      <!-- 更新榜單按鈕區 -->
      <div class="ranking-page__refresh">
        <button class="refresh-btn" type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="refresh-btn__icon"
          >
            <path
              fill="currentColor"
              d="M12 5V2L8 6l4 4V7c2.76 0 5 2.24 5 5a5 5 0 0 1-7.19 4.45a1 1 0 1 0-.83 1.82A7 7 0 0 0 19 12c0-3.87-3.13-7-7-7Z"
            />
          </svg>
          更新榜單
        </button>
      </div>

      <!-- 得獎列表 -->
      <div class="winner-list">
        <article v-for="item in winners" :key="item.id" class="winner-item">
          <!-- 左側名字區 -->
          <div class="winner-item__name">
            <p class="winner-item__name-text">{{ item.nickname }}</p>
          </div>

          <!-- 中間：圖片 + 文字 + 按鈕 -->
          <div class="winner-item__info">
            <div class="winner-item__info-main">
              <div class="winner-item__img-box">
                <img
                  :src="item.image"
                  :alt="item.prize"
                  class="winner-item__img"
                />
              </div>

              <div class="winner-item__award-box">
                <p class="winner-item__award-text">
                  {{ item.prize }}
                </p>

                <button class="winner-item__award-btn" type="button">
                  我也要抽
                </button>
              </div>
            </div>

            <div class="winner-item__date">
              {{ item.time }}
            </div>
          </div>

          <!-- 右側黃色獎章 -->
          <div
            class="winner-item__badge"
            :class="{ 'winner-item__badge--top': item.isTopPrize }"
          >
            <div class="winner-item__badge-circle">
              <span class="winner-item__badge-star">★</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface HeroBanner {
  image: string;
  title: string;
  subtitle: string;
}

interface WinnerItem {
  id: number;
  nickname: string;
  prize: string;
  image: string;
  time: string;
  isTopPrize: boolean;
}

// 上方 hero banner（你可以換成自己的圖）
const heroBanner: HeroBanner = {
  image: 'https://kujiflip.tw/_nuxt/banner.b952597a.png',
  title: '來看看大家都抽到甚麼？！',
  subtitle: '「大獎」等著你！',
};

// Demo 得獎列表（之後可以改成 API 資料）
const winners = ref<WinnerItem[]>([
  {
    id: 1,
    nickname: 'Ev*',
    prize: '獲得B賞 哈姆太郎 絨毛玩具',
    image:
      'https://firebasestorage.googleapis.com/v0/b/kuji-96189.appspot.com/o/1756998703703.jpg.webp?alt=media',
    time: '2025-11-21 11:57:04',
    isTopPrize: false,
  },
  {
    id: 2,
    nickname: 'Lu*',
    prize: '獲得A賞 AirPods Pro 3',
    image:
      'https://firebasestorage.googleapis.com/v0/b/kuji-96189.appspot.com/o/1761880255856.jpg.webp?alt=media',
    time: '2025-11-21 08:48:37',
    isTopPrize: true,
  },
  {
    id: 3,
    nickname: '小*',
    prize: '獲得D賞 唐吉訶德·多佛朗明哥',
    image:
      'https://firebasestorage.googleapis.com/v0/b/kuji-96189.appspot.com/o/1758270708369.jpg.webp?alt=media',
    time: '2025-11-21 09:24:59',
    isTopPrize: false,
  },
]);
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap');

/* 整個頁面背景 & 置中容器 */
.ranking-page {
  min-height: 100vh;
  background: #f3f3f3;
  padding: 32px 0 64px;
}

.ranking-page__inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 標題 */
.ranking-page__title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 24px;
  font-family: 'Roboto', 'Noto Sans TC', system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 上方 Banner 卡片外框 */
.ranking-page__banner-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 24px 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

/* 單張 hero banner */
.ranking-page__hero {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

.ranking-page__hero-img {
  width: 100%;
  display: block;
  object-fit: cover;
}

/* 疊在圖片上的漸層 & 文字 */
.ranking-page__hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 48px;
  padding-right: 48px;
  pointer-events: none;

  /* 底部做一層淡白漸層，讓文字更清楚 */
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.8) 60%,
    rgba(255, 255, 255, 1) 100%
  );
}

.ranking-page__hero-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: #ff6b6b;
  color: #ffffff;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
  font-family: 'Open Sans', sans-serif;
}

.ranking-page__hero-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #333333;
}

.ranking-page__hero-subtitle {
  font-size: 1rem;
  color: #555555;
}

/* 更新按鈕區 */
.ranking-page__refresh {
  margin: 12px 4px 24px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #e53935;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
}

.refresh-btn__icon {
  width: 14px;
  height: 14px;
}

/* 得獎列表 */
.winner-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 每一筆得獎 */
.winner-item {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.winner-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

/* 左側名字 */
.winner-item__name {
  min-width: 90px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f0f0f0;
}

.winner-item__name-text {
  font-size: 0.9rem;
  font-weight: 600;
}

/* 中間內容 */
.winner-item__info {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.winner-item__info-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.winner-item__img-box {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.winner-item__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.winner-item__award-box {
  flex: 1;
}

.winner-item__award-text {
  font-size: 0.96rem;
  margin-bottom: 8px;
  line-height: 1.4;
}

.winner-item__award-btn {
  padding: 6px 18px;
  border-radius: 999px;
  border: 1px solid #ff9800;
  background: #fffaf0;
  color: #e65100;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.winner-item__award-btn:hover {
  background: #ff9800;
  color: #ffffff;
  border-color: #ff9800;
}

.winner-item__date {
  margin-top: 6px;
  font-size: 0.8rem;
  color: #888;
}

/* 右側黃色獎章 */
.winner-item__badge {
  position: relative;
  width: 70px;
  background: #ffd74d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.winner-item__badge::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 0;
  height: 0;
  border-left: 35px solid transparent;
  border-right: 35px solid transparent;
  border-top: 12px solid #ffd74d;
}

.winner-item__badge-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.winner-item__badge-star {
  color: #ff9800;
  font-size: 1.2rem;
}

/* A / SP 獎用比較深的黃色 */
.winner-item__badge--top {
  background: #ffb300;
}

.winner-item__badge--top::after {
  border-top-color: #ffb300;
}

/* 手機版微調 */
@media (max-width: 767px) {
  .ranking-page {
    padding: 24px 0 40px;
  }

  .ranking-page__banner-card {
    padding: 12px 12px 20px;
    border-radius: 18px;
  }

  .ranking-page__hero-overlay {
    padding: 16px 20px;
    justify-content: flex-end;
  }

  .ranking-page__hero-title {
    font-size: 1.2rem;
  }

  .ranking-page__hero-subtitle {
    font-size: 0.9rem;
  }

  .winner-item {
    flex-direction: column;
  }

  .winner-item__name {
    min-height: 40px;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }

  .winner-item__badge,
  .winner-item__badge::after {
    display: none; /* 要手機也有獎章就拿掉這段 */
  }
}
</style>
