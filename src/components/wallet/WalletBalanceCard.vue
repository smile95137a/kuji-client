<!-- src/components/wallet/WalletBalanceCard.vue -->
<template>
  <div class="walletBalanceCard">
    <div class="walletBalanceCard__bg"></div>

    <div class="walletBalanceCard__head">
      <div>
        <p class="walletBalanceCard__kicker">MY WALLET</p>
        <h3 class="walletBalanceCard__title">我的錢包</h3>
      </div>

      <span class="walletBalanceCard__icon">
        <font-awesome-icon :icon="['fas', 'wallet']" />
      </span>
    </div>

    <div class="walletBalanceCard__row">
      <div class="walletBalanceCard__item">
        <span
          class="walletBalanceCard__coinIcon walletBalanceCard__coinIcon--gold"
        >
          <font-awesome-icon :icon="['fas', 'coins']" />
        </span>

        <div class="walletBalanceCard__content">
          <p class="walletBalanceCard__label">金幣</p>
          <p class="walletBalanceCard__value">
            {{ formatNum(wallet.goldCoins) }}
          </p>
        </div>
      </div>

      <div class="walletBalanceCard__divider" />

      <div class="walletBalanceCard__item">
        <span
          class="walletBalanceCard__coinIcon walletBalanceCard__coinIcon--bonus"
        >
          <font-awesome-icon :icon="['fas', 'gem']" />
        </span>

        <div class="walletBalanceCard__content">
          <p class="walletBalanceCard__label">紅利</p>
          <p class="walletBalanceCard__value">
            {{ formatNum(wallet.bonusCoins) }}
          </p>
        </div>
      </div>
    </div>

    <p v-if="hint" class="walletBalanceCard__hint">
      <font-awesome-icon :icon="['fas', 'circle-info']" />
      <span>{{ hint }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMemberWalletStore } from '@/stores/memberWallet';

defineProps<{ hint?: string }>();

const memberWallet = useMemberWalletStore();
const wallet = computed(() => memberWallet.wallet);

const formatNum = (n: number | undefined) => (n ?? 0).toLocaleString();
</script>

<style scoped lang="scss">
.walletBalanceCard {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 18px;

  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(255, 255, 255, 0.46),
      transparent 30%
    ),
    linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
  color: #fff;
  box-shadow: 0 18px 36px rgba(91, 37, 21, 0.16);

  --primary: #b43325;
  --brown: #3f2412;
  --line-light: rgba(255, 255, 255, 0.22);

  &__bg {
    position: absolute;
    right: -60px;
    top: -80px;
    width: 190px;
    height: 190px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      right: 42px;
      bottom: -58px;
      width: 130px;
      height: 130px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.09);
    }
  }

  &__head {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__kicker {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    margin: 0 0 8px;

    background: rgba(255, 255, 255, 0.18);
    color: #fff;

    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.3px;
  }

  &__title {
    margin: 0;
    font-size: 21px;
    line-height: 1.25;
    font-weight: 950;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 16px;

    display: grid;
    place-items: center;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid var(--line-light);
    backdrop-filter: blur(12px);

    font-size: 18px;
  }

  &__row {
    position: relative;
    z-index: 1;

    display: grid;
    grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
    align-items: center;
    gap: 12px;

    padding: 14px;
    border-radius: 22px;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid var(--line-light);
    backdrop-filter: blur(12px);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__coinIcon {
    width: 42px;
    height: 42px;
    border-radius: 15px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: rgba(255, 255, 255, 0.2);
    color: #fff6d9;

    font-size: 17px;

    &--bonus {
      color: #ffe4df;
    }
  }

  &__content {
    min-width: 0;
  }

  &__divider {
    width: 1px;
    height: 46px;
    background: rgba(255, 255, 255, 0.24);
  }

  &__label {
    margin: 0 0 4px;
    color: rgba(255, 255, 255, 0.76);
    font-size: 12px;
    font-weight: 900;
  }

  &__value {
    margin: 0;
    color: #fff;
    font-size: 25px;
    line-height: 1.1;
    font-weight: 950;
    word-break: break-all;
  }

  &__hint {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 12px;
    line-height: 1.5;
    font-weight: 800;
    text-align: center;
  }

  @media (max-width: 640px) {
    border-radius: 22px;
    padding: 16px;

    &__head {
      margin-bottom: 14px;
    }

    &__title {
      font-size: 20px;
    }

    &__icon {
      width: 42px;
      height: 42px;
      border-radius: 15px;
    }

    &__row {
      grid-template-columns: 1fr;
      gap: 10px;
      padding: 12px;
    }

    &__divider {
      width: 100%;
      height: 1px;
    }

    &__item {
      width: 100%;
      padding: 2px 0;
    }

    &__coinIcon {
      width: 40px;
      height: 40px;
      border-radius: 14px;
    }

    &__value {
      font-size: 23px;
    }

    &__hint {
      align-items: flex-start;
      font-size: 12px;
    }
  }
}
</style>
