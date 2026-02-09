<script setup lang="ts">
import { inject, ref, type Ref } from 'vue';
import { useFormContext } from 'vee-validate';

const submitted = inject<Ref<boolean>>('registerSubmitted', ref(false));

const { defineField, errors } = useFormContext();
const [agreeTerms] = defineField('agreeTerms');
</script>

<template>
  <div class="register__other">
    <div class="register__checkbox">
      <input
        id="agreeTerms"
        type="checkbox"
        v-model="agreeTerms"
        :class="{ 'register__checkbox--error': submitted && errors.agreeTerms }"
      />
      <label for="agreeTerms">
        我同意 <u>STARDO</u> 提供的
        <u><a href="./policy" target="_blank">網站服務條款</a></u>
        與
        <u><a href="./privacy" target="_blank">隱私權政策</a></u
        >。
      </label>
    </div>

    <p
      v-if="submitted && errors.agreeTerms"
      class="register__text register__text--error"
    >
      {{ errors.agreeTerms }}
    </p>

    <div class="register__other-btn">
      <button type="submit" class="register__btn">註冊成為會員</button>
    </div>
  </div>
</template>
