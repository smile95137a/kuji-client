<!-- src/components/register/RegisterMainSection.vue -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
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

const cityOptions = ref<Option[]>([{ value: '', label: '縣市' }]);
const areaOptions = ref<Option[]>([{ value: '', label: '行政區' }]);

const isCityLoading = ref(false);
const isAreaLoading = ref(false);

/** ✅ 快取：當前城市取得的行政區完整資料（含 zipCode） */
const districtList = ref<DistrictInfo[]>([]);

const { defineField, errors, setFieldValue } = useFormContext();

const [email, emailProps] = defineField('email');
const [phoneNumber, phoneNumberProps] = defineField('phoneNumber');
const [password, passwordProps] = defineField('password');
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword');

const [nickname, nicknameProps] = defineField('nickname');
const [lineId, lineIdProps] = defineField('lineId');

const [referralCode, referralCodeProps] = defineField('referralCode'); // ✅ 推薦碼（選填）

const [addressName, addressNameProps] = defineField('addressName');
const [city, cityProps] = defineField('city');
const [area, areaProps] = defineField('area');
const [address, addressProps] = defineField('address');

/** ✅ 防止 watch 快速切換造成舊請求覆蓋新請求 */
let cityReqToken = 0;
let areaReqToken = 0;

/** ✅ init: cities */
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

/** ✅ 當縣市改變 → 打 API 拿行政區 */
watch(
  city,
  async (newCity) => {
    const token = ++cityReqToken;

    // reset area + zipCode
    setFieldValue('area', '');
    setFieldValue('zipCode', '');
    areaOptions.value = [{ value: '', label: '行政區' }];
    districtList.value = []; // ✅ 清空快取

    if (!newCity) return;

    try {
      isAreaLoading.value = true;

      const res = await getDistrictsByCity(newCity);
      const districts: DistrictInfo[] = (res as any)?.data ?? [];

      // 如果中途切換 city，舊 request 回來就不要覆蓋
      if (token !== cityReqToken) return;

      // ✅ 快取完整資料（含 zipCode）
      districtList.value = districts;

      // ✅ 後端欄位是 districtName
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
      if (token === cityReqToken) {
        isAreaLoading.value = false;
      }
    }
  },
  { immediate: false },
);

/** ✅ 當行政區改變 → 直接從 districtList 找 zipCode（不用多打一支 API） */
watch(
  area,
  async (newArea) => {
    const token = ++areaReqToken;

    setFieldValue('zipCode', '');

    if (!newArea || !city.value) return;

    const hit = districtList.value.find(
      (d) => d.city === city.value && d.districtName === newArea,
    );

    if (token !== areaReqToken) return;

    if (hit?.zipCode) {
      setFieldValue('zipCode', hit.zipCode);
    } else {
      setFieldValue('zipCode', '');
    }
  },
  { immediate: false },
);
</script>

