<template>
  <section class="paymentResult">
    <div class="paymentResult__hero">
      <p class="paymentResult__badge">PAYMENT RESULT</p>
      <h1>訂單運費付款結果</h1>
      <p>這裡會顯示賞品盒出貨運費的付款狀態與銀行轉帳資訊。</p>
    </div>

    <div class="paymentResult__card" :class="statusClass">
      <font-awesome-icon :icon="['fas', isSuccess ? (isBankTransfer ? 'building-columns' : 'circle-check') : 'circle-xmark']" />
      <div>
        <span>付款狀態</span>
        <h2>{{ statusTitle }}</h2>
        <p>{{ statusMessage }}</p>
      </div>
    </div>

    <div v-if="isBankTransfer && virtualAccount" class="paymentResult__panel">
      <div class="paymentResult__panelHead">
        <span>BANK TRANSFER</span>
        <h2>轉帳資訊</h2>
      </div>

      <div class="paymentResult__grid">
        <div class="paymentResult__item paymentResult__item--wide paymentResult__item--account">
          <span>虛擬帳號</span>
          <strong>{{ virtualAccount }}</strong>
        </div>
        <div class="paymentResult__item">
          <span>繳費期限</span>
          <strong>{{ limitDate || '-' }}</strong>
        </div>
        <div v-if="payInfo" class="paymentResult__item">
          <span>繳費資訊</span>
          <strong>{{ payInfo }}</strong>
        </div>
      </div>
    </div>

    <div v-if="orders.length > 0" class="paymentResult__panel">
      <div class="paymentResult__panelHead paymentResult__panelHead--row">
        <div>
          <span>ORDER GROUP</span>
          <h2>付款訂單</h2>
        </div>
        <p>共 {{ orders.length }} 筆</p>
      </div>

      <div class="paymentResult__summary">
        <div class="paymentResult__item">
          <span>訂單筆數</span>
          <strong>{{ orders.length }} 筆</strong>
        </div>
        <div class="paymentResult__item">
          <span>總運費</span>
          <strong>NT$ {{ totalFee.toLocaleString() }}</strong>
        </div>
      </div>

      <div class="paymentResult__orders">
        <article v-for="order in orders" :key="order.orderId" class="paymentResult__order">
          <div>
            <span>訂單編號</span>
            <strong>{{ order.orderNumber || '-' }}</strong>
          </div>
          <div>
            <span>狀態</span>
            <strong :class="orderStatusClass(order.paymentStatus)">{{ order.paymentStatus || '-' }}</strong>
          </div>
          <div>
            <span>運費</span>
            <strong>NT$ {{ Number(order.shippingFee || 0).toLocaleString() }}</strong>
          </div>
          <button type="button" @click="goOrderDetail(order.orderId)">查看訂單</button>
        </article>
      </div>
    </div>

    <div v-else class="paymentResult__panel paymentResult__empty">
      <font-awesome-icon :icon="['fas', 'receipt']" />
      <p>尚未取得訂單資料</p>
      <span>請稍後從訂單紀錄重新查看付款狀態。</span>
    </div>

    <div class="paymentResult__actions">
      <button type="button" class="paymentResult__button paymentResult__button--ghost" @click="goOrderHistory">
        返回訂單紀錄
      </button>
      <button type="button" class="paymentResult__button" :disabled="orders.length === 0" @click="goFirstOrder">
        查看第一筆訂單
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getPaymentGroupOrders,
  syncShippingPaymentResult,
  type OrderPaymentInitRes,
} from '@/services/orderService';

const route = useRoute();
const router = useRouter();

const orders = ref<OrderPaymentInitRes[]>([]);

const merchantOrderNo = computed(() =>
  String(route.query.e_orderno ?? route.query.merchantOrderNo ?? ''),
);
const queryResult = computed(() => String(route.query.result ?? ''));
const querySendType = computed(() =>
  String(route.query.Send_Type ?? route.query.send_type ?? ''),
);

const firstOrder = computed(() => orders.value[0] ?? null);
const gatewayResult = computed(() => firstOrder.value?.gatewayResult || queryResult.value);
const retMsg = computed(() => firstOrder.value?.retMsg || String(route.query.ret_msg ?? ''));
const virtualAccount = computed(() => firstOrder.value?.virtualAccount || String(route.query.e_payaccount ?? ''));
const limitDate = computed(() => firstOrder.value?.limitDate || String(route.query.LimitDate ?? ''));
const payInfo = computed(() => firstOrder.value?.payInfo || '');

const isBankTransfer = computed(() =>
  firstOrder.value?.paymentMethod === 'BANK_TRANSFER' ||
  querySendType.value === '4' ||
  Boolean(virtualAccount.value),
);
const isSuccess = computed(() =>
  gatewayResult.value === '1' ||
  ['PAID', 'SUCCESS', 'COMPLETED'].includes(firstOrder.value?.paymentStatus || '') ||
  (isBankTransfer.value && Boolean(virtualAccount.value)),
);

const totalFee = computed(() =>
  orders.value.reduce((sum, order) => sum + Number(order.shippingFee || 0), 0),
);

const statusTitle = computed(() => {
  if (isBankTransfer.value && isSuccess.value) return '虛擬帳號已建立';
  return isSuccess.value ? '付款成功' : '付款失敗';
});

