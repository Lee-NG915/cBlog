# cBlog 技能筛选与落地报告

核对日期：2026-09-23。目标：提升 Shopify/DTC 技术内容的可信度、可执行性及 cBlog 笔记生产体验。

## 结论与范围

落地7个自包含的项目适配版技能，保留既有2个技能。未安装上游整包、MCP服务、后台记忆程序、外部平台抓取器或发布工具。新技能是根据已核对方法和当前业务重新编写的工作流，不是上游代码的原样安装，也不代表上游维护者背书。

用户清单混合12个具名工具/技能与5个合集，不能当作固定42项。当前核对的营销仓库有50个SKILL入口，社媒仓库有17个。先按目录和描述逐项筛选，再对入选方法及有明显平台依赖的技能阅读正文；未对所有未选技能做代码安全审计或运行测试。
短链t.co均未能访问，以下为按公开作者与名称确认的仓库/官方页面；无法保证每个短链原来指向相同版本。Transitions根据官方仓库检索纠正为 transitions.dev。

## 已落地映射

| 项目技能 | 上游方法来源 | 项目改造 |
|---|---|---|
| cblog-content-strategy | marketingskills/content-strategy | 连接想法、调研、立项；移除固定内容比例和强制多渠道分发 |
| cblog-reader-research | marketingskills/customer-research | 分开读者需求证据与技术证据；保留来源、反证和样本限制 |
| cblog-editorial | marketingskills/copy-editing；本对话文章规范 | 审稿先检查证据与可操作性；不照搬销售文案的情绪放大与零风险承诺 |
| cblog-social-visuals | social-media-skills/graphic-designer | 从LinkedIn改为中文图文；不绑定Gemini，保留实际导出与逐图检查 |
| cblog-content-metrics | marketingskills/analytics | 固定快照窗口、缺失值、字段口径；删除未经核对的通用法律结论与固定事件名 |
| cblog-seo-review | marketingskills/seo-audit | 针对apps/web；区分源码、线上、索引证据；不照搬字符数为硬规则 |
| cblog-webapp-check | anthropics/skills/webapp-testing | 复用项目TS Playwright；验证Markdown源文、预览、保存重载；不强制Python和networkidle |

## 分类决策

