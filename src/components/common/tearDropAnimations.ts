// src/animations/tearDropAnimations.ts
import { gsap } from 'gsap';

export type TearAnimationContext = {
  tab: HTMLElement;
  shadow: HTMLElement;
  onDone: () => void;
};

const BASE_DROP = {
  opacity: 0,
  duration: 0.7,
  ease: 'power3.in',
};

/**
 *
 */
function dropSlide(ctx: TearAnimationContext) {
  gsap
    .timeline()
    .to(
      ctx.tab,
      {
        ...BASE_DROP,
        xPercent: 120,
        yPercent: 180,
        rotate: -18,
        onComplete: ctx.onDone,
      },
      0,
    )
    .to(ctx.shadow, { opacity: 0, duration: 0.2 }, 0);
}

/**
 * 🅱️ 旋轉翻飛（比較戲劇）
 */
function dropSpin(ctx: TearAnimationContext) {
  gsap
    .timeline()
    .to(
      ctx.tab,
      {
        ...BASE_DROP,
        xPercent: 80,
        yPercent: 240,
        rotate: -120,
        duration: 0.9,
        ease: 'power4.in',
        onComplete: ctx.onDone,
      },
      0,
    )
    .to(ctx.shadow, { opacity: 0, duration: 0.15 }, 0);
}

/**
 * 🅲 金光爆開（一番賞感）
 */
function dropBurst(ctx: TearAnimationContext) {
  gsap
    .timeline()
    .to(
      ctx.tab,
      {
        ...BASE_DROP,
        scale: 1.15,
        xPercent: 140,
        yPercent: 160,
        rotate: -8,
        ease: 'expo.in',
        onComplete: ctx.onDone,
      },
      0,
    )
    .to(
      ctx.tab,
      {
        scale: 0.85,
        duration: 0.15,
      },
      0,
    )
    .to(ctx.shadow, { opacity: 0, duration: 0.15 }, 0);
}

/*  所有動畫集合 */
const ANIMATIONS = [dropSlide];

/**
 * 🎲 隨機播放一套撕開動畫
 */
export function playRandomTearDrop(ctx: TearAnimationContext) {
  const anim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
  anim(ctx);
}
