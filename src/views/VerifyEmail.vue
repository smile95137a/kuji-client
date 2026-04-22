<!-- src/views/VerifyEmail.vue -->
<template>
  <div class="verifyEmail">
    <div class="verifyEmail__card">
      <!-- Loading -->
      <template v-if="status === 'loading'">
        <div class="verifyEmail__icon">⏳</div>
        <h1 class="verifyEmail__title">驗證中...</h1>
        <p class="verifyEmail__desc">正在驗證您的 Email，請稍候</p>
      </template>

      <!-- Success -->
      <template v-else-if="status === 'success'">
        <div class="verifyEmail__icon">✅</div>
        <h1 class="verifyEmail__title">Email 驗證成功！</h1>
        <p class="verifyEmail__desc">您的 Email 已驗證完成，現在可以登入了。</p>
        <button class="verifyEmail__btn verifyEmail__btn--primary" @click="goLogin">
          前往登入
        </button>
      </template>

      <!-- Error -->
      <template v-else>
        <div class="verifyEmail__icon">⚠️</div>
        <h1 class="verifyEmail__title">驗證連結已失效</h1>
        <p class="verifyEmail__desc">
          此驗證連結已失效或已被使用，請重新登入後申請新的驗證信。
        </p>
        <button class="verifyEmail__btn verifyEmail__btn--primary" @click="goResend">
          重新發送驗證信
        </button>
        <button class="verifyEmail__btn verifyEmail__btn--secondary" @click="goLogin">
          前往登入頁
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { verifyEmail } from '@/services/AuthService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const status = ref<'loading' | 'success' | 'error'>('loading');

onMounted(async () => {
  const token = route.query.token as string;
  if (!token) {
    status.value = 'error';
    return;
  }

  try {
    const res = await verifyEmail(token);
    status.value = res?.success ? 'success' : 'error';
  } catch {
    status.value = 'error';
  }
});

const goLogin = () => {
  if (authStore.isLogin) {
    router.push({ name: 'MemberProfile' });
  } else {
    router.push({ name: 'Login' });
  }
};

const goResend = () => {
  router.push({ name: 'Login', query: { action: 'resend' } });
};
</script>

<style scoped lang="scss">
.verifyEmail {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: #1a1a1a;
}

.verifyEmail__card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 24px;
  padding: 56px 48px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}

.verifyEmail__icon {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 20px;
}

.verifyEmail__title {
  font-size: 24px;
  font-weight: 800;
  color: #1b1b1b;
  margin: 0 0 12px;
}

.verifyEmail__desc {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 32px;
}

.verifyEmail__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 0 36px;
  border-radius: 999px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

.verifyEmail__btn--primary {
  background: #b43325;
  color: #fff;
}

.verifyEmail__btn--secondary {
  background: #444;
  color: #fff;
}

@media (max-width: 540px) {
  .verifyEmail__card {
    padding: 40px 24px;
  }
}
</style>