const statusMessage = computed(() => {
  if (isBankTransfer.value && isSuccess.value) {
    return '請在期限內完成轉帳，系統收到 GoMyPay 通知後會自動更新出貨付款狀態。';
  }
  return isSuccess.value
    ? '付款已完成，我們會繼續處理賞品出貨流程。'
    : retMsg.value || '付款未完成，請重新發起付款或聯繫客服。';
});

const statusClass = computed(() => ({
  'is-success': isSuccess.value && !isBankTransfer.value,
  'is-pending': isBankTransfer.value && isSuccess.value,
  'is-failed': !isSuccess.value,
}));

const orderStatusClass = (status: string) => {
  const s = String(status || '');
  return {
    'is-paid': ['PAID', 'COMPLETED', 'SUCCESS'].includes(s),
    'is-pending': ['PENDING', 'PAYMENT_PENDING'].includes(s),
    'is-failed': ['FAILED', 'PAYMENT_FAILED'].includes(s),
    'is-canceled': ['CANCELED', 'CANCELLED'].includes(s),
  };
};

async function loadOrders() {
  if (!merchantOrderNo.value) return;
  try {
    const res = await getPaymentGroupOrders(merchantOrderNo.value);
    orders.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('load payment group orders error', e);
  }
}

function queryParamsAsStrings(): Record<string, string> {
  const params: Record<string, string> = {};
  Object.entries(route.query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params[key] = String(value[0] ?? '');
      return;
    }
    params[key] = String(value ?? '');
  });
  return params;
}

async function syncPaymentReturnIfNeeded() {
  if (!merchantOrderNo.value || !queryResult.value) return;

  // 銀行轉帳的取號成功不是實際付款完成，不能用前台 return 直接改成已付款。
  if (querySendType.value === '4' || virtualAccount.value) return;

  try {
    await syncShippingPaymentResult(queryParamsAsStrings());
  } catch (e) {
    console.error('sync payment return error', e);
  }
}

function goOrderHistory() {
  router.push({ name: 'OrderHistory' });
}

function goOrderDetail(orderId: string) {
  if (!orderId) return;
  router.push({ name: 'OrderDetail', params: { orderId } });
}

function goFirstOrder() {
  if (!firstOrder.value) return;
  goOrderDetail(firstOrder.value.orderId);
}

onMounted(async () => {
  await syncPaymentReturnIfNeeded();
  await loadOrders();
});
</script>

<style scoped lang="scss">
.paymentResult {
  min-height: 100%;
  padding: clamp(20px, 4vw, 48px);
  color: #251815;
  background:
    radial-gradient(circle at 85% 12%, rgba(255, 142, 48, 0.2), transparent 30%),
    linear-gradient(135deg, #fff8ef 0%, #fffdf8 46%, #f2e9de 100%);
}

.paymentResult__hero,
.paymentResult__panel,
.paymentResult__card {
  max-width: 1120px;
  margin: 0 auto 22px;
  border: 1px solid rgba(84, 53, 36, 0.12);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 22px 50px rgba(64, 34, 21, 0.08);
}

.paymentResult__hero {
  padding: clamp(28px, 5vw, 56px);
}

.paymentResult__hero h1 {
  margin: 8px 0;
  font-size: clamp(30px, 5vw, 56px);
}

.paymentResult__badge,
.paymentResult__panelHead span {
  color: #b83225;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.paymentResult__card {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 24px;
}

.paymentResult__card svg {
  width: 40px;
  height: 40px;
}

.paymentResult__card.is-success svg {
  color: #12805c;
}

.paymentResult__card.is-pending svg {
  color: #b7791f;
}

.paymentResult__card.is-failed svg {
  color: #c22f22;
}

.paymentResult__panel {
  padding: 26px;
}

.paymentResult__panelHead--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.paymentResult__panelHead h2 {
  margin: 6px 0 18px;
}

.paymentResult__grid,
.paymentResult__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.paymentResult__item,
.paymentResult__order {
  padding: 18px;
  border-radius: 18px;
  background: #fffaf4;
  border: 1px solid rgba(84, 53, 36, 0.12);
}

.paymentResult__item span,
.paymentResult__order span {
  display: block;
  margin-bottom: 8px;
  color: #806f66;
}

.paymentResult__item strong,
.paymentResult__order strong {
  word-break: break-all;
}

.paymentResult__item--wide {
  grid-column: 1 / -1;
}

.paymentResult__item--account strong {
  font-size: clamp(24px, 5vw, 44px);
  letter-spacing: 0.06em;
}

.paymentResult__orders {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.paymentResult__order {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr auto;
  align-items: center;
  gap: 14px;
}

.paymentResult__order button,
.paymentResult__button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  background: #b83225;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.paymentResult__empty {
  text-align: center;
}

.paymentResult__actions {
  max-width: 1120px;
  margin: 28px auto 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.paymentResult__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paymentResult__button--ghost {
  background: #fff;
  color: #251815;
  border: 1px solid rgba(84, 53, 36, 0.18);
}

@media (max-width: 760px) {
  .paymentResult__grid,
  .paymentResult__summary,
  .paymentResult__order {
    grid-template-columns: 1fr;
  }

  .paymentResult__actions {
    flex-direction: column;
  }
}
</style>
