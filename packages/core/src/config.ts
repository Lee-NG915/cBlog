/**
 * 初始分类种子（迁移自原 apps/web/lib/site.ts 的 postCategories 硬编码）。
 * 仅用于建库导入；运行期分类一律以数据库为准。
 */
export const OFFICIAL_CATEGORY_SEEDS = [
  {
    slug: "technical",
    name: "工程札记",
    description: "前端工程、部署实践、工具链和架构取舍。",
  },
  {
    slug: "notes",
    name: "专题整理",
    description: "围绕一个主题整理的项目复盘、问题清单和阶段性记录。",
  },
  {
    slug: "learning",
    name: "学习记录",
    description: "正在学什么、如何理解、还有哪些没想通。",
  },
  {
    slug: "life",
    name: "生活手记",
    description: "日常观察、阅读笔记、兴趣和工作之外的生活记录。",
  },
] as const;

/** 未匹配到分类的文章落入该兜底分类（复刻原"未分类"行为） */
export const UNCATEGORIZED = {
  slug: "uncategorized",
  name: "未分类",
  description: "尚未配置到固定阅读路径的文章。",
  sortOrder: 999,
} as const;

/**
 * 存量专栏种子（迁自原 app/rightCapital、app/addx-ai 页面文案）。
 * noindex=1：保持原 robots noindex 且不进 sitemap 的行为。
 */
export const LEGACY_COLLECTION_SEEDS = [
  {
    slug: "rightCapital",
    name: "RightCapital 面试笔记",
    description: "针对 RightCapital 面试准备的笔记目录，仅通过手动输入路由访问。",
    label: "Interview Notes",
    badge: "RightCapital",
    noindex: 1,
  },
  {
    slug: "addx-ai",
    name: "addx.ai 面试笔记",
    description:
      "针对积加科技 / addx.ai 面试准备的要点复习目录，仅通过手动输入路由访问。",
    label: "Interview Notes",
    badge: "addx.ai",
    noindex: 1,
  },
  {
    slug: "promotion",
    name: "促销系统笔记",
    description:
      "海外独立站优惠活动与优惠券业务逻辑，面向前端理解配置、计算、互斥和结算体验。",
    label: "Business Notes",
    badge: "Promotion",
    noindex: 1,
  },
  {
    slug: "transaction-observability",
    name: "交易模块可观测性",
    description:
      "Checkout / Payment 前端可观测性技术方案：事件模型、字段协议、Sentry、Grafana 与 SLO。",
    label: "Tech Specs",
    badge: "Txn Observability",
    noindex: 1,
  },
] as const;
