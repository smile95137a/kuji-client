// src/composables/useUserProfile.ts
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMe, updateMe, uploadAvatar } from '@/services/userService';

export function useUserProfile() {
  const authStore = useAuthStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMe() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getMe();
      const data = res?.data ?? res;
      if (data && authStore.user) {
        authStore.user = { ...authStore.user, ...data };
      }
      return data;
    } catch (e: any) {
      error.value = '取得個人資料失敗';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(payload: Record<string, unknown>) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await updateMe(payload);
      const data = res?.data ?? res;
      if (data && authStore.user) {
        authStore.user = { ...authStore.user, ...data };
      }
      return data;
    } catch (e: any) {
      error.value = '更新個人資料失敗';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadAvatarAndSync(file: File): Promise<string | null> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await uploadAvatar(file);
      const imageUrl: string | undefined = res?.data?.imageUrl ?? res?.imageUrl;
      if (imageUrl && authStore.user) {
        authStore.user = { ...authStore.user, avatarUrl: imageUrl };
      }
      return imageUrl ?? null;
    } catch (e: any) {
      error.value = '頭像上傳失敗';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    fetchMe,
    updateProfile,
    uploadAvatarAndSync,
  };
}
