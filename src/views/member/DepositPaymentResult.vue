<template>
  <section class="paymentResult">
    <div class="paymentResult__hero">
      <p class="paymentResult__badge">PAYMENT RESULT</p>
      <h1>儲值付款結果</h1>
      <p>我們已同步 GoMyPay 的付款狀態，銀行轉帳請依下方資訊完成繳費。</p>
    </div>

    <div class="paymentResult__card" :class="statusClass">
      <font-awesome-icon :icon="['fas', isSuccess ? (isBankTransfer ? 'building-columns' : 'circle-check') : 'circle-xmark']" />
      <div>
        <span>付款狀態</span>
        <h2>{{ statusTitle }}</h2>
        <p>{{ statusMessage }}</p>
      </div>
    </div>

    <div v-if="order" class="paymentResult__panel">
      <div class="paymentResult__panelHead">
        <span>RECHARGE INFO</span>
        <h2>儲值資訊</h2>
      </div>

      <div class="paymentResult__grid">
        <div class="paymentResult__item paymentResult__item--wide">
          <span>儲值單號</span>
          <strong>{{ order.rechargeOrderId || '-' }}</strong>
        </div>
        <div class="paymentResult__item">
          <span>金額</span>
          <strong>NT$ {{ Number(order.priceTwd || 0).toLocaleString() }}</strong>
        </div>
        <div class="paymentResult__item">
          <span>金幣</span>
          <strong>{{ Number(order.goldAmount || 0).toLocaleString() }}</strong>
        </div>
        <div class="paymentResult__item">
          <span>紅利</span>
          <strong>{{ Number(order.bonusAmount || 0).toLocaleString() }}</strong>
        </div>
      </div>
    </div>

    <div v-if="isBankTransfer && virtualAccount" class="paymentResult__panel">
      <div class="paymentResult__panelHead">
        <span>BANK TRANSFER</span>
        <h2>轉帳資訊</h2>
      </div>

      <div class="paymentResult__notice">
        <font-awesome-icon :icon="['fas', 'circle-info']" />
        請至網路銀行或 ATM，在繳費期限前完成轉帳。系統收到款項後會自動入帳。
      </div>

      <div class="paymentResult__grid">
        <div class="paymentResult__item paymentResult__item--wide paymentResult__item--account">
          <span>虛擬帳號</span>
          <div class="paymentResult__accountRow">
            <strong>{{ virtualAccount }}</strong>
            <button
              class="paymentResult__copyBtn"
              type="button"
              :title="copied ? '已複製' : '複製帳號'"
              @click="copyAccount"
            >
              <font-awesome-icon :icon="['fas', copied ? 'check' : 'copy']" />
              {{ copied ? '已複製' : '複製' }}
            </button>
          </div>
        </div>
        <div class="paymentResult__item">
          <span>繳費期限</span>
          <strong>{{ limitDate || '-' }}</strong>
        </div>
        <div v-if="payInfo" class="paymentResult__item">
          <span>銀行資訊</span>
          <strong>{{ payInfo }}</strong>
        </div>
      </div>
    </div>

    <div class="paymentResult__actions">
      <button type="button" class="paymentResult__button paymentResult__button--ghost" @click="goDeposit">
        返回儲值頁
      </button>
      <button type="button" class="paymentResult__button" @click="goHistory">
        查看儲值紀錄
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getRechargeOrder,
  type RechargeOrderRes,
} from '@/services/rechargeService';
import { useWallet } from '@/composables/useWallet';

const route = useRoute();
const router = useRouter();
const { refresh } = useWallet();

const order = ref<RechargeOrderRes | null>(null);
const copied = ref(false);

const rechargeOrderId = computed(() =>
  String(route.query.e_orderno ?? route.query.rechargeOrderId ?? ''),
);
const queryResult = computed(() => String(route.query.result ?? ''));
const querySendType = computed(() =>
  String(route.query.Send_Type ?? route.query.send_type ?? ''),
);

const gatewayResult = computed(() => order.value?.gatewayResult || queryResult.value);
const retMsg = computed(() => order.value?.retMsg || String(route.query.ret_msg ?? ''));
const virtualAccount = computed(() => order.value?.virtualAccount || String(route.query.e_payaccount ?? ''));
const limitDate = computed(() => order.value?.limitDate || String(route.query.LimitDate ?? ''));
const payInfo = computed(() => order.value?.payInfo || String(route.query.payInfo ?? ''));

