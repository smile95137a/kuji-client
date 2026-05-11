<!-- src/views/ResetPassword.vue -->
<template>
  <div class="reset-password">
    <Card customClass="mcard--login">
      <template #header>
        <span>忘記密碼流程調整</span>
      </template>

      <div class="reset-password__container">
        <div class="reset-password__error">
          <p>舊版重設連結流程已停用，請回登入頁使用「忘記密碼」。</p>
          <button class="reset-password__btn" @click="goLogin">返回登入</button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Card from '@/components/common/MCard.vue';

const router = useRouter();

const goLogin = () => router.replace('/login');
</script>

<style scoped lang="scss">
.reset-password {
  display: flex;
  justify-content: center;
  padding: 40px 16px;

  &__container {
    padding: 8px 0;
  }
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #555;
  }
  &__btn {
    width: 220px;
    padding: 12px;
    background: #a54335;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }
}
</style>
