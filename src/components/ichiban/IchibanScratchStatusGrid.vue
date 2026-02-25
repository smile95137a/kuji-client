<!-- src/components/ichiban/IchibanScratchStatusGrid.vue -->
<template>
  <section class="scratchGrid">
    <header class="scratchGrid__header">
      <h3 class="scratchGrid__title">選擇刮刮樂號碼</h3>
      <p class="scratchGrid__subtitle">點選可用號碼加入本次刮刮清單</p>
    </header>

    <div class="scratchGrid__grid">
      <button
        v-for="t in normalizedCards"
        :key="t.id"
        type="button"
        class="scratchGrid__cell"
        :class="cellClass(t)"
        :disabled="!t.isAvailable"
        @click="emitSelect(t.id)"
        :title="t.isAvailable ? '點選加入本次刮刮' : '已刮過 / 不可選'"
      >
        <!-- 未刮：圓圈 -->
        <div
          v-if="t.isAvailable"
          class="scratchGrid__circle"
          aria-hidden="true"
        />

        <!-- 已刮：顯示 revealedNumber（刮開號碼），沒有則顯示 ticketNumber -->
        <div v-else class="scratchGrid__num">
          {{ t.revealedNumber ?? t.ticketNumber }}
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type TicketItem = {
  id: string;
  ticketNumber: number;
  status: 'AVAILABLE' | 'DRAWN' | 'RESERVED' | 'LOCKED' | string;
  /** 刮刮樂：刮開後的號碼（已抽才有值） */
  revealedNumber?: number | null;
};

const props = defineProps<{
  cards: TicketItem[];
  activeCards: string[];
}>();

const emit = defineEmits<{
  (e: 'select', ticketId: string): void;
}>();

const normalizedCards = computed(() => {
  const arr = Array.isArray(props.cards) ? props.cards : [];
  return arr
    .map((t) => {
      const status = String(t.status ?? '').toUpperCase();
      return {
        ...t,
        ticketNumber: Number(t.ticketNumber ?? 0) || 0,
        isAvailable: status === 'AVAILABLE',
      };
    })
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
});

const isActive = (id: string) => props.activeCards.includes(id);

const cellClass = (t: any) => ({
  'is-available': t.isAvailable,
  'is-scratched': !t.isAvailable,
  'is-active': isActive(t.id),
});

const emitSelect = (id: string) => emit('select', id);
</script>

<style scoped lang="scss">
$primary: #b43325;
$primary-dark: #7d1f16;

.scratchGrid {
  margin-top: 18px;
  padding: 20px;
  border-radius: 18px;
  background:
    radial-gradient(
      circle at 20% 10%,
      rgba(255, 255, 255, 0.06),
      transparent 40%
    ),
    linear-gradient(145deg, #1a0706, #0c0303);
  border: 1px solid rgba(180, 51, 37, 0.25);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.scratchGrid__header {
  margin-bottom: 16px;
}

.scratchGrid__title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #fff;
}

.scratchGrid__subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.scratchGrid__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
}

.scratchGrid__cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.18s ease;
  background: rgba(255, 255, 255, 0.04);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 6px 16px rgba(0, 0, 0, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 10px 22px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.is-active {
    border-color: rgba(180, 51, 37, 0.95);
    box-shadow:
      0 0 0 2px rgba(180, 51, 37, 0.6),
      0 0 0 6px rgba(180, 51, 37, 0.2),
      0 12px 26px rgba(180, 51, 37, 0.2);
  }
}

/* 可刮 */
.scratchGrid__cell.is-available {
  background:
    radial-gradient(
      circle at 30% 25%,
      rgba(255, 255, 255, 0.2),
      transparent 40%
    ),
    repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0px,
      rgba(255, 255, 255, 0.08) 6px,
      rgba(0, 0, 0, 0.06) 6px,
      rgba(0, 0, 0, 0.06) 12px
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(180, 51, 37, 0.95),
      rgba(125, 31, 22, 0.95)
    );

  border-color: rgba(180, 51, 37, 0.5);
}

/* 已刮 */
.scratchGrid__cell.is-scratched {
  background: linear-gradient(145deg, #120606, #000000);
  border-color: rgba(180, 51, 37, 0.18);
  box-shadow: inset 0 14px 28px rgba(0, 0, 0, 0.6);
}

.scratchGrid__circle {
  width: 30%;
  height: 30%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.4),
    0 6px 14px rgba(0, 0, 0, 0.25);
}

.scratchGrid__num {
  font-size: 20px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}
</style>
