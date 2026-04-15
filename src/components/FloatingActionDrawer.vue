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
$wine-base: #5c0505;
$wine-950: #120101;
$wine-900: #1a0202;
$wine-850: #240303;
$wine-800: #2f0404;
$wine-700: #430606;
$wine-600: #5c0505;
$wine-500: #791015;
$wine-400: #982430;
$wine-300: #bc4d5d;

$rose-100: #fff6f7;
$rose-200: #ffe7ea;
$rose-300: #f4c7cf;
$rose-400: #dea1ab;

$text-soft: rgba(255, 235, 238, 0.72);

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

  /* 左側展開膠囊 */
  &__drawer {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(
      135deg,
      rgba(26, 2, 2, 0.96) 0%,
      rgba(47, 4, 4, 0.95) 52%,
      rgba(92, 5, 5, 0.92) 100%
    );
    border: 1px solid rgba(244, 199, 207, 0.2);
    box-shadow:
      0 10px 28px rgba(18, 1, 1, 0.5),
      inset 0 1px 0 rgba(255, 246, 247, 0.08);
    backdrop-filter: blur(10px);
    transform: translateX(10px);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.22s ease,
      opacity 0.22s ease;
  }

  &__drawer--open {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* 小圓按鈕 */
  &__iconBtn {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(255, 246, 247, 0.14);
    padding: 0;
    margin: 0;
    background: linear-gradient(
      180deg,
      rgba(255, 246, 247, 0.08) 0%,
      rgba(255, 246, 247, 0.03) 100%
    );
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
      background: linear-gradient(
        180deg,
        rgba(188, 77, 93, 0.24) 0%,
        rgba(121, 16, 21, 0.2) 100%
      );
      border-color: rgba(244, 199, 207, 0.42);
      box-shadow:
        0 6px 14px rgba(18, 1, 1, 0.32),
        inset 0 1px 0 rgba(255, 246, 247, 0.08);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px) scale(0.96);
      box-shadow: 0 2px 8px rgba(18, 1, 1, 0.28);
    }
  }

  &__icon {
    color: $rose-100;
    font-size: 16px;
    transform: translateX(12px);
    opacity: 0;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }

  &__label {
    font-size: 12px;
    color: $rose-300;
    margin-left: 4px;
    padding-left: 8px;
    border-left: 1px solid rgba(244, 199, 207, 0.25);
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

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

  /* 右下主按鈕 */
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
    overflow: hidden;
    color: $rose-100;
    background: linear-gradient(
      135deg,
      $wine-950 0%,
      $wine-700 38%,
      $wine-500 70%,
      $wine-300 100%
    );
    box-shadow:
      0 10px 24px rgba(47, 4, 4, 0.42),
      0 0 0 1px rgba(255, 246, 247, 0.22),
      inset 0 1px 0 rgba(255, 246, 247, 0.18);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      filter 0.15s ease;

    &:hover {
      transform: translateY(-1px) scale(1.03);
      box-shadow:
        0 14px 28px rgba(47, 4, 4, 0.5),
        0 0 0 1px rgba(255, 246, 247, 0.3),
        inset 0 1px 0 rgba(255, 246, 247, 0.22);
      filter: brightness(1.05);
    }

    &:active {
      transform: translateY(1px) scale(0.97);
      box-shadow:
        0 6px 14px rgba(47, 4, 4, 0.42),
        0 0 0 1px rgba(255, 246, 247, 0.18);
      filter: brightness(0.98);
    }
  }

  /* 外圈柔光 */
  &__triggerGlow {
    position: absolute;
    inset: -8px;
    border-radius: inherit;
    background:
      radial-gradient(
        circle at 30% 25%,
        rgba(255, 246, 247, 0.5),
        transparent 42%
      ),
      radial-gradient(
        circle at 70% 75%,
        rgba(188, 77, 93, 0.26),
        transparent 48%
      );
    opacity: 0.95;
    pointer-events: none;
  }

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
    color: $rose-100;
    text-shadow: 0 1px 6px rgba(18, 1, 1, 0.35);
  }

  &__triggerIcon--close {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
  }

  &__triggerIcon--close-active {
    transform: translate(-50%, -50%) rotate(-270deg) scale(1);
    opacity: 1;
  }

  &__triggerIcon--gear {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }

  &__triggerIcon--gear-inactive {
    transform: translate(-50%, -50%) rotate(-270deg) scale(0.8);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .floating-drawer {
    right: 16px;
    bottom: 16px;

    &__trigger {
      width: 48px;
      height: 48px;
    }

    &__label {
      display: none;
    }
  }
}
</style>
