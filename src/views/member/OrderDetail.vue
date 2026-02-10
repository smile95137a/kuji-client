<!-- src/views/member/OrderDetail.vue -->
<template>
  <section class="orderDetail">
    <header class="orderDetail__header">
      <div class="orderDetail__headerLeft">
        <h1 class="orderDetail__title">訂單明細</h1>
        <p class="orderDetail__subtitle">查看訂單內容與出貨資訊</p>
      </div>

      <div class="orderDetail__headerRight">
        <button
          class="orderDetail__btn orderDetail__btn--ghost"
          type="button"
          @click="goBack"
        >
          返回
        </button>
      </div>
    </header>

    <!-- 概覽 -->
    <div class="orderDetail__card">
      <div class="orderDetail__topGrid">
        <div class="orderDetail__block">
          <p class="orderDetail__k">訂單號</p>
          <p class="orderDetail__v orderDetail__mono">
            {{ order?.orderNo || '-' }}
          </p>
        </div>

        <div class="orderDetail__block">
          <p class="orderDetail__k">建立日期</p>
          <p class="orderDetail__v">{{ fmtDateTime(order?.createdAt) }}</p>
        </div>

        <div class="orderDetail__block">
          <p class="orderDetail__k">狀態</p>
          <p class="orderDetail__v">
            <span
              class="orderDetail__badge"
              :class="badgeClass(order?.shippingStatus)"
            >
              {{ order?.shippingStatusName || order?.shippingStatus || '-' }}
            </span>
          </p>
        </div>

        <div class="orderDetail__block">
          <p class="orderDetail__k">出貨方式</p>
          <p class="orderDetail__v">
            {{ order?.shippingMethodName || order?.shippingMethod || '-' }}
          </p>
        </div>

        <div class="orderDetail__block">
          <p class="orderDetail__k">商店</p>
          <p class="orderDetail__v">
            {{ order?.storeName || '-' }}
          </p>
        </div>

        <div class="orderDetail__block">
          <p class="orderDetail__k">商品數量</p>
          <p class="orderDetail__v">{{ Number(order?.totalItems || 0) }}</p>
        </div>
      </div>

      <div class="orderDetail__hr"></div>

      <!-- 金額區（後端目前沒有金額欄位，先顯示 -，不讓 UI 壞） -->
      <div class="orderDetail__moneyRow">
        <div class="orderDetail__moneyItem">
          <p class="orderDetail__k">商品小計</p>
          <p class="orderDetail__v">-</p>
        </div>
        <div class="orderDetail__moneyItem">
          <p class="orderDetail__k">運費</p>
          <p class="orderDetail__v">-</p>
        </div>
        <div class="orderDetail__moneyItem">
          <p class="orderDetail__k">折扣</p>
          <p class="orderDetail__v">-</p>
        </div>
        <div class="orderDetail__moneyItem orderDetail__moneyItem--total">
          <p class="orderDetail__k">總金額</p>
          <p class="orderDetail__v">-</p>
        </div>
      </div>
    </div>

    <!-- 商品清單 -->
    <div class="orderDetail__card">
      <div class="orderDetail__sectionHeader">
        <h2 class="orderDetail__sectionTitle">商品明細</h2>
        <p class="orderDetail__sectionHint">共 {{ items.length }} 項</p>
      </div>

      <!-- Desktop Table -->
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

      <!-- Mobile Cards -->
      <div class="orderDetail__cards">
        <div v-for="it in items" :key="it.id" class="orderDetail__item">
          <div class="orderDetail__itemLeft">
            <div class="orderDetail__thumb" aria-hidden="true">
              <img
                v-if="it.prizeImageUrl"
                :src="it.prizeImageUrl"
                alt=""
                draggable="false"
              />
              <div v-else class="orderDetail__thumbPh"></div>
            </div>
          </div>

          <div class="orderDetail__itemBody">
            <p class="orderDetail__productName">{{ it.prizeName || '-' }}</p>
            <p class="orderDetail__productSku orderDetail__mono">
              {{ it.prizeId || it.prizeBoxId || it.id }}
            </p>

            <div class="orderDetail__itemMeta">
              <p class="orderDetail__metaRow">
                <span class="orderDetail__k">來源</span>
                <span class="orderDetail__v">{{ it.lotteryTitle || '-' }}</span>
              </p>
              <p class="orderDetail__metaRow">
                <span class="orderDetail__k">等級</span>
                <span class="orderDetail__v orderDetail__mono">{{
                  it.prizeLevel || '-'
                }}</span>
              </p>
              <p class="orderDetail__metaRow">
                <span class="orderDetail__k">時間</span>
                <span class="orderDetail__v">{{
                  fmtDateTime(it.createdAt)
                }}</span>
              </p>
            </div>
          </div>
        </div>

        <div v-if="items.length === 0" class="orderDetail__emptyCard">
          查無商品資料
        </div>
      </div>
    </div>

    <!-- 收件資訊 -->
    <div class="orderDetail__card">
      <div class="orderDetail__sectionHeader">
        <h2 class="orderDetail__sectionTitle">收件資訊</h2>
        <p class="orderDetail__sectionHint">收件人與地址</p>
      </div>

      <div class="orderDetail__infoGrid">
        <div class="orderDetail__infoBlock">
          <p class="orderDetail__k">收件人</p>
          <p class="orderDetail__v">{{ order?.recipientName || '-' }}</p>
        </div>
        <div class="orderDetail__infoBlock">
          <p class="orderDetail__k">電話</p>
          <p class="orderDetail__v">{{ order?.recipientPhone || '-' }}</p>
        </div>
        <div class="orderDetail__infoBlock orderDetail__infoBlock--full">
          <p class="orderDetail__k">地址</p>
          <p class="orderDetail__v">{{ order?.recipientAddress || '-' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOrderDetail } from '@/services/orderService';
import { executeApi } from '@/utils/executeApiUtils';

const route = useRoute();
const router = useRouter();

const orderId = computed(() => String(route.params.orderId || ''));

const order = ref<any>(null);

const items = computed(() => (order.value?.items ? order.value.items : []));

// 2026-02-09T01:54:29 -> 2026-02-09 01:54
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
    'is-pending': ss === 'PENDING',
    'is-shipping': ss === 'SHIPPING',
    'is-delivered': ss === 'DELIVERED',
    'is-canceled': ss === 'CANCELED',
    'is-refunded': ss === 'REFUNDED',
    'is-failed': ss === 'FAILED',
  };
};

