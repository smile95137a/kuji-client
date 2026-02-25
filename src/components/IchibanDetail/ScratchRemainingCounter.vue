<template>
  <section class="scratchRemainingCounter">
    <header class="scratchRemainingCounter__header">
      <h3 class="scratchRemainingCounter__title">剩餘刮刮次數</h3>

      <div class="scratchRemainingCounter__badge" :class="badgeClass">
        {{ badgeText }}
      </div>
    </header>

    <div class="scratchRemainingCounter__main">
      <div class="scratchRemainingCounter__numbers">
        <div class="scratchRemainingCounter__numberItem">
          <div class="scratchRemainingCounter__numberLabel">剩餘</div>
          <div class="scratchRemainingCounter__numberValue is-remaining">
            {{ remainingSafe }}
          </div>
        </div>

        <div class="scratchRemainingCounter__divider" aria-hidden="true" />

        <div class="scratchRemainingCounter__numberItem">
          <div class="scratchRemainingCounter__numberLabel">總數</div>
          <div class="scratchRemainingCounter__numberValue">
            {{ totalSafe }}
          </div>
        </div>

        <div class="scratchRemainingCounter__divider" aria-hidden="true" />

        <div class="scratchRemainingCounter__numberItem">
          <div class="scratchRemainingCounter__numberLabel">已刮</div>
          <div class="scratchRemainingCounter__numberValue is-drawn">
            {{ drawnSafe }}
          </div>
        </div>
      </div>

      <div class="scratchRemainingCounter__progress">
        <div class="scratchRemainingCounter__progressTrack" aria-hidden="true">
          <div
            class="scratchRemainingCounter__progressBar"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>

        <div class="scratchRemainingCounter__progressMeta">
          <span>進度</span>
          <span>{{ progressPercent }}%</span>
        </div>
      </div>

      <div v-if="protectionInfo" class="scratchRemainingCounter__protection">
        <div class="scratchRemainingCounter__protectionTitle">開套者保護期</div>
        <div class="scratchRemainingCounter__protectionText">
          {{ protectionInfo.message }}
        </div>
        <div v-if="countdownText" class="scratchRemainingCounter__countdown">
          ⏱ 保護剩餘：{{ countdownText }}
        </div>
        <div
          v-else-if="protectionInfo.endTime"
          class="scratchRemainingCounter__protectionSub"
        >
          有效期限：{{ protectionInfo.endTime }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

type TicketItem = {
  id: string;
  ticketNumber: number;
  status: 'AVAILABLE' | 'DRAWN' | 'RESERVED' | 'LOCKED' | string;
};

type ProtectionInfo = {
  remainingDraws: number;
  totalDraws: number;
  endTime?: string;
  message: string;
};

const props = defineProps<{
  remainingPrizes: number | null;
  totalPrizes: number | null;
  tickets?: TicketItem[] | null;
  protectionInfo?: ProtectionInfo | null;
  /** ISO 8601 保護期結束時間，用於倒數計時 */
  protectionEndTime?: string | null;
}>();

const emit = defineEmits<{
  /** 倒數歸零（保護期結束），父層應呼叫 reload */
  (e: 'expired'): void;
}>();

/* =========================
   倒數計時
========================= */
const secondsLeft = ref(0);
let _timer: ReturnType<typeof setInterval> | null = null;

const calcSeconds = () => {
  if (!props.protectionEndTime) return 0;
  const end = new Date(props.protectionEndTime).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
};

const stopTimer = () => {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
};

const startTimer = () => {
  stopTimer();
  secondsLeft.value = calcSeconds();
  if (secondsLeft.value <= 0) return;
  _timer = setInterval(() => {
    secondsLeft.value = calcSeconds();
    if (secondsLeft.value <= 0) {
      stopTimer();
      emit('expired');
    }
  }, 1000);
};

onMounted(() => {
  if (props.protectionEndTime) startTimer();
});

onUnmounted(() => stopTimer());

watch(
  () => props.protectionEndTime,
  (val) => {
    if (val) startTimer();
    else stopTimer();
  },
);

const countdownText = computed(() => {
  if (!props.protectionEndTime || secondsLeft.value <= 0) return '';
  const m = Math.floor(secondsLeft.value / 60);
  const s = secondsLeft.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

// 優先以 tickets 陣列本身計算，確保 剩餘 + 已刮 = 總數
const ticketArr = computed(() =>
  Array.isArray(props.tickets) ? props.tickets : [],
);

const totalSafe = computed(() => {
  if (ticketArr.value.length > 0) return ticketArr.value.length;
  const n = Number(props.totalPrizes ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
});

const remainingSafe = computed(() => {
  if (ticketArr.value.length > 0) {
    return ticketArr.value.filter(
      (t) => String(t.status).toUpperCase() === 'AVAILABLE',
    ).length;
  }
  const n = Number(props.remainingPrizes ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
});

const drawnSafe = computed(() => {
  if (totalSafe.value > 0) {
    const d = totalSafe.value - remainingSafe.value;
    return d >= 0 ? d : 0;
  }

  const arr = Array.isArray(props.tickets) ? props.tickets : [];
  if (!arr.length) return 0;

  return arr.filter((t) => String(t.status).toUpperCase() !== 'AVAILABLE')
    .length;
});

const progressPercent = computed(() => {
  if (totalSafe.value <= 0) return 0;
  const p = Math.round((drawnSafe.value / totalSafe.value) * 100);
  return Math.max(0, Math.min(100, p));
});

const badgeText = computed(() => {
  if (totalSafe.value <= 0) return '尚未開始';
  if (remainingSafe.value <= 0) return '已售罄';
  if (progressPercent.value >= 90) return '快沒了';
  return '熱賣中';
});

const badgeClass = computed(() => {
  const t = badgeText.value;
  return {
    'is-soldout': t === '已售罄',
    'is-hot': t === '熱賣中',
    'is-low': t === '快沒了',
    'is-idle': t === '尚未開始',
  };
});

const protectionInfo = computed(() => props.protectionInfo ?? null);
</script>

<style scoped lang="scss">
/* =========================
   Ichiban 深紅黑色系（統一）
========================= */
$primary: #e10600; // 主紅
$accent: #ff3b30; // 互動紅（亮）
$deep: #0b0102; // 深黑紅底
$deep-2: #140304; // 深紅黑
$border: rgba(255, 255, 255, 0.08);
$text-soft: rgba(255, 255, 255, 0.72);

/* =========================
   Card
========================= */
.scratchRemainingCounter {
  border-radius: 18px;
  padding: 16px 16px;

  background:
    radial-gradient(
      900px 260px at 10% 0%,
      rgba(225, 6, 0, 0.18),
      transparent 60%
    ),
    linear-gradient(145deg, $deep-2, $deep);

  border: 1px solid rgba(225, 6, 0, 0.28);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  backdrop-filter: blur(8px);
}

/* =========================
   Header
========================= */
.scratchRemainingCounter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.scratchRemainingCounter__title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(255, 255, 255, 0.95);
}

/* =========================
   Badge
========================= */
.scratchRemainingCounter__badge {
  font-size: 12px;
  font-weight: 900;
  padding: 7px 10px;
  border-radius: 999px;
  line-height: 1;
  user-select: none;

  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.92);

  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  &.is-hot {
    background: rgba(255, 59, 48, 0.16);
    border-color: rgba(255, 59, 48, 0.4);
  }

  &.is-low {
    /* 用暖橘紅而不是黃：仍在紅系裡 */
    background: rgba(255, 107, 61, 0.16);
    border-color: rgba(255, 107, 61, 0.42);
  }

  &.is-soldout {
    background: rgba(225, 6, 0, 0.18);
    border-color: rgba(225, 6, 0, 0.45);
  }

  &.is-idle {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
  }
}

/* =========================
   Numbers row
========================= */
.scratchRemainingCounter__numbers {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 12px;
}

.scratchRemainingCounter__numberItem {
  min-width: 0;
}

.scratchRemainingCounter__numberLabel {
  font-size: 12px;
  color: $text-soft;
  margin-bottom: 6px;
}

.scratchRemainingCounter__numberValue {
  font-size: 22px;
  font-weight: 950;
  letter-spacing: 0.6px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);

  &.is-remaining {
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.55),
      0 0 18px rgba(255, 59, 48, 0.22);
  }

  &.is-drawn {
    opacity: 0.9;
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.55),
      0 0 18px rgba(225, 6, 0, 0.18);
  }
}

