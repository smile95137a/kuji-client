// src/utils/dialog/createDialog.ts
import { App, VNodeChild, createApp } from 'vue';

export interface DialogController {
  close: () => void;
}

/**
 * 建立一個暫時性的 Vue app，把 dialog 掛到 body 上
 * render(close) 裡面你自己決定要回傳什麼元件
 */
export function createDialog(
  render: (close: () => void) => VNodeChild
): DialogController {
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
    render: () => render(close),
  });

  app.mount(container);

  return { close };
}
