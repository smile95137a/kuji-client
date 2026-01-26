<template>
  <div class="m-search" :class="customClass">
    <input
      class="m-search__input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      type="text"
      @input="onInput"
      @keydown.enter="onSearch"
    />

    <button
      class="m-search__btn"
      type="button"
      :disabled="disabled"
      @click="onSearch"
      aria-label="Search"
    >
      <slot name="icon"> 🔍 </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
    customClass?: string | string[] | Record<string, boolean>;
  }>(),
  {
    placeholder: '搜尋',
    disabled: false,
    customClass: '',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'search'): void;
}>();

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
};

const onSearch = () => {
  emit('search');
};
</script>

<style scoped lang="scss">
.m-search {
  display: flex;
  align-items: center;
  width: 260px;
  max-width: 100%;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.65);
  overflow: hidden;

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: none;
    padding: 0 12px 0 14px;
    background: transparent;
    color: rgba(0, 0, 0, 0.75);
    font-weight: 700;

    &::placeholder {
      color: rgba(0, 0, 0, 0.42);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__btn {
    width: 44px;
    height: 100%;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.55);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
