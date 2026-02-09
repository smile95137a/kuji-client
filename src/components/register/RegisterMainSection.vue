<!-- src/components/register/RegisterMainSection.vue -->
<script setup lang="ts">
import { onMounted, ref, watch, inject, type Ref, computed } from 'vue';
import { useFormContext } from 'vee-validate';
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

const submitted = inject<Ref<boolean>>('registerSubmitted', ref(false));

const cityOptions = ref<Option[]>([{ value: '', label: '縣市' }]);
const areaOptions = ref<Option[]>([{ value: '', label: '行政區' }]);

const isCityLoading = ref(false);
const isAreaLoading = ref(false);

const districtList = ref<DistrictInfo[]>([]);

const { defineField, errors, setFieldValue } = useFormContext();

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

/**  密碼顯示切換 */
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordInputType = computed(() =>
  showPassword.value ? 'text' : 'password',
);
const confirmPasswordInputType = computed(() =>
  showConfirmPassword.value ? 'text' : 'password',
);

let cityReqToken = 0;
let areaReqToken = 0;

onMounted(async () => {
  try {
    isCityLoading.value = true;
    const res = await getAllCities();
    const cities: string[] = (res as any)?.data ?? [];

    cityOptions.value = [
      { value: '', label: '縣市' },
      ...cities.map((c) => ({ value: c, label: c })),
    ];

    areaOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } catch (e) {
    console.error('Register - load cities error:', e);
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
      ...districts.map((d) => ({
        value: d.districtName,
        label: d.districtName,
      })),
    ];
  } catch (e) {
    console.error('Register - load districts error:', e);
    if (token !== cityReqToken) return;

    areaOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = [];
  } finally {
    if (token === cityReqToken) isAreaLoading.value = false;
  }
});

watch(area, async (newArea) => {
  const token = ++areaReqToken;

  setFieldValue('zipCode', '');

  if (!newArea || !city.value) return;

  const hit = districtList.value.find(
    (d) => d.city === city.value && d.districtName === newArea,
  );

  if (token !== areaReqToken) return;

  setFieldValue('zipCode', hit?.zipCode || '');
});
</script>

