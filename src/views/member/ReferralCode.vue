<template>
  <section class="referralPage">
    <header class="referralPage__header">
      <h1 class="referralPage__title">推薦碼</h1>
      <p class="referralPage__subtitle">邀請好友一起玩，雙方都有紅利獎勵</p>
    </header>

    <div class="referralPage__body">
      <MyReferralCodeCard />
      <ApplyReferralSection />
    </div>
  </section>
</template>

<script setup lang="ts">
import MyReferralCodeCard from '@/components/member/MyReferralCodeCard.vue';
import ApplyReferralSection from '@/components/member/ApplyReferralSection.vue';
</script>

<style scoped>
.referralPage {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 16px;
  max-width: 480px;
  margin: 0 auto;
}

.referralPage__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.referralPage__title {
  font-size: 1.375rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.referralPage__subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.referralPage__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
