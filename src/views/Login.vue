<template>
  <div class="login">
    <Card customClass="mcard--login">
      <template #header>
        <span>會員登入</span>
      </template>

      <div class="login__container">
        <div class="login__main">
          <form class="login__form" @submit.prevent="onSubmit">
            <div class="login__auth">
              <div class="login__auth-btn" @click="handleOauthLogin('google')">
                <div class="login__auth-btn-icon">
                  <img :src="googleLogo" />
                </div>
                <div class="login__auth-btn-text">Google 帳號登入</div>
              </div>
            </div>

            <div class="login__divider">
              <div class="login__divider-line"></div>
              <div class="login__divider-text">或</div>
            </div>

            <div class="login__form-inputs">
              <p class="login__text">電子信箱</p>
              <input
                class="login__form-input"
                v-model="email"
                :class="{
                  'login__form-input--error': submitted && errors.email,
                }"
                placeholder="請輸入電子信箱"
              />
              <p
                class="login__text login__text--error"
                v-if="submitted && errors.email"
              >
                {{ errors.email }}
              </p>
            </div>

            <div class="login__form-inputs">
              <p class="login__text">密碼</p>

              <div class="login__passwordWrap">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="login__form-input login__form-input--password"
                  v-model="password"
                  :class="{
                    'login__form-input--error': submitted && errors.password,
                  }"
                  placeholder="請輸入密碼"
                />

                <button
                  class="login__eyeBtn"
                  type="button"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <font-awesome-icon
                    :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                  />
                </button>
              </div>

              <p
                class="login__text login__text--error"
                v-if="submitted && errors.password"
              >
                {{ errors.password }}
              </p>
            </div>

            <div class="login__forgot">
              <p
                class="login__text login__text--forgot"
                @click="handleForgotPassword"
              >
                忘記密碼?
              </p>
            </div>

            <div class="login__btns">
              <button type="submit" class="login__btn">登入</button>
            </div>
          </form>

          <div class="login__other">
            <div class="login__other-img">
              <img :src="loginLogin" alt="Login Illustration" />
            </div>
            <div class="login__other-info">
              <p class="login__text">歡迎來到 再來一抽 官方網站!</p>
              <p class="login__text">
                如果你還沒有帳號，請立即註冊， 開啟更多功能哦！
              </p>
            </div>
            <div class="login__other-btn">
              <div class="login__btn" @click="forwardRegistration">註冊</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import googleLogo from '@/assets/image/google.svg';
import loginLogin from '@/assets/image/login_logo.png';
import Card from '@/components/common/MCard.vue';

import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import * as yup from 'yup';

import { executeApi } from '@/utils/executeApiUtils';
import { saveState } from '@/utils/Localstorage';
import { useAuthStore } from '@/stores/useAuthStore';
import { forgotPassword, login } from '@/services/AuthService';
import { useOverlayStore } from '@/stores/overlay';
import { ichibanForgotPasswordDialog } from '@/utils/dialog/ichibanForgotPasswordDialog';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';

const router = useRouter();
const overlay = useOverlayStore();
const authStore = useAuthStore();

const submitted = ref(false);
const showPassword = ref(false);

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

const [email] = defineField('email');
const [password] = defineField('password');

const persistAuth = (data: any) => {
  const accessToken = data?.accessToken;
  const refreshToken = data?.refreshToken;
  const user = data?.user;

  if (accessToken) saveState('kujiToken', accessToken);
  if (refreshToken) saveState('refreshKujiToken', refreshToken);

  saveState('kujiTokenType', 'Bearer');

  if (user) {
    const { password: _password, ...safeUser } = user;
    saveState('kujiUser', safeUser);
  }

  authStore.setAuth({
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    user: user
      ? (() => {
          const { password: _password, ...safeUser } = user;
          return safeUser;
        })()
      : undefined,
  });
};

const onSubmit = handleSubmit(
  async (values) => {
    submitted.value = true;

    await executeApi({
      fn: async () =>
        await login({
          email: values.email,
          password: values.password,
        }),
      successTitle: '登入成功',
      successMessage: '歡迎回來！',
      errorTitle: '登入失敗',
      errorMessage: '帳號或密碼錯誤，請重新輸入',
      showFailDialog: true,
      showSuccessDialog: true,
      onSuccess: async (data: any) => {
        persistAuth(data);
        await router.push('/');
      },
    });
  },
  async () => {
    submitted.value = true;
  },
);

const forwardRegistration = () => {
  router.push('/register');
};

const handleOauthLogin = async (provider: string) => {
  console.log('oauth login provider:', provider);
};
const handleForgotPassword = async () => {
  overlay.open();

  try {
    const inputEmail = await ichibanForgotPasswordDialog({
      title: '忘記密碼',
      content: `請輸入你的 <b>Email</b><br/>我們會寄送重設密碼連結給你`,
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
        '若此 Email 存在，我們會寄送重設密碼連結給你（請留意垃圾郵件）。',
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
