<!-- src/components/wallet/WalletBalanceCard.vue -->
<template>
  <div class="walletBalanceCard">
    <div class="walletBalanceCard__row">
      <div class="walletBalanceCard__item">
        <p class="walletBalanceCard__label">金幣</p>
        <p class="walletBalanceCard__value walletBalanceCard__value--gold">
          {{ formatNum(wallet.goldCoins) }}
        </p>
      </div>
      <div class="walletBalanceCard__divider" />
      <div class="walletBalanceCard__item">
        <p class="walletBalanceCard__label">紅利</p>
        <p class="walletBalanceCard__value walletBalanceCard__value--bonus">
          {{ formatNum(wallet.bonusCoins) }}
        </p>
      </div>
    </div>
    <p v-if="hint" class="walletBalanceCard__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMemberWalletStore } from '@/stores/memberWallet';

defineProps<{ hint?: string }>();

const memberWallet = useMemberWalletStore();
const wallet = computed(() => memberWallet.wallet);

const formatNum = (n: number | undefined) =>
  (n ?? 0).toLocaleString();
</script>

<style scoped lang="scss">
.walletBalanceCard {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 16px;
  background: #fff;

  &__row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__item {
    flex: 1;
    text-align: center;
  }

  &__divider {
    width: 1px;
    height: 40px;
    background: rgba(0, 0, 0, 0.1);
  }

  &__label {
    margin: 0 0 4px;
    font-size: 13px;
    opacity: 0.65;
  }

  &__value {
    margin: 0;
    font-size: 22px;
    font-weight: 800;

    &--gold {
      color: #b8860b;
    }

    &--bonus {
      color: #c0392b;
    }
  }

  &__hint {
    margin: 10px 0 0;
    font-size: 12px;
    opacity: 0.6;
    text-align: center;
  }
}
</style>
