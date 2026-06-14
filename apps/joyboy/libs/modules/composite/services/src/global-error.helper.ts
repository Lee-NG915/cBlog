import { GlobalApiErrorCode } from '@castlery/config';

const globalErrorCodes = Object.values(GlobalApiErrorCode);

export const isSystemInternalError = (code: number) => {
  return globalErrorCodes.includes(code);
};
