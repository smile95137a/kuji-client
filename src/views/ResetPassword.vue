<!-- src/views/ResetPassword.vue -->
<template>
  <main class="resetPassword">
    <section class="resetPassword__card">
      <header class="resetPassword__header">
        <div>
          <p class="resetPassword__eyebrow">ACCOUNT SECURITY</p>
          <h1 class="resetPassword__title">修改密碼</h1>
        </div>
      </header>

      <div class="resetPassword__main">
        <form class="resetPassword__form" @submit.prevent="handleSubmit">
          <div class="resetPassword__formContent">
            <div class="resetPassword__formHead">
              <h2 class="resetPassword__formTitle">先完成密碼更新</h2>
              <p class="resetPassword__formDesc">
                您目前使用的是臨時密碼，完成修改後才能繼續進入會員與商品頁面。
              </p>
            </div>

            <div class="resetPassword__notice">
              <div class="resetPassword__noticeItem">
                <strong>1.</strong>
                <span>請先輸入臨時密碼或目前密碼</span>
              </div>
              <div class="resetPassword__noticeItem">
                <strong>2.</strong>
                <span>新密碼至少 8 碼</span>
              </div>
              <div class="resetPassword__noticeItem">
                <strong>3.</strong>
                <span>修改完成後會帶您回原本頁面</span>
              </div>
            </div>

            <div class="resetPassword__field">
              <label class="resetPassword__label">目前密碼</label>

              <div class="resetPassword__password">
                <input
                  v-model="form.currentPassword"
                  :type="showCurrent ? 'text' : 'password'"
                  class="resetPassword__input resetPassword__input--password"
                  placeholder="請輸入目前密碼"
                  autocomplete="current-password"
                />

                <button
                  class="resetPassword__eyeBtn"
                  type="button"
                  :aria-label="showCurrent ? '隱藏密碼' : '顯示密碼'"
                  @click="showCurrent = !showCurrent"
                >
                  <font-awesome-icon
                    :icon="showCurrent ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                  />
                </button>
              </div>
            </div>

            <div class="resetPassword__field">
              <label class="resetPassword__label">新密碼</label>

              <div class="resetPassword__password">
                <input
                  v-model="form.newPassword"
                  :type="showNew ? 'text' : 'password'"
                  class="resetPassword__input resetPassword__input--password"
                  placeholder="至少 8 碼"
                  autocomplete="new-password"
                />

                <button
                  class="resetPassword__eyeBtn"
                  type="button"
                  :aria-label="showNew ? '隱藏密碼' : '顯示密碼'"
                  @click="showNew = !showNew"
                >
                  <font-awesome-icon
                    :icon="showNew ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                  />
                </button>
              </div>
            </div>

            <div class="resetPassword__field">
              <label class="resetPassword__label">確認新密碼</label>

              <div class="resetPassword__password">
                <input
                  v-model="form.confirmNewPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  class="resetPassword__input resetPassword__input--password"
                  :class="{ 'resetPassword__input--error': confirmMismatch }"
                  placeholder="請再次輸入新密碼"
                  autocomplete="new-password"
                />

                <button
                  class="resetPassword__eyeBtn"
                  type="button"
                  :aria-label="showConfirm ? '隱藏密碼' : '顯示密碼'"
                  @click="showConfirm = !showConfirm"
                >
                  <font-awesome-icon
                    :icon="showConfirm ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                  />
                </button>
              </div>

              <p v-if="confirmMismatch" class="resetPassword__error">
                新密碼與確認密碼不一致。
              </p>
            </div>

            <p
              v-if="successMsg"
              class="resetPassword__noticeText resetPassword__noticeText--success"
            >
              {{ successMsg }}
            </p>

            <p
              v-if="errorMsg"
              class="resetPassword__noticeText resetPassword__noticeText--error"
            >
              {{ errorMsg }}
            </p>
          </div>

          <div class="resetPassword__bottom">
            <button
              type="submit"
              class="resetPassword__submitBtn"
              :disabled="isLoading || confirmMismatch"
            >
              <span v-if="isLoading" class="resetPassword__spinner"></span>
              <template v-else>完成修改</template>
            </button>
          </div>
        </form>

        <aside class="resetPassword__side">
          <div class="resetPassword__sideBg"></div>

          <div class="resetPassword__sideContent">
            <div class="resetPassword__logoBox">
              <img :src="loginLogo" alt="Reset password illustration" />
            </div>

            <div class="resetPassword__sideText">
              <h2>登入前的小小安全檢查</h2>
              <p>
                登入後的第一步，就是把密碼換成你自己記得住的版本。修改完成後，我們會帶您回到原本想前往的頁面。
              </p>
            </div>

            <div class="resetPassword__tips">
              <div class="resetPassword__tipCard">
                <p class="resetPassword__tipTitle">建議密碼</p>
                <p class="resetPassword__tipText">
                  英文大小寫、數字混合使用，安全性會更好。
                </p>
              </div>

              <div class="resetPassword__tipCard">
                <p class="resetPassword__tipTitle">安全提醒</p>
                <p class="resetPassword__tipText">
                  若這次不是您本人操作，修改後也建議檢查信箱安全。
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
.resetPassword {
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
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
  --danger: #b42318;
  --success: #2e7d32;
}

