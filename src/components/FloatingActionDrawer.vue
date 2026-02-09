<!-- src/components/FloatingDrawer.vue -->
<template>
  <!-- 整個浮動區塊：只有 hasScrolled 才顯示 -->
  <div
    class="floating-drawer"
    :class="{ 'floating-drawer--visible': hasScrolled }"
  >
    <div class="floating-drawer__container">
      <!-- 抽屜 icon 區（在按鈕左邊的黑色膠囊） -->
      <div
        class="floating-drawer__drawer"
        :class="{ 'floating-drawer__drawer--open': isOpen }"
      >
        <!-- 儲值 -->
        <button
          type="button"
          class="floating-drawer__iconBtn"
          aria-label="前往儲值"
          @click="handleRecharge"
        >
          <font-awesome-icon
            icon="fa-solid fa-coins"
            class="floating-drawer__icon"
          />
        </button>

        <!-- 活動 -->
        <button
          type="button"
          class="floating-drawer__iconBtn"
          aria-label="查看活動"
          @click="handleActivities"
        >
          <font-awesome-icon
            icon="fa-solid fa-gift"
            class="floating-drawer__icon"
          />
        </button>

        <!-- 客服 / FAQ -->
        <button
          type="button"
          class="floating-drawer__iconBtn"
          aria-label="客服支援"
          @click="handleSupport"
        >
          <font-awesome-icon
            icon="fa-solid fa-headset"
            class="floating-drawer__icon"
          />
        </button>

        <!-- 小標籤文字 -->
        <span class="floating-drawer__label">快速功能</span>
      </div>

      <!-- 觸發按鈕 -->
      <button
        class="floating-drawer__trigger"
        type="button"
        :aria-pressed="isOpen"
        :aria-expanded="isOpen"
        :aria-label="triggerLabel"
        @click="toggleDrawer"
      >
        <!-- 外圈光暈 -->
        <span class="floating-drawer__triggerGlow"></span>

        <!-- 齒輪 icon -->
        <font-awesome-icon
          icon="fa-solid fa-gear"
          class="floating-drawer__triggerIcon floating-drawer__triggerIcon--gear"
          :class="{ 'floating-drawer__triggerIcon--gear-inactive': isOpen }"
        />
        <!-- 關閉 icon -->
        <font-awesome-icon
          icon="fa-solid fa-xmark"
          class="floating-drawer__triggerIcon floating-drawer__triggerIcon--close"
          :class="{ 'floating-drawer__triggerIcon--close-active': isOpen }"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const isOpen = ref(false);
const hasScrolled = ref(false);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const emit = defineEmits<{
  (e: 'click-recharge'): void;
  (e: 'click-activities'): void;
  (e: 'click-support'): void;
}>();

const triggerLabel = computed(() =>
  isOpen.value ? '關閉快速功能列' : '開啟快速功能列',
);

const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
};

const closeDrawer = () => {
  isOpen.value = false;
};

const handleScroll = () => {
  hasScrolled.value = window.scrollY > 80;

  if (!hasScrolled.value) {
    closeDrawer();
  }
};

const go = async (to: any) => {
  closeDrawer();
  await router.push(to);
};

const isLogin = computed(() => !!authStore.token);

const goRequireAuth = async (path: string) => {
  if (!isLogin.value) {
    closeDrawer();
    await router.push({
      name: 'Login',
      query: { redirect: path },
    });
    return;
  }
  await go(path);
};

/** 點「儲值」：導到 會員中心 > 儲值（需要登入） */
const handleRecharge = async () => {
  emit('click-recharge');
  await goRequireAuth('/member-center/deposit');
};

/** 點「活動」：導到 Promotion（你 router 有） */
const handleActivities = async () => {
  emit('click-activities');
  await go({ name: 'Promotion' });
};

/** 點「客服」：先導到 FAQ（你 router 有） */
const handleSupport = async () => {
  emit('click-support');
  await go({ name: 'Faq' });
};

