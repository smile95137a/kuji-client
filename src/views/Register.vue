<!-- src/views/register/Register.vue -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import { getAllCities, getDistrictsByCity } from '@/services/districtService';
import { useReferralCodeValidator } from '@/composables/useReferralCodeValidator';
import { useRegister } from '@/composables/useRegister';

type Option = {
  value: string;
  label: string;
};

interface DistrictInfo {
  id: string;
  city: string;
  districtName: string;
  zipCode: string;
  orderNum?: number;
  createdAt?: string;
}

const route = useRoute();
const registerStore = useRegister();

const submitted = ref(false);
const isSubmitting = ref(false);

const cityOptions = ref<Option[]>([{ value: '', label: '縣市' }]);
const areaOptions = ref<Option[]>([{ value: '', label: '行政區' }]);

const isCityLoading = ref(false);
const isAreaLoading = ref(false);

const districtList = ref<DistrictInfo[]>([]);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordInputType = computed(() =>
  showPassword.value ? 'text' : 'password',
);

const confirmPasswordInputType = computed(() =>
  showConfirmPassword.value ? 'text' : 'password',
);

const schema = yup.object({
  email: yup.string().required('Email 是必填項').email('Email 格式不正確'),
  phoneNumber: yup.string().required('手機是必填項'),
  password: yup.string().required('密碼是必填項').min(6, '密碼最少6個字符'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], '密碼不匹配')
    .required('確認密碼是必填項'),
  nickname: yup.string().required('暱稱是必填項'),
  lineId: yup.string().required('LINE ID 是必填項'),

  referralCode: yup.string().max(20, '推薦碼最多 20 字').nullable(),
  addressName: yup.string(),
  zipCode: yup.string(),
  city: yup.string(),
  area: yup.string(),
  address: yup.string(),

  agreeTerms: yup
    .boolean()
    .oneOf([true], '您必須同意網站服務條款和隱私權政策。')
    .required(),
});

const { handleSubmit, defineField, errors, setFieldValue } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  initialValues: {
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    lineId: '',
    referralCode: '',
    addressName: '',
    zipCode: '',
    city: '',
    area: '',
    address: '',
    agreeTerms: false,
  },
});

const [email, emailProps] = defineField('email');
const [phoneNumber, phoneNumberProps] = defineField('phoneNumber');
const [password, passwordProps] = defineField('password');
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword');

const [nickname, nicknameProps] = defineField('nickname');
const [lineId, lineIdProps] = defineField('lineId');

const [referralCode, referralCodeProps] = defineField('referralCode');

const [addressName, addressNameProps] = defineField('addressName');
const [city, cityProps] = defineField('city');
const [area, areaProps] = defineField('area');
const [address, addressProps] = defineField('address');

const [agreeTerms] = defineField('agreeTerms');

const {
  isValidating: referralValidating,
  isValid: referralIsValid,
  ownerName: referralOwnerName,
  validationError: referralError,
  validate: validateReferral,
  reset: resetReferral,
} = useReferralCodeValidator();

let cityReqToken = 0;
let areaReqToken = 0;

onMounted(async () => {
  const refCode = route.query.ref;

  if (refCode && typeof refCode === 'string' && refCode.trim()) {
    setFieldValue('referralCode', refCode.trim());
    registerStore.referralCode.value = refCode.trim();
  }

  try {
    isCityLoading.value = true;

    const res = await getAllCities();
    const cities: string[] = (res as any)?.data ?? [];

    cityOptions.value = [
      { value: '', label: '縣市' },
      ...cities.map((item) => ({
        value: item,
        label: item,
      })),
    ];

    areaOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } catch (error) {
    console.error('Register - load cities error:', error);

    cityOptions.value = [{ value: '', label: '縣市' }];
    areaOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } finally {
    isCityLoading.value = false;
  }
});

