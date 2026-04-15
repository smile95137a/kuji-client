<!-- src/components/wallet/TransactionItem.vue -->
<template>
  <div class="transactionItem">
    <div class="transactionItem__top">
      <span class="transactionItem__badge">{{ item.typeName || item.type }}</span>
      <span class="transactionItem__coinType">{{ coinTypeLabel }}</span>
      <span class="transactionItem__date">{{ item.createdAtText }}</span>
    </div>

    <div class="transactionItem__body">
      <p
        class="transactionItem__amount"
        :class="{
          'transactionItem__amount--income': item.isIncome,
          'transactionItem__amount--expense': !item.isIncome,
        }"
      >
        {{ item.isIncome ? '+' : '' }}{{ item.amount.toLocaleString() }}
      </p>

      <div class="transactionItem__details">
        <p v-if="item.description" class="transactionItem__desc">
          {{ item.description }}
        </p>
        <p class="transactionItem__balance">
          餘額：{{ item.balanceAfter.toLocaleString() }}
        </p>
        <p v-if="item.referenceId" class="transactionItem__ref">
          參考 ID：{{ item.referenceId }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WalletTransactionRow } from '@/composables/useTransactionHistory';

const props = defineProps<{ item: WalletTransactionRow }>();

const coinTypeLabel = computed(() =>
  props.item.coinType === 'GOLD' ? '金幣' : '紅利',
);
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
    margin-bottom: 8px;
  }

  &__badge {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
  }

  &__coinType {
    font-size: 12px;
    opacity: 0.6;
  }

  &__date {
    margin-left: auto;
    font-size: 12px;
    opacity: 0.55;
  }

  &__body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__amount {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    flex-shrink: 0;

    &--income {
      color: #27ae60;
    }

    &--expense {
      color: #c0392b;
    }
  }

  &__details {
    flex: 1;
    text-align: right;
  }

  &__desc {
    margin: 0 0 4px;
    font-size: 13px;
    opacity: 0.75;
    line-height: 1.4;
  }

  &__balance {
    margin: 0;
    font-size: 12px;
    opacity: 0.55;
  }

  &__ref {
    margin: 4px 0 0;
    font-size: 11px;
    opacity: 0.45;
    font-family: monospace;
  }
}
</style>
