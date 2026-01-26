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
          <label class="profileEdit__label">姓名</label>
          <input
            class="profileEdit__input"
            type="text"
            v-model="name"
            placeholder="輸入姓名"
          />
          <p v-if="errors.name" class="profileEdit__error">{{ errors.name }}</p>
        </div>

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
        <button class="profileEdit__btn" type="submit">儲存</button>
      </div>

      <p class="profileEdit__tip">
        ※ 目前示範版：送出會 console.log，你接 API 後把 onSubmit 內容替換掉即可
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const router = useRouter();

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
  name: yup.string().required('請輸入姓名').max(30, '姓名不可超過 30 字'),
  nickname: yup.string().nullable().max(30, '暱稱不可超過 30 字'),
  email: yup.string().required('請輸入 Email').email('Email 格式不正確'),
  phone: yup.string().required('請輸入手機').max(30, '手機不可過長'),
  lineId: yup.string().nullable().max(50, 'LINE ID 不可過長'),
  note: yup.string().nullable().max(200, '備註不可超過 200 字'),
});

const { errors, defineField, handleSubmit, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '王小明',
    nickname: 'KujiMaster',
    email: 'demo@kuji.com',
    phone: '0912-345-678',
    lineId: 'kuji_demo',
    note: '',
  },
});

const [name] = defineField('name');
const [nickname] = defineField('nickname');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [lineId] = defineField('lineId');
const [note] = defineField('note');

/** Avatar upload */
const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarPreview = ref(''); // 顯示用（Base64 或 objectURL）
const avatarFile = ref<File | null>(null);

const openFilePicker = () => {
  fileInputRef.value?.click();
};

const onPickFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] || null;
  if (!file) return;

  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);

  // 若你之後要直接送 Base64：可以在這裡讀 FileReader 後 setFieldValue('avatarBase64', xxx)
};

const clearAvatar = () => {
  avatarFile.value = null;
  avatarPreview.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const goBack = () => {
  router.push({ name: 'MemberProfile' });
};

const onSubmit = handleSubmit(async (form) => {
  const payload = {
    ...form,
    avatarFile: avatarFile.value, // 你接 API 時可用 FormData
  };

  console.log('ProfileEdit submit:', payload);

  // Demo：儲存後回上一頁
  router.push({ name: 'MemberProfile' });
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

  &__avatarMeta {
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

  &__field {
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
