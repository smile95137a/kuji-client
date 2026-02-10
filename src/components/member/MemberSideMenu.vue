<template>
  <aside class="memberCenter__side" aria-label="會員中心選單">
    <nav class="memberCenter__menu" role="tablist">
      <button
        v-for="item in menu"
        :key="item.name"
        class="memberCenter__menuItem"
        :class="{ 'is-active': isActive(item) }"
        type="button"
        role="tab"
        :aria-selected="isActive(item)"
        @click="go(item.name)"
      >
        <span class="memberCenter__menuIcon" aria-hidden="true">
          <font-awesome-icon :icon="item.icon" />
        </span>
        <span class="memberCenter__menuText">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

type MenuItem = {
  name: string;
  label: string;
  icon: [string, string];
  activeAliases?: string[];
};

const props = defineProps<{ activeName: string }>();
const router = useRouter();

const menu = computed<MenuItem[]>(() => [
  {
    name: 'MemberProfile',
    label: '會員資料修改',
    icon: ['fas', 'user'],
    activeAliases: ['ProfileEdit'],
  },
  {
    name: 'OrderHistory',
    label: '訂單紀錄',
    icon: ['fas', 'file-invoice'],
    activeAliases: ['OrderDetail'],
  },
  {
    name: 'TransactionHistory',
    label: '消費紀錄',
    icon: ['fas', 'credit-card'],
  },
  { name: 'DepositHistory', label: '儲值紀錄', icon: ['fas', 'receipt'] },
  { name: 'Deposit', label: '儲值', icon: ['fas', 'circle-plus'] },
  { name: 'PrizeBox', label: '獎品盒', icon: ['fas', 'gift'] },
  { name: 'MemberNotifications', label: '通知', icon: ['fas', 'bell'] },
]);

const isActive = (item: MenuItem) => {
  if (props.activeName === item.name) return true;
  if (item.activeAliases?.includes(props.activeName)) return true;
  return false;
};

const go = (name: string) => {
  router.push({ name });
};
</script>
