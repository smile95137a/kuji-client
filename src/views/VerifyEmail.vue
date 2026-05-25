<!-- src/views/VerifyEmail.vue -->
<template>
  <main class="verifyEmail">
    <section class="verifyEmail__card">
      <header class="verifyEmail__header">
        <div>
          <p class="verifyEmail__eyebrow">EMAIL VERIFY</p>
          <h1 class="verifyEmail__title">完成信箱驗證</h1>
        </div>
      </header>

      <div class="verifyEmail__main">
        <div class="verifyEmail__content">
          <div class="verifyEmail__formContent">
            <div class="verifyEmail__formHead">
              <h2 class="verifyEmail__formTitle">驗證會員信箱</h2>
              <p class="verifyEmail__formDesc">
                我們已將 6
                位數驗證碼寄到您的信箱。你也可以直接點擊驗證信中的連結完成驗證。
              </p>
            </div>

            <p
              v-if="pageMessage"
              class="verifyEmail__notice verifyEmail__notice--info"
            >
              {{ pageMessage }}
            </p>

            <p
              v-if="successMessage"
              class="verifyEmail__notice verifyEmail__notice--success"
            >
              {{ successMessage }}
            </p>

            <p
              v-if="errorMessage"
              class="verifyEmail__notice verifyEmail__notice--error"
            >
              {{ errorMessage }}
            </p>

            <div v-if="status === 'loading'" class="verifyEmail__status">
              <span class="verifyEmail__spinner"></span>
              <p>正在驗證中，請稍候...</p>
            </div>

            <div
              v-else-if="status === 'success'"
              class="verifyEmail__successPanel"
            >
              <div class="verifyEmail__successIcon">
                <font-awesome-icon :icon="['fas', 'check']" />
              </div>

              <div>
                <p class="verifyEmail__successTitle">Email 驗證成功</p>
                <p class="verifyEmail__successDesc">
                  你的信箱已完成驗證，現在可以回到登入頁登入。
                </p>
              </div>

              <button
                class="verifyEmail__submitBtn"
                type="button"
                @click="goLogin"
              >
                前往登入
              </button>
            </div>

            <form v-else class="verifyEmail__form" @submit.prevent="submitCode">
              <div class="verifyEmail__field">
                <label class="verifyEmail__label" for="verify-email">
                  Email
                </label>

                <input
                  id="verify-email"
                  v-model.trim="email"
                  class="verifyEmail__input"
                  type="email"
                  placeholder="請輸入註冊信箱"
                  autocomplete="email"
                />
              </div>

              <div class="verifyEmail__field">
                <label class="verifyEmail__label" for="verify-code">
                  驗證碼
                </label>

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
              </div>

              <div class="verifyEmail__actions">
                <button
                  class="verifyEmail__submitBtn"
                  type="submit"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="verifyEmail__spinner"></span>
                  <template v-else>送出驗證碼</template>
                </button>

                <button
                  class="verifyEmail__outlineBtn"
                  type="button"
                  :disabled="resending || resendCooldown > 0"
                  @click="resendCode"
                >
                  {{
                    resending
                      ? '寄送中...'
                      : resendCooldown > 0
                        ? `重新寄送（${resendCooldown}s）`
                        : '重新寄送驗證碼'
                  }}
                </button>

                <button
                  class="verifyEmail__ghostBtn"
                  type="button"
                  @click="goLogin"
                >
                  回登入頁
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside class="verifyEmail__side">
          <div class="verifyEmail__sideBg"></div>

          <div class="verifyEmail__sideContent">
            <div class="verifyEmail__iconBox">
              <font-awesome-icon :icon="['fas', 'envelope-open-text']" />
            </div>

            <div class="verifyEmail__sideText">
              <h2>差一步就完成囉</h2>
              <p>
                請到信箱收取驗證碼，完成後即可登入會員，使用抽賞、賞品盒與訂單查詢功能。
              </p>
            </div>

            <div class="verifyEmail__tipBox">
              <p class="verifyEmail__tipTitle">小提醒</p>
              <p class="verifyEmail__tipDesc">
                如果沒有收到信件，可以先檢查垃圾郵件，或重新寄送驗證碼。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  resendVerification,
  verifyEmail,
  verifyEmailCode,
} from '@/services/AuthService';

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
  router.push({
    name: 'Login',
    query: email.value ? { email: email.value } : undefined,
  });
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
    errorMessage.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      '驗證失敗，請確認驗證碼後再試';
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
    errorMessage.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      '重寄失敗，請稍後再試';
  } finally {
    resending.value = false;
  }
};

onMounted(async () => {
  const queryEmail =
    typeof route.query.email === 'string' ? route.query.email.trim() : '';

  if (queryEmail) {
    email.value = queryEmail;
  }

  const token =
    typeof route.query.token === 'string' ? route.query.token.trim() : '';

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
  padding: 24px;

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 999;

  background:
    radial-gradient(circle at 8% 0%, rgba(180, 51, 37, 0.06), transparent 30%),
    radial-gradient(
      circle at 92% 10%,
      rgba(229, 166, 87, 0.12),
      transparent 28%
    ),
    #fff;

  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
  --danger: #b42318;
  --success: #2e7d32;
  --blue: #2563eb;
}

.verifyEmail__card {
  width: min(1080px, 100%);
  overflow: hidden;

  border-radius: 34px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);
}