watch(city, async (newCity) => {
  const token = ++cityReqToken;

  setFieldValue('area', '');
  setFieldValue('zipCode', '');

  areaOptions.value = [{ value: '', label: '行政區' }];
  districtList.value = [];

  if (!newCity) return;

  try {
    isAreaLoading.value = true;

    const res = await getDistrictsByCity(newCity);
    const districts: DistrictInfo[] = (res as any)?.data ?? [];

    if (token !== cityReqToken) return;

    districtList.value = districts;
    areaOptions.value = [
      { value: '', label: '行政區' },
      ...districts.map((item) => ({
        value: item.districtName,
        label: item.districtName,
      })),
    ];
  } catch (error) {
    console.error('Register - load districts error:', error);

    if (token !== cityReqToken) return;

    areaOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } finally {
    if (token === cityReqToken) {
      isAreaLoading.value = false;
    }
  }
});

watch(area, async (newArea) => {
  const token = ++areaReqToken;

  setFieldValue('zipCode', '');

  if (!newArea || !city.value) return;

  const hit = districtList.value.find(
    (item) => item.city === city.value && item.districtName === newArea,
  );

  if (token !== areaReqToken) return;

  setFieldValue('zipCode', hit?.zipCode || '');
});

watch(referralCode, (code) => {
  if (code?.trim()) {
    validateReferral(code.trim());
  } else {
    resetReferral();
  }
});

onUnmounted(() => {
  resetReferral();
});

const onSubmit = handleSubmit(
  async (values) => {
    submitted.value = true;
    isSubmitting.value = true;

    try {
      registerStore.email.value = values.email;
      registerStore.password.value = values.password;
      registerStore.confirmPassword.value = values.confirmPassword;
      registerStore.nickname.value = values.nickname;
      registerStore.referralCode.value = values.referralCode?.trim() ?? '';

      await registerStore.submitRegister({
        phoneNumber: values.phoneNumber,
        lineId: values.lineId,
        addressName: values.addressName?.trim() || undefined,
        zipCode: values.zipCode?.trim() || undefined,
        city: values.city || undefined,
        area: values.area || undefined,
        address: values.address?.trim() || undefined,
      });
    } finally {
      isSubmitting.value = false;
    }
  },
  async () => {
    submitted.value = true;
  },
);
</script>

