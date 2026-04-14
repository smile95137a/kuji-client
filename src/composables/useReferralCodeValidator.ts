// src/composables/useReferralCodeValidator.ts
import { ref } from 'vue';
import { validateCode } from '@/services/referralService';

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
        const data = await validateCode(code.trim(), abortController.signal);
        isValid.value = data?.valid ?? false;
        ownerName.value = data?.referrerNickname;

        if (!isValid.value) {
          const reason = data?.reason;
          if (reason === 'CODE_EXPIRED') {
            validationError.value = '推薦碼已過期';
          } else if (reason === 'CODE_DISABLED') {
            validationError.value = '推薦碼已停用';
          } else if (reason === 'SELF_REFERRAL') {
            validationError.value = '不能使用自己的推薦碼';
          } else if (reason === 'ALREADY_USED') {
            validationError.value = '已套用過推薦碼';
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
