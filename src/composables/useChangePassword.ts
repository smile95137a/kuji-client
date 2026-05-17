import { reactive, ref } from 'vue';
import { changePassword, type ChangePasswordReq } from '@/services/userService';

export function useChangePassword() {
  const form = reactive<ChangePasswordReq>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const isLoading = ref(false);
  const successMsg = ref<string | null>(null);
  const errorMsg = ref<string | null>(null);

  function clearForm() {
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmNewPassword = '';
  }

  function resetMessages() {
    successMsg.value = null;
    errorMsg.value = null;
  }

  async function submit(): Promise<boolean> {
    resetMessages();

    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      errorMsg.value = '請完整填寫所有欄位。';
      return false;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      errorMsg.value = '新密碼與確認密碼不一致。';
      return false;
    }

    if (form.newPassword.length < 8) {
      errorMsg.value = '密碼長度至少需要 8 碼。';
      return false;
    }

    isLoading.value = true;
    try {
      await changePassword({ ...form });
      clearForm();
      successMsg.value = '密碼修改成功。';
      return true;
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400) {
        errorMsg.value = '目前密碼錯誤，請重新輸入。';
      } else {
        errorMsg.value =
          e?.response?.data?.error?.message ??
          e?.response?.data?.message ??
          '密碼修改失敗，請稍後再試。';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    form,
    isLoading,
    successMsg,
    errorMsg,
    submit,
    clearForm,
    resetMessages,
  };
}
