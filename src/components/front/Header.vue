<template>
  <header
    ref="headerRef"
    class="app-header"
    :class="{ 'is-mega-open': !!activeMega }"
    @mouseleave="closeMega"
  >
    <!-- Logo（浮在紅條上） -->
    <RouterLink
      ref="logoRef"
      class="app-header__logo"
      :to="{ name: 'Home' }"
      aria-label="ICHIBAN KUJI"
      @click="closeMega"
    >
      <img class="app-header__logoImg" :src="weblogo" alt="ICHIBAN KUJI" />
    </RouterLink>

    <!-- Hero -->
    <div class="app-header__hero">
      <img
        class="app-header__heroBg"
        :src="headerBg"
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div
        class="app-header__inner app-header__inner--hero app-header__heroRow"
      >
        <div class="app-header__actions">
          <!-- 未登入：登入/註冊 -->
          <template v-if="!isLogin">
            <button
              class="app-header__btn app-header__btn--solid"
              type="button"
              @click="goLogin"
            >
              登入
            </button>

            <button
              class="app-header__btn app-header__btn--ghost"
              type="button"
              @click="goRegister"
            >
              註冊
            </button>
          </template>

          <!-- 已登入：會員中心/登出 -->
          <template v-else>
            <button
              class="app-header__btn app-header__btn--solid"
              type="button"
              @click="goMemberCenter"
            >
              會員中心
            </button>

            <button
              class="app-header__btn app-header__btn--ghost"
              type="button"
              @click="handleLogout"
            >
              登出
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Primary -->
    <nav class="app-header__primary">
      <div
        ref="primaryBarInnerRef"
        class="app-header__inner app-header__inner--primary app-header__barInner"
      >
        <div class="app-header__logoSpace" aria-hidden="true"></div>

        <ul class="app-header__primary-list">
          <li
            v-for="(item, idx) in primaryMenu"
            :key="item.key"
            class="app-header__primary-item"
          >
            <RouterLink
              class="app-header__primary-link"
              :to="primaryTo(item)"
              :ref="setPrimaryLinkRef(idx)"
              @click="closeMega"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Secondary -->
    <nav ref="secondaryNavRef" class="app-header__secondary">
      <div
        class="app-header__inner app-header__inner--secondary app-header__barInner"
      >
        <div class="app-header__logoSpace" aria-hidden="true"></div>

        <ul class="app-header__secondary-list">
          <li
            v-for="item in secondaryMenu"
            :key="item.key"
            class="app-header__secondary-item"
            :class="{ 'is-active': activeMega === item.key }"
            :ref="setSecondaryItemRef(item.key)"
            @mouseenter="item.mega ? openMega(item.key) : closeMega()"
          >
            <RouterLink
              class="app-header__secondary-link"
              :to="secondaryTo(item)"
              @click="closeMega"
            >
              {{ item.label }}
              <span v-if="item.mega" class="app-header__caret">▽</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div
        v-if="activeMega"
        class="app-header__notch"
        :style="{ left: `${notchLeft}px` }"
      />
    </nav>

    <!-- Mega (absolute) -->
    <transition name="fade">
      <div v-if="activeMega" class="mega">
        <div class="app-header__inner app-header__inner--mega">
          <div class="mega__inner">
            <div class="mega__title">
              <span class="mega__title-text">{{ megaTitle }}</span>
            </div>

            <div class="mega__grid">
              <section
                v-for="sec in megaData"
                :key="sec.title"
                class="mega__section"
              >
                <h4 class="mega__section-title">{{ sec.title }}</h4>

                <div class="mega__section-cols">
                  <ul
                    v-for="(col, idx) in sec.columns"
                    :key="idx"
                    class="mega__list"
                  >
                    <li v-for="b in col" :key="b.name" class="mega__item">
                      <RouterLink
                        class="mega__link"
                        :to="megaTo(b)"
                        @click="closeMega"
                      >
                        <span class="mega__name">{{ b.name }}</span>
                        <span v-if="b.hot" class="mega__hot">HOT</span>
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>

  <MobileHeaderMenu
    v-model="isMobileOpen"
    :is-login="isLogin"
    :primary-menu="primaryMenu"
    :secondary-menu="secondaryMenu"
    :primary-to="primaryTo"
    :secondary-to="secondaryTo"
    @nav="onMobileNav"
    @login="goLogin"
    @register="goRegister"
    @member="goMemberCenter"
    @logout="handleLogout"
  />
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from 'vue';

