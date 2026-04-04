<template>
  <div
    class="storeCard"
    :class="{ 'storeCard--inactive': !store.isActive }"
    @click="$emit('click', store)"
    tabindex="0"
    @keydown.enter="$emit('click', store)"
    role="button"
    :aria-label="store.name"
  >
    <div class="storeCard__logo">
      <img
        v-if="store.logoUrl"
        :src="store.logoUrl"
        :alt="store.name"
        class="storeCard__logoImg"
      />
      <div v-else class="storeCard__logoPlaceholder">
        <span>{{ store.name.charAt(0) }}</span>
      </div>
      <div v-if="!store.isActive" class="storeCard__inactiveBadge">
        暫停服務
      </div>
    </div>

    <div class="storeCard__body">
      <h3 class="storeCard__name">{{ store.name }}</h3>
      <p v-if="store.description" class="storeCard__desc">{{ store.description }}</p>
      <p v-if="store.address" class="storeCard__address">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="storeCard__addressIcon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
        </svg>
        {{ store.address }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Store } from '@/services/storeService';

defineProps<{ store: Store }>();
defineEmits<{ click: [store: Store] }>();
</script>

<style scoped lang="scss">
.storeCard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e5e5e5;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  &--inactive {
    opacity: 0.6;
    filter: grayscale(0.4);
  }

  &__logo {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
  }

  &__logoImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__logoPlaceholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #b2473a 0%, #e5a657 100%);
    font-size: 2.5rem;
    font-weight: 900;
    color: #fff;
  }

  &__inactiveBadge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.65);
    color: #fff;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    margin: 0;
  }

  &__desc {
    font-size: 0.85rem;
    color: #555;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__address {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: 0.8rem;
    color: #888;
    margin: 0;
  }

  &__addressIcon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }
}
</style>
