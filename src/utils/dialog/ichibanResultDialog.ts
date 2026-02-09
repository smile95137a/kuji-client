// src/utils/dialog/ichibanResultDialog.ts
import { h } from 'vue';
import { createDialog } from './createDialog';
import IchibanResultDialog from '@/components/common/IchibanResultDialog.vue';

export interface IchibanResultOptions {
  remain: number;
  count: number;
  totalPrice: number;
  items: any[];
}

export function ichibanResultDialog(
  options: IchibanResultOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    createDialog((close) =>
      h(IchibanResultDialog, {
        ...options,
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