import { useRouter, useRoute, type RouteLocationRaw } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { logoutApi } from '@/services/AuthService';

import weblogo from '@/assets/image/weblogo.png';
import headerBg from '@/assets/image/header_bg.jpg';
import MobileHeaderMenu from '@/components/header/MobileHeaderMenu.vue';

const isMobileOpen = ref(false);

const onMobileNav = () => {
  closeMega();
  isMobileOpen.value = false;
};

type MenuItem = { key: string; label: string; mega?: boolean };

const primaryMenu: MenuItem[] = [
  { key: 'kuji', label: '官方一番賞' },
  { key: 'gacha', label: '扭蛋' },
  { key: 'scratch', label: '刮刮樂' },
  { key: 'custom', label: '自製一番賞' },
  { key: 'card', label: '卡牌' },
  { key: 'store', label: '店家' },
];

const secondaryMenu: MenuItem[] = [];

/** ===== Auth / Router ===== */
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLogin = computed(() => !!authStore.token);

const goLogin = () => {
  router.push({
    name: 'Login',
  });
};

const goRegister = () => {
  router.push({
    name: 'Register',
  });
};

const goMemberCenter = () => {
  router.push({ name: 'MemberCenter' });
};

const handleLogout = async () => {
  await logoutApi();
  authStore.logout();
  router.push({ name: 'Home' });
};

/** ===== Mega open / close ===== */
const activeMega = ref<string>('');
const openMega = (key: string) => (activeMega.value = key);
const closeMega = () => (activeMega.value = '');

const primaryTo = (item: MenuItem): RouteLocationRaw => {
  const map: Record<string, RouteLocationRaw> = {
    kuji: { name: 'IchibanList', query: { type: 'kuji' } },
    gacha: { name: 'IchibanList', query: { type: 'gacha' } },
    scratch: { name: 'IchibanList', query: { type: 'scratch' } },
    custom: { name: 'IchibanList', query: { type: 'custom' } },
    card: { name: 'IchibanList', query: { type: 'card' } },
    store: { name: 'StoreList' },
  };

  return map[item.key] ?? { name: 'IchibanList' };
};

const secondaryTo = (item: MenuItem): RouteLocationRaw => {
  if (item.mega) {
    return { name: 'IchibanList', query: { tab: item.key } };
  }

  const map: Record<string, RouteLocationRaw> = {
    kuji2: { name: 'IchibanList', query: { type: 'kuji' } },
    gacha2: { name: 'IchibanList', query: { type: 'gacha' } },
    figure: { name: 'IchibanList', query: { type: 'figure' } },
    pvc: { name: 'IchibanList', query: { type: 'pvc' } },
  };

  return map[item.key] ?? { name: 'IchibanList' };
};

type MegaItem = { name: string; hot?: boolean };

const megaTo = (b: MegaItem): RouteLocationRaw => {
  const filterKey =
    activeMega.value === 'theme'
      ? 'theme'
      : activeMega.value === 'brand'
        ? 'brand'
        : activeMega.value === 'model'
          ? 'model'
          : 'tag';

  return {
    name: 'IchibanList',
    query: {
      tab: activeMega.value,
      [filterKey]: b.name,
    },
  };
};

/** ===== Refs ===== */
const headerRef = ref<HTMLElement | null>(null);
const logoRef = ref<HTMLElement | ComponentPublicInstance | null>(null);
const primaryBarInnerRef = ref<HTMLElement | null>(null);
const firstPrimaryLinkRef = ref<HTMLElement | ComponentPublicInstance | null>(
  null,
);

const setPrimaryLinkRef = (idx: number) => (el: HTMLElement | null) => {
  if (idx !== 0) return;
  firstPrimaryLinkRef.value = el;
};

const getObservedElement = (
  el: HTMLElement | ComponentPublicInstance | null | undefined,
): HTMLElement | null => {
  if (!el) return null;
  if (el instanceof HTMLElement) return el;
  if ((el as any).$el instanceof HTMLElement) return (el as any).$el;
  return null;
};

/** ===== Notch (secondary) ===== */
const secondaryNavRef = ref<HTMLElement | null>(null);
const secondaryItemMap = new Map<string, HTMLElement>();
const notchLeft = ref(0);

const setSecondaryItemRef = (key: string) => (el: HTMLElement | null) => {
  if (!el) {
    secondaryItemMap.delete(key);
    return;
  }

  secondaryItemMap.set(key, el);
};

