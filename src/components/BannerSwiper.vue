<template>
  <section class="banner-section">
    <div class="swiper" ref="swiperEl">
      <div class="swiper-wrapper">
        <div v-for="banner in banners" :key="banner.id" class="swiper-slide">
          <!-- 圖片，用 object-fit -->
          <div class="banner-image-wrapper">
            <img
              :src="banner.imageUrl"
              :alt="banner.title"
              class="banner-image"
            />
          </div>

          <!-- 文字區 -->
          <span class="banner-tag">熱門活動</span>

          <div class="banner-content">
            <h2 class="banner-title">{{ banner.title }}</h2>
            <p class="banner-subtitle">
              <!-- 地標 icon -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="banner-icon"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {{ banner.storeName }}
            </p>
          </div>
        </div>
      </div>

      <!-- 箭頭：會跟著 active 主圖左右邊界跑 -->
      <button
        ref="prevBtnEl"
        class="banner-nav banner-nav--prev"
        type="button"
        aria-label="Prev"
      >
        <font-awesome-icon
          class="banner-nav__icon"
          :icon="['fas', 'angle-left']"
        />
      </button>

      <button
        ref="nextBtnEl"
        class="banner-nav banner-nav--next"
        type="button"
        aria-label="Next"
      >
        <font-awesome-icon
          class="banner-nav__icon"
          :icon="['fas', 'angle-right']"
        />
      </button>

      <div class="swiper-pagination"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Swiper from 'swiper';
import {
  EffectCoverflow,
  Keyboard,
  Mousewheel,
  Pagination,
  Navigation,
} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { getCarouselBanners } from '@/services/bannerService';
import { executeApi } from '@/utils/executeApiUtils';

type BannerItem = {
  id: string;
  storeId: string;
  storeName: string;
  title: string;
  imageUrl: string;
  orderNum: number | null;
};

const banners = ref<BannerItem[]>([]);

const swiperEl = ref<HTMLDivElement | null>(null);
const prevBtnEl = ref<HTMLButtonElement | null>(null);
const nextBtnEl = ref<HTMLButtonElement | null>(null);

// 用 any 比較不跟 TS 吵架
let swiperInstance: any = null;
let ro: ResizeObserver | null = null;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const updateNavPosition = () => {
  const host = swiperEl.value;
  const prevBtn = prevBtnEl.value;
  const nextBtn = nextBtnEl.value;
  if (!host || !prevBtn || !nextBtn) return;

  const active = host.querySelector(
    '.swiper-slide-active'
  ) as HTMLElement | null;
  if (!active) return;

  const hostRect = host.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();

  const gap = 10; // 箭頭與主圖間距
  const edge = 8; // 箭頭離容器邊緣的最小距離
  const prevW = prevBtn.offsetWidth || 44;
  const nextW = nextBtn.offsetWidth || 44;

  // active 左右邊界（相對於 swiper 容器）
  const activeLeft = activeRect.left - hostRect.left;
  const activeRight = activeRect.right - hostRect.left;

  let prevLeft = activeLeft - prevW - gap;
  let nextLeft = activeRight + gap;

  // 夾住不要跑出容器
  prevLeft = clamp(prevLeft, edge, hostRect.width - prevW - edge);
  nextLeft = clamp(nextLeft, edge, hostRect.width - nextW - edge);

  // 若主圖太滿版，兩顆箭頭可能擠在一起 -> 退回容器兩側
  const tooTight = nextLeft - prevLeft < prevW + nextW + 12;
  if (tooTight) {
    prevLeft = edge;
    nextLeft = hostRect.width - nextW - edge;
  }

  host.style.setProperty('--nav-prev-left', `${prevLeft}px`);
  host.style.setProperty('--nav-next-left', `${nextLeft}px`);
};

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateNavPosition);

  if (ro) {
    ro.disconnect();
    ro = null;
  }

  if (swiperInstance) {
    swiperInstance.destroy(true, true);
    swiperInstance = null;
  }
});

