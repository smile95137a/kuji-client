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
      <span class="ichibanDetail__metaKey">獎品</span>
      <span class="ichibanDetail__metaVal">
        剩餘
        <NumberFormatter :number="remainingPrizes" locale="zh-TW" />
        /
        <NumberFormatter :number="totalPrizes" locale="zh-TW" />
      </span>
    </div>

    <div class="ichibanDetail__metaRow">
      <span class="ichibanDetail__metaKey">多抽</span>
      <span class="ichibanDetail__metaVal">
        <template v-if="!allowMultiDraw">不支援</template>
        <template v-else-if="multiDrawOptions.length">
          支援：{{ multiDrawOptions.join('、') }} 連
        </template>
        <template v-else>支援（方案準備中）</template>
      </span>
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

const remainingPrizes = computed(
  () => Number(props.detail?.remainingPrizes ?? 0) || 0,
);
const totalPrizes = computed(() => Number(props.detail?.totalPrizes ?? 0) || 0);

const allowMultiDraw = computed(() => !!props.detail?.allowMultiDraw);
const multiDrawOptions = computed<number[]>(() => {
  const arr = props.detail?.multiDrawOptions;
  return Array.isArray(arr)
    ? arr.filter((n: any) => Number.isFinite(Number(n))).map(Number)
    : [];
});

const bonusEnabled = computed(() => !!props.detail?.bonusEnabled);

const tagsSafe = computed(() =>
  (Array.isArray(props.tags) ? props.tags : []).filter(Boolean),
);
</script>