const goBack = () => router.back();

const normalizeOrderDetail = (raw: any) => {
  const data = raw?.data?.data ?? raw?.data ?? raw;
  if (!data) return null;

  return {
    id: data.id,
    orderNo: data.orderNo,
    userId: data.userId,
    userNickname: data.userNickname,
    userEmail: data.userEmail,

    storeId: data.storeId,
    storeName: data.storeName,

    totalItems: data.totalItems,

    shippingMethod: data.shippingMethod,
    shippingMethodName: data.shippingMethodName,

    shippingStatus: data.shippingStatus,
    shippingStatusName: data.shippingStatusName,

    recipientName: data.recipientName,
    recipientPhone: data.recipientPhone,
    recipientAddress: data.recipientAddress,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,

    items: Array.isArray(data.items) ? data.items : [],
  };
};

const loadOrderDetail = async () => {
  if (!orderId.value) return;

  await executeApi<any>({
    fn: () => getOrderDetail(orderId.value),
    onSuccess: (raw) => {
      order.value = normalizeOrderDetail(raw);
    },
  });
};

onMounted(loadOrderDetail);
</script>

<style scoped lang="scss">
/* 你原本若已經有樣式可不貼；這裡只補「不會壞」的基礎結構 */
.orderDetail {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__title {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 900;
  }
  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__btn {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
    background: #111;
    color: #fff;

    &--ghost {
      background: transparent;
      color: #111;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }
  }

  &__card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
    margin-top: 12px;
  }

  &__topGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 720px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 480px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__block {
    display: grid;
    gap: 6px;
  }

  &__k {
    margin: 0;
    font-size: 12px;
    opacity: 0.7;
    font-weight: 800;
  }
  &__v {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
  }

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
  }

  &__badge {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    font-size: 12px;
    font-weight: 900;
  }

  &__hr {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 14px 0;
  }

  &__moneyRow {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 720px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 480px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__moneyItem--total .orderDetail__v {
    font-size: 16px;
  }

  &__sectionHeader {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__sectionTitle {
    margin: 0;
    font-size: 16px;
    font-weight: 900;
  }
  &__sectionHint {
    margin: 0;
    font-size: 12px;
    opacity: 0.7;
  }

  &__tableWrap {
    overflow-x: auto;

    @media (max-width: 760px) {
      display: none;
    }
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th,
    td {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      white-space: nowrap;
      vertical-align: middle;
    }

    th {
      opacity: 0.75;
      font-weight: 900;
    }
  }

  &__product {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 260px;
  }

  &__thumb {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
    background: #f6f6f6;

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
    background: #eee;
  }

  &__productInfo {
    display: grid;
    gap: 2px;
  }

  &__productName {
    margin: 0;
    font-weight: 900;
  }

  &__productSku {
    margin: 0;
    font-size: 12px;
    opacity: 0.75;
  }

  &__empty {
    text-align: center;
    padding: 22px 10px;
    opacity: 0.65;
  }

  &__cards {
    display: none;
    gap: 10px;

    @media (max-width: 760px) {
      display: grid;
    }
  }

  &__item {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 12px;
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 10px;
    align-items: start;
  }

  &__itemMeta {
    display: grid;
    gap: 6px;
    margin-top: 8px;
  }

  &__metaRow {
    margin: 0;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  &__emptyCard {
    border: 1px dashed rgba(0, 0, 0, 0.15);
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    opacity: 0.65;
  }

  &__infoGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__infoBlock {
    display: grid;
    gap: 6px;

    &--full {
      grid-column: 1 / -1;
    }
  }
}
</style>
