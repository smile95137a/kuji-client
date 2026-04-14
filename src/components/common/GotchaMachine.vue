<template>
  <div ref="appRef" class="gotcha">
    <div class="game-layer">
      <div class="machine-container" ref="machineRef">
        <div class="backboard"></div>
        <div class="balls" ref="ballsRef"></div>

        <img class="machine" :src="machineSrc" alt="machine" />
        <div class="handle handle--img" type="button" aria-label="Turn handle">
          <img
            class="handle__img"
            :src="defaultMachineHangleSrc"
            alt=""
            draggable="false"
          />
        </div>

        <div class="pointer" aria-hidden="true">
          <img
            class="pointer__img"
            :src="defaultMachineHangleaaSrc"
            alt=""
            draggable="false"
          />
        </div>
      </div>
    </div>

    <div class="ui-layer">
      <div class="prize-container">
        <div class="prize-ball-container" ref="prizeBallContainerRef"></div>

        <div class="prize-reward-container" ref="prizeRewardContainerRef">
          <div class="prize prize--center">
            <img
              class="prize__img wiggle"
              :src="prize?.prizeImageUrl || ''"
              alt="prize"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import gsap from 'gsap';
import { RoughEase } from 'gsap/EasePack';
import defaultMachineSrc from '@/assets/image/gashapon-machine.png';
import defaultMachineHangleSrc from '@/assets/image/gashapon-machine-handle.png';
import defaultMachineHangleaaSrc from '@/assets/image/aa.png';

gsap.registerPlugin(RoughEase);

const props = withDefaults(
  defineProps<{
    speed?: number;
    machineSrc?: string;
    pointerSrc?: string;
    prizes?: any[];
  }>(),
  {
    speed: 1,
    machineSrc: defaultMachineSrc,
    prizes: () => [],
  },
);

const emit = defineEmits<{
  (e: 'got-prize', prize): void;
}>();

const appRef = ref<HTMLElement | null>(null);
const machineRef = ref<HTMLElement | null>(null);
const ballsRef = ref<HTMLElement | null>(null);
const prizeBallContainerRef = ref<HTMLElement | null>(null);
const prizeRewardContainerRef = ref<HTMLElement | null>(null);

const prize = ref<any>(null);

// ----- internal state -----
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const SPEED = () => props.speed;

// 不用 vh/vw：用 px（由視窗大小換算）
const unitPx = () => Math.max(6, window.innerHeight / 100);
const v = (n: number) => Math.round(n * unitPx());

let balls: any[] = [];
let prizeBall: any = null;

let $app: HTMLElement | null = null;
let $machine: HTMLElement | null = null;
let $handle: HTMLElement | null = null;
let $balls: HTMLElement | null = null;
let $pointer: HTMLElement | null = null;

let $$jitters: gsap.core.Timeline[] = [];
let cleanupFns: Array<() => void> = [];

let isRunning = false;

/** 紅白扭蛋配色（上白下紅） */
const BALL_THEME = { top: '#FFFFFF', bottom: '#E84545', outline: '#7A0E0E' };

const tweak = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const confetti = (
  $parent: HTMLElement,
  {
    count = 120,
    x = 50,
    y = 50,
    randX = 4,
    randY = 4,
    speedX = 0,
    speedY = -2.8,
    speedRandX = 1.8,
    speedRandY = 1.4,
    gravity = 0.085,
    size = 10,
    sizeRand = 6,
  }: any = {},
) => {
  const $container = document.createElement('div');
  $container.classList.add('confetti');
  const particles: any[] = [];

  for (let i = 0; i < count; i++) {
    const $particle = document.createElement('span');
    const settings = {
      dom: $particle,
      x: x + Math.random() * randX * 2 - randX,
      y: y + Math.random() * randY * 2 - randY,
      speedX: speedX + Math.random() * speedRandX * 2 - speedRandX,
      speedY: speedY + Math.random() * speedRandY * 2 - speedRandY,
      size: size + Math.random() * sizeRand * 2 - sizeRand,
    };

    $particle.style.backgroundColor = `hsl(${Math.random() * 360}deg, 85%, 62%)`;
    $particle.style.setProperty('--rx', String(Math.random() * 2 - 1));
    $particle.style.setProperty('--ry', String(Math.random() * 2 - 1));
    $particle.style.setProperty('--rz', String(Math.random() * 2 - 1));
    $particle.style.setProperty('--rs', String(Math.random() * 2 + 0.5));
    particles.push(settings);
    $container.appendChild($particle);
  }

  const update = () => {
    particles.forEach((config, i) => {
      if (config.y > 110 || config.x < -15 || config.x > 115) {
        particles.splice(i, 1);
        config.dom.remove();
        return;
      }

      config.dom.style.setProperty('--size', config.size);
      config.dom.style.left = config.x + '%';
      config.dom.style.top = config.y + '%';
      config.x += config.speedX;
      config.y += config.speedY;
      config.speedY += gravity;
    });

    if (particles.length) requestAnimationFrame(update);
    else $container.remove();
  };

  update();
  $parent.insertAdjacentElement('beforeend', $container);
};

