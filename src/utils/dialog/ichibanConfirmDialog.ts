import { h } from 'vue';
import { createDialog } from './createDialog';
import IchibanConfirmDialog from '@/components/common/IchibanConfirmDialog.vue';

export interface IchibanConfirmOptions {
  title?: string;
  content?: string; //  v-html

  confirmText?: string; //  default 確定
  cancelText?: string; //  default 取消

  /**  直接 v-bind 用（不限制 data-*） */
  data?: Record<string, string | number | boolean | null | undefined>;

  showLogo?: boolean;
  showHeader?: boolean;
}

export function ichibanConfirmDialog(
  options: IchibanConfirmOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    createDialog((close) =>
      h(IchibanConfirmDialog, {
        title: options.title,
        content: options.content,

        confirmText: options.confirmText ?? '確定',
        cancelText: options.cancelText ?? '取消',

        data: options.data ?? {},
        showLogo: options.showLogo ?? true,
        showHeader: options.showHeader ?? true,

        onConfirm: () => {
          resolve(true);
          close();
        },
        onCancel: () => {
          resolve(false);
          close();
        },
      }),
    );
  });
}
