<template>
  <section class="orderDetail">
    <div class="orderDetail__hero">
      <div class="orderDetail__heroBg"></div>

      <div class="orderDetail__heroTop">
        <div>
          <p class="orderDetail__badge">ORDER DETAIL</p>
          <h1 class="orderDetail__title">訂單明細</h1>
          <p class="orderDetail__subtitle">
            查看訂單內容、付款金額與出貨資訊。
          </p>
        </div>

        <button class="orderDetail__backBtn" type="button" @click="goBack">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
          <span>返回</span>
        </button>
      </div>
    </div>

    <div class="orderDetail__section">
      <div class="orderDetail__sectionHead">
        <div>
          <p class="orderDetail__sectionKicker">ORDER SUMMARY</p>
          <h2 class="orderDetail__sectionTitle">訂單概覽</h2>
        </div>

        <span
          class="orderDetail__statusBadge"
          :class="badgeClass(order?.shippingStatus)"
        >
          {{ order?.shippingStatusName || order?.shippingStatus || '-' }}
        </span>
      </div>

      <div class="orderDetail__summaryGrid">
        <div class="orderDetail__infoCard orderDetail__infoCard--wide">
          <p class="orderDetail__infoLabel">訂單號</p>
          <p class="orderDetail__infoValue orderDetail__mono">
            {{ order?.orderNo || '-' }}
          </p>
        </div>

        <div class="orderDetail__infoCard">
          <p class="orderDetail__infoLabel">建立日期</p>
          <p class="orderDetail__infoValue">
            {{ fmtDateTime(order?.createdAt) }}
          </p>
        </div>

        <div class="orderDetail__infoCard">
          <p class="orderDetail__infoLabel">出貨方式</p>
          <p class="orderDetail__infoValue">
            {{ order?.shippingMethodName || order?.shippingMethod || '-' }}
          </p>
        </div>

        <div class="orderDetail__infoCard">
          <p class="orderDetail__infoLabel">商店</p>
          <p class="orderDetail__infoValue">
            {{ order?.storeName || '-' }}
          </p>
        </div>

        <div class="orderDetail__infoCard">
          <p class="orderDetail__infoLabel">商品數量</p>
          <p class="orderDetail__infoValue">
            {{ Number(order?.totalItems || 0) }}
          </p>
        </div>
      </div>

      <div class="orderDetail__moneyGrid">
        <div class="orderDetail__moneyCard">
          <p class="orderDetail__moneyLabel">商品小計</p>
          <p class="orderDetail__moneyValue">
            NT$ {{ Number(order?.subtotal ?? 0).toLocaleString() }}
          </p>
        </div>

        <div class="orderDetail__moneyCard">
          <p class="orderDetail__moneyLabel">運費</p>
          <p class="orderDetail__moneyValue">
            NT$ {{ Number(order?.shippingFee ?? 0).toLocaleString() }}
          </p>
        </div>

        <div class="orderDetail__moneyCard">
          <p class="orderDetail__moneyLabel">折扣</p>
          <p class="orderDetail__moneyValue">
            {{
              order?.discount
                ? `-NT$ ${Number(order.discount).toLocaleString()}`
                : '-'
            }}
          </p>
        </div>

        <div class="orderDetail__moneyCard orderDetail__moneyCard--total">
          <p class="orderDetail__moneyLabel">總金額</p>
          <p class="orderDetail__moneyValue">
            NT$ {{ Number(order?.totalAmount ?? 0).toLocaleString() }}
          </p>
        </div>
      </div>
    </div>

    <div class="orderDetail__section">
      <div class="orderDetail__sectionHead">
        <div>
          <p class="orderDetail__sectionKicker">ORDER ITEMS</p>
          <h2 class="orderDetail__sectionTitle">商品明細</h2>
        </div>

        <p class="orderDetail__count">
          共 <b>{{ items.length }}</b> 項
        </p>
      </div>

      <div class="orderDetail__tableWrap">
        <table class="orderDetail__table">
          <thead>
            <tr>
              <th>商品</th>
              <th>來源一番賞</th>
              <th>等級</th>
              <th>建立時間</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="it in items" :key="it.id">
              <td>
                <div class="orderDetail__product">
                  <div class="orderDetail__thumb" aria-hidden="true">
                    <img
                      v-if="it.prizeImageUrl"
                      :src="it.prizeImageUrl"
                      alt=""
                      draggable="false"
                    />
                    <div v-else class="orderDetail__thumbPh"></div>
                  </div>

                  <div class="orderDetail__productInfo">
                    <p class="orderDetail__productName">
                      {{ it.prizeName || '-' }}
                    </p>
                    <p class="orderDetail__productSku orderDetail__mono">
                      {{ it.prizeId || it.prizeBoxId || it.id }}
                    </p>
                  </div>
                </div>
              </td>

              <td>{{ it.lotteryTitle || '-' }}</td>
              <td class="orderDetail__mono">{{ it.prizeLevel || '-' }}</td>
              <td>{{ fmtDateTime(it.createdAt) }}</td>
            </tr>

            <tr v-if="items.length === 0">
              <td class="orderDetail__empty" colspan="4">查無商品資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="orderDetail__cards">
        <article v-for="it in items" :key="it.id" class="orderDetail__item">
          <div class="orderDetail__thumb" aria-hidden="true">
            <img
              v-if="it.prizeImageUrl"
              :src="it.prizeImageUrl"
              alt=""
              draggable="false"
            />
            <div v-else class="orderDetail__thumbPh"></div>
          </div>

          <div class="orderDetail__itemBody">
            <p class="orderDetail__productName">{{ it.prizeName || '-' }}</p>
            <p class="orderDetail__productSku orderDetail__mono">
              {{ it.prizeId || it.prizeBoxId || it.id }}
            </p>

            <div class="orderDetail__itemMeta">
              <p class="orderDetail__metaRow">
                <span>來源</span>
                <strong>{{ it.lotteryTitle || '-' }}</strong>
              </p>

              <p class="orderDetail__metaRow">
                <span>等級</span>
                <strong class="orderDetail__mono">
                  {{ it.prizeLevel || '-' }}
                </strong>
              </p>

              <p class="orderDetail__metaRow">
                <span>時間</span>
                <strong>{{ fmtDateTime(it.createdAt) }}</strong>
              </p>
            </div>
          </div>
        </article>

        <div v-if="items.length === 0" class="orderDetail__emptyCard">
          <font-awesome-icon :icon="['fas', 'box-open']" />
          <p>查無商品資料</p>
        </div>
      </div>
    </div>

    <div class="orderDetail__section">
      <div class="orderDetail__sectionHead">
        <div>
          <p class="orderDetail__sectionKicker">SHIPPING INFO</p>
          <h2 class="orderDetail__sectionTitle">收件資訊</h2>
        </div>
      </div>

      <div class="orderDetail__shippingBox">
        <ShippingInfoForm
          v-if="order?.shippingStatus === 'PENDING'"
          :is-submitting="isSubmitting"
          :error-msg="submitError"
          @submit="onShippingSubmit"
        />

        <ShippingInfoDisplay
          v-else
          :recipient-name="order?.recipientName"
          :recipient-phone="order?.recipientPhone"
          :recipient-address="order?.recipientAddress"
        />
      </div>
    </div>

    <div
      v-if="
        order &&
        ['PAYMENT_PENDING', 'PAYMENT_FAILED'].includes(order.shippingStatus)
      "
      class="orderDetail__section"
    >
      <div class="orderDetail__sectionHead">
        <div>
          <p class="orderDetail__sectionKicker">SHIPPING PAYMENT</p>
          <h2 class="orderDetail__sectionTitle">運費付款</h2>
        </div>
      </div>

      <div class="orderDetail__paymentGrid">
        <label
          class="orderDetail__paymentCard"
          :class="{
            'orderDetail__paymentCard--active':
              selectedPaymentMethod === 'CREDIT_CARD',
          }"
        >
          <input
            v-model="selectedPaymentMethod"
            type="radio"
            value="CREDIT_CARD"
          />

          <span class="orderDetail__paymentIcon">
            <font-awesome-icon :icon="['fas', 'credit-card']" />
          </span>

          <span class="orderDetail__paymentText">
            <strong>信用卡</strong>
            <small>立即前往信用卡付款頁</small>
          </span>

          <span class="orderDetail__paymentCheck">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>
        </label>

        <label
          class="orderDetail__paymentCard"
          :class="{
            'orderDetail__paymentCard--active':
              selectedPaymentMethod === 'BANK_TRANSFER',
          }"
        >
          <input
            v-model="selectedPaymentMethod"
            type="radio"
            value="BANK_TRANSFER"
          />

          <span class="orderDetail__paymentIcon">
            <font-awesome-icon :icon="['fas', 'building-columns']" />
          </span>

          <span class="orderDetail__paymentText">
            <strong>銀行轉帳</strong>
            <small>取得虛擬帳號後再轉帳</small>
          </span>

          <span class="orderDetail__paymentCheck">
            <font-awesome-icon :icon="['fas', 'check']" />
          </span>
        </label>
      </div>

      <p v-if="repayError" class="orderDetail__error">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        <span>{{ repayError }}</span>
      </p>

      <div class="orderDetail__actions">
        <button class="orderDetail__actionBtn" type="button" @click="onRepay">
          <font-awesome-icon :icon="['fas', 'bolt']" />
          重新付款
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="orderDetail__loadingMask">
      <span class="orderDetail__spinner"></span>
      <p>載入訂單中...</p>
    </div>

    <p v-if="error" class="orderDetail__error">
      <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
      <span>{{ error }}</span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderDetail } from '@/composables/useOrderDetail';
