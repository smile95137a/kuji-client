// src/utils/FileUtils.ts
/**
 * 建立並觸發下載連結 (Blob 檔案用)
 */
export const triggerFileDownload = (
  blobData: BlobPart,
  fileName: string,
  mimeType: string
) => {
  const blob = new Blob([blobData], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 通用檔案下載處理器
 */
export const handleFileDownload = async ({
  apiFunc,
  fileName,
  mimeType,
  errorMessage,
  onStart,
  onEnd,
  onError,
}: {
  apiFunc: () => Promise<any>;
  fileName: string;
  mimeType: string;
  errorMessage?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}) => {
  try {
    onStart?.();
    const blobData = await apiFunc();
    if (!blobData) throw new Error('Empty blob');

    triggerFileDownload(blobData, fileName, mimeType);
  } catch (error) {
    if (onError) {
      onError(error);
    } else if (errorMessage) {
      alert(errorMessage);
    }
  } finally {
    onEnd?.();
  }
};

/**
 * 將檔案轉為 base64 字串
 */
export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

/**
 * 下載 base64 編碼的檔案
 */
export const downloadBase64File = (base64Data: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// src/utils/downloadFile.ts

export const getMimeTypeByExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  const mimeMap: Record<string, string> = {
    zip: 'application/zip',
    pdf: 'application/pdf',
    csv: 'text/csv',
    txt: 'text/plain',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };

  return mimeMap[extension] || 'application/octet-stream';
};

export const downloadFileByBlob = (
  blob: Blob,
  fileName: string,
  mimeType: string
) => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
