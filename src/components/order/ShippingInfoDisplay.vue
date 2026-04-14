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
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shippingDisplay__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.shippingDisplay__grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shippingDisplay__row {
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
}

.shippingDisplay__key {
  flex-shrink: 0;
  width: 60px;
  color: rgba(255, 255, 255, 0.45);
}

.shippingDisplay__val {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-all;
}
</style>
