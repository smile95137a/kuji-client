<template>
  <div class="avatarUpload">
    <!-- Preview -->
    <div class="avatarUpload__preview" @click="open">
      <img
        v-if="previewUrl || currentUrl"
        :src="previewUrl ?? currentUrl"
        class="avatarUpload__img"
        alt="頭像"
      />
      <div v-else class="avatarUpload__placeholder">
        <span class="avatarUpload__initials">{{ initials }}</span>
      </div>
      <div class="avatarUpload__overlay">
        <span class="avatarUpload__overlayIcon">📷</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="avatarUpload__actions">
      <button class="avatarUpload__pickBtn" type="button" @click="open" :disabled="isUploading">
        <span v-if="isUploading" class="avatarUpload__spinner"></span>
        <span v-else>更換頭像</span>
      </button>
    </div>

    <p v-if="error" class="avatarUpload__error">{{ error }}</p>

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="avatarUpload__input"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserProfile } from '@/composables/useUserProfile';
import { useAuthStore } from '@/stores/useAuthStore';

const props = defineProps<{
  currentUrl?: string | null;
  nickname?: string;
}>();

const emit = defineEmits<{
  (e: 'uploaded', url: string): void;
}>();

const { uploadAvatarAndSync } = useUserProfile();
const authStore = useAuthStore();

const inputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const isUploading = ref(false);
const error = ref<string | null>(null);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const initials = computed(() => {
  const name = props.nickname ?? authStore.user?.nickname ?? '';
  return name ? name.charAt(0).toUpperCase() : '?';
});

function open() {
  inputRef.value?.click();
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  error.value = null;

  if (file.size > MAX_SIZE) {
    error.value = '圖片大小不能超過 5 MB';
    return;
  }

  // Local preview immediately
  previewUrl.value = URL.createObjectURL(file);

  isUploading.value = true;
  try {
    const url = await uploadAvatarAndSync(file);
    if (url) emit('uploaded', url);
  } catch {
    error.value = '頭像上傳失敗，請稍後再試';
    previewUrl.value = null;
  } finally {
    isUploading.value = false;
    // Reset input so same file can be re-selected
    if (inputRef.value) inputRef.value.value = '';
  }
}
</script>

<style scoped>
.avatarUpload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatarUpload__preview {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.avatarUpload__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatarUpload__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6c63ff, #9b59b6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatarUpload__initials {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.avatarUpload__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatarUpload__preview:hover .avatarUpload__overlay {
  opacity: 1;
}

.avatarUpload__overlayIcon {
  font-size: 1.5rem;
}

.avatarUpload__actions {
  display: flex;
  gap: 10px;
}

.avatarUpload__pickBtn {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.avatarUpload__pickBtn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.avatarUpload__pickBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatarUpload__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.avatarUpload__error {
  color: #f44336;
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}

.avatarUpload__input {
  display: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
