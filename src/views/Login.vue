<!-- src/views/login/Login.vue -->
<template>
  <main class="login">
    <section class="login__card">
      <header class="login__header">
        <div>
          <p class="login__eyebrow">MEMBER LOGIN</p>
          <h1 class="login__title">會員登入</h1>
        </div>
      </header>

      <div class="login__main">
        <form class="login__form" @submit.prevent="onSubmit">
          <div class="login__formContent">
            <div class="login__formHead">
              <h2 class="login__formTitle">登入帳號</h2>
              <p class="login__formDesc">使用 Google 或電子信箱登入會員帳號</p>
            </div>

            <button
              type="button"
              class="login__googleBtn"
              @click="handleOauthLogin('google')"
            >
              <span class="login__googleIcon">
                <img :src="googleLogo" alt="Google logo" />
              </span>

              <span>Google 帳號登入</span>

              <font-awesome-icon
                class="login__googleArrow"
                :icon="['fas', 'chevron-right']"
              />
            </button>

            <div class="login__divider">
              <span></span>
              <p>或使用信箱登入</p>
              <span></span>
            </div>

            <p v-if="infoMessage" class="login__notice login__notice--info">
              {{ infoMessage }}
            </p>

            <div class="login__field">
              <label class="login__label">電子信箱</label>

              <input
                v-model="emailField"
                class="login__input"
                :class="{ 'login__input--error': submitted && errors.email }"
                type="email"
                placeholder="請輸入電子信箱"
              />

              <p v-if="submitted && errors.email" class="login__error">
                {{ errors.email }}
              </p>
            </div>

            <div class="login__field">
              <label class="login__label">密碼</label>

              <div class="login__password">
                <input
                  v-model="passwordField"
                  class="login__input login__input--password"
                  :class="{
                    'login__input--error': submitted && errors.password,
                  }"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="請輸入密碼"
                />

                <button
                  class="login__eyeBtn"
                  type="button"
                  :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                  @click="showPassword = !showPassword"
                >
                  <font-awesome-icon
                    :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                  />
                </button>
              </div>

              <p v-if="submitted && errors.password" class="login__error">
                {{ errors.password }}
              </p>
            </div>

            <div class="login__forgot">
              <button
                class="login__forgotBtn"
                type="button"
                @click="handleForgotPassword"
              >
                忘記密碼？
              </button>
            </div>

            <div v-if="isEmailNotVerified" class="login__verifyBox">
              <p class="login__notice login__notice--error">
                {{ errorMessage }}
              </p>

              <div class="login__verifyActions">
                <button
                  type="button"
                  class="login__outlineBtn"
                  :disabled="resendCooldown > 0 || resendLoading"
                  @click="sendVerificationEmail"
                >
                  {{
                    resendLoading
                      ? '發送中…'
                      : resendCooldown > 0
                        ? `重新發送（${resendCooldown}s）`
                        : '重新發送驗證信'
                  }}
                </button>

                <button
                  type="button"
                  class="login__outlineBtn"
                  @click="goToVerifyEmail"
                >
                  前往驗證頁
                </button>
              </div>

              <p
                v-if="resendMessage"
                class="login__notice"
                :class="
                  resendMessage.includes('已發送')
                    ? 'login__notice--success'
                    : 'login__notice--error'
                "
              >
                {{ resendMessage }}
              </p>
            </div>

            <p
              v-else-if="errorMessage"
              class="login__notice login__notice--error"
            >
              {{ errorMessage }}
            </p>
          </div>

          <div class="login__bottom">
            <button
              type="submit"
              class="login__submitBtn"
              :disabled="isLoading || isAccountLocked"
            >
              <span v-if="isLoading" class="login__spinner"></span>
              <template v-else>登入</template>
            </button>
          </div>
        </form>

        <aside class="login__side">
          <div class="login__sideBg"></div>

          <div class="login__sideContent">
            <div class="login__logoBox">
              <img :src="loginLogin" alt="Login Illustration" />
            </div>

            <div class="login__sideText">
              <h2>還沒有帳號嗎？</h2>
              <p>立即註冊會員，開啟抽賞、賞品盒、訂單查詢與更多功能。</p>
            </div>
          </div>

          <div class="login__bottom">
            <button
              type="button"
              class="login__registerBtn"
              @click="forwardRegistration"
            >
              註冊會員
            </button>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import googleLogo from '@/assets/image/google.svg';
import loginLogin from '@/assets/image/login_logo.png';

import { useForm } from 'vee-validate';
import { useRoute, useRouter } from 'vue-router';
import * as yup from 'yup';

import { executeApi } from '@/utils/executeApiUtils';
import {
  forgotPassword,
  getGoogleOAuthAuthorizationUrl,
} from '@/services/AuthService';
import { useOverlayStore } from '@/stores/overlay';
import { ichibanForgotPasswordDialog } from '@/utils/dialog/ichibanForgotPasswordDialog';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { useLogin } from '@/composables/useLogin';

const router = useRouter();
const route = useRoute();
const overlay = useOverlayStore();

const infoMessage = ref('');
const submitted = ref(false);
const showPassword = ref(false);

