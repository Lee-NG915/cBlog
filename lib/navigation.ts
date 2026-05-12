import { siteConfig } from "./site";

// 导航配置
export interface NavItem {
  label: string;
  href: string;
  icon?: string; // 可选：图标名称
}

export interface CategoryNavItem {
  label: string;
  href: string;
  count: number;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

// 用户信息（预留字段，后续可以配置）
export const userProfile: UserProfile = {
  id: undefined, // 预留字段
  name: siteConfig.author,
  nickname: siteConfig.author,
  email: undefined,
  avatar: undefined,
  bio: siteConfig.description,
};

// 主导航项
export const mainNavItems: NavItem[] = [
  {
    label: "首页",
    href: "/",
    icon: "home",
  },
  {
    label: "研究路径",
    href: "/categories",
    icon: "folder",
  },
  {
    label: "关于我",
    href: "/about",
    icon: "user",
  },
];

// 社交链接（预留字段，后续可以配置）
export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: "github",
  },
  // 后续可以添加更多社交链接，如：Twitter、LinkedIn、Email等
];

// 项目链接（预留字段，后续可以配置）
export const projectLinks: NavItem[] = [
  // 后续可以添加项目链接
];
