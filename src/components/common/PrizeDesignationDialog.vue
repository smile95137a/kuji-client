<!-- src/components/common/PrizeDesignationDialog.vue -->
<template>
  <div class="prize-designation-dialog">
    <div class="dialog__backdrop" @click="handleBackdropClick"></div>

    <div class="dialog__panel" @click.stop>
      <div class="dialog__header">
        <h3 class="dialog__title">指定大獎位置</h3>

        <p class="dialog__subtitle">
          請為此大獎選擇
          <strong class="highlight">{{ requiredCount }}</strong> 個號碼
        </p>
      </div>

      <div class="dialog__body">
        <div class="selection-info">
          <span class="selection-count">
            已選擇：{{ selectedNumbers.length }} / {{ requiredCount }}
          </span>
        </div>

        <div class="numbers-grid">
          <button
            v-for="num in availableNumbers"
            :key="num"
            type="button"
            class="number-btn"
            :class="{
              'number-btn--selected': selectedNumbers.includes(num),
              'number-btn--disabled': isDisabled(num),
            }"
            @click="toggleNumber(num)"
          >
            <span class="number-text">{{ num }}</span>
            <span v-if="selectedNumbers.includes(num)" class="check-icon"
              >✓</span
            >
          </button>
        </div>

        <div class="selected-list" v-if="selectedNumbers.length > 0">
          <div class="selected-label">已選號碼：</div>
          <div class="selected-chips">
            <span
              v-for="num in selectedNumbers"
              :key="num"
              class="chip"
              @click="removeNumber(num)"
            >
              {{ num }} ×
            </span>
          </div>
        </div>
      </div>

      <div class="dialog__footer">
        <button
          type="button"
          class="dialog__btn dialog__btn--secondary"
          @click="onCancelClick"
        >
          取消
        </button>
        <button
          type="button"
          class="dialog__btn dialog__btn--primary"
          :disabled="!canConfirm"
          @click="onConfirmClick"
        >
          確認指定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Prize {
  id: string;
  name: string;
  level: string;
  imageUrl?: string;
  quantity: number;
  isGrandPrize: boolean;
}

const props = withDefaults(
  defineProps<{
    availableNumbers: number[];
    requiredCount?: number;
    currentPrize?: Prize | null;
    usedNumbers?: number[]; // 已經被其他大獎指定的號碼
  }>(),
  {
    requiredCount: 3,
    currentPrize: null,
    usedNumbers: () => [],
  },
);

const emit = defineEmits<{
  (e: 'confirm', numbers: number[]): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
}>();

const selectedNumbers = ref<number[]>([]);

const canSelectMore = computed(() => {
  return selectedNumbers.value.length < props.requiredCount;
});

const canConfirm = computed(() => {
  return selectedNumbers.value.length === props.requiredCount;
});

const isDisabled = (num: number) => {
  // 已被其他大獎指定的號碼不能選
  if (props.usedNumbers.includes(num)) return true;
  // 已選滿且當前號碼未被選中
  if (!canSelectMore.value && !selectedNumbers.value.includes(num)) return true;
  return false;
};

const toggleNumber = (num: number) => {
  if (isDisabled(num)) return;

  const index = selectedNumbers.value.indexOf(num);
  if (index > -1) {
    // 已選中，取消選擇
    selectedNumbers.value.splice(index, 1);
  } else if (canSelectMore.value) {
    // 未選中且還可以選，添加選擇
    selectedNumbers.value.push(num);
  }
};

const removeNumber = (num: number) => {
  const index = selectedNumbers.value.indexOf(num);
  if (index > -1) {
    selectedNumbers.value.splice(index, 1);
  }
};

const onConfirmClick = () => {
  if (canConfirm.value) {
    emit('confirm', [...selectedNumbers.value]);
  }
};

const onCancelClick = () => {
  emit('cancel');
};

const handleBackdropClick = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
/* theme */
$brand: #b43325;
$brand-weak: rgba(180, 51, 37, 0.12);
$brand-weak-2: rgba(180, 51, 37, 0.2);

.prize-designation-dialog {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
}

.dialog__panel {
  position: relative;
  z-index: 1;
  max-width: 600px;
  max-height: 90vh;
  width: 90%;
  background-color: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
}

.dialog__header {
  margin-bottom: 20px;
  text-align: center;
}

.dialog__title {
  font-size: 22px;
  font-weight: 800;
  color: #2b2b2b;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.current-prize-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 14px;
  background: linear-gradient(
    135deg,
    $brand-weak 0%,
    rgba(255, 255, 255, 1) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  margin-bottom: 10px;
}

.prize-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.prize-details {
  text-align: left;
}

.prize-name {
  font-size: 18px;
  font-weight: 800;
  color: #222;
  margin-bottom: 4px;
}

.prize-level {
  font-size: 13px;
  font-weight: 700;
  color: $brand;
  padding: 3px 10px;
  background: rgba(180, 51, 37, 0.1);
  border-radius: 999px;
  display: inline-block;
}

.dialog__subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.62);
  margin: 0;

  .highlight {
    color: $brand;
    font-size: 18px;
    font-weight: 900;
  }
}

.dialog__body {
  margin-bottom: 20px;
}

.selection-info {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding: 10px;
  background: rgba(180, 51, 37, 0.12);
  border: 1px solid rgba(180, 51, 37, 0.15);
  border-radius: 12px;
}

.selection-count {
  font-size: 15px;
  font-weight: 800;
  color: $brand;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.number-btn {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  background: #fff;
  font-size: 16px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.82);
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    border-color 120ms ease,
    opacity 120ms ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(&--disabled) {
    border-color: rgba(180, 51, 37, 0.55);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(180, 51, 37, 0.18);
  }

  &--selected {
    background: $brand;
    border-color: $brand;
    color: #fff;
    box-shadow: 0 8px 18px rgba(180, 51, 37, 0.35);

    .number-text {
      transform: scale(0.9);
    }

    .check-icon {
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.22);
    }
  }

  &--disabled {
    opacity: 0.28;
    cursor: not-allowed;
  }

  .number-text {
    transition: transform 120ms ease;
  }

  .check-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 12px;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.selected-list {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.selected-label {
  font-size: 13px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.62);
  margin-bottom: 8px;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(180, 51, 37, 0.1);
  color: $brand;
  border: 1px solid rgba(180, 51, 37, 0.2);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background 120ms ease;

  &:hover {
    background: rgba(180, 51, 37, 0.14);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(180, 51, 37, 0.12);
  }
}

.dialog__footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dialog__btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--secondary {
    background: rgba(0, 0, 0, 0.08);
    color: rgba(0, 0, 0, 0.68);

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.12);
    }
  }

  &--primary {
    background: $brand;
    color: #fff;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(180, 51, 37, 0.28);
    }
  }
}

/* 滾動條樣式 */
.numbers-grid::-webkit-scrollbar {
  width: 8px;
}

.numbers-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}

.numbers-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
