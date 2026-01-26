<!-- src/components/common/ObjDialog.vue -->
<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <h2 class="dialog__title">{{ title || '編輯物件' }}</h2>

      <div class="objDialog">
        <div
          v-for="(value, key) in localData"
          :key="key"
          class="objDialog__field"
        >
          <label class="objDialog__label">
            {{ key }}
          </label>

          <!-- boolean → checkbox -->
          <template v-if="typeof value === 'boolean'">
            <label class="objDialog__checkboxWrapper">
              <input
                type="checkbox"
                class="objDialog__checkbox"
                v-model="localData[key]"
              />
              <span>是 / 否</span>
            </label>
          </template>

          <!-- number → number input -->
          <template v-else-if="typeof value === 'number'">
            <input
              type="number"
              class="objDialog__input"
              v-model.number="localData[key]"
            />
          </template>

          <!-- 其他 → text input -->
          <template v-else>
            <input
              type="text"
              class="objDialog__input"
              v-model="localData[key]"
            />
          </template>
        </div>
      </div>

      <div class="dialog__footer">
        <button
          type="button"
          class="dialog__btn dialog__btn--secondary"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="dialog__btn dialog__btn--primary"
          @click="handleConfirm"
        >
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

type AnyObj = Record<string, any>;

const props = defineProps<{
  modelValue: boolean; // 雖然這裡 demo 裡固定 true，但保留給 service 用
  title?: string;
  data: AnyObj;
}>();

const emit = defineEmits<{
  (e: 'confirm', value: AnyObj): void;
  (e: 'cancel'): void;
  (e: 'update:modelValue', value: boolean): void;
}>();

const localData = ref<AnyObj>({});

// 簡單 deep clone
const cloneData = (obj: AnyObj): AnyObj =>
  JSON.parse(JSON.stringify(obj ?? {}));

watch(
  () => props.data,
  (val) => {
    localData.value = cloneData(val);
  },
  { immediate: true }
);

onMounted(() => {
  console.log('[ObjDialog onMounted] 初始 props =', {
    modelValue: props.modelValue,
    title: props.title,
    data: props.data,
  });
});

const handleConfirm = () => {
  const result = cloneData(localData.value);
  console.log('[ObjDialog confirm] result =', result);
  emit('confirm', result);
  emit('update:modelValue', false);
};

const handleCancel = () => {
  console.log('[ObjDialog cancel]');
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped lang="scss">
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  width: 360px;
  max-width: 90vw;
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px 14px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.35);
}

.dialog__title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.objDialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;

  &__field {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: 13px;
    margin-bottom: 4px;
    color: #374151;
  }

  &__input {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #d4d4d4;
    font-size: 14px;
  }

  &__checkboxWrapper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  &__checkbox {
    width: 14px;
    height: 14px;
  }
}

.dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog__btn {
  min-width: 72px;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid transparent;

  &--secondary {
    border-color: #e5e5e5;
    background-color: #fff;
  }

  &--primary {
    background-color: #111827;
    border-color: #111827;
    color: #fff;
  }
}
</style>
