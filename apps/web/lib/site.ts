const DEFAULT_SITE_URL = "https://lee-ng915.github.io/cBlog";

export function resolveSiteUrl(value = process.env.SITE_URL): string {
  const candidate = value?.trim() || DEFAULT_SITE_URL;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("SITE_URL 必须是 http/https 绝对 URL");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.search || url.hash) {
    throw new Error("SITE_URL 必须是无 query/hash 的 http/https 绝对 URL");
  }
  return url.toString().replace(/\/$/, "");
}

export const siteConfig = {
  name: "Color Blog",
  title: "Color 手记",
  description: "记录学习中的片段、工程里的取舍，和生活里值得留下的瞬间。",
  author: "Color",
  url: resolveSiteUrl(),
  ogImage: "/og/default.png",
};

export const profile = {
  name: "李东海",
  penName: "Color",
  role: "全栈开发工程师 · 前端方向 / AI 应用",
  tagline: "做多应用前端架构，也把业务上下文沉淀成 AI 能执行的工程流程。",
  email: "ngup915@163.com",
  highlights: [
    {
      title: "前端架构",
      detail:
        "TypeScript / React / Next.js，Monorepo、组件库与设计系统，推进多年演进项目的渐进式重构。",
    },
    {
      title: "AI 工程化",
      detail:
        "把业务上下文与验收标准沉淀为 Skill，组织 AI 完成实现与修复，用评审、测试和真实链路核验控制质量。",
    },
    {
      title: "质量与可观测性",
      detail:
        "视觉回归、埋点契约与性能采集，结合异常上下文把线上故障转化为可追踪的修复流程。",
    },
  ],
  experience: [
    {
      period: "2026.08 – 2026.11",
      org: "积加科技",
      role: "Shopify 全栈开发",
      note: "双品牌独立站 Monorepo、AI 研发工作流与设计自动化",
    },
    {
      period: "2024.08 – 2026.08",
      org: "Castlery",
      role: "高级前端工程师",
      note: "多市场电商架构、组件库与设计系统负责人",
    },
    {
      period: "2022.08 – 2024.05",
      org: "比心直播",
      role: "前端开发工程师",
      note: "营收活动 H5 与运营后台、公共 UI 与质量建设",
    },
    {
      period: "2020 – 2021",
      org: "腾讯 TEG",
      role: "爬虫开发（实习）",
      note: "动态页面采集与数据清洗自动化",
    },
  ],
  sites: [
    {
      name: "E-pig · DTC 独立站演示",
      url: "https://e-pig-au-sandbox.netlify.app/au",
      domain: "e-pig-au-sandbox.netlify.app",
      detail: "双品牌 Shopify 工程实践的演示站点。",
    },
    {
      name: "开源收藏库",
      url: "https://nb-github.pages.dev/",
      domain: "nb-github.pages.dev",
      detail: "持续整理的 AI 与开源项目收藏。",
    },
    {
      name: "GitHub · Dylan Li",
      url: "https://github.com/Lee-NG915?tab=repositories",
      domain: "github.com/Lee-NG915",
      detail: "代码与项目仓库。",
    },
  ],
};

export function getSiteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export function getSeoImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return siteConfig.ogImage;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return imagePath.replace(/^\/cBlog/, "") || siteConfig.ogImage;
}