<template>
  <div class="register__main">
    <!-- 左半部 -->
    <div class="register__form">
      <div class="register__form-inputs">
        <p class="register__text register__text--required">信箱</p>
        <input
          class="register__form-input"
          v-model="email"
          v-bind="emailProps"
          :class="{ 'register__form-input--error': errors.email }"
          placeholder="請輸入信箱"
        />
        <p v-if="errors.email" class="register__text register__text--error">
          {{ errors.email }}
        </p>
      </div>

      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">密碼</p>
        <input
          class="register__form-input"
          type="password"
          v-model="password"
          v-bind="passwordProps"
          :class="{ 'register__form-input--error': errors.password }"
          placeholder="請輸入密碼"
        />
        <p v-if="errors.password" class="register__text register__text--error">
          {{ errors.password }}
        </p>
      </div>

      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">確認密碼</p>
        <input
          class="register__form-input"
          type="password"
          v-model="confirmPassword"
          v-bind="confirmPasswordProps"
          :class="{ 'register__form-input--error': errors.confirmPassword }"
          placeholder="請再次輸入密碼"
        />
        <p
          v-if="errors.confirmPassword"
          class="register__text register__text--error"
        >
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">手機</p>
        <input
          class="register__form-input"
          v-model="phoneNumber"
          v-bind="phoneNumberProps"
          :class="{ 'register__form-input--error': errors.phoneNumber }"
          placeholder="請輸入手機號碼"
        />
        <p
          v-if="errors.phoneNumber"
          class="register__text register__text--error"
        >
          {{ errors.phoneNumber }}
        </p>
      </div>
    </div>

    <!-- 中間分隔線 -->
    <div class="register__divider">
      <div class="register__divider-line"></div>
    </div>

    <!-- 右半部 -->
    <div class="register__form">
      <div class="register__form-inputs">
        <p class="register__text register__text--required">暱稱</p>
        <input
          class="register__form-input"
          v-model="nickname"
          v-bind="nicknameProps"
          :class="{ 'register__form-input--error': errors.nickname }"
          placeholder="請輸入暱稱"
        />
        <p v-if="errors.nickname" class="register__text register__text--error">
          {{ errors.nickname }}
        </p>
      </div>

      <div class="register__form-inputs m-t-20">
        <p class="register__text register__text--required">LINE ID</p>
        <input
          class="register__form-input"
          v-model="lineId"
          v-bind="lineIdProps"
          :class="{ 'register__form-input--error': errors.lineId }"
          placeholder="請輸入 LINE ID"
        />
        <p v-if="errors.lineId" class="register__text register__text--error">
          {{ errors.lineId }}
        </p>
      </div>

      <!-- ✅ 推薦碼（選填） -->
      <div class="register__form-inputs m-t-20">
        <p class="register__text">推薦碼</p>
        <input
          class="register__form-input"
          v-model="referralCode"
          v-bind="referralCodeProps"
          :class="{ 'register__form-input--error': errors.referralCode }"
          placeholder="選填（最多 20 字）"
        />
        <p
          v-if="errors.referralCode"
          class="register__text register__text--error"
        >
          {{ errors.referralCode }}
        </p>
      </div>

      <div class="register__form-inputs m-t-20">
        <p class="register__text">收貨姓名</p>
        <input
          class="register__form-input"
          v-model="addressName"
          v-bind="addressNameProps"
          :class="{ 'register__form-input--error': errors.addressName }"
          placeholder="選填"
        />
        <p
          v-if="errors.addressName"
          class="register__text register__text--error"
        >
          {{ errors.addressName }}
        </p>
      </div>

      <!-- ✅ 收貨地址：縣市 + 行政區（兩欄對齊版） -->
      <div class="register__form-inputs--addr m-t-20">
        <!-- 縣市 -->
        <div class="register__form-inputs">
          <p class="register__text">收貨地址</p>

          <div class="register__selectWrap">
            <select
              class="register__select"
              v-model="city"
              v-bind="cityProps"
              :class="{ 'register__select--error': errors.city }"
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

          <p v-if="errors.city" class="register__text register__text--error">
            {{ errors.city }}
          </p>
        </div>

        <!-- 行政區 -->
        <div class="register__form-inputs">
          <p class="register__text register__text--placeholder">收貨地址</p>

          <div class="register__selectWrap">
            <select
              class="register__select"
              v-model="area"
              v-bind="areaProps"
              :class="{ 'register__select--error': errors.area }"
              :disabled="!city || isAreaLoading"
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

          <p v-if="errors.area" class="register__text register__text--error">
            {{ errors.area }}
          </p>
        </div>
      </div>

      <div class="register__form-inputs m-t-20">
        <p class="register__text">詳細地址</p>
        <input
          class="register__form-input"
          v-model="address"
          v-bind="addressProps"
          :class="{ 'register__form-input--error': errors.address }"
          placeholder="選填"
        />
        <p v-if="errors.address" class="register__text register__text--error">
          {{ errors.address }}
        </p>
      </div>
    </div>
  </div>
</template>
