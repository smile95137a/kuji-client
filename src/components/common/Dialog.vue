<!-- src/components/common/Dialog.vue -->
<template>
  <div class="dialog">
    <div class="dialog__backdrop" @click="handleBackdropClick"></div>

    <div class="dialog__panel" @click.stop>
      <div class="dialog__header" v-if="title">
        <h3 class="dialog__title">{{ title }}</h3>
      </div>

      <div class="dialog__body">
        <p class="dialog__message">
          {{ message }}
        </p>
      </div>

      <div class="dialog__footer">
        <button
          v-if="showCancel"
          type="button"
          class="dialog__btn dialog__btn--secondary"
          @click="onCancelClick"
        >
          取消
        </button>
        <button
          type="button"
          class="dialog__btn dialog__btn--primary"
          @click="onConfirmClick"
        >
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    showCancel?: boolean;
  }>(),
  {
    showCancel: true,
  }
);

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'close'): void; // 關閉（背景點擊等）
}>();

const onConfirmClick = () => {
  emit('confirm');
};

const onCancelClick = () => {
  emit('cancel');
};

const handleBackdropClick = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.dialog {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;

  &__backdrop {
    position: absolute;
    inset: 0;
  }

  &__panel {
    position: relative;
    z-index: 1;
    max-width: 420px;
    width: 90%;
    background-color: #fff;
    border-radius: 16px;
    padding: 20px 20px 16px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  }

  &__header {
    margin-bottom: 8px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
  }

  &__body {
    margin-bottom: 16px;
  }

  &__message {
    font-size: 14px;
    line-height: 1.6;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  &__btn {
    min-width: 80px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid transparent;

    &--primary {
      background-color: #111;
      color: #fff;
      border-color: #111;
    }

    &--secondary {
      background-color: #fff;
      color: #111;
      border-color: #ccc;
    }
  }
}
</style>
