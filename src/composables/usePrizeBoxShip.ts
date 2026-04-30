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
  storeCode: string;
  storeName: string;
  storeAddress: string;
  remark: string;
}

export function usePrizeBoxShip(items: Ref<PrizeBoxItem[]>) {
  const { addresses, fetchAll: fetchAddresses } = useAddressBook();

  const selectedAddressId = ref<string>('');
  const isSubmitting = ref(false);
  const error = ref<string>('');
  const selectedAddressSnapshot = ref<Pick<
    ShipForm,
    'recipientName' | 'recipientPhone' | 'zipCode' | 'city' | 'district' | 'address'
  > | null>(null);

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
    storeCode: '',
    storeName: '',
    storeAddress: '',
    remark: '',
  });

  const isHomeDelivery = computed(
    () => String(selectedShipping.value?.code ?? '').toUpperCase() === 'HOME_DELIVERY',
  );

  const isConvenienceStorePickup = computed(() => {
    const code = String(selectedShipping.value?.code ?? '').toUpperCase();
    return code === 'SEVEN_ELEVEN' || code === 'FAMILY_MART';
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
    selectedAddressSnapshot.value = {
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      zipCode: form.zipCode,
      city: form.city,
      district: form.district,
      address: form.address,
    };
  }

  function clearSelectedAddress() {
    selectedAddressId.value = '';
    selectedAddressSnapshot.value = null;
  }

  function resetForm() {
    form.recipientName = '';
    form.recipientPhone = '';
    form.zipCode = '';
    form.city = '';
    form.district = '';
    form.address = '';
    form.storeCode = '';
    form.storeName = '';
    form.storeAddress = '';
    form.remark = '';

    selectedAddressId.value = '';
    selectedAddressSnapshot.value = null;
    selectedShippingId.value = '';
    error.value = '';
  }

  /** 載入地址本 + 配送方式，並自動套用預設地址 */
  async function init() {
    resetForm();

    shippingMethodsLoading.value = true;
    const [, methods] = await Promise.allSettled([
      fetchAddresses(),
      getShippingMethods(),
    ]);

    shippingMethodsLoading.value = false;

    if (methods.status === 'fulfilled') {
      shippingMethods.value = methods.value;
      if (!selectedShippingId.value && methods.value.length > 0) {
        selectedShippingId.value = methods.value[0].id;
      }
    } else {
      shippingMethods.value = [];
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

  watch(
    () => [
      form.recipientName,
      form.recipientPhone,
      form.zipCode,
      form.city,
      form.district,
      form.address,
    ],
    ([recipientName, recipientPhone, zipCode, city, district, address]) => {
      const snapshot = selectedAddressSnapshot.value;
      if (!selectedAddressId.value || !snapshot) return;

      const isSame =
        recipientName === snapshot.recipientName &&
        recipientPhone === snapshot.recipientPhone &&
        zipCode === snapshot.zipCode &&
        city === snapshot.city &&
        district === snapshot.district &&
        address === snapshot.address;

      if (!isSame) {
        clearSelectedAddress();
      }
    },
  );

  /** 驗證表單必填（含配送方式） */
  const isFormValid = computed(() => {
    const hasShipping = selectedShippingId.value !== '';
    const hasRecipient =
      form.recipientName.trim() !== '' &&
      form.recipientPhone.trim() !== '';

    if (!hasShipping || !hasRecipient) return false;

    if (isHomeDelivery.value) {
      return buildRecipientAddress() !== '';
    }

    if (isConvenienceStorePickup.value) {
      return (
        form.storeCode.trim() !== '' &&
        form.storeName.trim() !== '' &&
        form.storeAddress.trim() !== ''
      );
    }

    return false;
  });

  function buildRecipientAddress() {
    return `${form.zipCode.trim()}${form.city.trim()}${form.district.trim()}${form.address.trim()}`
      .trim();
  }

  function getSubmitErrorMessage(res?: any, fallback = '出貨失敗，請稍後再試') {
    return (
      res?.error?.message ||
      res?.message ||
      res?.error?.code ||
      fallback
    );
  }

  /**
   * 送出出貨：後端會自動依 storeId 分單，前端只需一次呼叫
   */
  async function submit(): Promise<boolean> {
    if (isSubmitting.value) return false;

    if (!isFormValid.value) {
      if (!selectedShippingId.value) {
        error.value = '請選擇配送方式';
      } else if (isHomeDelivery.value) {
        error.value = '宅配到府需填寫完整收件資訊與地址';
      } else if (isConvenienceStorePickup.value) {
        error.value = '超商取貨需填寫完整收件人與門市資訊';
      } else {
        error.value = '請填寫完整配送資訊';
      }
      return false;
    }

    const shipping = selectedShipping.value!;
    const shippingCode = String(shipping.code ?? '').toUpperCase();
    const recipientAddress = isHomeDelivery.value ? buildRecipientAddress() : '';
    const userAddressId = isHomeDelivery.value
      ? (selectedAddressId.value || null)
      : null;

    isSubmitting.value = true;
    error.value = '';

    const errors: string[] = [];

    for (const group of storeGroups.value) {
      const req: PrizeBoxShipReq = {
        prizeBoxIds: group.items.map((i) => i.id),
        shippingMethod: shippingCode,
        shippingMethodId: shipping.id,
        shippingFee: shipping.fee,
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        recipientAddress: recipientAddress || null,
        storeCode: isConvenienceStorePickup.value ? form.storeCode.trim() : null,
        storeName: isConvenienceStorePickup.value ? form.storeName.trim() : null,
        storeAddress: isConvenienceStorePickup.value
          ? form.storeAddress.trim()
          : null,
        remark: form.remark.trim() || null,
        userAddressId,
      };

      try {
        const res = await shipPrizeBoxItems(req);
        if (res && !res.success) {
          errors.push(`【${group.storeName}】${getSubmitErrorMessage(res)}`);
        }
      } catch (e: any) {
        errors.push(
          `【${group.storeName}】${getSubmitErrorMessage(
            e?.response?.data,
            '出貨時發生錯誤',
          )}`,
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
    clearSelectedAddress,
    init,
    // 配送方式
    shippingMethods,
    shippingMethodsLoading,
    selectedShippingId,
    selectedShipping,
    isHomeDelivery,
    isConvenienceStorePickup,
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
