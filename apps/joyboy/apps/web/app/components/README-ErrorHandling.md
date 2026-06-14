# 全局错误处理方案

## 概述

本项目已实现了一套完整的全局错误处理方案，用于捕获和处理应用中的各种错误，确保用户不会看到白屏或崩溃的页面。

## 实现组件

### 1. GlobalErrorBoundary.tsx

- **位置**: `libs/shared/components/src/lib/global-error-boundary/global-error-boundary.tsx`
- **功能**: 全局错误边界组件，用于捕获客户端 JavaScript 错误
- **特性**:
  - 使用 React Error Boundary 模式
  - 自动将错误发送到 Sentry 进行监控
  - 提供友好的错误页面界面
  - 支持错误恢复和页面刷新

### 2. 全局错误页面 (global-error.tsx)

- **位置**: `apps/web/app/global-error.tsx`
- **功能**: Next.js 全局错误处理页面
- **特性**:
  - 捕获服务器端和客户端错误
  - 集成 Sentry 错误监控
  - 使用 Fortress ErrorBoundary 组件显示错误界面

### 3. 错误测试组件 (ErrorTestComponent.tsx)

- **位置**: `apps/web/app/components/ErrorTestComponent.tsx`
- **功能**: 用于测试错误边界功能的组件
- **特性**:
  - 仅在开发环境显示
  - 提供按钮触发测试错误
  - 验证错误捕获机制是否正常工作

## 集成方式

### 客户端布局集成

在 `apps/web/app/[deviceTheme]/[region]/[locale]/client-layout.tsx` 中：

```tsx
import { GlobalErrorBoundary } from '@castlery/shared-components';

export const ClientLayout = ({ children, params }) => {
  return (
    <GlobalErrorBoundary>
      <StoreProvider>
        {children}
        {contextHolder}
        <UttIdentifyScript />
      </StoreProvider>
    </GlobalErrorBoundary>
  );
};
```

### 博客页面测试集成

在 `apps/web/app/[deviceTheme]/[region]/[locale]/blog/page.client.tsx` 中：

```tsx
import ErrorTestComponent from '../../../../components/ErrorTestComponent';

// 仅在开发环境显示测试组件
{
  EcEnv.NODE_ENV === 'development' && <ErrorTestComponent />;
}
```

## 错误处理流程

1. **客户端错误捕获**:

   - GlobalErrorBoundary 捕获组件树中的 JavaScript 错误
   - 错误被发送到 Sentry 进行监控和记录
   - 显示友好的错误页面，提供刷新选项

2. **服务器端错误捕获**:

   - Next.js global-error.tsx 捕获服务器端错误
   - 同样集成 Sentry 监控
   - 使用 Fortress ErrorBoundary 显示错误界面

3. **错误恢复**:
   - 用户可以通过点击"刷新页面"按钮恢复
   - 错误边界会自动重置状态
   - 支持页面级别的错误恢复

## 测试方法

1. **开发环境测试**:

   - 访问博客页面 (`/blog`)
   - 点击"触发错误"按钮
   - 观察错误边界是否正确捕获并显示错误页面

2. **生产环境测试**:
   - 故意在代码中引入错误（如访问不存在的属性）
   - 观察错误是否被正确捕获和记录

## 配置说明

### Sentry 集成

所有错误都会自动发送到 Sentry，包括：

- 错误堆栈信息
- 用户上下文
- 组件堆栈信息
- 浏览器信息

### 错误页面样式

使用 Fortress 设计系统的 ErrorBoundary 组件，确保：

- 一致的视觉设计
- 响应式布局
- 多语言支持
- 无障碍访问

## 注意事项

1. **性能影响**: 错误边界不会影响正常渲染性能
2. **错误范围**: 只能捕获子组件树中的错误，不能捕获：

   - 事件处理器中的错误
   - 异步代码中的错误（如 setTimeout）
   - 服务器端渲染错误
   - 错误边界自身的错误

3. **开发调试**: 在开发环境中，错误仍会在控制台显示，便于调试

## 扩展建议

1. **错误分类**: 可以根据错误类型显示不同的错误页面
2. **用户反馈**: 可以添加错误报告功能，让用户提交错误详情
3. **错误统计**: 可以添加客户端错误统计和分析
4. **自动恢复**: 对于某些类型的错误，可以实现自动重试机制
