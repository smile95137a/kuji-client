<!-- src/components/ichiban/IchibanScratchPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  ticketNumbers: number[];   // 顯示用格號陣列
  ticketIds: string[];       // 送後端用 UUID 陣列
  remaining: number;         // 剩餘可刮格數
  pricePerDraw?: number;     // 每格金幣（選填）
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
    nums.slice(0, 6).map((n) => `第 ${n} 格`).join('、') +
    ` …等 ${nums.length} 格`
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
    <div class="scratchConfirmPanel" v-if="isOpen">
      <div class="scratchConfirmPanel__sheet">
        <button class="scratchConfirmPanel__close" @click="emit('close')">✕</button>

        <!-- 標題區 -->
        <div class="scratchConfirmPanel__header">
          <div class="scratchConfirmPanel__coin-icon">🪙</div>
          <div class="scratchConfirmPanel__title">用金幣刮刮樂</div>
          <div class="scratchConfirmPanel__subtitle">
            確認後將消耗金幣並執行刮刮動畫
          </div>
        </div>

        <!-- 選中格子資訊 -->
        <div class="scratchConfirmPanel__selected">
          <div class="scratchConfirmPanel__selectedLabel">已選擇格子</div>
          <div class="scratchConfirmPanel__selectedNums">
            {{ selectedNumbersText }}
          </div>
        </div>

        <!-- 統計列 -->
        <div class="scratchConfirmPanel__stats">
          <div class="scratchConfirmPanel__stat">
            <span class="scratchConfirmPanel__statLabel">剩餘抽數</span>
            <span class="scratchConfirmPanel__statVal is-remain">{{ remaining }}</span>
          </div>
          <div class="scratchConfirmPanel__statDiv" />
          <div class="scratchConfirmPanel__stat">
            <span class="scratchConfirmPanel__statLabel">本次刮刮</span>
            <span class="scratchConfirmPanel__statVal is-count">{{ selectedCount }} 格</span>
          </div>
          <template v-if="totalCost != null">
            <div class="scratchConfirmPanel__statDiv" />
            <div class="scratchConfirmPanel__stat">
              <span class="scratchConfirmPanel__statLabel">消耗金幣</span>
              <span class="scratchConfirmPanel__statVal is-cost">{{ totalCost }}</span>
            </div>
          </template>
        </div>

        <!-- 操作按鈕 -->
        <div class="scratchConfirmPanel__actions">
          <button
            class="scratchConfirmPanel__cancelBtn"
            @click="emit('close')"
          >
            取消
          </button>
          <button
            class="scratchConfirmPanel__goldBtn"
            :disabled="!ticketIds.length"
            @click="onScratch"
          >
            🪙 金幣刮 {{ selectedCount }} 格！
          </button>
        </div>

        <!-- 提示文字 -->
        <div class="scratchConfirmPanel__hint">
          💡 可在下方繼續點選格子，加入更多後再確認
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
/* ---------- 遮罩容器 ---------- */
.scratchConfirmPanel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 300;
}

/* ---------- 底部面板 ---------- */
.scratchConfirmPanel__sheet {
  position: relative;
  background: linear-gradient(170deg, #1a0706 0%, #0c0303 100%);
  border: 1px solid rgba(225, 6, 0, 0.28);
  border-bottom: none;
  border-radius: 24px 24px 0 0;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.6);
}

/* ---------- 關閉按鈕 ---------- */
.scratchConfirmPanel__close {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

/* ---------- 標題 ---------- */
.scratchConfirmPanel__header {
  text-align: center;
  padding-bottom: 4px;
}

.scratchConfirmPanel__coin-icon {
  font-size: 36px;
  margin-bottom: 8px;
  line-height: 1;
}

.scratchConfirmPanel__title {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.5px;
}

.scratchConfirmPanel__subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

/* ---------- 選中格子 ---------- */
.scratchConfirmPanel__selected {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
}

.scratchConfirmPanel__selectedLabel {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}

.scratchConfirmPanel__selectedNums {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  word-break: break-word;
}

/* ---------- 統計列 ---------- */
.scratchConfirmPanel__stats {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 16px;
}

.scratchConfirmPanel__statDiv {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.scratchConfirmPanel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.scratchConfirmPanel__statLabel {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.scratchConfirmPanel__statVal {
  font-size: 22px;
  font-weight: 950;
  color: #fff;

  &.is-remain {
    color: rgba(255, 180, 60, 0.95);
  }

  &.is-count {
    color: rgba(255, 80, 60, 0.95);
  }

  &.is-cost {
    color: rgba(255, 215, 0, 0.95);
  }
}

/* ---------- 操作按鈕 ---------- */
.scratchConfirmPanel__actions {
  display: flex;
  gap: 12px;
}

.scratchConfirmPanel__cancelBtn {
  flex: 0 0 80px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.65);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.scratchConfirmPanel__goldBtn {
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #f5c518 0%, #e6a800 60%, #d49000 100%);
  color: #4a2c00;
  box-shadow:
    0 4px 20px rgba(245, 197, 24, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: filter 0.15s, transform 0.1s;

  &:not(:disabled):hover {
    filter: brightness(1.08);
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

/* ---------- 下方提示 ---------- */
.scratchConfirmPanel__hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  line-height: 1.5;
}

/* ---------- 進場動畫 ---------- */
.panel-enter-active {
  transition: opacity 0.22s ease;

  .scratchConfirmPanel__sheet {
    transition: transform 0.25s cubic-bezier(0.34, 1.26, 0.64, 1);
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
</style>