const {
  email,
  password,
  isLoading,
  errorMessage,
  isEmailNotVerified,
  isAccountLocked,
  resendCooldown,
  resendLoading,
  resendMessage,
  sendVerificationEmail,
  goToVerifyEmail,
  submitLogin,
} = useLogin();

const schema = yup.object({
  email: yup.string().required('電子信箱為必填').email('Email 格式不正確'),
  password: yup.string().required('密碼為必填'),
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    password: '',
  },
  validateOnMount: false,
});

const [emailField] = defineField('email');
const [passwordField] = defineField('password');

onMounted(() => {
  if (route.query.action === 'resend') {
    infoMessage.value =
      '您的驗證連結已失效，請先登入，再點擊「重新發送驗證信」。';
  }
});

const onSubmit = handleSubmit(
  async (values) => {
    submitted.value = true;
    email.value = values.email;
    password.value = values.password;

    await submitLogin();
  },
  async () => {
    submitted.value = true;
  },
);

const forwardRegistration = () => {
  router.push('/register');
};

const handleOauthLogin = (provider: string) => {
  if (provider !== 'google') return;

  window.location.assign(getGoogleOAuthAuthorizationUrl());
};

const handleForgotPassword = async () => {
  overlay.open();

  try {
    const inputEmail = await ichibanForgotPasswordDialog({
      title: '忘記密碼',
      content: `請輸入你的 <b>Email</b><br/>我們會寄送臨時密碼到你的信箱`,
      confirmText: '送出',
      cancelText: '取消',
      placeholder: '請輸入 Email',
      defaultEmail: '',
      hint: '※ 信件可能會在垃圾郵件，請稍微找一下',
      data: {
        id: 'forgot-password',
        role: 'dialog',
        'aria-label': 'forgot-password-dialog',
      },
    });

    const targetEmail = String(inputEmail || '').trim();

    if (!targetEmail) return;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail);

    if (!emailOk) {
      await ichibanInfoDialog({
        title: 'Email 格式不正確',
        content: '請確認輸入的 Email 格式',
      });

      return;
    }

    await executeApi({
      fn: async () => forgotPassword({ email: targetEmail }),
      successTitle: '已送出重設申請',
      successMessage:
        '若此 Email 存在，我們會寄送臨時密碼給你（請留意垃圾郵件）。',
      errorTitle: '送出失敗',
      errorMessage: '目前無法送出重設申請，請稍後再試或聯繫客服。',
      showSuccessDialog: true,
      showFailDialog: true,
      onSuccess: async () => {},
    });
  } finally {
    overlay.close();
  }
};
</script>

<style scoped lang="scss">
.login {
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
}

.login__card {
  width: min(1180px, 100%);
  overflow: hidden;

  border-radius: 34px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);
}

.login__header {
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
  color: #fff;
}

.login__eyebrow {
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

.login__title {
  margin: 0;
  color: #fff;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: 3px;
}

.login__main {
  min-height: 620px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);

  background: #fff;
}

.login__form,
.login__side {
  min-height: 620px;
  padding: 54px 58px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login__form {
  border-right: 1px solid var(--line);
}

.login__formContent {
  width: 100%;
}

.login__formHead {
  margin-bottom: 26px;
}

.login__formTitle {
  margin: 0;
  color: var(--text);
  font-size: 31px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;
}

.login__formDesc {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.6;
  font-weight: 800;
}

.login__googleBtn {
  width: 100%;
  min-height: 58px;
  padding: 0 18px;
  border-radius: 18px;
  border: 1px solid rgba(180, 51, 37, 0.16);
  cursor: pointer;

  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 12px;

  background: #fff;
  color: var(--text);
  box-shadow: 0 12px 28px rgba(63, 36, 18, 0.055);

  font-size: 16px;
  font-weight: 950;

  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(180, 51, 37, 0.32);
    box-shadow: 0 18px 34px rgba(63, 36, 18, 0.09);
  }
}

.login__googleIcon {
  width: 38px;
  height: 38px;
  border-radius: 14px;

  display: grid;
  place-items: center;

  background: var(--cream);
  border: 1px solid var(--line);

  img {
    width: 23px;
    height: 23px;
    object-fit: contain;
  }
}

.login__googleArrow {
  color: var(--text-soft);
  font-size: 13px;
}

.login__divider {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;

  margin: 26px 0 24px;

  span {
    height: 1px;
    background: var(--line);
  }

  p {
    margin: 0;
    color: var(--text-soft);
    font-size: 14px;
    font-weight: 900;
  }
}

.login__field {
  margin-bottom: 18px;
}

.login__label {
  display: block;
  margin-bottom: 8px;

  color: rgba(36, 22, 16, 0.72);
  font-size: 14px;
  font-weight: 900;
}

.login__input {
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

  &--error {
    border-color: rgba(180, 35, 24, 0.62);
    box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
  }

  &--password {
    padding-right: 54px;
  }
}

.login__password {
  position: relative;
}

.login__eyeBtn {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);

  width: 40px;
  height: 40px;
  border-radius: 15px;
  border: 0;
  cursor: pointer;

  display: grid;
  place-items: center;

  background: transparent;
  color: var(--text-soft);

  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    color: var(--primary);
    background: var(--primary-soft);
  }

  &:active {
    transform: translateY(-50%) scale(0.96);
  }
}

