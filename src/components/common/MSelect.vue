<template>
  <div class="m-select" :class="customClass">
    <select
      class="m-select__control"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
    >
      <option
        v-if="placeholder !== undefined"
        :value="placeholderValue"
        :disabled="placeholderDisabled"
      >
        {{ placeholder }}
      </option>

      <option
        v-for="opt in options"
        :key="String(opt.value)"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>

    <span class="m-select__caret" aria-hidden="true">▾</span>
  </div>
</template>

<script setup lang="ts">
type SelectOption = { label: string; value: string };

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: SelectOption[];
    disabled?: boolean;

    placeholder?: string | undefined;
    placeholderValue?: string;
    placeholderDisabled?: boolean;

    customClass?: string | string[] | Record<string, boolean>;
  }>(),
  {
    disabled: false,
    placeholderValue: '',
    placeholderDisabled: false,
    customClass: '',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'change', v: string): void;
}>();

const onChange = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value;
  emit('update:modelValue', v);
  emit('change', v);
};
</script>

<style scoped lang="scss">
.m-select {
  position: relative;
  display: inline-flex;
  align-items: center;

  &__control {
    appearance: none;
    height: 34px;
    padding: 0 34px 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.18);
    background: rgba(255, 255, 255, 0.65);
    color: rgba(0, 0, 0, 0.7);
    font-weight: 700;
    outline: none;
    line-height: 34px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__caret {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: rgba(0, 0, 0, 0.55);
    font-size: 12px;
  }
}
</style>
