<!-- src/components/ScratchCard.vue -->
<template>
  <div class="scratch-card" :style="{ '--scratch-card-size': size + 'px' }">
    <div class="scratch-card__inner">
      <!-- 刮刮樂遮罩區 -->
      <div
        ref="coverContainerRef"
        class="scratch-card-cover-container"
        :class="{ clear: isCoverCleared, hidden: isCoverHidden }"
        @transitionend="onCoverTransitionEnd"
      >
        <!-- 真正用來畫黑色刮除軌跡的 canvas -->
        <canvas
          ref="canvasRef"
          class="scratch-card-canvas"
          :class="{ hidden: isSafariBrowser }"
        ></canvas>

        <!-- Safari / iOS 專用的渲染圖 -->
        <img
          ref="canvasRenderRef"
          class="scratch-card-canvas-render"
          :class="{ hidden: !isCanvasRenderVisible }"
          alt=""
        />

        <!-- 上層銀色刮刮樂皮（依照 grade 換色） -->
        <div
          class="scratch-card-cover"
          :class="[{ shine: isShining }, gradeClass]"
        >
          <svg
            class="scratch-card-cover-background"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 320"
          >
            <!-- 這邊就是你原本的 SVG 背景，完全保留 -->
            <path
              d="M72.417 85.633a2 2 0 1 0-3.42-2.075l-3.113 5.129a2 2 0 1 0 3.42 2.075l3.113-5.129zm-8.301 13.679a2 2 0 1 0-3.42-2.075l-3.113 5.129a2 2 0 0 0 3.42 2.075l3.113-5.129zm11.997 1.432a2 2 0 0 1-2.747.672l-5.129-3.113a2 2 0 1 1 2.075-3.42l5.129 3.113a2 2 0 0 1 .672 2.748zm-16.425-7.629a2 2 0 1 0 2.075-3.42l-5.129-3.113a2 2 0 1 0-2.075 3.42l5.129 3.113z"
            />
            <path
              fill-rule="evenodd"
              d="M262.093 121.254a2 2 0 1 0-3.873-1.001l-1.502 5.809a2 2 0 1 0 3.873 1.001l1.502-5.809zm-4.004 15.491a2 2 0 1 0-3.873-1.001l-1.502 5.809a2 2 0 1 0 3.873 1.001l1.502-5.809zm11.9-2.088a2 2 0 0 1-2.437 1.436l-5.809-1.502a2 2 0 1 1 1.001-3.873l5.809 1.502a2 2 0 0 1 1.436 2.437zm-17.927-2.569a2 2 0 0 0 2.437-1.436 2 2 0 0 0-1.436-2.436l-5.809-1.502a2 2 0 0 0-2.437 1.435 2 2 0 0 0 1.436 2.437l5.809 1.502z"
            />
            <path
              d="M196.858 235.528a2 2 0 0 0-2.437-1.435 2 2 0 0 0-1.435 2.437l1.504 5.809a2 2 0 1 0 3.872-1.003l-1.504-5.808zm4.01 15.489a2 2 0 0 0-2.437-1.435 2 2 0 0 0-1.435 2.437l1.504 5.809a2 2 0 1 0 3.872-1.003l-1.504-5.808zm9.396-7.597a2 2 0 0 1-1.435 2.437l-5.809 1.504a2 2 0 1 1-1.002-3.873l5.808-1.503a2 2 0 0 1 2.438 1.435zm-16.924 6.447a2 2 0 1 0-1.003-3.873l-5.808 1.504a2 2 0 1 0 1.002 3.873l5.809-1.504zm-129.604 20.16a2 2 0 1 0 3.032-2.609l-3.913-4.548a2 2 0 1 0-3.032 2.609l3.913 4.548zm14.42-3.173a2 2 0 0 0-2.609-3.032l-4.548 3.914a2 2 0 0 0 2.609 3.032l4.548-3.914zM66.027 277.29a2 2 0 1 0-2.609-3.032l-4.548 3.913a2 2 0 1 0 2.609 3.032l4.548-3.913zm10.965 5.077a2 2 0 0 1-2.82-.212l-3.913-4.548a2 2 0 0 1 3.032-2.609l3.913 4.548a2 2 0 0 1-.212 2.821z"
            />
            <!-- 後面這大段 path / defs 直接沿用你的原始 SVG（省略） -->
            <!-- ... -->
          </svg>
        </div>
      </div>

      <!-- 真正的獎品圖片 -->
      <img
        ref="prizeImageRef"
        class="scratch-card-image"
        :class="{ animate: isRevealed }"
        :src="imageSrc || demo1Img"
        :alt="imageAlt"
        draggable="false"
      />
    </div>

    <!-- 下方提示／結果文字 -->
    <p ref="textRef" class="scratch-card-text">
      {{ message }}
    </p>

    <!-- 濾鏡定義（跟原本一樣，只是收進元件裡） -->
    <svg width="0" height="0" class="scratch-card-filters">
      <filter id="remove-black" color-interpolation-filters="sRGB">
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  -1 -1 -1 0 1"
          result="black-pixels"
        />
        <feComposite in="SourceGraphic" in2="black-pixels" operator="out" />
      </filter>
      <filter id="noise">
        <feTurbulence baseFrequency="0.5"></feTurbulence>
      </filter>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import confetti from 'canvas-confetti';
