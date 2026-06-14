import { EcEnv } from '@castlery/config';
import CryptoJS from 'crypto-js';

/**
 * 加密密码
 * @param password original password
 * @description only in server side
 * @returns encrypted password
 */
export const encryptPassword = (password: string) => {
  if (!password) return '';
  try {
    return CryptoJS.AES.encrypt(password, EcEnv.NEXT_PUBLIC_PASSWORD_ENCRYPTION_PUBLIC_KEY || '').toString();
  } catch (error) {
    throw new Error('Password encryption failed');
  }
};

/**
 * 比较两个版本号
 * @param v1 eg: 1.0.0
 * @param v2 eg: 1.0.1
 * @returns [true, false, false] major, minor, patch (v1 > v2)
 */
export const compareVersion = (v1: string, v2: string): Array<boolean> => {
  // 检查版本号格式
  const reg = /^\d+\.\d+\.\d+$/;
  if (!reg.test(v1) || !reg.test(v2)) {
    return [false, false, false];
  }

  if (v1 === v2) {
    return [false, false, false];
  }

  const v1Arr = v1.split('.');
  const v2Arr = v2.split('.');
  const result = [false, false, false];

  for (let i = 0; i < 3; i++) {
    if (parseInt(v1Arr[i]) > parseInt(v2Arr[i])) {
      result[i] = true;
      break;
    }
  }

  return result;
};