<template>
  <main class="register">
    <section class="register__card">
      <header class="register__header">
        <div>
          <p class="register__eyebrow">MEMBER REGISTER</p>
          <h1 class="register__title">註冊會員</h1>
        </div>
      </header>

      <form class="register__body" @submit.prevent="onSubmit">
        <div class="register__columns">
          <!-- 左側：帳號資料 -->
          <div class="register__column register__column--left">
            <div class="register__formHead">
              <h2 class="register__formTitle">帳號資料</h2>
              <p class="register__formDesc">設定登入信箱、密碼與手機號碼。</p>
            </div>

            <div class="register__section">
              <div class="register__grid">
                <div class="register__field">
                  <label class="register__label register__label--required">
                    信箱
                  </label>

                  <input
                    v-model="email"
                    v-bind="emailProps"
                    class="register__input"
                    :class="{
                      'register__input--error': submitted && errors.email,
                    }"
                    type="email"
                    placeholder="請輸入信箱"
                  />

                  <p v-if="submitted && errors.email" class="register__error">
                    {{ errors.email }}
                  </p>
                </div>

                <div class="register__field">
                  <label class="register__label register__label--required">
                    密碼
                  </label>

                  <div class="register__password">
                    <input
                      v-model="password"
                      v-bind="passwordProps"
                      class="register__input register__input--password"
                      :class="{
                        'register__input--error': submitted && errors.password,
                      }"
                      :type="passwordInputType"
                      placeholder="請輸入密碼"
                    />

                    <button
                      class="register__eyeBtn"
                      type="button"
                      :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                      @click="showPassword = !showPassword"
                    >
                      <font-awesome-icon
                        :icon="
                          showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']
                        "
                      />
                    </button>
                  </div>

                  <p
                    v-if="submitted && errors.password"
                    class="register__error"
                  >
                    {{ errors.password }}
                  </p>
                </div>

                <div class="register__field">
                  <label class="register__label register__label--required">
                    確認密碼
                  </label>

                  <div class="register__password">
                    <input
                      v-model="confirmPassword"
                      v-bind="confirmPasswordProps"
                      class="register__input register__input--password"
                      :class="{
                        'register__input--error':
                          submitted && errors.confirmPassword,
                      }"
                      :type="confirmPasswordInputType"
                      placeholder="請再次輸入密碼"
                    />

                    <button
                      class="register__eyeBtn"
                      type="button"
                      :aria-label="
                        showConfirmPassword ? '隱藏密碼' : '顯示密碼'
                      "
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <font-awesome-icon
                        :icon="
                          showConfirmPassword
                            ? ['fas', 'eye-slash']
                            : ['fas', 'eye']
                        "
                      />
                    </button>
                  </div>

                  <p
                    v-if="submitted && errors.confirmPassword"
                    class="register__error"
                  >
                    {{ errors.confirmPassword }}
                  </p>
                </div>

                <div class="register__field">
                  <label class="register__label register__label--required">
                    手機
                  </label>

                  <input
                    v-model="phoneNumber"
                    v-bind="phoneNumberProps"
                    class="register__input"
                    :class="{
                      'register__input--error': submitted && errors.phoneNumber,
                    }"
                    type="tel"
                    placeholder="請輸入手機號碼"
                  />

                  <p
                    v-if="submitted && errors.phoneNumber"
                    class="register__error"
                  >
                    {{ errors.phoneNumber }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 右側：會員資訊 + 收貨資料 -->
          <div class="register__column register__column--right">
            <div class="register__formHead">
              <h2 class="register__formTitle">會員資訊</h2>
              <p class="register__formDesc">
                填寫暱稱、LINE ID 與選填收貨資料。
              </p>
            </div>

            <div class="register__section">
              <div class="register__grid register__grid--two">
                <div class="register__field">
                  <label class="register__label register__label--required">
                    暱稱
                  </label>

                  <input
                    v-model="nickname"
                    v-bind="nicknameProps"
                    class="register__input"
                    :class="{
                      'register__input--error': submitted && errors.nickname,
                    }"
                    placeholder="請輸入暱稱"
                  />

                  <p
                    v-if="submitted && errors.nickname"
                    class="register__error"
                  >
                    {{ errors.nickname }}
                  </p>
                </div>

                <div class="register__field">
                  <label class="register__label register__label--required">
                    LINE ID
                  </label>

                  <input
                    v-model="lineId"
                    v-bind="lineIdProps"
                    class="register__input"
                    :class="{
                      'register__input--error': submitted && errors.lineId,
                    }"
                    placeholder="請輸入 LINE ID"
                  />

                  <p v-if="submitted && errors.lineId" class="register__error">
                    {{ errors.lineId }}
                  </p>
                </div>

                <div class="register__field register__field--full">
                  <label class="register__label">推薦碼</label>

                  <input
                    id="referralCode"
                    v-model="referralCode"
                    v-bind="referralCodeProps"
                    class="register__input"
                    :class="{
                      'register__input--error':
                        submitted && errors.referralCode,
                      'register__input--valid': referralIsValid === true,
                      'register__input--invalid': referralIsValid === false,
                    }"
                    placeholder="選填，輸入後自動驗證"
                    maxlength="20"
                    aria-describedby="referralCode-status"
                  />

                  <p
                    v-if="referralValidating"
                    id="referralCode-status"
                    class="register__hint register__hint--muted"
                  >
                    驗證推薦碼中...
                  </p>

                  <p
                    v-else-if="referralIsValid === true"
                    id="referralCode-status"
                    class="register__hint register__hint--success"
                  >
                    有效推薦碼
                    <span v-if="referralOwnerName">
                      ，由 {{ referralOwnerName }} 提供
                    </span>
                  </p>

                  <p
                    v-else-if="referralIsValid === false"
                    id="referralCode-status"
                    class="register__hint register__hint--error"
                  >
                    {{ referralError }}
                  </p>

                  <p v-else id="referralCode-status"></p>

                  <p
                    v-if="submitted && errors.referralCode"
                    class="register__error"
                  >
                    {{ errors.referralCode }}
                  </p>
                </div>
              </div>
            </div>

            <div class="register__divider"></div>

            <div class="register__formHead register__formHead--sub">
              <h2 class="register__formTitle register__formTitle--small">
                收貨資料
              </h2>
              <p class="register__formDesc">
                此區可先選填，之後也能在會員中心補上。
              </p>
            </div>

            <div class="register__section register__section--last">
              <div class="register__grid register__grid--two">
                <div class="register__field">
                  <label class="register__label">收貨姓名</label>

                  <input
                    v-model="addressName"
                    v-bind="addressNameProps"
                    class="register__input"
                    :class="{
                      'register__input--error': submitted && errors.addressName,
                    }"
                    placeholder="選填"
                  />

                  <p
                    v-if="submitted && errors.addressName"
                    class="register__error"
                  >
                    {{ errors.addressName }}
                  </p>
                </div>

                <div class="register__field">
                  <label class="register__label">縣市 / 行政區</label>

                  <div class="register__addrGrid">
                    <select
                      v-model="city"
                      v-bind="cityProps"
                      class="register__select"
                      :class="{
                        'register__select--error': submitted && errors.city,
                      }"
                      :disabled="isCityLoading"
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

                    <select
                      v-model="area"
                      v-bind="areaProps"
                      class="register__select"
                      :class="{
                        'register__select--error':
                          submitted && !!city && errors.area,
                      }"
                      :disabled="isAreaLoading"
                    >
                      <option
                        v-for="opt in areaOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{
                          isAreaLoading && opt.value === ''
                            ? '載入行政區中...'
                            : opt.label
                        }}
                      </option>
                    </select>
                  </div>

                  <p v-if="submitted && errors.city" class="register__error">
                    {{ errors.city }}
                  </p>

                  <p v-if="submitted && errors.area" class="register__error">
                    {{ errors.area }}
                  </p>
                </div>

                <div class="register__field register__field--full">
                  <label class="register__label">詳細地址</label>

                  <input
                    v-model="address"
                    v-bind="addressProps"
                    class="register__input"
                    :class="{
                      'register__input--error': submitted && errors.address,
                    }"
                    placeholder="選填"
                  />

                  <p v-if="submitted && errors.address" class="register__error">
                    {{ errors.address }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 條款：獨立一整列 -->
        <div class="register__termsRow">
          <div
            class="register__terms"
            :class="{
              'register__terms--error': submitted && errors.agreeTerms,
            }"
          >
            <input
              id="agreeTerms"
              v-model="agreeTerms"
              class="register__checkbox"
              type="checkbox"
            />

            <label for="agreeTerms" class="register__termsText">
              我同意 <u>STARDO</u> 提供的
              <u>
                <a href="./policy" target="_blank">網站服務條款</a>
              </u>
              與
              <u>
                <a href="./privacy" target="_blank">隱私權政策</a>
              </u>
              。
            </label>
          </div>

          <p v-if="submitted && errors.agreeTerms" class="register__error">
            {{ errors.agreeTerms }}
          </p>
        </div>

        <!-- 按鈕：獨立一整列 -->
        <div class="register__actionRow">
          <button
            type="submit"
            class="register__submitBtn"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="register__spinner"></span>
            <template v-else>註冊成為會員</template>
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped lang="scss">
.register {
  min-height: 100vh;
  padding: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  z-index: 999;

  background:
    radial-gradient(circle at 8% 0%, rgba(180, 51, 37, 0.06), transparent 30%),
    radial-gradient(
      circle at 92% 10%,
      rgba(229, 166, 87, 0.12),
      transparent 28%
    ),
    #fff;

  color: #241610;

  --primary: #b43325;
  --primary-dark: #3f2412;
  --primary-soft: rgba(180, 51, 37, 0.1);
  --gold: #e4aa43;
  --gold-soft: rgba(228, 170, 67, 0.18);
  --cream: #fff8ef;
  --text: #241610;
  --text-soft: rgba(36, 22, 16, 0.58);
  --line: rgba(63, 36, 18, 0.1);
  --danger: #b42318;
  --success: #2e7d32;
}

