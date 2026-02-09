<template>
  <!--  overlay：點背景直接確認關閉 -->
  <div class="ichiban-info-dialog" v-bind="data" @click="emitConfirm">
    <!--  panel：點內容不關閉 -->
    <div class="ichiban-info-dialog__panel" @click.stop>
      <!-- LOGO -->
      <div class="ichiban-info-dialog__logo" v-if="showLogo">
        <img :src="weblogo" alt="ichiban kuji" />
      </div>

      <!-- frame -->
      <div class="ichiban-info-dialog__frame">
        <!-- header -->
        <div class="ichiban-info-dialog__header" v-if="showHeader">
          <span class="header-text">一番くじ ichiban kuji 一番賞</span>
          <span class="header-text">一番くじ ichiban kuji 一番賞</span>
        </div>

        <!-- content -->
        <div class="ichiban-info-dialog__content">
          <div class="ichiban-info-dialog__divider-title">
            <span>{{ title }}</span>
          </div>

          <!--  v-html -->
          <div
            class="ichiban-info-dialog__message"
            v-if="content"
            v-html="content"
          />

          <!-- actions -->
          <div class="ichiban-info-dialog__actions">
            <button
              class="btn btn--primary"
              type="button"
              @click.stop="emitConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import weblogo from '@/assets/image/weblogo.png';

type DataMap = Record<string, string | number | boolean | null | undefined>;

const props = withDefaults(
  defineProps<{
    title?: string;
    content?: string; //  v-html
    confirmText?: string;

    /**  直接 v-bind 用 */
    data?: DataMap;

    showLogo?: boolean;
    showHeader?: boolean;
  }>(),
  {
    title: '提示訊息',
    content: '',
    confirmText: '確定',
    data: () => ({}),
    showLogo: true,
    showHeader: true,
  },
);

const emit = defineEmits<{
  (e: 'confirm'): void;
}>();

const emitConfirm = () => emit('confirm');

/**  onMounted 印出 data */
onMounted(() => {
  console.log('[IchibanInfoDialog] data =', props.data);
});
</script>

<style lang="scss" scoped>
/* =================================================
   IchibanInfoDialog (獨立樣式)
================================================= */
.ichiban-info-dialog {
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  justify-content: center;
  align-items: center;

  animation: info-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes info-pop {
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

.ichiban-info-dialog__panel {
  position: relative;
  width: 760px;
  max-width: 94vw;
}

.ichiban-info-dialog__logo {
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

.ichiban-info-dialog__frame {
  background: #b43325;
  border-radius: 20px;
  padding: 12px;
}

.ichiban-info-dialog__header {
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

.ichiban-info-dialog__content {
  background: #f5e2ce;
  border-radius: 14px;
  padding: 26px 22px 22px;
  display: flex;
  flex-direction: column;
}

.ichiban-info-dialog__divider-title {
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 6px 0 16px;
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

.ichiban-info-dialog__message {
  color: #6b3c1f;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 1px;
  text-align: center;

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

.ichiban-info-dialog__actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 18px;

  .btn {
    min-width: 140px;
    height: 40px;
    border-radius: 999px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .btn--primary {
    background: #b43325;
    color: #fff;
  }
}
</style>