const addAnimClass = ($e: Element | string, clazz: string) => {
  const _func = (el: Element) => {
    el.classList.add(clazz);
    el.setAttribute('data-animate', '');
  };

  if (typeof $e === 'string') {
    const root = $app ?? document;
    [...root.querySelectorAll($e)].forEach(_func);
  } else {
    _func($e);
  }
};

const getPrize = async () => {
  const list = props.prizes;
  return list[Math.floor(list.length * Math.random())];
};

const createBalls = () => {
  if (!$balls) return;

  balls = [];
  let id = 0;

  const createBall = (
    x: number,
    y: number,
    rotate = Math.floor(Math.random() * 360),
  ) => {
    const BALL_SCALE = 0.45;
    const sizePx = Math.round(v(7.6 + Math.random() * 1.2) * BALL_SCALE);

    const $ball = document.createElement('figure');

    const light = Math.floor(Math.random() * 10 - 5);
    $ball.classList.add('ball');
    $ball.setAttribute('data-id', String(++id));
    $ball.style.setProperty('--size', `${sizePx}px`);
    $ball.style.setProperty('--color2', tweak(BALL_THEME.top, light));
    $ball.style.setProperty('--color1', tweak(BALL_THEME.bottom, light));
    $ball.style.setProperty(
      '--outline',
      tweak(BALL_THEME.outline, Math.floor(light / 2)),
    );

    $balls!.appendChild($ball);

    const update = () => {
      gsap.set($ball, {
        css: {
          left: `calc(${x} * (100% - ${sizePx}px))`,
          top: `calc(${y} * (100% - ${sizePx}px))`,
          transform: `rotate(${rotate}deg)`,
        },
      });
    };

    const ball: any = {
      dom: $ball,
      get x() {
        return x;
      },
      get y() {
        return y;
      },
      get rotate() {
        return rotate;
      },
      set x(vv: number) {
        x = vv;
        update();
      },
      set y(vv: number) {
        y = vv;
        update();
      },
      set rotate(vv: number) {
        rotate = vv;
        update();
      },
      get size() {
        return sizePx;
      },
    };

    balls.push(ball);
    update();
    return ball;
  };

  createBall(0.5, 0.6);
  createBall(0, 0.68);
  createBall(0.22, 0.65);
  createBall(0.7, 0.63);
  createBall(0.96, 0.66);

  createBall(0.75, 0.79);
  createBall(0.5, 0.8);
  prizeBall = createBall(0.9, 0.81);
  createBall(0, 0.82);

  createBall(1, 0.9);
  createBall(0.25, 0.85);

  createBall(0.9, 1);
  createBall(0.4, 1);
  createBall(0.65, 1);
  createBall(0.09, 1);
};

