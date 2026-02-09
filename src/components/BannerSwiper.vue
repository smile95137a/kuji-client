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
          <span class="banner-tag">{{ getBannerTag(banner) }}</span>

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
import { getBannerTag } from '@/utils/timeUtils';

const banners = ref<any[]>([]);

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
    '.swiper-slide-active',
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
      banners.value = data;
    },
  });
};
onMounted(async () => {
  await loadBanners();
  nextTick(() => {
    if (!swiperEl.value) return;

    swiperInstance = new Swiper(swiperEl.value, {
      modules: [EffectCoverflow, Keyboard, Mousewheel, Pagination, Navigation],

      navigation: {
        prevEl: prevBtnEl.value!,
        nextEl: nextBtnEl.value!,
      },

      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      speed: 500,

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

      loop: true,
      watchSlidesProgress: true,

      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },

      on: {
        init(swiper) {
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
:deep(.swiper-3d) {
  .swiper-slide-shadow-left,
  .swiper-slide-shadow-right {
    background-image: none;
  }
}

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
</style>