const updateNotch = () => {
  if (!activeMega.value) return;

  const barEl = secondaryNavRef.value;
  const itemEl = secondaryItemMap.get(activeMega.value);

  if (!barEl || !itemEl) return;

  const barRect = barEl.getBoundingClientRect();
  const itemRect = itemEl.getBoundingClientRect();

  notchLeft.value = itemRect.left - barRect.left + itemRect.width / 2;
};

watch(activeMega, async () => {
  await nextTick();
  updateNotch();
});

/** ===== Mega data ===== */
const megaTitle = computed(() => {
  if (activeMega.value === 'brand') return '品牌';
  if (activeMega.value === 'theme') return '主題';
  if (activeMega.value === 'model') return '模型';
  return '';
});

type MegaSection = { title: string; columns: MegaItem[][] };

const megaData = computed<MegaSection[]>(() => {
  if (activeMega.value !== 'brand') {
    return [
      {
        title: '分類',
        columns: [
          [
            { name: '即將上架', hot: true },
            { name: '熱銷排行' },
            { name: '新品' },
          ],
          [{ name: '限定' }, { name: '預購', hot: true }, { name: '特價' }],
        ],
      },
    ];
  }

  return [
    {
      title: '日本',
      columns: [
        [
          { name: 'ALTER' },
          { name: 'KADOKAWA' },
          { name: 'Prime 1 Studio' },
          { name: '一番賞', hot: true },
        ],
        [
          { name: 'BANDAI', hot: true },
          { name: 'Max Factory' },
          { name: 'T-ARTS' },
          { name: '奇譚俱樂部', hot: true },
        ],
        [
          { name: 'BANDAI CANDY' },
          { name: 'FuRyu' },
          { name: 'MEDICOS' },
          { name: 'TAKARA TOMY', hot: true },
        ],
        [
          { name: 'BANDAI SPIRITS' },
          { name: 'FUJIMI' },
          { name: 'TAMASHII', hot: true },
          { name: '壽屋', hot: true },
        ],
        [
          { name: 'BANPRESTO' },
          { name: 'Gecco' },
          { name: 'MEDICOM TOY' },
          { name: 'PLEX' },
        ],
        [
          { name: 'BANDAI Gashapon' },
          { name: 'GOOD SMILE', hot: true },
          { name: 'RE-MENT' },
          { name: 'VOLKS' },
        ],
        [
          { name: 'FREEing' },
          { name: 'Kenelephant', hot: true },
          { name: 'SEGA' },
          { name: 'X-PLUS TOYS', hot: true },
        ],
      ],
    },
  ];
});

/** ===== Logo auto-position ===== */
const getCssPx = (el: HTMLElement, name: string, fallback: number) => {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const n = Number.parseFloat(v);

  return Number.isFinite(n) ? n : fallback;
};

const updateLogoLeft = () => {
  const headerEl = headerRef.value;
  const logoEl = getObservedElement(logoRef.value);
  const barEl = primaryBarInnerRef.value;

  if (!headerEl || !logoEl || !barEl) return;

  const headerRect = headerEl.getBoundingClientRect();
  const barRect = barEl.getBoundingClientRect();

  const gutter = getCssPx(headerEl, '--gutter', 18);
  const gap = getCssPx(headerEl, '--logo-gap', 10);
  const logoW = logoEl.offsetWidth || getCssPx(headerEl, '--logo-w', 280);

  const barContentStartX = barRect.left + gutter;

  let logoLeft = barContentStartX - headerRect.left;

  logoLeft = Math.max(gutter, logoLeft);

  const spaceW = Math.max(0, logoW + gap);

  headerEl.style.setProperty('--logo-left', `${Math.round(logoLeft)}px`);
  headerEl.style.setProperty('--logo-space-w', `${Math.round(spaceW)}px`);
};

const rafUpdate = () =>
  requestAnimationFrame(() => {
    updateLogoLeft();
    updateNotch();
  });

