// src/stores/overlay.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOverlayStore = defineStore('overlay', () => {
  const isOpen = ref(false);
  const type = ref<string | null>(null);

  const lockedByOverlay = ref(false);

  const lockBodyScroll = () => {
    document.body.style.overflow = 'hidden';
    lockedByOverlay.value = true;
  };

  const unlockBodyScroll = () => {
    document.body.style.overflow = '';
    lockedByOverlay.value = false;
  };

  const open = (nextType: string | null = null, lockScroll = true) => {
    isOpen.value = true;
    type.value = nextType;

    if (lockScroll) lockBodyScroll();
  };

  const close = (lockScroll = true) => {
    isOpen.value = false;
    type.value = null;

    if (lockScroll && lockedByOverlay.value) unlockBodyScroll();
  };

  const toggle = (nextType: string | null = null, lockScroll = true) => {
    if (isOpen.value) close(lockScroll);
    else open(nextType, lockScroll);
  };

  return {
    isOpen,
    type,
    open,
    close,
    toggle,
  };
});
