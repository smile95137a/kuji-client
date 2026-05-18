<template>
  <section class="depositHistory">
    <div class="depositHistory__hero">
      <div class="depositHistory__heroBg"></div>

      <div class="depositHistory__heroTop">
        <div>
          <p class="depositHistory__badge">DEPOSIT HISTORY</p>
          <h1 class="depositHistory__title">儲值紀錄</h1>
          <p class="depositHistory__subtitle">
            查詢你的儲值訂單、付款狀態與交易明細。
          </p>
        </div>

        <div class="depositHistory__heroCount">
          <span>共</span>
          <strong>{{ total }}</strong>
          <span>筆</span>
        </div>
      </div>
    </div>

    <div class="depositHistory__section">
      <div class="depositHistory__sectionHead">
        <div>
          <p class="depositHistory__sectionKicker">SEARCH FILTER</p>
          <h2 class="depositHistory__sectionTitle">查詢條件</h2>
        </div>
      </div>

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
            class="depositHistory__actionBtn depositHistory__actionBtn--ghost"
            type="button"
            @click="onReset"
          >
            重設
          </button>

          <button class="depositHistory__actionBtn" type="submit">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
            查詢
          </button>
        </div>
      </form>
    </div>

    <div class="depositHistory__section">
      <div class="depositHistory__sectionHead">
        <div>
          <p class="depositHistory__sectionKicker">DEPOSIT LIST</p>
          <h2 class="depositHistory__sectionTitle">儲值列表</h2>
        </div>

        <p class="depositHistory__count">
          共 <b>{{ total }}</b> 筆
        </p>
      </div>

      <div class="depositHistory__tableWrap">
        <table class="depositHistory__table">
          <thead>
            <tr>
              <th>建立時間</th>
              <th>交易號</th>
              <th>金額</th>
              <th>金幣</th>
              <th>紅利</th>
              <th>付款方式</th>
              <th>狀態</th>
              <th>付款時間</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in pageRows" :key="row.id">
              <td>{{ formatDateTime(row.createdAt) }}</td>

              <td>
                <span class="depositHistory__mono">
                  {{ row.transactionId || '-' }}
                </span>
              </td>

              <td class="depositHistory__amount">
                NT$ {{ row.amount.toLocaleString() }}
              </td>

              <td>{{ row.goldCoins.toLocaleString() }}</td>
              <td>{{ row.bonusCoins.toLocaleString() }}</td>
              <td>{{ payLabel(row.paymentMethod) }}</td>

              <td>
                <span
                  class="depositHistory__statusBadge"
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

      <div class="depositHistory__cards">
        <article
          v-for="row in pageRows"
          :key="row.id"
          class="depositHistory__item"
        >
          <div class="depositHistory__itemTop">
            <span
              class="depositHistory__statusBadge"
              :class="badgeClass(row.paymentStatus)"
            >
              {{ statusLabel(row.paymentStatus) }}
            </span>

            <span class="depositHistory__date">
              {{ formatDateTime(row.createdAt) }}
            </span>
          </div>

          <div class="depositHistory__transactionBox">
            <span>交易號</span>
            <strong class="depositHistory__mono">
              {{ row.transactionId || '-' }}
            </strong>
          </div>

          <div class="depositHistory__itemBody">
            <p class="depositHistory__row">
              <span class="depositHistory__k">金額</span>
              <span class="depositHistory__v depositHistory__v--amount">
                NT$ {{ row.amount.toLocaleString() }}
              </span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">金幣</span>
              <span class="depositHistory__v">
                {{ row.goldCoins.toLocaleString() }}
              </span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">紅利</span>
              <span class="depositHistory__v">
                {{ row.bonusCoins.toLocaleString() }}
              </span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">付款方式</span>
              <span class="depositHistory__v">
                {{ payLabel(row.paymentMethod) }}
              </span>
            </p>

            <p class="depositHistory__row">
              <span class="depositHistory__k">付款時間</span>
              <span class="depositHistory__v">
                {{ row.paidAt ? formatDateTime(row.paidAt) : '-' }}
              </span>
            </p>
          </div>
        </article>

        <div v-if="pageRows.length === 0" class="depositHistory__emptyCard">
          <font-awesome-icon :icon="['fas', 'receipt']" />
          <p>查無資料</p>
          <span>可以調整查詢條件再試一次。</span>
        </div>
      </div>

      <div class="depositHistory__pagination">
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
import BasePagination from '@/components/common/BasePagination.vue';
import {
  getMyRechargeHistory,
  type RechargeHistoryRow,
} from '@/services/rechargeService';
import { executeApi } from '@/utils/executeApiUtils';
import { useServerPagination } from '@/composables/useServerPagination';

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
  createdAt: string;
  paidAt?: string;
};

const { page, size, total, totalPages, hasNext, hasPrevious, sync } =
  useServerPagination(8);

const createdAtStart = ref('');
const createdAtEnd = ref('');
const paymentStatus = ref<PaymentStatus | ''>('');
const transactionId = ref('');

const rows = ref<DepositHistoryRow[]>([]);
const pageRows = computed(() => rows.value);

watch([createdAtStart, createdAtEnd, paymentStatus, transactionId], () => {
  page.value = 1;
});

const normalizeRechargeHistory = (
  list: RechargeHistoryRow[],
): DepositHistoryRow[] =>
  list.map((o: any, idx: number) => ({
    id: String(o.id ?? idx),
    planId: String(o.planId ?? ''),
    amount: Number(o.amount ?? 0) || 0,
    goldCoins: Number(o.goldCoins ?? 0) || 0,
    bonusCoins: Number(o.bonusCoins ?? 0) || 0,
    paymentMethod: (o.paymentMethod ?? 'CREDIT_CARD') as PayMethod,
    paymentStatus: (o.paymentStatus ?? o.status ?? 'PENDING') as PaymentStatus,
    transactionId: String(o.transactionId ?? ''),
    createdAt: String(o.createdAt ?? ''),
    paidAt: o.paidAt ? String(o.paidAt) : undefined,
  }));

const buildReq = (): any => {
  const condition: any = {};

  if (createdAtStart.value) condition.createdAtStart = createdAtStart.value;
  if (createdAtEnd.value) condition.createdAtEnd = createdAtEnd.value;
  if (paymentStatus.value) condition.paymentStatus = paymentStatus.value;
  if (transactionId.value) condition.transactionId = transactionId.value.trim();

  return {
    condition,
    page: page.value,
    size: size.value,
  };
};

const loadHistory = async () => {
  await executeApi<any>({
    fn: () => getMyRechargeHistory(buildReq()),
    onSuccess: (res) => {
      rows.value = normalizeRechargeHistory(res?.data ?? []);
      sync(res);
    },
  });
};

const goToPage = () => {
  loadHistory();
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
    box-sizing: border-box;

    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    &::placeholder {
      color: rgba(32, 23, 19, 0.34);
    }

    &:focus {
      border-color: rgba(180, 51, 37, 0.5);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover:not(:disabled) {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
    }
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

  &__mono {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 13px;
    word-break: break-all;
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

  &__transactionBox {
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

  @media (max-width: 980px) {
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
