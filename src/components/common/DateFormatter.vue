<!-- src/components/common/DateFormatter.vue -->
<template>
  <span>{{ formattedDate }}</span>
</template>

<script lang="ts" setup>
import { formatDate } from '@/utils/DateUtils';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    date: string;
    format?: string;
  }>(),
  {
    format: 'YYYY-MM-DD',
  }
);

const formattedDate = computed(() => {
  const { date, format } = props;
  return formatDate(date, format);
});
</script>
