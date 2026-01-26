<!-- src/components/common/BaseOverlay.vue -->
<template>
  <div v-if="isOpen" class="overlay">
    <div class="overlay__backdrop" @click="handleBackdropClick"></div>

    <div class="overlay__panel" v-if="$slots.default">
      <button
        type="button"
        class="overlay__close"
        aria-label="關閉"
        @click="handleBackdropClick"
      >
        ✕
      </button>

      <div class="overlay__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useOverlayStore } from '@/stores/overlay';

const overlayStore = useOverlayStore();
const { isOpen } = storeToRefs(overlayStore);

const handleBackdropClick = () => {
  overlayStore.close();
};
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(.overlay__backdrop) {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top,
    rgba(15, 23, 42, 0.5),
    rgba(15, 23, 42, 0.9)
  );
  backdrop-filter: blur(4px);
}

.overlay__panel {
  position: relative;
  z-index: 1;
  max-width: 480px;
  width: 90%;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px 20px 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.overlay__close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.overlay__content {
  margin-top: 8px;
}

.overlay__title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}
</style>
