<!-- src/components/member/MemberSidebar.vue - 會員中心側邊欄導航 -->
<template>
  <aside class="memberSidebar">
    <!-- 使用者資訊 -->
    <div class="memberSidebar__profile">
      <div class="memberSidebar__avatar">
        <img :src="user.avatarUrl || fallbackAvatar" alt="avatar" />
      </div>
      <div class="memberSidebar__info">
        <p class="memberSidebar__name">{{ user.nickname || '會員' }}</p>
        <p class="memberSidebar__email">{{ user.email }}</p>
      </div>
    </div>

    <!-- 餘額顯示 -->
    <div class="memberSidebar__balance">
      <div class="memberSidebar__balanceItem">
        <span class="memberSidebar__balanceLabel">錢包餘額</span>
        <span class="memberSidebar__balanceValue">
          NT$ {{ wallet.balance.toLocaleString() }}
        </span>
      </div>
      <div class="memberSidebar__balanceItem">
        <span class="memberSidebar__balanceLabel">紅利點數</span>
        <span class="memberSidebar__balanceValue memberSidebar__balanceValue--bonus">
          {{ wallet.bonus.toLocaleString() }} 點
        </span>
      </div>
    </div>

    <!-- 導航選單 -->
    <nav class="memberSidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="memberSidebar__navItem"
        :class="{ 'is-active': currentRoute === item.name }"
      >
        <font-awesome-icon :icon="item.icon" class="memberSidebar__navIcon" />
        <span class="memberSidebar__navText">{{ item.label }}</span>
        <span v-if="item.badge" class="memberSidebar__navBadge">{{ item.badge }}</span>
      </RouterLink>
    </nav>

    <!-- 登出按鈕 -->
    <button class="memberSidebar__logout" type="button" @click="handleLogout">
      <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
      <span>登出</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMyWallet } from '@/services/walletService';
import { ichibanConfirmDialog } from '@/utils/dialog/ichibanConfirmDialog';
import { useOverlayStore } from '@/stores/overlay';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const overlay = useOverlayStore();

const fallbackAvatar =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <circle cx="40" cy="32" r="14" fill="#ccc"/>
    <rect x="15" y="50" width="50" height="22" rx="11" fill="#ccc"/>
  </svg>
`);

const user = computed(() => authStore.user || { nickname: '', email: '', avatarUrl: '' });
const currentRoute = computed(() => route.name);

const wallet = ref({ balance: 0, bonus: 0 });

type NavItem = {
  name: string;
  label: string;
  icon: string[];
  badge?: number;
};

const navItems: NavItem[] = [
  { name: 'MemberProfile', label: '會員資料', icon: ['fas', 'user'] },
  { name: 'PrizeBox', label: '賞品盒', icon: ['fas', 'gift'] },
  { name: 'OrderList', label: '我的訂單', icon: ['fas', 'box'] },
  { name: 'Deposit', label: '儲值', icon: ['fas', 'credit-card'] },
  { name: 'DepositHistory', label: '儲值紀錄', icon: ['fas', 'receipt'] },
  { name: 'TransactionHistory', label: '消費紀錄', icon: ['fas', 'list'] },
  { name: 'AddressBook', label: '收件地址', icon: ['fas', 'location-dot'] },
  { name: 'MemberNotifications', label: '通知訊息', icon: ['fas', 'bell'] },
];

const loadWallet = async () => {
  try {
    const res = await getMyWallet();
    if (res.success && res.data) {
      wallet.value = {
        balance: Number(res.data.goldCoins ?? 0),
        bonus: Number(res.data.bonusCoins ?? 0),
      };
    }
  } catch (e) {
    console.error('MemberSidebar - loadWallet error:', e);
  }
};

const handleLogout = async () => {
  overlay.open();
  const confirmed = await ichibanConfirmDialog({
    title: '確認登出',
    content: '確定要登出嗎？',
    confirmText: '確認登出',
    cancelText: '取消',
  });
  overlay.close();

  if (confirmed) {
    authStore.logout();
    router.push({ name: 'Home' });
  }
};

onMounted(() => {
  loadWallet();
});
</script>

<style scoped lang="scss">
.memberSidebar {
  width: 260px;
  background: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  height: fit-content;
  position: sticky;
  top: 100px;

  &__profile {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__email {
    font-size: 12px;
    color: #999;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__balance {
    background: linear-gradient(135deg, #fff5eb, #fef8f3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__balanceItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__balanceLabel {
    font-size: 13px;
    color: #666;
  }

  &__balanceValue {
    font-size: 15px;
    font-weight: 700;
    color: #e65100;

    &--bonus {
      color: #2e7d32;
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__navItem {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    text-decoration: none;
    color: #555;
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      color: #333;
    }

    &.is-active {
      background: linear-gradient(135deg, #ff9800, #ff5722);
      color: #fff;

      .memberSidebar__navIcon {
        color: #fff;
      }
    }
  }

  &__navIcon {
    width: 18px;
    color: #999;
    flex-shrink: 0;
  }

  &__navText {
    flex: 1;
  }

  &__navBadge {
    background: #e53935;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }

  &__logout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: transparent;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #e53935;
      color: #e53935;
      background: #fff5f5;
    }
  }
}

@media (max-width: 768px) {
  .memberSidebar {
    width: 100%;
    position: relative;
    top: 0;
  }
}
</style>