<template>
  <div class="register__main">
    <div class="register__form">
      <!-- Email -->
      <div class="register__form-inputs">
        <p class="register__text register__text--required">信箱</p>
        <input
          class="register__form-input"
          v-model="email"
          v-bind="emailProps"
          :class="{ 'register__form-input--error': submitted && errors.email }"
          placeholder="請輸入信箱"
        />
        <p
          v-if="submitted && errors.email"
          class="register__text register__text--error"
        >
          {{ errors.email }}
        </p>
      </div>

      <!-- Password (with eye) -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">密碼</p>

        <div class="register__passwordWrap">
          <input
            class="register__form-input register__form-input--withIcon"
            :type="passwordInputType"
            v-model="password"
            v-bind="passwordProps"
            :class="{
              'register__form-input--error': submitted && errors.password,
            }"
            placeholder="請輸入密碼"
          />

          <button
            class="register__eyeBtn"
            type="button"
            :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
            @click="showPassword = !showPassword"
          >
            <font-awesome-icon
              :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            />
          </button>
        </div>

        <p
          v-if="submitted && errors.password"
          class="register__text register__text--error"
        >
          {{ errors.password }}
        </p>
      </div>

      <!-- Confirm Password (with eye) -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">確認密碼</p>

        <div class="register__passwordWrap">
          <input
            class="register__form-input register__form-input--withIcon"
            :type="confirmPasswordInputType"
            v-model="confirmPassword"
            v-bind="confirmPasswordProps"
            :class="{
              'register__form-input--error':
                submitted && errors.confirmPassword,
            }"
            placeholder="請再次輸入密碼"
          />

          <button
            class="register__eyeBtn"
            type="button"
            :aria-label="showConfirmPassword ? '隱藏密碼' : '顯示密碼'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <font-awesome-icon
              :icon="
                showConfirmPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']
              "
            />
          </button>
        </div>

        <p
          v-if="submitted && errors.confirmPassword"
          class="register__text register__text--error"
        >
          {{ errors.confirmPassword }}
        </p>
      </div>

      <!-- Phone -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">手機</p>
        <input
          class="register__form-input"
          v-model="phoneNumber"
          v-bind="phoneNumberProps"
          :class="{
            'register__form-input--error': submitted && errors.phoneNumber,
          }"
          placeholder="請輸入手機號碼"
        />
        <p
          v-if="submitted && errors.phoneNumber"
          class="register__text register__text--error"
        >
          {{ errors.phoneNumber }}
        </p>
      </div>
    </div>

    <div class="register__divider">
      <div class="register__divider-line"></div>
    </div>

    <div class="register__form">
      <!-- Nickname -->
      <div class="register__form-inputs">
        <p class="register__text register__text--required">暱稱</p>
        <input
          class="register__form-input"
          v-model="nickname"
          v-bind="nicknameProps"
          :class="{
            'register__form-input--error': submitted && errors.nickname,
          }"
          placeholder="請輸入暱稱"
        />
        <p
          v-if="submitted && errors.nickname"
          class="register__text register__text--error"
        >
          {{ errors.nickname }}
        </p>
      </div>

      <!-- LINE ID -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">LINE ID</p>
        <input
          class="register__form-input"
          v-model="lineId"
          v-bind="lineIdProps"
          :class="{ 'register__form-input--error': submitted && errors.lineId }"
          placeholder="請輸入 LINE ID"
        />
        <p
          v-if="submitted && errors.lineId"
          class="register__text register__text--error"
        >
          {{ errors.lineId }}
        </p>
      </div>

      <!-- Referral code -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text">推薦碼</p>
        <input
          class="register__form-input"
          v-model="referralCode"
          v-bind="referralCodeProps"
          :class="{
            'register__form-input--error': submitted && errors.referralCode,
          }"
          placeholder="選填（最多 20 字）"
        />
        <p
          v-if="submitted && errors.referralCode"
          class="register__text register__text--error"
        >
          {{ errors.referralCode }}
        </p>
      </div>

      <!-- Address name -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text">收貨姓名</p>
        <input
          class="register__form-input"
          v-model="addressName"
          v-bind="addressNameProps"
          :class="{
            'register__form-input--error': submitted && errors.addressName,
          }"
          placeholder="選填"
        />
        <p
          v-if="submitted && errors.addressName"
          class="register__text register__text--error"
        >
          {{ errors.addressName }}
        </p>
      </div>

      <!-- City + Area -->
      <div class="register__form-inputs--addr m-t-20">
        <div class="register__form-inputs">
          <p class="register__text">收貨地址</p>

          <div class="register__selectWrap">
            <select
              class="register__select"
              v-model="city"
              v-bind="cityProps"
              :class="{ 'register__select--error': submitted && errors.city }"
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
          </div>

          <p
            v-if="submitted && errors.city"
            class="register__text register__text--error"
          >
            {{ errors.city }}
          </p>
        </div>

        <div class="register__form-inputs">
          <p class="register__text register__text--placeholder">收貨地址</p>

          <div class="register__selectWrap">
            <select
              class="register__select"
              v-model="area"
              v-bind="areaProps"
              :class="{
                'register__select--error': submitted && !!city && errors.area,
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

          <p
            v-if="submitted && errors.area"
            class="register__text register__text--error"
          >
            {{ errors.area }}
          </p>
        </div>
      </div>

      <!-- Address -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text">詳細地址</p>
        <input
          class="register__form-input"
          v-model="address"
          v-bind="addressProps"
          :class="{
            'register__form-input--error': submitted && errors.address,
          }"
          placeholder="選填"
        />
        <p
          v-if="submitted && errors.address"
          class="register__text register__text--error"
        >
          {{ errors.address }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*  只新增密碼眼睛需要的兩個 class（其餘沿用你原本 register scss） */
.register__passwordWrap {
  position: relative;
}

.register__form-input--withIcon {
  padding-right: 44px; /* 讓出眼睛的空間 */
}

.register__eyeBtn {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);

  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: rgba(0, 0, 0, 0.55);
}

.register__eyeBtn:hover {
  color: rgba(0, 0, 0, 0.78);
}
</style>
