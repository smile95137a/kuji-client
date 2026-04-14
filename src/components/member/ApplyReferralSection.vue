<template>
  <div v-if="canApplyReferral" class="applyReferral">
    <div class="applyReferral__header">
      <h3 class="applyReferral__title">套用推薦碼</h3>
      <p class="applyReferral__subtitle">輸入朋友的推薦碼，雙方各獲得紅利獎勵（每人限一次）</p>
    </div>

    <!-- Already applied -->
    <div v-if="applied" class="applyReferral__success">
      <span class="applyReferral__check">✓</span>
      <span>推薦碼已套用成功</span>
    </div>

    <!-- Input form -->
    <template v-else>
      <div class="applyReferral__inputRow">
        <input
          v-model="codeInput"
          class="applyReferral__input"
          :class="{
            'applyReferral__input--valid': validator.isValid.value === true,
            'applyReferral__input--invalid': validator.isValid.value === false,
          }"
          type="text"
          placeholder="輸入推薦碼，例：KUJI-ABCD"
          maxlength="20"
          :disabled="isSubmitting"
          @input="onInput"
        />
        <div v-if="validator.isValidating.value" class="applyReferral__spinner"></div>
      </div>

      <!-- Validation feedback -->
      <p v-if="validator.isValid.value === true" class="applyReferral__hint applyReferral__hint--ok">
        推薦人：{{ validator.ownerName.value }}，套用後雙方各得紅利 ✓
      </p>
      <p v-if="validator.validationError.value" class="applyReferral__hint applyReferral__hint--err">
        {{ validator.validationError.value }}
      </p>
      <p v-if="applyError" class="applyReferral__hint applyReferral__hint--err">{{ applyError }}</p>

      <button
        class="applyReferral__btn"
        type="button"
        :disabled="validator.isValid.value !== true || isSubmitting"
        @click="onApply"
      >
        <span v-if="isSubmitting" class="applyReferral__btnSpinner"></span>
        <span v-else>套用推薦碼</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useReferralCodeValidator } from '@/composables/useReferralCodeValidator';
import { useReferral } from '@/composables/useReferral';

const { applyCode, canApplyReferral } = useReferral();
const validator = useReferralCodeValidator();

const codeInput = ref('');
const isSubmitting = ref(false);
const applyError = ref<string | null>(null);
const applied = ref(false);

function onInput() {
  applyError.value = null;
  validator.validate(codeInput.value);
}

async function onApply() {
  if (validator.isValid.value !== true) return;
  isSubmitting.value = true;
  applyError.value = null;
  try {
    const ok = await applyCode(codeInput.value.trim());
    if (ok) {
      applied.value = true;
    } else {
      applyError.value = '套用失敗，請稍後再試';
    }
  } catch (e: any) {
    applyError.value = e?.message ?? '套用失敗，請稍後再試';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.applyReferral {
  background: var(--card-bg, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.applyReferral__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.applyReferral__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.applyReferral__subtitle {
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.applyReferral__inputRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.applyReferral__input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.9375rem;
  letter-spacing: 0.05em;
  outline: none;
  transition: border-color 0.2s;
}

.applyReferral__input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.applyReferral__input:focus {
  border-color: rgba(108, 99, 255, 0.6);
}

.applyReferral__input--valid {
  border-color: #4caf50 !important;
}

.applyReferral__input--invalid {
  border-color: #f44336 !important;
}

.applyReferral__spinner {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.applyReferral__hint {
  font-size: 0.813rem;
  margin: 0;
}

.applyReferral__hint--ok {
  color: #4caf50;
}

.applyReferral__hint--err {
  color: #f44336;
}

.applyReferral__btn {
  padding: 13px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6c63ff, #9b59b6);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.applyReferral__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.applyReferral__btnSpinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.applyReferral__success {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 10px;
  color: #4caf50;
  font-weight: 600;
}

.applyReferral__check {
  font-size: 1.25rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
