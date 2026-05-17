<template>
  <div class="transactionItem">
    <div class="transactionItem__top">
      <span class="transactionItem__badge">{{ item.typeName || item.type }}</span>
      <span class="transactionItem__date">{{ item.createdAtText }}</span>
    </div>

    <div v-if="item.lotteryTitle" class="transactionItem__lottery">
      {{ item.lotteryTitle }}
    </div>

    <div class="transactionItem__body">
      <div class="transactionItem__amounts">
        <p v-if="item.goldAmount > 0" class="transactionItem__amountRow">
          <span class="transactionItem__amountLabel">金幣</span>
          <span
            class="transactionItem__amountVal"
            :class="item.direction === 'INCOME' ? 'transactionItem__amount--income' : 'transactionItem__amount--expense'"
          >
            {{ item.direction === 'INCOME' ? '+' : '-' }}{{ item.goldAmount.toLocaleString() }}
          </span>
        </p>

        <p v-if="item.bonusAmount > 0" class="transactionItem__amountRow">
          <span class="transactionItem__amountLabel">紅利</span>
          <span
            class="transactionItem__amountVal"
            :class="item.direction === 'INCOME' ? 'transactionItem__amount--income' : 'transactionItem__amount--expense'"
          >
            {{ item.direction === 'INCOME' ? '+' : '-' }}{{ item.bonusAmount.toLocaleString() }}
          </span>
        </p>

        <p
          v-if="item.goldAmount === 0 && item.bonusAmount === 0 && item.amount !== 0"
          class="transactionItem__amountRow"
        >
          <span class="transactionItem__amountLabel">金額</span>
          <span
            class="transactionItem__amountVal"
            :class="item.direction === 'INCOME' ? 'transactionItem__amount--income' : 'transactionItem__amount--expense'"
          >
            {{ item.direction === 'INCOME' ? '+' : '-' }}{{ item.amount.toLocaleString() }}
          </span>
        </p>
      </div>

      <div class="transactionItem__details">
        <p v-if="metaText" class="transactionItem__meta">{{ metaText }}</p>
        <p v-if="item.description" class="transactionItem__desc">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WalletTransactionRow } from '@/composables/useTransactionHistory';

const props = defineProps<{ item: WalletTransactionRow }>();

const metaText = computed(() => {
  const parts: string[] = [];
  if (props.item.drawIndex != null) {
    parts.push(`第 ${props.item.drawIndex} 抽`);
  }
  if (props.item.ticketNumber != null) {
    parts.push(`票號 ${props.item.ticketNumber}`);
  }
  if (props.item.refundAmount > 0) {
    parts.push(`退還 ${props.item.refundAmount.toLocaleString()}`);
  }
  return parts.join(' | ');
});
</script>

<style scoped lang="scss">
.transactionItem {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__badge {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
  }

  &__date {
    margin-left: auto;
    font-size: 12px;
    opacity: 0.55;
  }

  &__lottery {
    font-size: 14px;
    font-weight: 700;
    color: #111;
    margin-bottom: 8px;
  }

  &__body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__amounts {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__amountRow {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__amountLabel {
    font-size: 12px;
    color: #888;
    min-width: 28px;
  }

  &__amountVal {
    font-size: 18px;
    font-weight: 800;
  }

  &__amount--income {
    color: #27ae60;
  }

  &__amount--expense {
    color: #c0392b;
  }

  &__details {
    flex: 1;
    text-align: right;
  }

  &__meta {
    margin: 0 0 4px;
    font-size: 12px;
    color: #666;
  }

  &__desc {
    margin: 0;
    font-size: 13px;
    opacity: 0.7;
    line-height: 1.4;
  }
}
</style>