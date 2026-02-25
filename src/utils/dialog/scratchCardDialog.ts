// src/utils/dialog/scratchCardDialog.ts
import { App, createApp, h } from 'vue';
import ScratchCardDialog from '@/components/common/ScratchCardDialog.vue';

/**
 *  await 版本的 ScratchCardDialog
 * 使用方式：
 *   const ok = await scratchCardDialog({
 *     title: '每日刮刮樂',
 *     imageSrc: 'xxx.png',
 *     revealText: '🎉 恭喜獲得 50 元折扣券！',
 *   });
 *   // ok === true 代表有刮到完成
 *   // ok === false 代表關閉 / 取消
 */
export function scratchCardDialog(options: any): Promise<boolean> {
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
        return h(ScratchCardDialog, {
          modelValue: (this as any).visible,
          'onUpdate:modelValue': (val: boolean) => {
            (this as any).visible = val;
            // 如果 dialog 被關掉（點遮罩 / 關閉按鈕），當作取消
            if (!val) {
              cancelAndClose();
            }
          },
          title: options.title,
          imageSrc: options.imageSrc,
          imageAlt: options.imageAlt,
          idleText: options.idleText,
          revealText: options.revealText,
          threshold: options.threshold,
          grade: options.grade,
          /** 後端回傳的 revealedNumber，兩張卡片動畫後展示 */
          revealedNumber: options.revealedNumber ?? null,
          // 刮到「完成」的事件
          onRevealed: () => {
            confirmAndClose();
          },

          // 按取消按鈕
          onCancel: () => {
            cancelAndClose();
          },
        });
      },
    });

    app.mount(container);
  });
}
