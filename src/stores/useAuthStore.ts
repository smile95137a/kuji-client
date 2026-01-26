// src/stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { loadState, saveState } from '@/utils/Localstorage';

type UserRole = 'USER' | 'ADMIN' | string;

export interface AuthUser {
  id?: string;
  email?: string;
  nickname?: string;
  phoneNumber?: string;
  roles?: UserRole[];
  [key: string]: any;
}

export interface AuthResLike {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string; // 可選，不傳就預設 Bearer
  user?: AuthUser;
  [key: string]: any;
}

/** LocalStorage keys（你專案既有） */
const LS_TOKEN = 'kujiToken';
const LS_REFRESH = 'refreshKujiToken';
const LS_TOKEN_TYPE = 'kujiTokenType';
const LS_USER = 'kujiUser';

export const useAuthStore = defineStore('auth', () => {
  // ======================
  // state
  // ======================
  const token = ref<string>(loadState<string>(LS_TOKEN) || '');
  const refreshToken = ref<string>(loadState<string>(LS_REFRESH) || '');
  const tokenType = ref<string>(loadState<string>(LS_TOKEN_TYPE) || 'Bearer');
  const user = ref<AuthUser | null>(loadState<AuthUser>(LS_USER) || null);

  // ======================
  // getters
  // ======================
  const isLogin = computed(() => !!token.value);

  const authHeader = computed(() => {
    if (!token.value) return {};
    return {
      Authorization: `${tokenType.value || 'Bearer'} ${token.value}`,
    };
  });

  // ======================
  // actions (only state)
  // ======================

  /** 進站還原（例如 App.vue onMounted 呼叫） */
  const initAuth = () => {
    token.value = loadState<string>(LS_TOKEN) || '';
    refreshToken.value = loadState<string>(LS_REFRESH) || '';
    tokenType.value = loadState<string>(LS_TOKEN_TYPE) || 'Bearer';
    user.value = loadState<AuthUser>(LS_USER) || null;
  };

  /**
   * 登入成功後，把後端 AuthRes 丟進來就好
   * ex: authStore.setAuth(res.data)
   */
  const setAuth = (res: AuthResLike) => {
    const accessToken = res?.accessToken || '';
    const rfToken = res?.refreshToken || '';
    const type = res?.tokenType || 'Bearer';

    token.value = accessToken;
    refreshToken.value = rfToken;
    tokenType.value = type;

    saveState(LS_TOKEN, accessToken);
    saveState(LS_REFRESH, rfToken);
    saveState(LS_TOKEN_TYPE, type);

    if (res?.user) {
      user.value = res.user;
      saveState(LS_USER, res.user);
    }
  };

  /** 登出清空 */
  const logout = () => {
    token.value = '';
    refreshToken.value = '';
    tokenType.value = 'Bearer';
    user.value = null;

    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_TOKEN_TYPE);
    localStorage.removeItem(LS_USER);
  };

  /** 需要手動塞 Header 時使用 */
  const getAuthHeader = () => authHeader.value;

  return {
    // state
    token,
    refreshToken,
    tokenType,
    user,

    // getters
    isLogin,
    authHeader,

    // actions
    initAuth,
    setAuth,
    logout,
    getAuthHeader,
  };
});
