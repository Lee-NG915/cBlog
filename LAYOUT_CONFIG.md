# 博客布局配置说明

## 📐 布局结构

当前博客采用响应式布局设计：

- **Desktop（≥1024px）**：左侧固定侧边栏 + 主内容区域
- **Mobile（<1024px）**：顶部固定导航栏 + 抽屉菜单 + 主内容区域

## 🎨 组件说明

### 1. Sidebar（桌面端侧边栏）

位置：`components/Sidebar.tsx`

**功能**：
- 用户信息展示区域（头像、昵称、邮箱、ID）
- 主导航菜单（首页、关于我）
- 博客分类导航（自动从文章分类生成）
- 项目链接（预留字段）
- 社交链接（GitHub、Email等）

**样式**：
- 固定宽度：256px (w-64)
- 固定在左侧
- 支持深色模式
- 滚动区域独立

### 2. MobileHeader（移动端顶部栏）

位置：`components/MobileHeader.tsx`

**功能**：
- 显示博客标题/Logo
- 汉堡菜单按钮（打开抽屉）

**样式**：
- 固定高度：56px (h-14)
- 固定在顶部
- 仅在移动端显示（lg:hidden）

### 3. MobileDrawer（移动端抽屉菜单）

位置：`components/MobileDrawer.tsx`

**功能**：
- 用户信息展示
- 完整的导航菜单（与侧边栏内容相同）
- 平滑的滑动动画
- 点击遮罩层关闭

**样式**：
- 宽度：256px (w-64)
- 从左侧滑入
- 带有遮罩层
- 仅在移动端显示（lg:hidden）

## ⚙️ 配置字段

### 用户信息配置

编辑 `lib/navigation.ts` 文件中的 `userProfile` 对象：

```typescript
export const userProfile: UserProfile = {
  id: "your-id",           // 用户ID（预留字段）
  name: "Your Name",       // 姓名
  nickname: "Color",       // 昵称（默认显示）
  email: "your@email.com", // 邮箱
  avatar: "/path/to/avatar.jpg", // 头像路径
  bio: "你的个人简介",      // 个人简介
};
```

**当前默认值**：
- `nickname: "Color"` （可修改）

### 主导航配置

编辑 `lib/navigation.ts` 文件中的 `mainNavItems` 数组：

```typescript
export const mainNavItems: NavItem[] = [
  {
    label: "首页",
    href: "/",
    icon: "home",
  },
  {
    label: "关于我",
    href: "/about",
    icon: "user",
  },
  // 可以添加更多导航项
];
```

**支持的图标**：
- `home` - 首页图标
- `user` - 用户图标
- `folder` - 文件夹图标

### 博客分类导航

博客分类导航是**自动生成**的，无需手动配置。系统会：
1. 自动扫描所有文章的 `category` 字段
2. 统计每个分类的文章数量
3. 按文章数量降序排列
4. 在侧边栏和抽屉中显示

**分类映射**：
- `技术类` → `/categories/技术类`
- `日常生活` → `/categories/日常生活`
- `学习记录` → `/categories/学习记录`
- `旅游` → `/categories/旅游`

### 社交链接配置

编辑 `lib/navigation.ts` 文件中的 `socialLinks` 数组：

```typescript
export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/yourusername",
    icon: "github",
  },
  {
    label: "Email",
    href: "your@email.com",
    icon: "email",
  },
  // 可以添加更多社交链接
];
```

**支持的图标**：
- `github` - GitHub 图标（SVG）
- `email` / `mail` - 邮箱图标（SVG）

对于其他社交平台，可以添加自定义图标或使用文本链接。

### 项目链接配置

编辑 `lib/navigation.ts` 文件中的 `projectLinks` 数组：

```typescript
export const projectLinks: NavItem[] = [
  {
    label: "项目名称",
    href: "https://project-url.com",
    icon: "folder", // 可选
  },
  // 可以添加更多项目链接
];
```

## 📱 响应式断点

- **Mobile**: `< 1024px` - 显示顶部导航栏 + 抽屉菜单
- **Desktop**: `≥ 1024px` - 显示左侧固定侧边栏

## 🎯 使用示例

### 添加新的导航项

1. 在 `lib/navigation.ts` 中添加：

```typescript
export const mainNavItems: NavItem[] = [
  // ... 现有项
  {
    label: "归档",
    href: "/archive",
    icon: "folder",
  },
];
```

2. 如需自定义图标，在 `Sidebar.tsx` 和 `MobileDrawer.tsx` 的 `getIcon` 函数中添加。

### 配置用户头像

1. 将头像图片放在 `public/images/` 目录下
2. 在 `lib/navigation.ts` 中配置：

```typescript
export const userProfile: UserProfile = {
  avatar: "/images/avatar.jpg",
  // ... 其他字段
};
```

### 添加社交链接

```typescript
export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/yourusername",
    icon: "github",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/yourusername",
    icon: "twitter", // 需要添加对应的图标组件
  },
];
```

## 🔧 自定义样式

所有组件都使用 Tailwind CSS 类名，可以直接修改：

- **侧边栏背景色**：`bg-white dark:bg-gray-800`
- **主色调**：`text-primary-600` （在 `tailwind.config.js` 中配置）
- **悬停效果**：`hover:bg-gray-100 dark:hover:bg-gray-700`

## 📝 注意事项

1. **用户信息字段都是可选的**，不配置时不会显示对应内容
2. **分类导航是自动生成的**，添加新文章时会自动更新
3. **移动端抽屉菜单会在路由变化时自动关闭**
4. **所有配置修改后需要重新构建**才能生效

## 🚀 后续扩展

预留的配置字段可以用于：
- 添加更多个人信息（ID、邮箱等）
- 添加项目展示链接
- 添加更多社交平台链接
- 自定义导航项和图标

所有配置都在 `lib/navigation.ts` 文件中，便于统一管理。