.verifyEmail__header {
  min-height: 112px;
  padding: 26px 36px;

  display: flex;
  align-items: center;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(255, 255, 255, 0.32),
      transparent 32%
    ),
    linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
  color: #fff;
}

.verifyEmail__eyebrow {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 8px;

  display: inline-flex;
  align-items: center;

  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);

  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.verifyEmail__title {
  margin: 0;
  color: #fff;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: 3px;
}

.verifyEmail__main {
  min-height: 580px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.88fr);

  background: #fff;
}

.verifyEmail__content,
.verifyEmail__side {
  min-height: 580px;
  padding: 54px 58px;
}

.verifyEmail__content {
  display: flex;
  align-items: center;
  border-right: 1px solid var(--line);
}

.verifyEmail__formContent {
  width: 100%;
}

.verifyEmail__formHead {
  margin-bottom: 26px;
}

.verifyEmail__formTitle {
  margin: 0;
  color: var(--text);
  font-size: 31px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;
}

.verifyEmail__formDesc {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.7;
  font-weight: 800;
}

.verifyEmail__notice {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 16px;

  font-size: 13px;
  line-height: 1.55;
  font-weight: 850;
  text-align: center;

  &--info {
    color: var(--blue);
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.12);
  }

  &--error {
    color: var(--danger);
    background: rgba(180, 35, 24, 0.08);
    border: 1px solid rgba(180, 35, 24, 0.12);
  }

  &--success {
    color: var(--success);
    background: rgba(46, 125, 50, 0.08);
    border: 1px solid rgba(46, 125, 50, 0.12);
  }
}

.verifyEmail__status {
  min-height: 180px;
  padding: 28px;
  border-radius: 24px;

  display: grid;
  place-items: center;
  gap: 14px;

  background: var(--cream);
  border: 1px solid var(--line);

  p {
    margin: 0;
    color: var(--text-soft);
    font-size: 15px;
    line-height: 1.6;
    font-weight: 850;
  }
}

.verifyEmail__successPanel {
  padding: 26px;
  border-radius: 26px;

  display: grid;
  gap: 18px;

  background:
    radial-gradient(circle at 90% 0%, rgba(46, 125, 50, 0.12), transparent 32%),
    var(--cream);
  border: 1px solid var(--line);
}

.verifyEmail__successIcon {
  width: 58px;
  height: 58px;
  border-radius: 22px;

  display: grid;
  place-items: center;

  background: rgba(46, 125, 50, 0.1);
  color: var(--success);
  font-size: 24px;
}

.verifyEmail__successTitle {
  margin: 0;
  color: var(--text);
  font-size: 24px;
  line-height: 1.35;
  font-weight: 950;
  letter-spacing: 1px;
}

.verifyEmail__successDesc {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.7;
  font-weight: 800;
}

.verifyEmail__form {
  display: grid;
  gap: 18px;
}

.verifyEmail__field {
  display: grid;
  gap: 8px;
}

.verifyEmail__label {
  color: rgba(36, 22, 16, 0.72);
  font-size: 14px;
  font-weight: 900;
}

.verifyEmail__input {
  width: 100%;
  height: 58px;
  padding: 0 18px;
  border-radius: 18px;
  border: 1px solid var(--line);
  outline: none;
  box-sizing: border-box;

  background: #fff;
  color: var(--text);

  font-size: 15px;
  font-weight: 850;

  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;

  &::placeholder {
    color: rgba(36, 22, 16, 0.34);
  }

  &:focus {
    border-color: rgba(180, 51, 37, 0.48);
    box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
  }

  &--code {
    text-align: center;
    letter-spacing: 8px;
    font-size: 18px;
    font-weight: 950;

    &::placeholder {
      letter-spacing: 0;
      font-size: 14px;
      font-weight: 850;
    }
  }
}

.verifyEmail__actions {
  display: grid;
  gap: 12px;
  margin-top: 6px;
}

.verifyEmail__submitBtn,
.verifyEmail__outlineBtn,
.verifyEmail__ghostBtn {
  width: 100%;
  min-height: 58px;
  border-radius: 999px;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  font-size: 16px;
  font-weight: 950;
  letter-spacing: 1px;

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.verifyEmail__submitBtn {
  border: 1px solid var(--primary);
  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;
  box-shadow: 0 16px 30px rgba(180, 51, 37, 0.2);

  &:hover:not(:disabled) {
    box-shadow: 0 20px 38px rgba(180, 51, 37, 0.28);
  }
}

.verifyEmail__outlineBtn {
  border: 1px solid rgba(180, 51, 37, 0.22);
  background: #fff;
  color: var(--primary);

  &:hover:not(:disabled) {
    background: var(--primary-soft);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.06);
  }
}

