<!-- src/components/ichiban/IchibanScratchPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import {
  faXmark,
  faCoins,
  faTicket,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{
  isOpen: boolean;
  ticketNumbers: number[];
  ticketIds: string[];
  remaining: number;
  pricePerDraw?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'scratch', payload: { ticketIds: string[] }): void;
}>();

const selectedCount = computed(() => props.ticketIds.length);

const selectedNumbersText = computed(() => {
  const nums = props.ticketNumbers;
  if (!nums.length) return '尚未選擇';
  if (nums.length <= 6) return nums.map((n) => `第 ${n} 格`).join('、');
  return (
    nums
      .slice(0, 6)
      .map((n) => `第 ${n} 格`)
      .join('、') + ` …等 ${nums.length} 格`
  );
});

const totalCost = computed(() => {
  if (!props.pricePerDraw) return null;
  return props.pricePerDraw * selectedCount.value;
});

const onScratch = () => {
  if (!props.ticketIds.length) return;
  emit('scratch', { ticketIds: [...props.ticketIds] });
};
</script>

<template>
  <Transition name="panel">
    <div v-if="isOpen" class="scratchConfirmPanel">
      <div class="scratchConfirmPanel__sheet">
        <button class="scratchConfirmPanel__close" @click="emit('close')">
          <font-awesome-icon :icon="faXmark" />
        </button>

        <div class="scratchConfirmPanel__header">
          <div class="scratchConfirmPanel__badge">
            <font-awesome-icon :icon="faCoins" />
          </div>

          <div class="scratchConfirmPanel__titleWrap">
            <div class="scratchConfirmPanel__eyebrow">Scratch Confirmation</div>
            <div class="scratchConfirmPanel__title">用金幣刮刮樂</div>
            <div class="scratchConfirmPanel__subtitle">
              確認後將消耗金幣並執行刮刮動畫
            </div>
          </div>
        </div>

        <div class="scratchConfirmPanel__selected">
          <div class="scratchConfirmPanel__selectedHead">
            <span class="scratchConfirmPanel__selectedIcon">
              <font-awesome-icon :icon="faTicket" />
            </span>
            <span class="scratchConfirmPanel__selectedLabel">已選擇格子</span>
          </div>

          <div class="scratchConfirmPanel__selectedNums">
            {{ selectedNumbersText }}
          </div>
        </div>

        <div class="scratchConfirmPanel__stats">
          <div class="scratchConfirmPanel__stat">
            <span class="scratchConfirmPanel__statLabel">剩餘抽數</span>
            <span class="scratchConfirmPanel__statVal is-remain">
              {{ remaining }}
            </span>
          </div>

          <div class="scratchConfirmPanel__statDiv" />

          <div class="scratchConfirmPanel__stat">
            <span class="scratchConfirmPanel__statLabel">本次刮刮</span>
            <span class="scratchConfirmPanel__statVal is-count">
              {{ selectedCount }} 格
            </span>
          </div>

          <template v-if="totalCost != null">
            <div class="scratchConfirmPanel__statDiv" />

            <div class="scratchConfirmPanel__stat">
              <span class="scratchConfirmPanel__statLabel">消耗金幣</span>
              <span class="scratchConfirmPanel__statVal is-cost">
                {{ totalCost }}
              </span>
            </div>
          </template>
        </div>

        <div class="scratchConfirmPanel__actions">
          <button class="scratchConfirmPanel__cancelBtn" @click="emit('close')">
            取消
          </button>

          <button
            class="scratchConfirmPanel__confirmBtn"
            :disabled="!ticketIds.length"
            @click="onScratch"
          >
            <span class="scratchConfirmPanel__confirmBtnIcon">
              <font-awesome-icon :icon="faTicket" />
            </span>
            <span>金幣刮 {{ selectedCount }} 格</span>
            <span class="scratchConfirmPanel__confirmBtnArrow">
              <font-awesome-icon :icon="faChevronRight" />
            </span>
          </button>
        </div>

        <div class="scratchConfirmPanel__hint">
          可在下方繼續點選格子，加入更多後再確認
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
$wine-base: #5c0505;
$wine-950: #120101;
$wine-900: #1c0202;
$wine-850: #260303;
$wine-800: #320404;
$wine-700: #470505;
$wine-600: #5c0505;
$wine-500: #7a1016;
$wine-400: #9b2430;
$wine-300: #bc4658;

$rose-100: #fff5f5;
$rose-200: #ffe8ea;
$rose-300: #f4c6cc;
$rose-400: #e4a3ad;

$gold-300: #efd6a0;
$gold-400: #d9b56c;

.scratchConfirmPanel {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 300;
  pointer-events: none;
}

.scratchConfirmPanel__sheet {
  position: relative;
  pointer-events: auto;
  padding: 24px 20px 34px;
  border-radius: 28px 28px 0 0;
  border: 1px solid rgba(255, 232, 236, 0.08);
  border-bottom: none;
  background:
    radial-gradient(
      circle at 14% 10%,
      rgba(255, 228, 232, 0.08),
      transparent 24%
    ),
    radial-gradient(
      circle at 86% 12%,
      rgba(188, 70, 88, 0.14),
      transparent 22%
    ),
    radial-gradient(circle at 50% 120%, rgba(92, 5, 5, 0.42), transparent 42%),
    linear-gradient(160deg, #470505 0%, #260303 44%, #120101 100%);
  box-shadow:
    0 -18px 44px rgba(0, 0, 0, 0.56),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -24px 38px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04),
      transparent 18%,
      transparent 80%,
      rgba(255, 255, 255, 0.02)
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 1px 1px 0;
    border-radius: 27px 27px 0 0;
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.025);
  }
}

