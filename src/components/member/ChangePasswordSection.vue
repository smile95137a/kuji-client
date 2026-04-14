<template>
  <div v-if="isEmailUser" class="changePassword">
    <h3 class="changePassword__title">修改密碼</h3>
    <p class="changePassword__subtitle">定期更換密碼可保護帳號安全</p>

    <div class="changePassword__form">
      <!-- Current Password -->
      <div class="changePassword__field">
        <label class="changePassword__label" for="cp-current">目前密碼</label>
        <div class="changePassword__inputWrap">
          <input
            id="cp-current"
            v-model="form.currentPassword"
            class="changePassword__input"
            :type="show.current ? 'text' : 'password'"
            placeholder="請輸入目前密碼"
            autocomplete="current-password"
          />
          <button
            class="changePassword__eye"
            type="button"
            @click="show.current = !show.current"
            :aria-label="show.current ? '隱藏' : '顯示'"
          >
            {{ show.current ? '🙈' : '👁' }}
          </button>
        </div>
      </div>

      <!-- New Password -->
      <div class="changePassword__field">
        <label class="changePassword__label" for="cp-new">新密碼</label>
        <div class="changePassword__inputWrap">
          <input
            id="cp-new"
            v-model="form.newPassword"
            class="changePassword__input"
            :type="show.newPass ? 'text' : 'password'"
            placeholder="至少 8 個字元"
            autocomplete="new-password"
          />
          <button
            class="changePassword__eye"
            type="button"
            @click="show.newPass = !show.newPass"
          >
            {{ show.newPass ? '🙈' : '👁' }}
          </button>
        </div>
      </div>

      <!-- Confirm New Password -->
      <div class="changePassword__field">
        <label class="changePassword__label" for="cp-confirm">確認新密碼</label>
        <div class="changePassword__inputWrap">
          <input
            id="cp-confirm"
            v-model="form.confirmNewPassword"
            class="changePassword__input"
            :class="{ 'changePassword__input--mismatch': confirmMismatch }"
            :type="show.confirm ? 'text' : 'password'"
            placeholder="再次輸入新密碼"
            autocomplete="new-password"
          />
          <button
            class="changePassword__eye"
            type="button"
            @click="show.confirm = !show.confirm"
          >
            {{ show.confirm ? '🙈' : '👁' }}
          </button>
        </div>
        <p v-if="confirmMismatch" class="changePassword__hint changePassword__hint--err">
          兩次密碼輸入不一致
        </p>
      </div>

      <!-- Feedback -->
      <p v-if="successMsg" class="changePassword__hint changePassword__hint--ok">✅ {{ successMsg }}</p>
      <p v-if="errorMsg" class="changePassword__hint changePassword__hint--err">{{ errorMsg }}</p>

      <!-- Submit -->
      <button
        class="changePassword__btn"
        type="button"
        :disabled="isLoading || confirmMismatch"
        @click="onSubmit"
      >
        <span v-if="isLoading" class="changePassword__spinner"></span>
        <span v-else>確認修改</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChangePassword } from '@/composables/useChangePassword';

const authStore = useAuthStore();
const { form, isLoading, successMsg, errorMsg, submit } = useChangePassword();

const isEmailUser = computed(() => authStore.user?.provider === 'EMAIL');

const show = reactive({ current: false, newPass: false, confirm: false });

const confirmMismatch = computed(
  () =>
    form.confirmNewPassword.length > 0 &&
    form.newPassword !== form.confirmNewPassword,
);

async function onSubmit() {
  await submit();
}
</script>

<style scoped>
.changePassword {
  background: var(--card-bg, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.changePassword__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.changePassword__subtitle {
  font-size: 0.813rem;
  color: rgba(255, 255, 255, 0.5);
  margin: -12px 0 0;
}

.changePassword__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.changePassword__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.changePassword__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.changePassword__inputWrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

.changePassword__input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 14px;
  color: #fff;
  font-size: 0.9375rem;
  outline: none;
}

.changePassword__input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.changePassword__input--mismatch {
  color: #f44336;
}

.changePassword__eye {
  flex-shrink: 0;
  padding: 0 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 44px;
}

.changePassword__eye:hover {
  color: rgba(255, 255, 255, 0.85);
}

.changePassword__hint {
  font-size: 0.813rem;
  margin: 0;
}

.changePassword__hint--ok {
  color: #4caf50;
}

.changePassword__hint--err {
  color: #f44336;
}

.changePassword__btn {
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

.changePassword__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.changePassword__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
