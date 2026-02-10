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
              v-model="createdAtStart"
            />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">結束日期</label>
            <input
              class="transactionHistory__input"
              type="date"
              v-model="createdAtEnd"
            />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">類型</label>
            <select class="transactionHistory__input" v-model="type">
              <option value="">全部</option>
              <option value="DRAW_GOLD">金幣抽獎</option>
              <option value="DRAW_BONUS">紅利抽獎</option>
              <option value="SHIPPING_FEE">運費支付</option>
            </select>
          </div>

          <div
            class="transactionHistory__field transactionHistory__field--full"
          >
            <label class="transactionHistory__label">訂單編號</label>
            <input
              class="transactionHistory__input"
              type="text"
              placeholder="例如 ORD202601120001"
              v-model.trim="orderNumber"
            />
          </div>
        </div>

        <div class="transactionHistory__actions">
          <button
            class="transactionHistory__btn transactionHistory__btn--ghost"
            type="button"
            @click="onReset"
            :disabled="loading"
          >
            重設
          </button>
          <button
            class="transactionHistory__btn"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? '查詢中…' : '查詢' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 結果 -->
    <div class="transactionHistory__card">
      <div class="transactionHistory__resultHeader">
        <p class="transactionHistory__count">
          共 <b>{{ rows.length }}</b> 筆
        </p>

        <p class="transactionHistory__sum">
          本頁合計：
          <b>
            {{ pageSumText }}
          </b>
        </p>
      </div>

      <!-- Desktop Table -->
      <div class="transactionHistory__tableWrap">
        <table class="transactionHistory__table">
          <thead>
            <tr>
              <th>日期</th>
              <th>類型</th>
              <th>訂單編號</th>
              <th>賞品</th>
              <th>金幣</th>
              <th>紅利</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ row.createdAtText }}</td>
              <td>{{ row.typeName || row.type }}</td>
              <td class="transactionHistory__mono">
                {{ row.orderNumber || '-' }}
              </td>
              <td>{{ row.lotteryTitle || '-' }}</td>

              <td>
                <span
                  :class="{
                    'transactionHistory__money--neg': row.goldAmount > 0,
                  }"
                >
                  {{ goldText(row.goldAmount) }}
                </span>
              </td>

              <td>
                <span
                  :class="{
                    'transactionHistory__money--neg': row.bonusAmount > 0,
                  }"
                >
                  {{ bonusText(row.bonusAmount) }}
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

            <tr v-if="!loading && pageRows.length === 0">
              <td class="transactionHistory__empty" colspan="7">查無資料</td>
            </tr>
            <tr v-if="loading">
              <td class="transactionHistory__empty" colspan="7">載入中…</td>
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
            <span class="transactionHistory__badge">
              {{ row.typeName || row.type }}
            </span>
            <span class="transactionHistory__date">{{
              row.createdAtText
            }}</span>
          </div>

          <div class="transactionHistory__itemBody">
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">訂單編號</span>
              <span class="transactionHistory__v transactionHistory__mono">{{
                row.orderNumber || '-'
              }}</span>
            </p>
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">賞品</span>
              <span class="transactionHistory__v">{{
                row.lotteryTitle || '-'
              }}</span>
            </p>
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">金幣</span>
              <span class="transactionHistory__v">{{
                goldText(row.goldAmount)
              }}</span>
            </p>
            <p class="transactionHistory__row">
              <span class="transactionHistory__k">紅利</span>
              <span class="transactionHistory__v">{{
                bonusText(row.bonusAmount)
              }}</span>
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

        <div
          v-if="!loading && pageRows.length === 0"
          class="transactionHistory__emptyCard"
        >
          查無資料
        </div>
        <div v-if="loading" class="transactionHistory__emptyCard">載入中…</div>
      </div>

      <!-- 分頁 -->
      <div class="transactionHistory__pagination">
        <BasePagination
          v-model:page="page"
          :total-pages="totalPages"
          :max-visible="5"
        />
      </div>
    </div>

    <!-- 明細 Dialog -->
    <div
      v-if="detailOpen"
      class="transactionHistory__overlay"
      @click.self="detailOpen = false"
    >
      <div class="transactionHistory__dialog">
        <div class="transactionHistory__dialogHeader">
          <p class="transactionHistory__dialogTitle">消費明細</p>
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
            <span class="transactionHistory__v">{{
              selected.createdAtText
            }}</span>
          </div>

          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">類型</span>
            <span class="transactionHistory__v">{{
              selected.typeName || selected.type
            }}</span>
          </div>

          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">訂單編號</span>
            <span class="transactionHistory__v transactionHistory__mono">{{
              selected.orderNumber || '-'
            }}</span>
          </div>

          <div class="transactionHistory__kv" v-if="selected.lotteryTitle">
            <span class="transactionHistory__k">賞品</span>
            <span class="transactionHistory__v">{{
              selected.lotteryTitle
            }}</span>
          </div>

          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">金幣消費</span>
            <span class="transactionHistory__v">{{
              goldText(selected.goldAmount)
            }}</span>
          </div>

          <div class="transactionHistory__kv">
            <span class="transactionHistory__k">紅利消費</span>
            <span class="transactionHistory__v">{{
              bonusText(selected.bonusAmount)
            }}</span>
          </div>

          <div class="transactionHistory__kv transactionHistory__kv--full">
            <span class="transactionHistory__k">說明</span>
            <span class="transactionHistory__v">{{
              selected.description || '-'
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
import { getMyConsumptionRecords } from '@/services/consumptionRecordService';

const pageSize = 10;
const page = ref(1);

const createdAtStart = ref('');
const createdAtEnd = ref('');
const type = ref('');
const orderNumber = ref('');

const rows = ref<any[]>([]);
const loading = ref(false);

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatDateTime = (value: any) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
};

const mapToRow = (x: any) => ({
  id: String(x.id ?? ''),
  userId: x.userId ?? undefined,

  type: x.type ?? '',
  typeName: x.typeName ?? undefined,

  lotteryId: x.lotteryId ?? undefined,
  lotteryTitle: x.lotteryTitle ?? undefined,

  orderId: x.orderId ?? undefined,
  orderNumber: x.orderNumber ?? undefined,

  goldAmount: Number(x.goldAmount ?? 0),
  bonusAmount: Number(x.bonusAmount ?? 0),

  description: x.description ?? undefined,

  createdAt: String(x.createdAt ?? ''),
  createdAtText: formatDateTime(x.createdAt),
});

const fetchRecords = async () => {
  loading.value = true;
  try {
    const req = {
      condition: {
        orderNumber: orderNumber.value || null,
        type: type.value || null,
        createdAtStart: createdAtStart.value || null,
        createdAtEnd: createdAtEnd.value || null,
      },
    };

    const res = await getMyConsumptionRecords(req);

    const maybe = (res as any)?.data ?? (res as any)?.result ?? res;
    const arr = Array.isArray(maybe) ? maybe : (maybe?.list ?? []);

    rows.value = (arr as any[]).map(mapToRow);
    page.value = 1;
  } catch (e) {
    console.error('TransactionHistory - fetchRecords error:', e);
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecords();
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(rows.value.length / pageSize)),
);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return rows.value.slice(start, start + pageSize);
});

const pageGoldSum = computed(() =>
  pageRows.value.reduce((sum, r) => sum + (r.goldAmount || 0), 0),
);
const pageBonusSum = computed(() =>
  pageRows.value.reduce((sum, r) => sum + (r.bonusAmount || 0), 0),
);
const pageSumText = computed(
  () =>
    `金幣 ${pageGoldSum.value.toLocaleString()} / 紅利 ${pageBonusSum.value.toLocaleString()}`,
);

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
  if (page.value < 1) page.value = 1;
});

const onSearch = async () => {
  await fetchRecords();
};

const onReset = async () => {
  createdAtStart.value = '';
  createdAtEnd.value = '';
  type.value = '';
  orderNumber.value = '';
  page.value = 1;
  await fetchRecords();
};

const goldText = (v: number) => (v ? `-${Math.abs(v).toLocaleString()}` : '0');
const bonusText = (v: number) => (v ? `-${Math.abs(v).toLocaleString()}` : '0');

// Detail dialog
const detailOpen = ref(false);
const selected = ref(null);

const openDetail = (row) => {
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

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

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
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
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
