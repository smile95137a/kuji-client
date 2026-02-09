<template>
  <div class="m-headerActions" v-if="!modelValue">
    <button
      class="m-hamburger"
      type="button"
      :aria-expanded="modelValue ? 'true' : 'false'"
      aria-label="Open menu"
      @click="toggle"
    >
      <font-awesome-icon
        class="m-hamburger__icon"
        :icon="['fas', modelValue ? 'xmark' : 'bars']"
      />
    </button>
  </div>

  <!-- overlay -->
  <div class="m-overlay" :class="{ 'is-open': modelValue }" @click="close" />

  <!-- drawer -->
  <aside class="m-drawer" :class="{ 'is-open': modelValue }">
    <div class="m-drawer__top">
      <span class="m-drawer__title"></span>
      <button class="m-drawer__close" type="button" @click="close">✕</button>
    </div>

    <!-- 主選單 -->
    <div class="m-drawer__section">
      <p class="m-drawer__sectionTitle">商品</p>

      <RouterLink
        v-for="item in primaryMenu"
        :key="item.key"
        class="m-drawer__link"
        :to="primaryTo(item)"
        @click="onNav"
      >
        {{ item.label }}
      </RouterLink>
    </div>

    <!-- 次選單 -->
    <div v-if="secondaryMenu.length" class="m-drawer__section">
      <p class="m-drawer__sectionTitle">分類</p>

      <RouterLink
        v-for="item in secondaryMenu"
        :key="item.key"
        class="m-drawer__link"
        :to="secondaryTo(item)"
        @click="onNav"
      >
        {{ item.label }}
      </RouterLink>
    </div>

    <!-- auth -->
    <div class="m-drawer__section m-drawer__section--auth">
      <template v-if="!isLogin">
        <button
          class="m-drawer__btn m-drawer__btn--solid"
          type="button"
          @click="emitLoginAndClose"
        >
          登入
        </button>
        <button
          class="m-drawer__btn m-drawer__btn--ghost"
          type="button"
          @click="emitRegisterAndClose"
        >
          註冊
        </button>
      </template>

      <template v-else>
        <button
          class="m-drawer__btn m-drawer__btn--solid"
          type="button"
          @click="emitMemberAndClose"
        >
          會員中心
        </button>
        <button
          class="m-drawer__btn m-drawer__btn--ghost"
          type="button"
          @click="emitLogoutAndClose"
        >
          登出
        </button>
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';
import { RouterLink, type RouteLocationRaw } from 'vue-router';

type MenuItem = { key: string; label: string; mega?: boolean };

const props = defineProps<{
  modelValue: boolean;

  isLogin: boolean;

  primaryMenu: MenuItem[];
  secondaryMenu: MenuItem[];

  primaryTo: (item: MenuItem) => RouteLocationRaw;
  secondaryTo: (item: MenuItem) => RouteLocationRaw;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'login'): void;
  (e: 'register'): void;
  (e: 'member'): void;
  (e: 'logout'): void;
  (e: 'nav'): void;
}>();

/** body scroll lock */
const lockBody = (locked: boolean) => {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
  document.body.style.overflow = locked ? 'hidden' : '';
  document.body.style.touchAction = locked ? 'none' : '';
};

watch(
  () => props.modelValue,
  (open) => lockBody(open),
  { immediate: true },
);

onBeforeUnmount(() => lockBody(false));

const close = () => emit('update:modelValue', false);
const toggle = () => emit('update:modelValue', !props.modelValue);

const onNav = () => {
  emit('nav');
  close();
};

const emitLoginAndClose = () => {
  emit('login');
  close();
};

const emitRegisterAndClose = () => {
  emit('register');
  close();
};

const emitMemberAndClose = () => {
  emit('member');
  close();
};

const emitLogoutAndClose = () => {
  emit('logout');
  close();
};
</script>

<style scoped lang="scss">
.m-headerActions,
.m-overlay,
.m-drawer {
  display: none;
}

@media (max-width: 640px) {
  .m-headerActions,
  .m-overlay,
  .m-drawer {
    display: block;
  }

  .m-headerActions {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 999;

    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  /* hamburger */
  .m-hamburger {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.78);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .m-hamburger__icon {
    font-size: 18px;
    color: #1b1b1b;
  }

  /* overlay */
  .m-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;
    z-index: 80;
  }

  .m-overlay.is-open {
    opacity: 1;
    pointer-events: auto;
  }

  /* drawer */
  .m-drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100dvh;
    width: min(86vw, 360px);
    background: #ffffff;
    transform: translateX(105%);
    transition: transform 0.22s ease;
    z-index: 90;

    display: flex;
    flex-direction: column;

    box-shadow: -18px 0 40px rgba(0, 0, 0, 0.28);
  }

  .m-drawer.is-open {
    transform: translateX(0);
  }

  .m-drawer__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .m-drawer__title {
    font-weight: 900;
    letter-spacing: 2px;
    color: #1b1b1b;
  }

  .m-drawer__close {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    cursor: pointer;
    font-size: 16px;
    line-height: 36px;
  }

  .m-drawer__section {
    padding: 14px;
  }

  .m-drawer__section + .m-drawer__section {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .m-drawer__sectionTitle {
    margin: 0 0 10px 0;
    font-weight: 900;
    color: #b43325;
    letter-spacing: 1px;
  }

  .m-drawer__link {
    display: block;
    padding: 12px 10px;
    border-radius: 12px;
    text-decoration: none;
    color: #1b1b1b;
    font-weight: 800;
  }

  .m-drawer__link:active {
    background: rgba(180, 51, 37, 0.08);
  }

  .m-drawer__section--auth {
    margin-top: auto;
    padding-bottom: 18px;
  }

  .m-drawer__btn {
    width: 100%;
    height: 42px;
    border-radius: 12px;
    font-weight: 900;
    letter-spacing: 1px;
    cursor: pointer;
  }

  .m-drawer__btn + .m-drawer__btn {
    margin-top: 10px;
  }

  .m-drawer__btn--solid {
    border: 0;
    background: #b43325;
    color: #fff;
  }

  .m-drawer__btn--ghost {
    background: transparent;
    border: 2px solid #b43325;
    color: #b43325;
  }
}
</style>
