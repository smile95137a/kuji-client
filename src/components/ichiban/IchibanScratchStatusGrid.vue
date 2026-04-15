<!-- src/components/ichiban/IchibanScratchStatusGrid.vue -->
<template>
  <section class="scratchGrid">
    <div class="scratchGrid__watermark" aria-hidden="true">
      <img :src="weblogo" alt="" />
    </div>

    <header class="scratchGrid__header">
      <div class="scratchGrid__brand">
        <div class="scratchGrid__brandLogo">
          <img :src="weblogo" alt="logo" />
        </div>

        <div class="scratchGrid__brandText">
          <h3 class="scratchGrid__title">選擇刮刮樂號碼</h3>
          <p class="scratchGrid__subtitle">點選可用號碼加入本次刮刮清單</p>
        </div>
      </div>
    </header>

    <div class="scratchGrid__grid">
      <button
        v-for="t in normalizedCards"
        :key="t.id"
        type="button"
        class="scratchGrid__cell"
        :class="cellClass(t)"
        :disabled="!t.isAvailable"
        :title="getCellTitle(t)"
        @click="emitSelect(t.id)"
      >
        <div
          v-if="!t.isAvailable"
          class="scratchGrid__cellLogo"
          aria-hidden="true"
        >
          <img :src="weblogo" alt="" />
        </div>

        <!-- 可選格 -->
        <template v-if="t.isAvailable">
          <div class="scratchGrid__badge" v-if="t.isActive">已選擇</div>

          <div class="scratchGrid__ticketNo"></div>

          <div class="scratchGrid__circle" aria-hidden="true">
            <span class="scratchGrid__circleCore">
              <img :src="weblogo" alt="" class="scratchGrid__circleLogo" />
            </span>
          </div>
        </template>

        <!-- 已刮過 / 不可選 -->
        <template v-else>
          <div class="scratchGrid__num">
            {{ t.revealedNumber ?? t.ticketNumber }}
          </div>
        </template>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import weblogo from '@/assets/image/weblogo.png';

type TicketItem = {
  id: string | number;
  ticketNumber: number | string;
  status: 'AVAILABLE' | 'DRAWN' | 'RESERVED' | 'LOCKED' | string;
  revealedNumber?: number | null;
};

const props = defineProps<{
  cards: TicketItem[];
  activeCards: Array<string | number>;
}>();

const emit = defineEmits<{
  (e: 'select', ticketId: string): void;
}>();

const activeCardSet = computed(() => {
  return new Set((props.activeCards ?? []).map((id) => String(id)));
});

const normalizedCards = computed(() => {
  const arr = Array.isArray(props.cards) ? props.cards : [];

  return arr
    .map((t) => {
      const status = String(t.status ?? '').toUpperCase();
      const id = String(t.id ?? '');
      const ticketNumber = Number(t.ticketNumber ?? 0) || 0;

      return {
        ...t,
        id,
        ticketNumber,
        isAvailable: status === 'AVAILABLE',
        isActive: activeCardSet.value.has(id),
      };
    })
    .sort((a, b) => a.ticketNumber - b.ticketNumber);
});

const cellClass = (t: (typeof normalizedCards.value)[number]) => ({
  'is-available': t.isAvailable,
  'is-scratched': !t.isAvailable,
  'is-active': t.isActive,
});

const getCellTitle = (t: (typeof normalizedCards.value)[number]) => {
  if (!t.isAvailable) return '已刮過 / 不可選';
  return t.isActive
    ? `第 ${t.ticketNumber} 格，已選擇`
    : `點選第 ${t.ticketNumber} 格加入本次刮刮`;
};

const emitSelect = (id: string) => emit('select', String(id));
</script>
<style scoped lang="scss">
$wine-base: #5c0505;
$wine-950: #120101;
$wine-900: #1a0202;
$wine-850: #240303;
$wine-800: #2f0404;
$wine-700: #430606;
$wine-600: #5c0505;
$wine-500: #791015;
$wine-400: #982430;
$wine-300: #bc4d5d;

$rose-100: #fff6f7;
$rose-200: #ffe7ea;
$rose-300: #f4c7cf;
$rose-400: #dea1ab;

