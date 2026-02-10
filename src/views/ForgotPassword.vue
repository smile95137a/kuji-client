<!-- src/views/ForgotPassword.vue -->
<template>
  <div class="forgot-password">
    <Card customClass="mcard--login">
      <template #header>
        <span>忘記密碼</span>
      </template>

      <div class="forgot-password__container">
        <!-- 步驟 1: 輸入 Email -->
        <div v-if="step === 1" class="forgot-password__step">
          <p class="forgot-password__desc">
            請輸入您註冊時使用的電子信箱，我們將寄送密碼重設連結給您。
          </p>

          <form class="forgot-password__form" @submit.prevent="onSubmitEmail">
            <div class="forgot-password__form-inputs">
              <p class="forgot-password__text">電子信箱</p>
              <input
                class="forgot-password__form-input"
                v-model="email"
                :class="{ 'forgot-password__form-input--error': errors.email }"
                placeholder="請輸入電子信箱"
                type="email"
              />
              <p
                class="forgot-password__text forgot-password__text--error"
                v-if="errors.email"
              >
                {{ errors.email }}
              </p>
            </div>

            <div class="forgot-password__btns">
              <button
                type="button"
                class="forgot-password__btn forgot-password__btn--secondary"
                @click="goBack"
              >
                返回登入
              </button>
              <button
                type="submit"
                class="forgot-password__btn"
                :disabled="loading"
              >
                {{ loading ? '發送中...' : '發送重設連結' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 步驟 2: 發送成功提示 -->
        <div v-else class="forgot-password__step forgot-password__step--success">
          <div class="forgot-password__icon">
            <font-awesome-icon :icon="['fas', 'envelope-circle-check']" />
          </div>
          <h3 class="forgot-password__success-title">郵件已發送</h3>
          <p class="forgot-password__desc">
            我們已將密碼重設連結寄送至
            <strong>{{ submittedEmail }}</strong>
            ，請檢查您的信箱（包含垃圾郵件夾）。
          </p>
          <p class="forgot-password__hint">
            連結有效時間為 30 分鐘，請儘速完成密碼重設。
          </p>

          <div class="forgot-password__btns">
            <button
              type="button"
              class="forgot-password__btn forgot-password__btn--secondary"
              @click="resend"
              :disabled="resendCooldown > 0"
            >
              {{ resendCooldown > 0 ? `重新發送 (${resendCooldown}s)` : '重新發送' }}
            </button>
            <button
              type="button"
              class="forgot-password__btn"
              @click="goBack"
            >
              返回登入
            </button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import Card from '@/components/common/MCard.vue';
import { forgotPassword } from '@/services/AuthService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();

const step = ref(1);
const loading = ref(false);
const submittedEmail = ref('');
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const schema = yup.object({
  email: yup.string().required('電子信箱為必填').email('Email 格式不正確'),
});

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { email: '' },
});

const [email] = defineField('email');

const startCooldown = () => {
  resendCooldown.value = 60;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
};

const onSubmitEmail = handleSubmit(async (values) => {
  loading.value = true;

  await executeApi({
    fn: () => forgotPassword({ email: values.email }),
    successTitle: '發送成功',
    successMessage: '重設密碼連結已發送至您的信箱',
    errorTitle: '發送失敗',
    errorMessage: '發送失敗，請確認電子信箱是否正確',
    showSuccessDialog: false,
    showCatchDialog: true,
    onSuccess: () => {
      submittedEmail.value = values.email;
      step.value = 2;
      startCooldown();
    },
  });

  loading.value = false;
});

const resend = async () => {
  if (resendCooldown.value > 0 || !submittedEmail.value) return;

  loading.value = true;

  await executeApi({
    fn: () => forgotPassword({ email: submittedEmail.value }),
    successTitle: '發送成功',
    successMessage: '重設密碼連結已重新發送',
    showSuccessDialog: true,
    showCatchDialog: true,
    onSuccess: () => {
      startCooldown();
    },
  });

  loading.value = false;
};

const goBack = () => {
  router.push({ name: 'Login' });
};

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
  }
});
</script>

<style scoped lang="scss">
.forgot-password {
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

  &__step--success {
    align-items: center;
    text-align: center;
  }

  &__icon {
    font-size: 64px;
    color: #4caf50;
    margin-bottom: 8px;
  }

  &__success-title {
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

  &__hint {
    font-size: 12px;
    color: #999;
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
