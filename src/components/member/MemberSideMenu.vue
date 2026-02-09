<template>
  <aside class="memberCenter__side">
    <nav class="memberCenter__menu">
      <button
        v-for="item in menu"
        :key="item.name"
        class="memberCenter__menuItem"
        :class="{ 'is-active': isActive(item) }"
        type="button"
        @click="go(item.name)"
      >
        <span class="memberCenter__menuIcon">
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
  name: string; // route name
  label: string;
  icon: [string, string]; // font-awesome icon tuple
  activeAliases?: string[]; // 例如 MemberProfile 也算 ProfileEdit active
};

const props = defineProps<{
  /** 目前 route.name（父層傳入 String(route.name||'')） */
  activeName: string;
}>();

const router = useRouter();

const menu = computed<MenuItem[]>(() => [
  {
    name: 'MemberProfile',
    label: '會員資料修改',
    icon: ['fas', 'user'],
    activeAliases: ['ProfileEdit'],
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
