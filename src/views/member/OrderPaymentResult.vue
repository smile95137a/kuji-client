<template>
  <section class="paymentResult">
    <div class="paymentResult__hero">
      <div class="paymentResult__heroBg"></div>

      <div class="paymentResult__heroTop">
        <div>
          <p class="paymentResult__badge">PAYMENT RESULT</p>
          <h1 class="paymentResult__title">訂單運費付款結果</h1>
          <p class="paymentResult__subtitle">
            確認 GoMyPay 回傳結果與本次付款訂單。
          </p>
        </div>

        <div class="paymentResult__heroStatus" :class="statusClass">
          <font-awesome-icon
            :icon="[
              'fas',
              isSuccess
                ? isBankTransfer
                  ? 'building-columns'
                  : 'circle-check'
                : 'circle-xmark',
            ]"
          />
        </div>
      </div>
    </div>

    <div class="paymentResult__section">
      <div class="paymentResult__statusCard" :class="statusClass">
        <span class="paymentResult__statusIcon">
          <font-awesome-icon
            :icon="[
              'fas',
              isSuccess
                ? isBankTransfer
                  ? 'building-columns'
                  : 'circle-check'
                : 'circle-xmark',
            ]"
          />
        </span>

        <div>
          <p class="paymentResult__statusLabel">付款狀態</p>
          <h2 class="paymentResult__statusTitle">
            {{ statusTitle }}
          </h2>
          <p class="paymentResult__message">
            {{ statusMessage }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="isBankTransfer && virtualAccount" class="paymentResult__section">
      <div class="paymentResult__sectionHead">
        <div>
          <p class="paymentResult__sectionKicker">BANK TRANSFER</p>
          <h2 class="paymentResult__sectionTitle">轉帳資訊</h2>
        </div>
      </div>

      <div class="paymentResult__accountBox">
        <div
          class="paymentResult__accountCard paymentResult__accountCard--main"
        >
          <p class="paymentResult__infoLabel">虛擬帳號</p>
          <p class="paymentResult__accountValue paymentResult__mono">
            {{ virtualAccount }}
          </p>
        </div>

        <div class="paymentResult__accountCard">
          <p class="paymentResult__infoLabel">繳費期限</p>
          <p class="paymentResult__infoValue">
            {{ limitDate || '-' }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="orders.length > 0" class="paymentResult__section">
      <div class="paymentResult__sectionHead">
        <div>
          <p class="paymentResult__sectionKicker">ORDER GROUP</p>
          <h2 class="paymentResult__sectionTitle">付款訂單</h2>
        </div>

        <p class="paymentResult__count">
          共 <b>{{ orders.length }}</b> 筆
        </p>
      </div>

      <div class="paymentResult__summaryBox">
        <div class="paymentResult__summaryCard">
          <p class="paymentResult__infoLabel">訂單筆數</p>
          <p class="paymentResult__infoValue">{{ orders.length }} 筆</p>
        </div>

        <div
          class="paymentResult__summaryCard paymentResult__summaryCard--total"
        >
          <p class="paymentResult__infoLabel">總運費</p>
          <p class="paymentResult__infoValue">
            NT$ {{ totalFee.toLocaleString() }}
          </p>
        </div>
      </div>

      <div class="paymentResult__tableWrap">
        <table class="paymentResult__table">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>付款狀態</th>
              <th>運費</th>
              <th class="paymentResult__thAction">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in orders" :key="order.orderId">
              <td>
                <span class="paymentResult__mono">
                  {{ order.orderNumber || '-' }}
                </span>
              </td>

              <td>
                <span
                  class="paymentResult__statusBadge"
                  :class="orderStatusClass(order.paymentStatus)"
                >
                  {{ order.paymentStatus || '-' }}
                </span>
              </td>

              <td class="paymentResult__amount">
                NT$ {{ Number(order.shippingFee || 0).toLocaleString() }}
              </td>

              <td class="paymentResult__tdAction">
                <button
                  class="paymentResult__miniBtn"
                  type="button"
                  @click="goOrderDetail(order.orderId)"
                >
                  查看
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="paymentResult__cards">
        <article
          v-for="order in orders"
          :key="order.orderId"
          class="paymentResult__item"
        >
          <div class="paymentResult__itemTop">
            <span
              class="paymentResult__statusBadge"
              :class="orderStatusClass(order.paymentStatus)"
            >
              {{ order.paymentStatus || '-' }}
            </span>

            <span class="paymentResult__amount">
              NT$ {{ Number(order.shippingFee || 0).toLocaleString() }}
            </span>
          </div>

          <div class="paymentResult__orderBox">
            <span>訂單編號</span>
            <strong class="paymentResult__mono">
              {{ order.orderNumber || '-' }}
            </strong>
          </div>

          <button
            class="paymentResult__mobileDetailBtn"
            type="button"
            @click="goOrderDetail(order.orderId)"
          >
            查看訂單
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </article>
      </div>
    </div>

    <div v-else class="paymentResult__section">
      <div class="paymentResult__emptyCard">
        <font-awesome-icon :icon="['fas', 'receipt']" />
        <p>尚未取得訂單資料</p>
        <span>可以返回訂單列表確認付款狀態。</span>
      </div>
    </div>

    <div class="paymentResult__actions">
      <button
        class="paymentResult__actionBtn paymentResult__actionBtn--ghost"
        type="button"
        @click="goOrderHistory"
      >
        返回訂單列表
      </button>

      <button
        class="paymentResult__actionBtn"
        type="button"
        :disabled="orders.length === 0"
        @click="goFirstOrder"
      >
        <font-awesome-icon :icon="['fas', 'receipt']" />
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
  type OrderPaymentInitRes,
} from '@/services/orderService';

const route = useRoute();
const router = useRouter();

const orders = ref<OrderPaymentInitRes[]>([]);

const merchantOrderNo = computed(() => String(route.query.e_orderno ?? ''));
const gatewayResult = computed(() => String(route.query.result ?? ''));
const sendType = computed(() =>
  String(route.query.Send_Type ?? route.query.send_type ?? ''),
);
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

function goOrderHistory() {
  router.push({ name: 'OrderHistory' });
}

function goOrderDetail(orderId: string) {
  if (!orderId) return;

  router.push({ name: 'OrderDetail', params: { orderId } });
}

function goFirstOrder() {
  const firstOrder = orders.value[0];

  if (!firstOrder) return;

  goOrderDetail(firstOrder.orderId);
}

onMounted(loadOrders);
</script>

<style scoped lang="scss">
.paymentResult {
  min-height: 100%;
  color: #201713;

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
    margin-bottom: 18px;

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

  &__heroStatus {
    width: 54px;
    height: 54px;
    border-radius: 18px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(12px);

    color: #fff;
    font-size: 22px;

    &.is-success {
      color: #dcfce7;
    }

    &.is-pending {
      color: #fff6d9;
    }

    &.is-failed {
      color: #ffe4df;
    }
  }

  &__section {
    border-radius: 24px;
    padding: 18px;
    margin-top: 16px;

    background: var(--card);
    border: 1px solid var(--line);
    box-shadow: 0 12px 28px rgba(53, 31, 18, 0.055);
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

  &__count {
    margin: 0;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 900;

    b {
      color: var(--primary);
      font-size: 18px;
    }
  }

  &__statusCard {
    padding: 18px;
    border-radius: 22px;

    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 14px;
    align-items: flex-start;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);

    &.is-success {
      border-color: rgba(46, 125, 50, 0.16);
      background: linear-gradient(180deg, rgba(46, 125, 50, 0.08), #ffffff);
    }

    &.is-pending {
      border-color: rgba(245, 158, 11, 0.2);
      background: linear-gradient(180deg, rgba(245, 158, 11, 0.1), #ffffff);
    }

    &.is-failed {
      border-color: rgba(180, 35, 24, 0.16);
      background: linear-gradient(180deg, rgba(180, 35, 24, 0.08), #ffffff);
    }
  }

  &__statusIcon {
    width: 54px;
    height: 54px;
    border-radius: 18px;

    display: grid;
    place-items: center;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 22px;

    .is-success & {
      color: #2e7d32;
    }

    .is-pending & {
      color: #a16207;
    }

    .is-failed & {
      color: #b42318;
    }
  }

  &__statusLabel,
  &__infoLabel {
    margin: 0 0 6px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__statusTitle {
    margin: 0;
    color: var(--text);
    font-size: 24px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__message {
    margin: 8px 0 0;
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.7;
    font-weight: 800;
  }

  &__accountBox,
  &__summaryBox {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__accountCard,
  &__summaryCard {
    min-height: 82px;
    padding: 14px;
    border-radius: 18px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__accountCard--main {
    grid-column: span 2;
  }

  &__summaryCard--total {
    background: var(--primary);
    border-color: var(--primary);

    .paymentResult__infoLabel {
      color: rgba(255, 255, 255, 0.78);
    }

    .paymentResult__infoValue {
      color: #fff;
      font-size: 18px;
    }
  }

  &__infoValue,
  &__accountValue {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 950;
    word-break: break-word;
  }

  &__accountValue {
    color: var(--primary);
    font-size: 24px;
    letter-spacing: 1px;
  }

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
  }

  &__tableWrap {
    overflow-x: auto;
    margin-top: 14px;
  }

  &__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 10px;
    font-size: 14px;

    th {
      padding: 0 12px 4px;
      color: var(--text-soft);
      font-size: 12px;
      font-weight: 900;
      text-align: left;
      white-space: nowrap;
    }

    td {
      padding: 14px 12px;
      background: var(--cream);
      border-top: 1px solid rgba(180, 51, 37, 0.08);
      border-bottom: 1px solid rgba(180, 51, 37, 0.08);
      color: var(--text);
      font-weight: 800;
      white-space: nowrap;
      vertical-align: middle;

      &:first-child {
        border-left: 1px solid rgba(180, 51, 37, 0.08);
        border-radius: 18px 0 0 18px;
      }

      &:last-child {
        border-right: 1px solid rgba(180, 51, 37, 0.08);
        border-radius: 0 18px 18px 0;
      }
    }
  }

  &__thAction,
  &__tdAction {
    text-align: right;
  }

  &__amount {
    color: var(--primary) !important;
    font-weight: 950 !important;
  }

  &__statusBadge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;

    background: rgba(32, 23, 19, 0.06);
    color: rgba(32, 23, 19, 0.72);
    border: 1px solid rgba(32, 23, 19, 0.08);

    font-size: 12px;
    font-weight: 950;

    &.is-paid {
      background: rgba(46, 125, 50, 0.1);
      color: #2e7d32;
      border-color: rgba(46, 125, 50, 0.16);
    }

    &.is-pending {
      background: rgba(245, 158, 11, 0.12);
      color: #a16207;
      border-color: rgba(245, 158, 11, 0.2);
    }

    &.is-failed,
    &.is-canceled {
      background: rgba(180, 35, 24, 0.1);
      color: #b42318;
      border-color: rgba(180, 35, 24, 0.16);
    }
  }

  &__miniBtn {
    min-height: 34px;
    padding: 0 13px;
    border-radius: 999px;
    border: 1px solid rgba(180, 51, 37, 0.14);
    cursor: pointer;

    background: #fff;
    color: var(--primary);

    font-size: 13px;
    font-weight: 900;

    &:hover {
      background: var(--primary);
      color: #fff;
    }
  }

  &__cards {
    display: none;
    gap: 12px;
    margin-top: 14px;
  }

  &__item {
    padding: 14px;
    border-radius: 20px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);
  }

  &__itemTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__orderBox {
    padding: 12px;
    border-radius: 16px;
    margin-bottom: 12px;

    background: #fff;
    border: 1px solid var(--line);

    span {
      display: block;
      margin-bottom: 5px;
      color: var(--text-soft);
      font-size: 12px;
      font-weight: 900;
    }

    strong {
      display: block;
      color: var(--text);
      font-weight: 950;
      word-break: break-word;
    }
  }

  &__mobileDetailBtn {
    width: 100%;
    min-height: 46px;
    border-radius: 999px;
    border: 1px solid var(--primary);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    background: var(--primary);
    color: #fff;

    font-size: 14px;
    font-weight: 950;
  }

  &__emptyCard {
    min-height: 150px;
    padding: 22px;
    border-radius: 20px;

    display: grid;
    place-items: center;
    text-align: center;

    background: var(--cream);
    border: 1px dashed rgba(180, 51, 37, 0.22);
    color: var(--text-soft);

    svg {
      color: var(--primary);
      font-size: 28px;
      margin-bottom: 8px;
    }

    p {
      margin: 0;
      color: var(--text);
      font-size: 16px;
      font-weight: 950;
    }

    span {
      display: block;
      margin-top: 4px;
      font-size: 13px;
      font-weight: 700;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }

  &__actionBtn {
    min-height: 46px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid var(--primary);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    background: var(--primary);
    color: #fff;

    font-size: 14px;
    font-weight: 900;

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

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover:not(:disabled) {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
    }
  }

  @media (max-width: 720px) {
    &__tableWrap {
      display: none;
    }

    &__cards {
      display: grid;
    }
  }

  @media (max-width: 640px) {
    padding-bottom: 20px;

    &__hero {
      border-radius: 0 0 28px 28px;
      margin: -16px -16px 18px;
      padding: 22px 16px 18px;
    }

    &__title {
      font-size: 25px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__heroStatus {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      font-size: 18px;
    }

    &__section {
      border-radius: 22px;
      padding: 15px;
      margin-top: 14px;
    }

    &__sectionHead {
      align-items: flex-start;
      flex-direction: column;
    }

    &__sectionTitle {
      font-size: 18px;
    }

    &__count {
      display: none;
    }

    &__statusCard {
      grid-template-columns: 46px minmax(0, 1fr);
      gap: 12px;
      padding: 14px;
      border-radius: 20px;
    }

    &__statusIcon {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      font-size: 18px;
    }

    &__statusTitle {
      font-size: 21px;
    }

    &__message {
      font-size: 13px;
    }

    &__accountBox,
    &__summaryBox {
      grid-template-columns: 1fr;
    }

    &__accountCard--main {
      grid-column: auto;
    }

    &__accountCard,
    &__summaryCard {
      min-height: 76px;
      padding: 13px;
      border-radius: 18px;
    }

    &__accountValue {
      font-size: 20px;
    }

    &__itemTop {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    &__actions {
      flex-direction: column-reverse;
    }

    &__actionBtn {
      width: 100%;
      min-height: 48px;
    }
  }
}
</style>