const jitter = () => {
  const r = gsap.utils.random;

  balls.forEach(({ dom, rotate }: any, i: number) => {
    const tl = gsap.timeline({ repeat: -1, delay: -i * 0.05 });

    gsap.set(dom, { x: 0, y: 0, rotateZ: rotate, scaleX: 1, scaleY: 1 });

    const xMax = v(4);
    const yMin = v(2);
    const yMax = v(6);
    const rotMax = 12;
    const squashMax = 0.03;
    const duration = 0.1 + Math.random() * 0.14;

    const lift = r(yMin, yMax);
    const slip = r(-xMax, xMax);
    const rot = r(-rotMax, rotMax);
    const squash = r(0, squashMax);

    tl.to(dom, {
      x: slip,
      y: -lift,
      rotateZ: rotate + rot,
      scaleX: 1 + squash,
      scaleY: 1 - squash * 0.6,
      duration,
      ease: RoughEase.ease.config({
        template: gsap.parseEase('none'),
        strength: 0.85,
        points: 18,
        taper: 'none',
        randomize: true,
        clamp: true,
      }),
    }).to(dom, {
      x: 0,
      y: 0,
      rotateZ: rotate - r(2, 8),
      scaleX: 1,
      scaleY: 1,
      duration,
      ease: 'power1.out',
    });

    $$jitters.push(tl);
  });

  if ($machine) {
    const tl = gsap.timeline({ repeat: -1 });

    tl.to($machine, {
      x: 2,
      y: -1,
      rotateZ: 0.35,
      duration: 0.12,
      ease: 'sine.inOut',
    })
      .to($machine, {
        x: -2,
        y: 0,
        rotateZ: -0.35,
        duration: 0.12,
        ease: 'sine.inOut',
      })
      .to($machine, {
        x: 0,
        y: 0,
        rotateZ: 0,
        duration: 0.14,
        ease: 'sine.inOut',
      });

    $$jitters.push(tl);
  }
};

const stopJittering = async () => {
  $$jitters.forEach((t) => t.pause());

  balls.forEach(({ dom, rotate }: any) =>
    gsap.to(dom, {
      x: 0,
      y: 0,
      rotateZ: rotate,
      scaleX: 1,
      scaleY: 1,
      duration: 0.18,
      ease: 'power1.out',
    }),
  );

  if ($machine) {
    gsap.to($machine, {
      x: 0,
      y: 0,
      rotateZ: 0,
      duration: 0.18,
      ease: 'power1.out',
    });
  }

  await delay(220);
};

const showHint = () => {
  if (!$pointer) return;
  gsap.to($pointer, { opacity: 1, duration: 0.8, ease: 'none' });
};

const hideHint = () => {
  if (!$pointer) return;
  gsap.to($pointer, { opacity: 0, duration: 0.6, ease: 'none' });
};

const pop = () => {
  if (!$app || !$machine || !prizeRewardContainerRef.value) return;

  const $reward = prizeRewardContainerRef.value;
  const $prizeWrap = $reward.querySelector('.prize') as HTMLElement | null;
  const $prizeImg = $reward.querySelector('.prize__img') as HTMLElement | null;

  confetti($reward, {
    count: 160,
    x: 50,
    y: 50,
    randX: 3,
    randY: 3,
    speedX: 0,
    speedY: -3.2,
    speedRandX: 2.2,
    speedRandY: 1.6,
    gravity: 0.09,
    size: 10,
    sizeRand: 7,
  });

  gsap.set($reward, { opacity: 1 });
  if ($prizeWrap) {
    gsap.set($prizeWrap, {
      scale: 0.3,
      opacity: 0,
      xPercent: -50,
      yPercent: -50,
    });

    gsap.to($prizeWrap, {
      scale: 1,
      opacity: 1,
      duration: 0.65,
      ease: 'back.out(1.8)',
    });
  }

  if ($prizeImg) {
    gsap.fromTo(
      $prizeImg,
      { scale: 0.92 },
      {
        scale: 1,
        duration: 0.45,
        ease: 'power2.out',
      },
    );
  }

  if (prizeBall?.dom) gsap.to(prizeBall.dom, { opacity: 0, duration: 0.15 });

  gsap.fromTo(
    $machine,
    { y: 0 },
    { y: -8, duration: 0.12, yoyo: true, repeat: 3, ease: 'power1.inOut' },
  );

  setTimeout(() => resetRound(), 3000 * SPEED());
};

