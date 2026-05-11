export const siteConfig = {
  name: "Color Blog",
  title: "Color 的个人博客",
  description: "记录技术实践、学习过程和生活随记。",
  author: "Color",
};

export const postCategories = [
  {
    name: "技术博客",
    description: "工程实践、问题排查、架构取舍和工具链笔记。",
  },
  {
    name: "学习日志",
    description: "阶段性学习记录、读书笔记、课程复盘和知识整理。",
  },
  {
    name: "生活随记",
    description: "日常观察、旅行、兴趣和个人状态记录。",
  },
] as const;

export type PostCategoryName = (typeof postCategories)[number]["name"];

