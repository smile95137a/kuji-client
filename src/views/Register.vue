<!-- src/views/register/Register.vue -->
<script setup lang="ts">
import Card from '@/components/common/MCard.vue';
import RegisterMainSection from '@/components/register/RegisterMainSection.vue';
import RegisterOtherSection from '@/components/register/RegisterOtherSection.vue';

import { useForm } from 'vee-validate';
import { useRouter } from 'vue-router';
import * as yup from 'yup';

import { executeApi } from '@/utils/executeApiUtils';
import { register } from '@/services/AuthService';

const router = useRouter();

const schema = yup.object({
  email: yup.string().required('Email 是必填項').email('Email 格式不正確'),
  phoneNumber: yup.string().required('手機是必填項'),
  password: yup.string().required('密碼是必填項').min(6, '密碼最少6個字符'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], '密碼不匹配')
    .required('確認密碼是必填項'),
  nickname: yup.string().required('暱稱是必填項'),

  referralCode: yup.string().max(20, '推薦碼最多 20 字').nullable(),
  addressName: yup.string(),
  zipCode: yup.string(),
  city: yup.string(),
  area: yup.string(),
  address: yup.string(),

  lineId: yup.string().required('LINE ID 是必填項'),

  agreeTerms: yup
    .boolean()
    .oneOf([true], '您必須同意網站服務條款和隱私權政策。')
    .required(),
});

const { handleSubmit } = useForm({
  validationSchema: schema,
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

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    email: values.email,
    phoneNumber: values.phoneNumber,
    password: values.password,
    confirmPassword: values.confirmPassword,
    nickname: values.nickname,
    lineId: values.lineId,

    referralCode: values.referralCode?.trim()
      ? values.referralCode.trim()
      : undefined,

    addressName: values.addressName?.trim() || undefined,
    zipCode: values.zipCode?.trim() || undefined,
    city: values.city || undefined,
    area: values.area || undefined,
    address: values.address?.trim() || undefined,
  };

  await executeApi({
    fn: () => register(payload),
    successTitle: '註冊成功',
    successMessage: '註冊成功，請重新登入',
    errorTitle: '註冊失敗',
    errorMessage: '註冊失敗，請稍後再試',

    onSuccess: async () => {
      await router.push({ name: 'login' });
    },
  });
});
</script>

<template>
  <div class="register">
    <Card customClass="mcard--register">
      <template #header>
        <span>註冊會員</span>
      </template>

      <form @submit="onSubmit">
        <div class="register__container">
          <RegisterMainSection />
          <RegisterOtherSection />
        </div>
      </form>
    </Card>
  </div>
</template>
