<template>
  <div v-if="isEmailUser" class="changePwd">
    <div class="changePwd__header">
      <span class="changePwd__icon" aria-hidden="true">
        <font-awesome-icon :icon="['fas', 'lock']" />
      </span>
      <div>
        <h3 class="changePwd__title">修改密碼</h3>
        <p class="changePwd__subtitle">建議定期更新密碼，讓帳號更安全。</p>
      </div>
    </div>

    <div class="changePwd__divider"></div>

    <div class="changePwd__form">
      <div class="changePwd__field">
        <label class="changePwd__label" for="cp-current">目前密碼</label>
        <div class="changePwd__inputWrap">
          <input
            id="cp-current"
            v-model="form.currentPassword"
            class="changePwd__input"
            :type="show.current ? 'text' : 'password'"
            placeholder="請輸入目前密碼"
            autocomplete="current-password"
          />
          <button
            class="changePwd__eye"
            type="button"
            :aria-label="show.current ? '隱藏密碼' : '顯示密碼'"
            @click="show.current = !show.current"
          >
            <font-awesome-icon :icon="['fas', show.current ? 'eye-slash' : 'eye']" />
          </button>
        </div>
      </div>

      <div class="changePwd__field">
        <label class="changePwd__label" for="cp-new">新密碼</label>
        <div class="changePwd__inputWrap">
          <input
            id="cp-new"
            v-model="form.newPassword"
            class="changePwd__input"
            :type="show.newPass ? 'text' : 'password'"
            placeholder="至少 8 碼"
            autocomplete="new-password"
          />
          <button
            class="changePwd__eye"
            type="button"
            :aria-label="show.newPass ? '隱藏密碼' : '顯示密碼'"
            @click="show.newPass = !show.newPass"
          >
            <font-awesome-icon :icon="['fas', show.newPass ? 'eye-slash' : 'eye']" />
          </button>
        </div>
      </div>

      <div class="changePwd__field">
        <label class="changePwd__label" for="cp-confirm">確認新密碼</label>
        <div class="changePwd__inputWrap" :class="{ 'changePwd__inputWrap--err': confirmMismatch }">
          <input
            id="cp-confirm"
            v-model="form.confirmNewPassword"
            class="changePwd__input"
            :type="show.confirm ? 'text' : 'password'"
            placeholder="請再次輸入新密碼"
            autocomplete="new-password"
          />
          <button
            class="changePwd__eye"
            type="button"
            :aria-label="show.confirm ? '隱藏密碼' : '顯示密碼'"
            @click="show.confirm = !show.confirm"
          >
            <font-awesome-icon :icon="['fas', show.confirm ? 'eye-slash' : 'eye']" />
          </button>
        </div>
        <p v-if="confirmMismatch" class="changePwd__msg changePwd__msg--err">
          <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
          新密碼與確認密碼不一致。
        </p>
      </div>

      <p v-if="successMsg" class="changePwd__msg changePwd__msg--ok">
        <font-awesome-icon :icon="['fas', 'circle-check']" />
        {{ successMsg }}
      </p>
      <p v-if="errorMsg" class="changePwd__msg changePwd__msg--err">
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        {{ errorMsg }}
      </p>

      <div class="changePwd__footer">
        <button
          class="changePwd__btn"
          type="button"
          :disabled="isLoading || confirmMismatch"
          @click="onSubmit"
        >
          <span v-if="isLoading" class="changePwd__spinner"></span>
          <template v-else>
            <font-awesome-icon :icon="['fas', 'key']" />
            確認修改
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChangePassword } from '@/composables/useChangePassword';

const authStore = useAuthStore();
const { form, isLoading, successMsg, errorMsg, submit } = useChangePassword();

const isEmailUser = computed(() => authStore.user?.provider === 'EMAIL');
const show = reactive({ current: false, newPass: false, confirm: false });

const confirmMismatch = computed(
  () =>
    form.confirmNewPassword.length > 0 &&
    form.newPassword !== form.confirmNewPassword,
);

async function onSubmit() {
  await submit();
}
</script>

<style scoped lang="scss">
$kuji-red: #b03829;
$kuji-gold: #e5a657;
$kuji-cream: #fdf6ef;

.changePwd {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba($kuji-red, 0.14);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba($kuji-red, 0.06);

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: linear-gradient(180deg, $kuji-gold 0%, $kuji-red 100%);
    border-radius: 16px 0 0 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px 0 22px;
  }

  &__icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, $kuji-gold 0%, $kuji-red 100%);
    color: #fff;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    margin: 0 0 3px;
    font-size: 16px;
    font-weight: 900;
    color: #1a0e0a;
  }

  &__subtitle {
    margin: 0;
    font-size: 12px;
    color: rgba($kuji-red, 0.65);
  }

  &__divider {
    height: 1px;
    background: linear-gradient(90deg, rgba($kuji-gold, 0.45) 0%, transparent 100%);
    margin: 16px 20px 16px 22px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 0 20px 20px 22px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: 12px;
    font-weight: 700;
    color: rgba(#1a0e0a, 0.65);
  }

  &__inputWrap {
    display: flex;
    align-items: center;
    border: 1.5px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    background: $kuji-cream;
    overflow: hidden;

    &:focus-within {
      border-color: $kuji-red;
      box-shadow: 0 0 0 3px rgba($kuji-red, 0.1);
      background: #fff;
    }

    &--err {
      border-color: #d32f2f;
      box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
    }
  }

  &__input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 11px 12px;
    font-size: 14px;
    color: #1a0e0a;
    outline: none;
  }

  &__eye {
    flex-shrink: 0;
    padding: 0 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(#1a0e0a, 0.4);
    font-size: 14px;
  }

  &__msg {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;

    &--ok {
      color: #2e7d32;
      background: rgba(46, 125, 50, 0.08);
    }

    &--err {
      color: #d32f2f;
      background: rgba(211, 47, 47, 0.08);
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, $kuji-red 0%, darken($kuji-red, 6%) 100%);
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    animation: spin 0.7s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
