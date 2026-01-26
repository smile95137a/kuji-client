<template>
  <div class="demo">
    <div class="demo__actions">
      <button class="demo__btn" @click="openGacha()">打開抽卡</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOverlayStore } from '@/stores/overlay';

const overlay = useOverlayStore();

function openGacha() {
  overlay.open('gacha');
}
</script>

<style scoped>
.demo {
  min-height: 100vh;
  padding: 28px 18px;
  display: grid;
  align-content: start;
  gap: 14px;
}

.demo__title {
  font-size: 20px;
  font-weight: 900;
}

.demo__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.demo__btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: 0;
  cursor: pointer;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b, #facc15);
  color: #111827;
  box-shadow: 0 10px 22px rgba(245, 158, 11, 0.22);
}

.demo__btn--ghost {
  background: rgba(0, 0, 0, 0.06);
  box-shadow: none;
}

.demo__empty {
  padding: 18px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.04);
}
</style>
