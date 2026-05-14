import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/services/AuthService';

export function useRegister() {
  const router = useRouter();

  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const nickname = ref('');
  const referralCode = ref('');
  const isLoading = ref(false);
  const errorMessage = ref('');

  const isPasswordMismatch = computed(
    () =>
      confirmPassword.value.length > 0 &&
      password.value !== confirmPassword.value,
  );

  async function submitRegister(extra?: Record<string, any>) {
    if (isPasswordMismatch.value) {
      errorMessage.value = '兩次密碼輸入不一致';
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    const payload = {
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      nickname: nickname.value || undefined,
      referralCode: referralCode.value.trim() || undefined,
      ...extra,
    };

    try {
      const res = await register(payload);

      if (!res?.success) {
        const bodyMsg = res?.message;
        errorMessage.value = bodyMsg || '註冊失敗，請稍後再試';
        return;
      }

      await router.push({
        name: 'VerifyEmail',
        query: {
          email: email.value,
          registered: '1',
        },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        errorMessage.value = '此 Email 已經註冊過，請直接登入或改用其他 Email';
      } else if (status === 400) {
        errorMessage.value = err?.response?.data?.error?.message || '註冊資料有誤，請確認後再試';
      } else {
        errorMessage.value = err?.response?.data?.error?.message || '註冊失敗，請稍後再試';
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    email,
    password,
    confirmPassword,
    nickname,
    referralCode,
    isLoading,
    errorMessage,
    isPasswordMismatch,
    submitRegister,
  };
}
