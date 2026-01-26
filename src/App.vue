<template>
  <router-view />
  <BaseOverlay />
  <FloatingActionDrawer />
</template>

<script setup lang="ts">
import BaseOverlay from '@/components/common/BaseOverlay.vue';
import GotchaMachine from '@/components/common/GotchaMachine.vue';
import FloatingActionDrawer from '@/components/FloatingActionDrawer.vue';
</script>

<style scoped>
.layout__body {
  display: flex;
}
.layout__main {
  flex: 1;
}
</style>
