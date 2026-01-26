<!-- src/components/common/IchibanResultCardDialog.vue -->
<template>
  <div class="draw-container" ref="containerRef">
    <!-- 背景粒子 -->
    <div class="bg-particles">
      <span
        v-for="(_, i) in particleCount"
        :key="i"
        class="bg-particles__item"
        :ref="el => (particleRefs[i] = el as HTMLElement)"
      />
    </div>

    <!-- ✅ 置中舞台 -->
    <div class="draw-stage">
      <!-- 中央爆光 -->
      <div class="flash" ref="flashRef"></div>

      <!-- 卡片區 -->
      <div class="card-grid" ref="gridRef">
        <div
          v-for="(c, i) in cards"
          :key="c.id"
          class="card"
          :class="[`card--${c.type}`]"
          :ref="el => (cardRefs[i] = el as HTMLElement)"
        >
          <div
            class="card-inner"
            :ref="el => (innerRefs[i] = el as HTMLElement)"
          >
            <div class="card-back">
              <img :src="weblogo" alt="logo" class="card-back__logo" />
            </div>

            <div class="card-front">
              <div class="card-front__shine" aria-hidden="true"></div>

              <div class="card-front__image-wrapper">
                <img :src="c.image" :alt="c.name" class="card-front__image" />
              </div>

              <div class="card-front__info">
                <p class="card-front__tag">{{ c.tag }}</p>
                <p class="card-front__name">{{ c.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- <p style="position:fixed; top:10px; left:10px; z-index:99999; color:#fff;">
        rows: {{ rowCount }} / perRow: {{ perRow }}
      </p> -->
    </div>

    <!-- 底部操作 -->
    <div class="actions" ref="actionsRef">
      <button class="btn btn--primary" @click="confirm">再抽一次</button>
      <button class="btn btn--ghost" @click="cancel">關閉</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import weblogo from '@/assets/image/weblogo.png';
import {
  ref,
  nextTick,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
} from 'vue';
import { gsap } from 'gsap';

/* ===== props ===== */
interface DialogItem {
  id: string;
  name: string;
  image: string;
  grade?: any;
}

const props = defineProps<{
  remain: number;
  count: number;
  totalPrice: number;
  items: DialogItem[];
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

/* ===== 卡片顯示結構 ===== */
interface PrizeCard {
  id: string | number;
  type: 'big' | 'small';
  tag: string;
  name: string;
  image: string;
}

const cards = computed<PrizeCard[]>(() =>
  props.items.map((item, index) => ({
    id: item.id ?? index,
    type: item.grade === 'A' ? 'big' : 'small',
    tag: `${item.grade}賞`,
    name: item.name,
    image: item.image,
  }))
);

/* ===== refs ===== */
const cardRefs = ref<HTMLElement[]>([]);
const innerRefs = ref<HTMLElement[]>([]);
const particleRefs = ref<HTMLElement[]>([]);
const flashRef = ref<HTMLElement | null>(null);

const particleCount = 35;

/* ✅ scroll container / grid ref */
const containerRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);

/* ✅ actions ref：算 bottomPad 用（固定底部按鈕高度） */
const actionsRef = ref<HTMLElement | null>(null);

/* ✅ 可選：排數 / 每排張數 */
const rowCount = ref(0);
const perRow = ref(0);

async function calcRows() {
  await nextTick();

  const grid = gridRef.value;
  const els = cardRefs.value.filter(Boolean);
  if (!grid || els.length === 0) {
    rowCount.value = 0;
    perRow.value = 0;
    return;
  }

  const gridTop = grid.getBoundingClientRect().top;
  const tops = els.map((el) =>
    Math.round(el.getBoundingClientRect().top - gridTop)
  );

  const uniq = Array.from(new Set(tops)).sort((a, b) => a - b);
  rowCount.value = uniq.length;

  const firstTop = uniq[0];
  perRow.value = tops.filter((t) => t === firstTop).length;
}

/* =========================
   ✅ Row mapping（關鍵修正）
   - 用 offsetTop 建 row，不受 scrollTop 影響
========================= */
const rowTops = ref<number[]>([]);
const rowIndexMap = new Map<HTMLElement, number>();

function buildRowIndexMap() {
  const grid = gridRef.value;
  const els = cardRefs.value.filter(Boolean);
  if (!grid || els.length === 0) {
    rowTops.value = [];
    rowIndexMap.clear();
    return;
  }

  const tops = els.map((el) => Math.round(el.offsetTop));
  rowTops.value = Array.from(new Set(tops)).sort((a, b) => a - b);

  rowIndexMap.clear();
  els.forEach((el) => {
    const top = Math.round(el.offsetTop);
    let idx = rowTops.value.indexOf(top);

    if (idx < 0) {
      let best = 0;
      for (let j = 1; j < rowTops.value.length; j++) {
        if (
          Math.abs(rowTops.value[j] - top) < Math.abs(rowTops.value[best] - top)
        )
          best = j;
      }
      idx = best;
    }

    rowIndexMap.set(el, idx);
  });
}

/* ✅ 取得視窗上/下安全 padding（避免被 actions 蓋住） */
function getViewportPads() {
  const topPad = 16;
  const actionsH = actionsRef.value?.getBoundingClientRect().height ?? 92;
  const bottomPad = actionsH + 18;
  return { topPad, bottomPad };
}

function isFullyVisible(
  elRect: DOMRect,
  scRect: DOMRect,
  topPad: number,
  bottomPad: number
) {
  const epsilon = 2; // 避免 1px 抖動
  return (
    elRect.top >= scRect.top + topPad - epsilon &&
    elRect.bottom <= scRect.bottom - bottomPad + epsilon
  );
}

/* ✅ 讓某張卡在可視範圍內（看得到就不要捲） */
function ensureVisible(el: HTMLElement) {
  const scroller = containerRef.value;
  if (!scroller) return;

  const scRect = scroller.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const { topPad, bottomPad } = getViewportPads();

  // ✅ 已經看得到：不捲
  if (isFullyVisible(elRect, scRect, topPad, bottomPad)) return;

  const visibleTop = scRect.top + topPad;
  const visibleBottom = scRect.bottom - bottomPad;

  let delta = 0;

  if (elRect.bottom > visibleBottom) {
    delta = elRect.bottom - visibleBottom + 12;
  } else if (elRect.top < visibleTop) {
    delta = elRect.top - visibleTop - 12;
  } else {
    return;
  }

  const target = Math.max(0, scroller.scrollTop + delta);

  gsap.to(scroller, {
    scrollTop: target,
    duration: 0.35,
    ease: 'power2.out',
    overwrite: 'auto',
  });
}

/* ✅ 只在「那一列不完整可見」時才捲動 */
function scrollToRow(rowIndex: number) {
  const scroller = containerRef.value;
  const grid = gridRef.value;
  if (!scroller || !grid || rowTops.value.length === 0) return;

  const safeRow = Math.max(0, Math.min(rowIndex, rowTops.value.length - 1));
  const rowTop = rowTops.value[safeRow];

  // rowBottom：用下一列 top 當底，最後一列用 grid.scrollHeight
  const nextTop = rowTops.value[safeRow + 1];
  const rowBottom = nextTop != null ? nextTop : grid.scrollHeight;

  const scRect = scroller.getBoundingClientRect();
  const gridRect = grid.getBoundingClientRect();
  const { topPad, bottomPad } = getViewportPads();

  // rowTop/Bottom（grid內座標） -> scroller viewport 內的 Y
  const rowTopV = gridRect.top - scRect.top + rowTop;
  const rowBottomV = gridRect.top - scRect.top + rowBottom;

  const viewportH = scRect.bottom - scRect.top;
  const visibleTop = topPad;
  const visibleBottom = viewportH - bottomPad;

  const epsilon = 2;
  // ✅ 這列完整可見：不捲
  if (rowTopV >= visibleTop - epsilon && rowBottomV <= visibleBottom + epsilon)
    return;

  let targetScrollTop = scroller.scrollTop;

  // 只修正需要的方向
  if (rowTopV < visibleTop) {
    targetScrollTop += rowTopV - visibleTop;
  } else if (rowBottomV > visibleBottom) {
    targetScrollTop += rowBottomV - visibleBottom;
  }

  targetScrollTop = Math.max(0, targetScrollTop);

  gsap.to(scroller, {
    scrollTop: targetScrollTop,
    duration: 0.35,
    ease: 'power2.out',
    overwrite: 'auto',
  });
}

function scrollBackToTop(duration = 1.6, delay = 0.35) {
  const scroller = containerRef.value;
  if (!scroller) return;
  if (scroller.scrollTop <= 0) return;

  gsap.to(scroller, {
    scrollTop: 0,
    duration,
    delay,
    ease: 'power2.out',
    overwrite: 'auto',
  });
}

/* ✅ resize / observer（修正 removeEventListener bug） */
let ro: ResizeObserver | null = null;
let onResize: (() => void) | null = null;

function syncLayoutMetrics() {
  calcRows();
  buildRowIndexMap();
}

watch(
  () => cards.value.length,
  async () => {
    await nextTick();
    cardRefs.value = cardRefs.value.filter(Boolean);
    innerRefs.value = innerRefs.value.filter(Boolean);
    syncLayoutMetrics();
  }
);

/* =========================
   lifecycle（動畫只做一次）
========================= */
onMounted(async () => {
  await nextTick();

  // refs 清一下洞
  cardRefs.value = cardRefs.value.filter(Boolean);
  innerRefs.value = innerRefs.value.filter(Boolean);
  particleRefs.value = particleRefs.value.filter(Boolean);

  syncLayoutMetrics();

  // 監測 grid 尺寸變化
  ro = new ResizeObserver(() => {
    nextTick().then(() => syncLayoutMetrics());
  });
  if (gridRef.value) ro.observe(gridRef.value);

  onResize = () => syncLayoutMetrics();
  window.addEventListener('resize', onResize);

  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const totalFlightTime = (cardRefs.value.length - 1) * 0.15 + 0.8;

  /* 粒子動畫 */
  particleRefs.value.forEach((el) => {
    const size = gsap.utils.random(4, 10);
    const startX = gsap.utils.random(-winW / 2, winW / 2);
    const startY = gsap.utils.random(-winH / 2, winH / 2);
    const floatY = startY - gsap.utils.random(40, 140);

    gsap.set(el, {
      width: size,
      height: size,
      x: startX,
      y: startY,
      opacity: gsap.utils.random(0.2, 0.9),
      scale: gsap.utils.random(0.6, 1.3),
    });

    gsap.to(el, {
      y: floatY,
      opacity: 0,
      duration: gsap.utils.random(3, 6),
      repeat: -1,
      ease: 'sine.out',
      delay: gsap.utils.random(0, 4),
    });

    gsap.to(el, {
      scale: '+=0.4',
      duration: gsap.utils.random(1.4, 2.2),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  /* 初始卡片狀態 */
  gsap.set(cardRefs.value, {
    opacity: 0,
    x: -winW - 500,
    rotationZ: -40,
    rotationY: -160,
    scale: 0.7,
    force3D: true,
  });

  gsap.set(innerRefs.value, {
    rotationY: 180,
    force3D: true,
  });

  const tl = gsap.timeline({
    // onComplete: () => scrollBackToTop(1.8, 0.4),
  });

  // 飛進來（✅ 看得到才捲）
  cardRefs.value.forEach((el, index) => {
    tl.to(
      el,
      {
        opacity: 1,
        x: 0,
        rotationZ: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        onStart: () => ensureVisible(el),
      },
      index * 0.15
    );
  });
  const scroller = containerRef.value;

  // ✅ 只有「真的有往下捲」才需要捲回頂部
  const needScrollTop = !!scroller && scroller.scrollTop > 2;

  // ✅ 捲動時間改成短 + 依距離縮放（避免固定等 2 秒）
  // 你也可以把 0.55 / 0.75 調成你想要的節奏
  const scrollTime = needScrollTop
    ? Math.min(0.75, Math.max(0.25, scroller!.scrollTop / 1400))
    : 0;

  if (needScrollTop) {
    tl.to(
      scroller!,
      {
        scrollTop: 0,
        duration: scrollTime,
        ease: 'power2.out',
      },
      totalFlightTime
    );
  }

  // ✅ 翻牌前再建一次 row map（確保 offsetTop 穩）
  tl.add(() => buildRowIndexMap(), totalFlightTime + scrollTime + 0.01);

  // 翻牌（✅ 修正：stagger.onStart 參數是 (index, target)）
  const flipTargets = innerRefs.value.filter((el): el is HTMLElement => !!el);

  // 再保險建一次
  buildRowIndexMap();

  let lastRow = -1;

  tl.to(
    flipTargets,
    {
      rotationY: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: {
        each: 0.15,
        onStart: function (index: number, target?: Element) {
          const t = (target ?? (this as any).targets?.()[0]) as
            | HTMLElement
            | undefined;
          if (!t) return;

          const cardEl = t.closest('.card') as HTMLElement | null;
          if (!cardEl) return;

          const row = rowIndexMap.get(cardEl) ?? 0;

          if (row !== lastRow) {
            lastRow = row;
            // ✅ 這列看得到就不捲
            scrollToRow(row);
            // console.log('[flip] index:', index, 'row:', row + 1);
          }
        },
      },
    },
    totalFlightTime + scrollTime
  );
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;

  if (onResize) window.removeEventListener('resize', onResize);
  onResize = null;

  gsap.killTweensOf(containerRef.value);
  gsap.killTweensOf(cardRefs.value);
  gsap.killTweensOf(innerRefs.value);
  gsap.killTweensOf(particleRefs.value);
});

/* ===== actions ===== */
function confirm() {
  emit('confirm');
}
function cancel() {
  emit('cancel');
}
</script>

<style scoped lang="scss">
/* =========================
   Brand palette (B43325)
========================= */
$brand: #b43325;
$brand-hover: #a12f22;
$brand-press: #7f2419;
$brand-soft: #f6e7d5;

$brand-glow: rgba($brand, 0.35);
$brand-ring: rgba($brand, 0.28);

$brand-accent: #d24a3a;
$brand-muted: rgba($brand, 0.55);

/* =========================
   Card back palette (Brand)
========================= */
$back-0: #3a0f0b;
$back-1: #6b1b13;
$back-2: #b43325;
$back-3: #d24a3a;
$back-4: #f6e7d5;

$back-border: rgba(255, 235, 220, 0.6);
$back-glow: rgba($brand, 0.55);

.draw-container {
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  min-height: 100vh;

  overflow-y: auto;
  overflow-x: hidden;

  padding: 24px 24px calc(110px + env(safe-area-inset-bottom));
  box-sizing: border-box;

  -webkit-overflow-scrolling: touch;

  @media (max-width: 420px) {
    padding: 16px 16px calc(100px + env(safe-area-inset-bottom));
  }
}

.draw-stage {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 背景粒子層 */
.bg-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  &__item {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 999px;
    background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0) 70%);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.9),
      0 0 20px rgba(255, 220, 150, 0.8);
    opacity: 0;
  }
}

/* 中央爆光 */
.flash {
  position: absolute;
  z-index: 2;
  width: 720px;
  height: 720px;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  pointer-events: none;

  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.65) 0%,
    rgba(255, 255, 255, 0.22) 22%,
    rgba(255, 255, 255, 0) 70%
  );

  transform: translate(-50%, -50%) scale(0.55);
  opacity: 0;
  filter: blur(1.2px);
  mix-blend-mode: screen;

  animation: flashPop 0.5s ease-out both;
}

/* 卡片區 */
.card-grid {
  width: 100%;
  margin: auto 0;
  position: relative;
  z-index: 3;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(12px, 3vw, 24px);
}

/* 按鈕固定底部 */
.actions {
  position: fixed;
  z-index: 4;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(18px + env(safe-area-inset-bottom));
  display: flex;
  gap: 10px;
}

/* 基本卡片尺寸 */
.card {
  width: 160px;
  height: 200px;
  transform-style: preserve-3d;

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
  }

  .card-back,
  .card-front {
    font-size: 28px;
    border-radius: 14px;

    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;

    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 900;

    transform: translateZ(0.1px);
  }

  /* 卡背 */
  .card-back {
    transform: rotateY(180deg);

    background: radial-gradient(
        circle at 18% 10%,
        rgba($back-4, 0.55),
        rgba($back-4, 0) 55%
      ),
      radial-gradient(
        circle at 80% 35%,
        rgba(255, 255, 255, 0.18),
        rgba(255, 255, 255, 0) 58%
      ),
      linear-gradient(
        135deg,
        $back-0 0%,
        $back-1 16%,
        $back-2 40%,
        $back-3 58%,
        $back-2 72%,
        $back-1 88%,
        $back-0 100%
      );

    border: clamp(2px, 0.5vw, 4px) solid $back-border;
    border-radius: 14px;

    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.22),
      inset 0 0 26px rgba($brand, 0.55), inset 0 -10px 22px rgba(0, 0, 0, 0.28),
      0 0 14px $back-glow, 0 10px 22px rgba(0, 0, 0, 0.35);

    color: rgba(255, 245, 235, 0.92);
    letter-spacing: 2px;
    z-index: 1;

    filter: saturate(1.08) contrast(1.05);

    &__logo {
      display: block;
      width: 96px;
      height: 96px;
      object-fit: contain;

      opacity: 0.7;
      mix-blend-mode: screen;
      transform: translateZ(0.2px);

      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      pointer-events: none;

      filter: brightness(1.15) contrast(1.05)
        drop-shadow(0 0 12px rgba(255, 255, 255, 0.22));
    }
  }

  /* 正面 base */
  .card-front {
    transform: rotateY(0deg);
    background: #ffffff;
    color: #333;
    border: 2px solid #ddd;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2), 0 0 14px rgba(255, 230, 150, 0.5);
    z-index: 2;

    flex-direction: column;
    justify-content: flex-start;
    padding: 10px 8px;
    text-align: center;
    position: relative;
    overflow: hidden;

    &__image-wrapper,
    &__info {
      position: relative;
      z-index: 2;
    }

    &__shine {
      position: absolute;
      inset: -35%;
      z-index: 1;
      pointer-events: none;

      background: linear-gradient(
          120deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.08) 38%,
          rgba(255, 255, 255, 0.55) 50%,
          rgba(255, 255, 255, 0.1) 62%,
          rgba(255, 255, 255, 0) 100%
        ),
        radial-gradient(
          circle at 30% 20%,
          rgba(255, 255, 255, 0.22),
          rgba(255, 255, 255, 0) 55%
        );

      transform: translateX(-65%) rotate(20deg);
      opacity: 0;
      filter: blur(0.6px);
      mix-blend-mode: screen;
    }

    &__image-wrapper {
      width: 100%;
      height: 70%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    &__info {
      margin-top: 6px;
    }

    &__tag {
      font-size: 12px;
      letter-spacing: 0.15em;
      margin-bottom: 2px;
      color: $brand-accent;
    }

    &__name {
      font-size: 10px;
      font-weight: 700;
      line-height: 1.3;
      color: #333;
    }
  }

  /* 大賞 */
  &--big {
    .card-front {
      background: radial-gradient(
        circle at 20% 0%,
        #fff9dc 0%,
        #ffe6a7 40%,
        #ffd66b 70%,
        #f9c543 100%
      );
      border-color: #f2c94c;
      box-shadow: 0 0 18px rgba(255, 215, 0, 0.8),
        0 12px 26px rgba(0, 0, 0, 0.35);

      &__shine {
        opacity: 0.85;
        animation: shineSweep 2.6s ease-in-out infinite;
      }

      &__tag {
        color: $brand;
      }
    }
  }

  /* 小賞 */
  &--small {
    .card-front {
      background: #ffffff;
      border-color: #d7d7d7;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);

      &__shine {
        opacity: 0.25;
        animation: shineSweep 4.2s ease-in-out infinite;
      }

      &__tag {
        color: $brand-muted;
      }
    }
  }
}