import ShippingInfoForm from '@/components/order/ShippingInfoForm.vue';
import ShippingInfoDisplay from '@/components/order/ShippingInfoDisplay.vue';
import { submitGatewayForm } from '@/utils/payment/submitGatewayForm';
import type { PaymentMethodCode } from '@/services/rechargeService';

const route = useRoute();
const router = useRouter();

const orderIdVal = computed(() => String(route.params.orderId || ''));

const {
  order,
  isLoading,
  isSubmitting,
  error,
  submitError,
  repayError,
  fetchDetail,
  submitShipping,
  repay,
} = useOrderDetail(orderIdVal.value);

const selectedPaymentMethod = ref<PaymentMethodCode>('CREDIT_CARD');

const items = computed(() => (order.value?.items ? order.value.items : []));

const fmtDateTime = (v: any) => {
  const s = String(v || '');
  if (!s) return '-';

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return `${y}-${m}-${dd} ${hh}:${mm}`;
};

const badgeClass = (s: any) => {
  const ss = String(s || '');

  return {
    'is-paid': ss === 'PAID',
    'is-pending': ss === 'PENDING' || ss === 'PAYMENT_PENDING',
    'is-shipping': ss === 'SHIPPING',
    'is-delivered': ss === 'DELIVERED',
    'is-canceled': ss === 'CANCELED',
    'is-refunded': ss === 'REFUNDED',
    'is-failed': ss === 'FAILED' || ss === 'PAYMENT_FAILED',
  };
};

