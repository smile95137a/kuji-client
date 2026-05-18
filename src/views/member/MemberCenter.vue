<!-- src/views/member/MemberCenter.vue -->
<template>
  <section class="memberCenter">
    <div class="memberCenter__container">
      <!-- 左側選單 -->
      <MemberSideMenu :active-name="String(route.name || '')" />

      <!-- 右側主內容卡片 -->
      <main class="memberCenter__main">
        <div class="memberCenter__card">
          <!-- 標題 + 錢包資訊 -->
          <header class="memberCenter__header">
            <h1 class="memberCenter__headline">會員中心</h1>
          </header>

          <div class="memberCenter__hr"></div>

          <!-- 子頁內容 -->
          <div class="memberCenter__content">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';

import MemberSideMenu from '@/components/member/MemberSideMenu.vue';
import GCoin from '@/assets/image/GCoin.png';
import RCoin from '@/assets/image/RCoin.png';

import { useMemberWalletStore } from '@/stores/memberWallet';

const route = useRoute();
const store = useMemberWalletStore();

/** 給子頁用（要用就 inject('memberMe')） */
provide('memberMe', store.me);

onMounted(async () => {
  await store.loadMe();
});
</script>