| 分类 / 名称 | 决定 | 理由 / 后续触发条件 |
|---|---|---|
| 开发 / [Superpowers](https://github.com/obra/superpowers) | 暂不整包引入 | 是完整工程工作流；当前缺口是内容质量，已有开发工具。未来复杂重构可独立评估debugging等子技能 |
| 开发 / [Context7](https://github.com/upstash/context7) | 暂缓服务配置 | 提供文档查询及MCP/CLI，复制SKILL不等于服务可用；出现频繁版本文档查询需求再接入 |
| 开发 / [Skill Creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) | 复用已有Codex系统技能 | 本次已用系统skill-creator，不重复安装另一套 |
| 开发 / [MCP Builder](https://github.com/anthropics/skills/tree/main/skills/mcp-builder) | 暂缓 | 当前不开发MCP服务器 |
| 开发 / [Webapp Testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | 适配落地 | cBlog已有Playwright与笔记编辑器场景 |
| 开发 / [Claude-Mem](https://github.com/thedotmack/claude-mem) | 暂缓 | 完整记忆系统而非单一文档技能，与Notion及本地稿件已有职责重叠 |
| 设计 / [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 暂缓 | 设计检索与多套风格不是当前瓶颈，先保留现有品牌系统 |
| 设计 / [Taste](https://github.com/Leonxlnx/taste-skill) | 暂缓 | 风格偏好不应覆盖cBlog品牌；具体改版时再选子技能 |
| 设计 / Frontend Design | 不按重复链接安装 | 用户链接与Taste相同，来源存在歧义；[Anthropic同名技能](https://github.com/anthropics/skills/tree/main/skills/frontend-design)另有实现。当前已有style-optimization |
| 设计 / [Transitions](https://github.com/Jakubantalik/transitions.dev) | 暂缓 | 已有柔和动效约束，尚无新交互需求 |
| 设计 / [Web Artifacts](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder) | 暂缓 | 面向独立交互制品；现有cBlog应用与图文HTML已够用 |
| 设计 / [Brand Guidelines](https://github.com/anthropics/skills/tree/main/skills/brand-guidelines) | 不采用 | 是Anthropic品牌配色字体，不是通用品牌策略；沿用style-optimization |
| 市场 / [marketingskills](https://github.com/coreyhaines31/marketingskills) | 精选5种方法适配 | 当前需要研究、选题、编辑、测量和博客SEO，见下方逐项表 |
| 社媒 / [social-media-skills](https://github.com/charlie947/social-media-skills) | 适配图文方法 | 多数正文面向LinkedIn，部分依赖Apify/Gemini；不直接套用到小红书 |
| 财务 / [Finance](https://claude.com/plugins/finance) | 暂缓 | 月结、对账、财务报表和审计不在当前运营流程范围 |
| 小微企业 / [Small Business](https://claude.com/plugins/small-business) | 暂缓 | 工资、发票和现金流等经营管理不是当前任务 |
| 法务 / [Legal](https://claude.com/plugins/legal) | 暂缓 | 当前没有合同、NDA审查任务；内容保密要求已在写作流程处理，不能替代法律审查 |

## 营销合集逐项筛选

“后续”表示明确需求出现再评估，并非已经安装。下表为入口/描述层筛选，入选项另读正文。

| 上游skill | 结论 | 当前适配说明 |
|---|---|---|
| ab-testing | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| ad-creative | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| ads | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| ai-seo | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| analytics | 适配落地 | cblog-content-metrics |
| aso | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| attribution | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| churn-prevention | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| co-marketing | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| cold-email | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| community-marketing | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| competitor-profiling | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| competitors | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| content-strategy | 适配落地 | cblog-content-strategy |
| copy-editing | 适配落地 | cblog-editorial |
| copywriting | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| cro | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| customer-research | 适配落地 | cblog-reader-research |
| directory-submissions | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| emails | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| events | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| free-tools | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| image | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| influencer-marketing | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| launch | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| lead-magnets | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| marketing-council | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| marketing-ideas | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| marketing-loops | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| marketing-plan | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| marketing-psychology | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| offers | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| onboarding | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| paywalls | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| popups | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| pricing | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| product-marketing | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| programmatic-seo | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| prospecting | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| public-relations | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| referrals | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| revops | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| sales-enablement | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| schema | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| seo-audit | 适配落地 | cblog-seo-review |
| signup | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| site-architecture | 后续按需 | 商业化实验或站点增长出现具体需求后再选 |
| sms | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| social | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |
| video | 暂缓 | 当前无相应渠道、投放、销售或规模化生产任务；避免扩大范围 |

## 社媒合集逐项筛选

| 上游skill | 结论 | 理由 |
|---|---|---|
| analytics-dashboard | 合并职责 | 用cblog-content-metrics定义口径；当前先做好数据记录 |
| content-matrix | 合并职责 | 用cblog-content-strategy管理栏目和方向 |
| gemini-carousel | 不直接安装 | 生成器依赖；使用现有图像工具 |
| gemini-infographic | 不直接安装 | 生成器依赖；精确数据优先可编辑图表 |
| graphic-designer | 适配落地 | 保留可编辑图稿、实际导出和阅读尺寸检查 |
| hook-generator | 不单独安装 | 标题由文章证据与收益决定，避免先有钩子再填内容 |
| newsletter-voice | 暂缓 | 当前没有Newsletter渠道 |
| niche-research | 合并职责 | 用cblog-reader-research研究真实任务，不预设平台读者 |
| pinned-comment | 暂缓 | 暂无置顶评论工作流 |
| post-formatter | 合并职责 | 中文格式在写作与图文技能中处理 |
| post-scorer | 不直接安装 | 依赖历史LinkedIn数据或编辑评分；本账号不适合流量预测评分 |
| post-writer | 不直接安装 | LinkedIn及英语默认假设；由cblog-editorial覆盖中文正文 |
| profile-optimizer | 暂缓 | 本次不修改账号主页 |
| quote-post | 暂缓 | 引用卡片不是当前内容主线 |
| reels-scripting | 暂缓 | 尚无短视频制作任务 |
| voice-builder | 暂缓 | 先使用已确认语气，尚无足够本人全文样本做声音画像 |
| youtube-thumbnail | 暂缓 | 暂无YouTube渠道 |

## 使用和维护

入口位于 `.agents/skills/`，由Codex/兼容Agent按描述发现；下一轮可直接用 `$cblog-editorial` 等名称。共享上下文为 `.agents/skills/content-context.md`，不是实时数据仓库。
示例：“用 $cblog-content-strategy 把这三个观察整理成待调研问题”；“用 $cblog-reader-research 核验文章核心判断”；“用 $cblog-editorial 审这篇稿，指出无法执行的步骤”；“用 $cblog-social-visuals 制作通过审稿的内容”；“用 $cblog-content-metrics 复盘同窗口数据”；“用 $cblog-webapp-check 验证Markdown粘贴和预览”。

这些技能不依赖额外npm包、后台进程或密钥。不自动启动多Agent；需要委派时遵守当前对话授权。未安装任何自动发帖功能。
更新上游时先比较适配理由，不自动覆盖本地。新增需求再加技能；不要以数量衡量能力。

## 版本与验证边界

仓库发现结果、已读取SKILL文本的SHA256及源引用记录在同目录 `skill-sources-2026-09-23.json`。这些指纹记录调研依据；项目技能是自编适配版，没有声称与上游文件哈希一致。
验证：对7个技能执行系统quick_validate，检查本地相对链接、前置上下文和实际工程入口。此次未改应用代码，因此未运行全站构建和浏览器E2E；不将技能静态检查描述为内容效果验证。