const goBack = () => router.back();

async function onShippingSubmit(form: {
  recipientName: string;
  recipientPhone: string;
  city: string;
  district: string;
  address: string;
}) {
  await submitShipping(form);
}

async function onRepay() {
  const gatewayPayload = await repay(selectedPaymentMethod.value);

  if (gatewayPayload) {
    if (
      gatewayPayload.virtualAccount ||
      (gatewayPayload.paymentMethod === 'BANK_TRANSFER' &&
        !gatewayPayload.actionUrl &&
        !gatewayPayload.paymentUrl)
    ) {
      router.push({
        name: 'OrderPaymentResult',
        query: {
          e_orderno: gatewayPayload.gatewayTradeNo || gatewayPayload.orderNumber,
          result: gatewayPayload.gatewayResult || '1',
        },
      });
      return;
    }

    const submitted = submitGatewayForm({
      ...gatewayPayload,
      payUrl: gatewayPayload.paymentUrl,
    });

    if (!submitted) {
      repayError.value = '金流表單資料不完整，請稍後再試';
    }
  }
}

onMounted(fetchDetail);
</script>

<style scoped lang="scss">
.orderDetail {
  position: relative;
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

  &__backBtn {
    min-width: 86px;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    backdrop-filter: blur(12px);

    font-size: 13px;
    font-weight: 900;

    transition:
      transform 0.16s ease,
      background 0.16s ease;

    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.22);
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

  &__summaryGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  &__infoCard,
  &__moneyCard {
    min-height: 82px;
    padding: 14px;
    border-radius: 18px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__infoCard--wide {
    grid-column: span 2;
  }

  &__infoLabel,
  &__moneyLabel {
    margin: 0 0 6px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__infoValue,
  &__moneyValue {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 950;
    word-break: break-word;
  }

  &__moneyGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }

  &__moneyCard--total {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;

    .orderDetail__moneyLabel {
      color: rgba(255, 255, 255, 0.78);
    }

    .orderDetail__moneyValue {
      color: #fff;
      font-size: 18px;
    }
  }

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
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

    &.is-paid,
    &.is-delivered {
      background: rgba(46, 125, 50, 0.1);
      color: #2e7d32;
      border-color: rgba(46, 125, 50, 0.16);
    }

    &.is-pending {
      background: rgba(245, 158, 11, 0.12);
      color: #a16207;
      border-color: rgba(245, 158, 11, 0.2);
    }

    &.is-shipping {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-color: rgba(37, 99, 235, 0.16);
    }

    &.is-canceled,
    &.is-refunded,
    &.is-failed {
      background: rgba(180, 35, 24, 0.1);
      color: #b42318;
      border-color: rgba(180, 35, 24, 0.16);
    }
  }

  &__tableWrap {
    overflow-x: auto;
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

  &__product {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
  }

  &__thumb {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    border: 1px solid var(--line);
    overflow: hidden;
    background: #f6f1ea;
    flex: 0 0 auto;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__thumbPh {
    width: 100%;
    height: 100%;
    background: #eee3d8;
  }

  &__productInfo {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  &__productName {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 950;
    white-space: normal;
  }

  &__productSku {
    margin: 0;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;
  }

  &__empty {
    text-align: center !important;
    padding: 28px 12px !important;
    color: var(--text-soft) !important;
    border-radius: 18px !important;
  }

  &__cards {
    display: none;
    gap: 12px;
  }

  &__item {
    padding: 14px;
    border-radius: 20px;

    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 12px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);

    .orderDetail__thumb {
      width: 64px;
      height: 64px;
      border-radius: 18px;
    }
  }

  &__itemBody {
    min-width: 0;
  }

  &__itemMeta {
    display: grid;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }

  &__metaRow {
    margin: 0;
    display: flex;
    justify-content: space-between;
    gap: 12px;

    span {
      color: var(--text-soft);
      font-size: 13px;
      font-weight: 900;
    }

    strong {
      color: var(--text);
      font-size: 13px;
      font-weight: 950;
      text-align: right;
    }
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
  }

  &__shippingBox {
    padding: 14px;
    border-radius: 20px;
    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
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

      .orderDetail__paymentIcon {
        background: var(--primary);
        color: #fff;
      }

      .orderDetail__paymentCheck {
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

  &__actionBtn {
    min-height: 44px;
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
      box-shadow 0.16s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
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

  &__loadingMask {
    margin-top: 16px;
    min-height: 120px;
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

  &__spinner {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(180, 51, 37, 0.24);
    border-top-color: var(--primary);
    animation: orderDetailSpin 0.7s linear infinite;
  }

  @media (max-width: 900px) {
    &__summaryGrid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__moneyGrid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__infoCard--wide {
      grid-column: span 2;
    }
  }

  @media (max-width: 760px) {
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

    &__heroTop {
      align-items: flex-start;
    }

    &__title {
      font-size: 25px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__backBtn {
      width: 42px;
      min-width: 42px;
      height: 42px;
      padding: 0;

      span {
        display: none;
      }
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

    &__summaryGrid,
    &__moneyGrid {
      grid-template-columns: 1fr;
    }

    &__infoCard--wide {
      grid-column: auto;
    }

    &__infoCard,
    &__moneyCard {
      min-height: 76px;
      padding: 13px;
      border-radius: 18px;
    }

    &__moneyGrid {
      margin-top: 12px;
      padding-top: 12px;
    }

    &__item {
      grid-template-columns: 64px minmax(0, 1fr);
      padding: 13px;
    }

    &__shippingBox {
      padding: 12px;
      border-radius: 18px;
    }

    &__paymentCard {
      min-height: 82px;
      padding: 13px;
      border-radius: 19px;
      grid-template-columns: 46px minmax(0, 1fr) 26px;
      gap: 10px;
    }

    &__actions {
      flex-direction: column;
    }

    &__actionBtn {
      width: 100%;
      min-height: 48px;
    }
  }
}

@keyframes orderDetailSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
