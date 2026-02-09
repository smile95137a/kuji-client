<!-- src/components/common/NoData.vue -->
<template>
  <div class="noData">
    <div class="noData__img">
      <img :src="pic" alt="noData" />
    </div>
    <p class="noData__text">{{ props.message }}</p>
  </div>
</template>

<script setup lang="ts">
import pic from '@/assets/image/weblogo.png';

const props = withDefaults(
  defineProps<{
    message?: string;
  }>(),
  {
    message: '查無資料',
  },
);
</script>