.register__card {
  width: min(1180px, 100%);
  overflow: hidden;

  border-radius: 34px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 26px 70px rgba(63, 36, 18, 0.12);
}

.register__header {
  min-height: 112px;
  padding: 26px 36px;

  display: flex;
  align-items: center;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(255, 255, 255, 0.32),
      transparent 32%
    ),
    linear-gradient(135deg, #4a2617 0%, #b43325 58%, #d66b42 100%);
  color: #fff;
}

.register__eyebrow {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 8px;

  display: inline-flex;
  align-items: center;

  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.92);

  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.8px;
}

.register__title {
  margin: 0;

  color: #fff;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: 3px;
}

.register__headerDesc {
  max-width: 560px;
  margin: 10px 0 0;

  color: rgba(255, 255, 255, 0.82);
  font-size: 15px;
  line-height: 1.7;
  font-weight: 800;
}

.register__body {
  background: #fff;
}

.register__columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.register__column {
  padding: 48px 56px;

  &--left {
    background:
      radial-gradient(
        circle at 92% 8%,
        rgba(180, 51, 37, 0.08),
        transparent 32%
      ),
      linear-gradient(180deg, #fff8ef 0%, #ffffff 100%);
    border-right: 1px solid var(--line);
  }

  &--right {
    background: #fff;
  }
}

.register__formHead {
  margin-bottom: 24px;

  &--sub {
    margin-top: 24px;
    margin-bottom: 18px;
  }
}

.register__stepText {
  width: fit-content;
  min-height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  margin: 0 0 9px;

  display: inline-flex;
  align-items: center;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 12px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: 1.3px;

  &--optional {
    background: var(--gold-soft);
    color: #9a6414;
  }
}

.register__formTitle {
  margin: 0;

  color: var(--text);
  font-size: 31px;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: 1px;

  &--small {
    font-size: 25px;
  }
}

.register__formDesc {
  margin: 8px 0 0;

  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.6;
  font-weight: 800;
}

.register__section {
  padding: 0;
  background: transparent;

  &--last {
    margin-bottom: 0;
  }
}

.register__grid {
  display: grid;
  gap: 18px;

  &--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.register__field {
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }
}

.register__label {
  display: block;
  margin-bottom: 8px;

  color: rgba(36, 22, 16, 0.72);
  font-size: 14px;
  font-weight: 900;

  &--required {
    &::after {
      content: '*';
      margin-left: 4px;
      color: var(--primary);
      font-weight: 950;
    }
  }
}

.register__input,
.register__select {
  width: 100%;
  height: 58px;
  padding: 0 18px;
  border-radius: 18px;
  border: 1px solid var(--line);
  outline: none;
  box-sizing: border-box;

  background: #fff;
  color: var(--text);

  font-size: 15px;
  font-weight: 850;

  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease,
    opacity 0.16s ease;

  &::placeholder {
    color: rgba(36, 22, 16, 0.34);
  }

  &:focus {
    border-color: rgba(180, 51, 37, 0.48);
    box-shadow: 0 0 0 4px rgba(180, 51, 37, 0.1);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    background: #faf7f3;
  }
}

.register__select {
  appearance: none;
  cursor: pointer;

  background-image:
    linear-gradient(45deg, transparent 50%, rgba(36, 22, 16, 0.55) 50%),
    linear-gradient(135deg, rgba(36, 22, 16, 0.55) 50%, transparent 50%);
  background-position:
    calc(100% - 20px) 25px,
    calc(100% - 14px) 25px;
  background-size:
    6px 6px,
    6px 6px;
  background-repeat: no-repeat;
}

.register__input--password {
  padding-right: 54px;
}

.register__input--error,
.register__select--error,
.register__terms--error {
  border-color: rgba(180, 35, 24, 0.62) !important;
  box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
}

.register__input--valid {
  border-color: rgba(46, 125, 50, 0.62);
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.08);
}

