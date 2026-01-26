<template>
  <!-- 撕開條本體 -->
  <div ref="stripRef" class="tear-strip">
    <!-- 撕開後顯示的文字內容（例如提示或公式） -->
    <div
      ref="contentRef"
      class="tear-strip__content"
      :aria-hidden="!torn"
      :aria-live="torn ? 'polite' : 'off'"
    >
      <img :src="prizeImg" />
    </div>

    <!-- 左側陰影 -->
    <span ref="shadowRef" class="tear-strip__shadow"></span>

    <!-- 還沒撕開時才顯示的前蓋 -->
    <template v-if="!torn">
      <div ref="tabRef" class="tear-strip__strip">
        <img class="tear-strip__strip-bg" :src="kujiBack" alt="" />

        <div ref="iconRef" class="tear-strip__icon">
          <font-awesome-icon
            class="tear-strip__iconFa"
            :icon="['fas', 'angle-right']"
          />
        </div>

        <div ref="backingRef" class="tear-strip__back">
          <div class="tear-strip__back-shadow"></div>
        </div>
      </div>

      <!-- 拖曳把手區（透明） -->
      <div ref="handleRef" class="tear-strip__handle"></div>

      <!-- 新增：覆蓋整個區域的透明 Drag Layer -->
      <div ref="dragLayerRef" class="tear-strip__drag-layer"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { gsap } from 'gsap';
import Draggable from 'gsap/dist/Draggable';
import kujiBack from '@/assets/image/kujiBack.png';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { onBeforeUnmount } from 'vue';
import { playRandomTearDrop } from './tearDropAnimations';
import polerImages from '@/data/polerImages';

gsap.registerPlugin(Draggable);

const emit = defineEmits<{
  (e: 'reveal'): void;
}>();

const props = withDefaults(
  defineProps<{
    text?: string;
    grade?: string;
  }>(),
  {
    text: 'inner radius = outer radius - padding',
    grade: 'SP',
  },
);
type PolerKey = keyof typeof polerImages;

const gradeKey = computed<PolerKey>(() => {
  const raw = (props.grade ?? 'SP').toString().trim().toUpperCase();

  // ✅ 常見資料清洗： "A賞" / "a" / " last " 都能吃
  const normalized = raw
    .replace(/賞/g, '') // A賞 -> A
    .replace(/LAST賞/g, 'LAST')
    .replace(/SP賞/g, 'SP');

  return normalized in polerImages ? (normalized as PolerKey) : 'SP';
});

const prizeImg = computed(() => polerImages[gradeKey.value]);

const dragLayerRef = ref(null);

const stripRef = ref(null);
const tabRef = ref(null);
const backingRef = ref(null);
const handleRef = ref(null);
const iconRef = ref(null);
const shadowRef = ref(null);
const contentRef = ref<HTMLElement | null>(null);

const torn = ref(false);
const proxy = document.createElement('div');

