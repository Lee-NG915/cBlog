/**
 * 调试 cookie 读取
 * 用于验证 getUserFromPersistenceSync 函数是否正确读取 cookie
 */

import Cookies from 'js-cookie';
import { EcEnv } from '@castlery/config';

export const debugCookieReading = () => {
  console.log('🔍 开始调试 cookie 读取...');

  // 获取所有 cookie
  const allCookies = Cookies.get();
  console.log('📋 所有 cookie:', allCookies);

  // 检查特定的 cookie 键名
  const accessToken = Cookies.get('access_token');
  const serverUserInfo = Cookies.get('server_user_info');

  console.log('🔑 access_token:', accessToken ? '✅ 存在' : '❌ 不存在');
  console.log('🔑 server_user_info:', serverUserInfo ? '✅ 存在' : '❌ 不存在');

  if (accessToken) {
    console.log('📄 access_token 值:', accessToken.substring(0, 20) + '...');
  }

  if (serverUserInfo) {
    try {
      const userInfo = JSON.parse(serverUserInfo);
      console.log('👤 用户信息:', {
        id: userInfo.id,
        email: userInfo.email,
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
      });
    } catch (error) {
      console.log('❌ 解析用户信息失败:', error);
    }
  }

  // 检查环境变量
  console.log('🌍 环境变量:');
  console.log('- NEXT_PUBLIC_APPLICATION_ENV:', EcEnv.NEXT_PUBLIC_APPLICATION_ENV);
  console.log('- NEXT_PUBLIC_COUNTRY:', EcEnv.NEXT_PUBLIC_COUNTRY);

  return {
    accessToken,
    serverUserInfo,
    allCookies,
  };
};
