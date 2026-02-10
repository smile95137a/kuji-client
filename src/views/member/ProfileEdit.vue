<!-- src/views/member/ProfileEdit.vue -->
<template>
  <section class="profileEdit">
    <header class="profileEdit__header">
      <h1 class="profileEdit__title">編輯會員資料</h1>
      <p class="profileEdit__subtitle">更新你的個人資訊與頭像</p>
    </header>

    <form class="profileEdit__card" @submit.prevent="onSubmit">
      <!-- Avatar -->
      <div class="profileEdit__avatarRow">
        <div class="profileEdit__avatarWrap" @click="openFilePicker">
          <img
            class="profileEdit__avatar"
            :src="avatarPreview || fallbackAvatar"
            alt="avatar"
          />
          <span class="profileEdit__avatarHint">點擊更換</span>
        </div>

        <div class="profileEdit__avatarMeta">
          <p class="profileEdit__avatarTitle">頭像</p>
          <p class="profileEdit__avatarDesc">支援 jpg / png，建議正方形圖片</p>

          <div class="profileEdit__avatarActions">
            <button
              class="profileEdit__btn profileEdit__btn--ghost"
              type="button"
              @click="openFilePicker"
            >
              選擇圖片
            </button>
            <button
              class="profileEdit__btn profileEdit__btn--ghost"
              type="button"
              :disabled="!avatarPreview"
              @click="clearAvatar"
            >
              移除
            </button>
          </div>
        </div>

        <input
          ref="fileInputRef"
          class="profileEdit__file"
          type="file"
          accept="image/*"
          @change="onPickFile"
        />
      </div>

      <div class="profileEdit__divider"></div>

      <!-- Fields -->
      <div class="profileEdit__grid">
        <div class="profileEdit__field">
          <label class="profileEdit__label">暱稱</label>
          <input
            class="profileEdit__input"
            type="text"
            v-model="nickname"
            placeholder="輸入暱稱"
          />
          <p v-if="errors.nickname" class="profileEdit__error">
            {{ errors.nickname }}
          </p>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label">Email</label>
          <input
            class="profileEdit__input"
            type="email"
            v-model="email"
            placeholder="name@example.com"
          />
          <p v-if="errors.email" class="profileEdit__error">
            {{ errors.email }}
          </p>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label">手機</label>
          <input
            class="profileEdit__input"
            type="tel"
            v-model="phone"
            placeholder="09xx-xxx-xxx"
          />
          <p v-if="errors.phone" class="profileEdit__error">
            {{ errors.phone }}
          </p>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label">LINE ID</label>
          <input
            class="profileEdit__input"
            type="text"
            v-model="lineId"
            placeholder="選填"
          />
          <p v-if="errors.lineId" class="profileEdit__error">
            {{ errors.lineId }}
          </p>
        </div>

        <div class="profileEdit__field profileEdit__field--full">
          <label class="profileEdit__label">備註</label>
          <textarea
            class="profileEdit__textarea"
            v-model="note"
            rows="3"
            placeholder="選填"
          ></textarea>
          <p v-if="errors.note" class="profileEdit__error">{{ errors.note }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="profileEdit__footer">
        <button
          class="profileEdit__btn profileEdit__btn--ghost"
          type="button"
          @click="goBack"
        >
          取消
        </button>
        <button class="profileEdit__btn" type="submit" :disabled="loading">
          {{ loading ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { getMyProfile, updateMyProfile, uploadAvatar, uploadAndUpdateAvatar } from '@/services/userService';
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';

const router = useRouter();
const loading = ref(false);

const fallbackAvatar =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="100%" height="100%" fill="#eee"/>
    <circle cx="100" cy="80" r="38" fill="#bbb"/>
    <rect x="38" y="128" width="124" height="56" rx="28" fill="#bbb"/>
  </svg>
`);

const schema = yup.object({
  nickname: yup.string().nullable().max(30, '暱稱不可超過 30 字'),
  email: yup.string().required('請輸入 Email').email('Email 格式不正確'),
  phone: yup.string().required('請輸入手機').max(30, '手機不可過長'),
  lineId: yup.string().nullable().max(50, 'LINE ID 不可過長'),
  note: yup.string().nullable().max(200, '備註不可超過 200 字'),
});

const { errors, defineField, handleSubmit, setFieldValue, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    nickname: '',
    email: '',
    phone: '',
    lineId: '',
    note: '',
  },
});

const [nickname] = defineField('nickname');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [lineId] = defineField('lineId');
const [note] = defineField('note');

/** 載入使用者資料 */
const loadProfile = async () => {
  loading.value = true;
  try {
    const res = await getMyProfile();
    if (res.success && res.data) {
      const user = res.data;
      resetForm({
        values: {
          nickname: user.nickname || user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || user.phone || user.mobile || '',
          lineId: user.lineId || '',
          note: user.note || user.remark || '',
        },
      });
      // 如果有頭像 URL 就設定
      if (user.avatarUrl || user.avatar) {
        avatarPreview.value = user.avatarUrl || user.avatar;
      }
    }
  } catch (e) {
    console.error('ProfileEdit - loadProfile error:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});

/** Avatar upload */
const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarPreview = ref(''); // 顯示用（Base64 或 objectURL）
const avatarFile = ref<File | null>(null);
const avatarUrl = ref(''); // S3 上的圖片 URL
const avatarUploading = ref(false);

const openFilePicker = () => {
  fileInputRef.value?.click();
};

const onPickFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] || null;
  if (!file) return;

  avatarFile.value = file;
  // 先用 objectURL 顯示預覽
  avatarPreview.value = URL.createObjectURL(file);

  // 自動上傳到 /user/avatar，取得 imageUrl
  try {
    avatarUploading.value = true;
    const res = await uploadAvatar(file);
    if (res && res.success && res.data?.imageUrl) {
      avatarUrl.value = String(res.data.imageUrl);
      avatarPreview.value = avatarUrl.value; // 顯示正式 URL
    }
  } catch (err) {
    console.error('avatar upload error', err);
    await ichibanInfoDialog({ title: '上傳失敗', content: '頭像上傳失敗，請稍後再試' });
  } finally {
    avatarUploading.value = false;
  }
};

const clearAvatar = () => {
  avatarFile.value = null;
  avatarUrl.value = '';
  avatarPreview.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const goBack = () => {
  router.push({ name: 'MemberProfile' });
};

const onSubmit = handleSubmit(async (form) => {
  loading.value = true;
  try {
    const payload: any = {
      nickname: form.nickname,
      email: form.email,
      phoneNumber: form.phone, // backend expects phoneNumber
      lineId: form.lineId,
      note: form.note,
    };

    // 如果有上傳過 avatarUrl，包含到更新 payload
    if (avatarUrl.value) {
      payload.avatar = avatarUrl.value;
    }

    // 目前先用 JSON 格式
    const res = await updateMyProfile(payload);

    if (res.success) {
      await ichibanInfoDialog({ title: '成功', content: '個人資料已更新！' });
      router.push({ name: 'MemberProfile' });
    } else {
      await ichibanInfoDialog({ title: '失敗', content: res.message || '更新失敗，請稍後再試' });
    }
  } catch (e: any) {
    console.error('ProfileEdit - onSubmit error:', e);
    await ichibanInfoDialog({ title: '錯誤', content: e?.message || '更新失敗，請稍後再試' });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.profileEdit {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 16px;
  }
  &__title {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 6px;
  }
  &__subtitle {
    margin: 0;
    opacity: 0.7;
  }

  &__card {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
    margin-top: 12px;
  }

  &__avatarRow {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 14px;
    align-items: center;

    @media (max-width: 640px) {
      grid-template-columns: 96px 1fr;
    }
  }

  &__avatarWrap {
    width: 96px;
    height: 96px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
    position: relative;
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__avatarHint {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    white-space: nowrap;
  }

  &__avatarTitle {
    margin: 0 0 4px;
    font-weight: 900;
  }

  &__avatarDesc {
    margin: 0 0 10px;
    font-size: 12px;
    opacity: 0.7;
  }

  &__avatarActions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__file {
    display: none;
  }

  &__divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.06);
    margin: 14px 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    @media (max-width: 640px) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  &__field--full {
    grid-column: 1 / -1;
  }

  &__label {
    display: block;
    font-size: 13px;
    opacity: 0.75;
    margin-bottom: 6px;
  }

  &__input {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 11px 12px;
    outline: none;
    background: #fff;
  }

  &__textarea {
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    padding: 11px 12px;
    outline: none;
    background: #fff;
    resize: vertical;
  }

  &__error {
    margin: 8px 0 0;
    color: #d11;
    font-size: 13px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
  }

  &__btn {
    border: 0;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
    background: #111;
    color: #fff;

    &--ghost {
      background: transparent;
      color: #111;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__tip {
    margin: 12px 0 0;
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
  }
}
</style>
