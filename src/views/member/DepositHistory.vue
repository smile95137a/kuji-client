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
              v-model="dateFrom"
            />
          </div>

          <div class="depositHistory__field">
            <label class="depositHistory__label">結束日期</label>
            <input class="depositHistory__input" type="date" v-model="dateTo" />
          </div>

          <div class="depositHistory__field">
            <label class="depositHistory__label">狀態</label>
            <select class="depositHistory__input" v-model="status">
              <option value="">全部</option>
              <option value="PAID">已付款</option>
              <option value="PENDING">待付款</option>
              <option value="FAILED">失敗</option>
              <option value="CANCELED">已取消</option>
            </select>
          </div>

          <div class="depositHistory__field">
            <label class="depositHistory__label">訂單號</label>
            <input
              class="depositHistory__input"
              type="text"
              placeholder="輸入訂單號關鍵字"
              v-model.trim="keyword"
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
              <th>日期</th>
              <th>訂單號</th>
              <th>金額</th>
              <th>付款方式</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ row.createdAt }}</td>
              <td class="depositHistory__mono">{{ row.orderNo }}</td>
              <td>NT$ {{ row.amount.toLocaleString() }}</td>
              <td>{{ payLabel(row.payMethod) }}</td>
              <td>
                <span
                  class="depositHistory__badge"
                  :class="badgeClass(row.status)"
                >
                  {{ statusLabel(row.status) }}
                </span>
              </td>
            </tr>

            <tr v-if="pageRows.length === 0">
              <td class="depositHistory__empty" colspan="5">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="depositHistory__cards">
        <div v-for="row in pageRows" :key="row.id" class="depositHistory__item">
          <div class="depositHistory__itemTop">
            <span class="depositHistory__badge" :class="badgeClass(row.status)">
              {{ statusLabel(row.status) }}
            </span>
            <span class="depositHistory__date">{{ row.createdAt }}</span>
          </div>

          <div class="depositHistory__itemBody">
            <p class="depositHistory__row">
              <span class="depositHistory__k">訂單號</span>
              <span class="depositHistory__v depositHistory__mono">{{
                row.orderNo
              }}</span>
            </p>
            <p class="depositHistory__row">
              <span class="depositHistory__k">金額</span>
              <span class="depositHistory__v"
                >NT$ {{ row.amount.toLocaleString() }}</span
              >
            </p>
            <p class="depositHistory__row">
              <span class="depositHistory__k">付款方式</span>
              <span class="depositHistory__v">{{
                payLabel(row.payMethod)
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
import { computed, ref, watch } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';

type PayMethod = 'CREDIT_CARD' | 'ATM' | 'CVS';
type Status = 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED';

type DepositHistoryRow = {
  id: string;
  createdAt: string; // YYYY-MM-DD
  orderNo: string;
  amount: number;
  payMethod: PayMethod;
  status: Status;
};

const pageSize = 8;
const page = ref(1);

const dateFrom = ref('');
const dateTo = ref('');
const status = ref<Status | ''>('');
const keyword = ref('');

/**  Mock：用迴圈產生 70+ 筆資料 */
const COUNT = 75;

const payMethods: PayMethod[] = ['CREDIT_CARD', 'ATM', 'CVS'];
const amounts = [200, 500, 1000, 2000, 3000, 5000];

const pad = (n: number, len = 4) => String(n).padStart(len, '0');

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const buildMockRows = (count: number): DepositHistoryRow[] => {
  const base = new Date();
  const list: DepositHistoryRow[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i); // 每筆往前一天

    const createdAt = toYMD(d);
    const orderNo = `DEP${createdAt}${pad(i + 1, 4)}`;

    // 狀態分布：已付款多一點
    const statusPool: Status[] = [
      'PAID',
      'PAID',
      'PAID',
      'PENDING',
      'FAILED',
      'CANCELED',
    ];

    list.push({
      id: String(i + 1),
      createdAt,
      orderNo,
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      payMethod: payMethods[Math.floor(Math.random() * payMethods.length)],
      status: statusPool[Math.floor(Math.random() * statusPool.length)],
    });
  }

  return list;
};

const rows = ref<DepositHistoryRow[]>(buildMockRows(COUNT));

const filteredRows = computed(() => {
  const from = dateFrom.value ? new Date(dateFrom.value).getTime() : null;
  const to = dateTo.value ? new Date(dateTo.value).getTime() : null;

  return rows.value
    .filter((r) => {
      const t = new Date(r.createdAt).getTime();

      const okFrom = from == null ? true : t >= from;
      const okTo = to == null ? true : t <= to;
      const okStatus = status.value ? r.status === status.value : true;
      const okKeyword = keyword.value
        ? r.orderNo.toLowerCase().includes(keyword.value.toLowerCase())
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

// 條件變動時回第一頁
watch([dateFrom, dateTo, status, keyword], () => {
  page.value = 1;
});

// totalPages 變動時，確保 page 不超界
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const onSearch = () => {
  // 目前是前端 computed 篩選，所以查詢按鈕不需要做事
  // 之後接 API 的話，就在這邊打 API 更新 rows
};

const onReset = () => {
  dateFrom.value = '';
  dateTo.value = '';
  status.value = '';
  keyword.value = '';
  page.value = 1;
};

const payLabel = (m: PayMethod) => {
  if (m === 'CREDIT_CARD') return '信用卡';
  if (m === 'ATM') return 'ATM 轉帳';
  return '超商代碼';
};

const statusLabel = (s: Status) => {
  if (s === 'PAID') return '已付款';
  if (s === 'PENDING') return '待付款';
  if (s === 'FAILED') return '失敗';
  return '已取消';
};

const badgeClass = (s: Status) => ({
  'is-paid': s === 'PAID',
  'is-pending': s === 'PENDING',
  'is-failed': s === 'FAILED',
  'is-canceled': s === 'CANCELED',
});
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
