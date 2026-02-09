<template>
  <div class="bullet-marquee">
    <div class="bullet-marquee__inner" ref="trackRef">
      <!-- 只跑你給的 messages，不幫你複製 -->
      <div
        v-for="(msg, index) in messagesToShow"
        :key="index"
        class="bullet-marquee__item"
      >
        {{ msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { gsap } from 'gsap';

const props = defineProps<{
  messages: string[];
  speed?: number;
}>();

const trackRef = ref<HTMLElement | null>(null);
let tween: gsap.core.Tween | null = null;

const messagesToShow = computed(() =>
  props.messages.length ? props.messages : ['歡迎光臨', '今天也來抽一番賞～'],
);

const playMarquee = async () => {
  if (!trackRef.value) return;

  await nextTick();

  const el = trackRef.value;
  const parent = el.parentElement;
  if (!parent) return;

  const trackWidth = el.scrollWidth;
  const containerWidth = parent.clientWidth;

  if (!trackWidth) return;

  const fromX = containerWidth;
  const toX = -trackWidth;

  // 根據距離算 duration，這樣不管字多長速度都差不多
  const distance = containerWidth + trackWidth; // 要跑的總距離
  const pixelsPerSecond = props.speed ?? 60;
  const duration = distance / pixelsPerSecond;

  if (tween) {
    tween.kill();
    tween = null;
  }

  tween = gsap.fromTo(
    el,
    { x: fromX },
    {
      x: toX,
      duration,
      ease: 'none',
      repeat: -1,
    },
  );
};

const handleResize = () => {
  playMarquee();
};

onMounted(() => {
  playMarquee();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (tween) {
    tween.kill();
    tween = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.bullet-marquee {
  width: 100%;
  overflow: hidden;
  padding: 24px 0;
  min-height: 36px;

  &__inner {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    will-change: transform;
  }

  &__item {
    padding: 4px 12px;
    border-radius: 30px;
    border: 1px solid #b43325;
    color: #b43325;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    white-space: nowrap;
  }
}
</style>
