// src/utils/dialog/scratchCardDialog.ts
import { App, createApp, h } from 'vue';
import ScratchCardDialog from '@/components/common/ScratchCardDialog.vue';

type ScratchCardItem = {
  imageSrc: string;
  imageAlt?: string;
  grade?: string;
  idleText?: string;
  revealText?: string;
  threshold?: number;
  revealedNumber?: number | null;
};

type ScratchCardDialogOptions = {
  title?: string;

  // 多張模式
  cards?: ScratchCardItem[];

  // 單張模式
  imageSrc?: string;
  imageAlt?: string;
  idleText?: string;
  revealText?: string;
  threshold?: number;
  grade?: string;
  revealedNumber?: number | null;
};

/**
 * await 版本 ScratchCardDialog
 * - 單張模式：傳 imageSrc / revealText ...
 * - 多張模式：傳 cards
 *
 * 回傳：
 * - true：完成整個刮卡流程（包含 skip / skipAll 完成）
 * - false：使用者主動關閉 / 取消
 */
export function scratchCardDialog(
  options: ScratchCardDialogOptions,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let app: App<Element> | null = null;
    let settled = false;

    const close = () => {
      if (app) {
        app.unmount();
        app = null;
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    const confirmAndClose = () => {
      if (!settled) {
        settled = true;
        resolve(true);
      }
      close();
    };

    const cancelAndClose = () => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
      close();
    };

    app = createApp({
      data() {
        return {
          visible: true,
        };
      },
      render() {
        const vm = this as any;

        return h(ScratchCardDialog, {
          modelValue: vm.visible,
          'onUpdate:modelValue': (val: boolean) => {
            vm.visible = val;
            if (!val) {
              cancelAndClose();
            }
          },

          title: options.title,

          // 多張模式
          cards: options.cards,

          // 單張模式
          imageSrc: options.imageSrc ?? '',
          imageAlt: options.imageAlt,
          idleText: options.idleText,
          revealText: options.revealText,
          threshold: options.threshold ?? 45,
          grade: options.grade,
          revealedNumber: options.revealedNumber ?? null,

          /**
           * revealed:
           * 每一張刮開 / skipOne / skipAll 時都可能觸發
           * 這裡不要直接 close，不然多張模式第一張就被關掉
           */
          onRevealed: () => {},

          /**
           * finish:
           * 多張模式全部完成，或 skipAll 完整結束後才真正 resolve(true)
           * 單張模式也會走這裡
           */
          onFinish: () => {
            confirmAndClose();
          },

          onCancel: () => {
            cancelAndClose();
          },
        });
      },
    });

    app.mount(container);
  });
}
