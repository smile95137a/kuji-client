<!-- src/views/OAuth2Callback.vue -->
<template>
  <main class="oauth2-callback">
    <section class="oauth2-callback__card">
      <div class="oauth2-callback__panel">
        <div class="oauth2-callback__eyebrow">GOOGLE LOGIN</div>

        <div class="oauth2-callback__iconWrap">
          <div class="oauth2-callback__icon">
            <span v-if="isProcessing">G</span>
            <span v-else>!</span>
          </div>
        </div>

        <div class="oauth2-callback__content">
          <p class="oauth2-callback__title">{{ title }}</p>
          <p class="oauth2-callback__message">{{ message }}</p>
        </div>

        <div
          v-if="isProcessing"
          class="oauth2-callback__spinner"
          aria-hidden="true"
        ></div>

        <button
          v-else
          type="button"
          class="oauth2-callback__btn"
          @click="goLogin"
        >
          返回登入
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
      console.warn(
        '[OAuth2Callback] getMe failed after Google login:',
        profileError,
      );
    }

    title.value = isNewUser ? 'Google 帳號註冊完成' : 'Google 登入成功';
    message.value = isNewUser
      ? '歡迎加入 STARO！你的會員資料已建立完成，即將帶你前往會員中心。'
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
  }
});
</script>

<style scoped lang="scss">
.oauth2-callback {
  min-height: 100vh;
  padding: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  z-index: 999;

  background:
    radial-gradient(circle at 8% 0%, rgba(180, 51, 37, 0.06), transparent 30%),
    radial-gradient(
      circle at 92% 10%,
      rgba(229, 166, 87, 0.12),
      transparent 28%
    ),
    #fff;

  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
}

.oauth2-callback__card {
  width: min(520px, 100%);
  position: relative;
  overflow: hidden;

  border-radius: 34px;
  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.1), transparent 34%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 64%);

  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);

  &::before {
    content: '';
    position: absolute;
    right: -88px;
    top: -100px;
    width: 270px;
    height: 270px;
    border-radius: 999px;
    background: rgba(180, 51, 37, 0.08);
    pointer-events: none;
  }
}

.oauth2-callback__panel {
  position: relative;
  z-index: 1;

  min-height: 430px;
  padding: 52px 42px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  text-align: center;
}

.oauth2-callback__eyebrow {
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;

  background: rgba(180, 51, 37, 0.1);
  color: var(--primary);

  font-size: 12px;
  font-weight: 950;
  letter-spacing: 1.8px;
}

.oauth2-callback__iconWrap {
  width: 86px;
  height: 86px;
  padding: 8px;
  border-radius: 999px;

  background: var(--gold-soft);
  border: 1px solid rgba(228, 170, 67, 0.24);
}

.oauth2-callback__icon {
  width: 100%;
  height: 100%;
  border-radius: 999px;

  display: grid;
  place-items: center;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 30px;
  font-weight: 950;
  box-shadow: 0 14px 30px rgba(180, 51, 37, 0.22);
}

.oauth2-callback__content {
  display: grid;
  gap: 10px;
}

.oauth2-callback__title {
  margin: 0;
  color: var(--text);
  font-size: 28px;
  line-height: 1.3;
  font-weight: 950;
  letter-spacing: 1px;
}

.oauth2-callback__message {
  max-width: 420px;
  margin: 0;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.8;
  font-weight: 800;
}

.oauth2-callback__spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 4px solid rgba(180, 51, 37, 0.18);
  border-top-color: var(--primary);
  animation: oauth2-callback-spin 0.75s linear infinite;
}

.oauth2-callback__btn {
  width: 100%;
  min-height: 56px;
  padding: 0 24px;
  border: 1px solid var(--primary);
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 18px;
  font-weight: 950;
  letter-spacing: 1.4px;

  cursor: pointer;
  box-shadow: 0 16px 30px rgba(180, 51, 37, 0.2);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 20px 38px rgba(180, 51, 37, 0.28);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .oauth2-callback {
    padding: 18px;
  }

  .oauth2-callback__card {
    width: 100%;
    border-radius: 30px;
  }

  .oauth2-callback__panel {
    min-height: 420px;
    padding: 42px 24px;
  }

  .oauth2-callback__iconWrap {
    width: 76px;
    height: 76px;
  }

  .oauth2-callback__title {
    font-size: 24px;
  }

  .oauth2-callback__message {
    font-size: 14px;
  }

  .oauth2-callback__btn {
    min-height: 54px;
    font-size: 17px;
  }
}

@media (max-width: 380px) {
  .oauth2-callback {
    padding: 14px;
  }

  .oauth2-callback__panel {
    padding: 38px 18px;
  }

  .oauth2-callback__title {
    font-size: 22px;
  }
}

@keyframes oauth2-callback-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
