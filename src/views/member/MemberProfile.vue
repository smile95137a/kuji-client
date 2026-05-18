<!-- src/views/member/MemberProfile.vue -->
<template>
  <section class="memberProfile">
    <!-- 頂部會員主卡 -->
    <div class="memberProfile__hero">
      <div class="memberProfile__heroBg"></div>

      <div class="memberProfile__heroTop">
        <div>
          <p class="memberProfile__badge">MEMBER PROFILE</p>
          <h1 class="memberProfile__title">會員資料</h1>
          <p class="memberProfile__subtitle">
            查看會員資訊、錢包餘額與常用功能。
          </p>
        </div>

        <button class="memberProfile__editBtn" type="button" @click="goEdit">
          <font-awesome-icon :icon="['fas', 'pen']" />
          <span>編輯</span>
        </button>
      </div>

      <div class="memberProfile__userCard">
        <button class="memberProfile__avatarWrap" type="button" @click="goEdit">
          <img
            class="memberProfile__avatar"
            :src="user.avatarUrl || user.avatar || fallbackAvatar"
            alt="avatar"
          />
          <span class="memberProfile__avatarHint">
            <font-awesome-icon :icon="['fas', 'camera']" />
          </span>
        </button>

        <div class="memberProfile__userMain">
          <p class="memberProfile__memberLabel">會員資訊</p>

          <h2 class="memberProfile__name">
            {{ displayName || '-' }}
          </h2>

          <p v-if="user.nickname" class="memberProfile__nickname">
            暱稱 {{ user.nickname }}
          </p>

          <div class="memberProfile__levelPill">
            <font-awesome-icon :icon="['fas', 'crown']" />
            <span>{{ user.level || '一般會員' }}</span>
          </div>
        </div>
      </div>

      <!-- 錢包重點 -->
      <div class="memberProfile__walletPanel">
        <div class="memberProfile__walletItem memberProfile__walletItem--gold">
          <span class="memberProfile__walletIcon">
            <font-awesome-icon :icon="['fas', 'coins']" />
          </span>
          <div>
            <p class="memberProfile__walletLabel">金幣</p>
            <p class="memberProfile__walletValue">
              {{ user.goldCoins.toLocaleString() }}
            </p>
          </div>
        </div>

        <div class="memberProfile__walletDivider"></div>

        <div class="memberProfile__walletItem memberProfile__walletItem--bonus">
          <span class="memberProfile__walletIcon">
            <font-awesome-icon :icon="['fas', 'gem']" />
          </span>
          <div>
            <p class="memberProfile__walletLabel">紅利</p>
            <p class="memberProfile__walletValue">
              {{ user.bonusCoins.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷功能 -->
    <div class="memberProfile__section">
      <div class="memberProfile__sectionHead">
        <div>
          <p class="memberProfile__sectionKicker">QUICK ACTIONS</p>
          <h2 class="memberProfile__sectionTitle">快捷功能</h2>
        </div>
      </div>

      <div class="memberProfile__shortcutGrid">
        <button
          v-for="item in shortcutList"
          :key="item.name"
          class="memberProfile__shortcut"
          type="button"
          @click="goName(item.routeName)"
        >
          <span class="memberProfile__shortcutIcon">
            <font-awesome-icon :icon="item.icon" />
          </span>

          <span class="memberProfile__shortcutText">
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </span>

          <span class="memberProfile__shortcutArrow">
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </span>
        </button>
      </div>
    </div>

    <!-- 聯絡資訊 -->
    <div class="memberProfile__section">
      <div class="memberProfile__sectionHead">
        <div>
          <p class="memberProfile__sectionKicker">CONTACT INFO</p>
          <h2 class="memberProfile__sectionTitle">聯絡資訊</h2>
        </div>
      </div>

      <div class="memberProfile__infoList">
        <div class="memberProfile__infoRow">
          <span class="memberProfile__infoIcon">
            <font-awesome-icon :icon="['fas', 'envelope']" />
          </span>

          <div class="memberProfile__infoContent">
            <p class="memberProfile__infoKey">Email</p>
            <p class="memberProfile__infoValue">{{ user.email || '-' }}</p>
          </div>
        </div>

        <div class="memberProfile__infoRow">
          <span class="memberProfile__infoIcon">
            <font-awesome-icon :icon="['fas', 'phone']" />
          </span>

          <div class="memberProfile__infoContent">
            <p class="memberProfile__infoKey">手機</p>
            <p class="memberProfile__infoValue">{{ user.phone || '-' }}</p>
          </div>
        </div>

        <div class="memberProfile__infoRow">
          <span class="memberProfile__infoIcon">
            <font-awesome-icon :icon="['fab', 'line']" />
          </span>

          <div class="memberProfile__infoContent">
            <p class="memberProfile__infoKey">LINE ID</p>
            <p class="memberProfile__infoValue">{{ user.lineId || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 帳號資訊 -->
    <div class="memberProfile__section">
      <div class="memberProfile__sectionHead">
        <div>
          <p class="memberProfile__sectionKicker">ACCOUNT INFO</p>
          <h2 class="memberProfile__sectionTitle">帳號資訊</h2>
        </div>
      </div>

      <div class="memberProfile__accountGrid">
        <div class="memberProfile__accountCard">
          <p class="memberProfile__accountLabel">會員等級</p>
          <p class="memberProfile__accountValue">{{ user.level || '-' }}</p>
        </div>

        <div class="memberProfile__accountCard">
          <p class="memberProfile__accountLabel">註冊日期</p>
          <p class="memberProfile__accountValue">
            <DateFormatter
              v-if="user.createdAt"
              :date="user.createdAt"
              format="YYYY-MM-DD HH:mm:ss"
            />
            <span v-else>-</span>
          </p>
        </div>

        <div class="memberProfile__accountCard">
          <p class="memberProfile__accountLabel">最近登入</p>
          <p class="memberProfile__accountValue">
            <DateFormatter
              v-if="user.lastLoginAt"
              :date="user.lastLoginAt"
              format="YYYY-MM-DD HH:mm:ss"
            />
            <span v-else>-</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DateFormatter from '@/components/common/DateFormatter.vue';

import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { getMe } from '@/services/userService';
import { executeApi } from '@/utils/executeApiUtils';

const router = useRouter();

const fallbackAvatar =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="100%" height="100%" fill="#f4eee8"/>
    <circle cx="100" cy="78" r="38" fill="#cbb8aa"/>
    <rect x="38" y="126" width="124" height="58" rx="29" fill="#cbb8aa"/>
  </svg>
`);

const user = reactive({
  name: '',
  nickname: '',
  email: '',
  phone: '',
  lineId: '',
  recipientName: '',
  avatar: '',
  avatarUrl: '',
  level: '一般會員',
  goldCoins: 0,
  bonusCoins: 0,
  createdAt: '',
  lastLoginAt: '',
});

const shortcutList = [
  {
    name: 'deposit',
    title: '儲值',
    desc: '快速加值金幣',
    routeName: 'Deposit',
    icon: ['fas', 'coins'] as [string, string],
  },
  {
    name: 'depositHistory',
    title: '儲值紀錄',
    desc: '查看加值明細',
    routeName: 'DepositHistory',
    icon: ['fas', 'clock-rotate-left'] as [string, string],
  },
  {
    name: 'transactionHistory',
    title: '消費紀錄',
    desc: '查詢扣款紀錄',
    routeName: 'TransactionHistory',
    icon: ['fas', 'receipt'] as [string, string],
  },
  {
    name: 'notifications',
    title: '通知訊息',
    desc: '查看最新通知',
    routeName: 'MemberNotifications',
    icon: ['fas', 'bell'] as [string, string],
  },
  {
    name: 'orderHistory',
    title: '訂單記錄',
    desc: '追蹤商城訂單',
    routeName: 'OrderHistory',
    icon: ['fas', 'box'] as [string, string],
  },
  {
    name: 'prizeBox',
    title: '賞品盒',
    desc: '查看已獲得賞品',
    routeName: 'PrizeBox',
    icon: ['fas', 'gift'] as [string, string],
  },
];

const displayName = computed(
  () => user.nickname || user.recipientName || user.name || user.email || '',
);

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
  user.name = data?.recipientName ?? '';
  user.nickname = data?.nickname ?? '';
  user.email = data?.email ?? '';
  user.phone = data?.phoneNumber ?? '';
  user.lineId = data?.lineId ?? '';
  user.recipientName = data?.recipientName ?? '';

  user.avatar = data?.avatar ?? '';
  user.avatarUrl = data?.avatarUrl ?? data?.avatar ?? '';

  user.goldCoins = Number(data?.goldCoins ?? 0);
  user.bonusCoins = Number(data?.bonusCoins ?? 0);

  user.createdAt = data?.createdAt ?? '';
  user.lastLoginAt = data?.lastLoginAt ?? '';
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
  min-height: 100%;
  color: #201713;

  --primary: #b43325;
  --primary-dark: #8f261b;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --brown: #3f2412;
  --cream: #fff8ef;
  --cream-deep: #f5eadc;
  --card: #ffffff;
  --line: rgba(63, 36, 18, 0.1);
  --text: #201713;
  --text-soft: rgba(32, 23, 19, 0.58);

  &__hero {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    padding: 22px;
    margin-bottom: 18px;
    background:
      radial-gradient(
        circle at 12% 0%,
        rgba(255, 255, 255, 0.5),
        transparent 28%
      ),
      linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
    color: #fff;
    box-shadow: 0 18px 36px rgba(91, 37, 21, 0.16);
  }

  &__heroBg {
    position: absolute;
    right: -70px;
    top: -90px;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.13);
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      right: 50px;
      bottom: -70px;
      width: 150px;
      height: 150px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__heroTop {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
  }

  &__badge,
  &__sectionKicker,
  &__memberLabel {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    margin: 0 0 8px;

    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.3px;
  }

  &__badge {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  &__sectionKicker,
  &__memberLabel {
    background: var(--primary-soft);
    color: var(--primary);
  }

  &__title {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
    font-weight: 950;
    letter-spacing: 0.5px;
  }

  &__subtitle {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 14px;
    line-height: 1.6;
  }

  &__editBtn {
    position: relative;
    z-index: 1;
    min-width: 84px;
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    backdrop-filter: blur(12px);

    font-size: 13px;
    font-weight: 900;

    transition:
      transform 0.16s ease,
      background 0.16s ease;

    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.22);
    }
  }

  &__userCard {
    position: relative;
    z-index: 1;

    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 16px;
    align-items: center;

    margin-top: 22px;
    padding: 16px;
    border-radius: 22px;

    background: rgba(255, 255, 255, 0.9);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.52);
    box-shadow: 0 16px 28px rgba(52, 18, 8, 0.14);
  }

  &__avatarWrap {
    position: relative;
    width: 92px;
    height: 92px;
    padding: 0;
    border-radius: 26px;
    overflow: hidden;
    cursor: pointer;

    background: #fff;
    border: 3px solid #fff;
    box-shadow: 0 12px 22px rgba(58, 29, 16, 0.14);
  }

  &__avatar {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  &__avatarHint {
    position: absolute;
    right: 6px;
    bottom: 6px;

    width: 28px;
    height: 28px;
    border-radius: 999px;

    display: grid;
    place-items: center;

    background: var(--primary);
    color: #fff;
    border: 2px solid #fff;

    font-size: 12px;
  }

  &__userMain {
    min-width: 0;
  }

  &__name {
    margin: 0;
    color: var(--text);
    font-size: 24px;
    line-height: 1.25;
    font-weight: 950;
    word-break: break-word;
  }

  &__nickname {
    margin: 7px 0 0;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 800;
  }

  &__levelPill {
    display: inline-flex;
    align-items: center;
    gap: 7px;

    min-height: 30px;
    margin-top: 12px;
    padding: 0 12px;
    border-radius: 999px;

    background: var(--cream);
    color: var(--brown);
    border: 1px solid var(--line);

    font-size: 13px;
    font-weight: 900;

    svg {
      color: #d99b1d;
    }
  }

  &__walletPanel {
    position: relative;
    z-index: 1;

    display: grid;
    grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
    align-items: center;

    margin-top: 14px;
    padding: 14px;
    border-radius: 22px;

    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
  }

  &__walletItem {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  &__walletDivider {
    width: 1px;
    height: 44px;
    background: rgba(255, 255, 255, 0.24);
  }

  &__walletIcon {
    width: 44px;
    height: 44px;
    border-radius: 16px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: rgba(255, 255, 255, 0.2);
    color: #fff6d9;
    font-size: 18px;
  }

  &__walletLabel {
    margin: 0 0 4px;
    color: rgba(255, 255, 255, 0.74);
    font-size: 12px;
    font-weight: 900;
  }

  &__walletValue {
    margin: 0;
    color: #fff;
    font-size: 24px;
    line-height: 1.1;
    font-weight: 950;
    word-break: break-all;
  }

  &__section {
    border-radius: 24px;
    padding: 18px;
    margin-top: 16px;

    background: var(--card);
    border: 1px solid var(--line);
    box-shadow: 0 12px 28px rgba(53, 31, 18, 0.055);
  }

  &__sectionHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__sectionTitle {
    margin: 0;
    color: var(--text);
    font-size: 19px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__shortcutGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__shortcut {
    width: 100%;
    min-height: 82px;
    padding: 14px;
    border-radius: 18px;
    cursor: pointer;

    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 20px;
    align-items: center;
    gap: 12px;

    background: var(--cream);
    border: 1px solid rgba(180, 51, 37, 0.1);
    color: var(--text);
    text-align: left;

    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;

    &:hover {
      transform: translateY(-2px);
      background: #fff4e7;
      border-color: rgba(180, 51, 37, 0.22);
      box-shadow: 0 12px 22px rgba(67, 30, 14, 0.08);
    }
  }

  &__shortcutIcon {
    width: 44px;
    height: 44px;
    border-radius: 16px;

    display: grid;
    place-items: center;

    background: #fff;
    color: var(--primary);
    box-shadow: 0 8px 16px rgba(63, 36, 18, 0.06);

    font-size: 18px;
  }

  &__shortcutText {
    min-width: 0;

    strong {
      display: block;
      color: var(--text);
      font-size: 15px;
      line-height: 1.35;
      font-weight: 950;
    }

    small {
      display: block;
      margin-top: 3px;
      color: var(--text-soft);
      font-size: 12px;
      line-height: 1.35;
      font-weight: 700;
    }
  }

  &__shortcutArrow {
    color: rgba(32, 23, 19, 0.32);
    font-size: 12px;
  }

  &__infoList {
    display: grid;
    gap: 10px;
  }

  &__infoRow {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 12px;
    align-items: center;

    padding: 13px;
    border-radius: 18px;

    background: #fff;
    border: 1px solid var(--line);
  }

  &__infoIcon {
    width: 42px;
    height: 42px;
    border-radius: 15px;

    display: grid;
    place-items: center;

    background: var(--primary-soft);
    color: var(--primary);
  }

  &__infoContent {
    min-width: 0;
  }

  &__infoKey {
    margin: 0 0 4px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__infoValue {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.45;
    font-weight: 900;
    word-break: break-word;
  }

  &__accountGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  &__accountCard {
    min-height: 82px;
    padding: 15px;
    border-radius: 18px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);
  }

  &__accountLabel {
    margin: 0 0 8px;
    color: var(--text-soft);
    font-size: 12px;
    font-weight: 900;
  }

  &__accountValue {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    font-weight: 950;
    word-break: break-word;
  }

  @media (max-width: 900px) {
    &__accountGrid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    & {
      padding-bottom: 20px;
    }

    &__hero {
      border-radius: 0 0 28px 28px;
      margin: -16px -16px 18px;
      padding: 22px 16px 18px;
    }

    &__heroTop {
      align-items: stretch;
    }

    &__title {
      font-size: 25px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__editBtn {
      width: 42px;
      min-width: 42px;
      height: 42px;
      padding: 0;

      span {
        display: none;
      }
    }

    &__userCard {
      grid-template-columns: 76px minmax(0, 1fr);
      gap: 12px;
      padding: 13px;
      border-radius: 20px;
    }

    &__avatarWrap {
      width: 76px;
      height: 76px;
      border-radius: 22px;
    }

    &__avatarHint {
      width: 25px;
      height: 25px;
      font-size: 11px;
    }

    &__memberLabel {
      min-height: 22px;
      padding: 0 8px;
      font-size: 10px;
      margin-bottom: 6px;
    }

    &__name {
      font-size: 20px;
    }

    &__nickname {
      font-size: 12px;
    }

    &__levelPill {
      min-height: 28px;
      margin-top: 9px;
      padding: 0 10px;
      font-size: 12px;
    }

    &__walletPanel {
      padding: 12px;
      gap: 10px;
    }

    &__walletItem {
      gap: 9px;
    }

    &__walletIcon {
      width: 38px;
      height: 38px;
      border-radius: 14px;
      font-size: 15px;
    }

    &__walletLabel {
      font-size: 11px;
    }

    &__walletValue {
      font-size: 20px;
    }

    &__section {
      border-radius: 22px;
      padding: 15px;
      margin-top: 14px;
    }

    &__sectionTitle {
      font-size: 18px;
    }

    &__shortcutGrid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    &__shortcut {
      min-height: 76px;
      padding: 13px;
      border-radius: 18px;
      grid-template-columns: 46px minmax(0, 1fr) 18px;
    }

    &__shortcutIcon {
      width: 46px;
      height: 46px;
      border-radius: 17px;
      font-size: 18px;
    }

    &__shortcutText {
      strong {
        font-size: 15px;
      }

      small {
        font-size: 12px;
      }
    }

    &__infoRow {
      grid-template-columns: 40px minmax(0, 1fr);
      padding: 12px;
      border-radius: 17px;
    }

    &__infoIcon {
      width: 40px;
      height: 40px;
      border-radius: 15px;
    }

    &__accountGrid {
      gap: 10px;
    }

    &__accountCard {
      min-height: unset;
      padding: 14px;
      border-radius: 17px;
    }
  }
}
</style>
