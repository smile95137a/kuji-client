<!-- src/views/member/AddressBook.vue -->
<template>
  <section class="address-book">
    <header class="address-book__header">
      <h1 class="address-book__title">收件地址</h1>
      <p class="address-book__subtitle">管理您的收件地址，方便獎品寄送</p>
    </header>

    <div class="address-book__card">
      <div class="address-book__toolbar">
        <button
          class="address-book__btn address-book__btn--primary"
          type="button"
          @click="openAddDialog"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
          新增地址
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="address-book__loading">載入中...</div>

      <!-- Empty -->
      <div v-else-if="addresses.length === 0" class="address-book__empty">
        <font-awesome-icon
          :icon="['fas', 'map-location-dot']"
          class="address-book__empty-icon"
        />
        <p>尚未設定收件地址</p>
        <button
          class="address-book__btn address-book__btn--primary"
          type="button"
          @click="openAddDialog"
        >
          新增第一個地址
        </button>
      </div>

      <!-- Address List -->
      <div v-else class="address-book__list">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="address-book__item"
          :class="{ 'is-default': addr.isDefault }"
        >
          <div class="address-book__item-content">
            <div class="address-book__item-header">
              <span class="address-book__item-name">{{ addr.recipientName }}</span>
              <span v-if="addr.isDefault" class="address-book__badge">預設</span>
            </div>
            <p class="address-book__item-phone">{{ addr.recipientPhone }}</p>
            <p class="address-book__item-address">
              {{ addr.zipCode }} {{ addr.city }}{{ addr.district }}{{ addr.address }}
            </p>
          </div>

          <div class="address-book__item-actions">
            <button
              v-if="!addr.isDefault"
              class="address-book__action-btn"
              type="button"
              @click="setDefault(addr.id)"
              title="設為預設"
            >
              <font-awesome-icon :icon="['fas', 'star']" />
            </button>
            <button
              class="address-book__action-btn"
              type="button"
              @click="openEditDialog(addr)"
              title="編輯"
            >
              <font-awesome-icon :icon="['fas', 'pen']" />
            </button>
            <button
              class="address-book__action-btn address-book__action-btn--danger"
              type="button"
              @click="confirmDelete(addr)"
              title="刪除"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <div
      v-if="dialogOpen"
      class="address-book__overlay"
      @click.self="closeDialog"
    >
      <div class="address-book__dialog">
        <div class="address-book__dialog-header">
          <h3>{{ isEdit ? '編輯地址' : '新增地址' }}</h3>
          <button
            class="address-book__dialog-close"
            type="button"
            @click="closeDialog"
          >
            ✕
          </button>
        </div>

        <form class="address-book__form" @submit.prevent="onSubmit">
          <div class="address-book__form-group">
            <label>地址標籤 (如：家、公司)</label>
            <input
              v-model="form.label"
              type="text"
              placeholder="請輸入地址標籤"
            />
          </div>

          <div class="address-book__form-row">
            <div class="address-book__form-group">
              <label>收件人姓名 *</label>
              <input
                v-model="form.recipientName"
                type="text"
                placeholder="請輸入收件人姓名"
                required
              />
            </div>
            <div class="address-book__form-group">
              <label>聯絡電話 *</label>
              <input
                v-model="form.recipientPhone"
                type="tel"
                placeholder="請輸入聯絡電話"
                required
              />
            </div>
          </div>

          <div class="address-book__form-row">
            <div class="address-book__form-group">
              <label>縣市 *</label>
              <select v-model="form.city" @change="onCityChange" required>
                <option value="">請選擇縣市</option>
                <option v-for="c in cities" :key="c.name" :value="c.name">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="address-book__form-group">
              <label>區域 *</label>
              <select v-model="form.district" @change="onDistrictChange" required>
                <option value="">請選擇區域</option>
                <option v-for="d in districts" :key="d.name" :value="d.name">
                  {{ d.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="address-book__form-group">
            <label>郵遞區號</label>
            <input
              v-model="form.zipCode"
              type="text"
              placeholder="郵遞區號"
              readonly
            />
          </div>

          <div class="address-book__form-group">
            <label>詳細地址 *</label>
            <input
              v-model="form.address"
              type="text"
              placeholder="請輸入詳細地址（路/街/巷/弄/號/樓）"
              required
            />
          </div>

          <div class="address-book__form-check">
            <label>
              <input type="checkbox" v-model="form.isDefault" />
              <span>設為預設地址</span>
            </label>
          </div>

          <div class="address-book__dialog-footer">
            <button
              type="button"
              class="address-book__btn address-book__btn--secondary"
              @click="closeDialog"
            >
              取消
            </button>
            <button
              type="submit"
              class="address-book__btn address-book__btn--primary"
              :disabled="submitting"
            >
              {{ submitting ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Dialog -->
    <div
      v-if="deleteDialogOpen"
      class="address-book__overlay"
      @click.self="deleteDialogOpen = false"
    >
      <div class="address-book__dialog address-book__dialog--sm">
        <div class="address-book__dialog-header">
          <h3>確認刪除</h3>
        </div>
        <div class="address-book__dialog-body">
          <p>確定要刪除這個收件地址嗎？此操作無法復原。</p>
        </div>
        <div class="address-book__dialog-footer">
          <button
            type="button"
            class="address-book__btn address-book__btn--secondary"
            @click="deleteDialogOpen = false"
          >
            取消
          </button>
          <button
            type="button"
            class="address-book__btn address-book__btn--danger"
            :disabled="submitting"
            @click="doDelete"
          >
            {{ submitting ? '刪除中...' : '確認刪除' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from '@/services/userAddressService';
import { getAllCities, getDistrictsByCity } from '@/services/districtService';
import { executeApi } from '@/utils/executeApiUtils';

interface AddressItem {
  id: string;
  label?: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  district: string;
  zipCode: string;
  address: string;
  isDefault: boolean;
}

interface CityItem {
  name: string;
}

interface DistrictItem {
  name: string;
  zipCode: string;
}

const loading = ref(false);
const submitting = ref(false);
const addresses = ref<AddressItem[]>([]);

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const isEdit = ref(false);
const editingId = ref<string | null>(null);
const deletingAddr = ref<AddressItem | null>(null);

const cities = ref<CityItem[]>([]);
const districts = ref<DistrictItem[]>([]);

const form = reactive({
  label: '',
  recipientName: '',
  recipientPhone: '',
  city: '',
  district: '',
  zipCode: '',
  address: '',
  isDefault: false,
});

const resetForm = () => {
  form.label = '';
  form.recipientName = '';
  form.recipientPhone = '';
  form.city = '';
  form.district = '';
  form.zipCode = '';
  form.address = '';
  form.isDefault = false;
  districts.value = [];
};

const mapAddress = (a: any): AddressItem => ({
  id: String(a?.id ?? ''),
  label: String(a?.label ?? ''),
  recipientName: String(a?.recipientName ?? a?.name ?? ''),
  recipientPhone: String(a?.recipientPhone ?? a?.phone ?? a?.phoneNumber ?? ''),
  city: String(a?.city ?? ''),
  district: String(a?.district ?? a?.area ?? ''),
  zipCode: String(a?.zipCode ?? ''),
  address: String(a?.address ?? ''),
  isDefault: Boolean(a?.isDefault ?? a?.defaultAddress ?? false),
});

const fetchAddresses = async () => {
  loading.value = true;
  await executeApi({
    fn: () => getUserAddresses(),
    onSuccess: (data) => {
      const list = Array.isArray(data) ? data : [];
      addresses.value = list.map(mapAddress);
    },
    showCatchDialog: true,
  });
  loading.value = false;
};

const fetchCities = async () => {
  await executeApi({
    fn: () => getAllCities(),
    onSuccess: (data) => {
      const list = Array.isArray(data) ? data : [];
      cities.value = list.map((c: any) => ({ name: String(c?.name ?? c) }));
    },
  });
};

const fetchDistricts = async (cityName: string) => {
  if (!cityName) {
    districts.value = [];
    return;
  }
  await executeApi({
    fn: () => getDistrictsByCity(cityName),
    onSuccess: (data) => {
      const list = Array.isArray(data) ? data : [];
      districts.value = list.map((d: any) => ({
        name: String(d?.districtName ?? d?.name ?? d?.district ?? ''),
        zipCode: String(d?.zipCode ?? d?.zip ?? ''),
      }));
    },
  });
};

const onCityChange = () => {
  form.district = '';
  form.zipCode = '';
  if (form.city) {
    fetchDistricts(form.city);
  } else {
    districts.value = [];
  }
};

const onDistrictChange = () => {
  const found = districts.value.find((d) => d.name === form.district);
  form.zipCode = found?.zipCode ?? '';
};

const openAddDialog = () => {
  isEdit.value = false;
  editingId.value = null;
  resetForm();
  dialogOpen.value = true;
};

const openEditDialog = async (addr: AddressItem) => {
  isEdit.value = true;
  editingId.value = addr.id;

  form.label = addr.label ?? '';
  form.recipientName = addr.recipientName;
  form.recipientPhone = addr.recipientPhone;
  form.city = addr.city;
  form.district = addr.district;
  form.zipCode = addr.zipCode;
  form.address = addr.address;
  form.isDefault = addr.isDefault;

  // 載入該城市的區域列表
  if (addr.city) {
    await fetchDistricts(addr.city);
  }

  dialogOpen.value = true;
};

const closeDialog = () => {
  dialogOpen.value = false;
  resetForm();
};

const onSubmit = async () => {
  submitting.value = true;

  const payload = {
    label: form.label.trim(),
    recipientName: form.recipientName.trim(),
    recipientPhone: form.recipientPhone.trim(),
    city: form.city,
    district: form.district,
    zipCode: form.zipCode,
    address: form.address.trim(),
    isDefault: form.isDefault,
  };

  if (isEdit.value && editingId.value) {
    await executeApi({
      fn: () => updateUserAddress(editingId.value!, payload),
      successTitle: '更新成功',
      successMessage: '地址已更新',
      showSuccessDialog: true,
      showCatchDialog: true,
      onSuccess: () => {
        closeDialog();
        fetchAddresses();
      },
    });
  } else {
    await executeApi({
      fn: () => createUserAddress(payload),
      successTitle: '新增成功',
      successMessage: '地址已新增',
      showSuccessDialog: true,
      showCatchDialog: true,
      onSuccess: () => {
        closeDialog();
        fetchAddresses();
      },
    });
  }

  submitting.value = false;
};

const setDefault = async (id: string) => {
  await executeApi({
    fn: () => setDefaultUserAddress(id),
    successTitle: '設定成功',
    successMessage: '已設為預設地址',
    showSuccessDialog: true,
    showCatchDialog: true,
    onSuccess: () => {
      fetchAddresses();
    },
  });
};

const confirmDelete = (addr: AddressItem) => {
  deletingAddr.value = addr;
  deleteDialogOpen.value = true;
};

const doDelete = async () => {
  if (!deletingAddr.value) return;

  submitting.value = true;

  await executeApi({
    fn: () => deleteUserAddress(deletingAddr.value!.id),
    successTitle: '刪除成功',
    successMessage: '地址已刪除',
    showSuccessDialog: true,
    showCatchDialog: true,
    onSuccess: () => {
      deleteDialogOpen.value = false;
      deletingAddr.value = null;
      fetchAddresses();
    },
  });

  submitting.value = false;
};

onMounted(() => {
  fetchAddresses();
  fetchCities();
});
</script>

<style scoped lang="scss">
.address-book {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px;
  }

  &__subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  &__card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &__toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 48px 16px;
    color: #999;
  }

  &__empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #ddd;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      border-color: #ff9800;
      background: #fffaf5;
    }

    &.is-default {
      border-color: #ff9800;
      background: #fff8e1;
    }
  }

  &__item-content {
    flex: 1;
  }

  &__item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__item-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  &__badge {
    font-size: 11px;
    padding: 2px 8px;
    background: #ff9800;
    color: #fff;
    border-radius: 10px;
  }

  &__item-phone {
    font-size: 14px;
    color: #666;
    margin: 0 0 4px;
  }

  &__item-address {
    font-size: 14px;
    color: #333;
    margin: 0;
  }

  &__item-actions {
    display: flex;
    gap: 8px;
  }

  &__action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: #f5f5f5;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #eee;
      color: #333;
    }

    &--danger:hover {
      background: #ffebee;
      color: #e53935;
    }
  }

  &__btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &--primary {
      background: linear-gradient(135deg, #ff9800, #ff5722);
      color: #fff;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
      }
    }

    &--secondary {
      background: #f5f5f5;
      color: #666;

      &:hover:not(:disabled) {
        background: #eee;
      }
    }

    &--danger {
      background: #e53935;
      color: #fff;

      &:hover:not(:disabled) {
        background: #c62828;
      }
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  &__dialog {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;

    &--sm {
      max-width: 400px;
    }
  }

  &__dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  &__dialog-close {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    color: #999;

    &:hover {
      color: #333;
    }
  }

  &__dialog-body {
    padding: 24px;

    p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
  }

  &__dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #eee;
  }

  &__form {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    input,
    select {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #ff9800;
      }

      &[readonly] {
        background: #f9f9f9;
        color: #999;
      }
    }
  }

  &__form-check {
    label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #333;
      cursor: pointer;

      input[type='checkbox'] {
        width: 18px;
        height: 18px;
        accent-color: #ff9800;
      }
    }
  }
}
</style>
