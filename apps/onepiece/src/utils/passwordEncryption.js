import CryptoJS from 'crypto-js';

const PUBLIC_KEY = __PASSWORD_ENCRYPTION_PUBLIC_KEY__;

/**
 * 加密密码
 * @param password 原始密码
 * @returns 加密后的密码
 */
export const encryptPassword = (password) => {
  if (!password) return '';
  try {
    return CryptoJS.AES.encrypt(password, PUBLIC_KEY).toString();
  } catch (error) {
    return console.error('Password encryption failed');
  }
};
