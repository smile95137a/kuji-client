<!-- src/components/wallet/RechargeConfirmDialog.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="rechargeConfirmDialog__overlay"
      @click.self="emit('cancel')"
    >
      <div class="rechargeConfirmDialog">
        <div class="rechargeConfirmDialog__header">
          <p class="rechargeConfirmDialog__title">確認儲值</p>
          <button
            class="rechargeConfirmDialog__close"
            type="button"
            @click="emit('cancel')"
          >
            ✕
          </button>
        </div>

        <div class="rechargeConfirmDialog__body">
          <!-- Test-mode notice -->
          <div class="rechargeConfirmDialog__notice">
            <span class="rechargeConfirmDialog__noticeIcon">ℹ️</span>
            此為測試模式，儲值後金幣直接到帳
          </div>

          <template v-if="plan">
            <div class="rechargeConfirmDialog__kv">
              <span class="rechargeConfirmDialog__k">方案</span>
              <span class="rechargeConfirmDialog__v">{{ plan.name }}</span>
            </div>
            <div class="rechargeConfirmDialog__kv">
              <span class="rechargeConfirmDialog__k">金額</span>
              <span class="rechargeConfirmDialog__v rechargeConfirmDialog__v--price">
                NT$ {{ plan.price.toLocaleString() }}
              </span>
            </div>
            <div class="rechargeConfirmDialog__kv">
              <span class="rechargeConfirmDialog__k">獲得金幣</span>
              <span class="rechargeConfirmDialog__v rechargeConfirmDialog__v--gold">
                {{ plan.goldCoins.toLocaleString() }}
              </span>
            </div>
            <div v-if="plan.bonusCoins > 0" class="rechargeConfirmDialog__kv">
              <span class="rechargeConfirmDialog__k">贈送紅利</span>
              <span class="rechargeConfirmDialog__v rechargeConfirmDialog__v--bonus">
                {{ plan.bonusCoins.toLocaleString() }}
              </span>
            </div>
          </template>
        </div>

        <div class="rechargeConfirmDialog__footer">
          <button
            class="rechargeConfirmDialog__btn rechargeConfirmDialog__btn--ghost"
            type="button"
            :disabled="submitting"
            @click="emit('cancel')"
          >
            取消
          </button>
          <button
            class="rechargeConfirmDialog__btn"
            type="button"
            :disabled="submitting"
            @click="emit('confirm')"
          >
            {{ submitting ? '處理中…' : '確認儲值' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { RechargePlan } from '@/composables/useRechargePlans';

defineProps<{
  visible: boolean;
  plan: RechargePlan | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped lang="scss">
.rechargeConfirmDialog {
  background: #fff;
  border-radius: 16px;
  width: min(420px, 92vw);
  overflow: hidden;

  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
  }

  &__close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.6;
    padding: 0 4px;

    &:hover {
      opacity: 1;
    }
  }

  &__body {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__notice {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    color: #856404;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__noticeIcon {
    flex-shrink: 0;
  }

  &__kv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__k {
    opacity: 0.65;
    font-size: 14px;
  }

  &__v {
    font-weight: 600;
    font-size: 15px;

    &--price {
      font-weight: 800;
    }

    &--gold {
      color: #b8860b;
      font-weight: 700;
    }

    &--bonus {
      color: #c0392b;
      font-weight: 700;
    }
  }

  &__footer {
    display: flex;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__btn {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 15px;
    background: #222;
    color: #fff;
    transition: opacity 0.15s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--ghost {
      background: #fff;
      color: #222;
      border: 1px solid rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
