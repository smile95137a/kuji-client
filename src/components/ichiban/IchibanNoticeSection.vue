<!-- src/components/ichiban/IchibanNoticeSection.vue -->
<template>
  <section class="ichibanNotice">
    <div class="ichibanNotice__inner">
      <!-- 左：現貨在倉 ＋ 注意事項 -->
      <div class="ichibanNotice__col ichibanNotice__col--left">
        <h3
          class="ichibanNotice__sectionTitle ichibanNotice__sectionTitle--main"
        >
          現貨在倉：
        </h3>
        <p class="ichibanNotice__sectionSubtitle">
          多抽優惠（限定帶抽）才會送：
        </p>
        <ul class="ichibanNotice__list">
          <li class="ichibanNotice__listItem">・一次3抽 送 紅利 60</li>
          <li class="ichibanNotice__listItem">・一次5抽 送 紅利 120</li>
          <li class="ichibanNotice__listItem">・一次8抽 送 紅利 180</li>
          <li class="ichibanNotice__listItem">・一次10抽 送 紅利 240</li>
        </ul>

        <h4
          class="ichibanNotice__sectionTitle ichibanNotice__sectionTitle--sub"
        >
          注意事項：
        </h4>
        <p class="ichibanNotice__paragraph">
          單抽開獎保護300秒，一次多抽 300秒＋(30秒×抽數)會累計， 保護上限600秒。
        </p>
      </div>

      <!-- 中：下單前須知 -->
      <div class="ichibanNotice__col ichibanNotice__col--mid">
        <h3
          class="ichibanNotice__sectionTitle ichibanNotice__sectionTitle--main"
        >
          下單前須知：
        </h3>
        <p class="ichibanNotice__paragraph">
          一番賞、盲盒商品為「線上機率型」商品，一但完成抽獎程序，恕無法接受「退貨及退款」！除非有品質瑕疵，「收到商品未拆封請全程錄影以保護雙方權益」。
        </p>
        <p class="ichibanNotice__paragraph">
          商品運送及海關檢驗時可能有盒損、原廠二次膠拆檢等狀況。
          若您對於盒況有相當高的要求，建議您不要購買！消費者購買前請「務必」確認我們的消費規範再進行購買，謝謝！
        </p>
      </div>

      <!-- 右：LOGO ＋ LINE 按鈕 -->
      <div class="ichibanNotice__col ichibanNotice__col--right">
        <div class="ichibanNotice__logo">
          <img :src="ichibanNoticeLogo" alt="一番賞 Ichiban Kuji" />
        </div>
        <button class="ichibanNotice__lineBtn" type="button">
          <span class="ichibanNotice__lineBtn-icon">
            <img :src="lineLogo" />
          </span>
          <span class="ichibanNotice__lineBtn-text"> 獲得最新賞品資訊！ </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ichibanNoticeLogo from '@/assets/image/ichibanNoticeLogo.png';
import lineLogo from '@/assets/image/line.svg';
</script>
