export type KnowledgeLayer =
  | "architecture"
  | "module"
  | "domain"
  | "implementation";

export type KnowledgeDomain =
  | "architecture"
  | "migration"
  | "rendering"
  | "design-system"
  | "transaction"
  | "observability"
  | "cms"
  | "product"
  | "platform"
  | "tracking"
  | "error-handling";

export interface KnowledgeNode {
  id: string;
  label: string;
  layer: KnowledgeLayer;
  domain: KnowledgeDomain;
  summary: string;
  blogSlug?: string;
  hubAnchor?: string;
  relatedIds: string[];
}

export interface ReadingTrack {
  id: string;
  role: "前端基础" | "迁移专项" | "业务链路";
  title: string;
  summary: string;
  outcome: string;
  nodeIds: string[];
}

export interface DomainMeta {
  id: KnowledgeDomain;
  label: string;
  description: string;
  docCount: number;
  color: string;
}

export const LAYER_META: Record<
  KnowledgeLayer,
  { label: string; description: string }
> = {
  architecture: {
    label: "架构层",
    description: "总览、边界、多市场与长期演进方向",
  },
  module: {
    label: "模块层",
    description: "跨域基础设施：迁移、CMS、特性开关、可观测性、设计系统",
  },
  domain: {
    label: "业务域",
    description: "商品、交易、账户、内容等业务能力",
  },
  implementation: {
    label: "实现细节",
    description: "可落地的技术方案与工程实践笔记",
  },
};

export const DOMAIN_META: DomainMeta[] = [
  {
    id: "architecture",
    label: "架构",
    description: "Monorepo 分层、Clean Architecture、多端复用",
    docCount: 18,
    color: "#315F72",
  },
  {
    id: "migration",
    label: "迁移",
    description: "Legacy 渐进式迁移与节奏管控",
    docCount: 12,
    color: "#9C4527",
  },
  {
    id: "rendering",
    label: "渲染性能",
    description: "ISR、缓存、PLA/PLP 投放页",
    docCount: 2,
    color: "#C08B2C",
  },
  {
    id: "design-system",
    label: "设计系统",
    description: "组件库、Token、Tailwind 迁移",
    docCount: 4,
    color: "#D4866A",
  },
  {
    id: "transaction",
    label: "交易支付",
    description: "Checkout、支付编排、回调闭环",
    docCount: 2,
    color: "#667A54",
  },
  {
    id: "observability",
    label: "可观测性",
    description: "Sentry、监控、交易链路追踪",
    docCount: 7,
    color: "#315F72",
  },
  {
    id: "tracking",
    label: "埋点契约",
    description: "Events Book、listener → trigger 链路",
    docCount: 6,
    color: "#7E351F",
  },
  {
    id: "error-handling",
    label: "错误处理",
    description: "HTTP 分层、BizError、重试策略",
    docCount: 3,
    color: "#60291B",
  },
  {
    id: "cms",
    label: "CMS",
    description: "Storyblok、Sale Page、内容编排",
    docCount: 6,
    color: "#B95832",
  },
  {
    id: "product",
    label: "商品域",
    description: "PLP、PDP、Account、O2O、POS",
    docCount: 16,
    color: "#C08B2C",
  },
  {
    id: "platform",
    label: "平台能力",
    description: "i18n、DY、时区、WAF、Feature Flag",
    docCount: 13,
    color: "#6B7280",
  },
];

