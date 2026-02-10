<!-- src/views/ResetPassword.vue -->
<template>
  <div class="reset-password">
    <Card customClass="mcard--login">
      <template #header>
        <span>重設密碼</span>
      </template>

      <div class="reset-password__container">
        <!-- Token 無效 -->
        <div v-if="tokenInvalid" class="reset-password__step reset-password__step--error">
          <div class="reset-password__icon reset-password__icon--error">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
          </div>
          <h3 class="reset-password__error-title">連結已失效</h3>
          <p class="reset-password__desc">
            此密碼重設連結已過期或無效，請重新申請。
          </p>
          <div class="reset-password__btns">
            <button
              type="button"
              class="reset-password__btn"
              @click="goToForgotPassword"
            >
              重新申請
            </button>
          </div>
        </div>

        <!-- 重設成功 -->
        <div v-else-if="resetSuccess" class="reset-password__step reset-password__step--success">
          <div class="reset-password__icon">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
          </div>
          <h3 class="reset-password__success-title">密碼重設成功</h3>
          <p class="reset-password__desc">
            您的密碼已成功更新，請使用新密碼登入。
          </p>
          <div class="reset-password__btns">
            <button
              type="button"
              class="reset-password__btn"
              @click="goToLogin"
            >
              前往登入
            </button>
          </div>
        </div>

        <!-- 輸入新密碼表單 -->
        <div v-else class="reset-password__step">
          <p class="reset-password__desc">
            請輸入您的新密碼，密碼至少需要 6 個字元。
          </p>

          <form class="reset-password__form" @submit.prevent="onSubmit">
            <div class="reset-password__form-inputs">
              <p class="reset-password__text">新密碼</p>
              <input
                type="password"
                class="reset-password__form-input"
                v-model="newPassword"
                :class="{ 'reset-password__form-input--error': errors.newPassword }"
                placeholder="請輸入新密碼"
              />
              <p
                class="reset-password__text reset-password__text--error"
                v-if="errors.newPassword"
              >
                {{ errors.newPassword }}
              </p>
            </div>

            <div class="reset-password__form-inputs">
              <p class="reset-password__text">確認新密碼</p>
              <input
                type="password"
                class="reset-password__form-input"
                v-model="confirmPassword"
                :class="{ 'reset-password__form-input--error': errors.confirmPassword }"
                placeholder="請再次輸入新密碼"
              />
              <p
                class="reset-password__text reset-password__text--error"
                v-if="errors.confirmPassword"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>

            <div class="reset-password__btns">
              <button
                type="button"
                class="reset-password__btn reset-password__btn--secondary"
                @click="goToLogin"
              >
                取消
              </button>
              <button
                type="submit"
                class="reset-password__btn"
                :disabled="loading"
              >
                {{ loading ? '處理中...' : '確認重設' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import Card from '@/components/common/MCard.vue';
import { resetPassword } from '@/services/AuthService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const tokenInvalid = ref(false);
const resetSuccess = ref(false);

// 從 URL 取得 token
const token = computed(() => String(route.query.token ?? ''));

const schema = yup.object({
  newPassword: yup
    .string()
    .required('新密碼為必填')
    .min(6, '密碼至少需要 6 個字元'),
  confirmPassword: yup
    .string()
    .required('確認密碼為必填')
    .oneOf([yup.ref('newPassword')], '兩次密碼輸入不一致'),
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    newPassword: '',
    confirmPassword: '',
  },
});

const [newPassword] = defineField('newPassword');
const [confirmPassword] = defineField('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    tokenInvalid.value = true;
    return;
  }

  loading.value = true;

  try {
    await executeApi({
      fn: () =>
        resetPassword({
          token: token.value,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      successTitle: '重設成功',
      successMessage: '您的密碼已成功更新',
      errorTitle: '重設失敗',
      showSuccessDialog: false,
      showCatchDialog: false,
      onSuccess: () => {
        resetSuccess.value = true;
      },
      onFail: () => {
        // 如果 API 返回失敗，可能是 token 無效
        tokenInvalid.value = true;
      },
    });
  } catch (err: any) {
    // 如果是 token 無效的錯誤
    const msg = err?.response?.data?.message || err?.message || '';
    if (
      msg.includes('token') ||
      msg.includes('expired') ||
      msg.includes('invalid')
    ) {
      tokenInvalid.value = true;
    }
  }

  loading.value = false;
});

const goToLogin = () => {
  router.push({ name: 'Login' });
};

const goToForgotPassword = () => {
  router.push({ name: 'ForgotPassword' });
};

onMounted(() => {
  // 檢查是否有 token
  if (!token.value) {
    tokenInvalid.value = true;
  }
});
</script>

<style scoped lang="scss">
.reset-password {
  display: flex;
  justify-content: center;
  padding: 40px 16px;
  min-height: 60vh;

  &__container {
    padding: 32px;
    max-width: 480px;
    margin: 0 auto;
  }

  &__step {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__step--success,
  &__step--error {
    align-items: center;
    text-align: center;
  }

  &__icon {
    font-size: 64px;
    color: #4caf50;
    margin-bottom: 8px;

    &--error {
      color: #e53935;
    }
  }

  &__success-title,
  &__error-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  &__desc {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__form-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__text {
    font-size: 14px;
    color: #333;
    margin: 0;

    &--error {
      color: #e53935;
      font-size: 12px;
    }
  }

  &__form-input {
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #ff9800;
    }

    &--error {
      border-color: #e53935;
    }
  }

  &__btns {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  &__btn {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background: linear-gradient(135deg, #ff9800, #ff5722);
    color: #fff;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--secondary {
      background: #f5f5f5;
      color: #666;

      &:hover:not(:disabled) {
        background: #eee;
        box-shadow: none;
      }
    }
  }
}
</style>
