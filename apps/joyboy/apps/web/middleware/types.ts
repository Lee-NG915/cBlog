/**
 * 📱 设备和主题类型定义
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Theme = 'old' | 'new';
export type DeviceTheme = `${DeviceType}-${Theme}`;

/**
 * 🗺️ 地区和语言类型定义
 */
export type Region = 'sg' | 'us' | 'ca' | 'au';
export type Locale = 'en' | 'zh';
