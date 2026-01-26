<!-- src/components/common/BasePagination.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = withDefaults(
  defineProps<{
    page: number;
    totalPages: number;
    maxVisible?: number;
  }>(),
  {
    maxVisible: 5,
  }
);

const emit = defineEmits<{
  (e: 'update:page', value: number): void;
}>();

const currentPage = computed({
  get: () => props.page,
  set: (val: number) => {
    if (val < 1 || val > props.totalPages) return;
    emit('update:page', val);
  },
});

const pages = computed<(number | '...')[]>(() => {
  const total = props.totalPages;
  const current = currentPage.value;
  const max = props.maxVisible;

  if (total <= 1) return [1];
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const list: (number | '...')[] = [];
  const middleCount = max - 2;

  let start = Math.max(2, current - Math.floor(middleCount / 2));
  let end = Math.min(total - 1, start + middleCount - 1);

  if (end - start + 1 < middleCount) {
    start = Math.max(2, end - middleCount + 1);
  }

  list.push(1);

  if (start > 2) {
    list.push('...');
  }

  for (let i = start; i <= end; i++) {
    list.push(i);
  }

  if (end < total - 1) {
    list.push('...');
  }

  list.push(total);

  return list;
});

const goFirst = () => (currentPage.value = 1);
const goLast = () => (currentPage.value = props.totalPages);
const goPrev = () => (currentPage.value = currentPage.value - 1);
const goNext = () => (currentPage.value = currentPage.value + 1);
const goTo = (p: number) => (currentPage.value = p);
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="pagination">
    <button
      type="button"
      class="pagination__btn"
      :disabled="currentPage === 1"
      @click="goFirst"
    >
      <font-awesome-icon :icon="['fas', 'angles-left']" />
    </button>

    <button
      type="button"
      class="pagination__btn"
      :disabled="currentPage === 1"
      @click="goPrev"
    >
      <font-awesome-icon :icon="['fas', 'angle-left']" />
    </button>

    <span class="pagination__pages">
      <template v-for="(p, idx) in pages" :key="idx">
        <button
          v-if="p !== '...'"
          type="button"
          class="pagination__page"
          :class="{ 'pagination__page--active': currentPage === p }"
          @click="goTo(p as number)"
        >
          {{ p }}
        </button>
        <span v-else class="pagination__ellipsis">…</span>
      </template>
    </span>

    <button
      type="button"
      class="pagination__btn"
      :disabled="currentPage === totalPages"
      @click="goNext"
    >
      <font-awesome-icon :icon="['fas', 'angle-right']" />
    </button>

    <button
      type="button"
      class="pagination__btn"
      :disabled="currentPage === totalPages"
      @click="goLast"
    >
      <font-awesome-icon :icon="['fas', 'angles-right']" />
    </button>
  </nav>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 14px;

  &__btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px 6px;
    font-size: 16px;
    color: #9c8a78;
    opacity: 0.8;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 1;
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }

    /* icon 大小 */
    :deep(svg) {
      width: 18px;
      height: 18px;
    }
  }

  &__pages {
    display: inline-flex;
    gap: 4px;
    margin: 0 4px;
  }

  &__page {
    min-width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: #9c8a78;
    transition: all 0.15s ease;

    &--active {
      background: #9c8a78;
      color: #fff;
    }
  }

  &__ellipsis {
    min-width: 28px;
    text-align: center;
    color: #9c8a78;
  }
}
</style>
