<!-- src/views/member/ProfileEdit.vue -->
<template>
  <section class="profileEdit">
    <header class="profileEdit__header">
      <h1 class="profileEdit__title">編輯會員資料</h1>
      <p class="profileEdit__subtitle">更新你的個人資訊與收件/發票資料</p>
    </header>

    <form class="profileEdit__card" @submit.prevent="onSubmit">
      <!-- Avatar -->
      <div class="profileEdit__avatarRow">
        <div class="profileEdit__avatarWrap" @click="openFilePicker">
          <img
            class="profileEdit__avatar"
            :src="avatarPreview || avatar || fallbackAvatar"
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
              :disabled="!avatarPreview && !avatar"
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

      <!-- 基本資料 -->
      <p class="profileEdit__sectionTitle">基本資料</p>
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
          <label class="profileEdit__label">手機號碼</label>
          <input
            class="profileEdit__input"
            type="tel"
            v-model="phoneNumber"
            placeholder="09xxxxxxxx"
          />
          <p v-if="errors.phoneNumber" class="profileEdit__error">
            {{ errors.phoneNumber }}
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
      </div>

      <div class="profileEdit__divider"></div>

      <!-- 收件資訊 -->
      <p class="profileEdit__sectionTitle">收件資訊</p>
      <div class="profileEdit__grid">
        <div class="profileEdit__field">
          <label class="profileEdit__label">收件人姓名</label>
          <input
            class="profileEdit__input"
            type="text"
            v-model="recipientName"
            placeholder="輸入收件人姓名"
          />
          <p v-if="errors.recipientName" class="profileEdit__error">
            {{ errors.recipientName }}
          </p>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label">收件人電話</label>
          <input
            class="profileEdit__input"
            type="tel"
            v-model="recipientPhone"
            placeholder="09xxxxxxxx 或 市話"
          />
          <p v-if="errors.recipientPhone" class="profileEdit__error">
            {{ errors.recipientPhone }}
          </p>
        </div>

        <!--  縣市 + 行政區 -->
        <div class="profileEdit__field">
          <label class="profileEdit__label">城市</label>
          <select
            class="profileEdit__input"
            v-model="city"
            :disabled="isCityLoading"
            :class="{ 'profileEdit__input--error': errors.city }"
          >
            <option
              v-for="opt in cityOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{
                isCityLoading && opt.value === '' ? '載入縣市中...' : opt.label
              }}
            </option>
          </select>
          <p v-if="errors.city" class="profileEdit__error">{{ errors.city }}</p>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label">區域</label>
          <select
            class="profileEdit__input"
            v-model="district"
            :disabled="!city || isDistrictLoading"
            :class="{ 'profileEdit__input--error': errors.district }"
          >
            <option
              v-for="opt in districtOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{
                isDistrictLoading && opt.value === ''
                  ? '載入行政區中...'
                  : opt.label
              }}
            </option>
          </select>
          <p v-if="errors.district" class="profileEdit__error">
            {{ errors.district }}
          </p>
        </div>

        <div class="profileEdit__field profileEdit__field--full">
          <label class="profileEdit__label">詳細地址</label>
          <input
            class="profileEdit__input"
            type="text"
            v-model="addressDetail"
            placeholder="街道門牌樓層"
          />
          <p v-if="errors.addressDetail" class="profileEdit__error">
            {{ errors.addressDetail }}
          </p>
        </div>
      </div>

      <div class="profileEdit__divider"></div>

      <!-- 發票資訊 -->
      <p class="profileEdit__sectionTitle">發票資訊</p>
      <div class="profileEdit__grid">
        <div class="profileEdit__field">
          <label class="profileEdit__label">發票類型</label>
          <select class="profileEdit__input" v-model="invoiceType">
            <option value="">請選擇</option>
            <option value="DUPLICATE">二聯式</option>
            <option value="TRIPLICATE">三聯式</option>
            <option value="CARRIER">載具</option>
            <option value="DONATE">捐贈</option>
          </select>
          <p v-if="errors.invoiceType" class="profileEdit__error">
            {{ errors.invoiceType }}
          </p>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label">發票 Email</label>
          <input
            class="profileEdit__input"
            type="email"
            v-model="invoiceEmail"
            placeholder="選填（用於寄送發票）"
          />
          <p v-if="errors.invoiceEmail" class="profileEdit__error">
            {{ errors.invoiceEmail }}
          </p>
        </div>

        <div
          v-if="invoiceType === 'CARRIER'"
          class="profileEdit__field profileEdit__field--full"
        >
          <label class="profileEdit__label">載具條碼</label>
          <input
            class="profileEdit__input"
            type="text"
            v-model="carrierCode"
            placeholder="例如：/ABCD1234"
          />
          <p v-if="errors.carrierCode" class="profileEdit__error">
            {{ errors.carrierCode }}
          </p>
        </div>

        <template v-if="invoiceType === 'TRIPLICATE'">
          <div class="profileEdit__field">
            <label class="profileEdit__label">統一編號</label>
            <input
              class="profileEdit__input"
              type="text"
              v-model="taxId"
              placeholder="8 碼"
            />
            <p v-if="errors.taxId" class="profileEdit__error">
              {{ errors.taxId }}
            </p>
          </div>

          <div class="profileEdit__field">
            <label class="profileEdit__label">公司名稱</label>
            <input
              class="profileEdit__input"
              type="text"
              v-model="companyName"
              placeholder="公司抬頭"
            />
            <p v-if="errors.companyName" class="profileEdit__error">
              {{ errors.companyName }}
            </p>
          </div>
        </template>
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
    </form>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import { executeApi } from '@/utils/executeApiUtils';
