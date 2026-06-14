/**
 * The Hook can only be used on pages, not on components
 * @param headers
 * @returns
 */
export const useInitialSize = (headers: () => Headers) => {
  const userAgent = headers().get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet/i.test(userAgent);
  const deviceWidth = isMobile ? 375 : isTablet ? 768 : 1728; // 设定大致的宽度
  return deviceWidth;
};
