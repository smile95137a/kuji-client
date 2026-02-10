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
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import { useRouter, useRoute, type RouteLocationRaw } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

import weblogo from '@/assets/image/weblogo.png';
import headerBg from '@/assets/image/header_bg.jpg';

type MenuItem = { key: string; label: string; mega?: boolean };

const primaryMenu: MenuItem[] = [
  { key: 'kuji', label: '官方一番賞' },
  { key: 'gacha', label: '扭蛋' },
  { key: 'custom', label: '自製一番賞' },
  { key: 'card', label: '卡牌' },
];

const secondaryMenu: MenuItem[] = [
  { key: 'theme', label: '主題', mega: true },
  { key: 'brand', label: '品牌', mega: true },
  { key: 'model', label: '模型', mega: true },
  { key: 'kuji2', label: '一番賞' },
  { key: 'gacha2', label: '扭蛋' },
  { key: 'figure', label: '可動人偶' },
  { key: 'pvc', label: '美少PVC' },
];

/** ===== Auth / Router ===== */
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLogin = computed(() => !!authStore.token);

const goLogin = () => {
  router.push({
    name: 'Login',
    query: { redirect: route.fullPath },
  });
};

const goRegister = () => {
  router.push({
    name: 'Register',
    query: { redirect: route.fullPath },
  });
};

const goMemberCenter = () => {
  router.push({ name: 'MemberCenter' });
};

const handleLogout = async () => {
  if (typeof authStore.logout === 'function') {
    await authStore.logout();
  } else {
    authStore.token = '';
  }
  router.push({ name: 'Home' });
};

/** ===== Mega open / close ===== */
const activeMega = ref<string>('');
const openMega = (key: string) => (activeMega.value = key);
const closeMega = () => (activeMega.value = '');

/** =========================================
 * ✅ RouterLink mapping（對齊你現有的 routes）
 * ========================================= */
/**
 * 你目前 router 真的有的：
 * - Home
 * - IchibanList / IchibanDetail
 * - Ranking
 * - News / NewsDetail
 * - About / Faq / Promotion / Terms / Privacy / Policy / Cooperation / Transaction
 * - MemberCenter...
 *
 * 所以：
 * - Primary / Secondary / Mega 我先全部導到 IchibanList
 * - 用 query 帶分類條件（你之後 IchibanList 再接 query 做 filter 即可）
 */
const primaryTo = (item: MenuItem): RouteLocationRaw => {
  // ✅ 主選單全部先導到 IchibanList，用 query 區分分類
  const map: Record<string, RouteLocationRaw> = {
    kuji: { name: 'IchibanList', query: { type: 'kuji' } },
    gacha: { name: 'IchibanList', query: { type: 'gacha' } },
    custom: { name: 'IchibanList', query: { type: 'custom' } },
    card: { name: 'IchibanList', query: { type: 'card' } },
  };
  return map[item.key] ?? { name: 'IchibanList' };
};

const secondaryTo = (item: MenuItem): RouteLocationRaw => {
  // ✅ mega 類別：導去 IchibanList 並帶 tab（讓你在列表頁可以知道用哪種篩選）
  if (item.mega) {
    return { name: 'IchibanList', query: { tab: item.key } };
  }

  // ✅ 非 mega 的：一樣導到 IchibanList，用 type 區分
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
  // ✅ mega 子項目：依 activeMega 帶不同 query key
  // theme → theme=xxx
  // brand → brand=xxx
  // model → model=xxx
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
const logoRef = ref<HTMLElement | null>(null);
const primaryBarInnerRef = ref<HTMLElement | null>(null);
const firstPrimaryLinkRef = ref<HTMLElement | null>(null);

const setPrimaryLinkRef = (idx: number) => (el: HTMLElement | null) => {
  if (idx !== 0) return;
  firstPrimaryLinkRef.value = el;
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
  const logoEl = logoRef.value;
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
  
  // 安全地觀察元素 - 確保是實際的 DOM 元素
  if (headerRef.value instanceof Element) ro.observe(headerRef.value);
  if (logoRef.value instanceof Element) ro.observe(logoRef.value);
  if (primaryBarInnerRef.value instanceof Element) ro.observe(primaryBarInnerRef.value);
  if (firstPrimaryLinkRef.value instanceof Element) ro.observe(firstPrimaryLinkRef.value);

  rafUpdate();
});

watch(firstPrimaryLinkRef, async (el) => {
  await nextTick();
  if (el instanceof Element && ro) {
    try {
      ro.observe(el);
    } catch (e) {
      console.warn('ResizeObserver - failed to observe element:', e);
    }
  }
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
/* ✅ 你的 style 原封不動貼過來即可（不用改） */
.app-header {
  position: relative;
  width: 100%;
  overflow: visible;

  --gutter: 18px;

  --hero-h: 92px;
  --primary-h: 62px;
  --secondary-h: 52px;

  --logo-w: 280px;
  --logo-img-h: 185px;
  --logo-gap: 10px;

  --logo-left: 18px;
  --logo-space-w: 0px;
}

/* base inner（共用） */
.app-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}

/* hero */
.app-header__hero {
  position: relative;
  height: var(--hero-h);
  background-color: #efe2d3;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.65) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
  }
}

.app-header__heroBg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  pointer-events: none;
  user-select: none;
}

.app-header__heroRow {
  position: relative;
  z-index: 2;

  height: var(--hero-h);
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  filter: drop-shadow(0 14px 18px rgba(0, 0, 0, 0.3))
    drop-shadow(0 6px 0 rgba(0, 0, 0, 0.08));
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
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.app-header__btn--solid {
  border: 0;
  background: #b43325;
  color: #fff;
}

.app-header__btn--ghost {
  background: transparent;
  border: 2px solid #b43325;
  color: #b43325;
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
  background: #b43325;
  position: relative;
  z-index: 10;
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
  color: #fff;
  text-decoration: none;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 10px 0;
  white-space: nowrap;
}

.app-header__primary-link:hover {
  opacity: 0.9;
  text-decoration: underline;
}

/* Secondary */
.app-header__secondary {
  position: relative;
  background: #e0bc94;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 12;
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
  color: #1b1b1b;
  text-decoration: none;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 10px 0;
  white-space: nowrap;
}

.app-header__secondary-item.is-active .app-header__secondary-link,
.app-header__secondary-link:hover {
  color: #000;
  text-decoration: underline;
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
  border-top: 9px solid #e0bc94;
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
  background: #1b1b1b;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mega__title {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mega__title-text {
  color: #eb9838;
  font-weight: 900;
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
  font-weight: 900;
  color: #eb9838;
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
  color: rgba(255, 255, 255, 0.88);
  font-weight: 700;
  font-size: 13px;
}

.mega__link:hover {
  color: #fff;
  text-decoration: underline;
}

.mega__hot {
  font-size: 11px;
  font-weight: 900;
  color: #eb9838;
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
    --gutter: 12px;
    --logo-w: 210px;
    --logo-img-h: 120px;
    --logo-gap: 6px;
  }

  .app-header__primary-list,
  .app-header__secondary-list {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-right: 10px;
  }

  .mega__section-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
