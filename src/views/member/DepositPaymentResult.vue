<template>
  <section class="paymentResult">
    <header class="paymentResult__header">
      <h1 class="paymentResult__title">儲值付款結果</h1>
      <p class="paymentResult__subtitle">確認 GoMyPay 回傳結果與儲值單狀態</p>
    </header>

    <div class="paymentResult__card">
      <div class="paymentResult__status" :class="statusClass">
        {{ statusTitle }}
      </div>
      <p class="paymentResult__message">{{ statusMessage }}</p>

      <div v-if="order" class="paymentResult__grid">
        <div>
          <span class="paymentResult__label">儲值單號</span>
          <strong>{{ order.rechargeOrderId }}</strong>
        </div>
        <div>
          <span class="paymentResult__label">金額</span>
          <strong>NT$ {{ Number(order.priceTwd || 0).toLocaleString() }}</strong>
        </div>
        <div>
          <span class="paymentResult__label">金幣</span>
          <strong>{{ Number(order.goldAmount || 0).toLocaleString() }}</strong>
        </div>
        <div>
          <span class="paymentResult__label">紅利</span>
          <strong>{{ Number(order.bonusAmount || 0).toLocaleString() }}</strong>
        </div>
      </div>

      <div v-if="isBankTransfer && virtualAccount" class="paymentResult__accountBox">
        <div>
          <span class="paymentResult__label">虛擬帳號</span>
          <strong>{{ virtualAccount }}</strong>
        </div>
        <div>
          <span class="paymentResult__label">繳費期限</span>
          <strong>{{ limitDate || '-' }}</strong>
        </div>
      </div>
    </div>

    <div class="paymentResult__actions">
      <button class="paymentResult__btn paymentResult__btn--ghost" @click="goDeposit">返回儲值頁</button>
      <button class="paymentResult__btn" @click="goHistory">查看儲值紀錄</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRechargeOrder, type RechargeOrderRes } from '@/services/rechargeService';
import { useWallet } from '@/composables/useWallet';

const route = useRoute();
const router = useRouter();
const { refresh } = useWallet();

const order = ref<RechargeOrderRes | null>(null);
const gatewayResult = computed(() => String(route.query.result ?? ''));
const sendType = computed(() => String(route.query.Send_Type ?? route.query.send_type ?? ''));
const rechargeOrderId = computed(() => String(route.query.e_orderno ?? route.query.rechargeOrderId ?? ''));
const virtualAccount = computed(() => String(route.query.e_payaccount ?? ''));
const limitDate = computed(() => String(route.query.LimitDate ?? ''));
const isBankTransfer = computed(() => sendType.value === '4');
const isSuccess = computed(() => gatewayResult.value === '1');

const statusTitle = computed(() => {
  if (isBankTransfer.value && isSuccess.value) return '虛擬帳號已建立';
  return isSuccess.value ? '付款成功' : '付款失敗';
});

const statusMessage = computed(() => {
  if (isBankTransfer.value && isSuccess.value) {
    return '請依照以下虛擬帳號資訊完成轉帳，系統入帳後會更新餘額。';
  }
  return isSuccess.value
    ? 'GoMyPay 已回傳成功結果，系統會同步更新你的儲值狀態。'
    : String(route.query.ret_msg ?? '付款未完成，請重新發起儲值。');
});

const statusClass = computed(() => ({
  'is-success': isSuccess.value,
  'is-pending': isBankTransfer.value && isSuccess.value,
  'is-failed': !isSuccess.value,
}));

async function loadOrder() {
  if (!rechargeOrderId.value) return;
  try {
    const res = await getRechargeOrder(rechargeOrderId.value);
    order.value = res.data;
  } catch (e) {
    console.error('load recharge order error', e);
  }
}

function goDeposit() {
  router.push({ name: 'Deposit' });
}

function goHistory() {
  router.push({ name: 'DepositHistory' });
}

onMounted(async () => {
  await loadOrder();
  if (isSuccess.value && !isBankTransfer.value) {
    await refresh();
  }
});
</script>

<style scoped lang="scss">
.paymentResult {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 800;
  }

  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    padding: 20px;
  }

  &__status {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    font-weight: 800;
    margin-bottom: 10px;

    &.is-success,
    &.is-pending {
      background: #ecfdf3;
      color: #166534;
    }

    &.is-failed {
      background: #fef2f2;
      color: #b91c1c;
    }
  }

  &__message {
    margin: 0 0 16px;
    line-height: 1.6;
  }

  &__grid,
  &__accountBox {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__accountBox {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    opacity: 0.7;
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  &__btn {
    flex: 1;
    border: 0;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    font-weight: 700;
    background: #111;
    color: #fff;

    &--ghost {
      background: #fff;
      color: #111;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
