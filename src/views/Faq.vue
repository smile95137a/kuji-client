<template>
  <div class="page">
    <h1 class="page__title">常見問題</h1>

    <div class="faq">
      <details class="faq__item" open>
        <summary class="faq__q">Q：如何購買一番賞？</summary>
        <div class="faq__a">A：選擇商品 → 加入購物車 → 結帳付款。</div>
      </details>

      <details class="faq__item">
        <summary class="faq__q">Q：如何查看中獎結果？</summary>
        <div class="faq__a">A：可在「我的訂單 / 抽獎紀錄」查看。</div>
      </details>

      <details class="faq__item">
        <summary class="faq__q">Q：可以退款嗎？</summary>
        <div class="faq__a">A：依交易說明與服務條款規範辦理。</div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}
.page__title {
  margin: 0 0 18px;
  font-size: 24px;
  font-weight: 800;
  color: #111;
}
.faq {
  display: grid;
  gap: 12px;
}
.faq__item {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
}
.faq__q {
  cursor: pointer;
  font-weight: 800;
  color: #111;
  outline: none;
}
.faq__a {
  padding-top: 10px;
  color: #666;
  line-height: 1.8;
}
</style>