$text-soft: rgba(255, 235, 238, 0.72);

.scratchGrid {
  position: relative;
  margin-top: 20px;
  padding: 22px;
  border-radius: 24px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 14% 12%,
      rgba(255, 226, 230, 0.07),
      transparent 24%
    ),
    radial-gradient(
      circle at 88% 18%,
      rgba(188, 77, 93, 0.14),
      transparent 22%
    ),
    radial-gradient(circle at 50% 100%, rgba(92, 5, 5, 0.24), transparent 35%),
    linear-gradient(145deg, #430606 0%, #240303 45%, #120101 100%);
  border: 1px solid rgba(255, 231, 235, 0.07);
  box-shadow:
    0 20px 42px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.045),
    inset 0 -20px 36px rgba(0, 0, 0, 0.18);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.035),
      transparent 20%,
      transparent 78%,
      rgba(255, 255, 255, 0.02)
    );
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.025);
    z-index: 0;
  }

  @media (max-width: 640px) {
    padding: 18px 16px;
    border-radius: 20px;
  }
}

.scratchGrid__watermark {
  position: absolute;
  right: -10px;
  bottom: -8px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.08;

  img {
    width: 180px;
    max-width: 42vw;
    display: block;
    filter: grayscale(1) brightness(1.6);
  }

  @media (max-width: 640px) {
    right: -12px;
    bottom: -10px;

    img {
      width: 132px;
    }
  }
}

.scratchGrid__header {
  position: relative;
  z-index: 1;
  margin-bottom: 18px;
}

.scratchGrid__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scratchGrid__brandLogo {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(
      circle at 30% 28%,
      rgba(255, 255, 255, 0.14),
      transparent 36%
    ),
    linear-gradient(145deg, rgba(121, 16, 21, 0.95), rgba(47, 4, 4, 0.96));
  border: 1px solid rgba(255, 236, 239, 0.08);
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    display: block;
    filter: brightness(1.18) contrast(1.02);
  }
}

.scratchGrid__brandText {
  min-width: 0;
}

.scratchGrid__title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: $rose-100;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.32);

  @media (max-width: 640px) {
    font-size: 16px;
  }
}

.scratchGrid__subtitle {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: $text-soft;
}

.scratchGrid__grid {
  position: relative;
  z-index: 1;
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
  isolation: isolate;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  padding: 8px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    filter 0.2s ease,
    opacity 0.2s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 8px 18px rgba(0, 0, 0, 0.28);

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.14),
      rgba(255, 255, 255, 0.02) 30%,
      rgba(255, 255, 255, 0) 58%
    );
    opacity: 0.7;
  }

  &::after {
    content: '';
    position: absolute;
    left: 12%;
    right: 12%;
    bottom: 7%;
    height: 18%;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.22);
    filter: blur(10px);
    opacity: 0.42;
    z-index: 0;
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &.is-active {
    border-color: rgba(255, 236, 240, 0.96);
    box-shadow:
      0 0 0 2px rgba(255, 240, 243, 0.45),
      0 0 0 6px rgba(152, 36, 48, 0.34),
      0 0 28px rgba(92, 5, 5, 0.42),
      0 14px 30px rgba(0, 0, 0, 0.34),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);

    &::before {
      background:
        radial-gradient(
          circle at 50% 8%,
          rgba(255, 228, 232, 0.22),
          transparent 42%
        ),
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.18),
          rgba(255, 255, 255, 0.03) 30%,
          rgba(255, 255, 255, 0) 58%
        );
      opacity: 1;
    }

    .scratchGrid__ticketNo {
      color: #ffffff;
      text-shadow: 0 0 12px rgba(255, 240, 243, 0.45);
    }

    .scratchGrid__hintText {
      color: #fff0f3;
    }

    .scratchGrid__circle {
      transform: scale(1.06);
      box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.88),
        inset 0 -8px 12px rgba(98, 108, 120, 0.22),
        0 8px 18px rgba(0, 0, 0, 0.32),
        0 0 0 4px rgba(255, 255, 255, 0.08);
    }
  }
}

