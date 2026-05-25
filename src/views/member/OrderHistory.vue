<!-- src/views/member/OrderHistory.vue -->
<template>
  <section class="orderHistory">
    <!-- 頂部主視覺 -->
    <div class="orderHistory__hero">
      <div class="orderHistory__heroBg"></div>

      <div class="orderHistory__heroTop">
        <div>
          <p class="orderHistory__badge">ORDER HISTORY</p>
          <h1 class="orderHistory__title">訂單紀錄</h1>
          <p class="orderHistory__subtitle">
            查詢你的訂單明細、付款方式與配送狀態。
          </p>
        </div>

        <div class="orderHistory__heroCount">
          <span>共</span>
          <strong>{{ total }}</strong>
          <span>筆</span>
        </div>
      </div>
    </div>

    <!-- 查詢條件 -->
    <div class="orderHistory__section">
      <div class="orderHistory__sectionHead">
        <div>
          <p class="orderHistory__sectionKicker">SEARCH FILTER</p>
          <h2 class="orderHistory__sectionTitle">查詢條件</h2>
        </div>
      </div>

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
            class="orderHistory__actionBtn orderHistory__actionBtn--ghost"
            type="button"
            @click="onReset"
          >
            重設
          </button>

          <button class="orderHistory__actionBtn" type="submit">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            查詢
          </button>
        </div>
      </form>
    </div>

    <!-- 結果 -->
    <div class="orderHistory__section">
      <div class="orderHistory__sectionHead">
        <div>
          <p class="orderHistory__sectionKicker">ORDER LIST</p>
          <h2 class="orderHistory__sectionTitle">訂單列表</h2>
        </div>

        <p class="orderHistory__count">
          共 <b>{{ total }}</b> 筆
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
              <th>轉帳帳號</th>
              <th>狀態</th>
              <th class="orderHistory__thAction">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ fmtDateTime(row.createdAt) }}</td>

              <td>
                <span class="orderHistory__mono">
                  {{ row.orderNo }}
                </span>
              </td>

              <td class="orderHistory__amount">
                NT$ {{ Number(row.totalAmount || 0).toLocaleString() }}
              </td>

              <td>{{ row.payMethodName || '-' }}</td>

              <td>
                <span v-if="row.virtualAccount" class="orderHistory__mono">
                  {{ row.virtualAccount }}
                </span>
                <span v-else>-</span>
              </td>

              <td>
                <span
                  class="orderHistory__statusBadge"
                  :class="badgeClass(row.shippingStatus)"
                >
                  {{ row.shippingStatusName || row.shippingStatus || '-' }}
                </span>
              </td>

              <td class="orderHistory__tdAction">
                <button
                  class="orderHistory__detailBtn"
                  type="button"
                  @click="goDetail(row.id)"
                >
                  查看
                </button>
              </td>
            </tr>

            <tr v-if="pageRows.length === 0">
              <td class="orderHistory__empty" colspan="7">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="orderHistory__cards">
        <article
          v-for="row in pageRows"
          :key="row.id"
          class="orderHistory__item"
        >
          <div class="orderHistory__itemTop">
            <span
              class="orderHistory__statusBadge"
              :class="badgeClass(row.shippingStatus)"
            >
              {{ row.shippingStatusName || row.shippingStatus || '-' }}
            </span>

            <span class="orderHistory__date">
              {{ fmtDateTime(row.createdAt) }}
            </span>
          </div>

          <div class="orderHistory__orderNoBox">
            <span>訂單號</span>
            <strong class="orderHistory__mono">{{ row.orderNo }}</strong>
          </div>

          <div class="orderHistory__itemBody">
            <p class="orderHistory__row">
              <span class="orderHistory__k">金額</span>
              <span class="orderHistory__v orderHistory__v--amount">
                NT$ {{ Number(row.totalAmount || 0).toLocaleString() }}
              </span>
            </p>

            <p class="orderHistory__row">
              <span class="orderHistory__k">付款方式</span>
              <span class="orderHistory__v">
                {{ row.payMethodName || '-' }}
              </span>
            </p>

            <p v-if="row.virtualAccount" class="orderHistory__row">
              <span class="orderHistory__k">轉帳帳號</span>
              <span class="orderHistory__v orderHistory__mono">
                {{ row.virtualAccount }}
              </span>
            </p>
          </div>

          <button
            class="orderHistory__mobileDetailBtn"
            type="button"
            @click="goDetail(row.id)"
          >
            查看訂單
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </article>

        <div v-if="pageRows.length === 0" class="orderHistory__emptyCard">
          <font-awesome-icon :icon="['fas', 'box-open']" />
          <p>查無資料</p>
          <span>可以調整查詢條件再試一次。</span>
        </div>
      </div>

      <!-- 分頁 -->
      <div class="orderHistory__pagination">
        <BasePagination
          v-model:page="page"
          :total="total"
          :size="size"
          :total-pages="totalPages"
          :has-next="hasNext"
          :has-previous="hasPrevious"
          :max-visible="5"
          @update:page="goToPage"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BasePagination from '@/components/common/BasePagination.vue';
