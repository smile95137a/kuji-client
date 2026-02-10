<template>
  <div class="home">
    <!-- 上方 Banner -->
    <BannerSwiper />

    <!-- 彈幕跑馬燈 -->
    <BulletMarquee
      class="home__marquee"
      :messages="marqueeMessages"
      :duration="25"
    />
    <HotTopicsSection />
    <!-- 直接放盲盒列表畫面 -->
    <BlindBoxListView />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BannerSwiper from '@/components/BannerSwiper.vue';
import BulletMarquee from '@/components/BulletMarquee.vue';
import HotTopicsSection from '@/components/HotTopicsSection.vue';
import BlindBoxListView from '@/components/BlindBoxListView.vue';

import { getActiveMarquees } from '@/services/marqueeService';

const marqueeMessages = ref<string[]>([
  '今日一番賞 A賞 剩餘 2 個',
  'B賞 皮卡丘玻璃杯補貨完成！',
  '每抽只要 NT$280，抽到賺到～',
  'Last One 賞 皮卡丘特別版公仔 還在等你',
]);

const loadMarquees = async () => {
  try {
    const res = await getActiveMarquees();
    if (res.success && Array.isArray(res.data)) {
      const messages = res.data
        .filter((m: any) => m?.content)
        .map((m: any) => String(m.content));
      if (messages.length > 0) {
        marqueeMessages.value = messages;
      }
    }
  } catch (e) {
    console.error('Home - loadMarquees error:', e);
    // 使用預設跑馬燈內容
  }
};

onMounted(() => {
  loadMarquees();
});
</script>

<style scoped lang="scss">
.home {
  &__marquee {
    margin-top: 8px;
  }
}
</style>
