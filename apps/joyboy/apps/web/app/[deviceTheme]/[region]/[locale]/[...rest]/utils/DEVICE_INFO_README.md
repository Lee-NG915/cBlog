# 设备信息使用指南

## 概述

在你的页面中，你可以轻松获取设备信息，包括设备类型（desktop、tablet、mobile）和主题（old、new）。这些信息通过路由参数 `[deviceTheme]` 传递，并且已经通过中间件处理。

## 可用的设备信息

### 设备类型

- **desktop** - 桌面设备
- **tablet** - 平板设备
- **mobile** - 移动设备

### 主题

- **old** - 旧主题
- **new** - 新主题

### 设备主题格式

设备主题的格式为：`{deviceType}-{theme}`
例如：

- `desktop-new` - 桌面设备 + 新主题
- `mobile-old` - 移动设备 + 旧主题
- `tablet-new` - 平板设备 + 新主题

## 在页面中使用设备信息

### 1. 在服务端组件中获取设备信息

```typescript
// page.tsx
export default async function Page({
  params,
}: {
  params: { deviceTheme: string; region: string; locale: string; rest: string[] };
}) {
  const { deviceTheme, region, locale, rest } = params;

  // 使用工具函数解析设备信息
  const parsedDeviceInfo = parseDeviceTheme(deviceTheme);

  const deviceInfo = {
    deviceType: parsedDeviceInfo.deviceType,
    theme: parsedDeviceInfo.theme,
    deviceTheme,
    region,
    locale,
  };

  // 获取设备特定配置
  const deviceConfig = getDeviceSpecificConfig(deviceInfo);

  // 获取跟踪参数
  const trackingParams = getTrackingParams(deviceInfo);

  console.log('设备信息:', {
    ...deviceInfo,
    formatted: formatDeviceInfo(deviceInfo),
    config: deviceConfig,
    tracking: trackingParams,
  });

  // ... 其他逻辑
}
```

### 2. 在客户端组件中使用设备信息

```typescript
// page.client.tsx
export function PageClient({ deviceInfo }: { deviceInfo: DeviceInfo }) {
  useEffect(() => {
    console.log('客户端设备信息:', formatDeviceInfo(deviceInfo));

    // 获取设备特定配置
    const deviceConfig = getDeviceSpecificConfig(deviceInfo);

    // 根据设备信息启用特定功能
    const features = {
      'advanced-animations': shouldEnableFeature(deviceInfo, 'advanced-animations'),
      'touch-gestures': shouldEnableFeature(deviceInfo, 'touch-gestures'),
      'high-resolution-images': shouldEnableFeature(deviceInfo, 'high-resolution-images'),
    };

    // 根据设备类型进行不同处理
    if (deviceInfo.deviceType === 'mobile') {
      console.log('移动设备检测到，启用移动端优化');
    } else if (deviceInfo.deviceType === 'tablet') {
      console.log('平板设备检测到，启用平板端优化');
    } else {
      console.log('桌面设备检测到，启用桌面端优化');
    }
  }, [deviceInfo]);

  return <></>;
}
```

## 可用的工具函数

### 设备信息解析

- `parseDeviceTheme(deviceTheme)` - 解析设备主题字符串
- `formatDeviceInfo(deviceInfo)` - 格式化设备信息用于日志

### 设备类型检查

- `isMobileDevice(deviceType)` - 检查是否为移动设备
- `isTabletDevice(deviceType)` - 检查是否为平板设备
- `isDesktopDevice(deviceType)` - 检查是否为桌面设备

### 主题检查

- `isNewTheme(theme)` - 检查是否为新主题
- `isOldTheme(theme)` - 检查是否为旧主题

### 配置和功能

- `getDeviceSpecificConfig(deviceInfo)` - 获取设备特定配置
- `getTrackingParams(deviceInfo)` - 获取跟踪参数
- `shouldEnableFeature(deviceInfo, featureName)` - 检查是否启用特定功能

## 实际应用场景

### 1. 条件渲染

```typescript
// 根据设备类型渲染不同组件
if (isMobileDevice(deviceInfo.deviceType)) {
  return <MobileComponent />;
} else if (isTabletDevice(deviceInfo.deviceType)) {
  return <TabletComponent />;
} else {
  return <DesktopComponent />;
}
```

### 2. 功能启用

```typescript
// 根据设备信息启用特定功能
if (shouldEnableFeature(deviceInfo, 'advanced-animations')) {
  // 启用高级动画
}

if (shouldEnableFeature(deviceInfo, 'touch-gestures')) {
  // 启用触摸手势
}
```

### 3. 性能优化

```typescript
// 根据设备类型优化图片质量
const config = getDeviceSpecificConfig(deviceInfo);
if (config.imageQuality === 'high') {
  // 加载高分辨率图片
} else {
  // 加载中等分辨率图片
}
```

### 4. 跟踪和分析

```typescript
// 根据设备信息设置跟踪参数
const trackingParams = getTrackingParams(deviceInfo);
analytics.track('page_view', {
  ...trackingParams,
  page: 'home',
});
```

## 设备特定配置

每个设备类型都有特定的配置：

### 移动设备配置

```typescript
{
  imageQuality: 'medium',
  enableTouchGestures: true,
  enableSwipeNavigation: true,
  compactLayout: true,
}
```

### 平板设备配置

```typescript
{
  imageQuality: 'high',
  enableTouchGestures: true,
  enableSwipeNavigation: false,
  compactLayout: false,
}
```

### 桌面设备配置

```typescript
{
  imageQuality: 'high',
  enableTouchGestures: false,
  enableSwipeNavigation: false,
  compactLayout: false,
}
```

## 主题特定配置

### 新主题配置

```typescript
{
  enableNewFeatures: true,
  useModernUI: true,
  enableAnimations: true,
}
```

### 旧主题配置

```typescript
{
  enableNewFeatures: false,
  useModernUI: false,
  enableAnimations: false,
}
```

## 注意事项

1. **类型安全** - 所有函数都提供了类型安全的接口
2. **默认值** - 如果设备信息无效，会使用合理的默认值
3. **性能** - 设备信息在服务端解析，客户端直接使用
4. **兼容性** - 支持旧主题的兼容性处理

## 示例文件

查看以下文件了解详细的使用示例：

- `device-usage-example.ts` - 完整的使用示例
- `device-utils.ts` - 所有可用的工具函数
- `page.tsx` - 实际页面中的使用
- `page.client.tsx` - 客户端组件中的使用
