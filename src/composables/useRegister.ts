// src/composables/useRegister.ts
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { register } from '@/services/AuthService';

export function useRegister() {
  const router = useRouter();
  const authStore = useAuthStore();

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
      errorMessage.value = '兩次輸入的密碼不一致';
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

      // Auto-login: set auth state from register response
      authStore.setAuth({
        accessToken: res.data?.accessToken,
        refreshToken: res.data?.refreshToken,
        tokenType: res.data?.tokenType ?? 'Bearer',
        user: res.data?.user,
      });

      await router.push('/member-center/profile');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        errorMessage.value = '此 Email 已被註冊，請直接登入或使用其他 Email';
      } else if (status === 400) {
        errorMessage.value = err?.response?.data?.error?.message || '輸入資料有誤，請檢查後再試';
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
