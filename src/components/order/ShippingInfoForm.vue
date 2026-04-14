<template>
  <div class="shippingForm">
    <h4 class="shippingForm__title">補填收件資訊</h4>
    <p class="shippingForm__subtitle">您的訂單需要填寫收件資訊後才能出貨</p>

    <!-- Address selector -->
    <div class="shippingForm__field" v-if="addressBook.addresses.value.length">
      <label class="shippingForm__label">從地址簿選擇</label>
      <select class="shippingForm__input" @change="onAddressSelect">
        <option value="">— 手動填寫 —</option>
        <option
          v-for="a in addressBook.addresses.value"
          :key="a.id"
          :value="a.id"
        >
          {{ a.addressName || a.recipientName }} — {{ a.city }}{{ a.district }}{{ a.address }}
        </option>
      </select>
    </div>

    <div class="shippingForm__divider"></div>

    <!-- Manual fields -->
    <div class="shippingForm__field">
      <label class="shippingForm__label">收件人姓名 *</label>
      <input
        v-model="form.recipientName"
        class="shippingForm__input"
        placeholder="請輸入收件人姓名"
      />
    </div>

    <div class="shippingForm__field">
      <label class="shippingForm__label">聯絡電話 *</label>
      <input
        v-model="form.recipientPhone"
        class="shippingForm__input"
        placeholder="請輸入電話"
        type="tel"
      />
    </div>

    <div class="shippingForm__fieldRow">
      <div class="shippingForm__field">
        <label class="shippingForm__label">縣市 *</label>
        <input
          v-model="form.city"
          class="shippingForm__input"
          placeholder="縣市"
        />
      </div>
      <div class="shippingForm__field">
        <label class="shippingForm__label">行政區 *</label>
        <input
          v-model="form.district"
          class="shippingForm__input"
          placeholder="行政區"
        />
      </div>
    </div>

    <div class="shippingForm__field">
      <label class="shippingForm__label">詳細地址 *</label>
      <input
        v-model="form.address"
        class="shippingForm__input"
        placeholder="請輸入詳細地址"
      />
    </div>

    <p v-if="errorMsg" class="shippingForm__error">{{ errorMsg }}</p>

    <button
      class="shippingForm__btn"
      type="button"
      :disabled="isSubmitting || !isValid"
      @click="onSubmit"
    >
      <span v-if="isSubmitting" class="shippingForm__spinner"></span>
      <span v-else>確認送出</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useAddressBook, type AddressItem } from '@/composables/useAddressBook';

const props = defineProps<{
  isSubmitting?: boolean;
  errorMsg?: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', form: {
    recipientName: string;
    recipientPhone: string;
    city: string;
    district: string;
    address: string;
  }): void;
}>();

const addressBook = useAddressBook();

onMounted(() => addressBook.fetchAll());

const form = reactive({
  recipientName: '',
  recipientPhone: '',
  city: '',
  district: '',
  address: '',
});

const isValid = computed(
  () =>
    form.recipientName.trim() &&
    form.recipientPhone.trim() &&
    form.city.trim() &&
    form.district.trim() &&
    form.address.trim(),
);

function onAddressSelect(e: Event) {
  const id = (e.target as HTMLSelectElement).value;
  if (!id) return;
  const picked = addressBook.addresses.value.find((a: AddressItem) => a.id === id);
  if (picked) {
    form.recipientName = picked.recipientName ?? picked.addressName ?? '';
    form.recipientPhone = picked.phone ?? '';
    form.city = picked.city ?? '';
    form.district = picked.district ?? '';
    form.address = picked.address ?? '';
  }
}

function onSubmit() {
  if (!isValid.value) return;
  emit('submit', { ...form });
}
</script>

<style scoped>
.shippingForm {
  background: rgba(255, 152, 0, 0.05);
  border: 1px solid rgba(255, 152, 0, 0.25);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.shippingForm__title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffb74d;
  margin: 0;
}

.shippingForm__subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: -8px 0 0;
}

.shippingForm__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
}

.shippingForm__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.shippingForm__fieldRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.shippingForm__label {
  font-size: 0.813rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
}

.shippingForm__input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.shippingForm__input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.shippingForm__input:focus {
  border-color: rgba(255, 152, 0, 0.5);
}

.shippingForm__error {
  color: #f44336;
  font-size: 0.813rem;
  margin: 0;
}

.shippingForm__btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.shippingForm__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.shippingForm__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
