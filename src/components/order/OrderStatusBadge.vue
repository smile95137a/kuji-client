<template>
  <span class="orderBadge" :class="badgeClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
  statusName?: string;
}>();

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待補填',
  PROCESSING: '處理中',
  SHIPPING: '出貨中',
  DELIVERED: '已送達',
  CANCELED: '已取消',
  REFUNDED: '已退款',
};

const label = computed(() => props.statusName ?? STATUS_LABELS[props.status] ?? props.status);

const badgeClass = computed(() => ({
  'orderBadge--pending': props.status === 'PENDING',
  'orderBadge--processing': props.status === 'PROCESSING',
  'orderBadge--shipping': props.status === 'SHIPPING',
  'orderBadge--delivered': props.status === 'DELIVERED',
  'orderBadge--canceled': props.status === 'CANCELED',
  'orderBadge--refunded': props.status === 'REFUNDED',
}));
</script>

<style scoped>
.orderBadge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.orderBadge--pending {
  background: rgba(255, 152, 0, 0.15);
  color: #ffb74d;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.orderBadge--processing {
  background: rgba(33, 150, 243, 0.15);
  color: #64b5f6;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.orderBadge--shipping {
  background: rgba(156, 39, 176, 0.15);
  color: #ce93d8;
  border: 1px solid rgba(156, 39, 176, 0.3);
}

.orderBadge--delivered {
  background: rgba(76, 175, 80, 0.15);
  color: #81c784;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.orderBadge--canceled {
  background: rgba(244, 67, 54, 0.15);
  color: #ef9a9a;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.orderBadge--refunded {
  background: rgba(158, 158, 158, 0.15);
  color: #bdbdbd;
  border: 1px solid rgba(158, 158, 158, 0.3);
}
</style>
