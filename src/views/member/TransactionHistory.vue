<template>
  <section class="transactionHistory">
    <header class="transactionHistory__header">
      <h1 class="transactionHistory__title">交易流水</h1>
      <p class="transactionHistory__subtitle">查看儲值、抽獎扣款、免單退款與其他金幣／紅利異動</p>
    </header>

    <div class="transactionHistory__card">
      <form class="transactionHistory__form" @submit.prevent="onSearch">
        <div class="transactionHistory__grid">
          <div class="transactionHistory__field">
            <label class="transactionHistory__label">開始日期</label>
            <input class="transactionHistory__input" type="date" v-model="dateStart" />
          </div>

          <div class="transactionHistory__field">
            <label class="transactionHistory__label">結束日期</label>
            <input class="transactionHistory__input" type="date" v-model="dateEnd" />
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
              <option value="ADMIN_ADJUST">後台調整</option>
              <option value="EXPIRE">到期失效</option>
            </select>
          </div>
        </div>

        <div class="transactionHistory__actions">
          <button
            class="transactionHistory__btn transactionHistory__btn--ghost"
            type="button"
            @click="onReset"
            :disabled="isLoading"
          >
            重設
          </button>
          <button class="transactionHistory__btn" type="submit" :disabled="isLoading">
            <template v-if="isLoading">查詢中</template>
            <template v-else>查詢</template>
          </button>
        </div>
      </form>
    </div>

    <div class="transactionHistory__card">
      <div class="transactionHistory__resultHeader">
        <p class="transactionHistory__count">共 <b>{{ totalItems }}</b> 筆</p>
        <p v-if="error" class="transactionHistory__error">{{ error }}</p>
      </div>

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
              <td>{{ row.typeName || row.type }}</td>
              <td class="transactionHistory__lottery">{{ row.lotteryTitle || '-' }}</td>
              <td>
                <span v-if="row.goldAmount > 0" :class="moneyClass(row.direction)">
                  {{ signedText(row.goldAmount, row.direction) }}
                </span>
                <span v-else-if="row.goldAmount === 0 && row.bonusAmount === 0 && row.coinType === 'GOLD' && row.amount > 0" :class="moneyClass(row.direction)">
                  {{ signedText(row.amount, row.direction) }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="row.bonusAmount > 0" :class="moneyClass(row.direction)">
                  {{ signedText(row.bonusAmount, row.direction) }}
                </span>
                <span v-else-if="row.goldAmount === 0 && row.bonusAmount === 0 && row.coinType === 'BONUS' && row.amount > 0" :class="moneyClass(row.direction)">
                  {{ signedText(row.amount, row.direction) }}
                </span>
                <span v-else>-</span>
              </td>
              <td class="transactionHistory__desc">
                <p class="transactionHistory__descMain">{{ row.description || '-' }}</p>
                <p v-if="metaText(row)" class="transactionHistory__descMeta">{{ metaText(row) }}</p>
              </td>
            </tr>

            <tr v-if="!isLoading && items.length === 0">
              <td class="transactionHistory__empty" colspan="6">目前沒有資料</td>
            </tr>
            <tr v-if="isLoading">
              <td class="transactionHistory__empty" colspan="6">資料載入中</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="transactionHistory__cards">
        <TransactionItem v-for="row in items" :key="row.id" :item="row" />
        <div v-if="!isLoading && items.length === 0" class="transactionHistory__emptyCard">目前沒有資料</div>
        <div v-if="isLoading" class="transactionHistory__emptyCard">資料載入中</div>
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
import { useTransactionHistory, type WalletTransactionRow } from '@/composables/useTransactionHistory';

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
    ? 'transactionHistory__money--pos'
    : 'transactionHistory__money--neg';
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
  max-width: 980px;
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
    opacity: 0.72;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
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
    box-sizing: border-box;
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
  }

  &__count {
    margin: 0;
    opacity: 0.85;
  }

  &__error {
    margin: 0;
    color: #c0392b;
    font-size: 13px;
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
      vertical-align: top;
    }

    th {
      opacity: 0.75;
      font-weight: 800;
    }
  }

  &__money--pos {
    color: #27ae60;
    font-weight: 700;
  }

  &__money--neg {
    color: #c0392b;
    font-weight: 700;
  }

  &__lottery {
    max-width: 180px;
    white-space: normal;
    word-break: break-word;
  }

  &__desc {
    max-width: 300px;
    white-space: normal;
    word-break: break-word;
  }

  &__descMain,
  &__descMeta {
    margin: 0;
  }

  &__descMeta {
    margin-top: 4px;
    font-size: 12px;
    color: #666;
  }

  &__empty {
    text-align: center;
    padding: 22px 10px;
    opacity: 0.65;
  }

  &__cards {
    display: none;
    flex-direction: column;
    gap: 10px;

    @media (max-width: 760px) {
      display: flex;
    }
  }

  &__emptyCard {
    border: 1px dashed rgba(0, 0, 0, 0.15);
    border-radius: 14px;
    padding: 18px;
    text-align: center;
    opacity: 0.65;
  }

  &__pagination {
    margin-top: 14px;
  }
}
</style>