<!-- src/components/common/KujiButton.vue -->
<template>
  <button
    class="kuji-btn"
    :class="[
      `kuji-btn--${variant}`,
      {
        'kuji-btn--block': block,
        'kuji-btn--disabled': disabled,
      },
    ]"
    :type="type"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- icon 在左邊 -->
    <span v-if="$slots.icon && iconPosition === 'left'" class="kuji-btn__icon">
      <slot name="icon" />
    </span>

    <!-- 文字 / 主內容 -->
    <span class="kuji-btn__label">
      <slot />
    </span>

    <!-- icon 在右邊 -->
    <span v-if="$slots.icon && iconPosition === 'right'" class="kuji-btn__icon">
      <slot name="icon" />
    </span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 按鈕外觀：
     * primary = 紅色實心
     * outline = 白底紅框
     * secondary = 黃色實心（檢視抽況）
     */
    variant?: 'primary' | 'outline' | 'secondary';
    /** 原生 button type */
    type?: 'button' | 'submit' | 'reset';
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否佔滿整列寬度 */
    block?: boolean;
    /** icon 位置：left / right */
    iconPosition?: 'left' | 'right';
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    block: false,
    iconPosition: 'left',
  }
);

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return;
  emit('click', event);
};
</script>

<style scoped lang="scss">
/* 主色可以依照你網站的設計調整 */
$btn-red: #a23b2f;
$btn-red-dark: #7f2d20;
$btn-yellow: #d79b46;
$btn-yellow-dark: #c18430;
$btn-radius: 999px;

.kuji-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 140px;
  height: 48px;
  padding: 0 28px;

  border-radius: $btn-radius;
  border: 1px solid transparent;

  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;

  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;

  &--block {
    width: 100%;
  }

  &__label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;

    /* 如果放右邊，自然會在模板裡最後，margin 一樣往右 */
    &:last-child {
      margin-right: 0;
      margin-left: 8px;
    }

    /* 讓 icon 大小統一一點 */
    :deep(svg),
    :deep(img) {
      width: 20px;
      height: 20px;
    }
  }

  /* 紅色實心 */
  &--primary {
    background-color: $btn-red;
    border-color: $btn-red;
    color: #ffffff;

    &:hover {
      background-color: $btn-red-dark;
      border-color: $btn-red-dark;
    }
  }

  /* 白底紅框 */
  &--outline {
    background-color: #ffffff;
    border-color: $btn-red;
    color: $btn-red;

    &:hover {
      background-color: rgba(162, 59, 47, 0.06);
    }
  }

  /* 黃色實心（檢視抽況） */
  &--secondary {
    background-color: $btn-yellow;
    border-color: $btn-yellow;
    color: #000000;

    &:hover {
      background-color: $btn-yellow-dark;
      border-color: $btn-yellow-dark;
    }
  }

  &--disabled,
  &:disabled {
    opacity: 0.5;
    cursor: default;
    pointer-events: none;
  }
}
</style>
