<!-- src/views/ResetPassword.vue -->
<template>
  <div class="reset-password">
    <Card customClass="mcard--login">
      <template #header>
        <span>重設密碼</span>
      </template>

      <div class="reset-password__container">
        <div v-if="!token" class="reset-password__error">
          <p>連結無效或已過期，請重新申請忘記密碼。</p>
          <button class="reset-password__btn" @click="goLogin">返回登入</button>
        </div>

        <form v-else class="reset-password__form" @submit.prevent="onSubmit">
          <div class="reset-password__field">
            <p class="reset-password__label">新密碼</p>
            <input
              class="reset-password__input"
              type="password"
              v-model="newPassword"
              placeholder="請輸入新密碼（至少 8 字元）"
              autocomplete="new-password"
            />
          </div>

          <div class="reset-password__field">
            <p class="reset-password__label">確認新密碼</p>
            <input
              class="reset-password__input"
              type="password"
              v-model="confirmPassword"
              placeholder="請再次輸入新密碼"
              autocomplete="new-password"
            />
            <p v-if="mismatch" class="reset-password__error-text">兩次密碼不一致</p>
          </div>

          <p v-if="errorMessage" class="reset-password__error-text reset-password__error-text--center">
            {{ errorMessage }}
          </p>

          <div class="reset-password__actions">
            <button type="submit" class="reset-password__btn" :disabled="isLoading">
              {{ isLoading ? '處理中…' : '重設密碼' }}
            </button>
          </div>
        </form>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from '@/components/common/MCard.vue';
import { resetPassword } from '@/services/AuthService';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';

const route = useRoute();
const router = useRouter();

const token = computed(() => {
  const t = route.query.token;
  return typeof t === 'string' && t.trim() ? t.trim() : '';
});

const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const mismatch = computed(
  () =>
    confirmPassword.value.length > 0 &&
    newPassword.value !== confirmPassword.value,
);

const goLogin = () => router.replace('/login');

async function onSubmit() {
  errorMessage.value = '';

  if (!newPassword.value || newPassword.value.length < 8) {
    errorMessage.value = '新密碼至少需要 8 個字元';
    return;
  }
  if (mismatch.value) {
    errorMessage.value = '兩次密碼不一致';
    return;
  }

  isLoading.value = true;
  try {
    const res = await resetPassword({
      token: token.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    });

    if (res?.success) {
      await ichibanInfoDialog({
        title: '密碼已重設',
        content: '你的密碼已更新，請重新登入。',
      });
      await router.replace('/login');
    } else {
      errorMessage.value = res?.message || '重設失敗，連結可能已過期，請重新申請。';
    }
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 400 || status === 404) {
      errorMessage.value = '重設連結已過期或無效，請重新申請忘記密碼。';
    } else {
      errorMessage.value = err?.response?.data?.error?.message || '重設失敗，請稍後再試。';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.reset-password {
  display: flex;
  justify-content: center;
  padding: 40px 16px;

  &__container {
    padding: 8px 0;
  }
  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  &__label {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
  &__input {
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 15px;
    outline: none;
    &:focus {
      border-color: #a54335;
    }
  }
  &__error-text {
    margin: 0;
    font-size: 13px;
    color: #d32f2f;
    &--center {
      text-align: center;
    }
  }
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #555;
  }
  &__actions {
    margin-top: 8px;
  }
  &__btn {
    width: 100%;
    padding: 12px;
    background: #a54335;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
