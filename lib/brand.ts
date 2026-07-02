/**
 * Color 手记 — 个人品牌核心梳理（单一事实来源）
 * 对外：/brand 页、站点简介；对内：样式 skill 可读 designSystemMapping。
 */

export const brandCore = {
  name: "Color 手记",
  tagline: "给自己留的一间小书房",
  essence:
    "这里不是资讯站，更像一本慢慢写的本子：学到哪记到哪，做过什么、生活里的小事，偶尔翻回去看一眼。",

  keywords: ["柔和", "舒缓", "学习", "个人记录"] as const,

  /** 访客页：我是怎样的人 / 这间站的气质 */
  personalityPublic: [
    {
      title: "风格",
      text: "就像给朋友写信，给自己写日记",
    },
    {
      title: "节奏",
      text: "留白多一点，一次读一件事",
    },
    {
      title: "立场",
      text: "正在学的人~",
    },
    {
      title: "画面",
      text: "暖色、安静、像纸本",
    },
  ],

  pursuits: [
    {
      title: "学习可以没写完",
      body: "记的是此刻的理解，不是装作已经全会了",
    },
    {
      title: "工程文记语境",
      body: "不只贴结论，也记当时为什么这样选、踩过什么坑",
    },
    {
      title: "生活碎片也算数",
      body: "散步、半本书、一句对话",
    },
  ],

  contentPillars: [
    {
      slug: "learning",
      name: "学习记录",
      description: "最近在啃什么、怎么理解的、哪里还卡着。",
      tone: "像跟未来的自己说话",
    },
    {
      slug: "technical",
      name: "工程札记",
      description: "写代码、部署、工具选用时的真实取舍。",
      tone: "带一点现场感",
    },
    {
      slug: "notes",
      name: "专题整理",
      description: "围绕一个主题整理的复盘、问题清单和阶段性记录。",
      tone: "像在整理一摞资料",
    },
    {
      slug: "life",
      name: "生活手记",
      description: "工作以外的小事，阅读、出行、随口想法。",
      tone: "轻、具体、随性",
    },
  ],

  /** 访客页：读起来是什么感觉（不说技术实现） */
  readingExperience: [
    "暖一点的底色，眼睛不容易累，像摊开笔记本",
    "行距宽一些，适合停下来想一会儿，而不是扫一眼就关",
    "没有紧迫感，不催人一直点下去",
    "按主题慢慢翻，像翻自己的文件夹，不是刷信息流",
  ],

  /** 对内：语气与样式 skill 用（不出现在 /brand 访客页） */
  voice: {
    use: ["记", "翻", "回看", "慢慢", "随手", "这一篇", "记录于"],
    avoid: ["精选", "交付", "洞察", "本期", "赋能", "闭环"],
    language: "界面尽量用中文；技术名词保留英文就好。",
  },

  presentation: [
    "背景偏暖，像摊开笔记本，不晃眼",
    "标题用衬线，导航和标签用无衬线，分清就好",
    "往下滚时内容轻轻浮上来，别弹来弹去",
    "卡片边框淡淡的，鼠标移上去改改颜色就行",
    "长文有目录和一条轻进度线，方便回看，不打断阅读",
    "按主题翻文章，不搞信息流那套",
  ],

  designSystemMapping: [
    {
      brand: "纸色底",
      token: "background-light / background-dark",
      value: "#F6F1EA / #191715",
      usage: "整页背景",
    },
    {
      brand: "墨色字",
      token: "ink / ink-muted / ink-soft",
      value: "#22201D / #5F574E / #83796E",
      usage: "正文、日期、次要说明",
    },
    {
      brand: "陶土点缀",
      token: "primary-*",
      value: "陶土色系",
      usage: "分类标签、引用条",
    },
    {
      brand: "鼠尾草按钮",
      token: "accent-sage",
      value: "#667A54",
      usage: "「开始阅读」这类主按钮",
    },
    {
      brand: "青蓝链接",
      token: "accent-blue",
      value: "#315F72",
      usage: "正文里的链接",
    },
    {
      brand: "卡片容器",
      token: "editorial-card / surface-*",
      value: "圆角 + 浅边框",
      usage: "文章块、侧栏、模块外框",
    },
    {
      brand: "滚动浮现",
      token: "data-reveal + RevealController",
      value: "opacity + translate 0.75s",
      usage: "区块进入视口时淡入",
    },
    {
      brand: "阅读进度",
      token: "reading-progress-*",
      value: "顶部 1px 鼠尾草色进度线",
      usage: "长文阅读反馈",
    },
    {
      brand: "目录导航",
      token: "toc-link / toc-link-active",
      value: "柔和背景高亮 + 当前章节强调",
      usage: "文章页目录",
    },
    {
      brand: "长文排版",
      token: "prose",
      value: "行高约 1.95",
      usage: "Markdown 正文",
    },
    {
      brand: "标题字体",
      token: "font-display / Songti SC stack",
      value: "宋体中文栈优先，Noto 作后备",
      usage: "标题、卡片题名",
    },
    {
      brand: "界面字体",
      token: "font-sans / PingFang SC stack",
      value: "系统无衬线中文栈优先，Noto 作后备",
      usage: "导航、按钮、标签",
    },
  ],

  /** /brand 访客页文案 */
  page: {
    intro:
      "你好，我是 Color。这间站是我的私人笔记：学习、工程、生活里值得留一句的内容。",
    closing:
      "若你也在找一块能慢慢读、慢慢写的地方，欢迎翻翻文章，不必订阅，也不必点赞。",
    sections: {
      essence: {
        label: "关于",
        title: "这间站对我来说",
        lead: "只是把正在经历的学习和生活，留成可以回看的文字。",
      },
      pursuits: {
        label: "态度",
        title: "我写的时候在意什么",
        lead: "不是写作模板，而是我真的这样看待记录这件事。",
      },
      pillars: {
        label: "内容",
        title: "你会在这里读到什么",
        lead: "大致分三类，边界也不严格，有时一篇里什么都有。",
      },
      experience: {
        label: "阅读",
        title: "我希望你读起来感觉怎样",
        lead: "样式是为阅读服务的，下面是我想营造的气氛，而不是设计说明书。",
      },
      look: {
        label: "样子",
        title: "一眼看上去",
        lead: "配色和版式的大致气质——样例仅作预览，点不进去。",
      },
    },
    toc: [
      { id: "essence", label: "这间站" },
      { id: "pursuits", label: "我在意的事" },
      { id: "pillars", label: "读什么" },
      { id: "experience", label: "阅读感受" },
      { id: "look", label: "长什么样" },
    ],
    cta: {
      categories: "按主题翻翻",
      home: "从最新文章开始",
    },
  },
} as const;

export type BrandKeyword = (typeof brandCore.keywords)[number];
