<!-- src/components/ichiban/IchibanPrizeCard.vue -->
<script setup lang="ts">
const props = defineProps<{
  imgSrc: string;
  name: string;
  gradeLabel: string;
  gradeType: 'primary' | 'secondary';
  countText: string;
  sizeText: string;
}>();
</script>

<template>
  <article class="ichibanPrizeCard">
    <div class="ichibanPrizeCard__imgWrap">
      <div class="ichibanPrizeCard__img">
        <img class="ichibanPrizeCard__img-img" :src="imgSrc" :alt="name" />
      </div>

      <div
        class="ichibanPrizeCard__gradeBar"
        :class="{
          'ichibanPrizeCard__gradeBar--primary': gradeType === 'primary',
          'ichibanPrizeCard__gradeBar--secondary': gradeType === 'secondary',
        }"
      >
        <span class="ichibanPrizeCard__gradeLabel">
          {{ gradeLabel }}
        </span>
        <span class="ichibanPrizeCard__gradeCount">
          {{ countText }}
        </span>
      </div>

      <div class="ichibanPrizeCard__size">
        {{ sizeText }}
      </div>
    </div>

    <div class="ichibanPrizeCard__body">
      <p class="ichibanPrizeCard__name">
        {{ name }}
      </p>
    </div>
  </article>
</template>
