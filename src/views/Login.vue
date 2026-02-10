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
                :class="{ 'login__form-input--error': errors.email }"
                placeholder="請輸入電子信箱"
              />
              <p class="login__text login__text--error" v-if="errors.email">
                {{ errors.email }}
              </p>
            </div>

            <div class="login__form-inputs">
              <p class="login__text">密碼</p>
              <input
                type="password"
                class="login__form-input"
                v-model="password"
                :class="{ 'login__form-input--error': errors.password }"
                placeholder="請輸入密碼"
              />
              <p class="login__text login__text--error" v-if="errors.password">
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
import googleLogo from '@/assets/image/google.svg';
import loginLogin from '@/assets/image/login_logo.png';
import Card from '@/components/common/MCard.vue';

import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import * as yup from 'yup';

import { executeApi } from '@/utils/executeApiUtils';
import { saveState } from '@/utils/Localstorage';
import { useAuthStore } from '@/stores/useAuthStore';
import { login, loginWithGoogle } from '@/services/AuthService';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';

const router = useRouter();
const authStore = useAuthStore();

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
});

const [email] = defineField('email');
const [password] = defineField('password');

const persistAuth = (data: any) => {
  const accessToken = data ? data.accessToken : undefined;
  const refreshToken = data ? data.refreshToken : undefined;
  const user = data ? data.user : undefined;

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

const onSubmit = handleSubmit(async (values) => {
  await executeApi({
    fn: async () => {
      return await login({
        email: values.email,
        password: values.password,
      });
    },
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
});

const forwardRegistration = () => {
  router.push('/register');
};

/**
 * Google OAuth 登入
 * 使用 Google Identity Services (GIS) API
 * 請在 `index.html` 中加入 Google Identity Services SDK（範例：載入 https://accounts.google.com/gsi/client）
 * 並在 .env 設定 VITE_GOOGLE_CLIENT_ID
 */
const handleOauthLogin = async (provider: string) => {
  if (provider !== 'google') {
    console.warn('Unsupported OAuth provider:', provider);
    return;
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    await ichibanInfoDialog({
      title: '設定錯誤',
      content: 'Google 登入尚未設定，請聯繫管理員。',
    });
    return;
  }

  // 檢查 Google Identity Services 是否載入
  if (typeof (window as any).google === 'undefined') {
    await ichibanInfoDialog({
      title: '載入失敗',
      content: 'Google 登入服務載入失敗，請重新整理頁面後再試。',
    });
    return;
  }

  try {
    // 使用 Google Identity Services 的 One Tap 或按鈕登入
    const google = (window as any).google;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
      auto_select: false,
    });

    // 觸發 Google 登入流程
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        // One Tap 無法顯示，嘗試使用 OAuth2 彈出視窗
        const oauth2Client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (response: any) => {
            if (response.access_token) {
              // 使用 access_token 取得 ID token（需要額外 API）
              // 或直接發送 access_token 給後端驗證
              await handleGoogleCallback({ credential: response.access_token });
            }
          },
        });
        oauth2Client.requestAccessToken();
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    await ichibanInfoDialog({
      title: '登入失敗',
      content: 'Google 登入發生錯誤，請稍後再試。',
    });
  }
};

/**
 * Google 登入回調處理
 */
const handleGoogleCallback = async (response: { credential: string }) => {
  if (!response.credential) {
    await ichibanInfoDialog({
      title: '登入失敗',
      content: '無法取得 Google 憑證，請重新嘗試。',
    });
    return;
  }

  await executeApi({
    fn: async () => {
      return await loginWithGoogle({
        idToken: response.credential,
      });
    },
    successTitle: '登入成功',
    successMessage: '歡迎回來！',
    errorTitle: '登入失敗',
    errorMessage: 'Google 帳號登入失敗，請重新嘗試或使用其他方式登入。',
    showFailDialog: true,
    showSuccessDialog: true,
    onSuccess: async (data: any) => {
      persistAuth(data);
      await router.push('/');
    },
  });
};

const handleForgotPassword = async () => {
  router.push('/forgot-password');
};
</script>

<style scoped>
/* Add your scoped styles here or leave it empty */
</style>
