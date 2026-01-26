<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <h1 class="home__title">Dialog Demo（await 版本）</h1>

      <button class="home__btn" type="button" @click="handleDelete">
      刪除資料（跳 ConfirmDialog）
    </button>

    <p class="home__result" v-if="lastResult !== null">
      上一次操作結果：
      <strong>{{
        lastResult ? '使用者按了「確定」' : '使用者按了「取消 / 關閉」'
      }}
      </strong>
    </p>

    <hr class="home__divider" />

    <h2 class="home__subtitle">ObjDialog Demo</h2>

    <div class="home__section">
      <p class="home__text">目前 user：</p>
      <pre class="home__json">{{ JSON.stringify(user, null, 2) }}</pre>

      <button class="home__btn" type="button" @click="handleEditUser">
        編輯 user（跳 ObjDialog）
      </button>

      <p class="home__result" v-if="lastUserResult !== null">
        ObjDialog 回傳結果：
        <pre class="home__json">
{{ JSON.stringify(lastUserResult, null, 2) }}
        </pre>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { confirmDialog, infoDialog, objDialog } from '@/utils/dialogService';

const lastResult = ref<boolean | null>(null);

// ---- 刪除 demo（你原本的） ----
const handleDelete = async () => {
  console.log('[handleDelete] 使用者點擊了「刪除資料」按鈕');

  const ok = await confirmDialog({
    title: '刪除確認',
    message: '確定要刪除這筆資料嗎？',
  });

  console.log('[handleDelete] confirmDialog 回傳結果 ok =', ok);
  lastResult.value = ok;

  if (!ok) {
    console.log('[handleDelete] 使用者取消刪除或關閉對話框');

    await infoDialog({
      title: '已取消',
      message: '您已取消刪除操作。',
    });

    console.log('[handleDelete] 已顯示「已取消」 infoDialog');
    return;
  }

  console.log('[handleDelete] 使用者按了「確定」，準備呼叫 fakeDeleteApi');

  await fakeDeleteApi();

  console.log('[handleDelete] fakeDeleteApi 執行完成');

  await infoDialog({
    title: '刪除成功',
    message: '資料已成功刪除。',
  });

  console.log('[handleDelete] 已顯示「刪除成功」 infoDialog');
};

const fakeDeleteApi = () =>
  new Promise<void>((resolve) => {
    console.log('[fakeDeleteApi] 模擬刪除 API 開始...');
    setTimeout(() => {
      console.log('[fakeDeleteApi] 模擬刪除 API 完成');
      resolve();
    }, 800);
  });

// ---- ObjDialog demo ----
const user = ref({
  id: 1,
  name: '小明',
  email: 'test@example.com',
  isActive: true,
});

const lastUserResult = ref<any | null>(null);

const handleEditUser = async () => {
  console.log('[handleEditUser] 開始，現在 user =', user.value);

  const result = await objDialog({
    title: '編輯使用者資料',
    data: user.value,
  });

  console.log('[handleEditUser] objDialog 回傳 =', result);

  if (result) {
    user.value = result;
    lastUserResult.value = result;
  } else {
    lastUserResult.value = null;
  }
};
</script>

<style scoped lang="scss">
.home {
  padding: 40px 24px;

  &__title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  &__subtitle {
    font-size: 18px;
    font-weight: 600;
    margin: 24px 0 8px;
  }

  &__btn {
    padding: 8px 20px;
    border-radius: 999px;
    border: 1px solid #111;
    background-color: #111;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }

  &__result {
    margin-top: 16px;
    font-size: 14px;
  }

  &__divider {
    margin: 24px 0;
    border: none;
    border-top: 1px solid #e5e5e5;
  }

  &__section {
    margin-top: 8px;
  }

  &__text {
    font-size: 14px;
    margin-bottom: 4px;
  }

  &__json {
    margin: 4px 0 12px;
    padding: 8px 10px;
    background: #f5f5f5;
    border-radius: 4px;
    font-size: 12px;
    white-space: pre-wrap;
  }
}
</style>
