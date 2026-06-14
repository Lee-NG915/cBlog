# Fortress 响应式样式使用指南

## 📐 响应式断点规范

Fortress 的 `normalizedSx` 响应式样式与 `useBreakpoints` hook 保持完全一致的语义。

### 断点定义

| 断点键    | 范围          | Media Query                                        | 对应 `useBreakpoints`      |
| --------- | ------------- | -------------------------------------------------- | -------------------------- |
| `mobile`  | **0-599px**   | `@media (max-width: 599px)`                        | `xs = between('xs', 'sm')` |
| `tablet`  | **600-899px** | `@media (min-width: 600px) and (max-width: 899px)` | `sm = between('sm', 'md')` |
| `desktop` | **900px+**    | `@media (min-width: 900px)`                        | `desktop = up('md')`       |

### 关键特性

- ✅ **互斥范围**：`mobile`、`tablet` 是独立的范围，不会互相覆盖
- ✅ **语义一致**：与 `useBreakpoints` hook 完全对应
- ✅ **可选断点**：可以只定义部分断点，未定义的断点使用基础样式
- ✅ **SSR 友好**：完全支持服务端渲染，无 hydration 问题（[查看 SSR 工作原理](./responsive-sx-ssr.md)）

---

## 🎯 使用方式

### 1. 完整断点定义

```typescript
<Box
  sx={{
    // 基础样式（作为后备）
    padding: 16,
    backgroundColor: 'gray',

    // Mobile: 0-599px
    mobile: {
      backgroundColor: 'green',
      padding: 8,
    },

    // Tablet: 600-899px
    tablet: {
      backgroundColor: 'orange',
      padding: 16,
    },

    // Desktop: 900px+
    desktop: {
      backgroundColor: 'black',
      padding: 32,
    },
  }}
/>
```

**效果：**

- 0-599px: 绿色背景，padding 8px
- 600-899px: 橙色背景，padding 16px
- 900px+: 黑色背景，padding 32px

---

### 2. 部分断点定义

```typescript
<Box
  sx={{
    // 基础样式
    padding: 16,
    backgroundColor: 'purple',

    // 只定义 mobile 和 desktop
    mobile: {
      backgroundColor: 'blue',
    },
    desktop: {
      backgroundColor: 'red',
    },
  }}
/>
```

**效果：**

- 0-599px: 蓝色背景（mobile）
- 600-899px: **紫色背景（基础样式）** ← 未定义 tablet，使用基础样式
- 900px+: 红色背景（desktop）

---

### 3. 与函数式 sx 结合

```typescript
<Container
  sx={(theme) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.brand.warmLinen[100],

    mobile: {
      padding: theme.spacing(1),
      backgroundColor: theme.palette.brand.warmLinen[800],
    },

    desktop: {
      padding: theme.spacing(4),
      backgroundColor: theme.palette.brand.warmLinen[50],
    },
  })}
/>
```

---

### 4. 响应式布局

```typescript
<Stack
  sx={{
    flexDirection: 'column',
    gap: 2,

    tablet: {
      flexDirection: 'row',
      gap: 3,
    },

    desktop: {
      gap: 4,
    },
  }}
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
  <Box>Item 3</Box>
</Stack>
```

**效果：**

- Mobile (0-599px): 垂直堆叠，gap 2
- Tablet (600-899px): 水平排列，gap 3
- Desktop (900px+): 水平排列，gap 4

---

## 🔄 与 `useBreakpoints` hook 的对应关系

```typescript
function MyComponent() {
  const { mobile, tablet, desktop } = useBreakpoints();

  return (
    <Box
      sx={{
        // 这三个断点的范围与 useBreakpoints 完全一致
        mobile: {
          /* 0-599px */
        },
        tablet: {
          /* 600-899px */
        },
        desktop: {
          /* 900px+ */
        },
      }}
    >
      {/* 逻辑判断也对应相同范围 */}
      {mobile && <MobileView />}
      {tablet && <TabletView />}
      {desktop && <DesktopView />}
    </Box>
  );
}
```

---

## ⚠️ 注意事项

### ❌ 错误用法

```typescript
// ❌ 不要期望 mobile 会应用到所有尺寸
<Box
  sx={{
    mobile: { color: 'red' },
    // tablet 未定义，会使用基础样式（不是 mobile 样式）
    desktop: { color: 'blue' },
  }}
/>
// 结果：600-899px 不会显示红色！
```

### ✅ 正确用法

```typescript
// ✅ 基础样式作为所有断点的后备
<Box
  sx={{
    color: 'red', // 基础样式，应用于所有未定义的断点
    desktop: { color: 'blue' },
  }}
/>
// 结果：0-899px 显示红色，900px+ 显示蓝色
```

---

## 📊 断点对照表

| 屏幕宽度    | 断点名称      | `useBreakpoints` 返回              | `sx` 响应式键      |
| ----------- | ------------- | ---------------------------------- | ------------------ |
| 0-599px     | Mobile        | `{ mobile: true, ... }`            | `mobile: { ... }`  |
| 600-899px   | Tablet        | `{ tablet: true, ... }`            | `tablet: { ... }`  |
| 900-1199px  | Desktop       | `{ desktop: true, ... }`           | `desktop: { ... }` |
| 1200-1535px | Large Desktop | `{ desktop: true, lg: true, ... }` | `desktop: { ... }` |
| 1536px+     | XL Desktop    | `{ desktop: true, xl: true, ... }` | `desktop: { ... }` |

**注意：**

- `desktop` 覆盖 900px 及以上所有尺寸
- 如需更细粒度控制，请使用 MUI Joy 的标准断点（`md`、`lg`、`xl`）

---

## 🎨 支持 `normalizedSx` 的组件

以下组件已支持响应式 `sx`：

- ✅ Box
- ✅ Stack
- ✅ Grid
- ✅ Card
- ✅ Container
- ✅ Button
- ✅ Link
- ✅ Typography
- ✅ Modal / ModalOverflow
- ✅ Drawer

---

## 🔗 相关资源

- **断点配置**: `libs/fortress/src/Theme/breakpoints.ts`
- **useBreakpoints Hook**: `libs/fortress/src/hooks/useBreakpoints/useBreakpoints.ts`
- **normalizeFortressSx 实现**: `libs/fortress/src/utils/fortress-sx.ts`
- **示例**: `libs/fortress/src/Box/Box.stories.tsx`

---

## 🚀 迁移指南（从旧版本）

如果你之前使用的是 `min-width` 语义的响应式样式，请注意：

### 旧版本行为（已废弃）

```typescript
// 旧版本：min-width 语义
mobile: {
  color: 'red';
} // 应用于所有尺寸（0px+）
tablet: {
  color: 'blue';
} // 应用于 600px+（覆盖 mobile）
desktop: {
  color: 'green';
} // 应用于 900px+（覆盖 tablet）
```

### 新版本行为（当前）

```typescript
// 新版本：互斥范围语义
mobile: {
  color: 'red';
} // 仅应用于 0-599px
tablet: {
  color: 'blue';
} // 仅应用于 600-899px
desktop: {
  color: 'green';
} // 应用于 900px+
```

### 迁移步骤

1. **检查你的代码**：如果你只定义了 `mobile` 和 `desktop`，确保基础样式正确
2. **测试断点行为**：在不同屏幕尺寸下验证样式
3. **使用 Storybook**：参考 `Box.stories.tsx` 中的示例

---

**更新日期**: 2025-11-21  
**版本**: v2.0
