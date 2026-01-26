// src/utils/dialog/gotchaDialog.ts
import { h, render } from 'vue';
import GotchaDialog from '@/components/common/GotchaDialog.vue';

type Pull = any;

export async function gotchaDialog(payload: {
  title?: string;
  pulls: Pull[];
  speed?: number;
}): Promise<Pull[] | null> {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const close = () => {
      render(null, el);
      el.remove();
    };

    const vnode = h(GotchaDialog, {
      ...payload,
      onFinish: (results: Pull[]) => {
        close();
        resolve(results);
      },
      onCancel: (_results: Pull[]) => {
        close();
        resolve(null);
      },
    });

    render(vnode, el);
  });
}
