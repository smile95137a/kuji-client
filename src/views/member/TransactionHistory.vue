<template>
  <section class="transactionHistory">
    <div class="transactionHistory__hero">
      <div class="transactionHistory__heroBg"></div>

      <div class="transactionHistory__heroTop">
        <div>
          <p class="transactionHistory__badge">TRANSACTION HISTORY</p>
          <h1 class="transactionHistory__title">消費紀錄</h1>
          <p class="transactionHistory__subtitle">
            查看儲值、抽獎扣款、免單退款與其他金幣／紅利異動。
          </p>
        </div>

        <div class="transactionHistory__heroCount">
          <span>共</span>
          <strong>{{ totalItems }}</strong>
          <span>筆</span>
        </div>
      </div>
    </div>

    <div class="transactionHistory__section">
      <div class="transactionHistory__sectionHead">
        <div>
          <p class="transactionHistory__sectionKicker">SEARCH FILTER</p>
          <h2 class="transactionHistory__sectionTitle">篩選條件</h2>
        </div>
      </div>

      <form class="transactionHistory__form" @submit.prevent="onSearch">
        <div class="transactionHistory__grid">
          <div class="transactionHistory__field">
            <label class="transactionHistory__label">開始日期</label>
            <input
              class="transactionHistory__input"
              type="date"
              v-model="dateStart"
            />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">結束日期</label>
            <input
              class="transactionHistory__input"
              type="date"
              v-model="dateEnd"
            />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">類型</label>
            <select class="transactionHistory__input" v-model="typeFilter">
              <option value="">全部</option>
              <option value="RECHARGE">儲值</option>
              <option value="DRAW_GOLD">抽獎扣款（金幣）</option>
              <option value="DRAW_BONUS">抽獎扣款（紅利）</option>
              <option value="FREE_DRAW_REFUND">開套免單退款</option>
              <option value="RECYCLE_BONUS">回收回饋</option>
              <option value="REFERRAL_BONUS">推薦獎勵</option>
              <option value="BONUS_GRANT">多抽贈送紅利</option>
              <option value="ADMIN_ADJUST">後台調整</option>
              <option value="EXPIRE">到期失效</option>
            </select>
          </div>
        </div>

        <div class="transactionHistory__actions">
          <button
            class="transactionHistory__actionBtn transactionHistory__actionBtn--ghost"
            type="button"
            @click="onReset"
            :disabled="isLoading"
          >
            重設
          </button>

          <button
            class="transactionHistory__actionBtn"
            type="submit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="transactionHistory__spinner"></span>

            <template v-else>
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
              查詢
            </template>
          </button>
        </div>
      </form>
    </div>

    <div class="transactionHistory__section">
      <div class="transactionHistory__sectionHead">
        <div>
          <p class="transactionHistory__sectionKicker">TRANSACTION LIST</p>
          <h2 class="transactionHistory__sectionTitle">紀錄列表</h2>
        </div>

        <p class="transactionHistory__count">
          共 <b>{{ totalItems }}</b> 筆
        </p>
      </div>

      <p v-if="error" class="transactionHistory__error">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        <span>{{ error }}</span>
      </p>

      <div class="transactionHistory__tableWrap">
        <table class="transactionHistory__table">
          <thead>
            <tr>
              <th>時間</th>
              <th>類型</th>
              <th>商品</th>
              <th>金幣</th>
              <th>紅利</th>
              <th>說明</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in items" :key="row.id">
              <td>{{ row.createdAtText }}</td>

              <td>
                <span
                  class="transactionHistory__typeBadge"
                  :class="typeBadgeClass(row.type)"
                >
                  {{ row.typeName || row.type }}
                </span>
              </td>

              <td class="transactionHistory__lottery">
                {{ row.lotteryTitle || '-' }}
              </td>

              <td>
                <span
                  v-if="row.goldAmount > 0"
                  :class="moneyClass(row.direction)"
                >
                  {{ signedText(row.goldAmount, row.direction) }}
                </span>

                <span
                  v-else-if="
                    row.goldAmount === 0 &&
                    row.bonusAmount === 0 &&
                    row.coinType === 'GOLD' &&
                    row.amount > 0
                  "
                  :class="moneyClass(row.direction)"
                >
                  {{ signedText(row.amount, row.direction) }}
                </span>

                <span v-else>-</span>
              </td>

              <td>
                <span
                  v-if="row.bonusAmount > 0"
                  :class="moneyClass(row.direction)"
                >
                  {{ signedText(row.bonusAmount, row.direction) }}
                </span>

                <span
                  v-else-if="
                    row.goldAmount === 0 &&
                    row.bonusAmount === 0 &&
                    row.coinType === 'BONUS' &&
                    row.amount > 0
                  "
                  :class="moneyClass(row.direction)"
                >
                  {{ signedText(row.amount, row.direction) }}
                </span>

                <span v-else>-</span>
              </td>

              <td class="transactionHistory__desc">
                <p class="transactionHistory__descMain">
                  {{ row.description || '-' }}
                </p>

                <p v-if="metaText(row)" class="transactionHistory__descMeta">
                  {{ metaText(row) }}
                </p>
              </td>
            </tr>

            <tr v-if="!isLoading && items.length === 0">
              <td class="transactionHistory__empty" colspan="6">
                目前沒有資料
              </td>
            </tr>

            <tr v-if="isLoading">
              <td class="transactionHistory__empty" colspan="6">資料載入中</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="transactionHistory__cards">
        <TransactionItem
          v-for="row in items"
          :key="row.id"
          :item="row"
          class="transactionHistory__mobileItem"
        />

        <div
          v-if="!isLoading && items.length === 0"
          class="transactionHistory__emptyCard"
        >
          <font-awesome-icon :icon="['fas', 'receipt']" />
          <p>目前沒有資料</p>
          <span>可以調整篩選條件再試一次。</span>
        </div>

        <div v-if="isLoading" class="transactionHistory__emptyCard">
          <font-awesome-icon :icon="['fas', 'spinner']" spin />
          <p>資料載入中</p>
        </div>
      </div>

      <div class="transactionHistory__pagination">
        <BasePagination
          v-model:page="page"
          :total="totalItems"
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
import { onMounted } from 'vue';
import BasePagination from '@/components/common/BasePagination.vue';
import TransactionItem from '@/components/wallet/TransactionItem.vue';
import {
  useTransactionHistory,
  type WalletTransactionRow,
} from '@/composables/useTransactionHistory';

