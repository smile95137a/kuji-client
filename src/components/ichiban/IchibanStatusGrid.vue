<!-- src/components/ichiban/IchibanStatusGrid.vue -->
<script setup lang="ts">
const props = defineProps<{
  cards: number[];
  activeCards: number[];
  cardImg: string;
}>();

const emit = defineEmits<{
  (e: 'select', card: number): void;
}>();
</script>

<template>
  <div class="ichibanStatusGrid">
    <div
      v-for="card in cards"
      :key="card"
      class="ichibanStatusGrid__card"
      :class="{ 'ichibanStatusGrid__card--active': activeCards.includes(card) }"
      @click="emit('select', card)"
      tabindex="0"
      role="button"
      @keyup.enter="emit('select', card)"
    >
      <img :src="cardImg" alt="" class="ichibanStatusGrid__img" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ichibanStatusGrid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px 16px;
  justify-items: center;

  &__card {
    width: 110px;
    aspect-ratio: 3 / 4.3;
    border-radius: 12px;
    overflow: hidden;
    background: #b43325;
    cursor: pointer;
    border: 2px solid transparent;
    transition: 0.18s ease;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 22px rgba(0, 0, 0, 0.6);
    }
  }

  /* ⭐ 升級後的 ACTIVE 效果（超明顯） */
  &__card--active {
    border-color: #ffca45;
    transform: translateY(-6px) scale(1.05);
    box-shadow: 0 0 16px rgba(255, 202, 69, 0.8),
      0 12px 28px rgba(0, 0, 0, 0.85);
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* RWD */
  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
