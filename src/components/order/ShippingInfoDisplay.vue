<template>
  <div class="shippingDisplay">
    <h4 class="shippingDisplay__title">收件資訊</h4>
    <div class="shippingDisplay__grid">
      <div class="shippingDisplay__row">
        <span class="shippingDisplay__key">收件人</span>
        <span class="shippingDisplay__val">{{ recipientName || '-' }}</span>
      </div>
      <div class="shippingDisplay__row">
        <span class="shippingDisplay__key">電話</span>
        <span class="shippingDisplay__val">{{ recipientPhone || '-' }}</span>
      </div>
      <div class="shippingDisplay__row">
        <span class="shippingDisplay__key">地址</span>
        <span class="shippingDisplay__val">{{ recipientAddress || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
}>();
</script>

<style scoped>
.shippingDisplay {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shippingDisplay__title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.shippingDisplay__grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shippingDisplay__row {
  display: flex;
  gap: 16px;
  font-size: 1rem;
  align-items: baseline;
}

.shippingDisplay__key {
  flex-shrink: 0;
  width: 52px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
}

.shippingDisplay__val {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  word-break: break-all;
  line-height: 1.5;
}
</style>
