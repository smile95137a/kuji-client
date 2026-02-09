<!-- src/components/common/KujiRevealStripDialog.vue -->
<template>
  <div class="kujiRevealDialog">
    <div class="kujiRevealDialog__backdrop" @click="cancel" />

    <div class="kujiRevealDialog__panel">
      <img
        class="kujiRevealDialog__bg"
        :src="polerDialogBg"
        alt=""
        draggable="false"
      />

      <h3 class="kujiRevealDialog__title">STARDO 一番賞</h3>

      <div class="kujiRevealDialog__revealWrap">
        <KujiRevealStrip
          :key="currentIndex"
          :grade="currentPull?.prizeLevel"
          @reveal="handleReveal"
        />
      </div>

      <p class="kujiRevealDialog__progress">
        {{ currentIndex + 1 }} / {{ pulls.length }}
      </p>

      <div class="kujiRevealDialog__actions">
        <button class="kujiRevealDialog__btn" @click="skipOne">跳過</button>
        <button
          class="kujiRevealDialog__btn kujiRevealDialog__btn--danger"
          @click="skipAll"
        >
          全部跳過
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import KujiRevealStrip from '@/components/common/KujiRevealStrip.vue';
import { delay } from '@/utils/DelayUtils';
import { useOverlayStore } from '@/stores/overlay';
import polerDialogBg from '@/assets/image/poler-dialog-bg.png';

type Pull = any;

const props = defineProps<{
  pulls: Pull[];
}>();

const emit = defineEmits<{
  (e: 'finish', results: Pull[]): void;
  (e: 'cancel', results: Pull[]): void;
}>();

/* ===== Overlay ===== */
const overlay = useOverlayStore();

/** 目前第幾抽 */
const currentIndex = ref(0);

/** 已完成結果 */
const results = ref<Pull[]>([]);

/** 當前抽卡資料 */
const currentPull = computed(() => props.pulls[currentIndex.value]);

/* =====================
   核心流程
===================== */

/** 正常揭曉後 */
const handleReveal = async () => {
  if (!currentPull.value) return;

  results.value.push(currentPull.value);

  await delay(800);

  next();
};

const next = () => {
  if (currentIndex.value < props.pulls.length - 1) {
    currentIndex.value++;
  } else {
    emit('finish', results.value);
  }
};

/* =====================
   跳過功能
===================== */

/** 跳過單張 */
const skipOne = () => {
  if (!currentPull.value) return;
  results.value.push(currentPull.value);
  next();
};

/** 全部跳過 */
const skipAll = () => {
  const rest = props.pulls.slice(currentIndex.value);
  results.value.push(...rest);
  emit('finish', results.value);
};

/** 中途取消 */
const cancel = () => {
  emit('cancel', results.value);
};

/* ===== Lifecycle ===== */
onMounted(() => {});
onUnmounted(() => {});
</script>

<style scoped lang="scss">
.kujiRevealDialog {
  position: fixed;
  inset: 0;
  z-index: 99999;

  &__backdrop {
    position: absolute;
    inset: 0;
  }

  &__panel {
    position: relative;
    z-index: 1;

    width: 360px;
    margin: 18vh auto;
    padding: 18px 16px 16px;

    border-radius: 16px;
    background: transparent;
    color: #fff;
    text-align: center;
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 0;

    pointer-events: none;
    user-select: none;
  }

  &__title,
  &__revealWrap,
  &__progress,
  &__actions {
    position: relative;
    z-index: 1;
  }

  &__title {
    margin-bottom: 10px;
    font-weight: 700;
    font-size: 16px;
  }

  &__progress {
    margin-top: 10px;
    font-size: 12px;
    opacity: 0.9;
  }

  &__revealWrap {
    width: 300px;
    height: 184px;
    margin: 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;
    overflow: visible;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 12px;
  }

  &__btn {
    width: 100px;
    height: 46px;

    border-radius: 50px;
    border: none;
    cursor: pointer;

    font-size: 16px;
    letter-spacing: 0.5px;

    background: #6f471a;
    color: #f5e2ce;

    &--danger {
      width: 120px;
      color: #ffffff;
      background: #b43325;
    }
  }
}
</style>
