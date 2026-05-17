<template>
  <div class="verifyEmail">
    <div class="verifyEmail__card">
      <div class="verifyEmail__badge">Email 驗證</div>
      <h1 class="verifyEmail__title">完成信箱驗證</h1>
      <p class="verifyEmail__desc">
        我們已將 6 位數驗證碼寄到您的信箱。你也可以直接點擊驗證信中的連結完成驗證。
      </p>

      <p v-if="pageMessage" class="verifyEmail__message verifyEmail__message--info">
        {{ pageMessage }}
      </p>
      <p v-if="successMessage" class="verifyEmail__message verifyEmail__message--success">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="verifyEmail__message verifyEmail__message--error">
        {{ errorMessage }}
      </p>

      <div v-if="status === 'loading'" class="verifyEmail__status">
        正在驗證中，請稍候...
      </div>

      <div v-else-if="status === 'success'" class="verifyEmail__successPanel">
        <p class="verifyEmail__successTitle">Email 驗證成功</p>
        <p class="verifyEmail__successDesc">現在可以回到登入頁登入。</p>
        <button class="verifyEmail__btn verifyEmail__btn--primary" @click="goLogin">
          前往登入
        </button>
      </div>

      <form v-else class="verifyEmail__form" @submit.prevent="submitCode">
        <label class="verifyEmail__label" for="verify-email">Email</label>
        <input
          id="verify-email"
          v-model.trim="email"
          class="verifyEmail__input"
          type="email"
          placeholder="請輸入註冊信箱"
          autocomplete="email"
        />

        <label class="verifyEmail__label" for="verify-code">驗證碼</label>
        <input
          id="verify-code"
          v-model.trim="code"
          class="verifyEmail__input verifyEmail__input--code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="請輸入 6 位數驗證碼"
          autocomplete="one-time-code"
        />

        <button class="verifyEmail__btn verifyEmail__btn--primary" type="submit" :disabled="submitting">
          {{ submitting ? '驗證中...' : '送出驗證碼' }}
        </button>

        <button
          class="verifyEmail__btn verifyEmail__btn--secondary"
          type="button"
          :disabled="resending || resendCooldown > 0"
          @click="resendCode"
        >
          {{
            resending
              ? '寄送中...'
              : resendCooldown > 0
              ? `重新寄送 (${resendCooldown}s)`
              : '重新寄送驗證碼'
          }}
        </button>

        <button class="verifyEmail__btn verifyEmail__btn--ghost" type="button" @click="goLogin">
          回登入頁
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resendVerification, verifyEmail, verifyEmailCode } from '@/services/AuthService';

const route = useRoute();
const router = useRouter();

const status = ref<'idle' | 'loading' | 'success'>('idle');
const email = ref('');
const code = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const submitting = ref(false);
const resending = ref(false);
const resendCooldown = ref(0);
let resendTimer: ReturnType<typeof setInterval> | null = null;

const pageMessage = computed(() => {
  if (route.query.registered === '1') {
    return '註冊成功。即使你先離開這個頁面，之後仍可從登入頁回來完成驗證。';
  }
  if (route.query.source === 'login') {
    return '此帳號尚未完成 Email 驗證，請輸入驗證碼，或重新寄送驗證信。';
  }
  return '';
});

const normalizeCode = (value: string) => value.replace(/\D/g, '').slice(0, 6);

const startCooldown = () => {
  resendCooldown.value = 60;
  if (resendTimer) clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) {
      resendCooldown.value = 0;
      if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
      }
    }
  }, 1000);
};

const clearMessages = () => {
  errorMessage.value = '';
  successMessage.value = '';
};

const goLogin = () => {
  router.push({ name: 'Login', query: email.value ? { email: email.value } : undefined });
};

