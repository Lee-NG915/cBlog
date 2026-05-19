/**
 * Color 手记 — 个人品牌核心梳理（单一事实来源）
 * 页面展示、站点文案与设计决策均由此导出。
 */

export const brandCore = {
  name: "Color 手记",
  tagline: "给自己留的一间小书房",
  essence:
    "这里不是资讯站，更像一本慢慢写的本子：学到哪记到哪，做过什么、生活里的小事，偶尔翻回去看一眼就好。",

  keywords: ["柔和", "舒缓", "学习", "个人记录"] as const,

  personality: [
    {
      axis: "语气",
      target: "像写信，不端着",
      avoid: "公关稿、说明书腔",
    },
    {
      axis: "节奏",
      target: "留白多一点，一次一件事",
      avoid: "首屏塞满按钮和数字",
    },
    {
      axis: "立场",
      target: "正在学的人，不是导师",
      avoid: "「你必须」「干货交付」",
    },
    {
      axis: "结构",
      target: "按主题和时间长出来",
      avoid: "榜单、数据墙抢视线",
    },
    {
      axis: "画面",
      target: "纸、墨、淡色，安静",
      avoid: "强对比封面感、花哨动效",
    },
  ],

  pursuits: [
    {
      title: "学习可以没写完",
      body: "笔记里允许有「还没想通」。记的是此刻的理解，不是装作已经全会了。",
    },
    {
      title: "工程文记语境",
      body: "写下当时为什么这样选、踩过什么坑，过几个月还能接上当时的自己。",
    },
    {
      title: "生活碎片也算数",
      body: "散步、半本书、一句对话——不必包装成「精致生活」，真实就好。",
    },
    {
      title: "页面别催人点",
      body: "行距宽一点、动效轻一点，让人愿意停一会儿，而不是急着往下点。",
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
      slug: "life",
      name: "生活手记",
      description: "工作以外的小事，阅读、出行、随口想法。",
      tone: "轻、具体、不用力",
    },
  ],

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
      value: "#22201D 及衍生",
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
      brand: "长文排版",
      token: "prose",
      value: "行高约 1.95",
      usage: "Markdown 正文",
    },
    {
      brand: "标题字体",
      token: "font-display / Noto Serif SC",
      value: "400–700",
      usage: "标题、卡片题名",
    },
    {
      brand: "界面字体",
      token: "font-sans / Noto Sans SC",
      value: "400–600",
      usage: "导航、按钮、标签",
    },
  ],

  /** 品牌页专用文案（偏说明，不用于全站） */
  page: {
    intro:
      "这一页给自己看，也给你看：这个站为什么长这样、写文章时心里在想什么。改样式时可以回来对照。",
    sections: {
      essence: {
        label: "这间站",
        title: "是什么",
        lead: "说到底，就是一个不赶时间的个人本子。",
      },
      pursuits: {
        label: "写的时候",
        title: "心里在想什么",
      },
      pillars: {
        label: "栏目",
        title: "通常会记些什么",
      },
      presentation: {
        label: "长相",
        title: "希望看起来怎样",
        voiceHint: "写界面文案时，词可以从此处挑；尽量少用右边这些。",
      },
      designSystem: {
        label: "样式",
        title: "颜色和组件怎么对应",
        lead: "左边是读起来是什么感觉，右边是样式里的名字。新页面尽量沿用这一套，少另起炉灶。",
        checklistTitle: "改样式前扫一眼",
        checklist: [
          "文章正文包在 prose 里，别单独写一堆段落样式",
          "新区块需要入场的话，加 data-reveal；换页后由 RevealController 重新绑一次",
          "卡片用 editorial-card，悬停改边框色就好，别跳太高",
          "主按钮优先 accent-sage，正文链接走 prose 默认",
          "动了语气或定位，记得同步品牌说明和站点简介",
        ],
        backLink: "去首页翻翻文章",
      },
      showcase: {
        label: "组件",
        title: "长什么样（样例）",
        lead: "下面是项目里现成的组件和皮肤。灰色区域点不了，只是看排版和颜色。",
      },
    },
    toc: [
      { id: "essence", label: "这间站是什么" },
      { id: "pursuits", label: "写的时候" },
      { id: "pillars", label: "记些什么" },
      { id: "presentation", label: "希望怎样" },
      { id: "design-system", label: "样式对照" },
      { id: "inventory", label: "组件列表" },
      { id: "tokens", label: "颜色字体" },
      { id: "layout", label: "顶栏动效" },
      { id: "actions", label: "按钮标签" },
      { id: "content", label: "卡片列表" },
      { id: "article", label: "文章页" },
      { id: "states", label: "空状态" },
    ],
  },
} as const;

export type BrandKeyword = (typeof brandCore.keywords)[number];
