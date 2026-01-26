import { useOverlayStore } from '@/stores/overlay';
import { ichibanInfoDialog } from './dialog/ichibanInfoDialog';
import { getErrorMessage } from './ErrorUtils';
import { withLoading } from './loadingUtils';

interface ExecuteApiOptions<T> {
  fn: () => Promise<ApiResponse<T> | T>;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  onSuccess?: (res: T) => void | Promise<void>;
  onFail?: (res: T | undefined) => void | Promise<void>;
  showCatchDialog?: boolean;
  showFailDialog?: boolean;
  showSuccessDialog?: boolean;
  finalFn?: () => void | Promise<void>;
}
export async function executeApi<T = any>({
  fn,
  successTitle = '成功',
  successMessage = '操作成功',
  errorTitle = '錯誤',
  errorMessage = '操作失敗，請稍後再試。',
  onSuccess,
  onFail,
  showCatchDialog = true,
  showFailDialog = false,
  showSuccessDialog = false,
  finalFn,
}: ExecuteApiOptions<T>): Promise<ApiResponse<T> | null> {
  const overlay = useOverlayStore();
  try {
    const res = await withLoading(() => fn());

    const normalized: ApiResponse<T> =
      (res as any)?.success !== undefined
        ? (res as ApiResponse<T>)
        : { success: true, code: '', data: res as T, message: '' };

    const { success, data, message } = normalized;

    if (success) {
      if (showSuccessDialog) {
        overlay.open();
        await ichibanInfoDialog({
          title: successTitle,
          content: message || successMessage,
        });
        overlay.close();
      }
      if (onSuccess) await onSuccess(data!);
    } else {
      if (showFailDialog) {
        overlay.open();
        await ichibanInfoDialog({
          title: errorTitle,
          content: message || errorMessage,
        });
        overlay.close();
      }
      if (onFail) await onFail(data);
    }
    return normalized;
  } catch (error) {
    if (showCatchDialog) {
      overlay.open();
      await ichibanInfoDialog({
        title: errorTitle,
        content: getErrorMessage(error),
      });
      overlay.close();
    }
    return null;
  } finally {
    if (finalFn) await finalFn();
  }
}
