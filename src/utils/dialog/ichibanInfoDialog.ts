// src/utils/dialog/ichibanInfoDialog.ts
import { h } from 'vue';
import { createDialog } from './createDialog';
import IchibanInfoDialog from '@/components/common/IchibanInfoDialog.vue';

export interface IchibanInfoOptions {
  title?: string;
  content?: string;
  confirmText?: string;
  data?: Record<string, string | number | boolean | null | undefined>;
  showLogo?: boolean;
  showHeader?: boolean;
}

export function ichibanInfoDialog(
  options: IchibanInfoOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    const resolvedOptions: IchibanInfoOptions = {
      confirmText: '確定',
      showLogo: true,
      showHeader: true,
      ...options,
    };

    createDialog((close) =>
      h(IchibanInfoDialog, {
        ...resolvedOptions,
        onConfirm: () => {
          resolve(true);
          close();
        },
      })
    );
  });
}