import { getMe, updateMe, uploadAvatar } from '@/services/userService';
import { getAllCities, getDistrictsByCity } from '@/services/districtService';

type Option = { value: string; label: string };

interface DistrictInfo {
  id: string;
  city: string;
  districtName: string;
  zipCode: string;
  orderNum?: number;
  createdAt?: string;
}

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

/**  驗證：對齊 FrontendUserUpdateReq（先維持你現在規則） */
const schema = yup.object({
  email: yup.string().nullable().email('Email 格式不正確'),
  nickname: yup.string().nullable().max(30, '暱稱不可超過 30 字'),
  avatar: yup.string().nullable(),

  phoneNumber: yup.string().nullable().max(30, '手機不可過長'),
  lineId: yup.string().nullable().max(50, 'LINE ID 不可過長'),

  recipientName: yup.string().nullable().max(50, '收件人姓名不可過長'),
  recipientPhone: yup.string().nullable().max(30, '收件人電話不可過長'),
  city: yup.string().nullable(),
  district: yup.string().nullable(),
  addressDetail: yup.string().nullable().max(100, '地址不可過長'),

  invoiceType: yup
    .string()
    .nullable()
    .oneOf(
      ['DUPLICATE', 'TRIPLICATE', 'CARRIER', 'DONATE', ''],
      '發票類型不正確',
    ),
  invoiceEmail: yup.string().nullable().email('發票 Email 格式不正確'),
  carrierCode: yup.string().nullable().max(50, '載具條碼不可過長'),
  taxId: yup.string().nullable().max(20, '統編不可過長'),
  companyName: yup.string().nullable().max(50, '公司名稱不可過長'),
});

const { errors, defineField, handleSubmit, setValues, setFieldValue } = useForm(
  {
    validationSchema: schema,
    initialValues: {
      email: '',
      nickname: '',
      avatar: '',
      phoneNumber: '',
      lineId: '',
      recipientName: '',
      recipientPhone: '',
      city: '',
      district: '',
      addressDetail: '',
      invoiceType: '',
      invoiceEmail: '',
      carrierCode: '',
      taxId: '',
      companyName: '',
    },
  },
);

const [email] = defineField('email');
const [nickname] = defineField('nickname');
const [avatar] = defineField('avatar');
const [phoneNumber] = defineField('phoneNumber');
const [lineId] = defineField('lineId');

const [recipientName] = defineField('recipientName');
const [recipientPhone] = defineField('recipientPhone');
const [city] = defineField('city');
const [district] = defineField('district');
const [addressDetail] = defineField('addressDetail');

const [invoiceType] = defineField('invoiceType');
const [invoiceEmail] = defineField('invoiceEmail');
const [carrierCode] = defineField('carrierCode');
const [taxId] = defineField('taxId');
const [companyName] = defineField('companyName');

/** Avatar */
const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarPreview = ref('');
const avatarFile = ref<File | null>(null);

const openFilePicker = () => fileInputRef.value?.click();

const onPickFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] || null;
  if (!file) return;

  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);

  //  不再塞 base64，等 submit 才上傳拿 URL
};

const clearAvatar = () => {
  avatarPreview.value = '';
  avatarFile.value = null;
  setFieldValue('avatar', ''); //  若要移除頭像：送出時會更新為空字串

  if (fileInputRef.value) fileInputRef.value.value = '';
};

/**  縣市/行政區下拉 */
const cityOptions = ref<Option[]>([{ value: '', label: '縣市' }]);
const districtOptions = ref<Option[]>([{ value: '', label: '行政區' }]);
const isCityLoading = ref(false);
const isDistrictLoading = ref(false);
const districtList = ref<DistrictInfo[]>([]);

let cityReqToken = 0;

const loadCities = async () => {
  try {
    isCityLoading.value = true;

    const res = await getAllCities();
    const cities: string[] = (res as any)?.data ?? [];

    cityOptions.value = [
      { value: '', label: '縣市' },
      ...cities.map((c) => ({ value: c, label: c })),
    ];

    districtOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } catch (e) {
    console.error('ProfileEdit - loadCities error:', e);
    cityOptions.value = [{ value: '', label: '縣市' }];
    districtOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } finally {
    isCityLoading.value = false;
  }
};