let ro: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();

  window.addEventListener('resize', rafUpdate, { passive: true });
  window.addEventListener('orientationchange', rafUpdate, { passive: true });
  window.visualViewport?.addEventListener('resize', rafUpdate, {
    passive: true,
  });

  document.fonts?.ready?.then(rafUpdate).catch(() => {});

  ro = new ResizeObserver(() => rafUpdate());

  const headerEl = headerRef.value;
  const logoEl = getObservedElement(logoRef.value);
  const firstPrimaryLinkEl = getObservedElement(firstPrimaryLinkRef.value);

  if (headerEl) ro.observe(headerEl);
  if (logoEl) ro.observe(logoEl);
  if (primaryBarInnerRef.value) ro.observe(primaryBarInnerRef.value);
  if (firstPrimaryLinkEl) ro.observe(firstPrimaryLinkEl);

  rafUpdate();
});

watch(firstPrimaryLinkRef, async (el) => {
  await nextTick();

  const observedEl = getObservedElement(el);

  if (observedEl && ro) ro.observe(observedEl);

  rafUpdate();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', rafUpdate);
  window.removeEventListener('orientationchange', rafUpdate);
  window.visualViewport?.removeEventListener('resize', rafUpdate);

  ro?.disconnect();
  ro = null;
});
</script>

<style lang="scss" scoped>
.app-header {
  position: relative;
  width: 100%;
  overflow: visible;

  --gutter: 18px;

  --hero-h: 140px;
  --primary-h: 62px;
  --secondary-h: 52px;

  --logo-w: 280px;
  --logo-img-h: 185px;
  --logo-gap: 10px;

  --logo-left: 18px;
  --logo-space-w: 0px;

  /* header 色系 */
  --header-primary: #b43325;
  --header-primary-dark: #3f2412;
  --header-primary-deep: #7f241a;
  --header-primary-soft: #fff8ef;
  --header-gold: #e4aa43;
  --header-cream: #f7e6d1;
  --header-text: #2b170f;
  --header-white: #fff;
}

/* base inner */
.app-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}

/* hero */
.app-header__hero {
  position: relative;
  height: var(--hero-h);
  background:
    linear-gradient(
      180deg,
      rgba(255, 248, 239, 0.94) 0%,
      rgba(247, 230, 209, 0.78) 100%
    ),
    #efe2d3;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(
        circle at 78% 12%,
        rgba(228, 170, 67, 0.22),
        transparent 30%
      ),
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.62) 0%,
        rgba(255, 255, 255, 0.02) 100%
      );
    pointer-events: none;
  }
}

.app-header__heroBg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 620px;
  object-fit: cover;
  object-position: center top;
  pointer-events: none;
  user-select: none;
  opacity: 0.82;
}

.app-header__heroRow {
  position: relative;
  z-index: 2;

  height: var(--hero-h);
  display: flex;
  align-items: end;
  justify-content: flex-end;
  padding: 24px;
}

/* logo */
.app-header__logo {
  position: absolute;
  z-index: 30;
  left: var(--logo-left);
  bottom: 0;

  width: var(--logo-w);
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-start;

  text-decoration: none;
  line-height: 0;
}

.app-header__logoImg {
  display: block;
  width: 100%;
  height: var(--logo-img-h);
  object-fit: contain;
  filter: drop-shadow(0 16px 20px rgba(63, 36, 18, 0.34))
    drop-shadow(0 6px 0 rgba(63, 36, 18, 0.08));
}

