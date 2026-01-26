// src/utils/dialog/infoDialog.ts
import { h } from 'vue';
import InfoDialog from '@/components/common/InfoDialog.vue';
import { createDialog, DialogController } from './createDialog';

export interface DialogOptions {
  title?: string;
  message?: string;
  onConfirm?: () => void | Promise<void>;
}

/**
 * 只有一顆「確定」的 InfoDialog（非 async 版本）
 */
export function openInfoDialog(options: DialogOptions): DialogController {
  return createDialog((close) =>
    h(InfoDialog, {
      title: options.title,
      message: options.message,
      onConfirm: async () => {
        try {
          await options.onConfirm?.();
        } finally {
          close();
        }
      },
      onClose: () => {
        // Info 類：背景點擊就單純關掉
        close();
      },
    })
  );
}

/**
 * ✅ await 版本：infoDialog
 * 使用方式：await infoDialog({ title, message })
 */
export function infoDialog(options: DialogOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    openInfoDialog({
      ...options,
      onConfirm: async () => {
        if (options.onConfirm) {
          await options.onConfirm();
        }
        resolve();
      },
    });
  });
}
