<template>
  <router-view />
  <BaseOverlay />
  <FloatingActionDrawer />
</template>

<script setup lang="ts">
import BaseOverlay from '@/components/common/BaseOverlay.vue';
import FloatingActionDrawer from '@/components/FloatingActionDrawer.vue';
// initAuth() is now called in main.ts before the router is mounted,
// ensuring the silent refresh completes before any route guard runs.
</script>

<style scoped>
.layout__body {
  display: flex;
}
.layout__main {
  flex: 1;
}
</style>
