<template>
  <div class="storeCoverSwiper">
    <template v-if="images.length > 0">
      <div class="swiper" ref="swiperEl">
        <div class="swiper-wrapper">
          <div
            v-for="(img, idx) in images"
            :key="idx"
            class="swiper-slide"
          >
            <img :src="img" :alt="`封面 ${idx + 1}`" class="storeCoverSwiper__img" />
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </template>
    <template v-else-if="fallbackUrl">
      <img :src="fallbackUrl" :alt="fallbackAlt" class="storeCoverSwiper__img storeCoverSwiper__img--fallback" />
    </template>
    <div v-else class="storeCoverSwiper__placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const props = withDefaults(defineProps<{
  images: string[];
  fallbackUrl?: string;
  fallbackAlt?: string;
  autoplayDelay?: number;
}>(), {
  fallbackAlt: '店家封面',
  autoplayDelay: 3000,
});

const swiperEl = ref<HTMLDivElement | null>(null);
let swiperInstance: any = null;

const initSwiper = () => {
  if (!swiperEl.value || props.images.length < 2) return;
  swiperInstance = new Swiper(swiperEl.value, {
    modules: [Autoplay, Pagination],
    loop: true,
    autoplay: { delay: props.autoplayDelay, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
  });
};

onMounted(initSwiper);

watch(() => props.images, () => {
  swiperInstance?.destroy(true, true);
  swiperInstance = null;
  initSwiper();
});

onBeforeUnmount(() => {
  swiperInstance?.destroy(true, true);
  swiperInstance = null;
});
</script>

<style scoped lang="scss">
.storeCoverSwiper {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;

  .swiper {
    width: 100%;
    height: 100%;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;

    &--fallback {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #b2473a22 0%, #e5a65722 100%);
  }
}

:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.6);
  opacity: 1;
}
:deep(.swiper-pagination-bullet-active) {
  background: #fff;
}
</style>
