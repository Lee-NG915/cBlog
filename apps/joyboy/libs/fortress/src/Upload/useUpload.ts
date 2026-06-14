import { useState, useCallback } from 'react';

export interface UseUploadOptions {
  /** 允许的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 上传成功回调 */
  onSuccess?: (file: File) => void;
  /** 上传失败回调 */
  onError?: (error: string) => void;
}

export interface UseUploadResult {
  /** 当前文件名 */
  fileName: string | undefined;
  /** 错误信息 */
  errorMessage: string | undefined;
  /** 处理文件选择 */
  handleUpload: () => void;
}

export function useUpload(options: UseUploadOptions = {}): UseUploadResult {
  const { accept, maxSize, onSuccess, onError } = options;

  const [fileName, setFileName] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) input.accept = accept;

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 验证文件大小
      if (maxSize && file.size > maxSize) {
        const error = `File size exceeds ${maxSize / 1024 / 1024}MB limit`;
        setErrorMessage(error);
        onError?.(error);
        return;
      }

      setFileName(file.name);
      setErrorMessage(undefined);
      onSuccess?.(file);
    };

    input.click();
  }, [accept, maxSize, onSuccess, onError]);

  return {
    fileName,
    errorMessage,
    handleUpload,
  };
}