.resetPassword__card {
  width: min(1180px, 100%);
  overflow: hidden;

  border-radius: 34px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);
}

.resetPassword__header {
  min-height: 112px;
  padding: 26px 36px;

  display: flex;
  align-items: center;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(255, 255, 255, 0.32),
      transparent 32%
    ),
    linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
  color: #fff;
}

.resetPassword__eyebrow {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 8px;

  display: inline-flex;
  align-items: center;

  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);

  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.resetPassword__title {
  margin: 0;
  color: #fff;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: 3px;
}

.resetPassword__main {
  min-height: 650px;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);

  background: #fff;
}

.resetPassword__form,
.resetPassword__side {
  min-height: 650px;
  padding: 54px 58px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.resetPassword__form {
  border-right: 1px solid var(--line);
}

.resetPassword__formContent {
  width: 100%;
}

.resetPassword__formHead {
  margin-bottom: 22px;
}

.resetPassword__formTitle {
  margin: 0;
  color: var(--text);
  font-size: 31px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;
}

.resetPassword__formDesc {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.7;
  font-weight: 800;
}

.resetPassword__notice {
  margin-bottom: 24px;
  padding: 16px 18px;
  border-radius: 20px;

  background: var(--cream);
  border: 1px solid var(--line);
}

.resetPassword__noticeItem {
  display: flex;
  gap: 10px;
  align-items: flex-start;

  color: rgba(36, 22, 16, 0.74);
  font-size: 14px;
  line-height: 1.7;
  font-weight: 850;

  & + & {
    margin-top: 8px;
  }

  strong {
    color: var(--primary);
    font-weight: 950;
  }
}

.resetPassword__field {
  margin-bottom: 18px;
}

.resetPassword__label {
  display: block;
  margin-bottom: 8px;

  color: rgba(36, 22, 16, 0.72);
  font-size: 14px;
  font-weight: 900;
}

.resetPassword__password {
  position: relative;
}

.resetPassword__input {
  width: 100%;
  height: 58px;
  padding: 0 18px;
  border-radius: 18px;
  border: 1px solid var(--line);
  outline: none;
  box-sizing: border-box;

  background: #fff;
  color: var(--text);

  font-size: 15px;
  font-weight: 850;

  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;

  &::placeholder {
    color: rgba(36, 22, 16, 0.34);
  }

  &:focus {
    border-color: rgba(180, 51, 37, 0.48);
    box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
  }

  &--password {
    padding-right: 54px;
  }

  &--error {
    border-color: rgba(180, 35, 24, 0.62);
    box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
  }
}

.resetPassword__eyeBtn {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);

  width: 40px;
  height: 40px;
  border-radius: 15px;
  border: 0;
  cursor: pointer;

  display: grid;
  place-items: center;

  background: transparent;
  color: var(--text-soft);

  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    color: var(--primary);
    background: var(--primary-soft);
  }

  &:active {
    transform: translateY(-50%) scale(0.96);
  }
}

.resetPassword__error {
  margin: 8px 0 0;
  color: var(--danger);
  font-size: 12px;
  line-height: 1.5;
  font-weight: 850;
}

.resetPassword__noticeText {
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: 16px;

  font-size: 13px;
  line-height: 1.55;
  font-weight: 850;
  text-align: center;

  &--error {
    color: var(--danger);
    background: rgba(180, 35, 24, 0.08);
    border: 1px solid rgba(180, 35, 24, 0.12);
  }

  &--success {
    color: var(--success);
    background: rgba(46, 125, 50, 0.08);
    border: 1px solid rgba(46, 125, 50, 0.12);
  }
}

.resetPassword__bottom {
  width: 100%;
  margin-top: 28px;
}