.scratchRemainingCounter__divider {
  width: 1px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

/* =========================
   Progress
========================= */
.scratchRemainingCounter__progressTrack {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.35);
}

.scratchRemainingCounter__progressBar {
  height: 100%;
  border-radius: 999px;

  /* 紅系漸層：從深紅到亮朱砂 */
  background: linear-gradient(
    90deg,
    rgba(225, 6, 0, 0.9),
    rgba(255, 59, 48, 0.92)
  );

  width: 0%;
  transition: width 240ms ease;

  box-shadow: 0 6px 18px rgba(255, 59, 48, 0.22);
}

.scratchRemainingCounter__progressMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}

/* =========================
   Protection
========================= */
.scratchRemainingCounter__protection {
  margin-top: 12px;
  padding: 12px 12px;
  border-radius: 14px;

  background:
    radial-gradient(
      600px 200px at 0% 0%,
      rgba(255, 59, 48, 0.16),
      transparent 65%
    ),
    rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 59, 48, 0.22);

  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.scratchRemainingCounter__protectionTitle {
  font-size: 12px;
  font-weight: 950;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.95);
}

.scratchRemainingCounter__protectionText {
  font-size: 13px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.scratchRemainingCounter__protectionSub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.scratchRemainingCounter__countdown {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 900;
  color: rgba(255, 59, 48, 0.92);
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(255, 59, 48, 0.4);
}

/* =========================
   RWD 微調（手機更舒服）
========================= */
@media (max-width: 520px) {
  .scratchRemainingCounter {
    padding: 14px;
  }

  .scratchRemainingCounter__numbers {
    gap: 10px;
  }

  .scratchRemainingCounter__numberValue {
    font-size: 20px;
  }
}
</style>