// 掉落動畫的共用設定
const DROP_PROPS = {
  yPercent: 1000,
  rotate: -20,
  opacity: 0,
  duration: 0.7,
  ease: 'power3.in',
};
let draggable: Draggable | null = null;
function initDraggable() {
  const strip = stripRef.value;
  const tab = tabRef.value;
  const back = backingRef.value;
  const handle = handleRef.value;
  const icon = iconRef.value;
  const shadow = shadowRef.value;
  const dragLayer = dragLayerRef.value;
  const content = contentRef.value!;
  const IMG_WIDTH = content.offsetWidth;

  if (!strip || !tab || !back || !handle || !icon || !shadow || !dragLayer)
    return;

  const DIST = strip.offsetWidth * 0.25;
  const TEAR_THRESHOLD = strip.offsetWidth;
  gsap.set(handle, { x: 0, y: 0 });

  draggable = Draggable.create(proxy, {
    type: 'x,y',

    trigger: dragLayer,

    allowContextMenu: true,
    dragResistance: 0.9, // 比 0.99 更滑一點
    onDrag() {
      if (this.__void) return;

      if (this.__torn) {
        // 撕開完後可以帶著整片移動一下
        gsap.to(tab, {
          x: this.x - strip.offsetWidth * 2,
          y: this.y,
          duration: 0.1,
        });
        return;
      }

      const HANDLE_HEIGHT = handle.offsetHeight;
      if (
        this.y < this.startY - HANDLE_HEIGHT * 0.5 ||
        this.y > this.startY + HANDLE_HEIGHT * 0.5
      ) {
        this.__void = true;
        return;
      }

      if (this.x > this.startX) {
        this.dragResistance = gsap.utils.clamp(
          0,
          this.dragResistance,
          gsap.utils.mapRange(0, DIST, 0.93, 0.1, this.x),
        );
      }

      const clip = gsap.utils.mapRange(
        0,
        strip.offsetWidth * 2,
        0,
        strip.offsetWidth,
        this.x,
      );
      const clampedX = gsap.utils.clamp(0, IMG_WIDTH * 1.7, this.x);

      gsap.set(tab, {
        clipPath: `inset(0 -1000% 0 ${clip}px)`,
      });

      gsap.set(strip, {
        '--tab-darkness': gsap.utils.clamp(
          10,
          80,
          gsap.utils.mapRange(0, strip.offsetWidth, 10, 80, this.x),
        ),
        '--shadow-spread': gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(
            strip.offsetWidth * 0.25,
            strip.offsetWidth,
            0,
            1,
            this.x,
          ),
        ),
        '--shadow-reveal': gsap.utils.clamp(
          0,
          1,
          gsap.utils.mapRange(
            strip.offsetWidth * 0.1,
            strip.offsetWidth * 0.2,
            0,
            1,
            this.x,
          ),
        ),
        '--shadow-width': clampedX * 0.5,
        '--bg-size': this.x * 0.5,
        '--shadow-multiplier': gsap.utils.clamp(
          0.8,
          0.9,
          gsap.utils.mapRange(
            strip.offsetWidth,
            strip.offsetWidth * 2,
            0.8,
            0.9,
            this.x,
          ),
        ),
      });

      gsap.set(icon, {
        scaleX: gsap.utils.clamp(
          0.75,
          1,
          gsap.utils.mapRange(0, DIST, 1, 0.75, this.x),
        ),
        xPercent: gsap.utils.clamp(
          0,
          50,
          gsap.utils.mapRange(0, DIST, 0, 50, this.x),
        ),
      });

      gsap.set(back, {
        transformOrigin: '0% 50%',
        x: this.x,
      });

      gsap.set(shadow, {
        x: this.x * 0.5,
        xPercent: -90,
        scaleX: gsap.utils.clamp(
          1,
          2,
          gsap.utils.mapRange(
            strip.offsetWidth,
            strip.offsetWidth * 2,
            1,
            2,
            this.x,
          ),
        ),
        opacity:
          this.x > strip.offsetWidth
            ? gsap.utils.clamp(
                0,
                1,
                gsap.utils.mapRange(
                  strip.offsetWidth,
                  strip.offsetWidth * 2,
                  1,
                  0,
                  this.x,
                ),
              )
            : gsap.utils.clamp(
                0,
                1,
                gsap.utils.mapRange(15, 100, 0, 1, this.x),
              ),
      });

      const x = this.__torn ? this.x : Math.max(0, this.x);
      gsap.set(handle, { x });

      // if (this.x > strip.offsetWidth * 1.8) {
      //   this.__torn = true;
      //   gsap.to(back, {
      //     xPercent: 25,
      //     ease: 'elastic.out(1,0.9)',
      //     '--bg-alpha': 0.75,
      //   });
      // }
      this.__readyToTear = this.x >= TEAR_THRESHOLD;
    },
    onRelease() {
      this.__void = false;
      if (this.__readyToTear) {
        this.__torn = true;

        playRandomTearDrop({
          tab,
          shadow,
          onDone: () => {
            torn.value = true;
            emit('reveal');
          },
        });
      }
    },
  })[0];
}

onMounted(() => {
  initDraggable();
});
onBeforeUnmount(() => {
  draggable?.kill();
  draggable = null;
});
</script>
<style scoped lang="scss">
/* =====================================
   🎯 Gacha 背景：柔光 + 置中容器
===================================== */
.gacha {
  position: absolute;
  inset: 0;
  z-index: 99999;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}