.scratchGrid__cellLogo {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  display: grid;
  place-items: center;

  img {
    width: 68%;
    max-width: 72px;
    object-fit: contain;
    display: block;
    filter: grayscale(1) brightness(1.72) contrast(0.96);
    opacity: 0.1;
    transform: translateY(2px) scale(1.02);
  }
}

.scratchGrid__cell.is-available {
  border-color: rgba(188, 77, 93, 0.28);
  background:
    radial-gradient(
      circle at 24% 18%,
      rgba(255, 232, 236, 0.18),
      transparent 22%
    ),
    radial-gradient(
      circle at 50% 0%,
      rgba(255, 210, 216, 0.08),
      transparent 40%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.02) 24%,
      rgba(0, 0, 0, 0.08) 100%
    ),
    linear-gradient(145deg, #8a1a22 0%, #5c0505 52%, #360404 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 240, 243, 0.14),
    inset 0 -10px 16px rgba(30, 2, 4, 0.28),
    0 10px 20px rgba(0, 0, 0, 0.24);

  &:hover:not(:disabled) {
    border-color: rgba(255, 215, 221, 0.48);
    box-shadow:
      0 14px 26px rgba(0, 0, 0, 0.32),
      0 0 0 1px rgba(255, 220, 226, 0.04),
      inset 0 1px 0 rgba(255, 240, 243, 0.18);
    filter: brightness(1.04);
  }
}

.scratchGrid__cell.is-scratched {
  border-color: rgba(255, 255, 255, 0.045);
  background:
    radial-gradient(
      circle at 50% 14%,
      rgba(255, 255, 255, 0.03),
      transparent 35%
    ),
    linear-gradient(145deg, #170405 0%, #0c0203 52%, #040102 100%);
  box-shadow:
    inset 0 16px 28px rgba(0, 0, 0, 0.48),
    inset 0 -4px 10px rgba(255, 255, 255, 0.015),
    0 6px 14px rgba(0, 0, 0, 0.26);
  opacity: 0.92;

  .scratchGrid__num {
    color: rgba(255, 236, 239, 0.9);
  }

  .scratchGrid__cellLogo img {
    opacity: 0.07;
    filter: grayscale(1) brightness(1.5);
  }
}

.scratchGrid__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #5c0505;
  background: linear-gradient(135deg, #fff5c8 0%, #f7d77b 100%);
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.scratchGrid__ticketNo {
  position: relative;
  z-index: 1;
  font-size: 26px;
  font-weight: 950;
  line-height: 1;
  color: $rose-100;
}

.scratchGrid__circle {
  position: relative;
  z-index: 1;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.95),
    rgba(240, 240, 245, 0.98) 42%,
    #d6d9df 100%
  );
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.88),
    inset 0 -8px 12px rgba(98, 108, 120, 0.18),
    0 8px 18px rgba(0, 0, 0, 0.28);

  @media (max-width: 640px) {
    width: 46px;
    height: 46px;
  }
}

.scratchGrid__circleCore {
  width: 70%;
  height: 70%;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: radial-gradient(
    circle at 30% 30%,
    #ffffff 0%,
    #f4f5f8 55%,
    #dfe3e8 100%
  );
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.95),
    inset 0 -2px 4px rgba(110, 118, 130, 0.16);
}

.scratchGrid__circleLogo {
  width: 62%;
  height: 62%;
  object-fit: contain;
  display: block;
  filter: brightness(0.95) contrast(1.04);
}

.scratchGrid__hintText {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 231, 235, 0.78);
}

.scratchGrid__num {
  position: relative;
  z-index: 1;
  font-size: 26px;
  font-weight: 950;
  line-height: 1;
}

.scratchGrid__scratchedText {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 220, 226, 0.52);
}

@media (max-width: 640px) {
  .scratchGrid__ticketNo,
  .scratchGrid__num {
    font-size: 22px;
  }

  .scratchGrid__badge {
    top: 6px;
    right: 6px;
    padding: 3px 7px;
    font-size: 9px;
  }

  .scratchGrid__hintText,
  .scratchGrid__scratchedText {
    font-size: 10px;
  }
}
</style>
