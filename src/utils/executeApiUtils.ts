import { useOverlayStore } from '@/stores/overlay';
import { ichibanInfoDialog } from './dialog/ichibanInfoDialog';
import { getErrorMessage } from './ErrorUtils';
import { withLoading } from './loadingUtils';

function pickApiErrorMessage(err: unknown, fallback: string) {
  const anyErr = err as any;

  const body = anyErr?.response?.data || anyErr?.data || anyErr;

  const msgFromBody =
    body?.error?.message || body?.message || body?.error?.code;

  const msg = msgFromBody || getErrorMessage(err) || fallback;

  return msg;
}

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
  onFinal?: () => void | Promise<void>;
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
  onFinal,
}: ExecuteApiOptions<T>): Promise<ApiResponse<T> | null> {
  const overlay = useOverlayStore();
  try {
    const res: any = await withLoading(() => fn());

    const { success, data, message } = res;
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
    return res;
  } catch (error) {
    if (showCatchDialog) {
      overlay.open();

      await ichibanInfoDialog({
        title: errorTitle,
        content: pickApiErrorMessage(error, errorMessage),
      });

      overlay.close();
    }
    return null;
  } finally {
    if (onFinal) await onFinal();
  }
}