const pickup = () => {
  if (!prizeBall?.dom || !prizeBallContainerRef.value || !$app) return;

  const fromRect = prizeBall.dom.getBoundingClientRect();
  const layerRect = prizeBallContainerRef.value.getBoundingClientRect();

  const startX = Math.round(fromRect.left - layerRect.left);
  const startY = Math.round(fromRect.top - layerRect.top);

  prizeBallContainerRef.value.appendChild(prizeBall.dom);

  const rotate = prizeBall.rotate;
  prizeBall.x = 0;
  prizeBall.y = 0;
  prizeBall.rotate = 0;

  const gameLayer = $app.querySelector('.game-layer');
  if (gameLayer) addAnimClass(gameLayer, 'dim');

  prizeBall.dom.style.left = '0';
  prizeBall.dom.style.top = '0';

  gsap.set(prizeBall.dom, { x: startX, y: startY, rotate });

  gsap.to(prizeBallContainerRef.value, { x: -v(4), y: -v(4), duration: 1 });

  const tl = gsap.timeline();
  const targetX = Math.round(layerRect.width / 2 - prizeBall.size / 2);
  const targetY = Math.round(layerRect.height / 2 - prizeBall.size / 2);

  tl.to(prizeBall.dom, {
    x: targetX,
    y: targetY,
    scale: 2,
    rotate: -180,
    duration: 1,
  })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 2.1,
      scaleY: 1.9,
      ease: 'power1.inOut',
    })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 1.9,
      scaleY: 2.1,
      ease: 'power1.inOut',
    })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 2.1,
      scaleY: 1.9,
      ease: 'power1.inOut',
    })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 1.9,
      scaleY: 2.1,
      ease: 'power1.inOut',
    })
    .to(prizeBall.dom, {
      duration: 0.5,
      scaleX: 2.6,
      scaleY: 1.6,
      ease: 'power1.out',
    })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 1.6,
      scaleY: 2.4,
      ease: 'power1.out',
      onComplete: pop,
    })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 2.1,
      scaleY: 1.9,
      ease: 'power1.out',
    })
    .to(prizeBall.dom, {
      duration: 0.1,
      scaleX: 2,
      scaleY: 2,
      ease: 'power1.out',
    });
};

const start = async () => {
  if (!$handle || !prizeBall) return;
  if (isRunning) return;

  isRunning = true;
  ($handle as any).style.cursor = 'default';
  hideHint();

  await new Promise<void>((resolve) => {
    const tl = gsap.timeline();
    tl.to($handle!, {
      rotate: 90,
      duration: 0.28,
      ease: 'power1.in',
      async onComplete() {
        jitter();
        await delay(2000 * SPEED());
        await stopJittering();
        resolve();
      },
    }).to($handle!, { rotate: 0, duration: 0.9 });
  });

  await new Promise<void>((resolve) => {
    const tl = gsap.timeline();

    const DROP_OFFSET = v(7);
    gsap.to(prizeBall.dom, {
      x: -v(1),
      ease: 'none',
      duration: 0.5,
      rotate: prizeBall.rotate + 10,
    });

    if (balls[3]) {
      gsap.to(balls[3].dom, {
        x: v(1),
        y: v(1),
        duration: 0.5,
        ease: 'none',
        rotate: balls[3].rotate - 5,
      });
    }

    if (balls[4]) {
      gsap.to(balls[4].dom, {
        x: -v(1),
        y: v(1),
        duration: 0.5,
        ease: 'none',
        rotate: balls[4].rotate - 5,
      });
    }

    if (balls[5]) {
      gsap.to(balls[5].dom, {
        x: v(1),
        y: v(1),
        duration: 0.5,
        ease: 'none',
        rotate: balls[5].rotate - 5,
      });
    }

    tl.to(prizeBall.dom, {
      y: v(2) + DROP_OFFSET,
      ease: 'power1.in',
      duration: 0.5,
    })
      .to(prizeBall.dom, {
        y: v(8) + DROP_OFFSET,
        ease: 'power1.in',
        duration: 0.5,
      })
      .to(prizeBall.dom, {
        y: v(9.5) + DROP_OFFSET,
        ease: 'power1.out',
        duration: 0.2,
      })
      .to(prizeBall.dom, {
        y: v(11) + DROP_OFFSET,
        ease: 'power1.in',
        duration: 0.2,
      })
      .to(prizeBall.dom, {
        y: v(10.5) + DROP_OFFSET,
        ease: 'power1.out',
        duration: 0.1,
      })
      .to(prizeBall.dom, {
        y: v(11) + DROP_OFFSET,
        ease: 'power1.in',
        duration: 0.1,
        onComplete: resolve,
      });
  });

  await delay(250);
  pickup();
};

