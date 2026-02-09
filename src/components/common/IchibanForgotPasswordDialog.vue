<template>
  <!--  overlay：點背景取消 -->
  <div class="ichiban-forgot-dialog" v-bind="data" @click="emitCancel">
    <!--  panel：點內容不關閉 -->
    <div class="ichiban-forgot-dialog__panel" @click.stop>
      <!-- LOGO -->
      <div class="ichiban-forgot-dialog__logo" v-if="showLogo">
        <img :src="weblogo" alt="ichiban kuji" />
      </div>

      <!-- frame -->
      <div class="ichiban-forgot-dialog__frame">
        <!-- header -->
        <div class="ichiban-forgot-dialog__header" v-if="showHeader">
          <span class="header-text">一番くじ ichiban kuji 一番賞</span>
          <span class="header-text">一番くじ ichiban kuji 一番賞</span>
        </div>

        <!-- content -->
        <div class="ichiban-forgot-dialog__content">
          <div class="ichiban-forgot-dialog__divider-title">
            <span>{{ title }}</span>
          </div>

          <!--  v-html：支援說明內容 -->
          <div
            class="ichiban-forgot-dialog__message"
            v-if="content"
            v-html="content"
          />

          <!--  Email 輸入 -->
          <div class="ichiban-forgot-dialog__field">
            <label class="field__label">Email</label>

            <input
              class="field__input"
              type="email"
              v-model="email"
              :placeholder="placeholder"
              @keydown.enter.prevent="handleConfirm"
            />

            <p class="field__error" v-if="errorText">{{ errorText }}</p>
          </div>

          <div class="ichiban-forgot-dialog__actions">
            <button
              class="btn btn--ghost"
              type="button"
              @click.stop="emitCancel"
            >
              {{ cancelText }}
            </button>

            <button
              class="btn btn--primary"
              type="button"
              @click.stop="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>

          <p class="ichiban-forgot-dialog__hint" v-if="hint">
            {{ hint }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import weblogo from '@/assets/image/weblogo.png';

type DataMap = Record<string, string | number | boolean | null | undefined>;

const props = withDefaults(
  defineProps<{
    title?: string;
    content?: string; //  v-html

    confirmText?: string; //  default 送出
    cancelText?: string; //  default 取消

    placeholder?: string;
    defaultEmail?: string;

    /**  直接 v-bind 用（不限制 data-*） */
    data?: DataMap;

    showLogo?: boolean;
    showHeader?: boolean;

    /** 可選：底部 hint */
    hint?: string;
  }>(),
  {
    title: '忘記密碼',
    content:
      '請輸入你的 <b>Email</b>，我們會寄送密碼重設連結給你。<br/>（如果收不到，請檢查垃圾信箱）',
    confirmText: '送出',
    cancelText: '取消',
    placeholder: '請輸入 Email，例如：test@gmail.com',
    defaultEmail: '',
    data: () => ({}),
    showLogo: true,
    showHeader: true,
    hint: '送出後請至信箱收信，連結可能會在幾分鐘內抵達。',
  },
);

const emit = defineEmits<{
  (e: 'confirm', payload: { email: string }): void;
  (e: 'cancel'): void;
}>();

const email = ref(props.defaultEmail || '');
const errorText = ref('');

/**  Email 基本檢核（你也可以換成 yup/vee-validate） */
const isValidEmail = (v: string) => {
  const s = String(v || '').trim();
  if (!s) return false;
  // 簡單版 email regex（夠用，不走極端 RFC）
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

watch(email, () => {
  // 使用者輸入時清掉錯誤
  if (errorText.value) errorText.value = '';
});

const handleConfirm = () => {
  const v = String(email.value || '').trim();

  if (!v) {
    errorText.value = '請輸入 Email';
    return;
  }

  if (!isValidEmail(v)) {
    errorText.value = 'Email 格式不正確';
    return;
  }

  emit('confirm', { email: v });
};

const emitCancel = () => emit('cancel');

/**  onMounted 印出 data */
onMounted(() => {
  console.log('[IchibanForgotPasswordDialog] data =', props.data);
});
</script>

<style lang="scss" scoped>
/* =================================================
   IchibanForgotPasswordDialog (獨立樣式)
================================================= */
.ichiban-forgot-dialog {
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  justify-content: center;
  align-items: center;

  animation: forgot-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes forgot-pop {
  0% {
    opacity: 0;
    transform: scale(0.88) translateY(12px);
  }
  60% {
    opacity: 1;
    transform: scale(1.03) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.ichiban-forgot-dialog__panel {
  position: relative;
  width: 760px;
  max-width: 94vw;
}

.ichiban-forgot-dialog__logo {
  position: absolute;
  top: -72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  width: 240px;

  img {
    width: 100%;
    object-fit: contain;
  }
}

.ichiban-forgot-dialog__frame {
  background: #b43325;
  border-radius: 20px;
  padding: 12px;
}

.ichiban-forgot-dialog__header {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;

  color: #f6e7d5;
  font-size: 14px;
  letter-spacing: 1px;

  .header-text {
    opacity: 0.9;
    white-space: nowrap;
    font-weight: 900;
  }

  @media (max-width: 768px) {
    visibility: hidden;
  }
}

.ichiban-forgot-dialog__content {
  background: #f5e2ce;
  border-radius: 14px;
  padding: 26px 22px 22px;
  display: flex;
  flex-direction: column;
}

.ichiban-forgot-dialog__divider-title {
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 6px 0 14px;
  color: #cf8046;
  font-size: 14px;
  letter-spacing: 2px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #cf8046;
  }

  span {
    padding: 0 14px;
    white-space: nowrap;
    font-weight: 700;
  }
}

/*  v-html 的內容區 */
.ichiban-forgot-dialog__message {
  color: #6b3c1f;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 1px;
  text-align: center;

  margin-bottom: 14px;

  :deep(p) {
    margin: 0;
  }

  :deep(b),
  :deep(strong) {
    color: #b43325;
  }

  :deep(a) {
    color: #b43325;
    text-decoration: underline;
  }
}

.ichiban-forgot-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 6px 0 8px;

  .field__label {
    font-size: 12px;
    letter-spacing: 1px;
    color: #6b3c1f;
    font-weight: 700;
  }

  .field__input {
    height: 42px;
    border-radius: 12px;
    border: 1px solid rgba(180, 51, 37, 0.25);
    padding: 0 12px;
    outline: none;
    font-size: 14px;
    letter-spacing: 0.5px;
    background: #fff;
  }

  .field__input:focus {
    border-color: rgba(180, 51, 37, 0.55);
    box-shadow: 0 0 0 3px rgba(180, 51, 37, 0.12);
  }

  .field__error {
    margin: 0;
    font-size: 12px;
    color: #b43325;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
}

.ichiban-forgot-dialog__actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 16px;

  .btn {
    min-width: 140px;
    height: 40px;
    border-radius: 999px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .btn--ghost {
    background: #f6e7d5;
    border: 1px solid #b43325;
    color: #b43325;
  }

  .btn--primary {
    background: #b43325;
    color: #fff;
  }
}

.ichiban-forgot-dialog__hint {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  opacity: 0.7;
  letter-spacing: 0.5px;
}
</style>
