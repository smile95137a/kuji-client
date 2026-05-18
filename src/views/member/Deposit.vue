<!-- src/views/member/Deposit.vue -->
<template>
  <section class="deposit">
    <!-- Hero：主要一個就好 -->
    <div class="deposit__hero">
      <div class="deposit__heroBg"></div>

      <div class="deposit__heroTop">
        <div>
          <p class="deposit__badge">RECHARGE</p>
          <h1 class="deposit__title">儲值</h1>
          <p class="deposit__subtitle">
            選擇儲值方案並完成付款，金幣會更新至你的錢包。
          </p>
        </div>

        <div class="deposit__heroIcon">
          <font-awesome-icon :icon="['fas', 'coins']" />
        </div>
      </div>
    </div>

    <!-- 錢包餘額：改成一般白色卡片，不再做第二個 Hero -->
    <div class="deposit__section deposit__section--wallet">
      <div class="deposit__sectionHead">
        <div>
          <p class="deposit__sectionKicker">MY WALLET</p>
          <h2 class="deposit__sectionTitle">我的錢包</h2>
        </div>

        <p class="deposit__walletHint">
          <font-awesome-icon :icon="['fas', 'circle-info']" />
          儲值完成後會立即更新
        </p>
      </div>

      <div class="deposit__walletGrid">
        <div class="deposit__walletItem">
          <span class="deposit__walletIcon">
            <font-awesome-icon :icon="['fas', 'coins']" />
          </span>

          <div>
            <p class="deposit__walletLabel">金幣</p>
            <p class="deposit__walletValue">
              {{ formatNum(wallet.goldCoins) }}
            </p>
          </div>
        </div>

        <div class="deposit__walletItem">
          <span class="deposit__walletIcon deposit__walletIcon--bonus">
            <font-awesome-icon :icon="['fas', 'gem']" />
          </span>

          <div>
            <p class="deposit__walletLabel">紅利</p>
            <p class="deposit__walletValue">
              {{ formatNum(wallet.bonusCoins) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 儲值方案 -->
    <div class="deposit__section">
      <div class="deposit__sectionHead">
        <div>
          <p class="deposit__sectionKicker">RECHARGE PLAN</p>
          <h2 class="deposit__sectionTitle">選擇儲值方案</h2>
        </div>
      </div>

      <div v-if="isLoading" class="deposit__emptyState">
        <span class="deposit__emptyIcon">
          <font-awesome-icon :icon="['fas', 'spinner']" spin />
        </span>
        <p>載入方案中…</p>
      </div>

      <div v-else-if="plans.length === 0" class="deposit__emptyState">
        <span class="deposit__emptyIcon">
          <font-awesome-icon :icon="['fas', 'box-open']" />
        </span>
        <p>目前沒有可用方案</p>
      </div>

      <div v-else class="deposit__planGrid">
        <button
          v-for="plan in plans"
          :key="plan.id"
          type="button"
          class="deposit__planCard"
          :class="{
            'deposit__planCard--active': selectedPlanId === plan.id,
            'deposit__planCard--hot': plan.isHot,
          }"
          @click="onSelectPlan(plan)"
        >
          <span v-if="plan.isHot" class="deposit__hotBadge">
            <font-awesome-icon :icon="['fas', 'fire']" />
            熱門
          </span>

          <span v-if="selectedPlanId === plan.id" class="deposit__planCheck">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>

          <div class="deposit__planTop">
            <div>
              <p class="deposit__planName">{{ plan.name }}</p>
              <p class="deposit__planPrice">
                NT$ {{ plan.price.toLocaleString() }}
              </p>
            </div>

            <span class="deposit__planIcon">
              <font-awesome-icon :icon="['fas', 'coins']" />
            </span>
          </div>

          <div class="deposit__planInfo">
            <p class="deposit__planRow">
              <span>獲得金幣</span>
              <strong>{{ plan.goldCoins.toLocaleString() }}</strong>
            </p>

            <p v-if="plan.bonusCoins > 0" class="deposit__planRow">
              <span>贈送紅利</span>
              <strong class="deposit__planBonus">
                {{ plan.bonusCoins.toLocaleString() }}
              </strong>
            </p>
          </div>

          <p v-if="plan.description" class="deposit__planDesc">
            {{ plan.description }}
          </p>
        </button>
      </div>

      <p v-if="planError" class="deposit__error">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        <span>{{ planError }}</span>
      </p>
    </div>

    <!-- 付款方式 -->
    <div class="deposit__section">
      <div class="deposit__sectionHead">
        <div>
          <p class="deposit__sectionKicker">PAYMENT METHOD</p>
          <h2 class="deposit__sectionTitle">選擇付款方式</h2>
        </div>
      </div>

      <div class="deposit__paymentGrid">
        <label
          class="deposit__paymentCard"
          :class="{
            'deposit__paymentCard--active':
              selectedPaymentMethod === 'CREDIT_CARD',
          }"
        >
          <input
            v-model="selectedPaymentMethod"
            type="radio"
            value="CREDIT_CARD"
          />

          <span class="deposit__paymentIcon">
            <font-awesome-icon :icon="['fas', 'credit-card']" />
          </span>

          <span class="deposit__paymentText">
            <strong>信用卡</strong>
            <small>立即付款，完成後回到儲值結果頁</small>
          </span>

          <span class="deposit__paymentCheck">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>
        </label>

        <label
          class="deposit__paymentCard"
          :class="{
            'deposit__paymentCard--active':
              selectedPaymentMethod === 'BANK_TRANSFER',
          }"
        >
          <input
            v-model="selectedPaymentMethod"
            type="radio"
            value="BANK_TRANSFER"
          />

          <span class="deposit__paymentIcon">
            <font-awesome-icon :icon="['fas', 'building-columns']" />
          </span>

          <span class="deposit__paymentText">
            <strong>銀行轉帳</strong>
            <small>取得虛擬帳號後再轉帳，系統入帳後更新餘額</small>
          </span>

          <span class="deposit__paymentCheck">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>
        </label>
      </div>
    </div>

    <!-- Sticky 確認列 -->
    <div class="deposit__checkoutBar">
      <div class="deposit__checkoutInfo">
        <p class="deposit__checkoutLabel">目前選擇</p>

        <p class="deposit__checkoutValue">
          <template v-if="selectedPlan">
            {{ selectedPlan.name }}・NT$
            {{ selectedPlan.price.toLocaleString() }}
          </template>
          <template v-else>尚未選擇方案</template>
        </p>
      </div>

      <button
        class="deposit__submit"
        type="button"
        :disabled="!selectedPlanId || isSubmitting"
        @click="openConfirm"
      >
        <span v-if="isSubmitting" class="deposit__spinner"></span>

        <template v-else>
          <font-awesome-icon :icon="['fas', 'bolt']" />
          確認儲值
        </template>
      </button>
    </div>

    <p class="deposit__tip">點擊「確認儲值」代表你同意付款條款與相關規範</p>

    <!-- 確認 Dialog -->
    <Teleport to="body">
      <div
        v-if="confirmOpen"
        class="deposit__dialogOverlay"
        @click.self="confirmOpen = false"
      >
        <div class="deposit__dialog">
          <div class="deposit__dialogHeader">
            <div>
              <p class="deposit__sectionKicker">CONFIRM RECHARGE</p>
              <h3 class="deposit__dialogTitle">確認儲值</h3>
            </div>

            <button
              class="deposit__dialogClose"
              type="button"
              :disabled="isSubmitting"
              @click="confirmOpen = false"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
          </div>

          <div class="deposit__dialogBody">
            <div class="deposit__notice">
              <font-awesome-icon :icon="['fas', 'circle-info']" />
              <span>送出後將跳轉至 GoMyPay 測試環境完成付款</span>
            </div>

            <div v-if="selectedPlan" class="deposit__summaryCard">
              <div class="deposit__summaryTop">
                <span class="deposit__summaryIcon">
                  <font-awesome-icon :icon="['fas', 'coins']" />
                </span>

                <div>
                  <p class="deposit__summaryName">
                    {{ selectedPlan.name }}
                  </p>
                  <p class="deposit__summaryPrice">
                    NT$ {{ selectedPlan.price.toLocaleString() }}
                  </p>
                </div>
              </div>

              <div class="deposit__summaryList">
                <p class="deposit__summaryRow">
                  <span>獲得金幣</span>
                  <strong>{{ selectedPlan.goldCoins.toLocaleString() }}</strong>
                </p>

                <p
                  v-if="selectedPlan.bonusCoins > 0"
                  class="deposit__summaryRow"
                >
                  <span>贈送紅利</span>
                  <strong class="deposit__summaryBonus">
                    {{ selectedPlan.bonusCoins.toLocaleString() }}
                  </strong>
                </p>

                <p class="deposit__summaryRow">
                  <span>付款方式</span>
                  <strong>{{ paymentMethodLabel }}</strong>
                </p>
              </div>
            </div>
          </div>

          <div class="deposit__dialogFooter">
            <button
              class="deposit__dialogBtn deposit__dialogBtn--ghost"
              type="button"
              :disabled="isSubmitting"
              @click="confirmOpen = false"
            >
              取消
            </button>

            <button
              class="deposit__dialogBtn"
              type="button"
              :disabled="isSubmitting"
              @click="onConfirm"
            >
              <span v-if="isSubmitting" class="deposit__spinner"></span>
              <template v-else>確認儲值</template>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useRechargePlans } from '@/composables/useRechargePlans';
