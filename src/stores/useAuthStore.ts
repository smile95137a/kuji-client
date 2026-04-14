// src/stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';

import { loadState, saveState } from '@/utils/Localstorage';

type UserRole = 'USER' | 'ADMIN' | string;

export interface AuthUser {
  id?: string;
  email?: string;
  nickname?: string;
  phoneNumber?: string;
  provider?: 'EMAIL' | 'GOOGLE';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roles?: UserRole[];
  goldCoins?: number;
  bonusCoins?: number;
  referralCode?: string | null;
  avatarUrl?: string | null;
  [key: string]: any;
}

export interface AuthRes {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthUser;
  [key: string]: any;
}

/**
 * LocalStorage keys
 * ⚠️ accessToken is intentionally NOT stored in localStorage (XSS protection).
 *    It lives only in Pinia memory and is re-acquired via silentRefresh on page load.
 */
const LS_REFRESH = 'refreshKujiToken';
const LS_USER = 'kujiUser';

export const useAuthStore = defineStore('auth', () => {
  // ======================
  // state
  // ======================

  /** accessToken: memory-only — never written to localStorage */
  const token = ref<string>('');
  const refreshToken = ref<string>(loadState<string>(LS_REFRESH) || '');
  const tokenType = ref<string>('Bearer');
  const user = ref<AuthUser | null>(loadState<AuthUser>(LS_USER) || null);

  /** True while initAuth's silentRefresh is in progress (prevents false router guard rejections) */
  const isInitializing = ref<boolean>(false);

  // ======================
  // getters
  // ======================
  const isLogin = computed(() => !!token.value);

  const authHeader = computed(() => {
    if (!token.value) return {};
    return { Authorization: `${tokenType.value} ${token.value}` };
  });

  // ======================
  // actions
  // ======================

  /**
   * Call after login / register / google oauth success.
   * Writes accessToken to memory only; refreshToken + user go to localStorage.
   */
  const setAuth = (res: AuthRes) => {
    token.value = res.accessToken || '';
    tokenType.value = res.tokenType || 'Bearer';

    if (res.refreshToken) {
      refreshToken.value = res.refreshToken;
      saveState(LS_REFRESH, res.refreshToken);
    }

    if (res.user) {
      user.value = res.user;
      saveState(LS_USER, res.user);
    }
  };

  /**
   * Silent refresh: uses the stored refreshToken to obtain a new accessToken.
   * Uses raw axios (not the api instance) to avoid triggering the 401 interceptor loop.
   * Returns true on success, false on failure (also calls logout on failure).
   */
  const silentRefresh = async (): Promise<boolean> => {
    const rt = loadState<string>(LS_REFRESH);
    if (!rt) return false;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_API_URL}/api/auth/refresh`,
        { refreshToken: rt },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data?.success && res.data?.data?.accessToken) {
        setAuth(res.data.data);
        return true;
      }
      logout();
      return false;
    } catch {
      logout();
      return false;
    }
  };

  /**
   * Called once in App.vue onMounted.
   * Immediately restores user from localStorage (no UI flash),
   * then silently refreshes the accessToken.
   */
  const initAuth = async (): Promise<void> => {
    isInitializing.value = true;
    user.value = loadState<AuthUser>(LS_USER) || null;
    await silentRefresh();
    isInitializing.value = false;
  };

  /** Clear all auth state from memory and localStorage */
  const logout = () => {
    token.value = '';
    refreshToken.value = '';
    tokenType.value = 'Bearer';
    user.value = null;

    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_USER);
  };

  const getAuthHeader = () => authHeader.value;

  return {
    // state
    token,
    refreshToken,
    tokenType,
    user,
    isInitializing,

    // getters
    isLogin,
    authHeader,

    // actions
    initAuth,
    setAuth,
    silentRefresh,
    logout,
    getAuthHeader,
  };
});