watch(
  city,
  async (newCity) => {
    const token = ++cityReqToken;

    setFieldValue('district', '');
    districtOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];

    if (!newCity) return;

    try {
      isDistrictLoading.value = true;

      const res = await getDistrictsByCity(newCity);
      const districts: DistrictInfo[] = (res as any)?.data ?? [];

      if (token !== cityReqToken) return;

      districtList.value = districts;
      districtOptions.value = [
        { value: '', label: '行政區' },
        ...districts.map((d) => ({
          value: d.districtName,
          label: d.districtName,
        })),
      ];
    } catch (e) {
      console.error('ProfileEdit - loadDistricts error:', e);
      if (token !== cityReqToken) return;

      districtOptions.value = [{ value: '', label: '行政區' }];
      districtList.value = [];
    } finally {
      if (token === cityReqToken) isDistrictLoading.value = false;
    }
  },
  { immediate: false },
);

/** 發票類型切換：清空不相關欄位 */
watch(
  () => invoiceType.value,
  (val) => {
    if (val !== 'CARRIER') setFieldValue('carrierCode', '');
    if (val !== 'TRIPLICATE') {
      setFieldValue('taxId', '');
      setFieldValue('companyName', '');
    }
  },
);

/**  進頁載入 me + 依 city 預載 district options */
/**  進頁載入 me + 依 city 預載 district options */
const loadMe = async () => {
  await executeApi<any>({
    fn: () => getMe(),
    showCatchDialog: true,
    showFailDialog: true,
    showSuccessDialog: false,
    errorTitle: '讀取失敗',
    errorMessage: '無法取得會員資料，請稍後再試。',
    onSuccess: async (raw) => {
      //  支援：raw、raw.data、raw.data.data
      const me = (raw as any)?.data?.data ?? (raw as any)?.data ?? raw;

      //  支援欄位命名：avatar / avatarUrl / imageUrl
      const avatarUrl = me?.avatarUrl ?? me?.avatar ?? me?.imageUrl ?? '';

      setValues({
        email: me?.email ?? '',
        nickname: me?.nickname ?? '',
        avatar: avatarUrl, //  這行就是你說的「load avatarUrl」
        phoneNumber: me?.phoneNumber ?? '',
        lineId: me?.lineId ?? '',
        recipientName: me?.recipientName ?? '',
        recipientPhone: me?.recipientPhone ?? '',
        city: me?.city ?? '',
        district: '', // 先清空，等 options 準備好再塞
        addressDetail: me?.addressDetail ?? '',
        invoiceType: me?.invoiceType ?? '',
        invoiceEmail: me?.invoiceEmail ?? '',
        carrierCode: me?.carrierCode ?? '',
        taxId: me?.taxId ?? '',
        companyName: me?.companyName ?? '',
      });

      //  載入時清掉「選圖預覽」狀態，避免蓋住 avatarUrl
      avatarPreview.value = '';
      avatarFile.value = null;

      await nextTick();

      const meCity = me?.city;
      const meDistrict = me?.district;

      if (!meCity) {
        setFieldValue('district', meDistrict ?? '');
        return;
      }

      const token = ++cityReqToken;

      try {
        isDistrictLoading.value = true;

        const res = await getDistrictsByCity(meCity);
        const districts: DistrictInfo[] = (res as any)?.data ?? [];

        if (token !== cityReqToken) return;

        districtList.value = districts;
        districtOptions.value = [
          { value: '', label: '行政區' },
          ...districts.map((d) => ({
            value: d.districtName,
            label: d.districtName,
          })),
        ];

        await nextTick();

        if (meDistrict) {
          setFieldValue('district', meDistrict);
        }
      } catch (e) {
        console.error('ProfileEdit - preload districts error:', e);
        districtOptions.value = [{ value: '', label: '行政區' }];
        districtList.value = [];
      } finally {
        if (token === cityReqToken) isDistrictLoading.value = false;
      }
    },
  });
};

onMounted(async () => {
  await loadCities();
  await loadMe();
});

const goBack = () => router.push({ name: 'MemberProfile' });

/**  送出：如果有新頭像 → 先 uploadAvatar 拿 URL → 再 PUT /user/me */
const onSubmit = handleSubmit(async (form) => {
  await executeApi({
    fn: async () => {
      // 1) 有選新頭像：先上傳
      if (avatarFile.value) {
        const uploadRes = await uploadAvatar(avatarFile.value);
        const imageUrl =
          (uploadRes as any)?.data?.imageUrl || (uploadRes as any)?.imageUrl;

        if (!imageUrl) {
          throw new Error('上傳頭像失敗：未取得 imageUrl');
        }

        //  寫回 form + vee-validate field
        setFieldValue('avatar', imageUrl);
        (form as any).avatar = imageUrl;
      }

      // 2) 更新全部資料（含 avatar）
      return updateMe(form as any);
    },
    showCatchDialog: true,
    showFailDialog: true,
    showSuccessDialog: true,
    successTitle: '成功',
    successMessage: '已更新會員資料',
    errorTitle: '更新失敗',
    errorMessage: '更新失敗，請稍後再試。',
    onSuccess: async () => {
      await router.push({ name: 'MemberProfile' });
    },
  });
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

  &__sectionTitle {
    margin: 0 0 10px;
    font-weight: 900;
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
    background: #fff;
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

  &__input--error {
    border-color: rgba(220, 20, 60, 0.7);
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
}
</style>
