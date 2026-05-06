<template>
  <div class="home">
    <BulletMarquee
      class="home__marquee"
      :items="marqueeItems"
      :speed="80"
    />
    <BannerSwiper />
    <OfficialIchibanView />
    <!-- 彈幕跑馬燈 -->
    <HotTopicsSection />
    <!-- 直接放盲盒列表畫面 -->
    <GachaView />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BannerSwiper from '@/components/BannerSwiper.vue';
import BulletMarquee from '@/components/BulletMarquee.vue';
import HotTopicsSection from '@/components/HotTopicsSection.vue';
import GachaView from '@/components/GachaView.vue';
import OfficialIchibanView from '@/components/OfficialIchibanView.vue';
import { getActiveMarquees } from '@/services/marqueeService';
import type { MarqueeItem } from '@/components/BulletMarquee.vue';

const marqueeItems = ref<MarqueeItem[]>([]);

onMounted(async () => {
  try {
    const res = await getActiveMarquees();
    if (res?.success && Array.isArray(res.data)) {
      marqueeItems.value = res.data.map((m: any) => ({
        content: m.content ?? '',
        bgColor: m.bgColor ?? null,
        textColor: m.textColor ?? null,
      }));
    }
  } catch {
    // 載入失敗時保持空陣列，不顯示跑馬燈
  }
});
</script>

<style scoped lang="scss">
.home {
  &__marquee {
    margin-top: 8px;
  }
}
</style>
