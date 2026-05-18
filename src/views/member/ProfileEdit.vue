<!-- src/views/member/ProfileEdit.vue -->
<template>
  <section class="profileEdit">
    <!-- 頂部主視覺 -->
    <div class="profileEdit__hero">
      <div class="profileEdit__heroBg"></div>

      <div class="profileEdit__heroTop">
        <div>
          <p class="profileEdit__badge">MEMBER PROFILE</p>
          <h1 class="profileEdit__title">編輯會員資料</h1>
          <p class="profileEdit__subtitle">
            更新個人資訊、收件地址與發票設定。
          </p>
        </div>

        <button class="profileEdit__backBtn" type="button" @click="goBack">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
          <span>會員中心</span>
        </button>
      </div>

      <!-- Avatar -->
      <section class="profileEdit__avatarCard">
        <button
          class="profileEdit__avatarWrap"
          type="button"
          @click="openFilePicker"
        >
          <img
            class="profileEdit__avatar"
            :src="avatarPreview || avatar || fallbackAvatar"
            alt="avatar"
          />
          <span class="profileEdit__avatarHint">
            <font-awesome-icon :icon="['fas', 'camera']" />
          </span>
        </button>

        <div class="profileEdit__avatarInfo">
          <p class="profileEdit__memberLabel">會員頭像</p>
          <h2 class="profileEdit__avatarTitle">更換個人頭像</h2>
          <p class="profileEdit__avatarDesc">
            支援 jpg / png，建議使用正方形圖片，檔案大小請勿超過
            {{ MAX_AVATAR_SIZE_MB }}MB。
          </p>

          <div class="profileEdit__avatarActions">
            <button
              class="profileEdit__smallBtn profileEdit__smallBtn--primary"
              type="button"
              @click="openFilePicker"
            >
              選擇圖片
            </button>

            <button
              class="profileEdit__smallBtn profileEdit__smallBtn--ghost"
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
      </section>
    </div>

    <form class="profileEdit__form" @submit.prevent="onSubmit">
      <!-- 基本資料 -->
      <section class="profileEdit__section">
        <div class="profileEdit__sectionHead">
          <div>
            <p class="profileEdit__sectionKicker">BASIC INFO</p>
            <h2 class="profileEdit__sectionTitle">基本資料</h2>
          </div>
        </div>

        <div class="profileEdit__grid">
          <div class="profileEdit__field">
            <label class="profileEdit__label">暱稱</label>
            <input
              class="profileEdit__input"
              type="text"
              v-model="nickname"
              placeholder="輸入暱稱"
              :class="{ 'profileEdit__input--error': errors.nickname }"
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
              :class="{ 'profileEdit__input--error': errors.email }"
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
              :class="{ 'profileEdit__input--error': errors.phoneNumber }"
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
              :class="{ 'profileEdit__input--error': errors.lineId }"
            />
            <p v-if="errors.lineId" class="profileEdit__error">
              {{ errors.lineId }}
            </p>
          </div>
        </div>
      </section>

      <!-- 收件資訊 -->
      <section class="profileEdit__section">
        <div class="profileEdit__sectionHead">
          <div>
            <p class="profileEdit__sectionKicker">SHIPPING INFO</p>
            <h2 class="profileEdit__sectionTitle">收件資訊</h2>
          </div>
        </div>

        <div class="profileEdit__grid">
          <div class="profileEdit__field">
            <label class="profileEdit__label">收件人姓名</label>
            <input
              class="profileEdit__input"
              type="text"
              v-model="recipientName"
              placeholder="輸入收件人姓名"
              :class="{ 'profileEdit__input--error': errors.recipientName }"
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
              placeholder="09xxxxxxxx 或市話"
              :class="{ 'profileEdit__input--error': errors.recipientPhone }"
            />
            <p v-if="errors.recipientPhone" class="profileEdit__error">
              {{ errors.recipientPhone }}
            </p>
          </div>

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
                  isCityLoading && opt.value === ''
                    ? '載入縣市中...'
                    : opt.label
                }}
              </option>
            </select>
            <p v-if="errors.city" class="profileEdit__error">
              {{ errors.city }}
            </p>
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
              :class="{ 'profileEdit__input--error': errors.addressDetail }"
            />
            <p v-if="errors.addressDetail" class="profileEdit__error">
              {{ errors.addressDetail }}
            </p>
          </div>
        </div>
      </section>

      <!-- 發票資訊 -->
      <section class="profileEdit__section">
        <div class="profileEdit__sectionHead">
          <div>
            <p class="profileEdit__sectionKicker">INVOICE INFO</p>
            <h2 class="profileEdit__sectionTitle">發票資訊</h2>
          </div>
        </div>

        <div class="profileEdit__grid">
          <div class="profileEdit__field">
            <label class="profileEdit__label">發票類型</label>
            <select
              class="profileEdit__input"
              v-model="invoiceType"
              :class="{ 'profileEdit__input--error': errors.invoiceType }"
            >
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
              placeholder="選填，用於寄送發票"
              :class="{ 'profileEdit__input--error': errors.invoiceEmail }"
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
              placeholder="例如 /ABCD1234"
              :class="{ 'profileEdit__input--error': errors.carrierCode }"
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
                :class="{ 'profileEdit__input--error': errors.taxId }"
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
                :class="{ 'profileEdit__input--error': errors.companyName }"
              />
              <p v-if="errors.companyName" class="profileEdit__error">
                {{ errors.companyName }}
              </p>
            </div>
          </template>
        </div>
      </section>

      <div class="profileEdit__footer">
        <button
          class="profileEdit__actionBtn profileEdit__actionBtn--ghost"
          type="button"
          @click="goBack"
        >
          取消
        </button>

        <button class="profileEdit__actionBtn" type="submit">
          <font-awesome-icon :icon="['fas', 'floppy-disk']" />
          儲存資料
        </button>
      </div>
    </form>

    <!-- 修改密碼 -->
    <section v-if="isEmailUser" class="profileEdit__passwordCard">
      <div class="profileEdit__passwordHeader">
        <div class="profileEdit__passwordIcon" aria-hidden="true">
          <font-awesome-icon :icon="['fas', 'lock']" />
        </div>

        <div>
          <p class="profileEdit__sectionKicker">ACCOUNT SECURITY</p>
          <h2 class="profileEdit__passwordTitle">修改密碼</h2>
          <p class="profileEdit__passwordSubtitle">
            建議定期更新密碼，讓帳號更安全。
          </p>
        </div>
      </div>

      <div class="profileEdit__passwordGrid">
        <div class="profileEdit__field">
          <label class="profileEdit__label" for="cp-current">目前密碼</label>
          <div class="profileEdit__passwordInputWrap">
            <input
              id="cp-current"
              v-model="passwordForm.currentPassword"
              class="profileEdit__passwordInput"
              :type="showPassword.current ? 'text' : 'password'"
              placeholder="請輸入目前密碼"
              autocomplete="current-password"
            />
            <button
              class="profileEdit__eyeBtn"
              type="button"
              :aria-label="showPassword.current ? '隱藏密碼' : '顯示密碼'"
              @click="showPassword.current = !showPassword.current"
            >
              <font-awesome-icon
                :icon="['fas', showPassword.current ? 'eye-slash' : 'eye']"
              />
            </button>
          </div>
        </div>

        <div class="profileEdit__field">
          <label class="profileEdit__label" for="cp-new">新密碼</label>
          <div class="profileEdit__passwordInputWrap">
            <input
              id="cp-new"
              v-model="passwordForm.newPassword"
              class="profileEdit__passwordInput"
              :type="showPassword.newPass ? 'text' : 'password'"
              placeholder="至少 8 碼"
              autocomplete="new-password"
            />
            <button
              class="profileEdit__eyeBtn"
              type="button"
              :aria-label="showPassword.newPass ? '隱藏密碼' : '顯示密碼'"
              @click="showPassword.newPass = !showPassword.newPass"
            >
              <font-awesome-icon
                :icon="['fas', showPassword.newPass ? 'eye-slash' : 'eye']"
              />
            </button>
          </div>
        </div>

        <div class="profileEdit__field profileEdit__field--full">
          <label class="profileEdit__label" for="cp-confirm">確認新密碼</label>
          <div
            class="profileEdit__passwordInputWrap"
            :class="{
              'profileEdit__passwordInputWrap--error': confirmPasswordMismatch,
            }"
          >
            <input
              id="cp-confirm"
              v-model="passwordForm.confirmNewPassword"
              class="profileEdit__passwordInput"
              :type="showPassword.confirm ? 'text' : 'password'"
              placeholder="請再次輸入新密碼"
              autocomplete="new-password"
            />
            <button
              class="profileEdit__eyeBtn"
              type="button"
              :aria-label="showPassword.confirm ? '隱藏密碼' : '顯示密碼'"
              @click="showPassword.confirm = !showPassword.confirm"
            >
              <font-awesome-icon
                :icon="['fas', showPassword.confirm ? 'eye-slash' : 'eye']"
              />
            </button>
          </div>

          <p
            v-if="confirmPasswordMismatch"
            class="profileEdit__passwordMsg profileEdit__passwordMsg--error"
          >
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
            新密碼與確認密碼不一致。
          </p>
        </div>
      </div>

      <p
        v-if="passwordSuccessMsg"
        class="profileEdit__passwordMsg profileEdit__passwordMsg--success"
      >
        <font-awesome-icon :icon="['fas', 'circle-check']" />
        {{ passwordSuccessMsg }}
      </p>

      <p
        v-if="passwordErrorMsg"
        class="profileEdit__passwordMsg profileEdit__passwordMsg--error"
      >
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
        {{ passwordErrorMsg }}
      </p>

      <div class="profileEdit__passwordFooter">
        <button
          class="profileEdit__actionBtn"
          type="button"
          :disabled="isPasswordLoading || confirmPasswordMismatch"
          @click="onSubmitPassword"
        >
          <span v-if="isPasswordLoading" class="profileEdit__spinner"></span>
          <template v-else>
            <font-awesome-icon :icon="['fas', 'key']" />
            確認修改
          </template>
        </button>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import { executeApi } from '@/utils/executeApiUtils';
