<!-- src/views/register/Register.vue -->
<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import Card from '@/components/common/MCard.vue';
import RegisterMainSection from '@/components/register/RegisterMainSection.vue';
import RegisterOtherSection from '@/components/register/RegisterOtherSection.vue';

import { useForm } from 'vee-validate';
import { useRoute } from 'vue-router';
import * as yup from 'yup';

import { useRegister } from '@/composables/useRegister';

const route = useRoute();
const registerStore = useRegister();

/**  送出後才顯示錯誤 */
const submitted = ref(false);
const isSubmitting = ref(false);
provide('registerSubmitted', submitted);
provide('registerIsSubmitting', isSubmitting);

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

const { handleSubmit, setFieldValue } = useForm({
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

// 從 URL ?ref=CODE 自動填入推薦碼
onMounted(() => {
  const refCode = route.query.ref;
  if (refCode && typeof refCode === 'string' && refCode.trim()) {
    setFieldValue('referralCode', refCode.trim());
    registerStore.referralCode.value = refCode.trim();
  }
});

const onSubmit = handleSubmit(
  async (values) => {
    submitted.value = true;
    isSubmitting.value = true;

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

    isSubmitting.value = false;
  },
  async () => {
    submitted.value = true;
  },
);
</script>

<template>
  <div class="register">
    <Card customClass="mcard--register">
      <template #header>
        <span>註冊會員</span>
      </template>

      <form @submit.prevent="onSubmit">
        <div class="register__container">
          <RegisterMainSection />
          <RegisterOtherSection />
        </div>
      </form>
    </Card>
  </div>
</template>