export const KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: "arch-multimarket",
    label: "多市场与环境",
    layer: "architecture",
    domain: "architecture",
    summary:
      "多区域部署、ENV 合并、特性开关与市场差异的配置化策略。",
    hubAnchor: "一、架构与边界治理",
    relatedIds: ["mod-platform", "impl-isr"],
  },
  {
    id: "arch-client",
    label: "客户端架构",
    layer: "architecture",
    domain: "architecture",
    summary: "消费者端与门店端的模块边界、复用模型与演进路线。",
    blogSlug: "ecommerce-architecture-redesign",
    relatedIds: ["mod-design", "mod-migration", "dom-catalog", "dom-transaction"],
  },
  {
    id: "mod-migration",
    label: "大规模迁移",
    layer: "module",
    domain: "migration",
    summary: "Feature Flag + 分批切换，把全量上线拆成可回滚的小步。",
    blogSlug: "ecommerce-migration-plan",
    relatedIds: ["arch-client", "impl-migration-plan"],
  },
  {
    id: "mod-cms",
    label: "CMS 集成",
    layer: "module",
    domain: "cms",
    summary: "Headless CMS 页面搭建、Webhook 刷新与运营配置化。",
    relatedIds: ["dom-cms-pages", "impl-isr"],
  },
  {
    id: "mod-platform",
    label: "平台能力",
    layer: "module",
    domain: "platform",
    summary: "i18n、推荐系统、时区、A/B 测试等横向能力。",
    relatedIds: ["arch-multimarket", "dom-catalog"],
  },
  {
    id: "mod-observability",
    label: "可观测性体系",
    layer: "module",
    domain: "observability",
    summary: "Sentry 分桶、结构化日志、交易链路统一观测模型。",
    blogSlug: "transaction-observability-tech-plan",
    relatedIds: ["dom-transaction", "impl-observability"],
  },
  {
    id: "mod-design",
    label: "设计系统",
    layer: "module",
    domain: "design-system",
    summary: "组件库 CDD、视觉回归、Token 与主题演进。",
    blogSlug: "design-system-cdd-practice",
    relatedIds: ["impl-tailwind", "arch-client"],
  },
  {
    id: "dom-catalog",
    label: "商品与列表",
    layer: "domain",
    domain: "product",
    summary: "PLP/PDP/PLA 投放页、搜索列表与商品选择器。",
    hubAnchor: "八、搜索与商品展示",
    relatedIds: ["impl-isr", "mod-platform"],
  },
  {
    id: "dom-transaction",
    label: "交易与结账",
    layer: "domain",
    domain: "transaction",
    summary: "Checkout 漏斗、多支付商编排、Redirect 回调闭环。",
    blogSlug: "payment-pipeline-architecture",
    relatedIds: ["mod-observability", "impl-tracking", "impl-errors"],
  },
  {
    id: "dom-account",
    label: "账户与权限",
    layer: "domain",
    domain: "product",
    summary: "登录、权限、O2O 与门店端 UMS 接入。",
    relatedIds: ["arch-client"],
  },
  {
    id: "dom-cms-pages",
    label: "运营内容页",
    layer: "domain",
    domain: "cms",
    summary: "Sale Page、Blog Page、促销页模板化交付。",
    relatedIds: ["mod-cms", "impl-isr"],
  },
  {
    id: "impl-isr",
    label: "ISR + 共享缓存",
    layer: "implementation",
    domain: "rendering",
    summary: "多实例 Redis 缓存、Webhook 精准刷新与区域隔离。",
    blogSlug: "nextjs-isr-redis-shared-cache",
    relatedIds: ["dom-catalog", "mod-cms"],
  },
  {
    id: "impl-observability",
    label: "交易链路观测",
    layer: "implementation",
    domain: "observability",
    summary: "15 阶段交易模型、traceId 串联、SLO 告警。",
    blogSlug: "transaction-observability-tech-plan",
    relatedIds: ["dom-transaction", "mod-observability"],
  },
  {
    id: "impl-tailwind",
    label: "样式体系迁移",
    layer: "implementation",
    domain: "design-system",
    summary: "CSS-in-JS 与 RSC 冲突 → Tailwind + 零运行时 CSS。",
    blogSlug: "joyui-to-tailwind-migration-adr",
    relatedIds: ["mod-design"],
  },
  {
    id: "impl-tracking",
    label: "埋点事件契约",
    layer: "implementation",
    domain: "tracking",
    summary: "Events Book、component → listener → trigger 单向链路。",
    blogSlug: "tracking-events-book-contract",
    relatedIds: ["dom-transaction"],
  },
  {
    id: "impl-errors",
    label: "HTTP 错误分层",
    layer: "implementation",
    domain: "error-handling",
    summary: "基础设施层 vs 业务层、401 Mutex、幂等重试。",
    blogSlug: "http-error-handling-strategy",
    relatedIds: ["dom-transaction"],
  },
  {
    id: "impl-migration-plan",
    label: "月度迁移节奏",
    layer: "implementation",
    domain: "migration",
    summary: "路由级灰度、回滚窗口与质量兜底，把全量切换拆成可回滚小步。",
    blogSlug: "ecommerce-migration-plan",
    relatedIds: ["mod-migration"],
  },
];

export const DOMAIN_EDGES: Array<[KnowledgeDomain, KnowledgeDomain]> = [
  ["architecture", "migration"],
  ["architecture", "rendering"],
  ["migration", "product"],
  ["cms", "product"],
  ["platform", "product"],
  ["design-system", "product"],
  ["rendering", "product"],
  ["product", "transaction"],
  ["transaction", "observability"],
  ["transaction", "tracking"],
  ["transaction", "error-handling"],
  ["platform", "observability"],
];

export const READING_PATH: Array<{
  step: number;
  nodeId: string;
  role?: string;
}> = [
  { step: 1, nodeId: "arch-client" },
  { step: 2, nodeId: "arch-client" },
  { step: 3, nodeId: "mod-design", role: "前端基础" },
  { step: 4, nodeId: "impl-tailwind", role: "前端基础" },
  { step: 3, nodeId: "mod-migration", role: "迁移专项" },
  { step: 4, nodeId: "impl-migration-plan", role: "迁移专项" },
  { step: 3, nodeId: "dom-transaction", role: "业务链路" },
  { step: 4, nodeId: "impl-observability", role: "业务链路" },
  { step: 5, nodeId: "impl-tracking", role: "业务链路" },
];

export const READING_TRACKS: ReadingTrack[] = [
  {
    id: "frontend-foundation",
    role: "前端基础",
    title: "先补全架构与组件心智模型",
    summary: "适合刚接触项目，先建立客户端边界、组件体系和样式迁移的完整视角。",
    outcome: "看完后能快速定位模块归属，理解为什么样式和组件要先统一再扩展业务。",
    nodeIds: ["arch-client", "mod-design", "impl-tailwind"],
  },
  {
    id: "migration-special",
    role: "迁移专项",
    title: "先看迁移机制与切换节奏",
    summary: "适合接手遗留系统重构、灰度切换或多版本并存的演进工作。",
    outcome: "看完后能说明迁移为什么要拆批次、如何回滚、如何降低跨团队协作成本。",
    nodeIds: ["arch-client", "mod-migration", "impl-migration-plan"],
  },
  {
    id: "business-transaction",
    role: "业务链路",
    title: "先吃透交易主链路",
    summary: "适合要快速进入结账、支付、埋点和可观测性问题排查的同学。",
    outcome: "看完后能把支付流程、埋点契约和异常处理放进同一条交易闭环里理解。",
    nodeIds: [
      "arch-client",
      "dom-transaction",
      "impl-observability",
      "impl-tracking",
    ],
  },
];

export function getNodeById(id: string): KnowledgeNode | undefined {
  return KNOWLEDGE_NODES.find((n) => n.id === id);
}