import { getMe, updateMe, uploadAvatar } from '@/services/userService';
import { getAllCities, getDistrictsByCity } from '@/services/districtService';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChangePassword } from '@/composables/useChangePassword';

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

const authStore = useAuthStore();
const {
  form: passwordForm,
  isLoading: isPasswordLoading,
  successMsg: passwordSuccessMsg,
  errorMsg: passwordErrorMsg,
  submit: submitPassword,
} = useChangePassword();

const isEmailUser = computed(() => authStore.user?.provider === 'EMAIL');

const showPassword = reactive({
  current: false,
  newPass: false,
  confirm: false,
});

const confirmPasswordMismatch = computed(
  () =>
    passwordForm.confirmNewPassword.length > 0 &&
    passwordForm.newPassword !== passwordForm.confirmNewPassword,
);

const onSubmitPassword = async () => {
  await submitPassword();
};

const fallbackAvatar =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="100%" height="100%" fill="#f4eee8"/>
    <circle cx="100" cy="78" r="38" fill="#cbb8aa"/>
    <rect x="38" y="126" width="124" height="58" rx="29" fill="#cbb8aa"/>
  </svg>
`);

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
const MAX_AVATAR_SIZE_MB = 20;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

const openFilePicker = () => fileInputRef.value?.click();

const onPickFile = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] || null;
  if (!file) return;

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    avatarPreview.value = '';
    avatarFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';

    await executeApi({
      fn: async () => true,
      showSuccessDialog: false,
      showFailDialog: true,
      showCatchDialog: false,
      errorTitle: '圖片過大',
      errorMessage: `請選擇 ${MAX_AVATAR_SIZE_MB}MB 以內的圖片。`,
      onSuccess: async () => {},
    });

    return;
  }

  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

const clearAvatar = () => {
  avatarPreview.value = '';
  avatarFile.value = null;
  setFieldValue('avatar', '');

  if (fileInputRef.value) fileInputRef.value.value = '';
};

/** 縣市/行政區下拉 */
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

const loadMe = async () => {
  await executeApi<any>({
    fn: () => getMe(),
    showCatchDialog: true,
    showFailDialog: true,
    showSuccessDialog: false,
    errorTitle: '讀取失敗',
    errorMessage: '無法取得會員資料，請稍後再試。',
    onSuccess: async (raw) => {
      const me = (raw as any)?.data?.data ?? (raw as any)?.data ?? raw;

      const avatarUrl = me?.avatarUrl ?? me?.avatar ?? me?.imageUrl ?? '';

      setValues({
        email: me?.email ?? '',
        nickname: me?.nickname ?? '',
        avatar: avatarUrl,
        phoneNumber: me?.phoneNumber ?? '',
        lineId: me?.lineId ?? '',
        recipientName: me?.recipientName ?? '',
        recipientPhone: me?.recipientPhone ?? '',
        city: me?.city ?? '',
        district: '',
        addressDetail: me?.addressDetail ?? '',
        invoiceType: me?.invoiceType ?? '',
        invoiceEmail: me?.invoiceEmail ?? '',
        carrierCode: me?.carrierCode ?? '',
        taxId: me?.taxId ?? '',
        companyName: me?.companyName ?? '',
      });

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

const onSubmit = handleSubmit(async (form) => {
  await executeApi({
    fn: async () => {
      if (avatarFile.value) {
        let uploadRes: any;

        try {
          uploadRes = await uploadAvatar(avatarFile.value);
        } catch (error: any) {
          if (error?.response?.status === 413) {
            throw new Error(
              `上傳失敗，請選擇 ${MAX_AVATAR_SIZE_MB}MB 以內的圖片`,
            );
          }

          throw error;
        }

        const imageUrl =
          (uploadRes as any)?.data?.imageUrl || (uploadRes as any)?.imageUrl;

        if (!imageUrl) {
          throw new Error('上傳頭像失敗：未取得 imageUrl');
        }

        setFieldValue('avatar', imageUrl);
        (form as any).avatar = imageUrl;
      }

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
  min-height: 100%;
  color: #201713;

  --primary: #b43325;
  --primary-dark: #8f261b;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --brown: #3f2412;
  --cream: #fff8ef;
  --cream-deep: #f5eadc;
  --card: #ffffff;
  --line: rgba(63, 36, 18, 0.1);
  --text: #201713;
  --text-soft: rgba(32, 23, 19, 0.58);

  &__hero {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    padding: 22px;
    margin-bottom: 18px;

    background:
      radial-gradient(
        circle at 12% 0%,
        rgba(255, 255, 255, 0.5),
        transparent 28%
      ),
      linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
    color: #fff;
    box-shadow: 0 18px 36px rgba(91, 37, 21, 0.16);
  }

  &__heroBg {
    position: absolute;
    right: -70px;
    top: -90px;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.13);
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      right: 50px;
      bottom: -70px;
      width: 150px;
      height: 150px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__heroTop {
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
  }

  &__badge,
  &__sectionKicker,
  &__memberLabel {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    margin: 0 0 8px;

    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1.3px;
  }

  &__badge {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  &__sectionKicker,
  &__memberLabel {
    background: var(--primary-soft);
    color: var(--primary);
  }

  &__title {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
    font-weight: 950;
    letter-spacing: 0.5px;
  }

  &__subtitle {
    margin: 8px 0 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 14px;
    line-height: 1.6;
  }

  &__backBtn {
    position: relative;
    z-index: 1;
    min-width: 104px;
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    backdrop-filter: blur(12px);

    font-size: 13px;
    font-weight: 900;

    transition:
      transform 0.16s ease,
      background 0.16s ease;

    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.22);
    }
  }

  &__avatarCard {
    position: relative;
    z-index: 1;

    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 16px;
    align-items: center;

    margin-top: 22px;
    padding: 16px;
    border-radius: 22px;

    background: rgba(255, 255, 255, 0.92);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.52);
    box-shadow: 0 16px 28px rgba(52, 18, 8, 0.14);
  }

  &__avatarWrap {
    position: relative;
    width: 92px;
    height: 92px;
    padding: 0;
    border-radius: 26px;
    overflow: hidden;
    cursor: pointer;

    background: #fff;
    border: 3px solid #fff;
    box-shadow: 0 12px 22px rgba(58, 29, 16, 0.14);
  }

  &__avatar {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  &__avatarHint {
    position: absolute;
    right: 6px;
    bottom: 6px;

    width: 28px;
    height: 28px;
    border-radius: 999px;

    display: grid;
    place-items: center;

    background: var(--primary);
    color: #fff;
    border: 2px solid #fff;

    font-size: 12px;
  }

  &__avatarInfo {
    min-width: 0;
  }

  &__avatarTitle {
    margin: 0;
    color: var(--text);
    font-size: 22px;
    line-height: 1.25;
    font-weight: 950;
  }

  &__avatarDesc {
    margin: 7px 0 0;
    color: var(--text-soft);
    font-size: 13px;
    line-height: 1.6;
    font-weight: 700;
  }

  &__avatarActions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 13px;
  }

  &__file {
    display: none;
  }

  &__smallBtn,
  &__actionBtn {
    border-radius: 999px;
    border: 1px solid transparent;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    font-weight: 900;

    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease,
      border-color 0.16s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__smallBtn {
    min-height: 34px;
    padding: 0 13px;
    font-size: 12px;

    &--primary {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);
    }
  }

  &__form,
  &__passwordCard {
    border-radius: 24px;
    padding: 18px;

    background: var(--card);
    border: 1px solid var(--line);
    box-shadow: 0 12px 28px rgba(53, 31, 18, 0.055);
  }

  &__section {
    padding: 18px;
    border-radius: 22px;

    background: linear-gradient(180deg, #fffaf4 0%, #ffffff 100%);
    border: 1px solid var(--line);

    & + & {
      margin-top: 14px;
    }
  }

  &__sectionHead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__sectionTitle {
    margin: 0;
    color: var(--text);
    font-size: 19px;
    line-height: 1.3;
    font-weight: 950;
  }

  &__grid,
  &__passwordGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  &__field {
    min-width: 0;
  }

  &__field--full {
    grid-column: 1 / -1;
  }

  &__label {
    display: block;
    margin-bottom: 7px;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 900;
  }

  &__input {
    width: 100%;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);
    color: var(--text);
    outline: none;

    font-size: 14px;
    font-weight: 800;

    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;

    &::placeholder {
      color: rgba(32, 23, 19, 0.34);
    }

    &:focus {
      background: #fff;
      border-color: rgba(180, 51, 37, 0.5);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
    }

    &:disabled {
      opacity: 0.62;
      cursor: not-allowed;
      background: #f4eee8;
    }
  }

  &__input--error {
    border-color: rgba(180, 35, 24, 0.72);
    box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
  }

  &__error {
    margin: 8px 0 0;
    color: #b42318;
    font-size: 13px;
    font-weight: 800;
  }

  &__footer,
  &__passwordFooter {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }

  &__actionBtn {
    min-height: 44px;
    padding: 0 18px;

    background: var(--primary);
    color: #fff;
    border-color: var(--primary);

    font-size: 14px;

    &:hover:not(:disabled) {
      box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
    }

    &--ghost {
      background: #fff;
      color: var(--text);
      border-color: var(--line);

      &:hover:not(:disabled) {
        box-shadow: 0 10px 18px rgba(63, 36, 18, 0.06);
      }
    }
  }

  /* Password */
  &__passwordCard {
    margin-top: 16px;
  }

  &__passwordHeader {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  &__passwordIcon {
    width: 48px;
    height: 48px;
    border-radius: 17px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: linear-gradient(135deg, #4a2617 0%, #b43325 100%);
    color: #fff;
    font-size: 18px;
    box-shadow: 0 12px 20px rgba(180, 51, 37, 0.18);
  }

  &__passwordTitle {
    margin: 0 0 4px;
    color: var(--text);
    font-size: 19px;
    font-weight: 950;
  }

  &__passwordSubtitle {
    margin: 0;
    color: var(--text-soft);
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
  }

  &__passwordInputWrap {
    min-height: 46px;
    display: flex;
    align-items: center;
    overflow: hidden;
    border-radius: 16px;

    background: #fff;
    border: 1px solid var(--line);

    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    &:focus-within {
      border-color: rgba(180, 51, 37, 0.5);
      box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
    }

    &--error {
      border-color: rgba(180, 35, 24, 0.72);
      box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
    }
  }

  &__passwordInput {
    flex: 1;
    min-width: 0;
    height: 46px;
    padding: 0 14px;
    border: 0;
    background: transparent;
    outline: none;

    color: var(--text);
    font-size: 14px;
    font-weight: 800;

    &::placeholder {
      color: rgba(32, 23, 19, 0.34);
    }
  }

  &__eyeBtn {
    width: 46px;
    height: 46px;
    border: 0;
    background: transparent;
    cursor: pointer;

    display: grid;
    place-items: center;

    color: rgba(32, 23, 19, 0.42);

    &:hover {
      color: var(--primary);
    }
  }

  &__passwordMsg {
    display: flex;
    align-items: center;
    gap: 8px;

    margin: 12px 0 0;
    padding: 11px 12px;
    border-radius: 16px;

    font-size: 13px;
    font-weight: 900;

    &--success {
      color: #2e7d32;
      background: rgba(46, 125, 50, 0.08);
      border: 1px solid rgba(46, 125, 50, 0.12);
    }

    &--error {
      color: #b42318;
      background: rgba(180, 35, 24, 0.08);
      border: 1px solid rgba(180, 35, 24, 0.12);
    }
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.42);
    border-top-color: #fff;
    animation: profileEditSpin 0.7s linear infinite;
  }

  @media (max-width: 760px) {
    & {
      padding-bottom: 20px;
    }

    &__hero {
      border-radius: 0 0 28px 28px;
      margin: -16px -16px 18px;
      padding: 22px 16px 18px;
    }

    &__heroTop {
      align-items: flex-start;
    }

    &__title {
      font-size: 25px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__backBtn {
      width: 42px;
      min-width: 42px;
      height: 42px;
      padding: 0;

      span {
        display: none;
      }
    }

    &__avatarCard {
      grid-template-columns: 76px minmax(0, 1fr);
      gap: 12px;
      padding: 13px;
      border-radius: 20px;
    }

    &__avatarWrap {
      width: 76px;
      height: 76px;
      border-radius: 22px;
    }

    &__avatarHint {
      width: 25px;
      height: 25px;
      font-size: 11px;
    }

    &__memberLabel {
      min-height: 22px;
      padding: 0 8px;
      font-size: 10px;
      margin-bottom: 6px;
    }

    &__avatarTitle {
      font-size: 19px;
    }

    &__avatarDesc {
      font-size: 12px;
    }

    &__avatarActions {
      gap: 8px;
      margin-top: 10px;
    }

    &__smallBtn {
      min-height: 32px;
      padding: 0 11px;
    }

    &__form,
    &__passwordCard {
      padding: 15px;
      border-radius: 22px;
    }

    &__section {
      padding: 15px;
      border-radius: 20px;
    }

    &__sectionTitle {
      font-size: 18px;
    }

    &__grid,
    &__passwordGrid {
      grid-template-columns: 1fr;
      gap: 13px;
    }

    &__input,
    &__passwordInputWrap,
    &__passwordInput {
      min-height: 48px;
    }

    &__footer,
    &__passwordFooter {
      flex-direction: column-reverse;
    }

    &__actionBtn {
      width: 100%;
      min-height: 48px;
    }

    &__passwordHeader {
      align-items: flex-start;
    }

    &__passwordIcon {
      width: 44px;
      height: 44px;
      border-radius: 16px;
    }
  }
}

@keyframes profileEditSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
