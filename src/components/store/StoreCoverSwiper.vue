<template>
  <div class="storeCoverSwiper">
    <template v-if="displayImages.length > 0">
      <div class="swiper" ref="swiperEl">
        <div class="swiper-wrapper">
          <div
            v-for="img in displayImages"
            :key="img"
            class="swiper-slide"
          >
            <img
              :src="img"
              :alt="`封面 ${displayImages.indexOf(img) + 1}`"
              class="storeCoverSwiper__img"
              :class="{ 'storeCoverSwiper__img--ready': isSlideReady(img) }"
              @load="onSlideLoad(img)"
              @error="onSlideError(img)"
            />
            <div v-if="!isSlideReady(img)" class="storeCoverSwiper__skeleton"></div>
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </template>
    <template v-else-if="activeFallbackUrl">
      <img
        :src="activeFallbackUrl"
        :alt="fallbackAlt"
        class="storeCoverSwiper__img storeCoverSwiper__img--fallback"
        :class="{ 'storeCoverSwiper__img--ready': fallbackLoaded }"
        @load="onFallbackLoad"
        @error="onFallbackError"
      />
      <div v-if="!fallbackLoaded" class="storeCoverSwiper__skeleton"></div>
    </template>
    <div v-else class="storeCoverSwiper__placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
const loadedSlides = ref(new Set<string>());
const failedSlides = ref(new Set<string>());
const fallbackLoaded = ref(false);
const fallbackFailed = ref(false);

const normalizedImages = computed(() => {
  const source = Array.isArray(props.images) ? props.images : [];
  return Array.from(
    new Set(
      source
        .map((item) => String(item ?? '').trim())
        .filter(Boolean),
    ),
  );
});

const displayImages = computed(() =>
  normalizedImages.value.filter((img) => !failedSlides.value.has(img)),
);

const activeFallbackUrl = computed(() => {
  if (fallbackFailed.value) return '';
  return String(props.fallbackUrl ?? '').trim();
});

let swiperInstance: any = null;

const initSwiper = () => {
  if (!swiperEl.value || displayImages.value.length < 2) return;
  swiperInstance = new Swiper(swiperEl.value, {
    modules: [Autoplay, Pagination],
    loop: true,
    autoplay: { delay: props.autoplayDelay, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
  });
};

const rebuildSwiper = async () => {
  swiperInstance?.destroy(true, true);
  swiperInstance = null;
  await nextTick();
  initSwiper();
};

const isSlideReady = (img: string) => loadedSlides.value.has(img);

const onSlideLoad = (img: string) => {
  loadedSlides.value = new Set([...loadedSlides.value, img]);
};

const onSlideError = (img: string) => {
  failedSlides.value = new Set([...failedSlides.value, img]);
};

const onFallbackLoad = () => {
  fallbackLoaded.value = true;
};

const onFallbackError = () => {
  fallbackFailed.value = true;
  fallbackLoaded.value = false;
};

onMounted(async () => {
  await rebuildSwiper();
});

watch(
  () => [props.images, props.fallbackUrl],
  () => {
    loadedSlides.value = new Set();
    failedSlides.value = new Set();
    fallbackLoaded.value = false;
    fallbackFailed.value = false;
  },
  { deep: true, immediate: true },
);

watch(displayImages, async () => {
  await rebuildSwiper();
});

onBeforeUnmount(() => {
  swiperInstance?.destroy(true, true);
  swiperInstance = null;
});
</script>

<style scoped lang="scss">
.storeCoverSwiper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;

  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    position: relative;
  }

  &__img {
    opacity: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.2s ease;

    &--ready {
      opacity: 1;
    }

    &--fallback {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__skeleton {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #f2ece7 25%, #faf6f3 50%, #f2ece7 75%);
    background-size: 200% 100%;
    animation: storeCoverShimmer 1.2s linear infinite;
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

@keyframes storeCoverShimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
