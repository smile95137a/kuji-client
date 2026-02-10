<!-- src/views/member/TransactionHistory.vue -->
<template>
  <section class="transactionHistory">
    <header class="transactionHistory__header">
      <h1 class="transactionHistory__title">消費紀錄</h1>
      <p class="transactionHistory__subtitle">查詢你的消費訂單與交易明細</p>
    </header>

    <!-- 查詢條件 -->
    <div class="transactionHistory__card">
      <form class="transactionHistory__form" @submit.prevent="onSearch">
        <div class="transactionHistory__grid">
          <div class="transactionHistory__field">
            <label class="transactionHistory__label">起始日期</label>
            <input
              class="transactionHistory__input"
              type="date"
              v-model="dateFrom"
            />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">結束日期</label>
            <input
              class="transactionHistory__input"
              type="date"
              v-model="dateTo"
            />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">類型</label>
            <select class="transactionHistory__input" v-model="type">
              <option value="">全部</option>
              <option value="LOTTERY_DRAW">抽獎消費</option>
              <option value="PRIZE_RECYCLE">回收獎品</option>
              <option value="RECHARGE">儲值</option>
              <option value="ADMIN_ADJUSTMENT">系統調整</option>
              <option value="REFERRAL_BONUS">推薦獎勵</option>
              <option value="SYSTEM_REWARD">系統獎勵</option>
            </select>
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">狀態</label>
            <select class="transactionHistory__input" v-model="status">
              <option value="">全部</option>
              <option value="SUCCESS">成功</option>
              <option value="PENDING">處理中</option>
              <option value="FAILED">失敗</option>
              <option value="CANCELED">已取消</option>
            </select>
          </div>

          <div
            class="transactionHistory__field transactionHistory__field--full"
          >
            <label class="transactionHistory__label"
              >關鍵字（訂單號 / 交易號）</label
            >
            <input
              class="transactionHistory__input"
              type="text"
              placeholder="例如 ORD202601120001 / TX202601120001"
              v-model.trim="keyword"
            />
          </div>
        </div>

        <div class="transactionHistory__actions">
          <button
            class="transactionHistory__btn transactionHistory__btn--ghost"
            type="button"
            @click="onReset"
          >
            重設
          </button>
          <button class="transactionHistory__btn" type="submit">查詢</button>
        </div>
      </form>
    </div>

    <!-- 結果 -->
    <div class="transactionHistory__card">
      <div class="transactionHistory__resultHeader">
        <p class="transactionHistory__count">
          共 <b>{{ filteredRows.length }}</b> 筆
        </p>

        <p class="transactionHistory__sum">
          本頁合計：<b>NT$ {{ pageSum.toLocaleString() }}</b>
        </p>
      </div>

      <!-- Desktop Table -->
      <div class="transactionHistory__tableWrap">
        <table class="transactionHistory__table">
          <thead>
            <tr>
              <th>日期</th>
              <th>交易號</th>
              <th>訂單號</th>
              <th>類型</th>
              <th>金額</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ row.createdAt }}</td>
              <td class="transactionHistory__mono">{{ row.txNo }}</td>
              <td class="transactionHistory__mono">{{ row.orderNo || '-' }}</td>
              <td>{{ typeLabel(row.type) }}</td>
              <td>
                <span
                  :class="{ 'transactionHistory__money--neg': row.amount < 0 }"
                >
                  {{ moneyText(row.amount) }}
                </span>
              </td>
              <td>
                <span
                  class="transactionHistory__badge"
                  :class="badgeClass(row.status)"
                >
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="transactionHistory__right">
                <button
                  class="transactionHistory__link"
                  type="button"
                  @click="openDetail(row)"
                >
                  明細
                </button>
              </td>
            </tr>

            <tr v-if="pageRows.length === 0">
              <td class="transactionHistory__empty" colspan="7">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="transactionHistory__cards">
        <div
          v-for="row in pageRows"
          :key="row.id"
          class="transactionHistory__item"
        >
          <div class="transactionHistory__itemTop">
            <span
              class="transactionHistory__badge"
              :class="badgeClass(row.status)"
            >
              {{ statusLabel(row.status) }}
            </span>
            <span class="transactionHistory__date">{{ row.createdAt }}</span>
          </div>

          <div class="transactionHistory__itemBody">
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">交易號</span>
              <span class="transactionHistory__v transactionHistory__mono">{{
                row.txNo
              }}</span>
            </p>
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">訂單號</span>
              <span class="transactionHistory__v transactionHistory__mono">{{
                row.orderNo || '-'
              }}</span>
            </p>
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">類型</span>
              <span class="transactionHistory__v">{{
                typeLabel(row.type)
              }}</span>
            </p>
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">金額</span>
              <span
                class="transactionHistory__v"
                :class="{ 'transactionHistory__money--neg': row.amount < 0 }"
              >
                {{ moneyText(row.amount) }}
              </span>
            </p>

            <button
              class="transactionHistory__link transactionHistory__link--full"
              type="button"
              @click="openDetail(row)"
            >
              查看明細
            </button>
          </div>
        </div>

        <div v-if="pageRows.length === 0" class="transactionHistory__emptyCard">
          查無資料
        </div>
      </div>

      <!-- ✅ 分頁：使用 BasePagination -->
      <div class="transactionHistory__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <!-- 明細 Dialog（簡易版） -->
    <div
      v-if="detailOpen"
      class="transactionHistory__overlay"
      @click.self="detailOpen = false"
    >
      <div class="transactionHistory__dialog">
        <div class="transactionHistory__dialogHeader">
          <p class="transactionHistory__dialogTitle">交易明細</p>
          <button
            class="transactionHistory__dialogClose"
            type="button"
            @click="detailOpen = false"
          >
            ✕
          </button>
        </div>

        <div v-if="selected" class="transactionHistory__dialogBody">
          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">日期</span>
            <span class="transactionHistory__v">{{ selected.createdAt }}</span>
          </div>
          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">交易號</span>
            <span class="transactionHistory__v transactionHistory__mono">{{
              selected.txNo
            }}</span>
          </div>
          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">訂單號</span>
            <span class="transactionHistory__v transactionHistory__mono">{{
              selected.orderNo || '-'
            }}</span>
          </div>
          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">類型</span>
            <span class="transactionHistory__v">{{
              typeLabel(selected.type)
            }}</span>
          </div>
          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">金額</span>
            <span
              class="transactionHistory__v"
              :class="{ 'transactionHistory__money--neg': selected.amount < 0 }"
            >
              {{ moneyText(selected.amount) }}
            </span>
          </div>
          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">狀態</span>
            <span class="transactionHistory__v">
              <span
                class="transactionHistory__badge"
                :class="badgeClass(selected.status)"
              >
                {{ statusLabel(selected.status) }}
              </span>
            </span>
          </div>

          <div class="transactionHistory__kv transactionHistory__kv--full">
            <span class="transactionHistory__k">描述</span>
            <span class="transactionHistory__v">{{
              selected.description
            }}</span>
          </div>
        </div>

        <div class="transactionHistory__dialogFooter">
          <button
            class="transactionHistory__btn transactionHistory__btn--ghost"
            type="button"
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
import { computed, ref, watch, onMounted } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';
import { getMyWalletTransactions } from '@/services/walletService';

