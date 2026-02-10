<!-- src/components/common/GotchaDialog.vue -->
<template>
  <div class="dialog">
    <div class="dialog__backdrop" @click="cancel" />

    <div class="dialog__panel" @click.stop>
      <h3 class="dialog__title">
        {{ title || currentPull?.title || '抽獎中' }}
      </h3>

      <div class="gotcha-wrap">
        <GotchaMachine
          :key="currentIndex"
          :speed="speed"
          :prizes="currentPull ? [currentPull] : []"
          @got-prize="handleGotPrize"
        />
      </div>

      <!-- 進度 -->
      <p class="dialog__progress">
        {{ currentIndex + 1 }} / {{ pulls.length }}
      </p>

      <!-- 操作按鈕 -->
      <div class="dialog__actions">
        <button class="dialog__btn" type="button" @click="skipOne">跳過</button>
        <button
          class="dialog__btn dialog__btn--danger"
          type="button"
          @click="skipAll"
        >
          全部跳過
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import GotchaMachine from '@/components/common/GotchaMachine.vue';

type Pull = { image: string; title: string };

const props = withDefaults(
  defineProps<{
    title?: string;
    pulls: Pull[];

    /** 讓你可以外部控制扭蛋節奏（越小越快，因為你 gotcha 裡面是乘上 SPEED） */
    speed?: number;

    /** 可選：換機台圖 / pointer 圖 */
    machineSrc?: string;
    pointerSrc?: string;
  }>(),
  {
    speed: 0.65,
  }
);

const emit = defineEmits<{
  (e: 'finish', results: Pull[]): void;
  (e: 'cancel', results: Pull[]): void;
}>();

/** 目前第幾抽 */
const currentIndex = ref(0);

/** 已完成結果 */
const results = ref<Pull[]>([]);

/** 當前抽卡資料 */
const currentPull = computed(() => props.pulls[currentIndex.value]);

/* =====================
   核心流程
===================== */

/** Gotcha 動畫完成後會 emit('got-prize', prize) */
const handleGotPrize = async (p: Pull) => {
  // 防呆：dialog 已結束時不再處理
  if (!currentPull.value) return;

  results.value.push(p);

  // 給你一點點緩衝（可調）
  await new Promise<void>((r) => setTimeout(r, 1000));

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

const skipOne = () => {
  if (!currentPull.value) return;
  results.value.push(currentPull.value);
  next();
};

const skipAll = () => {
  const rest = props.pulls.slice(currentIndex.value);
  results.value.push(...rest);
  emit('finish', results.value);
};

const cancel = () => {
  emit('cancel', results.value);
};
</script>

<style scoped>
/* =====================
   Dialog 基本結構
===================== */
.dialog {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 0;
}

.dialog__panel {
  position: relative;
  z-index: 2;
  width: min(360px, 90vw);
  border-radius: 16px;
  background: radial-gradient(circle at top left, #ffffff, #f3f4ff);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  transform: translateY(0);

  display: flex;
  flex-direction: column;
}

/* =====================
   標題 / 進度
===================== */
.dialog__title {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
  text-align: center;
}

.dialog__progress {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
}

/* =====================
   🎯 扭蛋機包覆容器
===================== */
.gotcha-wrap {
  position: relative;
  flex: 1;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 讓 gotcha 充滿容器 */
.gotcha-wrap__machine {
  width: 100%;
  height: 100%;
}

/* =====================
   操作按鈕
===================== */
.dialog__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dialog__btn {
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  background: #334155;
  color: #fff;
}

.dialog__btn--danger {
  background: #7c2d12;
}
</style>