@keyframes shineSweep {
  0% {
    transform: translateX(-75%) rotate(20deg);
    opacity: 0;
  }
  18% {
    opacity: 0.55;
  }
  45% {
    opacity: 0.95;
  }
  100% {
    transform: translateX(75%) rotate(20deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-front__shine {
    animation: none !important;
    opacity: 0.18;
    transform: rotate(20deg);
  }
}

@keyframes flashPop {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.7;
  }
}

/* =========================
   Actions - Brand
========================= */
.btn {
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.12s ease, background-color 0.2s ease,
    box-shadow 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 4px $brand-ring;
  }

  &--primary {
    background: $brand;
    color: #fff;
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18), 0 0 14px $brand-glow;

    &:hover {
      background: $brand-hover;
    }
    &:active {
      background: $brand-press;
    }
  }

  &--ghost {
    background: $brand-soft;
    color: $brand;
    border: 2px solid $brand;
    box-shadow: 0 8px 14px rgba(0, 0, 0, 0.12);

    &:hover {
      background: rgba($brand-soft, 0.92);
      box-shadow: 0 10px 18px rgba(0, 0, 0, 0.16), 0 0 0 3px $brand-ring;
    }
    &:active {
      background: rgba($brand-soft, 0.86);
    }
  }
}
</style>
