<!-- src/views/member/OrderHistory.vue -->
<template>
  <section class="orderHistory">
    <header class="orderHistory__header">
      <h1 class="orderHistory__title">訂單紀錄</h1>
      <p class="orderHistory__subtitle">查詢你的訂單明細與狀態</p>
    </header>

    <!-- 查詢條件 -->
    <div class="orderHistory__card">
      <form class="orderHistory__form" @submit.prevent="onSearch">
        <div class="orderHistory__grid">
          <div class="orderHistory__field">
            <label class="orderHistory__label">起始日期</label>
            <input
              class="orderHistory__input"
              type="date"
              v-model="createdAtStart"
              name="createdAtStart"
            />
          </div>

          <div class="orderHistory__field">
            <label class="orderHistory__label">結束日期</label>
            <input
              class="orderHistory__input"
              type="date"
              v-model="createdAtEnd"
              name="createdAtEnd"
            />
          </div>

          <div class="orderHistory__field">
            <label class="orderHistory__label">狀態</label>
            <select
              class="orderHistory__input"
              v-model="shippingStatus"
              name="shippingStatus"
            >
              <option value="">全部</option>
              <!-- ✅ 依你回傳 PENDING；其餘請照後端 enum 調整 -->
              <option value="PENDING">待處理</option>
              <option value="SHIPPING">出貨中</option>
              <option value="DELIVERED">已送達</option>
              <option value="CANCELED">已取消</option>
            </select>
          </div>

          <div class="orderHistory__field">
            <label class="orderHistory__label">訂單號</label>
            <input
              class="orderHistory__input"
              type="text"
              placeholder="輸入訂單號關鍵字"
              v-model.trim="orderNo"
              name="orderNo"
            />
          </div>
        </div>

        <div class="orderHistory__actions">
          <button
            class="orderHistory__btn orderHistory__btn--ghost"
            type="button"
            @click="onReset"
          >
            重設
          </button>
          <button class="orderHistory__btn" type="submit">查詢</button>
        </div>
      </form>
    </div>

    <!-- 結果 -->
    <div class="orderHistory__card">
      <div class="orderHistory__resultHeader">
        <p class="orderHistory__count">
          共 <b>{{ rows.length }}</b> 筆
        </p>
      </div>

      <!-- Desktop Table -->
      <div class="orderHistory__tableWrap">
        <table class="orderHistory__table">
          <thead>
            <tr>
              <th>日期</th>
              <th>訂單號</th>
              <th>金額</th>
              <th>付款方式</th>
              <th>狀態</th>
              <th class="orderHistory__thAction">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ fmtDateTime(row.createdAt) }}</td>
              <td class="orderHistory__mono">{{ row.orderNo }}</td>
              <td>NT$ {{ Number(row.totalAmount || 0).toLocaleString() }}</td>
              <td>{{ row.payMethodName || '-' }}</td>
              <td>
                <span
                  class="orderHistory__badge"
                  :class="badgeClass(row.shippingStatus)"
                >
                  {{ row.shippingStatusName || row.shippingStatus || '-' }}
                </span>
              </td>
              <td class="orderHistory__tdAction">
                <button
                  class="orderHistory__linkBtn"
                  type="button"
                  @click="goDetail(row.id)"
                >
                  查看
                </button>
              </td>
            </tr>

            <tr v-if="pageRows.length === 0">
              <td class="orderHistory__empty" colspan="6">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="orderHistory__cards">
        <div v-for="row in pageRows" :key="row.id" class="orderHistory__item">
          <div class="orderHistory__itemTop">
            <span
              class="orderHistory__badge"
              :class="badgeClass(row.shippingStatus)"
            >
              {{ row.shippingStatusName || row.shippingStatus || '-' }}
            </span>
            <span class="orderHistory__date">{{
              fmtDateTime(row.createdAt)
            }}</span>
          </div>

          <div class="orderHistory__itemBody">
            <p class="orderHistory__row">
              <span class="orderHistory__k">訂單號</span>
              <span class="orderHistory__v orderHistory__mono">{{
                row.orderNo
              }}</span>
            </p>
            <p class="orderHistory__row">
              <span class="orderHistory__k">金額</span>
              <span class="orderHistory__v"
                >NT$ {{ Number(row.totalAmount || 0).toLocaleString() }}</span
              >
            </p>
            <p class="orderHistory__row">
              <span class="orderHistory__k">付款方式</span>
              <span class="orderHistory__v">{{
                row.payMethodName || '-'
              }}</span>
            </p>

            <div class="orderHistory__mobileAction">
              <button
                class="orderHistory__linkBtn"
                type="button"
                @click="goDetail(row.id)"
              >
                查看訂單
              </button>
            </div>
          </div>
        </div>

        <div v-if="pageRows.length === 0" class="orderHistory__emptyCard">
          查無資料
        </div>
      </div>

      <!-- 分頁：前端分頁 -->
      <div class="orderHistory__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BasePagination from '@/components/common/BasePagination.vue';
