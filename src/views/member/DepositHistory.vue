<!-- src/views/member/DepositHistory.vue -->
<template>
  <section class="depositHistory">
    <header class="depositHistory__header">
      <h1 class="depositHistory__title">儲值紀錄</h1>
      <p class="depositHistory__subtitle">查詢你的儲值訂單與付款狀態</p>
    </header>

    <!-- 查詢條件 -->
    <div class="depositHistory__card">
      <form class="depositHistory__form" @submit.prevent="onSearch">
        <div class="depositHistory__grid">
          <div class="depositHistory__field">
            <label class="depositHistory__label">起始日期</label>
            <input
              class="depositHistory__input"
              type="date"
              v-model="createdAtStart"
            />
          </div>

          <div class="depositHistory__field">
            <label class="depositHistory__label">結束日期</label>
            <input
              class="depositHistory__input"
              type="date"
              v-model="createdAtEnd"
            />
          </div>

          <div class="depositHistory__field">
            <label class="depositHistory__label">狀態</label>
            <select class="depositHistory__input" v-model="paymentStatus">
              <option value="">全部</option>
              <option value="COMPLETED">已完成</option>
              <option value="PENDING">待付款</option>
              <option value="FAILED">失敗</option>
              <option value="CANCELED">已取消</option>
            </select>
          </div>

          <div class="depositHistory__field">
            <label class="depositHistory__label">交易號</label>
            <input
              class="depositHistory__input"
              type="text"
              placeholder="輸入交易號關鍵字"
              v-model.trim="transactionId"
            />
          </div>
        </div>

        <div class="depositHistory__actions">
          <button
            class="depositHistory__btn depositHistory__btn--ghost"
            type="button"
            @click="onReset"
          >
            重設
          </button>
          <button class="depositHistory__btn" type="submit">查詢</button>
        </div>
      </form>
    </div>

    <!-- 結果 -->
    <div class="depositHistory__card">
      <div class="depositHistory__resultHeader">
        <p class="depositHistory__count">
          共 <b>{{ filteredRows.length }}</b> 筆
        </p>
      </div>

      <!-- Desktop Table -->
      <div class="depositHistory__tableWrap">
        <table class="depositHistory__table">
          <thead>
            <tr>
              <th>建立時間</th>
              <th>交易號</th>
              <th>金額</th>
              <th>代幣</th>
              <th>紅利</th>
              <th>付款方式</th>
              <th>狀態</th>
              <th>付款時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ formatDateTime(row.createdAt) }}</td>
              <td class="depositHistory__mono">
                {{ row.transactionId || '-' }}
              </td>
              <td>NT$ {{ row.amount.toLocaleString() }}</td>
              <td>{{ row.goldCoins.toLocaleString() }}</td>
              <td>{{ row.bonusCoins.toLocaleString() }}</td>
              <td>{{ payLabel(row.paymentMethod) }}</td>
              <td>
                <span
                  class="depositHistory__badge"
                  :class="badgeClass(row.paymentStatus)"
                >
                  {{ statusLabel(row.paymentStatus) }}
                </span>
              </td>
              <td>{{ row.paidAt ? formatDateTime(row.paidAt) : '-' }}</td>
            </tr>

            <tr v-if="pageRows.length === 0">
              <td class="depositHistory__empty" colspan="8">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="depositHistory__cards">
        <div v-for="row in pageRows" :key="row.id" class="depositHistory__item">
          <div class="depositHistory__itemTop">
            <span
              class="depositHistory__badge"
              :class="badgeClass(row.paymentStatus)"
            >
              {{ statusLabel(row.paymentStatus) }}
            </span>
            <span class="depositHistory__date">
              {{ formatDateTime(row.createdAt) }}
            </span>
          </div>

          <div class="depositHistory__itemBody">
            <p class="depositHistory__row">
              <span class="depositHistory__k">交易號</span>
              <span class="depositHistory__v depositHistory__mono">{{
                row.transactionId || '-'
              }}</span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">金額</span>
              <span class="depositHistory__v"
                >NT$ {{ row.amount.toLocaleString() }}</span
              >
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">代幣</span>
              <span class="depositHistory__v">{{
                row.goldCoins.toLocaleString()
              }}</span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">紅利</span>
              <span class="depositHistory__v">{{
                row.bonusCoins.toLocaleString()
              }}</span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">付款方式</span>
              <span class="depositHistory__v">{{
                payLabel(row.paymentMethod)
              }}</span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">付款時間</span>
              <span class="depositHistory__v">{{
                row.paidAt ? formatDateTime(row.paidAt) : '-'
              }}</span>
            </p>
          </div>
        </div>

        <div v-if="pageRows.length === 0" class="depositHistory__emptyCard">
          查無資料
        </div>
      </div>

      <!--  分頁：使用 BasePagination -->
      <div class="depositHistory__pagination">
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
import BasePagination from '@/components/common/BasePagination.vue';
import { getMyRechargeHistory } from '@/services/rechargeService';
import { executeApi } from '@/utils/executeApiUtils';