.register__input--invalid {
  border-color: rgba(180, 35, 24, 0.62);
  box-shadow: 0 0 0 4px rgba(180, 35, 24, 0.08);
}

.register__password {
  position: relative;
}

.register__eyeBtn {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);

  width: 40px;
  height: 40px;
  border-radius: 15px;
  border: 0;
  cursor: pointer;

  display: grid;
  place-items: center;

  background: transparent;
  color: var(--text-soft);

  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    color: var(--primary);
    background: var(--primary-soft);
  }

  &:active {
    transform: translateY(-50%) scale(0.96);
  }
}

.register__addrGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.register__hint,
.register__error {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 850;
}

.register__error,
.register__hint--error {
  color: var(--danger);
}

.register__hint--success {
  color: var(--success);
}

.register__hint--muted {
  color: var(--text-soft);
}

.register__divider {
  height: 1px;
  margin: 24px 0;
  background: var(--line);
}

.register__termsRow {
  padding: 0 56px;
}

.register__terms {
  padding: 16px 18px;
  border-radius: 20px;

  display: flex;
  align-items: flex-start;
  gap: 12px;

  background: var(--cream);
  border: 1px solid var(--line);
}

.register__checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--primary);
  flex: 0 0 auto;
  cursor: pointer;
}

.register__termsText {
  color: rgba(36, 22, 16, 0.72);
  font-size: 14px;
  line-height: 1.7;
  font-weight: 850;

  a {
    color: var(--primary);
    font-weight: 950;
    text-underline-offset: 4px;
  }
}

