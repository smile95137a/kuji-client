<!-- src/views/member/OrderList.vue -->
<template>
  <section class="order-list">
    <header class="order-list__header">
      <h1 class="order-list__title">我的訂單</h1>
      <p class="order-list__subtitle">查看您的出貨訂單狀態與詳情</p>
    </header>

    <div class="order-list__card">
      <!-- 篩選列 -->
      <div class="order-list__toolbar">
        <div class="order-list__filters">
          <select v-model="statusFilter" class="order-list__select">
            <option value="">全部狀態</option>
            <option value="PENDING">待處理</option>
            <option value="PREPARING">準備中</option>
            <option value="SHIPPED">已出貨</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
          </select>

          <input
            v-model.trim="keyword"
            type="text"
            class="order-list__input"
            placeholder="搜尋訂單編號"
          />
        </div>

        <button
          class="order-list__btn order-list__btn--ghost"
          type="button"
          @click="onReset"
        >
          重設
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="order-list__loading">載入中...</div>

      <!-- Empty -->
      <div v-else-if="filteredOrders.length === 0" class="order-list__empty">
        <font-awesome-icon
          :icon="['fas', 'box-open']"
          class="order-list__empty-icon"
        />
        <p>目前沒有訂單記錄</p>
      </div>

      <!-- Order List -->
      <div v-else class="order-list__list">
        <div
          v-for="order in pageOrders"
          :key="order.id"
          class="order-list__item"
          @click="viewDetail(order.id)"
        >
          <div class="order-list__item-header">
            <span class="order-list__order-no">{{ order.orderNo }}</span>
            <span
              class="order-list__status"
              :class="`order-list__status--${order.status.toLowerCase()}`"
            >
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <div class="order-list__item-body">
            <div class="order-list__info">
              <p class="order-list__info-label">收件人</p>
              <p class="order-list__info-value">{{ order.recipientName }}</p>
            </div>
            <div class="order-list__info">
              <p class="order-list__info-label">商品數量</p>
              <p class="order-list__info-value">{{ order.itemCount }} 件</p>
            </div>
            <div class="order-list__info">
              <p class="order-list__info-label">運費</p>
              <p class="order-list__info-value">NT$ {{ order.shippingFee }}</p>
            </div>
            <div class="order-list__info">
              <p class="order-list__info-label">建立時間</p>
              <p class="order-list__info-value">{{ order.createdAt }}</p>
            </div>
          </div>

          <div class="order-list__item-footer">
            <span class="order-list__view-detail">
              查看詳情
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="order-list__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <!-- Order Detail Dialog -->
    <div
      v-if="detailOpen"
      class="order-list__overlay"
      @click.self="detailOpen = false"
    >
      <div class="order-list__dialog">
        <div class="order-list__dialog-header">
          <h3>訂單詳情</h3>
          <button
            class="order-list__dialog-close"
            type="button"
            @click="detailOpen = false"
          >
            ✕
          </button>
        </div>

        <div v-if="detailLoading" class="order-list__dialog-loading">
          載入中...
        </div>

        <div v-else-if="selectedOrder" class="order-list__dialog-body">
          <!-- 訂單基本資訊 -->
          <div class="order-list__detail-section">
            <h4>訂單資訊</h4>
            <div class="order-list__detail-grid">
              <div class="order-list__detail-item">
                <span class="order-list__detail-label">訂單編號</span>
                <span class="order-list__detail-value">{{ selectedOrder.orderNo }}</span>
              </div>
              <div class="order-list__detail-item">
                <span class="order-list__detail-label">訂單狀態</span>
                <span
                  class="order-list__status"
                  :class="`order-list__status--${selectedOrder.status.toLowerCase()}`"
                >
                  {{ statusLabel(selectedOrder.status) }}
                </span>
              </div>
              <div class="order-list__detail-item">
                <span class="order-list__detail-label">建立時間</span>
                <span class="order-list__detail-value">{{ selectedOrder.createdAt }}</span>
              </div>
              <div class="order-list__detail-item">
                <span class="order-list__detail-label">運費</span>
                <span class="order-list__detail-value">NT$ {{ selectedOrder.shippingFee }}</span>
              </div>
            </div>
          </div>

          <!-- 收件資訊 -->
          <div class="order-list__detail-section">
            <h4>收件資訊</h4>
            <div class="order-list__detail-grid">
              <div class="order-list__detail-item order-list__detail-item--full">
                <span class="order-list__detail-label">收件人</span>
                <span class="order-list__detail-value">{{ selectedOrder.recipientName }}</span>
              </div>
              <div class="order-list__detail-item order-list__detail-item--full">
                <span class="order-list__detail-label">聯絡電話</span>
                <span class="order-list__detail-value">{{ selectedOrder.phoneNumber }}</span>
              </div>
              <div class="order-list__detail-item order-list__detail-item--full">
                <span class="order-list__detail-label">收件地址</span>
                <span class="order-list__detail-value">{{ selectedOrder.fullAddress }}</span>
              </div>
            </div>
          </div>

          <!-- 物流資訊 -->
          <div v-if="selectedOrder.trackingNumber" class="order-list__detail-section">
            <h4>物流資訊</h4>
            <div class="order-list__detail-grid">
              <div class="order-list__detail-item">
                <span class="order-list__detail-label">物流單號</span>
                <span class="order-list__detail-value">{{ selectedOrder.trackingNumber }}</span>
              </div>
              <div v-if="selectedOrder.shippedAt" class="order-list__detail-item">
                <span class="order-list__detail-label">出貨時間</span>
                <span class="order-list__detail-value">{{ selectedOrder.shippedAt }}</span>
              </div>
            </div>
          </div>

          <!-- 商品列表 -->
          <div class="order-list__detail-section">
            <h4>商品明細 ({{ selectedOrder.items?.length || 0 }} 件)</h4>
            <div class="order-list__items">
              <div
                v-for="item in selectedOrder.items"
                :key="item.id"
                class="order-list__product"
              >
                <div class="order-list__product-img">
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
                <div class="order-list__product-info">
                  <p class="order-list__product-name">{{ item.name }}</p>
                  <p class="order-list__product-prize">{{ item.prizeName }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-list__dialog-footer">
          <button
            type="button"
            class="order-list__btn"
            @click="detailOpen = false"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';
import { getMyOrders, getOrderDetail } from '@/services/orderService';
import { executeApi } from '@/utils/executeApiUtils';

interface OrderItem {
  id: string;
  name: string;
  prizeName: string;
  imageUrl: string;
}

interface Order {
  id: string;
  orderNo: string;
  status: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  shippingFee: number;
  itemCount: number;
  createdAt: string;
  shippedAt?: string;
  trackingNumber?: string;
  items?: OrderItem[];
}

const pageSize = 10;
const page = ref(1);
const loading = ref(false);
const detailLoading = ref(false);
const detailOpen = ref(false);

const statusFilter = ref('');
const keyword = ref('');

const orders = ref<Order[]>([]);
const selectedOrder = ref<Order | null>(null);

const formatDate = (input?: string) => {
  if (!input) return '';
  return String(input).slice(0, 16).replace('T', ' ');
};

const mapOrder = (o: any): Order => ({
  id: String(o?.orderId ?? o?.id ?? ''),
  orderNo: String(o?.orderNumber ?? o?.orderNo ?? ''),
  status: String(o?.status ?? 'PENDING'),
  recipientName: String(o?.shippingAddress?.recipientName ?? o?.recipientName ?? o?.receiverName ?? ''),
  phoneNumber: String(o?.shippingAddress?.recipientPhone ?? o?.recipientPhone ?? o?.phoneNumber ?? o?.receiverPhone ?? ''),
  fullAddress: o?.shippingAddress
    ? [
        o.shippingAddress.zipCode ?? '',
        o.shippingAddress.city ?? '',
        o.shippingAddress.district ?? '',
        o.shippingAddress.address ?? '',
      ]
        .filter(Boolean)
        .join('')
    : [
        o?.zipCode ?? '',
        o?.city ?? '',
        o?.district ?? '',
        o?.address ?? '',
      ]
        .filter(Boolean)
        .join(''),
  shippingFee: Number(o?.shippingFee ?? 0),
  itemCount: Number(o?.itemCount ?? o?.items?.length ?? 0),
  createdAt: formatDate(o?.createdAt),
  shippedAt: o?.shippedAt ? formatDate(o.shippedAt) : undefined,
  trackingNumber: o?.trackingNumber ?? undefined,
  items: Array.isArray(o?.items)
    ? o.items.map((i: any) => ({
        id: String(i?.prizeBoxId ?? i?.id ?? ''),
        name: String(i?.lotteryTitle ?? i?.name ?? i?.productName ?? ''),
        prizeName: String(i?.prizeName ?? i?.prizeLevel ?? ''),
        imageUrl: String(
          i?.prizeImageUrl ?? i?.imageUrl ?? i?.image ?? 'https://placehold.co/80x80?text=Prize'
        ),
      }))
    : [],
});

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待處理',
    PREPARING: '準備中',
    PROCESSING: '處理中',
    SHIPPED: '已出貨',
    COMPLETED: '已完成',
    DELIVERED: '已送達',
    CANCELLED: '已取消',
  };
  return map[status] || status;
};