.scratchConfirmPanel__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 240, 243, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 240, 243, 0.74);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 240, 243, 0.18);
    transform: translateY(-1px);
  }
}

.scratchConfirmPanel__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 40px;
}

.scratchConfirmPanel__badge {
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: $gold-300;
  background:
    radial-gradient(
      circle at 32% 28%,
      rgba(255, 255, 255, 0.16),
      transparent 34%
    ),
    linear-gradient(145deg, #7a1016, #5c0505 58%, #320404 100%);
  border: 1px solid rgba(255, 234, 198, 0.12);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.scratchConfirmPanel__titleWrap {
  min-width: 0;
}

.scratchConfirmPanel__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 223, 229, 0.46);
}

.scratchConfirmPanel__title {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: $rose-100;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.scratchConfirmPanel__subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 232, 236, 0.58);
}

.scratchConfirmPanel__selected {
  position: relative;
  z-index: 1;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 233, 237, 0.07);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.02)
    ),
    linear-gradient(145deg, rgba(92, 5, 5, 0.5), rgba(22, 2, 4, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.18);
}

.scratchConfirmPanel__selectedHead {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.scratchConfirmPanel__selectedIcon {
  color: $rose-300;
  font-size: 13px;
}

.scratchConfirmPanel__selectedLabel {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 224, 230, 0.48);
}

.scratchConfirmPanel__selectedNums {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;
  color: rgba(255, 244, 246, 0.92);
  word-break: break-word;
}

.scratchConfirmPanel__stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 230, 235, 0.06);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    ),
    linear-gradient(145deg, rgba(71, 5, 5, 0.55), rgba(14, 2, 3, 0.96));
}

.scratchConfirmPanel__statDiv {
  width: 1px;
  height: 34px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 221, 226, 0.12),
    rgba(255, 255, 255, 0.02)
  );
}

.scratchConfirmPanel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.scratchConfirmPanel__statLabel {
  font-size: 11px;
  color: rgba(255, 228, 233, 0.48);
  white-space: nowrap;
}

.scratchConfirmPanel__statVal {
  font-size: 23px;
  font-weight: 950;
  letter-spacing: 0.01em;

  &.is-remain {
    color: $rose-200;
  }

  &.is-count {
    color: #ffb7c1;
  }

  &.is-cost {
    color: $gold-400;
  }
}

.scratchConfirmPanel__actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
}

.scratchConfirmPanel__cancelBtn {
  flex: 0 0 88px;
  height: 52px;
  border-radius: 16px;
  border: 1px solid rgba(255, 234, 238, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 240, 243, 0.72);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 234, 238, 0.18);
    transform: translateY(-1px);
  }
}

.scratchConfirmPanel__confirmBtn {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 16px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.02em;
  cursor: pointer;
  color: #fff8f9;
  background:
    radial-gradient(
      circle at 30% 24%,
      rgba(255, 232, 236, 0.16),
      transparent 30%
    ),
    linear-gradient(145deg, #9b2430 0%, #7a1016 48%, #5c0505 100%);
  box-shadow:
    0 10px 24px rgba(92, 5, 5, 0.4),
    inset 0 1px 0 rgba(255, 241, 244, 0.16);
  transition:
    filter 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease;

  &:not(:disabled):hover {
    filter: brightness(1.05);
    box-shadow:
      0 14px 28px rgba(92, 5, 5, 0.48),
      inset 0 1px 0 rgba(255, 241, 244, 0.2);
  }

  &:not(:disabled):active {
    transform: scale(0.985);
  }

  &:disabled {
    opacity: 0.42;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.scratchConfirmPanel__confirmBtnIcon,
.scratchConfirmPanel__confirmBtnArrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 238, 241, 0.88);
}

.scratchConfirmPanel__hint {
  position: relative;
  z-index: 1;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  color: rgba(255, 228, 233, 0.42);
}

.panel-enter-active {
  transition: opacity 0.22s ease;

  .scratchConfirmPanel__sheet {
    transition: transform 0.28s cubic-bezier(0.34, 1.26, 0.64, 1);
  }
}

.panel-leave-active {
  transition: opacity 0.18s ease;

  .scratchConfirmPanel__sheet {
    transition: transform 0.2s ease-in;
  }
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;

  .scratchConfirmPanel__sheet {
    transform: translateY(100%);
  }
}

@media (max-width: 640px) {
  .scratchConfirmPanel__sheet {
    padding: 22px 16px 30px;
    border-radius: 24px 24px 0 0;
  }

  .scratchConfirmPanel__title {
    font-size: 20px;
  }

  .scratchConfirmPanel__subtitle {
    font-size: 12px;
  }

  .scratchConfirmPanel__stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .scratchConfirmPanel__statDiv {
    display: none;
  }

  .scratchConfirmPanel__stat {
    padding: 2px 0;
  }

  .scratchConfirmPanel__actions {
    flex-direction: column;
  }

  .scratchConfirmPanel__cancelBtn,
  .scratchConfirmPanel__confirmBtn {
    width: 100%;
    flex: none;
  }
}
</style>
