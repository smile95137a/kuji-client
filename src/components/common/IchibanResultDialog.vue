<template>
  <div class="ichiban-dialog" @click="emitCancel">
    <!-- panel -->
    <div class="ichiban-dialog__panel">
      <!-- LOGO -->
      <div class="ichiban-dialog__logo">
        <img :src="weblogo" alt="ichiban kuji" />
      </div>

      <!-- frame -->
      <div class="ichiban-dialog__frame">
        <!-- header -->
        <div class="ichiban-dialog__header">
          <span class="header-text">一番くじ ichiban kuji 一番賞</span>
          <span class="header-text">一番くじ ichiban kuji 一番賞</span>
        </div>

        <!-- content -->
        <div class="ichiban-dialog__content">
          <!-- stats -->
          <div class="ichiban-dialog__stats">
            <div class="stat">
              <span class="label">目前剩餘</span>
              <span class="value">{{ remain }}</span>
              <span class="unit">抽</span>
            </div>
            <div class="stat">
              <span class="label">連續次數</span>
              <span class="value">{{ count }}</span>
              <span class="unit">抽</span>
            </div>
            <div class="stat stat--price">
              <span class="label">共花費</span>
              <span class="value">{{ totalPrice }}</span>
            </div>
          </div>

          <div class="ichiban-dialog__divider-title">
            <span>抽中賞品</span>
          </div>

          <!-- grid -->
          <div class="ichiban-dialog__grid">
            <div v-for="item in items" :key="item.id" class="prize">
              <div class="prize__image">
                <img :src="item.image" />
              </div>
              <p class="prize__name">{{ item.name }}</p>
            </div>
          </div>

          <div class="ichiban-dialog__divider" />

          <!-- actions -->
          <div class="ichiban-dialog__actions">
            <button class="btn btn--ghost" @click="emitCancel">取消</button>
            <button class="btn btn--primary" @click="emitConfirm">確認</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import weblogo from '@/assets/image/weblogo.png';

defineProps<{
  remain: number;
  count: number;
  totalPrice: number;
  items: {
    id: string;
    name: string;
    image: string;
    grade?: 'A' | 'B' | 'C' | 'D';
  }[];
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const emitConfirm = () => emit('confirm');
const emitCancel = () => emit('cancel');
</script>

<style lang="scss">
/* =================================================
   Dialog entrance animation
================================================= */
.ichiban-dialog {
  animation: dialog-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes dialog-pop {
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

/* =================================================
   Base layout
================================================= */
.ichiban-dialog {
  position: absolute;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;

  /* ---------- panel ---------- */
  &__panel {
    position: relative;
    width: 860px;
    max-width: 94vw;
  }

  /* ---------- logo ---------- */
  &__logo {
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

  /* ---------- frame ---------- */
  &__frame {
    background: #b43325;
    border-radius: 20px;
    padding: 12px;
  }

  /* ---------- header ---------- */
  &__header {
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

    /* 📱 Mobile：隱藏 header */
    @media (max-width: 768px) {
      visibility: hidden;
    }
  }

  /* ---------- content ---------- */
  &__content {
    background: #f5e2ce;
    border-radius: 14px;
    padding: 28px 24px 22px;
    display: flex;
    flex-direction: column;
  }

  /* =================================================
     Stats
  ================================================= */
  &__stats {
    display: flex;
    justify-content: center;
    gap: 10%;

    .stat {
      text-align: center;
      letter-spacing: 1px;

      .value {
        font-size: 32px;
        color: #b43325;
      }

      &.stat--price .value {
        font-weight: 700;
      }
    }
  }

  /* =================================================
     Divider
  ================================================= */
  &__divider {
    height: 1px;
    margin: 16px 0 20px;
    background: #cf8046;
  }

  &__divider-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 0 20px;
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

    &::after {
      background: #cf8046;
    }

    span {
      padding: 0 14px;
      white-space: nowrap;
      font-weight: 500;
    }
  }

  /* =================================================
     Grid（⭐ 重點調整）
  ================================================= */
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;

    /* ⭐ 高度限制 + 捲動 */
    max-height: 280px;
    overflow-y: auto;
    padding-right: 6px;

    /* scrollbar */
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(180, 64, 45, 0.35);
      border-radius: 4px;
    }
  }

  /* =================================================
     Actions
  ================================================= */
  &__actions {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-top: 16px;

    .btn {
      min-width: 120px;
      height: 38px;
      border-radius: 999px;
      font-size: 14px;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .btn--ghost {
      background: #f6e7d5;
      border-color: #b43325;
      color: #b43325;
    }

    .btn--primary {
      background: #b43325;
      color: #fff;
    }
  }
}

/* =================================================
   Prize（⭐ 圖片尺寸優化）
================================================= */
.prize {
  display: flex;
  align-items: center;
  gap: 12px;

  &__image {
    width: 56px;
    height: 56px;
    flex-shrink: 0;

    display: grid;
    place-items: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__name {
    font-size: 12px;
    line-height: 1.4;
  }

  /* ---------- A賞（金光，不影響版型） ---------- */
  &--main {
    border-radius: 12px;
    background: linear-gradient(135deg, #fff6cc, #f6e7d5);
    box-shadow: 0 0 0 2px #d4a94f inset, 0 0 18px rgba(255, 210, 120, 0.55);
    animation: prize-glow 2.8s ease-in-out infinite alternate;

    .prize__name {
      font-weight: 600;
      color: #8f5a00;
    }
  }
}

@keyframes prize-glow {
  from {
    box-shadow: 0 0 0 2px #d4a94f inset, 0 0 14px rgba(255, 200, 80, 0.45);
  }
  to {
    box-shadow: 0 0 0 2px #f2d675 inset, 0 0 26px rgba(255, 220, 120, 0.75);
  }
}
</style>
