// src/utils/dialog/ichibanForgotPasswordDialog.ts
import { h } from 'vue';
import { createDialog } from './createDialog';
import IchibanForgotPasswordDialog from '@/components/common/IchibanForgotPasswordDialog.vue';

export interface IchibanForgotPasswordOptions {
  title?: string;
  content?: string; //  v-html

  confirmText?: string; // default 送出
  cancelText?: string; // default 取消

  placeholder?: string;
  defaultEmail?: string;

  /**  直接 v-bind 用（不限制 data-*） */
  data?: Record<string, string | number | boolean | null | undefined>;

  showLogo?: boolean;
  showHeader?: boolean;

  hint?: string;
}

/**
 *  回傳：
 * - confirm => resolve(email)
 * - cancel  => resolve(null)
 */
export function ichibanForgotPasswordDialog(
  options: IchibanForgotPasswordOptions,
): Promise<string | null> {
  return new Promise((resolve) => {
    createDialog((close) =>
      h(IchibanForgotPasswordDialog, {
        title: options.title ?? '忘記密碼',
        content: options.content ?? undefined,

        confirmText: options.confirmText ?? '送出',
        cancelText: options.cancelText ?? '取消',

        placeholder: options.placeholder ?? undefined,
        defaultEmail: options.defaultEmail ?? '',

        data: options.data ?? {},
        showLogo: options.showLogo ?? true,
        showHeader: options.showHeader ?? true,

        hint: options.hint ?? undefined,

        onConfirm: (payload: { email: string }) => {
          resolve(payload.email);
          close();
        },
        onCancel: () => {
          resolve(null);
          close();
        },
      }),
    );
  });
}