type TxType = 'LOTTERY_DRAW' | 'PRIZE_RECYCLE' | 'RECHARGE' | 'ADMIN_ADJUSTMENT' | 'REFERRAL_BONUS' | 'SYSTEM_REWARD' | string;
type TxStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELED' | string;

type TransactionRow = {
  id: string;
  createdAt: string;
  txNo: string;
  orderNo?: string;
  type: TxType;
  amount: number;
  balanceAfter?: number;
  status: TxStatus;
  description: string;
};

const pageSize = 10;
const page = ref(1);

const dateFrom = ref('');
const dateTo = ref('');
const type = ref<TxType | ''>('');
const status = ref<TxStatus | ''>('');
const keyword = ref('');

const loading = ref(false);
const rows = ref<TransactionRow[]>([]);

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const loadTransactions = async () => {
  loading.value = true;
  try {
    const condition: any = {};
    if (type.value) condition.transactionType = type.value;
    if (dateFrom.value) condition.startDate = `${dateFrom.value}T00:00:00`;
    if (dateTo.value) condition.endDate = `${dateTo.value}T23:59:59`;

    const res = await getMyWalletTransactions({
      condition,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });

    if (res.success && Array.isArray(res.data)) {
      rows.value = res.data.map((t: any) => ({
        id: String(t.id || ''),
        createdAt: formatDate(t.createdAt),
        txNo: t.id || '',
        orderNo: t.relatedId || t.orderId || t.orderNo || undefined,
        type: t.transactionType || 'LOTTERY_DRAW',
        amount: Number(t.amount ?? 0),
        balanceAfter: t.balanceAfter ? Number(t.balanceAfter) : undefined,
        status: 'SUCCESS', // 錢包交易通常都是成功的
        description: t.description || '',
      }));
    }
  } catch (e) {
    console.error('TransactionHistory - loadTransactions error:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTransactions();
});

const filteredRows = computed(() => {
  const from = dateFrom.value ? new Date(dateFrom.value).getTime() : null;
  const to = dateTo.value ? new Date(dateTo.value).getTime() : null;

  return rows.value
    .filter((r) => {
      const t = new Date(r.createdAt).getTime();

      const okFrom = from == null ? true : t >= from;
      const okTo = to == null ? true : t <= to;
      const okType = type.value ? r.type === type.value : true;
      const okStatus = status.value ? r.status === status.value : true;
      const kw = keyword.value.toLowerCase();
      const okKeyword = kw
        ? r.txNo.toLowerCase().includes(kw) ||
          (r.orderNo || '').toLowerCase().includes(kw)
        : true;

      return okFrom && okTo && okType && okStatus && okKeyword;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize))
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

const pageSum = computed(() =>
  pageRows.value.reduce((sum, r) => sum + r.amount, 0)
);

// 條件變動時回第一頁
watch([dateFrom, dateTo, type, status, keyword], () => {
  page.value = 1;
});

// totalPages 變動時，確保 page 不超界
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const onSearch = () => {
  // 使用日期和類型篩選重新呼叫 API
  page.value = 1;
  loadTransactions();
};

const onReset = () => {
  dateFrom.value = '';
  dateTo.value = '';
  type.value = '';
  status.value = '';
  keyword.value = '';
  page.value = 1;
  loadTransactions();
};

const typeLabel = (t: TxType) => {
  if (t === 'LOTTERY_DRAW') return '抽獎消費';
  if (t === 'PRIZE_RECYCLE') return '回收獎品';
  if (t === 'RECHARGE') return '儲值';
  if (t === 'ADMIN_ADJUSTMENT') return '系統調整';
  if (t === 'REFERRAL_BONUS') return '推薦獎勵';
  if (t === 'SYSTEM_REWARD') return '系統獎勵';
  return t; // 回傳原始值作為備用
};

const statusLabel = (s: TxStatus) => {
  if (s === 'SUCCESS') return '成功';
  if (s === 'PENDING') return '處理中';
  if (s === 'FAILED') return '失敗';
  return '已取消';
};

const badgeClass = (s: TxStatus) => ({
  'is-success': s === 'SUCCESS',
  'is-pending': s === 'PENDING',
  'is-failed': s === 'FAILED',
  'is-canceled': s === 'CANCELED',
});

const moneyText = (amt: number) => {
  const sign = amt < 0 ? '-' : '';
  return `${sign}NT$ ${Math.abs(amt).toLocaleString()}`;
};

// Detail dialog
const detailOpen = ref(false);
const selected = ref<TransactionRow | null>(null);

const openDetail = (row: TransactionRow) => {
  selected.value = row;
  detailOpen.value = true;
};
</script>

<style scoped lang="scss">
.transactionHistory {
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

    @media (max-width: 880px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 520px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__field--full {
    grid-column: 1 / -1;
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
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;

    @media (max-width: 520px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__count,
  &__sum {
    margin: 0;
    opacity: 0.85;
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
    }

    th {
      opacity: 0.75;
      font-weight: 800;
    }
  }

  &__mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 13px;
  }

  &__right {
    text-align: right;
  }

  &__link {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-weight: 900;
    padding: 6px 8px;

    &--full {
      width: 100%;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      padding: 10px 12px;
      margin-top: 8px;
    }
  }

  &__money--neg {
    opacity: 0.9;
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

    &.is-success {
      background: #e8f5e9;
      color: #4caf50;
      border-color: #4caf50;
    }
    &.is-pending {
      background: #fff8e1;
      color: #f59e0b;
      border-color: #f59e0b;
    }
    &.is-failed {
      background: #fce4ec;
      color: #e53935;
      border-color: #e53935;
    }
    &.is-canceled {
      background: #f5f5f5;
      color: #9e9e9e;
      border-color: #bdbdbd;
    }
  }

  &__pagination {
    margin-top: 14px;
  }

  /* Dialog */
  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    z-index: 50;
  }

  &__dialog {
    width: min(560px, 100%);
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  &__dialogHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__dialogTitle {
    margin: 0;
    font-weight: 900;
  }

  &__dialogClose {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    padding: 6px 8px;
  }

  &__dialogBody {
    padding: 14px;
    display: grid;
    gap: 10px;
  }

  &__kv {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 10px;
    align-items: baseline;
  }

  &__kv--full {
    grid-template-columns: 120px 1fr;
  }

  &__dialogFooter {
    padding: 12px 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: flex-end;
  }
}
</style>