import demo1Img from '@/assets/image/demo1.jpg';

const MULTI_CONFETTI_COLORS = [
  '#fffbeb',
  '#fef3c7',
  '#fde68a',

  '#facc15',
  '#eab308',
  '#fbbf24',
  '#f59e0b',

  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316',
  '#ea580c',

  '#c2410c',
  '#9a3412',
  '#78350f',

  '#f5f5dc',
  '#fef9c3',
  '#fefce8',

  '#d4af37',
  '#b8860b',
  '#a16207',
  '#854d0e',
];

const props = withDefaults(
  defineProps<{
    imageSrc?: string;
    imageAlt?: string;
    size?: number;
    idleText?: string;
    revealText?: string;
    threshold?: number;
    /** A / B / C / Last / 其他 */
    grade?: string;
  }>(),
  {
    imageAlt: 'Scratch card prize',
    size: 320,
    idleText: '🎁 Scratch for a surprise!',
    revealText: '🎉 You got a $50 Apple gift card!',
    threshold: 45,
    grade: '',
  }
);

// 依照 grade 切換 cover 顏色 class
const gradeClass = computed(() => {
  const g = (props.grade || '').toUpperCase();

  if (g === 'A') return 'scratch-card-cover--grade-a';
  if (g === 'B') return 'scratch-card-cover--grade-b';
  if (g === 'C') return 'scratch-card-cover--grade-c';
  if (g === 'LAST') return 'scratch-card-cover--grade-last';

  // 其他（D、E、F...）或沒指定，就用原本銀色
  return 'scratch-card-cover--grade-normal';
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasRenderRef = ref<HTMLImageElement | null>(null);
const coverContainerRef = ref<HTMLDivElement | null>(null);
const prizeImageRef = ref<HTMLImageElement | null>(null);
const textRef = ref<HTMLParagraphElement | null>(null);

const isSafariBrowser = ref(false);
const isCoverCleared = ref(false);
const isCoverHidden = ref(false);
const isCanvasRenderVisible = ref(false);
const isShining = ref(true);
const isRevealed = ref(false);
const message = ref(props.idleText);

let ctx: CanvasRenderingContext2D | null = null;
let canvasWidth = 0;
let canvasHeight = 0;
let positionX = 0;
let positionY = 0;
let clearDetectionTimeout: number | undefined;
let setImageTimeout: number | undefined;
let pointerMoveHandler: ((e: PointerEvent) => void) | null = null;
let previousUrl: string | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvasWidth = Math.floor(rect.width * dpr);
  canvasHeight = Math.floor(rect.height * dpr);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#000';

  isSafariBrowser.value = /^((?!chrome|android).)*safari/i.test(
    navigator.userAgent
  );

  canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
});

onBeforeUnmount(() => {
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (pointerMoveHandler) {
      canvas.removeEventListener('pointermove', pointerMoveHandler);
    }
  }

  if (clearDetectionTimeout !== undefined) {
    window.clearTimeout(clearDetectionTimeout);
  }
  if (setImageTimeout !== undefined) {
    window.clearTimeout(setImageTimeout);
  }
  if (previousUrl) {
    URL.revokeObjectURL(previousUrl);
  }
});