const resetRound = async () => {
  if (!$app || !$balls || !$handle || !$pointer) return;

  await stopJittering();
  try {
    gsap.killTweensOf(Array.from($balls.querySelectorAll('.ball')));
  } catch {}

  if (prizeBallContainerRef.value) prizeBallContainerRef.value.innerHTML = '';

  if (prizeRewardContainerRef.value) {
    gsap.set(prizeRewardContainerRef.value, { opacity: 0 });
    const $prizeWrap = prizeRewardContainerRef.value.querySelector('.prize');
    if ($prizeWrap) {
      gsap.set($prizeWrap, { scale: 1, opacity: 1, clearProps: 'transform' });
    }
  }

  const gameLayer = $app.querySelector('.game-layer') as HTMLElement | null;
  if (gameLayer) {
    gameLayer.classList.remove('dim');
    gameLayer.removeAttribute('data-animate');
  }

  prize.value = await getPrize();

  $balls.innerHTML = '';
  createBalls();

  isRunning = false;
  ($handle as any).style.cursor = 'pointer';

  gsap.set($pointer, { opacity: 0 });
  setTimeout(() => {
    if (!isRunning) showHint();
  }, 450 * SPEED());

  if (prize.value) emit('got-prize', prize.value);
};

const prepare = () => {
  if (!$machine || !$handle) return;

  gsap.timeline().to($machine, {
    y: 0,
    ease: 'none',
    duration: 0.6,
    onComplete() {
      ($handle as any).style.cursor = 'pointer';

      const onHandleClick = () => {
        if (!isRunning) start();
      };

      $handle!.addEventListener('click', onHandleClick);
      cleanupFns.push(() =>
        $handle?.removeEventListener('click', onHandleClick),
      );

      balls.forEach((ball) => {
        const t = gsap.timeline();
        const duration = 0.05 + Math.random() * 0.1;
        t.to(ball.dom, {
          y: -(10 + Math.random() * 10),
          ease: 'power1.out',
          duration,
        }).to(ball.dom, { y: 0, duration, ease: 'power1.in' });
      });

      setTimeout(() => {
        if (!isRunning) showHint();
      }, 2000 * SPEED());
    },
  });
};

const init = async () => {
  $app = appRef.value;
  $machine = machineRef.value;
  $balls = ballsRef.value;

  $handle = machineRef.value?.querySelector('.handle') as HTMLElement | null;
  $pointer = machineRef.value?.querySelector('.pointer') as HTMLElement | null;

  if (!$app || !$machine || !$balls || !$handle || !$pointer) return;

  prize.value = await getPrize();

  $balls.innerHTML = '';
  createBalls();

  gsap.set($machine, { y: 0 });
  gsap.set($pointer, { opacity: 0 });

  if (prizeRewardContainerRef.value) {
    gsap.set(prizeRewardContainerRef.value, { opacity: 0 });
  }

  setTimeout(prepare, 500 * SPEED());
};

const cleanup = () => {
  cleanupFns.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
  cleanupFns = [];

  $$jitters.forEach((t) => {
    try {
      t.kill();
    } catch {}
  });
  $$jitters = [];

  try {
    if (appRef.value)
      gsap.killTweensOf(Array.from(appRef.value.querySelectorAll('*')));
  } catch {}
};

onMounted(() => init());
onBeforeUnmount(() => cleanup());
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&display=swap');