const {
  items,
  isLoading,
  error,
  totalItems,
  hasNext,
  hasPrevious,
  totalPages,
  size,
  page,
  typeFilter,
  dateStart,
  dateEnd,
  fetch,
  search,
  reset,
  goToPage,
} = useTransactionHistory();

const signedText = (amount: number, direction: 'INCOME' | 'EXPENSE') => {
  const sign = direction === 'INCOME' ? '+' : '-';

  return `${sign}${amount.toLocaleString()}`;
};

const moneyClass = (direction: 'INCOME' | 'EXPENSE') => {
  return direction === 'INCOME'
    ? 'transactionHistory__money transactionHistory__money--pos'
    : 'transactionHistory__money transactionHistory__money--neg';
};

const typeBadgeClass = (type: string) => {
  return {
    'is-recharge': type === 'RECHARGE',
    'is-draw': type === 'DRAW_GOLD' || type === 'DRAW_BONUS',
    'is-refund': type === 'FREE_DRAW_REFUND',
    'is-recycle': type === 'RECYCLE_BONUS',
    'is-bonus': type === 'REFERRAL_BONUS' || type === 'BONUS_GRANT',
    'is-adjust': type === 'ADMIN_ADJUST',
    'is-expire': type === 'EXPIRE',
  };
};

const metaText = (row: WalletTransactionRow) => {
  const parts: string[] = [];

  if (row.drawIndex != null) {
    parts.push(`第 ${row.drawIndex} 抽`);
  }

  if (row.ticketNumber != null) {
    parts.push(`票號 ${row.ticketNumber}`);
  }

  if (row.refundAmount > 0) {
    parts.push(`退還 ${row.refundAmount.toLocaleString()}`);
  }

  return parts.join(' | ');
};

const onSearch = () => search();
const onReset = () => reset();

onMounted(() => fetch());
</script>

<style scoped lang="scss">
.transactionHistory {
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  &__error {
    display: flex;
    align-items: center;
    gap: 7px;

    margin: 0 0 12px;
    padding: 11px 12px;
    border-radius: 16px;

    background: rgba(180, 35, 24, 0.08);
    color: #b42318;
    border: 1px solid rgba(180, 35, 24, 0.12);

    font-size: 13px;
    font-weight: 900;
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
      vertical-align: top;

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

  &__typeBadge {
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

    &.is-recharge,
    &.is-refund,
    &.is-recycle,
    &.is-bonus {
      background: rgba(46, 125, 50, 0.1);
      color: #2e7d32;
      border-color: rgba(46, 125, 50, 0.16);
    }

    &.is-draw,
    &.is-expire {
      background: rgba(180, 35, 24, 0.1);
      color: #b42318;
      border-color: rgba(180, 35, 24, 0.16);
    }

    &.is-adjust {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-color: rgba(37, 99, 235, 0.16);
    }
  }

  &__money {
    font-weight: 950;

    &--pos {
      color: #2e7d32;
    }

    &--neg {
      color: #b42318;
    }
  }

  &__lottery {
    max-width: 200px;
    white-space: normal !important;
    word-break: break-word;
  }

  &__desc {
    max-width: 320px;
    white-space: normal !important;
    word-break: break-word;
  }

  &__descMain,
  &__descMeta {
    margin: 0;
  }

  &__descMain {
    color: var(--text);
    line-height: 1.5;
    font-weight: 900;
  }

  &__descMeta {
    margin-top: 4px;
    color: var(--text-soft);
    font-size: 12px;
    line-height: 1.5;
    font-weight: 700;
  }

  &__empty {
    text-align: center !important;
    padding: 28px 12px !important;
    color: var(--text-soft) !important;
    border-radius: 18px !important;
  }

  &__cards {
    display: none;
    flex-direction: column;
    gap: 12px;
  }

  &__mobileItem {
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.045);
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

  &__spinner {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.42);
    border-top-color: #fff;
    animation: transactionHistorySpin 0.7s linear infinite;
  }

  @media (max-width: 900px) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__field:last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 760px) {
    &__tableWrap {
      display: none;
    }

    &__cards {
      display: flex;
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

    &__field:last-child {
      grid-column: auto;
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
  }
}

@keyframes transactionHistorySpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