import { useWallet } from '@/composables/useWallet';
import { submitGatewayForm } from '@/utils/payment/submitGatewayForm';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { useOverlayStore } from '@/stores/overlay';
import { useMemberWalletStore } from '@/stores/memberWallet';

import type { PaymentMethodCode } from '@/services/rechargeService';
import type { RechargePlan } from '@/composables/useRechargePlans';

const overlay = useOverlayStore();
const { refresh } = useWallet();

const memberWallet = useMemberWalletStore();
const wallet = computed(() => memberWallet.wallet);

const {
  plans,
  isLoading,
  isSubmitting,
  error,
  gatewayPayload,
  fetchPlans,
  createRecharge,
} = useRechargePlans();

const selectedPlanId = ref('');
const selectedPaymentMethod = ref<PaymentMethodCode>('CREDIT_CARD');
const confirmOpen = ref(false);
const planError = ref('');

const selectedPlan = computed<RechargePlan | null>(
  () => plans.value.find((p) => p.id === selectedPlanId.value) ?? null,
);

const paymentMethodLabel = computed(() =>
  selectedPaymentMethod.value === 'BANK_TRANSFER'
    ? '銀行轉帳（虛擬帳號）'
    : '信用卡',
);

const formatNum = (n: number | undefined) => (n ?? 0).toLocaleString();

