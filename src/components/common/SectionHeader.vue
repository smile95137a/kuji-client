<template>
  <div class="section-header__title">
    <div class="section-header__text" :data-text="title">{{ title }}</div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<style scoped lang="scss"></style>
