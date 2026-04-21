// src/composables/useLogin.ts
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { login, resendVerification } from '@/services/AuthService';

function getHttpStatus(err: unknown): number | null {
  return (err as any)?.response?.status ?? null;
}

function parseGenericLoginError(err: unknown): string {
  const status = getHttpStatus(err);
  if (status === 403) return '此帳號已停用，請聯繫客服';
  if (status === 400) return '此帳號使用 Google 登入，請改用 Google 帳號登入';
  const bodyMsg =
    (err as any)?.response?.data?.error?.message ??
    (err as any)?.response?.data?.message;
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

  // --- new error-code state ---
  const loginErrorCode = ref('');
  const remainingAttempts = ref<number | null>(null);
  const lockedMinutes = ref<number | null>(null);
  /** Temporary access token returned by backend for EMAIL_NOT_VERIFIED users */
  const unverifiedToken = ref('');

  const isEmailNotVerified = computed(() => loginErrorCode.value === 'EMAIL_NOT_VERIFIED');
  const isAccountLocked = computed(() => loginErrorCode.value === 'ACCOUNT_LOCKED');

  // --- resend cooldown ---
  const resendCooldown = ref(0);
  const resendLoading = ref(false);
  const resendMessage = ref('');
  let resendTimer: ReturnType<typeof setInterval> | null = null;

  const startResendCooldown = () => {
    resendCooldown.value = 60;
    if (resendTimer) clearInterval(resendTimer);
    resendTimer = setInterval(() => {
      resendCooldown.value--;
      if (resendCooldown.value <= 0) {
        resendCooldown.value = 0;
        if (resendTimer) clearInterval(resendTimer);
      }
    }, 1000);
  };

  const sendVerificationEmail = async () => {
    if (resendCooldown.value > 0 || resendLoading.value) return;
    resendLoading.value = true;
    resendMessage.value = '';
    try {
      const res = await resendVerification(unverifiedToken.value || undefined);
      if (res?.success) {
        resendMessage.value = '驗證信已發送，請檢查您的 Email';
        startResendCooldown();
      } else {
        resendMessage.value = res?.message || '發送失敗，請稍後再試';
      }
    } catch (e: any) {
      if (e?.response?.status === 429) {
        resendMessage.value = '發送太頻繁，請稍後再試';
        startResendCooldown();
      } else {
        resendMessage.value = '發送失敗，請稍後再試';
      }
    } finally {
      resendLoading.value = false;
    }
  };

  // --- error field extractor (handles both response body + thrown error) ---
  function applyErrorFields(data: any) {
    const code: string = data?.errorCode ?? data?.error?.code ?? '';
    loginErrorCode.value = code;
    remainingAttempts.value = data?.remainingAttempts ?? null;
    lockedMinutes.value = data?.lockedMinutes ?? null;
    // Backend may return a limited-scope access token for the unverified user
    unverifiedToken.value = data?.data?.accessToken ?? data?.accessToken ?? '';

    if (code === 'EMAIL_NOT_VERIFIED') {
      errorMessage.value = '您的 Email 尚未驗證，請檢查收件匟或重新發送驗證信';
    } else if (code === 'ACCOUNT_LOCKED') {
      const mins = data?.lockedMinutes ?? null;
      errorMessage.value = mins
        ? `帳號已鎖定，請 ${mins} 分鐘後再試`
        : '帳號已鎖定，請稍後再試';
    } else if (code === 'INVALID_CREDENTIALS') {
      const rem = data?.remainingAttempts ?? null;
      errorMessage.value =
        rem != null
          ? `密碼錯誤，還剩 ${rem} 次機會，超過將鎖定帳號 15 分鐘`
          : 'Email 或密碼錯誤';
    } else {
      errorMessage.value =
        data?.message ?? data?.error?.message ?? '登入失敗，請稍後再試';
    }
  }

  async function submitLogin() {
    isLoading.value = true;
    errorMessage.value = '';
    loginErrorCode.value = '';
    remainingAttempts.value = null;
    lockedMinutes.value = null;
    unverifiedToken.value = '';
    resendMessage.value = '';

    try {
      const res = await login({ email: email.value, password: password.value });

      if (!res?.success) {
        applyErrorFields(res);
        return;
      }

      authStore.setAuth({
        accessToken: res.data?.accessToken ?? '',
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
      const errData = (err as any)?.response?.data;
      if (errData?.errorCode) {
        applyErrorFields(errData);
      } else {
        errorMessage.value = parseGenericLoginError(err);
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    email,
    password,
    isLoading,
    errorMessage,
    loginErrorCode,
    remainingAttempts,
    lockedMinutes,
    unverifiedToken,
    isEmailNotVerified,
    isAccountLocked,
    resendCooldown,
    resendLoading,
    resendMessage,
    sendVerificationEmail,
    submitLogin,
  };
}
