<!-- src/components/common/ScratchCardDialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="scDialog-fade">
      <div v-if="modelValue" class="scDialog">
        <div class="scDialog__backdrop" @click="handleBackdropClick"></div>

        <div class="scDialog__panel" @click.stop>
          <!-- Header（可選） -->
          <div class="scDialog__header" v-if="resolvedTitle">
            <h3 class="scDialog__title">{{ resolvedTitle }}</h3>
            <button class="scDialog__close" type="button" @click="handleCancel">
              ✕
            </button>
          </div>

          <div class="scDialog__body">
            <!-- 目前這一張 -->
            <ScratchCard
              :key="currentIndex"
              :image-src="currentCard.imageSrc"
              :image-alt="currentCard.imageAlt"
              :grade="currentCard.grade"
              :idle-text="currentCard.idleText"
              :reveal-text="currentCard.revealText"
              :threshold="currentCard.threshold"
              @revealed="handleRevealed"
            />
          </div>

          <!-- 進度（多張時顯示） -->
          <p class="scDialog__progress" v-if="cards.length > 1">
            {{ currentIndex + 1 }} / {{ cards.length }}
          </p>

          <!-- 操作按鈕 -->
          <div class="scDialog__actions">
            <button class="scDialog__btn" type="button" @click="skipOne">
              跳過
            </button>
            <button
              class="scDialog__btn scDialog__btn--danger"
              type="button"
              @click="skipAll"
            >
              全部跳過
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ScratchCard from '@/components/ScratchCard.vue';

type ScratchItem = {
  imageSrc: string;
  imageAlt?: string;
  grade?: string;
  idleText?: string;
  revealText?: string;
  threshold?: number;
};

const props = withDefaults(
  defineProps<{
    modelValue: boolean;

    /** 可選：標題 */
    title?: string;

    /**  多張模式：十連抽等（有傳就用這個） */
    cards?: ScratchItem[];

    /** 單張模式（舊用法保留） */
    imageSrc: string;
    imageAlt?: string;
    idleText?: string;
    revealText?: string;
    threshold?: number;
    grade?: string;
  }>(),
  {
    threshold: 45,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;

  /** 單張（或每張）刮開 / 被跳過時都會觸發 */
  (
    e: 'revealed',
    payload?: { item: ScratchItem; results: ScratchItem[] },
  ): void;

  /**  全部流程完成（包含跳過） */
  (e: 'finish', results: ScratchItem[]): void;

  /** 取消關閉（回傳目前累積結果，單張用法也不會壞） */
  (e: 'cancel', results?: ScratchItem[]): void;
}>();

/** 把「單張 props」也包成一張，做到向下相容 */
const singleCard = computed<ScratchItem>(() => ({
  imageSrc: props.imageSrc,
  imageAlt: props.imageAlt,
  grade: props.grade,
  idleText: props.idleText,
  revealText: props.revealText,
  threshold: props.threshold,
}));

/** 最終使用的卡片列表：有 cards 就走多張，沒有就走單張 */
const cards = computed<ScratchItem[]>(() => {
  if (props.cards && props.cards.length > 0) return props.cards;
  return [singleCard.value];
});

const resolvedTitle = computed(
  () => props.title || (cards.value.length > 1 ? '刮刮樂' : ''),
);

/** 目前第幾張 */
const currentIndex = ref(0);

/** 已完成結果（刮開 or 跳過） */
const results = ref<ScratchItem[]>([]);

const currentCard = computed(() => cards.value[currentIndex.value]);

/** Dialog 打開時重置（避免上次殘留） */
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      currentIndex.value = 0;
      results.value = [];
    }
  },
);

/* =====================
   核心流程
===================== */

const next = () => {
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++;
  } else {
    // 全部完成
    emit('finish', results.value);
    emit('update:modelValue', false);
  }
};

const pushAndNext = (item: ScratchItem) => {
  // 防呆：如果已經沒有 currentCard（理論上不會）就不做
  if (!item) return;

  results.value.push(item);
  emit('revealed', { item, results: results.value });
  next();
};

const handleRevealed = () => {
  // 「刮完」等同於完成這一張
  pushAndNext(currentCard.value);
};

/* =====================
   跳過功能
===================== */

const skipOne = () => {
  // 單張：等同直接完成
  // 多張：直接把當前這張當作已完成
  pushAndNext(currentCard.value);
};

const skipAll = () => {
  const rest = cards.value.slice(currentIndex.value);
  results.value.push(...rest);

  // 這裡也順便補一個 revealed（代表最後一次操作把剩下都完成）
  // 如果你不想要這個事件，也可以拿掉
  const last = rest[rest.length - 1];
  if (last) emit('revealed', { item: last, results: results.value });

  emit('finish', results.value);
  emit('update:modelValue', false);
};

/* =====================
   取消關閉
===================== */

const handleBackdropClick = () => {
  handleCancel();
};

const handleCancel = () => {
  emit('update:modelValue', false);
  emit('cancel', results.value);
};
</script>

<style scoped lang="scss">
.scDialog-fade-enter-active,
.scDialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.scDialog-fade-enter-from,
.scDialog-fade-leave-to {
  opacity: 0;
}

.scDialog {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/*  透明遮罩，只負責擋點擊 */
.scDialog__backdrop {
  position: absolute;
  inset: 0;
  background-color: transparent;
}

/* Panel */
.scDialog__panel {
  position: relative;
  z-index: 1;
  width: min(360px, 90vw);
  border-radius: 16px;
  background: radial-gradient(circle at top left, #ffffff, #f3f4ff);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  transform: translateY(0);
  animation: scDialog-pop 0.22s ease-out;

  display: flex;
  flex-direction: column;
}

@keyframes scDialog-pop {
  from {
    transform: translateY(10px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.scDialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(
    to right,
    rgba(248, 250, 252, 0.9),
    rgba(239, 246, 255, 0.9)
  );
}

.scDialog__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.04em;
}

.scDialog__close {
  border: none;
  background: none;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;
  color: #6b7280;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: rgba(148, 163, 184, 0.18);
    color: #111827;
  }
}

.scDialog__body {
  padding: 1rem 1rem 0.6rem;
  display: flex;
  justify-content: center;
}

.scDialog__progress {
  margin: 0;
  padding: 0 1rem 0.6rem;
  font-size: 12px;
  opacity: 0.65;
  text-align: center;
}

/* Actions */
.scDialog__actions {
  padding: 0 1rem 1rem;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.scDialog__btn {
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  background: #334155;
  color: #fff;
}

.scDialog__btn--danger {
  background: #7c2d12;
}
</style>