function onSelectPlan(plan: RechargePlan) {
  selectedPlanId.value = plan.id;
  planError.value = '';
}

function openConfirm() {
  if (!selectedPlanId.value) {
    planError.value = '請先選擇一個儲值方案';
    return;
  }

  confirmOpen.value = true;
}

async function onConfirm() {
  confirmOpen.value = false;

  const result = await createRecharge(
    selectedPlanId.value,
    selectedPaymentMethod.value,
  );

  if (result.success) {
    if (gatewayPayload.value && submitGatewayForm(gatewayPayload.value)) {
      return;
    }

    overlay.open();

    await ichibanInfoDialog({
      title: '建立付款失敗',
      content: '未取得付款連結，請稍後再試。',
    });

    overlay.close();

    return;
  }

  overlay.open();

  await ichibanInfoDialog({
    title: '儲值失敗',
    content:
      error.value || result.message || '儲值未完成，請稍後再試或更換方案。',
  });

  overlay.close();
}

onMounted(async () => {
  await Promise.all([refresh(), fetchPlans()]);
});
</script>

<style scoped lang="scss">
.deposit {
  min-height: 100%;
  color: #201713;

  display: flex;
  flex-direction: column;
  gap: 16px;

  --primary: #b43325;
  --primary-dark: #8f261b;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --brown: #3f2412;
  --cream: #fff8ef;
  --cream-deep: #f5eadc;
  --card: #ffffff;
  --line: rgba(63, 36, 18, 0.1);
  --text: #201713;
  --text-soft: rgba(32, 23, 19, 0.58);

  &__hero {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    padding: 22px;
    margin-bottom: 2px;

    background:
      radial-gradient(
        circle at 12% 0%,
        rgba(255, 255, 255, 0.5),
        transparent 28%
      ),
      linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
    color: #fff;
    box-shadow: 0 18px 36px rgba(91, 37, 21, 0.16);
  }

  &__heroBg {
    position: absolute;
    right: -70px;
    top: -90px;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.13);
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      right: 50px;
      bottom: -70px;
      width: 150px;
      height: 150px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__heroTop {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
  }

  &__badge,
  &__sectionKicker {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    margin: 0 0 8px;

    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.3px;
  }

  &__badge {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  &__sectionKicker {
    background: var(--primary-soft);
    color: var(--primary);
  }

  &__title {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
    font-weight: 950;
    letter-spacing: 0.5px;
  }

  &__subtitle {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 14px;
    line-height: 1.6;
  }

  &__heroIcon {
    width: 54px;
    height: 54px;
    border-radius: 18px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(12px);

    color: #fff6d9;
    font-size: 22px;
  }

  &__section {
    border-radius: 24px;
    padding: 18px;

    background: var(--card);
    border: 1px solid var(--line);
    box-shadow: 0 12px 28px rgba(53, 31, 18, 0.055);

    &--wallet {
      padding-bottom: 16px;
    }
  }

  &__sectionHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__sectionTitle {
    margin: 0;
    color: var(--text);
    font-size: 19px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__walletHint {
    margin: 0;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;

    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  &__walletGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__walletItem {
    min-height: 82px;
    padding: 14px;
    border-radius: 18px;

    display: flex;
    align-items: center;
    gap: 12px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__walletIcon {
    width: 46px;
    height: 46px;
    border-radius: 16px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: var(--primary-soft);
    color: var(--primary);

    font-size: 18px;

    &--bonus {
      background: rgba(245, 158, 11, 0.12);
      color: #b76b04;
    }
  }

  &__walletLabel {
    margin: 0 0 5px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__walletValue {
    margin: 0;
    color: var(--text);
    font-size: 24px;
    line-height: 1.1;
    font-weight: 950;
    word-break: break-word;
  }

  &__emptyState {
    min-height: 140px;
    padding: 22px;
    border-radius: 20px;

    display: grid;
    place-items: center;
    text-align: center;

    background: var(--cream);
    border: 1px dashed rgba(180, 51, 37, 0.22);
    color: var(--text-soft);

    p {
      margin: 8px 0 0;
      color: var(--text);
      font-size: 14px;
      font-weight: 900;
    }
  }

  &__emptyIcon {
    width: 44px;
    height: 44px;
    border-radius: 16px;

    display: grid;
    place-items: center;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 18px;
  }

  &__planGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  &__planCard {
    position: relative;
    min-height: 176px;
    padding: 16px;
    border-radius: 22px;
    cursor: pointer;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    gap: 12px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    color: var(--text);
    text-align: left;
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);

    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(180, 51, 37, 0.22);
      box-shadow: 0 14px 26px rgba(67, 30, 14, 0.08);
    }

    &--active {
      border-color: rgba(180, 51, 37, 0.55);
      box-shadow:
        0 0 0 4px rgba(180, 51, 37, 0.1),
        0 16px 30px rgba(67, 30, 14, 0.1);
      transform: translateY(-2px);
    }

    &--hot {
      border-color: rgba(245, 158, 11, 0.32);
    }
  }

  &__hotBadge {
    position: absolute;
    top: 0;
    right: 16px;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 0 0 12px 12px;

    display: inline-flex;
    align-items: center;
    gap: 5px;

    background: linear-gradient(135deg, #f59e0b 0%, #d66b42 100%);
    color: #fff;

    font-size: 12px;
    font-weight: 950;
    box-shadow: 0 8px 14px rgba(245, 158, 11, 0.18);
  }

  &__planCheck {
    position: absolute;
    right: 12px;
    bottom: 12px;

    width: 28px;
    height: 28px;
    border-radius: 999px;

    display: grid;
    place-items: center;

    background: var(--primary);
    color: #fff;

    font-size: 12px;
    box-shadow: 0 8px 16px rgba(180, 51, 37, 0.22);
  }

  &__planTop {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  &__planName {
    margin: 0;
    color: var(--text);
    font-size: 16px;
    line-height: 1.35;
    font-weight: 950;
  }

  &__planPrice {
    margin: 7px 0 0;
    color: var(--primary);
    font-size: 22px;
    line-height: 1.1;
    font-weight: 950;
  }

  &__planIcon {
    width: 42px;
    height: 42px;
    border-radius: 15px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 17px;
  }

  &__planInfo {
    display: grid;
    gap: 7px;
    padding: 12px;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);
  }

  &__planRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    margin: 0;

    span {
      color: var(--text-soft);
      font-size: 12px;
      font-weight: 900;
    }

    strong {
      color: var(--brown);
      font-size: 14px;
      font-weight: 950;
    }
  }

  &__planBonus {
    color: var(--primary) !important;
  }

  &__planDesc {
    margin: 0;
    color: var(--text-soft);
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 7px;

    margin: 12px 0 0;
    padding: 11px 12px;
    border-radius: 16px;

    background: rgba(180, 35, 24, 0.08);
    color: #b42318;
    border: 1px solid rgba(180, 35, 24, 0.12);

    font-size: 13px;
    font-weight: 900;
  }

  &__paymentGrid {
    display: grid;
    gap: 12px;
  }

  &__paymentCard {
    position: relative;
    min-height: 82px;
    padding: 14px;
    border-radius: 20px;
    cursor: pointer;

    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) 28px;
    align-items: center;
    gap: 12px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    color: var(--text);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);

    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-2px);
      border-color: rgba(180, 51, 37, 0.22);
      box-shadow: 0 14px 26px rgba(67, 30, 14, 0.08);
    }

    &--active {
      border-color: rgba(180, 51, 37, 0.55);
      box-shadow:
        0 0 0 4px rgba(180, 51, 37, 0.1),
        0 16px 30px rgba(67, 30, 14, 0.1);

      .deposit__paymentIcon {
        background: var(--primary);
        color: #fff;
      }

      .deposit__paymentCheck {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  &__paymentIcon {
    width: 46px;
    height: 46px;
    border-radius: 17px;

    display: grid;
    place-items: center;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 18px;

    transition:
      background 0.16s ease,
      color 0.16s ease;
  }

  &__paymentText {
    min-width: 0;

    strong {
      display: block;
      color: var(--text);
      font-size: 15px;
      line-height: 1.35;
      font-weight: 950;
    }

    small {
      display: block;
      margin-top: 4px;
      color: var(--text-soft);
      font-size: 12px;
      line-height: 1.45;
      font-weight: 700;
    }
  }

  &__paymentCheck {
    width: 28px;
    height: 28px;
    border-radius: 999px;

    display: grid;
    place-items: center;

    background: var(--primary);
    color: #fff;

    font-size: 12px;
    opacity: 0;
    transform: scale(0.82);
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }

  &__checkoutBar {
    position: sticky;
    bottom: 12px;
    z-index: 5;

    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;

    padding: 14px;
    border-radius: 24px;

    background: rgba(255, 255, 255, 0.92);
    border: 1px solid var(--line);
    box-shadow: 0 18px 36px rgba(53, 31, 18, 0.12);
    backdrop-filter: blur(14px);
  }

  &__checkoutInfo {
    min-width: 0;
  }

  &__checkoutLabel {
    margin: 0 0 4px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__checkoutValue {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 950;
    word-break: break-word;
  }

  &__submit,
  &__dialogBtn {
    border-radius: 999px;
    border: 1px solid var(--primary);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    background: var(--primary);
    color: #fff;

    font-weight: 950;

    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      opacity 0.16s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__submit {
    min-height: 48px;
    min-width: 150px;
    padding: 0 20px;
    font-size: 15px;
  }

  &__spinner {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.42);
    border-top-color: #fff;
    animation: depositSpin 0.7s linear infinite;
  }

  &__tip {
    margin: -4px 0 0;
    color: var(--text-soft);
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
    text-align: center;
  }

  &__dialogOverlay {
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;

    background: rgba(32, 23, 19, 0.48);
    backdrop-filter: blur(8px);
  }

  &__dialog {
    width: min(430px, 100%);
    overflow: hidden;
    border-radius: 26px;

    background: #fff;
    border: 1px solid rgba(255, 255, 255, 0.36);
    box-shadow: 0 24px 60px rgba(32, 23, 19, 0.22);
  }

  &__dialogHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;

    padding: 18px;
    border-bottom: 1px solid var(--line);
  }

  &__dialogTitle {
    margin: 0;
    color: var(--text);
    font-size: 20px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__dialogClose {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    border: 1px solid var(--line);
    cursor: pointer;

    display: grid;
    place-items: center;

    background: var(--cream);
    color: var(--text-soft);

    &:hover {
      color: var(--primary);
      border-color: rgba(180, 51, 37, 0.22);
      background: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__dialogBody {
    padding: 18px;
    display: grid;
    gap: 12px;
  }

  &__notice {
    display: flex;
    align-items: flex-start;
    gap: 9px;

    padding: 12px;
    border-radius: 16px;

    background: rgba(245, 158, 11, 0.1);
    color: #8a5a05;
    border: 1px solid rgba(245, 158, 11, 0.18);

    font-size: 13px;
    line-height: 1.5;
    font-weight: 800;
  }

  &__summaryCard {
    padding: 14px;
    border-radius: 20px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__summaryTop {
    display: flex;
    align-items: center;
    gap: 12px;

    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--line);
  }

  &__summaryIcon {
    width: 46px;
    height: 46px;
    border-radius: 17px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: var(--primary);
    color: #fff;

    font-size: 18px;
    box-shadow: 0 10px 18px rgba(180, 51, 37, 0.18);
  }

  &__summaryName {
    margin: 0;
    color: var(--text);
    font-size: 15px;
    line-height: 1.35;
    font-weight: 950;
  }

  &__summaryPrice {
    margin: 4px 0 0;
    color: var(--primary);
    font-size: 20px;
    line-height: 1.1;
    font-weight: 950;
  }

  &__summaryList {
    display: grid;
    gap: 9px;
  }

  &__summaryRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0;

    span {
      color: var(--text-soft);
      font-size: 13px;
      font-weight: 900;
    }

    strong {
      color: var(--text);
      font-size: 14px;
      font-weight: 950;
      text-align: right;
    }
  }

  &__summaryBonus {
    color: var(--primary) !important;
  }

  &__dialogFooter {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    padding: 14px 18px 18px;
    border-top: 1px solid var(--line);
  }

  &__dialogBtn {
    min-height: 46px;
    padding: 0 16px;
    font-size: 14px;

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover:not(:disabled) {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
    }
  }

  @media (max-width: 900px) {
    &__planGrid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    gap: 14px;
    padding-bottom: 20px;

    &__hero {
      border-radius: 0 0 28px 28px;
      margin: -16px -16px 2px;
      padding: 22px 16px 18px;
    }

    &__title {
      font-size: 25px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__heroIcon {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      font-size: 19px;
    }

    &__section {
      border-radius: 22px;
      padding: 15px;
    }

    &__sectionHead {
      align-items: flex-start;
      flex-direction: column;
    }

    &__sectionTitle {
      font-size: 18px;
    }

    &__walletHint {
      font-size: 12px;
    }

    &__walletGrid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    &__walletItem {
      min-height: 76px;
      padding: 13px;
      border-radius: 18px;
    }

    &__walletIcon {
      width: 42px;
      height: 42px;
      border-radius: 15px;
    }

    &__walletValue {
      font-size: 22px;
    }

    &__planGrid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    &__planCard {
      min-height: unset;
      padding: 15px;
      border-radius: 20px;
    }

    &__planPrice {
      font-size: 21px;
    }

    &__paymentCard {
      min-height: 82px;
      padding: 13px;
      border-radius: 19px;
      grid-template-columns: 46px minmax(0, 1fr) 26px;
      gap: 10px;
    }

    &__checkoutBar {
      grid-template-columns: 1fr;
      bottom: 10px;
      padding: 13px;
      border-radius: 22px;
    }

    &__submit {
      width: 100%;
      min-height: 50px;
    }

    &__tip {
      padding: 0 8px;
    }

    &__dialogOverlay {
      align-items: flex-end;
      padding: 12px;
    }

    &__dialog {
      border-radius: 26px 26px 22px 22px;
    }

    &__dialogHeader,
    &__dialogBody {
      padding: 16px;
    }

    &__dialogFooter {
      grid-template-columns: 1fr;
      padding: 14px 16px 16px;
    }

    &__dialogBtn {
      min-height: 48px;

      &--ghost {
        order: 2;
      }
    }
  }
}

@keyframes depositSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
