<!-- src/views/member/MemberProfile.vue -->
<template>
  <section class="memberProfile">
    <header class="memberProfile__header">
      <h1 class="memberProfile__title">會員資料</h1>
      <p class="memberProfile__subtitle">查看與管理你的個人資訊</p>
    </header>

    <!-- 主要資訊 -->
    <div class="memberProfile__card">
      <div class="memberProfile__top">
        <div class="memberProfile__avatarWrap" @click="goEdit">
          <img
            class="memberProfile__avatar"
            :src="user.avatarUrl || fallbackAvatar"
            alt="avatar"
          />
          <span class="memberProfile__avatarHint">點我編輯</span>
        </div>

        <div class="memberProfile__meta">
          <p class="memberProfile__name">
            {{ user.name || '-' }}
            <span v-if="user.nickname" class="memberProfile__nickname"
              >（{{ user.nickname }}）</span
            >
          </p>
          <p class="memberProfile__line">Email：{{ user.email || '-' }}</p>
          <p class="memberProfile__line">手機：{{ user.phone || '-' }}</p>
          <p class="memberProfile__line">LINE ID：{{ user.lineId || '-' }}</p>
        </div>

        <div class="memberProfile__actions">
          <button class="memberProfile__btn" type="button" @click="goEdit">
            編輯資料
          </button>
        </div>
      </div>

      <div class="memberProfile__divider"></div>

      <!-- 其他資訊（你可以自由擴充） -->
      <div class="memberProfile__grid">
        <div class="memberProfile__info">
          <p class="memberProfile__k">會員等級</p>
          <p class="memberProfile__v">{{ user.level }}</p>
        </div>
        <div class="memberProfile__info">
          <p class="memberProfile__k">錢包餘額</p>
          <p class="memberProfile__v">
            NT$ {{ user.balance.toLocaleString() }}
          </p>
        </div>
        <div class="memberProfile__info">
          <p class="memberProfile__k">註冊日期</p>
          <p class="memberProfile__v">{{ user.createdAt }}</p>
        </div>
        <div class="memberProfile__info">
          <p class="memberProfile__k">最近登入</p>
          <p class="memberProfile__v">{{ user.lastLoginAt }}</p>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <!-- 快捷入口 -->
    <div class="memberProfile__card">
      <p class="memberProfile__sectionTitle">快捷功能</p>

      <div class="memberProfile__shortcutGrid">
        <button
          class="memberProfile__shortcut"
          type="button"
          @click="goName('Deposit')"
        >
          儲值
        </button>

        <button
          class="memberProfile__shortcut"
          type="button"
          @click="goName('DepositHistory')"
        >
          儲值紀錄
        </button>

        <button
          class="memberProfile__shortcut"
          type="button"
          @click="goName('TransactionHistory')"
        >
          消費紀錄
        </button>

        <button
          class="memberProfile__shortcut"
          type="button"
          @click="goName('MemberNotifications')"
        >
          通知訊息
        </button>

        <!-- ✅ 新增：賞品盒 -->
        <button
          class="memberProfile__shortcut"
          type="button"
          @click="goName('PrizeBox')"
        >
          賞品盒
        </button>
      </div>

      <p class="memberProfile__tip">
        ※ 這裡先用假資料，你接 profile API 後把 user 換掉即可
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const fallbackAvatar =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="100%" height="100%" fill="#eee"/>
    <circle cx="100" cy="80" r="38" fill="#bbb"/>
    <rect x="38" y="128" width="124" height="56" rx="28" fill="#bbb"/>
  </svg>
`);

const user = reactive({
  name: '王小明',
  nickname: 'KujiMaster',
  email: 'demo@kuji.com',
  phone: '0912-345-678',
  lineId: 'kuji_demo',
  avatarUrl: '',
  level: '一般會員',
  balance: 1280,
  createdAt: '2025-11-01',
  lastLoginAt: '2026-01-12',
});

const goEdit = () => {
  router.push({ name: 'ProfileEdit' });
};

const goName = (name: string) => {
  router.push({ name });
};
</script>

<style scoped lang="scss">
.memberProfile {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 16px;
  }
  &__title {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 6px;
  }
  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
    margin-top: 12px;
  }

  &__top {
    display: grid;
    grid-template-columns: 110px 1fr auto;
    gap: 14px;
    align-items: center;

    @media (max-width: 720px) {
      grid-template-columns: 96px 1fr;
      grid-template-areas:
        'avatar meta'
        'actions actions';
    }
  }

  &__avatarWrap {
    width: 96px;
    height: 96px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
    position: relative;

    @media (max-width: 720px) {
      grid-area: avatar;
    }
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__avatarHint {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    white-space: nowrap;
  }

  &__meta {
    @media (max-width: 720px) {
      grid-area: meta;
    }
  }

  &__name {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 900;
  }

  &__nickname {
    font-weight: 800;
    opacity: 0.75;
    margin-left: 6px;
    font-size: 14px;
  }

  &__line {
    margin: 2px 0;
    opacity: 0.8;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    @media (max-width: 720px) {
      grid-area: actions;
      justify-content: stretch;
    }
  }

  &__btn {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
    background: #111;
    color: #fff;

    @media (max-width: 720px) {
      width: 100%;
    }
  }

  &__divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 14px 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 820px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 520px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__info {
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 12px;
    padding: 12px;
  }

  &__k {
    margin: 0 0 6px;
    font-size: 12px;
    opacity: 0.7;
  }

  &__v {
    margin: 0;
    font-weight: 900;
  }

  &__sectionTitle {
    margin: 0 0 10px;
    font-weight: 900;
  }

  &__shortcutGrid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;

    @media (max-width: 820px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 520px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__shortcut {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 12px 10px;
    background: #fff;
    cursor: pointer;
    font-weight: 900;
  }

  &__tip {
    margin: 10px 0 0;
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
  }
}
</style>
