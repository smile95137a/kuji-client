// src/utils/dialog/confirmDialog.ts
import { h } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { createDialog, DialogController } from './createDialog';
import type { DialogOptions as BaseDialogOptions } from './infoDialog';

export interface DialogOptions extends BaseDialogOptions {
  onCancel?: () => void | Promise<void>;
}

/**
 * ConfirmDialog：有「確定 / 取消」的非 async 版本
 */
export function openConfirmDialog(options: DialogOptions): DialogController {
  return createDialog((close) =>
    h(ConfirmDialog, {
      title: options.title,
      message: options.message,
      onConfirm: async () => {
        try {
          await options.onConfirm?.();
        } finally {
          close();
        }
      },
      onCancel: async () => {
        try {
          await options.onCancel?.();
        } finally {
          close();
        }
      },
      onClose: () => {
        // 背景點擊也當作取消
        options.onCancel?.();
        close();
      },
    }),
  );
}

/**
 *  await 版本：confirmDialog
 * 回傳 true = 確定
 * 回傳 false = 取消 / 關閉
 */
export function confirmDialog(options: DialogOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    openConfirmDialog({
      ...options,
      onConfirm: async () => {
        if (options.onConfirm) {
          await options.onConfirm();
        }
        resolve(true);
      },
      onCancel: async () => {
        if (options.onCancel) {
          await options.onCancel();
        }
        resolve(false);
      },
    });
  });
}
