<!-- Dialog 測試頁面 -->
<template>
  <div class="dialog-test-page">
    <div class="dialog-test-page__header">
      <h1>Dialog 置中測試</h1>
      <p class="subtitle">測試所有 dialog 是否正確顯示在畫面正中央</p>
    </div>

    <div class="dialog-test-page__content">
      <!-- 高度撐開，製造滾動條 -->
      <div class="test-section">
        <h2>Ichiban 系列 Dialog</h2>
        <div class="button-grid">
          <button @click="testIchibanInfo" class="test-btn">
            測試 IchibanInfoDialog
          </button>
          <button @click="testIchibanConfirm" class="test-btn">
            測試 IchibanConfirmDialog
          </button>
          <button @click="testIchibanForgotPassword" class="test-btn">
            測試 IchibanForgotPasswordDialog
          </button>
        </div>
      </div>

      <div class="test-section">
        <h2>一般 Dialog</h2>
        <div class="button-grid">
          <button @click="testInfoDialog" class="test-btn">
            測試 InfoDialog
          </button>
          <button @click="testConfirmDialog" class="test-btn">
            測試 ConfirmDialog
          </button>
          <button @click="testDialog" class="test-btn">測試 Dialog</button>
        </div>
      </div>

      <div class="test-section">
        <h2>特殊 Dialog</h2>
        <div class="button-grid">
          <button @click="testGotchaDialog" class="test-btn">
            測試 GotchaDialog
          </button>
          <button @click="testScratchCardDialog" class="test-btn">
            測試 ScratchCardDialog
          </button>
          <button @click="testKujiRevealStripDialog" class="test-btn">
            測試 KujiRevealStripDialog
          </button>
          <button @click="testObjDialog" class="test-btn">
            測試 ObjDialog
          </button>
        </div>
      </div>

      <!-- 撐高頁面，製造滾動條 -->
      <div class="spacer">
        <p>⬇️ 請向下滾動，然後再次點擊按鈕測試 dialog 是否仍然置中 ⬇️</p>
      </div>

      <div class="test-section">
        <h2>滾動後測試</h2>
        <p>
          如果你看到這段文字，表示頁面已經滾動。<br />
          現在請點擊上方的按鈕，測試 dialog 是否仍然顯示在視窗正中央。
        </p>
        <div class="button-grid">
          <button @click="testIchibanInfo" class="test-btn test-btn--accent">
            再次測試 IchibanInfoDialog
          </button>
          <button @click="testIchibanConfirm" class="test-btn test-btn--accent">
            再次測試 IchibanConfirmDialog
          </button>
        </div>
      </div>

      <div class="spacer">
        <p>⬇️ 繼續向下滾動 ⬇️</p>
      </div>

      <div class="test-section">
        <h2>頁面底部測試</h2>
        <p>現在你在頁面底部，dialog 應該仍然顯示在視窗正中央。</p>
        <div class="button-grid">
          <button @click="testAll" class="test-btn test-btn--primary">
            🎯 測試所有 Dialog
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { ichibanConfirmDialog } from '@/utils/dialog/ichibanConfirmDialog';
import { ichibanForgotPasswordDialog } from '@/utils/dialog/ichibanForgotPasswordDialog';
import { infoDialog } from '@/utils/dialog/infoDialog';
import { confirmDialog } from '@/utils/dialog/confirmDialog';
import { objDialog } from '@/utils/dialog/objDialog';
import { useOverlayStore } from '@/stores/overlay';

const overlay = useOverlayStore();

// Ichiban 系列
const testIchibanInfo = async () => {
  overlay.open();
  await ichibanInfoDialog({
    title: '測試成功',
    content: '如果你能看到這個對話框在畫面正中央，<br>並且可以點擊按鈕，表示修正成功！✅',
  });
  overlay.close();
};

const testIchibanConfirm = async () => {
  overlay.open();
  const result = await ichibanConfirmDialog({
    title: '確認測試',
    content:
      '請確認你能看到這個對話框在畫面正中央，<br>並且可以點擊「確定」和「取消」按鈕。',
  });
  overlay.close();
  console.log('測試結果:', result);
};

const testIchibanForgotPassword = async () => {
  overlay.open();
  const result = await ichibanForgotPasswordDialog({
    title: '忘記密碼',
    content: '請輸入您的 Email',
    placeholder: 'your@email.com',
  });
  overlay.close();
  console.log('輸入的 Email:', result);
};

// 一般 Dialog
const testInfoDialog = async () => {
  await infoDialog({
    title: 'Info Dialog 測試',
    message: '這是一個簡單的資訊對話框。',
  });
};

const testConfirmDialog = async () => {
  const result = await confirmDialog({
    title: 'Confirm Dialog 測試',
    message: '你確定要執行這個操作嗎？',
  });
  console.log('Confirm 結果:', result);
};

const testDialog = async () => {
  await infoDialog({
    title: 'Dialog 測試',
    message: '這是標準 Dialog 組件的測試。',
  });
};

// 特殊 Dialog
const testGotchaDialog = async () => {
  alert('GotchaDialog 需要完整的抽獎數據，這裡僅測試結構。請在實際抽獎流程中測試。');
};

const testScratchCardDialog = async () => {
  alert('ScratchCardDialog 需要完整的刮刮樂數據，這裡僅測試結構。請在實際抽獎流程中測試。');
};

const testKujiRevealStripDialog = async () => {
  alert('KujiRevealStripDialog 需要完整的獎品數據，這裡僅測試結構。請在實際抽獎流程中測試。');
};

const testObjDialog = async () => {
  const result = await objDialog({
    title: 'ObjDialog 測試',
    data: {
      name: '測試物件',
      age: 25,
      active: true,
    },
  });
  console.log('ObjDialog 結果:', result);
};

// 測試所有
const testAll = async () => {
  const dialogs = [
    { name: 'IchibanInfoDialog', fn: testIchibanInfo },
    { name: 'IchibanConfirmDialog', fn: testIchibanConfirm },
    { name: 'InfoDialog', fn: testInfoDialog },
  ];

  for (const dialog of dialogs) {
    console.log(`測試 ${dialog.name}...`);
    await dialog.fn();
    await new Promise((r) => setTimeout(r, 300));
  }

  alert('✅ 所有 Dialog 測試完成！');
};
</script>

<style scoped lang="scss">
.dialog-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;

  &__header {
    text-align: center;
    color: #fff;
    margin-bottom: 40px;

    h1 {
      font-size: 48px;
      font-weight: 900;
      margin-bottom: 12px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }
  }

  &__content {
    max-width: 900px;
    margin: 0 auto;
  }
}

.test-section {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #333;
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: #666;
    margin-bottom: 16px;
  }
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.test-btn {
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &--accent {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
    }
  }

  &--primary {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
    font-size: 16px;
    padding: 18px 32px;

    &:hover {
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
    }
  }
}

.spacer {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;

  p {
    font-size: 20px;
    color: #fff;
    text-align: center;
    font-weight: 600;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

/* 響應式 */
@media (max-width: 768px) {
  .dialog-test-page__header h1 {
    font-size: 32px;
  }

  .test-section {
    padding: 20px;
  }

  .button-grid {
    grid-template-columns: 1fr;
  }
}
</style>