const getPosition = (event: PointerEvent, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const plotLine = (x1: number, y1: number, x2: number, y2: number) => {
  if (!ctx) return;

  const diffX = Math.abs(x2 - x1);
  const diffY = Math.abs(y2 - y1);
  const dist = Math.sqrt(diffX * diffX + diffY * diffY);
  const step = dist / 50;
  let i = 0;

  while (i < dist) {
    const t = Math.min(1, i / dist);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;

    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    i += step;
  }
};

const setImageFromCanvas = () => {
  const canvas = canvasRef.value;
  const img = canvasRenderRef.value;
  if (!canvas || !img) return;

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    previousUrl = url;
    img.src = url;
    isCanvasRenderVisible.value = true;
  });
};

const plot = (e: PointerEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const { x, y } = getPosition(e, canvas);
  plotLine(positionX, positionY, x, y);
  positionX = x;
  positionY = y;

  if (isSafariBrowser.value) {
    if (setImageTimeout !== undefined) {
      window.clearTimeout(setImageTimeout);
    }
    setImageTimeout = window.setTimeout(() => {
      setImageFromCanvas();
    }, 16);
  }
};

const onPointerDown = (e: PointerEvent) => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;

  isShining.value = false;

  const pos = getPosition(e, canvas);
  positionX = pos.x;
  positionY = pos.y;

  if (clearDetectionTimeout !== undefined) {
    window.clearTimeout(clearDetectionTimeout);
  }

  pointerMoveHandler = plot;
  canvas.addEventListener('pointermove', pointerMoveHandler);
  window.addEventListener('pointerup', onPointerUp, { once: true });
};

const onPointerUp = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  if (pointerMoveHandler) {
    canvas.removeEventListener('pointermove', pointerMoveHandler);
    pointerMoveHandler = null;
  }

  clearDetectionTimeout = window.setTimeout(() => {
    checkBlackFillPercentage();
  }, 500);
};

const checkBlackFillPercentage = () => {
  if (!ctx || !canvasRef.value || isRevealed.value) return;

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixelData = imageData.data;

  let blackPixelCount = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    const red = pixelData[i];
    const green = pixelData[i + 1];
    const blue = pixelData[i + 2];
    const alpha = pixelData[i + 3];

    if (red === 0 && green === 0 && blue === 0 && alpha === 255) {
      blackPixelCount++;
    }
  }

  const totalPixels = canvasWidth * canvasHeight;
  const blackFillPercentage = (blackPixelCount * 100) / totalPixels;

  if (blackFillPercentage >= props.threshold) {
    reveal();
  }
};

const fireConfettiBurstTopWide = (originX: number, originY: number) => {
  const base = {
    colors: MULTI_CONFETTI_COLORS,
    zIndex: 10000,
    shapes: ['circle', 'square'],
  };

  // 第一段：上方中心大爆炸
  confetti({
    ...base,
    origin: { x: originX, y: originY - 0.05 },
    particleCount: 260,
    spread: 100,
    startVelocity: 65,
    decay: 0.88,
    ticks: 200,
    gravity: 0.8,
    scalar: 0.9,
  });

  // 第二段：左右同時噴射，拉出橫向長花
  setTimeout(() => {
    confetti({
      ...base,
      origin: { x: originX - 0.25, y: originY - 0.1 },
      particleCount: 160,
      spread: 70,
      angle: 60,
      startVelocity: 55,
      gravity: 1.0,
      scalar: 0.8,
    });
    confetti({
      ...base,
      origin: { x: originX + 0.25, y: originY - 0.1 },
      particleCount: 160,
      spread: 70,
      angle: 120,
      startVelocity: 55,
      gravity: 1.0,
      scalar: 0.8,
    });
  }, 180);

  // 第三段：上方再補一層細粒子
  setTimeout(() => {
    confetti({
      ...base,
      origin: { x: originX, y: Math.max(0.05, originY - 0.12) },
      particleCount: 200,
      spread: 80,
      startVelocity: 45,
      decay: 0.92,
      ticks: 180,
      gravity: 1.1,
      scalar: 0.5,
    });
  }, 350);
};