const filteredOrders = computed(() => {
  const kw = keyword.value.toLowerCase();
  return orders.value.filter((o) => {
    const okStatus = statusFilter.value ? o.status === statusFilter.value : true;
    const okKeyword = kw ? o.orderNo.toLowerCase().includes(kw) : true;
    return okStatus && okKeyword;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredOrders.value.length / pageSize))
);

const pageOrders = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredOrders.value.slice(start, start + pageSize);
});

watch([statusFilter, keyword], () => {
  page.value = 1;
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const onReset = () => {
  statusFilter.value = '';
  keyword.value = '';
  page.value = 1;
};

const fetchOrders = async () => {
  loading.value = true;
  await executeApi({
    fn: () => getMyOrders(),
    onSuccess: (data) => {
      const list = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];
      orders.value = list.map(mapOrder);
    },
    showCatchDialog: true,
  });
  loading.value = false;
};

const viewDetail = async (orderId: string) => {
  detailOpen.value = true;
  detailLoading.value = true;
  selectedOrder.value = null;

  await executeApi({
    fn: () => getOrderDetail(orderId),
    onSuccess: (data) => {
      selectedOrder.value = mapOrder(data);
    },
    showCatchDialog: true,
  });

  detailLoading.value = false;
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped lang="scss">
.order-list {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px;
  }

  &__subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  &__card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__select,
  &__input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #ff9800;
    }
  }

  &__input {
    min-width: 180px;
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 48px 16px;
    color: #999;
  }

  &__empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #ddd;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__item {
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #ff9800;
      background: #fffaf5;
    }
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__order-no {
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }

  &__status {
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;

    &--pending {
      background: #fff3e0;
      color: #e65100;
    }

    &--processing {
      background: #e3f2fd;
      color: #1565c0;
    }

    &--shipped {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &--delivered {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    &--cancelled {
      background: #fafafa;
      color: #757575;
    }
  }

  &__item-body {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  &__info {
    &-label {
      font-size: 12px;
      color: #999;
      margin: 0 0 2px;
    }

    &-value {
      font-size: 14px;
      color: #333;
      margin: 0;
    }
  }

  &__item-footer {
    display: flex;
    justify-content: flex-end;
  }

  &__view-detail {
    font-size: 13px;
    color: #ff9800;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__pagination {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }

  &__btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background: linear-gradient(135deg, #ff9800, #ff5722);
    color: #fff;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }

    &--ghost {
      background: #f5f5f5;
      color: #666;

      &:hover:not(:disabled) {
        background: #eee;
        box-shadow: none;
      }
    }
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  &__dialog {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    overflow-y: auto;
  }

  &__dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: #fff;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  &__dialog-close {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    color: #999;

    &:hover {
      color: #333;
    }
  }

  &__dialog-loading {
    padding: 48px;
    text-align: center;
    color: #999;
  }

  &__dialog-body {
    padding: 24px;
  }

  &__dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding: 20px 24px;
    border-top: 1px solid #eee;
  }

  &__detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
  }

  &__detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  &__detail-item {
    &--full {
      grid-column: 1 / -1;
    }
  }

  &__detail-label {
    font-size: 12px;
    color: #999;
    display: block;
    margin-bottom: 2px;
  }

  &__detail-value {
    font-size: 14px;
    color: #333;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__product {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
  }

  &__product-img {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__product-info {
    flex: 1;
  }

  &__product-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin: 0 0 4px;
  }

  &__product-prize {
    font-size: 12px;
    color: #ff9800;
    margin: 0;
  }
}
</style>