/* actions */
.app-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 0.6px;

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.app-header__btn--solid {
  border: 0;
  background: linear-gradient(135deg, var(--header-primary) 0%, #d66b42 100%);
  color: #fff;
  box-shadow: 0 12px 26px rgba(180, 51, 37, 0.24);

  &:hover {
    box-shadow: 0 16px 34px rgba(180, 51, 37, 0.32);
  }
}

.app-header__btn--ghost {
  background: rgba(255, 255, 255, 0.82);
  border: 2px solid rgba(180, 51, 37, 0.72);
  color: var(--header-primary);
  box-shadow: 0 10px 22px rgba(63, 36, 18, 0.08);

  &:hover {
    background: #fff8ef;
    border-color: var(--header-primary);
    color: var(--header-primary-deep);
  }
}

/* bar shared */
.app-header__barInner {
  display: flex;
  align-items: center;
}

.app-header__logoSpace {
  width: var(--logo-space-w);
  flex: 0 0 auto;
}

/* Primary */
.app-header__primary {
  position: relative;
  z-index: 10;
  background: linear-gradient(
    90deg,
    #3f2412 0%,
    var(--header-primary) 42%,
    #d66b42 100%
  );
  box-shadow: 0 10px 24px rgba(63, 36, 18, 0.18);
}

.app-header__primary .app-header__barInner {
  min-height: var(--primary-h);
}

.app-header__primary-list {
  display: flex;
  align-items: center;
  gap: 42px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-header__primary-link {
  position: relative;
  color: #fffaf4;
  text-decoration: none;
  font-weight: 950;
  letter-spacing: 1px;
  padding: 10px 0;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(63, 36, 18, 0.2);

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 2px;
    width: 0;
    height: 3px;
    border-radius: 999px;
    background: var(--header-gold);
    transform: translateX(-50%);
    transition: width 0.16s ease;
  }
}

.app-header__primary-link:hover {
  color: #fff;
  text-decoration: none;

  &::after {
    width: 100%;
  }
}

/* Secondary */
.app-header__secondary {
  position: relative;
  z-index: 12;
  background: linear-gradient(90deg, #fff3e2 0%, #f4d8b7 50%, #e8bd8a 100%);
  border-bottom: 1px solid rgba(63, 36, 18, 0.12);
  box-shadow: 0 6px 18px rgba(63, 36, 18, 0.08);
}

.app-header__secondary .app-header__barInner {
  min-height: var(--secondary-h);
}

.app-header__secondary-list {
  display: flex;
  align-items: center;
  gap: 34px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-header__secondary-link {
  position: relative;
  color: var(--header-text);
  text-decoration: none;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 10px 0;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 2px;
    width: 0;
    height: 3px;
    border-radius: 999px;
    background: var(--header-primary);
    transform: translateX(-50%);
    transition: width 0.16s ease;
  }
}

.app-header__secondary-item.is-active .app-header__secondary-link,
.app-header__secondary-link:hover {
  color: var(--header-primary-deep);
  text-decoration: none;

  &::after {
    width: 100%;
  }
}

.app-header__caret {
  margin-left: 6px;
  font-size: 12px;
  opacity: 0.9;
}

/* notch */
.app-header__notch {
  position: absolute;
  bottom: -8px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 9px solid #f4d8b7;
}

/* Mega */
.mega {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--hero-h) + var(--primary-h) + var(--secondary-h));
  z-index: 50;
  padding-top: 12px;
}

.mega__inner {
  overflow: hidden;
  border-radius: 16px;
  background:
    radial-gradient(
      circle at 95% 0%,
      rgba(228, 170, 67, 0.18),
      transparent 34%
    ),
    linear-gradient(145deg, #2a160f 0%, #3f2412 48%, #1f120c 100%);
  box-shadow: 0 18px 46px rgba(63, 36, 18, 0.32);
  border: 1px solid rgba(255, 248, 239, 0.12);
}

.mega__title {
  padding: 14px 18px;
  background: rgba(255, 248, 239, 0.06);
  border-bottom: 1px solid rgba(255, 248, 239, 0.1);
}

.mega__title-text {
  color: var(--header-gold);
  font-weight: 950;
  letter-spacing: 2px;
}

.mega__grid {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mega__section-title {
  margin: 0 0 10px 0;
  font-weight: 950;
  color: var(--header-gold);
  letter-spacing: 2px;
}

.mega__section-cols {
  display: grid;
  gap: 10px 24px;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.mega__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mega__item + .mega__item {
  margin-top: 10px;
}

.mega__link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: rgba(255, 248, 239, 0.86);
  font-weight: 750;
  font-size: 13px;
}

.mega__link:hover {
  color: #fff;
  text-decoration: underline;
}

.mega__hot {
  font-size: 11px;
  font-weight: 950;
  color: var(--header-gold);
  letter-spacing: 1px;
}

/* transition */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* RWD */
@media (max-width: 900px) {
  .app-header {
    --gutter: 12px;
    --logo-w: 240px;
    --logo-img-h: 150px;
    --logo-gap: 8px;
  }

  .app-header__primary-list {
    gap: 22px;
  }

  .app-header__secondary-list {
    gap: 18px;
  }

  .mega__section-cols {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .app-header {
    --hero-h: 92px;
    --primary-h: 0px;
    --secondary-h: 0px;

    --logo-w: 150px;
    --logo-img-h: 72px;
    --gutter: 12px;
  }

  .app-header__actions {
    display: none;
  }

  .app-header__primary,
  .app-header__secondary {
    display: none;
  }

  .app-header__logo {
    top: 10px;
    bottom: auto;
    left: 12px;
  }

  .app-header__heroBg {
    height: 220px;
    opacity: 0.78;
  }

  .app-header__heroRow {
    padding: 12px;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