.verifyEmail__ghostBtn {
  border: 1px solid var(--line);
  background: var(--cream);
  color: var(--text);

  &:hover:not(:disabled) {
    background: #fff;
    color: var(--primary);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.06);
  }
}

.verifyEmail__side {
  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.12), transparent 32%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 100%);
}

.verifyEmail__sideBg {
  position: absolute;
  right: -90px;
  top: -100px;
  width: 270px;
  height: 270px;
  border-radius: 999px;
  background: rgba(180, 51, 37, 0.08);
  pointer-events: none;
}

.verifyEmail__sideContent {
  position: relative;
  z-index: 1;
  width: 100%;
}

.verifyEmail__iconBox {
  width: 160px;
  height: 160px;
  border-radius: 46px;
  margin: 0 auto 30px;

  display: grid;
  place-items: center;

  background:
    radial-gradient(
      circle at 28% 22%,
      rgba(255, 255, 255, 0.78),
      transparent 36%
    ),
    linear-gradient(135deg, rgba(180, 51, 37, 0.12), rgba(228, 170, 67, 0.2));
  color: var(--primary);
  border: 1px solid rgba(180, 51, 37, 0.12);
  box-shadow: 0 20px 36px rgba(63, 36, 18, 0.1);

  font-size: 64px;
}

.verifyEmail__sideText {
  max-width: 400px;
  margin: 0 auto;

  h2 {
    margin: 0;
    color: var(--text);
    font-size: 28px;
    line-height: 1.3;
    font-weight: 950;
    letter-spacing: 1px;
  }

  p {
    margin: 12px 0 0;
    color: var(--text-soft);
    font-size: 15px;
    line-height: 1.8;
    font-weight: 800;
  }
}

.verifyEmail__tipBox {
  max-width: 380px;
  margin: 28px auto 0;
  padding: 18px;
  border-radius: 22px;

  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 12px 26px rgba(63, 36, 18, 0.05);
}

.verifyEmail__tipTitle {
  margin: 0;
  color: var(--primary);
  font-size: 14px;
  line-height: 1.4;
  font-weight: 950;
  letter-spacing: 1px;
}

.verifyEmail__tipDesc {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.7;
  font-weight: 800;
}

.verifyEmail__spinner {
  width: 17px;
  height: 17px;
  border-radius: 999px;
  border: 2px solid rgba(180, 51, 37, 0.25);
  border-top-color: var(--primary);
  animation: verifyEmailSpin 0.7s linear infinite;
}

.verifyEmail__submitBtn .verifyEmail__spinner {
  border-color: rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
}

@media (max-width: 980px) {
  .verifyEmail {
    padding: 18px;
  }

  .verifyEmail__main {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .verifyEmail__content,
  .verifyEmail__side {
    min-height: auto;
    padding: 42px;
  }

  .verifyEmail__content {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .verifyEmail__iconBox {
    width: 128px;
    height: 128px;
    border-radius: 36px;
    margin-bottom: 24px;
    font-size: 50px;
  }

  .verifyEmail__sideText h2 {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .verifyEmail {
    padding: 0;
    align-items: stretch;
  }

  .verifyEmail__card {
    min-height: 100vh;
    border-radius: 0;
    border: 0;
    box-shadow: none;
  }

  .verifyEmail__header {
    min-height: 104px;
    padding: 24px 18px;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 14px 28px rgba(63, 36, 18, 0.12);
  }

  .verifyEmail__title {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .verifyEmail__eyebrow {
    min-height: 24px;
    padding: 0 10px;
    margin-bottom: 7px;
    font-size: 11px;
    letter-spacing: 1.3px;
  }

  .verifyEmail__content,
  .verifyEmail__side {
    padding: 30px 16px;
  }

  .verifyEmail__formTitle {
    font-size: 25px;
  }

  .verifyEmail__formDesc {
    font-size: 13px;
  }

  .verifyEmail__input {
    height: 52px;
    border-radius: 15px;
    font-size: 14px;

    &--code {
      letter-spacing: 6px;
      font-size: 17px;
    }
  }

  .verifyEmail__submitBtn,
  .verifyEmail__outlineBtn,
  .verifyEmail__ghostBtn {
    min-height: 54px;
    font-size: 15px;
  }

  .verifyEmail__successPanel {
    padding: 20px;
    border-radius: 22px;
  }

  .verifyEmail__successTitle {
    font-size: 22px;
  }

  .verifyEmail__iconBox {
    width: 112px;
    height: 112px;
    border-radius: 32px;
    font-size: 44px;
  }

  .verifyEmail__sideText h2 {
    font-size: 22px;
  }

  .verifyEmail__sideText p {
    font-size: 13px;
  }

  .verifyEmail__tipBox {
    margin-top: 22px;
  }
}

@media (max-width: 380px) {
  .verifyEmail__content,
  .verifyEmail__side {
    padding-left: 14px;
    padding-right: 14px;
  }

  .verifyEmail__title {
    font-size: 26px;
  }
}

@keyframes verifyEmailSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