import { getMyOrders, type OrderListRow } from '@/services/orderService';
import { executeApi } from '@/utils/executeApiUtils';
import { useServerPagination } from '@/composables/useServerPagination';
import { formatDateTime as formatDateTimeUtil } from '@/utils/DateUtils';

const router = useRouter();

const { page, size, total, totalPages, hasNext, hasPrevious, sync } =
  useServerPagination(8);

const createdAtStart = ref<any>('');
const createdAtEnd = ref<any>('');
const shippingStatus = ref<any>('');
const orderNo = ref<any>('');

const rows = ref<OrderListRow[]>([]);
const pageRows = computed(() => rows.value);

watch([createdAtStart, createdAtEnd, shippingStatus, orderNo], () => {
  page.value = 1;
});

const fmtDateTime = (v: any) => {
  const s = String(v || '');
  if (!s) return '-';
  return formatDateTimeUtil(s, 'YYYY-MM-DD HH:mm') || s;
};

const normalizeOrders = (list: any[]): OrderListRow[] =>
  list.map((o: any, idx: number) => ({
    id: String(o?.id ?? idx),
    orderNo: String(o?.orderNo ?? ''),
    totalAmount: Number(o?.totalAmount ?? 0) || 0,
    createdAt: String(o?.createdAt ?? ''),
    shippingStatus: String(o?.shippingStatus ?? ''),
    shippingStatusName: String(o?.shippingStatusName ?? ''),
    payMethodName: String(o?.payMethodName ?? o?.paymentMethodName ?? ''),
    virtualAccount: o?.virtualAccount ?? null,
    paymentInfo: o?.paymentInfo ?? null,
    limitDate: o?.limitDate ?? null,
  }));

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
    fn: () =>
      getMyOrders({
        ...buildReq(),
        page: page.value,
        size: size.value,
      }),
    onSuccess: (res) => {
      rows.value = normalizeOrders(res?.data ?? []);
      sync(res);
    },
  });
};

const goToPage = () => {
  loadOrders();
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

  &__heroCount {
    min-width: 86px;
    min-height: 64px;
    padding: 10px 12px;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(12px);

    span {
      color: rgba(255, 255, 255, 0.75);
      font-size: 12px;
      font-weight: 800;
    }

    strong {
      color: #fff;
      font-size: 22px;
      line-height: 1.1;
      font-weight: 950;
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

  &__form {
    display: grid;
    gap: 14px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  &__field {
    min-width: 0;
  }

  &__label {
    display: block;
    margin-bottom: 7px;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 900;
  }

  &__input {
    width: 100%;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);
    color: var(--text);
    outline: none;

    font-size: 14px;
    font-weight: 800;

    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;

    &::placeholder {
      color: rgba(32, 23, 19, 0.34);
    }

    &:focus {
      background: #fff;
      border-color: rgba(180, 51, 37, 0.5);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 4px;
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
      box-shadow 0.16s ease,
      background 0.16s ease,
      border-color 0.16s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
    }

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
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

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 13px;
    word-break: break-all;
  }

  &__detailBtn {
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

  &__statusBadge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;

    background: rgba(32, 23, 19, 0.06);
    color: rgba(32, 23, 19, 0.7);
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

  &__date {
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  &__orderNoBox {
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
    }
  }

  &__itemBody {
    display: grid;
    gap: 9px;
  }

  &__row {
    margin: 0;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  &__k {
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 800;
  }

  &__v {
    color: var(--text);
    font-size: 13px;
    font-weight: 950;
    text-align: right;

    &--amount {
      color: var(--primary);
      font-size: 15px;
    }
  }

  &__mobileDetailBtn {
    width: 100%;
    min-height: 46px;
    margin-top: 14px;
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

  &__pagination {
    margin-top: 16px;
  }

  @media (max-width: 900px) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
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
    & {
      padding-bottom: 20px;
    }

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

    &__heroCount {
      min-width: 68px;
      min-height: 58px;
      border-radius: 18px;

      strong {
        font-size: 20px;
      }
    }

    &__section {
      border-radius: 22px;
      padding: 15px;
      margin-top: 14px;
    }

    &__sectionHead {
      align-items: flex-start;
    }

    &__sectionTitle {
      font-size: 18px;
    }

    &__count {
      display: none;
    }

    &__grid {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    &__input {
      min-height: 48px;
    }

    &__actions {
      flex-direction: column-reverse;
    }

    &__actionBtn {
      width: 100%;
      min-height: 48px;
    }

    &__itemTop {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    &__date {
      white-space: normal;
    }

    &__row {
      align-items: flex-start;
    }
  }
}
</style>