import { getMyOrders } from '@/services/orderService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();

const pageSize = 8;
const page = ref(1);

// 全部 any（照你需求）
const createdAtStart = ref<any>('');
const createdAtEnd = ref<any>('');
const shippingStatus = ref<any>('');
const orderNo = ref<any>('');

// API rows
const rows = ref<any[]>([]);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(rows.value.length / pageSize)),
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return rows.value.slice(start, start + pageSize);
});

watch([createdAtStart, createdAtEnd, shippingStatus, orderNo], () => {
  page.value = 1;
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

// 日期格式：2026-02-09T01:54:29 -> 2026-02-09 01:54
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

// 依你後端回傳欄位 mapping
const normalizeOrders = (raw: any): any[] => {
  const data = raw?.data?.data ?? raw?.data ?? raw;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.list)
      ? data.list
      : [];

  return list.map((o: any, idx: number) => ({
    id: String(o?.id ?? idx),
    orderNo: String(o?.orderNo ?? ''),
    totalAmount: Number(o?.totalAmount ?? 0) || 0,
    createdAt: String(o?.createdAt ?? ''),
    shippingStatus: String(o?.shippingStatus ?? ''),
    shippingStatusName: String(o?.shippingStatusName ?? ''),
    // 後端沒給付款方式：先留欄位避免 template 爆
    payMethodName: String(o?.payMethodName ?? o?.paymentMethodName ?? ''),
  }));
};

// req input 直接對後端 condition
const buildReq = (): any => {
  const condition: any = {};
  if (createdAtStart.value) condition.createdAtStart = createdAtStart.value;
  if (createdAtEnd.value) condition.createdAtEnd = createdAtEnd.value;
  if (orderNo.value) condition.orderNo = String(orderNo.value).trim();
  if (shippingStatus.value) condition.shippingStatus = shippingStatus.value;
  return { condition };
};

const loadOrders = async () => {
  await executeApi<any>({
    fn: () => getMyOrders(buildReq()),
    onSuccess: (raw) => {
      rows.value = normalizeOrders(raw);
    },
  });
};

const onSearch = async () => {
  page.value = 1;
  await loadOrders();
};

const onReset = async () => {
  createdAtStart.value = '';
  createdAtEnd.value = '';
  shippingStatus.value = '';
  orderNo.value = '';
  page.value = 1;
  await loadOrders();
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

const goDetail = (orderId: any) => {
  router.push({ name: 'OrderDetail', params: { orderId } });
};

onMounted(loadOrders);
</script>

<style scoped lang="scss">
.orderHistory {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 16px;
  }
  &__title {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 6px;
  }
  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
    margin-top: 12px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 820px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 520px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__label {
    display: block;
    font-size: 13px;
    opacity: 0.75;
    margin-bottom: 6px;
  }

  &__input {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 11px 12px;
    outline: none;
    background: #fff;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  &__btn {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 800;
    cursor: pointer;
    background: #111;
    color: #fff;

    &--ghost {
      background: transparent;
      color: #111;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }
  }

  &__resultHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__count {
    margin: 0;
    opacity: 0.8;
  }

  &__tableWrap {
    overflow-x: auto;

    @media (max-width: 720px) {
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
    }

    th {
      opacity: 0.75;
      font-weight: 800;
    }
  }

  &__thAction {
    text-align: right;
  }
  &__tdAction {
    text-align: right;
  }

  &__linkBtn {
    border: 1px solid rgba(0, 0, 0, 0.14);
    background: #fff;
    border-radius: 10px;
    padding: 8px 10px;
    font-weight: 900;
    cursor: pointer;
  }

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 13px;
  }

  &__empty {
    text-align: center;
    padding: 22px 10px;
    opacity: 0.65;
  }

  &__cards {
    display: none;
    gap: 10px;

    @media (max-width: 720px) {
      display: grid;
    }
  }

  &__item {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 12px;
  }

  &__itemTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__date {
    font-size: 13px;
    opacity: 0.75;
  }

  &__itemBody {
    display: grid;
    gap: 8px;
  }

  &__row {
    margin: 0;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  &__k {
    opacity: 0.7;
    font-size: 13px;
  }

  &__v {
    font-weight: 800;
  }

  &__mobileAction {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }

  &__emptyCard {
    border: 1px dashed rgba(0, 0, 0, 0.15);
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    opacity: 0.65;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  &__pagination {
    margin-top: 14px;
  }
}
</style>