.register__actionRow {
  padding: 24px 56px 48px;

  display: flex;
  justify-content: center;
}

.register__submitBtn {
  width: min(420px, 100%);
  min-height: 60px;
  border-radius: 999px;
  border: 1px solid var(--primary);
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  background: linear-gradient(135deg, var(--primary) 0%, #d66b42 100%);
  color: #fff;

  font-size: 20px;
  font-weight: 950;
  letter-spacing: 2px;
  box-shadow: 0 16px 30px rgba(180, 51, 37, 0.2);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease,
    background 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 20px 38px rgba(180, 51, 37, 0.28);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.register__spinner {
  width: 17px;
  height: 17px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  animation: registerSpin 0.7s linear infinite;
}

@media (max-width: 1080px) {
  .register {
    padding: 18px;
  }

  .register__columns {
    grid-template-columns: 1fr;
  }

  .register__column {
    padding: 42px;
  }

  .register__column--left {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .register__termsRow {
    padding: 0 42px;
  }

  .register__actionRow {
    padding: 24px 42px 42px;
  }
}

@media (max-width: 640px) {
  .register {
    padding: 0;
    align-items: stretch;
  }

  .register__card {
    min-height: 100vh;
    border-radius: 0;
    border: 0;
    box-shadow: none;
  }

  .register__header {
    min-height: 104px;
    padding: 24px 18px;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 14px 28px rgba(63, 36, 18, 0.12);
  }

  .register__title {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .register__headerDesc {
    font-size: 13px;
  }

  .register__eyebrow {
    min-height: 24px;
    padding: 0 10px;
    margin-bottom: 7px;

    font-size: 11px;
    letter-spacing: 1.3px;
  }

  .register__column {
    padding: 30px 16px;
  }

  .register__formTitle {
    font-size: 25px;

    &--small {
      font-size: 22px;
    }
  }

  .register__formDesc {
    font-size: 13px;
  }

  .register__stepText {
    min-height: 24px;
    padding: 0 10px;

    font-size: 11px;
    letter-spacing: 1.2px;
  }

  .register__grid--two,
  .register__addrGrid {
    grid-template-columns: 1fr;
  }

  .register__input,
  .register__select {
    height: 52px;
    border-radius: 15px;
    font-size: 14px;
  }

  .register__select {
    background-position:
      calc(100% - 20px) 22px,
      calc(100% - 14px) 22px;
  }

  .register__termsRow {
    padding: 0 16px;
  }

  .register__terms {
    padding: 14px;
    border-radius: 18px;
  }

  .register__termsText {
    font-size: 13px;
  }

  .register__actionRow {
    padding: 20px 16px 30px;
  }

  .register__submitBtn {
    min-height: 54px;
    font-size: 17px;
  }
}

@media (max-width: 380px) {
  .register__column {
    padding-left: 14px;
    padding-right: 14px;
  }

  .register__title {
    font-size: 26px;
  }

  .register__termsRow {
    padding-left: 14px;
    padding-right: 14px;
  }

  .register__actionRow {
    padding-left: 14px;
    padding-right: 14px;
  }
}

@keyframes registerSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>