/* =====================================
   ✨ 撕開條本體
===================================== */
.tear-strip {
  position: relative;
  width: 300px;
  height: 184px;

  display: grid;
  place-items: center;

  /* 撕開後內容 */
  &__content {
    position: absolute;
    inset: 0;

    opacity: 1;
    font-size: 1rem;
    img {
      width: 100%;
      height: 100%;
    }
  }

  /* =====================================
     前蓋（可拖曳）
  ===================================== */
  &__strip {
    position: absolute;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    clip-path: inset(0 0 0 0);
  }

  /* =====================================
     左側陰影（撕開時出現）
  ===================================== */
  &__shadow {
    position: absolute;
    left: 0;
    height: 100%;
    width: 42px;

    background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.35));

    filter: blur(12px);
    opacity: 0;
  }

  /* =====================================
     背板（被拉出的部分）
  ===================================== */
  &__back {
    position: absolute;
    inset: 0;
    right: 100%;
  }

  /* =====================================
     背板陰影（紅色系立體感）
  ===================================== */
  &__back-shadow {
    position: absolute;
    top: 50%;
    right: 0;
    translate: 0 -50%;

    height: 100%;
    width: calc((var(--shadow-width) * 1.15) * 1px);
    min-width: 95px;

    background: linear-gradient(
      to left,
      rgb(255, 205, 190),
      rgb(220, 120, 100),
      rgb(180, 51, 37),
      rgb(95, 18, 12)
    );

    box-shadow:
      -14px 0 28px rgba(180, 51, 37, 0.55),
      -6px 0 14px rgba(240, 150, 120, 0.45),
      inset -3px 0 10px rgba(80, 10, 8, 0.65);

    filter: blur(2.5px);
    overflow: hidden;

    /* 💧 流動玻璃反射 */
    &::after {
      content: '';
      position: absolute;
      inset: -30% -60%;

      background: linear-gradient(
        115deg,
        transparent 38%,
        rgba(255, 255, 255, 0.55) 48%,
        rgba(255, 220, 180, 0.35) 52%,
        rgba(255, 255, 255, 0.25) 56%,
        transparent 66%
      );

      transform: translateX(var(--glass-x, -30%)) skewX(-12deg);
      opacity: 0.7;
      mix-blend-mode: screen;
      pointer-events: none;

      animation: glass-flow 5.5s linear infinite;
    }

    /* ✨ 細微 shimmer */
    &::before {
      content: '';
      position: absolute;
      inset: 0;

      background: radial-gradient(
        circle at 30% 20%,
        rgba(255, 255, 255, 0.25),
        transparent 55%
      );

      opacity: 0.35;
      animation: glass-shimmer 3.5s ease-in-out infinite alternate;
      pointer-events: none;
    }
  }

  /* =====================================
     拖曳手把區
  ===================================== */
  &__handle {
    position: absolute;
    inset: 0 auto 0 0;

    width: 90px;
    height: 100%;

    border-radius: 24px 0 0 24px;
    background: transparent;
  }

  /* =====================================
     拖曳層（實際 drag target）
  ===================================== */
  &__drag-layer {
    position: absolute;
    inset: 0;
    z-index: 99;

    background: transparent;
    cursor: grab;
  }

  /* =====================================
     箭頭 Icon
  ===================================== */
  &__icon {
    position: absolute;
    left: 10px;

    width: 48px;
    height: 48px;
    border-radius: 14px;

    display: grid;
    place-items: center;

    background: linear-gradient(135deg, #d65a4a, #8f1d13);
    box-shadow:
      0 4px 14px rgba(180, 51, 37, 0.55),
      inset 0 2px 3px rgba(255, 255, 255, 0.25);

    &Fa {
      color: #fff6e5;
    }
  }
}

/* =====================================
   ✨ 撕開瞬間：金光閃一下
===================================== */
.gacha-flash {
  position: absolute;
  inset: -20%;
  pointer-events: none;

  background: radial-gradient(
    circle at center,
    rgba(255, 230, 90, 0.75),
    transparent 65%
  );

  opacity: 0;
  filter: blur(14px);
  transform: scale(1.3);
  mix-blend-mode: screen;
}
</style>
