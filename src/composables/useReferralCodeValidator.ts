// src/composables/useReferralCodeValidator.ts
import { ref } from 'vue';
import { validateReferralCode } from '@/services/AuthService';

/**
 * 推薦碼即時驗證 composable。
 * - 600ms debounce（spec FR-SC-003）
 * - AbortController 取消舊請求（spec FR-SC-004）
 * - code 為空字串時不觸發 API，isValid = null（未驗證）
 */
export function useReferralCodeValidator() {
  const isValidating = ref(false);
  const isValid = ref<boolean | null>(null);
  const ownerName = ref<string | undefined>(undefined);
  const validationError = ref<string | undefined>(undefined);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;

  const reset = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    abortController?.abort();
    abortController = null;
    isValidating.value = false;
    isValid.value = null;
    ownerName.value = undefined;
    validationError.value = undefined;
  };

  const validate = (code: string) => {
    // 清空前次 debounce 與請求
    if (debounceTimer) clearTimeout(debounceTimer);
    abortController?.abort();

    if (!code.trim()) {
      reset();
      return;
    }

    isValidating.value = true;
    isValid.value = null;
    ownerName.value = undefined;
    validationError.value = undefined;

    debounceTimer = setTimeout(async () => {
      abortController = new AbortController();
      try {
        const res = await validateReferralCode(code.trim(), abortController.signal);
        const data = (res as any)?.data;
        isValid.value = data?.isValid ?? false;
        ownerName.value = data?.ownerName;

        if (!isValid.value) {
          const errorCode: string | undefined = data?.errorCode;
          if (errorCode === 'REFERRAL_CODE_EXPIRED') {
            validationError.value = '推薦碼已過期';
          } else if (errorCode === 'REFERRAL_CODE_MAXED') {
            validationError.value = '推薦碼已達使用上限';
          } else {
            validationError.value = '推薦碼無效';
          }
        }
      } catch (e: any) {
        // 忽略取消的請求
        if (e?.name === 'CanceledError' || e?.name === 'AbortError') return;
        isValid.value = false;
        validationError.value = '驗證失敗，請稍後再試';
      } finally {
        isValidating.value = false;
      }
    }, 600);
  };

  return { isValidating, isValid, ownerName, validationError, validate, reset };
}
