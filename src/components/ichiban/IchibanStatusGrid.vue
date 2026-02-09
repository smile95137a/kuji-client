<!-- src/components/ichiban/IchibanStatusGrid.vue -->
<script setup lang="ts">
import ichibanCardBack from '@/assets/image/ichibanCardBack.png';
import polerImages, { type PolerLevel } from '@/data/polerImages';

type Item = {
  id: string;

  ticketNumber: number;

  status?: 'AVAILABLE' | 'DRAWN' | 'RESERVED' | 'LOCKED' | string;

  level?: string;
  prizeLevel?: string;
  prize?: { level?: string } | null;
};

const props = defineProps<{
  cards: Item[];
  activeCards: string[];
}>();

const emit = defineEmits<{
  (e: 'select', ticketId: string): void;
}>();

const getCardId = (card: Item) => String(card.id || '');
const getCardNo = (card: Item) => Number(card.ticketNumber);

const getStatus = (card: Item) =>
  String(card.status ?? 'AVAILABLE').toUpperCase();

const getLevelKey = (card: Item): PolerLevel | null => {
  const raw = card.level ?? card.prizeLevel ?? card.prize?.level ?? '';

  const key = String(raw).trim().toUpperCase();
  if (!key) return null;

  if (key === 'LAST_PRIZE' || key === 'LASTPRIZE') return 'LAST';

  return key in polerImages ? (key as PolerLevel) : null;
};

const getLevelImg = (card: Item) => {
  const st = getStatus(card);

  if (st !== 'DRAWN') return ichibanCardBack;

  const levelKey = getLevelKey(card);
  return levelKey ? polerImages[levelKey] : ichibanCardBack;
};

const canClick = (card: Item) => {
  const st = getStatus(card);
  if (st === 'DRAWN') return false;
  if (st === 'LOCKED' || st === 'RESERVED') return false;
  return true;
};

const onSelect = (card: Item) => {
  if (!canClick(card)) return;

  const id = getCardId(card);
  if (!id) return;

  emit('select', id);
};
</script>

<template>
  <div class="ichibanStatusGrid">
    <div
      v-for="card in cards"
      :key="getCardId(card) || getCardNo(card)"
      class="ichibanStatusGrid__card"
      :class="{
        'ichibanStatusGrid__card--active': activeCards.includes(
          getCardId(card),
        ),
        'ichibanStatusGrid__card--drawn': getStatus(card) === 'DRAWN',
        'ichibanStatusGrid__card--locked': ['LOCKED', 'RESERVED'].includes(
          getStatus(card),
        ),
      }"
      @click="onSelect(card)"
      tabindex="0"
      role="button"
      @keyup.enter="onSelect(card)"
    >
      <img :src="getLevelImg(card)" alt="" class="ichibanStatusGrid__img" />
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
    width: 100%;
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

  &__card--active {
    border-color: #ffca45;
    transform: translateY(-6px) scale(1.05);
    box-shadow:
      0 0 16px rgba(255, 202, 69, 0.8),
      0 12px 28px rgba(0, 0, 0, 0.85);
  }

  &__card--drawn,
  &__card--locked {
    cursor: not-allowed;
    opacity: 0.65;

    &:hover {
      transform: none;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

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
