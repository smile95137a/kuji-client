// src/utils/dialog/kujiRevealStripDialog.ts
import { h } from 'vue';
import { createDialog } from './createDialog';
import KujiRevealStripDialog from '@/components/common/KujiRevealStripDialog.vue';

export interface KujiRevealStripResult<T = unknown> {
  confirmed: boolean;
  payload?: T[];
}

export interface KujiRevealStripOptions<T = unknown> {
  pulls: T[];
  slots?: {
    front?: () => any;
    result?: () => any;
  };
}

export function gachaTearDialog<T>(
  options: KujiRevealStripOptions<T>,
): Promise<KujiRevealStripResult<T>> {
  return new Promise((resolve) => {
    createDialog((close) =>
      h(
        KujiRevealStripDialog as any,
        {
          pulls: options.pulls,

          onFinish: (results: T[]) => {
            resolve({
              confirmed: true,
              payload: results,
            });
            close();
          },

          onCancel: (results: T[]) => {
            resolve({
              confirmed: false,
              payload: results,
            });
            close();
          },
        },
        options.slots,
      ),
    );
  });
}
