<template>
  <div class="ichibanDetail__meta">
    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">店家</span>
      <span class="ichibanDetail__metaVal">{{ storeName }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">主題</span>
      <span class="ichibanDetail__metaVal">{{ theme }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">玩法</span>
      <span class="ichibanDetail__metaVal">{{ playModeTextSafe }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">期間</span>
      <span class="ichibanDetail__metaVal">{{ periodTextSafe }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">狀態</span>
      <span class="ichibanDetail__metaVal">{{ statusText }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">{{ prizeLabel }}</span>
      <span class="ichibanDetail__metaVal">
        剩餘
        <NumberFormatter :number="remainingPrizes" locale="zh-TW" />
        /
        <NumberFormatter :number="totalPrizes" locale="zh-TW" />
      </span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">支付</span>
      <span class="ichibanDetail__metaVal">{{ paymentTypeText }}</span>
    </div>

    <div v-if="freeDrawThresholdText" class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">免費抽門檻</span>
      <span class="ichibanDetail__metaVal">{{ freeDrawThresholdText }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">特典</span>
      <span class="ichibanDetail__metaVal">{{
        bonusEnabled ? '有' : '無'
      }}</span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">標籤</span>
      <span class="ichibanDetail__metaVal">
        <template v-if="tagsSafe.length">
          <span v-for="t in tagsSafe" :key="t" class="ichibanDetail__tag">
            {{ t }}
          </span>
        </template>
        <template v-else>-</template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import NumberFormatter from '@/components/common/NumberFormatter.vue';

const props = defineProps<{
  detail?: any | null;
  playModeText?: string | null;
  periodText?: string | null;
  tags?: string[] | null;
}>();

const storeName = computed(() => props.detail?.storeName || '-');
const theme = computed(() => props.detail?.theme || '-');

const playModeTextSafe = computed(() => props.playModeText || '-');
const periodTextSafe = computed(() => props.periodText || '-');

const statusText = computed(
  () => props.detail?.statusName || props.detail?.status || '-',
);

const isScratchMode = computed(
  () => String(props.detail?.playMode ?? '').toUpperCase() === 'SCRATCH_MODE',
);

const remainingPrizes = computed(() => {
  if (isScratchMode.value) {
    return Number(props.detail?.remainingDraws ?? props.detail?.remainingPrizes ?? 0) || 0;
  }
  return Number(props.detail?.remainingPrizes ?? 0) || 0;
});

const totalPrizes = computed(() => {
  if (isScratchMode.value) {
    return Number(props.detail?.maxDraws ?? props.detail?.totalPrizes ?? 0) || 0;
  }
  return Number(props.detail?.totalPrizes ?? 0) || 0;
});

const prizeLabel = computed(() => (isScratchMode.value ? '抽數' : '獎品'));

const paymentTypeText = computed(() => {
  const raw = String(props.detail?.paymentType ?? '').toUpperCase();
  if (raw === 'BONUS') return '紅利';
  if (raw === 'GOLD') return '金幣';
  return '-';
});

const freeDrawThresholdText = computed(() => {
  const n = Number(props.detail?.freeDrawThreshold ?? NaN);
  if (!Number.isFinite(n) || n < 1) return '';
  return `累計 ${n} 抽可觸發`;
});

const bonusEnabled = computed(() => !!props.detail?.bonusEnabled);

const tagsSafe = computed(() =>
  (Array.isArray(props.tags) ? props.tags : []).filter(Boolean),
);
</script>