.resetPassword__submitBtn {
  width: 100%;
  min-height: 60px;
  border-radius: 999px;
  border: 1px solid var(--primary);
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 20px;
  font-weight: 950;
  letter-spacing: 2px;
  box-shadow: 0 16px 30px rgba(180, 51, 37, 0.2);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 20px 38px rgba(180, 51, 37, 0.28);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.resetPassword__side {
  position: relative;
  overflow: hidden;

  align-items: center;
  text-align: center;

  background:
    radial-gradient(circle at 92% 8%, rgba(180, 51, 37, 0.12), transparent 32%),
    linear-gradient(180deg, #fff8ef 0%, #ffffff 100%);
}

.resetPassword__sideBg {
  position: absolute;
  right: -90px;
  top: -100px;
  width: 270px;
  height: 270px;
  border-radius: 999px;
  background: rgba(180, 51, 37, 0.08);
  pointer-events: none;
}

.resetPassword__sideContent {
  position: relative;
  z-index: 1;
  width: 100%;
}

.resetPassword__logoBox {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;

  img {
    width: min(330px, 100%);
    height: auto;
    display: block;
    filter: drop-shadow(0 20px 36px rgba(63, 36, 18, 0.14));
  }
}

.resetPassword__sideText {
  max-width: 420px;
  margin: 0 auto;

  h2 {
    margin: 0;
    color: var(--text);
    font-size: 28px;
    line-height: 1.3;
    font-weight: 950;
    letter-spacing: 1px;
  }

  p {
    margin: 12px 0 0;
    color: var(--text-soft);
    font-size: 15px;
    line-height: 1.8;
    font-weight: 800;
  }
}

.resetPassword__tips {
  width: 100%;
  max-width: 420px;
  margin: 28px auto 0;

  display: grid;
  gap: 12px;
}

.resetPassword__tipCard {
  padding: 16px 18px;
  border-radius: 20px;

  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 12px 26px rgba(63, 36, 18, 0.05);

  text-align: left;
}

.resetPassword__tipTitle {
  margin: 0;
  color: var(--primary);
  font-size: 14px;
  line-height: 1.4;
  font-weight: 950;
  letter-spacing: 1px;
}

.resetPassword__tipText {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.7;
  font-weight: 800;
}

.resetPassword__spinner {
  width: 17px;
  height: 17px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  animation: resetPasswordSpin 0.7s linear infinite;
}

@media (max-width: 980px) {
  .resetPassword {
    padding: 18px;
  }

  .resetPassword__main {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .resetPassword__form,
  .resetPassword__side {
    min-height: auto;
    padding: 42px;
  }

  .resetPassword__form {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .resetPassword__logoBox img {
    width: min(280px, 100%);
  }

  .resetPassword__sideText h2 {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .resetPassword {
    padding: 0;
    align-items: stretch;
  }

  .resetPassword__card {
    min-height: 100vh;
    border-radius: 0;
    border: 0;
    box-shadow: none;
  }

  .resetPassword__header {
    min-height: 104px;
    padding: 24px 18px;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 14px 28px rgba(63, 36, 18, 0.12);
  }

  .resetPassword__title {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .resetPassword__eyebrow {
    min-height: 24px;
    padding: 0 10px;
    margin-bottom: 7px;
    font-size: 11px;
    letter-spacing: 1.3px;
  }

  .resetPassword__form,
  .resetPassword__side {
    padding: 30px 16px;
  }

  .resetPassword__formTitle {
    font-size: 25px;
  }

  .resetPassword__formDesc {
    font-size: 13px;
  }

  .resetPassword__notice {
    padding: 14px;
    border-radius: 18px;
  }

  .resetPassword__noticeItem {
    font-size: 13px;
  }

  .resetPassword__input {
    height: 52px;
    border-radius: 15px;
    font-size: 14px;
  }

  .resetPassword__field {
    margin-bottom: 15px;
  }

  .resetPassword__submitBtn {
    min-height: 54px;
    font-size: 17px;
  }

  .resetPassword__side {
    padding-top: 26px;
  }

  .resetPassword__logoBox {
    margin-bottom: 20px;

    img {
      width: min(240px, 100%);
    }
  }

  .resetPassword__sideText h2 {
    font-size: 22px;
  }

  .resetPassword__sideText p {
    font-size: 13px;
  }

  .resetPassword__tips {
    margin-top: 22px;
  }
}

@media (max-width: 380px) {
  .resetPassword__form,
  .resetPassword__side {
    padding-left: 14px;
    padding-right: 14px;
  }

  .resetPassword__title {
    font-size: 26px;
  }
}

@keyframes resetPasswordSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
