<template>
  <section class="paymentResult">
    <header class="paymentResult__header">
      <h1 class="paymentResult__title">訂單運費付款結果</h1>
      <p class="paymentResult__subtitle">確認 GoMyPay 回傳結果與本次付款訂單</p>
    </header>

    <div class="paymentResult__card">
      <div class="paymentResult__status" :class="statusClass">
        {{ statusTitle }}
      </div>
      <p class="paymentResult__message">{{ statusMessage }}</p>

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

      <div v-if="orders.length > 0" class="paymentResult__orderList">
        <div class="paymentResult__summary">
          <span>訂單 {{ orders.length }} 筆</span>
          <strong>總運費 NT$ {{ totalFee.toLocaleString() }}</strong>
        </div>
        <div v-for="order in orders" :key="order.orderId" class="paymentResult__orderItem">
          <div>
            <span class="paymentResult__label">訂單編號</span>
            <strong>{{ order.orderNumber }}</strong>
          </div>
          <div>
            <span class="paymentResult__label">狀態</span>
            <strong>{{ order.paymentStatus }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="paymentResult__actions">
      <button class="paymentResult__btn paymentResult__btn--ghost" @click="goOrderHistory">返回訂單列表</button>
      <button class="paymentResult__btn" :disabled="orders.length === 0" @click="goFirstOrder">查看第一筆訂單</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPaymentGroupOrders, type OrderPaymentInitRes } from '@/services/orderService';

const route = useRoute();
const router = useRouter();
const orders = ref<OrderPaymentInitRes[]>([]);

const merchantOrderNo = computed(() => String(route.query.e_orderno ?? ''));
const gatewayResult = computed(() => String(route.query.result ?? ''));
const sendType = computed(() => String(route.query.Send_Type ?? route.query.send_type ?? ''));
const virtualAccount = computed(() => String(route.query.e_payaccount ?? ''));
const limitDate = computed(() => String(route.query.LimitDate ?? ''));
const isBankTransfer = computed(() => sendType.value === '4');
const isSuccess = computed(() => gatewayResult.value === '1');
const totalFee = computed(() =>
  orders.value.reduce((sum, order) => sum + Number(order.shippingFee || 0), 0),
);

const statusTitle = computed(() => {
  if (isBankTransfer.value && isSuccess.value) return '虛擬帳號已建立';
  return isSuccess.value ? '付款成功' : '付款失敗';
});

const statusMessage = computed(() => {
  if (isBankTransfer.value && isSuccess.value) {
    return '請使用以下虛擬帳號完成轉帳；系統收到入帳通知後，相關訂單會一起轉成已付款。';
  }
  return isSuccess.value
    ? 'GoMyPay 已回傳成功結果，系統會同步更新本次付款群組的訂單狀態。'
    : String(route.query.ret_msg ?? '付款未完成，請回訂單頁重新付款。');
});

const statusClass = computed(() => ({
  'is-success': isSuccess.value,
  'is-pending': isBankTransfer.value && isSuccess.value,
  'is-failed': !isSuccess.value,
}));

async function loadOrders() {
  if (!merchantOrderNo.value) return;
  try {
    const res = await getPaymentGroupOrders(merchantOrderNo.value);
    orders.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('load payment group orders error', e);
  }
}

function goOrderHistory() {
  router.push({ name: 'OrderHistory' });
}

function goFirstOrder() {
  const firstOrder = orders.value[0];
  if (!firstOrder) return;
  router.push({ name: 'OrderDetail', params: { orderId: firstOrder.orderId } });
}

onMounted(loadOrders);
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

  &__accountBox,
  &__orderList {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__summary,
  &__orderItem,
  &__accountBox {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__orderItem + &__orderItem {
    margin-top: 12px;
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

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--ghost {
      background: #fff;
      color: #111;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
