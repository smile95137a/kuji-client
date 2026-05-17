import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { login, resendVerification } from '@/services/AuthService';

type LoginErrorKind =
  | ''
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LOCKED'
  | 'GOOGLE_PROVIDER_ONLY'
  | 'ACCOUNT_DISABLED'
  | 'INVALID_CREDENTIALS'
  | 'FORCE_CHANGE_PASSWORD'
  | 'GENERIC';

function getErrorPayload(err: unknown): any {
  return (err as any)?.response?.data ?? null;
}

function getNestedErrorCode(payload: any): string {
  return String(payload?.errorCode ?? payload?.error?.code ?? '').trim();
}

function getNestedErrorMessage(payload: any): string {
  return String(payload?.message ?? payload?.error?.message ?? '').trim();
}

function normalizeLoginError(code: string, message: string): LoginErrorKind {
  if (code === 'EMAIL_PROVIDER_CONFLICT') return 'GOOGLE_PROVIDER_ONLY';
  if (code === 'AUTH_ACCOUNT_003') return 'ACCOUNT_LOCKED';
  if (code === 'AUTH_ACCOUNT_001') return 'ACCOUNT_DISABLED';
  if (code === 'AUTH_INVALID_001') return 'INVALID_CREDENTIALS';
  if (code === 'AUTH_FORCE_CHANGE_PASSWORD') return 'FORCE_CHANGE_PASSWORD';
  if (code === 'COMMON_VALIDATION_001' && message.includes('Email')) {
    return 'EMAIL_NOT_VERIFIED';
  }
  return 'GENERIC';
}

function buildFallbackErrorMessage(err: unknown): string {
  const payload = getErrorPayload(err);
  const bodyMessage = getNestedErrorMessage(payload);
  if (bodyMessage) return bodyMessage;

  const status = (err as any)?.response?.status ?? null;
  if (status === 403) return '您的帳號目前無法登入，請稍後再試或聯繫客服。';
  if (status === 409) return '此帳號需使用 Google 登入。';
  return '登入失敗，請稍後再試。';
}

export function useLogin() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const email = ref('');
  const password = ref('');
  const isLoading = ref(false);
  const errorMessage = ref('');

  const loginErrorKind = ref<LoginErrorKind>('');
  const resendCooldown = ref(0);
  const resendLoading = ref(false);
  const resendMessage = ref('');
  let resendTimer: ReturnType<typeof setInterval> | null = null;

  const isEmailNotVerified = computed(
    () => loginErrorKind.value === 'EMAIL_NOT_VERIFIED',
  );
  const isAccountLocked = computed(
    () => loginErrorKind.value === 'ACCOUNT_LOCKED',
  );

  const startResendCooldown = () => {
    resendCooldown.value = 60;
    if (resendTimer) clearInterval(resendTimer);
    resendTimer = setInterval(() => {
      resendCooldown.value -= 1;
      if (resendCooldown.value <= 0) {
        resendCooldown.value = 0;
        if (resendTimer) clearInterval(resendTimer);
      }
    }, 1000);
  };

  const sendVerificationEmail = async () => {
    if (resendCooldown.value > 0 || resendLoading.value) return;

    const targetEmail = String(email.value ?? '').trim();
    if (!targetEmail) {
      resendMessage.value = '請先輸入 Email。';
      return;
    }

    resendLoading.value = true;
    resendMessage.value = '';

    try {
      const res = await resendVerification({ email: targetEmail }, undefined);

      if (res?.success) {
        resendMessage.value = '驗證信已重新發送，請留意您的信箱。';
        startResendCooldown();
      } else {
        resendMessage.value = res?.message || '重新發送失敗，請稍後再試。';
      }
    } catch (e: any) {
      if (e?.response?.status === 429) {
        resendMessage.value = '寄送過於頻繁，請稍後再試。';
        startResendCooldown();
      } else {
        resendMessage.value =
          getNestedErrorMessage(getErrorPayload(e)) ||
          '重新發送失敗，請稍後再試。';
      }
    } finally {
      resendLoading.value = false;
    }
  };

  const goToVerifyEmail = async () => {
    const query: Record<string, string> = { source: 'login' };
    const targetEmail = String(email.value ?? '').trim();
    if (targetEmail) {
      query.email = targetEmail;
    }
    await router.push({ name: 'VerifyEmail', query });
  };

  const resolvePostLoginRedirect = () => {
    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/member-center/profile';
    return redirect || '/member-center/profile';
  };

  const goToForceChangePassword = async () => {
    const redirect = resolvePostLoginRedirect();
    await router.replace({
      name: 'ResetPassword',
      query: redirect ? { redirect } : undefined,
    });
  };

  const applyLoginError = (payload: any) => {
    const code = getNestedErrorCode(payload);
    const message = getNestedErrorMessage(payload);
    loginErrorKind.value = normalizeLoginError(code, message);

    if (loginErrorKind.value === 'EMAIL_NOT_VERIFIED') {
      errorMessage.value = '此帳號尚未完成 Email 驗證，請先完成驗證。';
      return;
    }

    if (loginErrorKind.value === 'GOOGLE_PROVIDER_ONLY') {
      errorMessage.value = '此帳號需使用 Google 登入。';
      return;
    }

    if (loginErrorKind.value === 'ACCOUNT_LOCKED') {
      errorMessage.value = message || '帳號暫時被鎖定，請稍後再試。';
      return;
    }

    if (loginErrorKind.value === 'ACCOUNT_DISABLED') {
      errorMessage.value = message || '帳號目前無法使用，請聯繫客服。';
      return;
    }

    if (loginErrorKind.value === 'INVALID_CREDENTIALS') {
      errorMessage.value = message || 'Email 或密碼錯誤。';
      return;
    }

    if (loginErrorKind.value === 'FORCE_CHANGE_PASSWORD') {
      errorMessage.value = message || '請先修改密碼後再繼續。';
      return;
    }

    errorMessage.value = message || '登入失敗，請稍後再試。';
  };

  async function submitLogin() {
    isLoading.value = true;
    errorMessage.value = '';
    loginErrorKind.value = '';
    resendMessage.value = '';

    try {
      const res = await login({ email: email.value, password: password.value });

      if (!res?.success) {
        applyLoginError(res);
        return;
      }

      authStore.setAuth({
        accessToken: res.data?.accessToken ?? '',
        refreshToken: res.data?.refreshToken,
        tokenType: res.data?.tokenType ?? 'Bearer',
        forceChangePassword: Boolean(res.data?.forceChangePassword),
        user: res.data?.user,
      });

      if (res.data?.forceChangePassword) {
        await goToForceChangePassword();
        return;
      }

      await router.replace(resolvePostLoginRedirect());
    } catch (err) {
      const payload = getErrorPayload(err);
      if (payload) {
        applyLoginError(payload);
      } else {
        loginErrorKind.value = 'GENERIC';
        errorMessage.value = buildFallbackErrorMessage(err);
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
    loginErrorKind,
    isEmailNotVerified,
    isAccountLocked,
    resendCooldown,
    resendLoading,
    resendMessage,
    sendVerificationEmail,
    goToVerifyEmail,
    submitLogin,
  };
}