.login__forgot {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 24px;
}

.login__forgotBtn {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;

  color: var(--primary);
  font-size: 14px;
  font-weight: 950;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.login__bottom {
  width: 100%;
}

.login__submitBtn,
.login__registerBtn,
.login__outlineBtn {
  border-radius: 999px;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  font-weight: 950;

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease,
    background 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.login__submitBtn {
  width: 100%;
  min-height: 60px;
  border: 1px solid var(--primary);

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 20px;
  letter-spacing: 2px;
  box-shadow: 0 16px 30px rgba(180, 51, 37, 0.2);

  &:hover:not(:disabled) {
    box-shadow: 0 20px 38px rgba(180, 51, 37, 0.28);
  }
}

.login__side {
  position: relative;
  overflow: hidden;

  align-items: center;
  text-align: center;

  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.12), transparent 32%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 100%);
}

.login__sideBg {
  position: absolute;
  right: -90px;
  top: -100px;
  width: 270px;
  height: 270px;
  border-radius: 999px;
  background: rgba(180, 51, 37, 0.08);
  pointer-events: none;
}

.login__sideContent {
  position: relative;
  z-index: 1;
  width: 100%;
}

.login__logoBox {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;

  img {
    width: min(360px, 100%);
    height: auto;
    display: block;
    filter: drop-shadow(0 20px 36px rgba(63, 36, 18, 0.14));
  }
}

.login__sideText {
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

.login__registerBtn {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 60px;
  border: 1px solid var(--primary);

  background: #fff;
  color: var(--primary);

  font-size: 18px;
  letter-spacing: 1.4px;
  box-shadow: 0 12px 26px rgba(63, 36, 18, 0.06);

  &:hover {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 18px 34px rgba(180, 51, 37, 0.18);
  }
}

.login__notice {
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: 16px;

  font-size: 13px;
  line-height: 1.55;
  font-weight: 850;
  text-align: center;

  &--info {
    margin-bottom: 14px;
    color: #2563eb;
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

.login__error {
  margin: 8px 0 0;
  color: var(--danger);
  font-size: 12px;
  line-height: 1.5;
  font-weight: 850;
}

.login__verifyBox {
  margin-top: 14px;
  padding: 14px;
  border-radius: 20px;
  background: var(--cream);
  border: 1px solid var(--line);
}

.login__verifyActions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.login__outlineBtn {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(180, 51, 37, 0.22);
  background: #fff;
  color: var(--primary);
  font-size: 13px;

  &:hover:not(:disabled) {
    background: var(--primary-soft);
    box-shadow: 0 10px 20px rgba(63, 36, 18, 0.06);
  }
}

.login__spinner {
  width: 17px;
  height: 17px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  animation: loginSpin 0.7s linear infinite;
}

@media (max-width: 980px) {
  .login {
    padding: 18px;
  }

  .login__main {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .login__form,
  .login__side {
    min-height: auto;
    padding: 42px;
  }

  .login__form {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .login__logoBox img {
    width: min(280px, 100%);
  }

  .login__sideText h2 {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .login {
    padding: 0;
    align-items: stretch;
  }

  .login__card {
    min-height: 100vh;
    border-radius: 0;
    border: 0;
    box-shadow: none;
  }

  .login__header {
    min-height: 104px;
    padding: 24px 18px;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 14px 28px rgba(63, 36, 18, 0.12);
  }

  .login__title {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .login__eyebrow {
    min-height: 24px;
    padding: 0 10px;
    margin-bottom: 7px;
    font-size: 11px;
    letter-spacing: 1.3px;
  }

  .login__form,
  .login__side {
    padding: 30px 16px;
  }

  .login__formTitle {
    font-size: 25px;
  }

  .login__formDesc {
    font-size: 13px;
  }

  .login__googleBtn {
    min-height: 54px;
    border-radius: 16px;
    font-size: 14px;
    grid-template-columns: 36px minmax(0, 1fr) 18px;
  }

  .login__divider {
    gap: 12px;
    margin: 22px 0 20px;

    p {
      font-size: 13px;
    }
  }

  .login__input {
    height: 52px;
    border-radius: 15px;
    font-size: 14px;
  }

  .login__field {
    margin-bottom: 15px;
  }

  .login__submitBtn,
  .login__registerBtn {
    min-height: 54px;
    font-size: 17px;
  }

  .login__verifyActions {
    flex-direction: column;
  }

  .login__outlineBtn {
    width: 100%;
    min-height: 44px;
  }

  .login__side {
    padding-top: 26px;
  }

  .login__logoBox {
    margin-bottom: 20px;

    img {
      width: min(240px, 100%);
    }
  }

  .login__sideText h2 {
    font-size: 22px;
  }

  .login__sideText p {
    font-size: 13px;
  }
}

@media (max-width: 380px) {
  .login__form,
  .login__side {
    padding-left: 14px;
    padding-right: 14px;
  }

  .login__title {
    font-size: 26px;
  }
}

@keyframes loginSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