type PayMethod = 'CREDIT_CARD' | 'ATM' | 'CVS';
type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELED';

type DepositHistoryRow = {
  id: string;
  planId: string;

  amount: number;
  goldCoins: number;
  bonusCoins: number;

  paymentMethod: PayMethod;
  paymentStatus: PaymentStatus;

  transactionId: string;
  createdAt: string; // ISO
  paidAt?: string; // ISO
};

const pageSize = 8;
const page = ref(1);

// filters
const createdAtStart = ref('');
const createdAtEnd = ref('');
const paymentStatus = ref<PaymentStatus | ''>('');
const transactionId = ref('');

// data
const rows = ref<DepositHistoryRow[]>([]);

const filteredRows = computed(() => {
  const from = createdAtStart.value
    ? new Date(createdAtStart.value).getTime()
    : null;
  const to = createdAtEnd.value ? new Date(createdAtEnd.value).getTime() : null;

  const kw = transactionId.value.trim().toLowerCase();

  return rows.value
    .filter((r) => {
      const t = r.createdAt ? new Date(r.createdAt).getTime() : 0;

      const okFrom = from == null ? true : t >= from;
      const okTo = to == null ? true : t <= to;
      const okStatus = paymentStatus.value
        ? r.paymentStatus === paymentStatus.value
        : true;

      const okKeyword = kw
        ? (r.transactionId || '').toLowerCase().includes(kw)
        : true;

      return okFrom && okTo && okStatus && okKeyword;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

watch([createdAtStart, createdAtEnd, paymentStatus, transactionId], () => {
  page.value = 1;
});

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const normalizeRechargeHistory = (raw: any): DepositHistoryRow[] => {
  const data = raw?.data?.data ?? raw?.data ?? raw;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.list)
      ? data.list
      : [];

  return list.map((o: any, idx: number) => ({
    id: String(o.id ?? idx),
    planId: String(o.planId ?? ''),

    amount: Number(o.amount ?? 0) || 0,
    goldCoins: Number(o.goldCoins ?? 0) || 0,
    bonusCoins: Number(o.bonusCoins ?? 0) || 0,

    paymentMethod: (o.paymentMethod ?? 'CREDIT_CARD') as PayMethod,
    paymentStatus: (o.paymentStatus ?? 'PENDING') as PaymentStatus,

    transactionId: String(o.transactionId ?? ''),
    createdAt: String(o.createdAt ?? ''),
    paidAt: o.paidAt ? String(o.paidAt) : undefined,
  }));
};

const loadHistory = async () => {
  await executeApi<any>({
    // 你後端：GET /recharge/history?page=&size=
    fn: () => getMyRechargeHistory({ page: 1, size: 1000 } as any),
    onSuccess: (raw) => {
      rows.value = normalizeRechargeHistory(raw);
    },
  });
};

const onSearch = async () => {
  page.value = 1;
  await loadHistory();
};

const onReset = async () => {
  createdAtStart.value = '';
  createdAtEnd.value = '';
  paymentStatus.value = '';
  transactionId.value = '';
  page.value = 1;
  await loadHistory();
};

const payLabel = (m: PayMethod) => {
  if (m === 'CREDIT_CARD') return '信用卡';
  if (m === 'ATM') return 'ATM 轉帳';
  return '超商代碼';
};

const statusLabel = (s: PaymentStatus) => {
  if (s === 'COMPLETED') return '已完成';
  if (s === 'PENDING') return '待付款';
  if (s === 'FAILED') return '失敗';
  return '已取消';
};

const badgeClass = (s: PaymentStatus) => ({
  'is-paid': s === 'COMPLETED',
  'is-pending': s === 'PENDING',
  'is-failed': s === 'FAILED',
  'is-canceled': s === 'CANCELED',
});

const formatDateTime = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

onMounted(loadHistory);
</script>

<style scoped lang="scss">
.depositHistory {
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
