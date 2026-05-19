import type { Category, Post } from "@/lib/posts";

/** 品牌页组件展示用静态样例数据 */
export const showcasePost: Post = {
  slug: "brand-showcase-sample",
  title: "学习中的一个小片段",
  date: "2026-05-19",
  categorySlug: "learning",
  category: "学习记录",
  tags: ["笔记", "复盘", "慢慢来"],
  excerpt: "还没整理完的想法，先搁在这里，过几天再来看也许就不一样了。",
  content: "",
  status: "published",
  readingTime: 6,
};

export const showcaseCategory: Category = {
  slug: "learning",
  name: "学习记录",
  count: 12,
  description: "正在学什么、如何理解、还有哪些没想通。",
};

export const showcasePosts: Post[] = [
  showcasePost,
  {
    ...showcasePost,
    slug: "brand-showcase-2",
    title: "工程里的一次取舍",
    categorySlug: "technical",
    category: "工程札记",
    tags: ["Next.js", "部署"],
    date: "2026-04-02",
    readingTime: 8,
  },
  {
    ...showcasePost,
    slug: "brand-showcase-3",
    title: "周末路过书店",
    categorySlug: "life",
    category: "生活手记",
    tags: ["阅读", "散步"],
    date: "2026-03-15",
    readingTime: 3,
  },
];