async function copyAccount() {
  try {
    await navigator.clipboard.writeText(virtualAccount.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // clipboard not available, silently ignore
  }
}

const isBankTransfer = computed(() =>
  order.value?.paymentMethod === 'BANK_TRANSFER' ||
  querySendType.value === '4' ||
  Boolean(virtualAccount.value),
);
const isSuccess = computed(() =>
  gatewayResult.value === '1' ||
  order.value?.status === 'SUCCESS' ||
  (isBankTransfer.value && Boolean(virtualAccount.value)),
);

const statusTitle = computed(() => {
  if (isBankTransfer.value && isSuccess.value) return '虛擬帳號已建立';
  return isSuccess.value ? '付款成功' : '付款失敗';
});

const statusMessage = computed(() => {
  if (isBankTransfer.value && isSuccess.value) {
    return '請在期限內完成轉帳，系統收到 GoMyPay 通知後會自動入帳。';
  }
  return isSuccess.value
    ? '儲值已完成，金幣與紅利會同步更新到錢包。'
    : retMsg.value || '付款未完成，請重新發起付款或聯繫客服。';
});

const statusClass = computed(() => ({
  'is-success': isSuccess.value && !isBankTransfer.value,
  'is-pending': isBankTransfer.value && isSuccess.value,
  'is-failed': !isSuccess.value,
}));

async function loadOrder() {
  if (!rechargeOrderId.value) return;
  try {
    const res = await getRechargeOrder(rechargeOrderId.value);
    order.value = res.data;
  } catch (e) {
    console.error('load recharge order error', e);
  }
}

function goDeposit() {
  router.push({ name: 'Deposit' });
}

function goHistory() {
  router.push({ name: 'DepositHistory' });
}

onMounted(async () => {
  await loadOrder();
  if (isSuccess.value && !isBankTransfer.value) {
    await refresh();
  }
});
</script>

<style scoped lang="scss">
.paymentResult {
  min-height: 100%;
  padding: clamp(20px, 4vw, 48px);
  color: #251815;
  background:
    radial-gradient(circle at 12% 8%, rgba(255, 142, 48, 0.18), transparent 32%),
    linear-gradient(135deg, #fff8ef 0%, #fffdf8 44%, #f7efe7 100%);
}

.paymentResult__hero,
.paymentResult__panel,
.paymentResult__card {
  max-width: 1120px;
  margin: 0 auto 22px;
  border: 1px solid rgba(84, 53, 36, 0.12);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 22px 50px rgba(64, 34, 21, 0.08);
}

.paymentResult__hero {
  padding: clamp(28px, 5vw, 56px);
}

.paymentResult__hero h1 {
  margin: 8px 0;
  font-size: clamp(30px, 5vw, 56px);
}

.paymentResult__badge,
.paymentResult__panelHead span {
  color: #b83225;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.paymentResult__card {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 24px;
}

.paymentResult__card svg {
  width: 40px;
  height: 40px;
}

.paymentResult__card.is-success svg {
  color: #12805c;
}

.paymentResult__card.is-pending svg {
  color: #b7791f;
}

.paymentResult__card.is-failed svg {
  color: #c22f22;
}

.paymentResult__panel {
  padding: 26px;
}

.paymentResult__panelHead h2 {
  margin: 6px 0 18px;
}

.paymentResult__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.paymentResult__item {
  padding: 18px;
  border-radius: 18px;
  background: #fffaf4;
  border: 1px solid rgba(84, 53, 36, 0.12);
}

.paymentResult__item span {
  display: block;
  margin-bottom: 8px;
  color: #806f66;
}

.paymentResult__item strong {
  word-break: break-all;
}

.paymentResult__item--wide {
  grid-column: 1 / -1;
}

.paymentResult__notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.22);
  color: #7a4f0a;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.55;
}

.paymentResult__item--account strong {
  font-size: clamp(22px, 4vw, 38px);
  letter-spacing: 0.06em;
  word-break: break-all;
}

.paymentResult__accountRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.paymentResult__copyBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(84, 53, 36, 0.18);
  background: #fff;
  color: #251815;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: #251815;
    color: #fff;
  }
}

.paymentResult__actions {
  max-width: 1120px;
  margin: 28px auto 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.paymentResult__button {
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  background: #b83225;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.paymentResult__button--ghost {
  background: #fff;
  color: #251815;
  border: 1px solid rgba(84, 53, 36, 0.18);
}

@media (max-width: 720px) {
  .paymentResult__grid,
  .paymentResult__actions {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>
