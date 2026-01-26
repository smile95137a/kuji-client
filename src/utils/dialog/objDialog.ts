// src/utils/dialog/objDialog.ts
import { App, createApp, h } from 'vue';
import ObjDialog from '@/components/common/ObjDialog.vue';

export interface ObjDialogOptions<T = any> {
  title?: string;
  data: T;
}

/**
 * ✅ await 版本的 ObjDialog
 * 使用方式：
 *   const result = await objDialog({ title: '編輯', data: obj });
 *   // result = 編輯後的物件；如果按取消 / 關閉 → null
 */
export function objDialog<T extends Record<string, any>>(
  options: ObjDialogOptions<T>
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    let app: App<Element> | null = null;

    const close = () => {
      if (app) {
        app.unmount();
        app = null;
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    app = createApp({
      data() {
        return {
          visible: true,
        };
      },
      render() {
        return h(ObjDialog, {
          modelValue: (this as any).visible,
          'onUpdate:modelValue': (val: boolean) => {
            (this as any).visible = val;
            // 如果是被關掉但沒走 confirm / cancel，就當作取消
            if (!val) {
              resolve(null);
              close();
            }
          },
          title: options.title,
          data: options.data,
          onConfirm: (newObj: T) => {
            resolve(newObj);
            close();
          },
          onCancel: () => {
            resolve(null);
            close();
          },
        });
      },
    });

    app.mount(container);
  });
}
