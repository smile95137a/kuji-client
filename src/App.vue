<template>
  <router-view />
  <BaseOverlay />
  <FloatingActionDrawer />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BaseOverlay from '@/components/common/BaseOverlay.vue';
import FloatingActionDrawer from '@/components/FloatingActionDrawer.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

// Bug Fix #2: On page load, silently refresh the accessToken (which lives only in memory).
// User stays logged in across F5 as long as their refreshToken in localStorage is valid.
onMounted(async () => {
  await authStore.initAuth();
});
</script>

<style scoped>
.layout__body {
  display: flex;
}
.layout__main {
  flex: 1;
}
</style>