const submitCode = async () => {
  clearMessages();
  code.value = normalizeCode(code.value);

  if (!email.value) {
    errorMessage.value = '請先輸入註冊 Email';
    return;
  }

  if (code.value.length !== 6) {
    errorMessage.value = '請輸入 6 位數驗證碼';
    return;
  }

  submitting.value = true;
  try {
    const res = await verifyEmailCode({ email: email.value, code: code.value });
    if (res?.success) {
      status.value = 'success';
      successMessage.value = 'Email 驗證成功，現在可以登入。';
      return;
    }
    errorMessage.value = res?.message || '驗證失敗，請確認驗證碼後再試';
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.error?.message || err?.response?.data?.message || '驗證失敗，請確認驗證碼後再試';
  } finally {
    submitting.value = false;
  }
};

const resendCode = async () => {
  clearMessages();

  if (!email.value) {
    errorMessage.value = '請先輸入註冊 Email';
    return;
  }

  if (resendCooldown.value > 0 || resending.value) {
    return;
  }

  resending.value = true;
  try {
    const res = await resendVerification({ email: email.value });
    if (res?.success) {
      successMessage.value = '驗證碼已重新寄出，請到信箱查看。';
      startCooldown();
      return;
    }
    errorMessage.value = res?.message || '重寄失敗，請稍後再試';
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.error?.message || err?.response?.data?.message || '重寄失敗，請稍後再試';
  } finally {
    resending.value = false;
  }
};

onMounted(async () => {
  const queryEmail = typeof route.query.email === 'string' ? route.query.email.trim() : '';
  if (queryEmail) {
    email.value = queryEmail;
  }

  const token = typeof route.query.token === 'string' ? route.query.token.trim() : '';
  if (!token) {
    return;
  }

  status.value = 'loading';
  clearMessages();
  try {
    const res = await verifyEmail(token);
    if (res?.success) {
      status.value = 'success';
      successMessage.value = 'Email 驗證成功，現在可以登入。';
    } else {
      status.value = 'idle';
      errorMessage.value = '驗證連結已失效，請改用驗證碼或重新寄送驗證信。';
    }
  } catch {
    status.value = 'idle';
    errorMessage.value = '驗證連結已失效，請改用驗證碼或重新寄送驗證信。';
  }
});

onBeforeUnmount(() => {
  if (resendTimer) {
    clearInterval(resendTimer);
    resendTimer = null;
  }
});
</script>

<style scoped lang="scss">
.verifyEmail {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #121212;
}

.verifyEmail__card {
  width: 100%;
  max-width: 460px;
  padding: 32px 28px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24);
}

.verifyEmail__badge {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f6e5cf;
  color: #8a4b16;
  font-size: 12px;
  font-weight: 700;
}

.verifyEmail__title {
  margin: 16px 0 8px;
  font-size: 28px;
  font-weight: 800;
  color: #1b1b1b;
}

.verifyEmail__desc {
  margin: 0 0 20px;
  color: #5f5f5f;
  line-height: 1.6;
}

.verifyEmail__message {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.verifyEmail__message--info {
  background: #f4f4f4;
  color: #444;
}

.verifyEmail__message--success {
  background: #e8f7ea;
  color: #1b6b2a;
}

.verifyEmail__message--error {
  background: #fdecec;
  color: #b42318;
}

.verifyEmail__status,
.verifyEmail__successPanel {
  display: grid;
  gap: 12px;
}

.verifyEmail__successTitle {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #1b1b1b;
}

.verifyEmail__successDesc {
  margin: 0;
  color: #5f5f5f;
}

.verifyEmail__form {
  display: grid;
  gap: 12px;
}

.verifyEmail__label {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.verifyEmail__input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d8d8d8;
  border-radius: 12px;
  font-size: 15px;
  box-sizing: border-box;
}

.verifyEmail__input--code {
  letter-spacing: 6px;
  text-align: center;
}

.verifyEmail__btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.verifyEmail__btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.verifyEmail__btn--primary {
  background: #b43325;
  color: #fff;
}

.verifyEmail__btn--secondary {
  background: #2d2d2d;
  color: #fff;
}

.verifyEmail__btn--ghost {
  background: #f4f4f4;
  color: #333;
}

@media (max-width: 540px) {
  .verifyEmail__card {
    padding: 24px 20px;
  }

  .verifyEmail__title {
    font-size: 24px;
  }
}
</style>
