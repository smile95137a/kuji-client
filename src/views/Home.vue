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
import BannerSwiper from '@/components/BannerSwiper.vue';
import BulletMarquee from '@/components/BulletMarquee.vue';
import HotTopicsSection from '@/components/HotTopicsSection.vue';
import BlindBoxListView from '@/components/BlindBoxListView.vue';

const marqueeMessages = [
  '今日一番賞 A賞 剩餘 2 個',
  'B賞 皮卡丘玻璃杯補貨完成！',
  '每抽只要 NT$280，抽到賺到～',
  'Last One 賞 皮卡丘特別版公仔 還在等你',
];
</script>

<style scoped lang="scss">
.home {
  &__marquee {
    margin-top: 8px;
  }
}
</style>
