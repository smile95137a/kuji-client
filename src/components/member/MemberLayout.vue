<!-- src/components/member/MemberLayout.vue - 會員中心佈局 -->
<template>
  <div class="memberLayout">
    <div class="memberLayout__container">
      <!-- 側邊欄 -->
      <MemberSidebar class="memberLayout__sidebar" />

      <!-- 主內容區 -->
      <main class="memberLayout__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import MemberSidebar from './MemberSidebar.vue';
</script>

<style scoped lang="scss">
.memberLayout {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32px 0 80px;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  &__sidebar {
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .memberLayout {
    padding: 16px 0 60px;

    &__container {
      flex-direction: column;
      padding: 0 16px;
    }
  }
}
</style>
