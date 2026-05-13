<template>
  <div class="oauth2-callback">
    <Card customClass="mcard--login">
      <template #header>
        <span>Google 登入處理中</span>
      </template>

      <div class="oauth2-callback__container">
        <div class="oauth2-callback__panel">
          <p class="oauth2-callback__title">{{ title }}</p>
          <p class="oauth2-callback__message">{{ message }}</p>

          <div v-if="isProcessing" class="oauth2-callback__spinner" aria-hidden="true"></div>

          <button
            v-else
            type="button"
            class="oauth2-callback__btn"
            @click="goLogin"
          >
            返回登入
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Card from '@/components/common/MCard.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMe } from '@/services/userService';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isProcessing = ref(true);
const title = ref('正在完成 Google 登入');
const message = ref('請稍候，我們正在幫你登入並同步會員資料。');

const getQueryText = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] ?? '').trim();
  return String(value ?? '').trim();
};

const toBoolean = (value: string): boolean => {
  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
};

const goLogin = async () => {
  await router.replace('/login');
};

onMounted(async () => {
  const accessToken = getQueryText(route.query.accessToken);
  const refreshToken = getQueryText(route.query.refreshToken);
  const expiresInText = getQueryText(route.query.expiresIn);
  const error = getQueryText(route.query.error);
  const backendMessage = getQueryText(route.query.message);
  const isNewUser = toBoolean(getQueryText(route.query.isNewUser));

  if (error || !accessToken) {
    authStore.logout();
    title.value = 'Google 登入失敗';
    message.value = backendMessage || '目前無法完成 Google 登入，請稍後再試。';
    isProcessing.value = false;
    return;
  }

  try {
    const expiresIn = Number(expiresInText || 0);

    authStore.setAuth({
      accessToken,
      refreshToken: refreshToken || undefined,
      tokenType: 'Bearer',
      expiresIn: Number.isFinite(expiresIn) ? expiresIn : 0,
    });

    try {
      const profileRes = await getMe();
      const profile =
        profileRes?.data?.data ?? profileRes?.data ?? profileRes ?? undefined;

      if (profile) {
        authStore.setAuth({
          accessToken,
          refreshToken: refreshToken || undefined,
          tokenType: 'Bearer',
          expiresIn: Number.isFinite(expiresIn) ? expiresIn : 0,
          user: profile,
        });
      }
    } catch (profileError) {
      console.warn('[OAuth2Callback] getMe failed after Google login:', profileError);
    }

    title.value = isNewUser ? 'Google 帳號註冊完成' : 'Google 登入成功';
    message.value = isNewUser
      ? '歡迎加入，再來一抽！即將帶你前往會員中心。'
      : '登入完成，即將帶你前往會員中心。';

    window.setTimeout(() => {
      router.replace('/member-center/profile');
    }, 800);
  } catch (error) {
    console.error('[OAuth2Callback] handle callback error:', error);
    authStore.logout();
    title.value = 'Google 登入失敗';
    message.value = '登入流程發生異常，請返回登入頁後再試一次。';
    isProcessing.value = false;
    return;
  }
});
</script>

<style scoped lang="scss">
.oauth2-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 48px 20px;

  &__container {
    padding: 0;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 56px 40px;
    text-align: center;
  }

  &__title {
    margin: 0;
    color: #7f2015;
    font-size: 24px;
    font-weight: 800;
  }

  &__message {
    max-width: 420px;
    margin: 0;
    color: #5b463d;
    font-size: 15px;
    line-height: 1.7;
  }

  &__spinner {
    width: 42px;
    height: 42px;
    border: 4px solid rgba(180, 51, 37, 0.18);
    border-top-color: #b43325;
    border-radius: 50%;
    animation: oauth2-callback-spin 0.85s linear infinite;
  }

  &__btn {
    min-width: 220px;
    height: 48px;
    padding: 0 24px;
    border: none;
    border-radius: 999px;
    background: #b43325;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }
}

@keyframes oauth2-callback-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
