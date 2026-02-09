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
            <span v-if="user.nickname" class="memberProfile__nickname">
              （{{ user.nickname }}）
            </span>
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

      <!-- 其他資訊 -->
      <div class="memberProfile__grid">
        <div class="memberProfile__info">
          <p class="memberProfile__k">會員等級</p>
          <p class="memberProfile__v">{{ user.level || '-' }}</p>
        </div>

        <div class="memberProfile__info">
          <p class="memberProfile__k">金幣</p>
          <p class="memberProfile__v">{{ user.goldCoins.toLocaleString() }}</p>
        </div>

        <div class="memberProfile__info">
          <p class="memberProfile__k">紅利</p>
          <p class="memberProfile__v">{{ user.bonusCoins.toLocaleString() }}</p>
        </div>

        <div class="memberProfile__info">
          <p class="memberProfile__k">註冊日期</p>
          <p class="memberProfile__v">
            <DateFormatter
              v-if="user.createdAt"
              :date="user.createdAt"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </p>
        </div>

        <div class="memberProfile__info">
          <p class="memberProfile__k">最近登入</p>
          <p class="memberProfile__v">
            <DateFormatter
              v-if="user.lastLoginAt"
              :date="user.lastLoginAt"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </p>
        </div>
      </div>
    </div>

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

        <button
          class="memberProfile__shortcut"
          type="button"
          @click="goName('PrizeBox')"
        >
          賞品盒
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DateFormatter from '@/components/common/DateFormatter.vue';

import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { getMe } from '@/services/userService';
import { executeApi } from '@/utils/executeApiUtils';

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
  name: '',
  nickname: '',
  email: '',
  phone: '',
  lineId: '',
  avatarUrl: '',
  level: '一般會員',
  goldCoins: 0,
  bonusCoins: 0,
  createdAt: '',
  lastLoginAt: '',
});

const normalizeDate = (val: any) => {
  if (!val) return '';
  const d = typeof val === 'number' ? new Date(val) : new Date(String(val));
  if (Number.isNaN(d.getTime())) return String(val);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

type MeDto = {
  id?: string;
  email?: string;
  nickname?: string;
  phoneNumber?: string;
  lineId?: string;
  recipientName?: string;
  goldCoins?: number;
  bonusCoins?: number;
  avatar?: string;
  avatarUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

const applyMeToUser = (data: MeDto) => {
  // 你的回傳沒有 name，我這裡用 recipientName 當作顯示名稱（你要改成 nickname/別的也可）
  user.name = data?.recipientName ?? '';
  user.nickname = data?.nickname ?? '';
  user.email = data?.email ?? '';
  user.phone = data?.phoneNumber ?? '';
  user.lineId = data?.lineId ?? '';

  user.avatarUrl = data?.avatarUrl ?? data?.avatar ?? '';

  user.goldCoins = Number(data?.goldCoins ?? 0);
  user.bonusCoins = Number(data?.bonusCoins ?? 0);

  user.createdAt = data?.createdAt;
  user.lastLoginAt = data?.lastLoginAt;
};

const loadMe = async () => {
  await executeApi<MeDto>({
    fn: () => getMe(),
    showCatchDialog: true,
    showFailDialog: true,
    showSuccessDialog: false,
    errorTitle: '讀取失敗',
    errorMessage: '無法取得會員資料，請稍後再試。',
    onSuccess: (data) => {
      applyMeToUser(data || {});
    },
  });
};

onMounted(loadMe);

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
