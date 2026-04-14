// src/composables/useAddressBook.ts
import { ref } from 'vue';
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from '@/services/userAddressService';

export interface AddressItem {
  id: string;
  addressName: string;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
  isDefault: boolean;
}

export function useAddressBook() {
  const addresses = ref<AddressItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await getUserAddresses();
      addresses.value = (res as any)?.data ?? (res as any) ?? [];
    } catch (e: any) {
      error.value = '取得地址失敗';
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: Partial<AddressItem>): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      await createUserAddress(payload);
      await fetchAll();
      return true;
    } catch (e: any) {
      error.value = '新增地址失敗';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: string, payload: Partial<AddressItem>): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      await updateUserAddress(id, payload);
      await fetchAll();
      return true;
    } catch (e: any) {
      error.value = '更新地址失敗';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      await deleteUserAddress(id);
      addresses.value = addresses.value.filter((a) => a.id !== id);
      return true;
    } catch (e: any) {
      error.value = '刪除地址失敗';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function setDefault(id: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      await setDefaultUserAddress(id);
      addresses.value = addresses.value.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      return true;
    } catch (e: any) {
      error.value = '設定預設地址失敗';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    addresses,
    isLoading,
    error,
    fetchAll,
    create,
    update,
    remove,
    setDefault,
  };
}