.gotcha {
  position: relative;
  overflow: visible;

  .confetti {
    position: absolute;
    inset: -8%;
    overflow: visible;
    z-index: 999;
    pointer-events: none;

    span {
      --size: 5;
      display: block;
      position: absolute;
      width: calc(var(--size) * 1px);
      height: calc(var(--size) * 1px);
      border-radius: 2px;
      animation: rotate linear calc(var(--rs) * 1s) infinite both;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .game-layer {
    width: 100%;
    max-width: 300px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .machine-container {
      position: relative;

      .machine {
        position: relative;
        z-index: 1;
        max-height: 640px;
        max-width: min(520px, 100%);
        pointer-events: none;
        filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.35));
      }

      .backboard {
        z-index: 0;
        width: 120px;
        height: 100px;
        top: 70%;
        left: 48%;
        position: absolute;
        border-radius: 16px;
        background: radial-gradient(
          circle at 28% 26%,
          #ffe3a6 0%,
          #ffb14a 22%,
          #e45800 55%,
          #9b1c00 100%
        );
        filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.25));
      }

      .balls {
        position: absolute;
        top: 22%;
        left: 50%;
        width: 70%;
        height: 34.5%;
        transform: translateX(-50%);
      }

      .handle {
        appearance: none;
        border: 0;
        padding: 0;
        margin: 0;
        z-index: 6;
        position: absolute;
        left: 17.5%;
        top: 67%;
        cursor: pointer;
        transition: transform 120ms ease;

        &--img {
          background: transparent;
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
        }
      }

      .pointer {
        --pScale: 0.2;
        position: absolute;
        top: 78%;
        left: 20%;
        z-index: 7;
        pointer-events: none;
        opacity: 0;
        width: 140px;
        height: 140px;

        &__img {
          width: calc(140px * var(--pScale));
          height: calc(140px * var(--pScale));
          display: block;
          transform: rotate(-30deg);
          transform-origin: 0% 0%;
          animation: click 1s ease-in-out infinite both;
          filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.25));
        }
      }
    }
  }

  .ui-layer {
    position: absolute;
    inset: 0;
    z-index: 30;
    pointer-events: none;
    overflow: visible;

    .prize-container {
      position: absolute;
      inset: 0;
      overflow: visible;

      .prize-ball-container {
        position: absolute;
        inset: 0;
        z-index: 20;
        overflow: visible;
      }

      .prize-reward-container {
        position: absolute;
        inset: 0;
        z-index: 50;
        overflow: visible;
        opacity: 0;

        .prize {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .prize--center {
          width: min(72vw, 420px);
          max-width: 420px;
        }

        .prize__img {
          display: block;
          width: 100%;
          max-width: 420px;
          max-height: min(48vh, 420px);
          object-fit: contain;
          filter: drop-shadow(0 20px 36px rgba(0, 0, 0, 0.35));
          transform-origin: center center;
        }
      }
    }
  }

  .ball {
    --size: 64px;
    --outline: #7a0e0e;
    --color1: #e84545;
    --color2: #ffffff;

    width: var(--size);
    height: var(--size);
    border-radius: 999px;
    position: absolute;
    overflow: hidden;

    box-shadow:
      0 0 0 6px var(--outline),
      0 10px 18px rgba(0, 0, 0, 0.25),
      inset 0 8px 14px rgba(255, 255, 255, 0.18),
      inset 0 -12px 18px rgba(0, 0, 0, 0.18);

    background:
      radial-gradient(
        circle at 28% 22%,
        rgba(255, 255, 255, 0.92),
        rgba(255, 255, 255, 0) 38%
      ),
      radial-gradient(
        circle at 70% 78%,
        rgba(0, 0, 0, 0.22),
        rgba(0, 0, 0, 0) 52%
      ),
      conic-gradient(
        from 210deg,
        rgba(255, 255, 255, 0.14),
        rgba(255, 255, 255, 0) 18%,
        rgba(255, 255, 255, 0.1) 42%,
        rgba(255, 255, 255, 0) 70%
      ),
      linear-gradient(to bottom, var(--color2) 0 48%, var(--color1) 52% 100%);

    transform: translateZ(0);

    &::before {
      content: '';
      position: absolute;
      left: -8%;
      right: -8%;
      top: 48%;
      height: 10%;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.35),
        rgba(0, 0, 0, 0.22)
      );
      filter: blur(3px);
      opacity: 0.55;
    }

    &::after {
      content: '';
      position: absolute;
      top: 8%;
      right: 10%;
      width: 26%;
      height: 70%;
      border-radius: 999px;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.65),
        rgba(255, 255, 255, 0.08) 55%,
        rgba(255, 255, 255, 0)
      );
      transform: rotate(12deg);
      opacity: 0.85;
    }
  }
}

@keyframes click {
  0% {
    transform: rotate(-30deg) translateY(0px);
  }
  80% {
    transform: rotate(-30deg) translateY(40px);
  }
  100% {
    transform: rotate(-30deg) translateY(0px);
  }
}

@keyframes wiggle {
  0% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(4deg);
  }
  100% {
    transform: rotate(-4deg);
  }
}

@keyframes rotate {
  from {
    transform: rotate3d(var(--rx), var(--ry), var(--rz), 0turn);
  }
  to {
    transform: rotate3d(var(--rx), var(--ry), var(--rz), 1turn);
  }
}
</style>
