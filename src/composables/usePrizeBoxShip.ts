// src/composables/usePrizeBoxShip.ts
import { computed, reactive, ref, watch, type Ref } from 'vue';
import { useAddressBook, type AddressItem } from './useAddressBook';
import { shipPrizeBoxItems, type PrizeBoxShipReq } from '@/services/prizeBoxService';
import { getShippingMethods, type ShippingMethod } from '@/services/shippingMethodService';

export type { ShippingMethod };

export interface PrizeBoxItem {
  id: string;
  storeId: string;
  storeName: string;
  lotteryId: string;
  lotteryTitle: string;
  prizeName: string;
  prizeLevel: string;
  prizeImageUrl: string;
  status: string;
  isRecyclable: boolean;
  recycleBonus: number;
  createdAt: string;
}

export interface StoreGroup {
  storeId: string;
  storeName: string;
  items: PrizeBoxItem[];
}

export interface ShipForm {
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  city: string;
  district: string;
  address: string;
}

export function usePrizeBoxShip(items: Ref<PrizeBoxItem[]>) {
  const { addresses, fetchAll: fetchAddresses } = useAddressBook();

  const selectedAddressId = ref<string>('');
  const isSubmitting = ref(false);
  const error = ref<string>('');

  // 配送方式
  const shippingMethods = ref<ShippingMethod[]>([]);
  const shippingMethodsLoading = ref(false);
  const selectedShippingId = ref<string>('');

  const selectedShipping = computed<ShippingMethod | null>(
    () => shippingMethods.value.find((m) => m.id === selectedShippingId.value) ?? null,
  );

  const form = reactive<ShipForm>({
    recipientName: '',
    recipientPhone: '',
    zipCode: '',
    city: '',
    district: '',
    address: '',
  });

  /** 依 storeId 分組 */
  const storeGroups = computed<StoreGroup[]>(() => {
    const map = new Map<string, StoreGroup>();
    for (const item of items.value) {
      if (!map.has(item.storeId)) {
        map.set(item.storeId, {
          storeId: item.storeId,
          storeName: item.storeName,
          items: [],
        });
      }
      map.get(item.storeId)?.items.push(item);
    }
    return Array.from(map.values());
  });

  /** 套用地址本到表單 */
  function applyAddress(addr: AddressItem) {
    form.recipientName = addr.recipientName ?? '';
    form.recipientPhone = addr.phone ?? '';
    form.zipCode = addr.zipCode ?? '';
    form.city = addr.city ?? '';
    form.district = addr.district ?? '';
    form.address = addr.address ?? '';
    selectedAddressId.value = addr.id;
  }

  /** 載入地址本 + 配送方式，並自動套用預設地址 */
  async function init() {
    error.value = '';

    // 平行載入
    shippingMethodsLoading.value = true;
    const [, methods] = await Promise.allSettled([
      fetchAddresses(),
      getShippingMethods(),
    ]);

    shippingMethodsLoading.value = false;

    if (methods.status === 'fulfilled') {
      shippingMethods.value = methods.value;
      // 預選第一個
      if (!selectedShippingId.value && methods.value.length > 0) {
        selectedShippingId.value = methods.value[0].id;
      }
    }

    const def = addresses.value.find((a) => a.isDefault);
    if (def) applyAddress(def);
    else if (addresses.value.length > 0) applyAddress(addresses.value[0]);
  }

  // 當地址清單在外部更新時，若尚未選擇，自動帶入預設
  watch(addresses, (list) => {
    if (selectedAddressId.value) return;
    const def = list.find((a) => a.isDefault) ?? list[0];
    if (def) applyAddress(def);
  });

  /** 驗證表單必填（含配送方式） */
  const isFormValid = computed(() => {
    return (
      selectedShippingId.value !== '' &&
      (form.recipientName ?? '').trim() !== '' &&
      (form.recipientPhone ?? '').trim() !== '' &&
      (form.city ?? '').trim() !== '' &&
      (form.district ?? '').trim() !== '' &&
      (form.address ?? '').trim() !== ''
    );
  });

  /**
   * 送出出貨：後端會自動依 storeId 分單，前端只需一次呼叫
   */
  async function submit(): Promise<boolean> {
    if (!isFormValid.value) {
      error.value = selectedShippingId.value
        ? '請填寫完整配送資訊'
        : '請選擇配送方式';
      return false;
    }

    const shipping = selectedShipping.value!;

    // 合併地址字串
    const recipientAddress = `${form.city.trim()}${form.district.trim()}${form.address.trim()}`;

    isSubmitting.value = true;
    error.value = '';

    const errors: string[] = [];

    for (const group of storeGroups.value) {
      const req: PrizeBoxShipReq = {
        prizeBoxIds: group.items.map((i) => i.id),
        shippingMethod: shipping.code,
        shippingMethodId: shipping.id,
        shippingFee: shipping.fee,
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        recipientAddress,
      };

      try {
        const res = await shipPrizeBoxItems(req);
        if (res && !res.success) {
          errors.push(
            `【${group.storeName}】${(res as any)?.error?.message ?? '出貨失敗'}`,
          );
        }
      } catch (e: any) {
        errors.push(
          `【${group.storeName}】${e?.response?.data?.error?.message ?? '出貨時發生錯誤'}`,
        );
      }
    }

    isSubmitting.value = false;

    if (errors.length > 0) {
      error.value = errors.join('\n');
      return false;
    }

    return true;
  }

  return {
    // 地址本
    addresses,
    selectedAddressId,
    applyAddress,
    init,
    // 配送方式
    shippingMethods,
    shippingMethodsLoading,
    selectedShippingId,
    selectedShipping,
    // 分組
    storeGroups,
    // 表單
    form,
    isFormValid,
    // 送出
    isSubmitting,
    error,
    submit,
  };
}