const loadBanners = async () => {
  await executeApi<any>({
    fn: async () => getCarouselBanners(),
    onSuccess: (data) => {
      banners.value = data
        .map((b: any) => ({
          id: String(b?.id ?? ''),
          storeId: String(b?.storeId ?? ''),
          storeName: String(b?.storeName ?? ''),
          title: String(b?.title ?? ''),
          imageUrl: String(b?.imageUrl ?? ''),
          orderNum: typeof b?.orderNum === 'number' ? b.orderNum : null,
        }))
        .filter((b: any) => !!b.id && !!b.imageUrl);
    },
  });
};
onMounted(async () => {
  // ✅ 1) 先抓 API，確保 banners 有資料
  await loadBanners();
  nextTick(() => {
    if (!swiperEl.value) return;

    swiperInstance = new Swiper(swiperEl.value, {
      modules: [EffectCoverflow, Keyboard, Mousewheel, Pagination, Navigation],

      // ✅ 用 ref 綁定 navigation（避免同頁多個 swiper 互相打架）
      navigation: {
        prevEl: prevBtnEl.value!,
        nextEl: nextBtnEl.value!,
      },

      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      speed: 500,

      // RWD slidesPerView
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        640: {
          slidesPerView: 1.2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 1.6,
          spaceBetween: 40,
        },
      },

      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 120,
        modifier: 2,
        slideShadows: true,
      },

      keyboard: {
        enabled: true,
      },

      // ✅ 無限迴圈
      loop: true,
      watchSlidesProgress: true,

      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },

      on: {
        init(swiper) {
          // 一開始就站在真正的第 0 張
          swiper.slideToLoop(0, 0, false);
          requestAnimationFrame(updateNavPosition);
        },
        slideChangeTransitionEnd() {
          requestAnimationFrame(updateNavPosition);
        },
        resize() {
          requestAnimationFrame(updateNavPosition);
        },
      },
    });

    ro = new ResizeObserver(() => requestAnimationFrame(updateNavPosition));
    ro.observe(swiperEl.value);

    window.addEventListener('resize', updateNavPosition, { passive: true });

    setTimeout(updateNavPosition, 60);
  });
});
</script>

<style scoped lang="scss">
.banner-section {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.swiper {
  width: 100%;
  padding-top: 32px;
  padding-bottom: 40px;
}

/* 每張卡片：16:9，最大高度 320px */
.swiper-slide {
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 480px;
  overflow: hidden;

  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  transform-origin: center center;

  filter: blur(1px);
  transition: transform 0.35s ease, filter 0.35s ease, box-shadow 0.35s ease;
}

/* 圖片容器 */
.banner-image-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* 真正的圖片，object-fit: cover */
.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

/* 疊上原本的漸層效果（從下往上） */
.banner-image-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #0f2027, #203a4300, #2c536400);
}

/* 內文區塊改成相對定位，壓在圖片上面 */
.banner-tag,
.banner-content {
  position: relative;
  z-index: 1;
}

/* Active 那張更突出 */
.swiper-slide-active {
  filter: blur(0);
  transform: scale(1.04);
  z-index: 2;
}

/* 移除 3D 陰影（coverflow 預設會有） */
.swiper-3d .swiper-slide-shadow-left,
.swiper-3d .swiper-slide-shadow-right {
  background-image: none;
}

/* 內文區塊 */
.banner-content {
  width: 100%;
}

/* 小標籤 */
.banner-tag {
  text-transform: uppercase;
  color: #fff;
  background: #1b7402;
  padding: 7px 18px 7px 25px;
  display: inline-block;
  border-radius: 0 20px 20px 0px;
  letter-spacing: 2px;
  font-size: 0.8rem;
  font-family: 'Open Sans', sans-serif;
  margin-bottom: 8px;
}

/* 標題 */
.banner-title {
  color: #fff;
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 1.1rem;
  line-height: 1.4;
  margin-bottom: 8px;
  padding: 0 36px 0 20px;
}

/* 副標 + icon */
.banner-subtitle {
  color: #fff;
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  display: flex;
  align-items: center;
  padding: 0 20px 18px 20px;
}

.banner-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
}

/* 分頁 dots → 長條形 */
:deep(.swiper-pagination) {
  bottom: 8px;
}
:deep(.swiper-pagination-bullet) {
  width: 24px !important;
  height: 3px !important;
  border-radius: 999px;
  background: #dfbc94;
  opacity: 1;
  margin: 0 4px !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: #b43325 !important;
}

/* ✅ 箭頭：吃 JS 動態算出的 CSS 變數，定位到主圖兩側 */
.banner-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;

  background: transparent;
  color: #fff;
  font-size: 34px;
  line-height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.banner-nav--prev {
  left: var(--nav-prev-left, 14px);
}

.banner-nav--next {
  left: var(--nav-next-left, calc(100% - 58px)); /* 44 + 14 */
  right: auto;
}

/* 小尺寸調整 */
@media (max-width: 639px) {
  .swiper {
    padding-top: 24px;
    padding-bottom: 32px;
  }

  .banner-title {
    font-size: 1rem;
  }

  .banner-subtitle {
    font-size: 0.85rem;
  }
}
</style>
