<!-- src/components/common/PrizeDesignationDialog.vue -->
<template>
  <div class="prize-designation-dialog">
    <div class="dialog__backdrop" @click="handleBackdropClick"></div>

    <div class="dialog__panel" @click.stop>
      <div class="dialog__header">
        <h3 class="dialog__title">🎁 指定大獎位置</h3>
        <div class="current-prize-info" v-if="currentPrize">
          <img 
            v-if="currentPrize.imageUrl" 
            :src="currentPrize.imageUrl" 
            :alt="currentPrize.name"
            class="prize-image"
          />
          <div class="prize-details">
            <div class="prize-name">{{ currentPrize.name }}</div>
            <div class="prize-level">{{ currentPrize.level }} 賞</div>
          </div>
        </div>
        <p class="dialog__subtitle">
          請為此大獎選擇 <strong class="highlight">{{ requiredCount }}</strong> 個號碼
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
              'number-btn--disabled': isDisabled(num)
            }"
            @click="toggleNumber(num)"
          >
            <span class="number-text">{{ num }}</span>
            <span v-if="selectedNumbers.includes(num)" class="check-icon">✓</span>
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
    usedNumbers?: number[];  // 已經被其他大獎指定的號碼
  }>(),
  {
    requiredCount: 3,
    currentPrize: null,
    usedNumbers: () => [],
  }
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
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.current-prize-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 12px;
  margin-bottom: 12px;
}

.prize-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.prize-details {
  text-align: left;
}

.prize-name {
  font-size: 18px;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 4px;
}

.prize-level {
  font-size: 14px;
  font-weight: 600;
  color: #636e72;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  display: inline-block;
}

.dialog__subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;

  .highlight {
    color: #ff6b6b;
    font-size: 18px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.selection-count {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
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
  border: 2px solid #ddd;
  border-radius: 12px;
  background: #fff;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(&--disabled) {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &--selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);

    .number-text {
      transform: scale(0.85);
    }
  }

  &--disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .number-text {
    transition: transform 0.2s ease;
  }

  .check-icon {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.3);
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
  background: #f8f9fa;
  border-radius: 12px;
}

.selected-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }
}

.dialog__footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.dialog__btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--secondary {
    background: #e0e0e0;
    color: #666;

    &:hover:not(:disabled) {
      background: #d5d5d5;
    }
  }

  &--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}

// 滾動條樣式
.numbers-grid::-webkit-scrollbar {
  width: 8px;
}

.numbers-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.numbers-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;

  &:hover {
    background: #555;
  }
}
</style>

<style scoped lang="scss">
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
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.dialog__subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;

  .highlight {
    color: #ff6b6b;
    font-size: 18px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.selection-count {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
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
  border: 2px solid #ddd;
  border-radius: 12px;
  background: #fff;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(&--disabled) {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &--selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);

    .number-text {
      transform: scale(0.85);
    }
  }

  &--disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .number-text {
    transition: transform 0.2s ease;
  }

  .check-icon {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.3);
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
  background: #f8f9fa;
  border-radius: 12px;
}

.selected-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }
}

.dialog__footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.dialog__btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--secondary {
    background: #e0e0e0;
    color: #666;

    &:hover:not(:disabled) {
      background: #d5d5d5;
    }
  }

  &--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}

// 滾動條樣式
.numbers-grid::-webkit-scrollbar {
  width: 8px;
}

.numbers-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.numbers-grid::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;

  &:hover {
    background: #555;
  }
}
</style>
