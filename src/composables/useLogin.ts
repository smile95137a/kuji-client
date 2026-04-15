// src/composables/useLogin.ts
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { login } from '@/services/AuthService';

function getHttpStatus(err: unknown): number | null {
  return (err as any)?.response?.status ?? null;
}

function parseLoginError(err: unknown): string {
  const status = getHttpStatus(err);
  if (status === 401) return '帳號或密碼錯誤，請重新輸入';
  if (status === 403) return '此帳號已停用，請聯繫客服';
  if (status === 400) return '此帳號使用 Google 登入，請改用 Google 帳號登入';
  const bodyMsg = (err as any)?.response?.data?.error?.message
    ?? (err as any)?.response?.data?.message;
  return bodyMsg || '登入失敗，請稍後再試';
}

export function useLogin() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const email = ref('');
  const password = ref('');
  const isLoading = ref(false);
  const errorMessage = ref('');

  async function submitLogin() {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      const res = await login({ email: email.value, password: password.value });

      if (!res?.success) {
        errorMessage.value = res?.message || '登入失敗，請稍後再試';
        return;
      }

      authStore.setAuth({
        accessToken: res.data?.accessToken,
        refreshToken: res.data?.refreshToken,
        tokenType: res.data?.tokenType ?? 'Bearer',
        user: res.data?.user,
      });

      const redirect =
        typeof route.query.redirect === 'string'
          ? route.query.redirect
          : '/member-center/profile';
      await router.replace(redirect);
    } catch (err) {
      errorMessage.value = parseLoginError(err);
    } finally {
      isLoading.value = false;
    }
  }

  return { email, password, isLoading, errorMessage, submitLogin };
}