/** ESC 關閉抽屜 */
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeDrawer();
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', onKeydown);
  handleScroll(); // 進來時先判一次
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped lang="scss">
.floating-drawer {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;

  /* 有捲動時才顯示 */
  &--visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  &__container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* 抽屜 icon 區塊：在按鈕左邊，深色膠囊 */
  &__drawer {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(25, 15, 11, 0.96); /* 深咖啡黑 */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(229, 166, 87, 0.28); /* 金邊 */
    backdrop-filter: blur(10px);
    transform: translateX(10px);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.22s ease,
      opacity 0.22s ease;
  }

  /* 展開時顯示膠囊 */
  &__drawer--open {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* 裡面每顆小圓按鈕 */
  &__iconBtn {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    padding: 0;
    margin: 0;
    background: rgba(255, 255, 255, 0.04);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      background 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(229, 166, 87, 0.7);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px) scale(0.96);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
  }

  /* drawer 裡的 font-awesome icon 本身 */
  &__icon {
    color: #ffffff;
    font-size: 16px;
    transform: translateX(12px);
    opacity: 0;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }

  /* label 小標籤文字 */
  &__label {
    font-size: 12px;
    color: #e5a657;
    margin-left: 4px;
    padding-left: 8px;
    border-left: 1px solid rgba(229, 166, 87, 0.4);
    white-space: nowrap;
  }

  /* icon 展開時的滑出動畫 */
  &__drawer--open &__icon {
    transform: translateX(0);
    opacity: 1;
  }

  &__drawer--open &__iconBtn:nth-of-type(1) &__icon {
    transition-delay: 0.02s;
  }
  &__drawer--open &__iconBtn:nth-of-type(2) &__icon {
    transition-delay: 0.06s;
  }
  &__drawer--open &__iconBtn:nth-of-type(3) &__icon {
    transition-delay: 0.1s;
  }

  /* 觸發按鈕本體（右下圓球） */
  &__trigger {
    position: relative;
    cursor: pointer;
    font-size: 22px;
    text-align: center;
    display: block;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    border: none;
    padding: 0;
    outline: none;
    background: linear-gradient(135deg, #b43325 0%, #e5a657 50%, #fff2d6 100%);
    box-shadow:
      0 8px 20px rgba(180, 51, 37, 0.55),
      0 0 0 1px rgba(255, 245, 230, 0.75);
    color: #fff;
    overflow: hidden;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      filter 0.15s ease;

    &:hover {
      transform: translateY(-1px) scale(1.03);
      box-shadow:
        0 12px 26px rgba(180, 51, 37, 0.7),
        0 0 0 1px rgba(255, 247, 235, 0.9);
      filter: brightness(1.04);
    }

    &:active {
      transform: translateY(1px) scale(0.97);
      box-shadow:
        0 4px 12px rgba(180, 51, 37, 0.55),
        0 0 0 1px rgba(255, 243, 226, 0.7);
      filter: brightness(0.98);
    }
  }

  /* 外圈淡淡光暈 */
  &__triggerGlow {
    position: absolute;
    inset: -8px;
    border-radius: inherit;
    background: radial-gradient(
      circle at 30% 20%,
      rgba(255, 255, 255, 0.9),
      transparent 60%
    );
    opacity: 0.75;
    pointer-events: none;
  }

  /* 觸發按鈕裡的 icon */
  &__triggerIcon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      0.5s ease,
      opacity 0.3s ease;
    font-size: 20px;
    line-height: 1;
    color: #fffdf7;
  }

  /* 關閉 icon */
  &__triggerIcon--close {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
  }

  &__triggerIcon--close-active {
    transform: translate(-50%, -50%) rotate(-270deg) scale(1);
    opacity: 1;
  }

  /* 齒輪 icon */
  &__triggerIcon--gear {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }

  &__triggerIcon--gear-inactive {
    transform: translate(-50%, -50%) rotate(-270deg) scale(0.8);
    opacity: 0;
  }
}

/* 窄螢幕：給一點距離邊緣，標籤收起來 */
@media (max-width: 768px) {
  .floating-drawer {
    right: 16px;
    bottom: 16px;

    &__trigger {
      width: 48px;
      height: 48px;
    }

    &__label {
      display: none; /* 手機只留 icon */
    }
  }
}
</style>