const reveal = () => {
  if (isRevealed.value) return;

  isRevealed.value = true;
  isCoverCleared.value = true;
  message.value = props.revealText;

  const targetEl =
    coverContainerRef.value || prizeImageRef.value || textRef.value;

  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();

  // ✅ 以「圖的中間」當作爆炸中心
  const originX = (rect.left + rect.width / 2) / window.innerWidth;
  const originY = (rect.top + rect.height) / window.innerHeight;

  fireConfettiBurstTopWide(originX, originY);
};

const onCoverTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName === 'opacity' && isCoverCleared.value) {
    isCoverHidden.value = true;
  }
};
</script>

<style scoped lang="scss">
.scratch-card {
  --scratch-card-size: 320px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  &__inner {
    position: relative;
    width: var(--scratch-card-size);
    height: var(--scratch-card-size);
    border-radius: 16px;
    padding: 12px;
  }
}

.scratch-card-cover-container {
  position: absolute;
  z-index: 2;
  inset: 12px;
  border-radius: 12px;
  filter: url('#remove-black');
  transition: opacity 0.4s ease;
  overflow: hidden;

  &.clear {
    opacity: 0;
  }

  &.hidden {
    display: none;
  }
}

.scratch-card-canvas {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;

  &.hidden {
    opacity: 0;
  }

  &:active {
    cursor: grabbing;
  }
}

.scratch-card-canvas-render {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  transition: background-color 0.2s;

  &.hidden {
    display: none;
  }
}

/* ================== Cover 基底樣式（銀色） ================== */
.scratch-card-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  inset: 0;
  overflow: hidden;

  // 預設銀色（一般賞）
  background-color: #cfced6;
  background-image: linear-gradient(
    to right,
    #cfced6,
    #e0dfe6,
    #efeef3,
    #e0dfe6,
    #cfced6
  );

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      135deg,
      transparent 40%,
      rgb(255 255 255 / 0.8) 50%,
      transparent 60%
    );
    background-position: bottom right;
    background-size: 300% 300%;
    background-repeat: no-repeat;
  }

  // 加上閃光掃過去的效果
  &.shine::before {
    animation: shine 8s infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.12;
    filter: url('#noise');
  }
}

/* ================== 依照 grade 換色 ================== */
/* A賞：主金色，最亮、最華麗 */
.scratch-card-cover--grade-a {
  background-image: linear-gradient(135deg, #fef3c7, #fbbf24, #f59e0b);
}
/* B賞：淡藍金屬（柔和藍） */
.scratch-card-cover--grade-b {
  background-image: linear-gradient(
    135deg,
    #dbeafe,
    /* very light blue */ #93c5fd,
    /* soft blue */ #60a5fa /* medium blue */
  );
}

.scratch-card-cover--grade-c {
  background-image: linear-gradient(
    135deg,
    #fee2e2,
    /* very light pink */ #fecaca,
    /* soft pink */ #fca5a5 /* gentle red-pink */
  );
}
/* Last賞：淡紫金（霧紫金屬） */
.scratch-card-cover--grade-last {
  background-image: linear-gradient(
    135deg,
    #ede9fe,
    /* very light violet */ #ddd6fe,
    /* soft lavender */ #c4b5fd /* gentle indigo/purple */
  );
}

/* 其他 / 沒指定：維持預設銀色 → 不需要額外定義也可，這裡只是明示 class */
.scratch-card-cover--grade-normal {
  /* 用的就是 .scratch-card-cover 的預設 background */
}

@keyframes shine {
  50% {
    background-position: 0% 0%;
  }
  100% {
    background-position: -50% -50%;
  }
}

.scratch-card-cover-background {
  width: 100%;
  height: 100%;
  fill: #555;
  opacity: 0.12;
}

.scratch-card-image {
  position: relative;
  z-index: 1;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  object-fit: contain;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.25);
  user-select: none;
  will-change: transform;

  &.animate {
    animation: pop-out-in cubic-bezier(0.65, 1.35, 0.5, 1) 1s;
  }
}

@keyframes pop-out-in {
  36% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

.scratch-card-text {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4b5563;
  letter-spacing: 0.03em;
  text-align: center;
}

.scratch-card-filters {
  position: absolute;
}

/* RWD：小螢幕稍微縮小卡片 */
@media (max-width: 480px) {
  .scratch-card {
    --scratch-card-size: 260px;
  }
}
</style>
