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

          <!-- 刮卡動畫阶段 -->
          <div class="scDialog__body">
            <ScratchCard
              :key="currentIndex"
              :image-src="currentCard.imageSrc"
              :image-alt="currentCard.imageAlt"
              :grade="currentCard.grade"
              :idle-text="currentCard.idleText"
              :reveal-text="currentCard.revealText"
              :threshold="currentCard.threshold"
              :revealed-number="currentCard.revealedNumber"
              @revealed="handleRevealed"
            />
          </div>

          <!-- 進度（多張時顯示） -->
          <p class="scDialog__progress" v-if="cards.length > 1">
            {{ currentIndex + 1 }} / {{ cards.length }}
          </p>

          <!-- 操作按鈕（展示 revealedNumber 時隱藏，防止截圖跳過） -->
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
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import ScratchCard from '@/components/ScratchCard.vue';

type ScratchItem = {
  imageSrc: string;
  imageAlt?: string;
  grade?: string;
  idleText?: string;
  revealText?: string;
  threshold?: number;
  revealedNumber?: number | null;
};

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    cards?: ScratchItem[];
    imageSrc?: string;
    imageAlt?: string;
    idleText?: string;
    revealText?: string;
    threshold?: number;
    grade?: string;
    revealedNumber?: number | null;
  }>(),
  {
    threshold: 45,
    imageSrc: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'revealed',
    payload?: { item: ScratchItem; results: ScratchItem[] },
  ): void;
  (e: 'finish', results: ScratchItem[]): void;
  (e: 'cancel', results?: ScratchItem[]): void;
}>();

const singleCard = computed<ScratchItem>(() => ({
  imageSrc: props.imageSrc ?? '',
  imageAlt: props.imageAlt,
  grade: props.grade,
  idleText: props.idleText,
  revealText: props.revealText,
  threshold: props.threshold,
  revealedNumber: props.revealedNumber,
}));

const cards = computed<ScratchItem[]>(() => {
  if (props.cards && props.cards.length > 0) return props.cards;
  return [singleCard.value];
});

const resolvedTitle = computed(
  () => props.title || (cards.value.length > 1 ? '刮刮樂' : ''),
);

const currentIndex = ref(0);
const results = ref<ScratchItem[]>([]);
const showReveal = ref(false);

const currentCard = computed(
  () => cards.value[currentIndex.value] ?? singleCard.value,
);

const currentRevealedNumber = computed(
  () => currentCard.value?.revealedNumber ?? null,
);

let autoNextTimer: ReturnType<typeof setTimeout> | null = null;

const clearAutoNextTimer = () => {
  if (autoNextTimer) {
    clearTimeout(autoNextTimer);
    autoNextTimer = null;
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      currentIndex.value = 0;
      results.value = [];
      showReveal.value = false;
      clearAutoNextTimer();
    } else {
      clearAutoNextTimer();
    }
  },
);

onBeforeUnmount(() => {
  clearAutoNextTimer();
});

const next = () => {
  clearAutoNextTimer();

  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++;
  } else {
    emit('finish', results.value);
    emit('update:modelValue', false);
  }
};

const pushAndNext = (item: ScratchItem) => {
  if (!item) return;

  results.value.push(item);
  emit('revealed', { item, results: results.value });
  next();
};

const confirmReveal = () => {
  clearAutoNextTimer();
  showReveal.value = false;
  pushAndNext(currentCard.value);
};

const handleRevealed = () => {
  const card = currentCard.value;

  // 有開獎號碼就先顯示結果頁，2 秒後自動下一張
  if (card?.revealedNumber != null) {
    showReveal.value = true;
    clearAutoNextTimer();
    autoNextTimer = setTimeout(() => {
      confirmReveal();
    }, 2000);
    return;
  }

  // 沒有 revealedNumber 就直接 2 秒後下一張
  clearAutoNextTimer();
  autoNextTimer = setTimeout(() => {
    pushAndNext(card);
  }, 2000);
};

const skipOne = () => {
  clearAutoNextTimer();
  showReveal.value = false;
  pushAndNext(currentCard.value);
};

const skipAll = () => {
  clearAutoNextTimer();
  showReveal.value = false;

  const rest = cards.value.slice(currentIndex.value);
  results.value.push(...rest);

  const last = rest[rest.length - 1];
  if (last) emit('revealed', { item: last, results: results.value });

  emit('finish', results.value);
  emit('update:modelValue', false);
};

const handleBackdropClick = () => {
  handleCancel();
};

const handleCancel = () => {
  clearAutoNextTimer();
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

.scDialog__btn--confirm {
  background: #b43325;
  margin-top: 16px;
  width: 100%;
  font-size: 15px;
  font-weight: 800;
  padding: 12px 24px;
}

/* revealedNumber 大字展示區 */
.scDialog__revealBody {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem 0.5rem;
  text-align: center;
}

.scDialog__revealLabel {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.scDialog__revealNumber {
  font-size: 72px;
  font-weight: 950;
  line-height: 1;
  color: #b43325;
  text-shadow: 0 4px 16px rgba(180, 51, 37, 0.35);
  letter-spacing: -2px;
  margin-bottom: 8px;
}

.scDialog__revealGrade {
  font-size: 18px;
  font-weight: 800;
  color: #374151;
  margin-bottom: 4px;
}

.scDialog__revealPrize {
  font-size: 15px;
  font-weight: 700;
  color: #6b7280;
}
</style>
