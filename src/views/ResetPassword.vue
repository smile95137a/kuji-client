<template>
  <div class="reset-password login">
    <Card customClass="mcard--login">
      <template #header>
        <span>修改密碼</span>
      </template>

      <div class="login__container">
        <div class="login__main reset-password__main">
          <div class="login__form reset-password__form">
            <div class="reset-password__formInner">
              <div class="reset-password__badge">帳號安全</div>
              <h2 class="reset-password__title">先完成密碼更新</h2>
              <p class="reset-password__subtitle">
                您目前使用的是臨時密碼，完成修改後才能繼續進入會員與商品頁面。
              </p>

              <div class="reset-password__notice">
                <div class="reset-password__noticeItem">
                  <strong>1.</strong>
                  <span>請先輸入臨時密碼或目前密碼</span>
                </div>
                <div class="reset-password__noticeItem">
                  <strong>2.</strong>
                  <span>新密碼至少 8 碼</span>
                </div>
                <div class="reset-password__noticeItem">
                  <strong>3.</strong>
                  <span>修改完成後會帶您回原本頁面</span>
                </div>
              </div>

              <div class="login__form-inputs">
                <p class="login__text">目前密碼</p>
                <div class="login__passwordWrap">
                  <input
                    v-model="form.currentPassword"
                    :type="showCurrent ? 'text' : 'password'"
                    class="login__form-input login__form-input--password"
                    placeholder="請輸入目前密碼"
                    autocomplete="current-password"
                  />
                  <button
                    class="login__eyeBtn"
                    type="button"
                    :aria-label="showCurrent ? 'Hide password' : 'Show password'"
                    @click="showCurrent = !showCurrent"
                  >
                    <font-awesome-icon
                      :icon="showCurrent ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                    />
                  </button>
                </div>
              </div>

              <div class="login__form-inputs">
                <p class="login__text">新密碼</p>
                <div class="login__passwordWrap">
                  <input
                    v-model="form.newPassword"
                    :type="showNew ? 'text' : 'password'"
                    class="login__form-input login__form-input--password"
                    placeholder="至少 8 碼"
                    autocomplete="new-password"
                  />
                  <button
                    class="login__eyeBtn"
                    type="button"
                    :aria-label="showNew ? 'Hide password' : 'Show password'"
                    @click="showNew = !showNew"
                  >
                    <font-awesome-icon
                      :icon="showNew ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                    />
                  </button>
                </div>
              </div>

              <div class="login__form-inputs">
                <p class="login__text">確認新密碼</p>
                <div class="login__passwordWrap">
                  <input
                    v-model="form.confirmNewPassword"
                    :type="showConfirm ? 'text' : 'password'"
                    class="login__form-input login__form-input--password"
                    :class="{ 'login__form-input--error': confirmMismatch }"
                    placeholder="請再次輸入新密碼"
                    autocomplete="new-password"
                  />
                  <button
                    class="login__eyeBtn"
                    type="button"
                    :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                    @click="showConfirm = !showConfirm"
                  >
                    <font-awesome-icon
                      :icon="showConfirm ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                    />
                  </button>
                </div>
                <p
                  v-if="confirmMismatch"
                  class="login__text login__text--error reset-password__feedback"
                >
                  新密碼與確認密碼不一致。
                </p>
              </div>

              <p
                v-if="successMsg"
                class="login__text reset-password__feedback reset-password__feedback--ok"
              >
                {{ successMsg }}
              </p>
              <p
                v-if="errorMsg"
                class="login__text login__text--error reset-password__feedback"
              >
                {{ errorMsg }}
              </p>

              <div class="login__btns reset-password__actions">
                <button
                  type="button"
                  class="login__btn"
                  :disabled="isLoading"
                  @click="handleSubmit"
                >
                  {{ isLoading ? '修改中...' : '完成修改' }}
                </button>
              </div>
            </div>
          </div>

          <div class="login__other reset-password__other">
            <div class="login__other-img">
              <img :src="loginLogo" alt="Reset password illustration" />
            </div>
            <div class="login__other-info reset-password__otherInfo">
              <p class="login__text">登入後的第一步，就是把密碼換成你自己記得住的版本。</p>
              <p class="login__text">
                修改完成後，我們會帶您回到原本想前往的頁面，流程不會中斷。
              </p>
            </div>

            <div class="reset-password__tips">
              <div class="reset-password__tipCard">
                <div class="reset-password__tipTitle">建議密碼</div>
                <div class="reset-password__tipText">英文大小寫、數字混合使用，安全性會更好。</div>
              </div>
              <div class="reset-password__tipCard">
                <div class="reset-password__tipTitle">安全提醒</div>
                <div class="reset-password__tipText">若這次不是您本人操作，修改後也建議檢查信箱安全。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Card from '@/components/common/MCard.vue';
import loginLogo from '@/assets/image/login_logo.png';
import { useChangePassword } from '@/composables/useChangePassword';
import { useAuthStore } from '@/stores/useAuthStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { form, isLoading, successMsg, errorMsg, submit } = useChangePassword();

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const confirmMismatch = computed(
  () =>
    form.confirmNewPassword.length > 0 &&
    form.newPassword !== form.confirmNewPassword,
);

const resolveRedirect = () => {
  const redirect =
    typeof route.query.redirect === 'string'
      ? route.query.redirect
      : '/member-center/profile';

  if (!redirect || redirect.includes('/reset-password')) {
    return '/member-center/profile';
  }
  return redirect;
};

const handleSubmit = async () => {
  const ok = await submit();
  if (!ok) return;

  authStore.setForceChangePassword(false);
  await router.replace(resolveRedirect());
};
</script>

<style scoped lang="scss">
.reset-password {
  &__main {
    min-height: 680px;
  }

  &__form {
    align-items: stretch;
  }

  &__formInner {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: #f7d7a4;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
    margin-bottom: 18px;
  }

  &__title {
    margin: 0 0 10px;
    color: #fff;
    font-size: 32px;
    font-weight: 900;
    line-height: 1.25;
  }

  &__subtitle {
    margin: 0 0 24px;
    color: rgba(255, 255, 255, 0.78);
    font-size: 15px;
    line-height: 1.8;
  }

  &__notice {
    margin-bottom: 26px;
    padding: 16px 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  &__noticeItem {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    color: #fff;
    font-size: 14px;
    line-height: 1.7;

    & + & {
      margin-top: 8px;
    }

    strong {
      color: #f0c27a;
    }
  }

  &__feedback {
    margin-top: 8px;
    margin-bottom: 0;
    min-height: 20px;

    &--ok {
      color: #d8ffd6;
    }
  }

  &__actions {
    margin-top: 22px;
  }

  &__other {
    justify-content: center;
  }

  &__otherInfo {
    margin-bottom: 24px;
  }

  &__tips {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  &__tipCard {
    border-radius: 16px;
    padding: 16px 18px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  &__tipTitle {
    color: #f0c27a;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 6px;
  }

  &__tipText {
    color: rgba(255, 255, 255, 0.82);
    font-size: 13px;
    line-height: 1.8;
  }
}

@media (max-width: 768px) {
  .reset-password {
    &__main {
      min-height: auto;
    }

    &__title {
      font-size: 28px;
    }

    &__subtitle {
      font-size: 14px;
    }
  }
}
</style>
