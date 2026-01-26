import { h } from 'vue';
import { createDialog } from './createDialog';
import IchibanResultCardDialog from '@/components/common/IchibanResultCardDialog.vue';

/**
 * 單次抽卡結果 Dialog 參數
 */
export interface IchibanResultCardDialogOptions {
  /** 剩餘抽數 */
  remain: number;

  /** 本次抽卡數量（例如 1 / 10） */
  count: number;

  /** 本次總金額 */
  totalPrice: number;

  /** 抽到的獎品列表 */
  items: {
    id: string;
    name: string;
    image: string;
  }[];
}

/**
 * Ichiban 抽卡結果 Dialog
 *
 * @example
 * const again = await ichibanResultCardDialog({
 *   remain: 42,
 *   count: 10,
 *   totalPrice: 1500,
 *   items: resultItems,
 * });
 *
 * if (again) {
 *   // 再抽一次
 * }
 */
export function ichibanResultCardDialog(
  options: IchibanResultCardDialogOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    createDialog((close) =>
      h(IchibanResultCardDialog, {
        ...options,

        /** 再抽一次 */
        onConfirm: () => {
          resolve(true);
          close();
        },

        /** 關閉 / 取消 */
        onCancel: () => {
          resolve(false);
          close();
        },
      })
    );
  });
}
