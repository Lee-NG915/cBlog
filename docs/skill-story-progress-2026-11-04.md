# Skill 故事生产线：进度盘点与后续安排

- 盘点日期：2026-11-04
- 盘点方式：远端知识库工作台（`color-notes-admin-preview`）实际查询 + 源仓库目录盘点 + 本仓库方案文档核对
- 范围：Skill 案例文章与口播稿的生产线，不含 FDE 转型等其他内容线

## 一、方案与基础设施现状

生产线由本仓库两层 Skill 构成，均已合入 `main`：

| 组件 | 提交 | 职责 | 状态 |
|---|---|---|---|
| `skills/cblog-draft-publish` | `6f5e8c7` | 草稿专用 API 上传器：source-key 防重复、版本 CAS、图片读回、中断恢复 | 已实现，有模拟测试 |
| `skills/cblog-skill-story-pipeline` | `8bf00e8` | 案例生产总控：台账、角色分离、独立审稿、冻结包、双稿交付状态机 | 已实现，有单元测试 |
| 远端工作台（Cloudflare Worker + D1/KV） | 见 `docs/knowledge-platform/` | 草稿存储与后台页面 | 已部署，运行中 |
| 公开发布链路 | `.github/workflows/knowledge-publish.yml` | 数据库快照 → 静态构建 → GitHub Pages | 已配置，未对 Skill 案例执行 |

内容方法论技能（`.agents/skills/`，2026-09-23 落地，见 [技能筛选报告](./skill-selection-2026-09-23.md)）：`cblog-content-strategy`、`cblog-reader-research`、`cblog-editorial`、`cblog-social-visuals`、`cblog-content-metrics`、`cblog-seo-review`、`cblog-webapp-check`。

## 二、素材来源盘点

源仓库为 AddX AI Agent Extensions（Plugin 格式，本地路径 `~/Desktop/a4x/skills`），共 **232 个 Skill**，按 14 个类目组织：

| 类目 | Skill 数 | 类目 | Skill 数 |
|---|---|---|---|
| development | 26 | agent-harness | 20 |
| collaboration | 23 | observability | 19 |
| data | 22 | infrastructure | 17 |
| product | 21 | quality | 16 |
| delivery | 21 | security | 14 |
| experimentation | 11 | hardware | 12 |
| customer-care | 7 | business-operations | 3 |

素材充足，瓶颈不在选题来源，而在研究、审稿与验收产能。所有案例写作须遵守脱敏要求（公司、品牌、人员、内部域名、真实路径与编号一律匿名化，见管线 `references/roles.md`）。

## 三、昨日上传盘点（2026-11-03）

远端工作台当前共 390 篇笔记，其中 **2026-11-03 上传 84 篇，全部为 `draft` 状态**，无 ready / 公开。扣除 2 篇 FDE 线草稿（《FDE 岗位共性需求分析》《FDE 转型实战——1》），**Skill 案例线共 82 篇草稿，覆盖 8 个知识领域**：

| 主题 | 草稿数 | 推算案例数 |
|---|---|---|
| ai-engineering | 20 | 10 |
| growth | 14 | 7 |
| hextech-operations | 14 | 7 |
| hextech-records | 12 | 6 |
| observability | 10 | 5 |
| architecture | 6 | 3 |
| hextech-design | 6 | 3 |
| **合计** | **82** | **41** |

配对关系已用草稿 API 的 `sourceKey` 机械确认（2026-11-04 下午复核，见「七、进度日志」）：**41 个案例全部为文章+口播完整双稿**。其中 39 例的 sourceKey 为 `skill-case-gXX-article/script` 或 `story-00000X-article/script` 标准形态；另有 2 例（故障分析、投放分析）的文章由工作台 UI 手工创建、无 sourceKey，其口播稿 key 为 `skill-evidence-driven-diagnosis-recording` 与 `skill-independent-campaign-evaluation-recording`。

**显式标注「口播稿｜」的草稿共 9 篇**：测试策略、云成本、性能预检、任务恢复、故障分析、代码审查、投放分析、视频打标、安全审计。其余案例的口播稿标题未加前缀，仅为命名不一致，不影响双稿完整性。

## 四、当前进度对照管线阶段

按 `cblog-skill-story-pipeline` 的执行顺序核对：

| 阶段 | 状态 | 依据 / 缺口 |
|---|---|---|
| 1. 对账既有稿件与 source-key | **部分完成** | 80 篇 API 草稿均有 sourceKey（36 例 `skill-case-gXX-*`、3 例 `story-00000X-*`、2 篇独立口播 key）；2 篇 UI 手工创建的文章无 sourceKey。本机仍未找到台账 `pipeline.sqlite` 与上传 manifest |
| 2. 案例与任务登记 | 无法确认 | 无台账可核对；但 sourceKey 覆盖率高，重建成本低 |
| 3. 研究 → 写作 | **已完成（事实层面）** | 82 篇成稿已在远端，主题与源仓库类目对应 |
| 4. 独立内容审稿 / 视觉审阅 | **无证据** | 未找到审阅报告（`reviews/`）与冻结包记录 |
| 5. 冻结双稿包 + 上传 | 上传事实成立，冻结环节无证据 | 草稿在远端且 `state=draft`，但无 package 记录可引用 |
| 6. 页面验收与双稿交付 | 未完成 | 草稿未发布，状态未推进 |
| 公开发布 | 未开始 | 需单独授权 |

结论：**写作产能已跑通并产出 41 个案例的成稿，但质量门禁（台账、独立审稿、冻结、页面验收）的证据链缺失**。按管线约定，这批草稿目前只能计为「已保存草稿」，不能计为「已交付」。

## 五、后续安排

按优先级排序：

1. **恢复台账（阻塞项）**：找到昨天执行上传的会话与私人工作目录（含 `pipeline.sqlite`、manifest、回执）。若确认丢失，则以远端草稿为事实源重建台账：按 sourceKey 逐篇 `read` 读回，登记为既有产物（41 例双稿配对已由 sourceKey 确定，无需人工配对）。
2. **补齐 2 篇 UI 文章的 sourceKey**：故障分析与投放分析两例的文章为工作台手工创建、无 sourceKey；读回审阅后用 `--expected-version` 重新走标准导入绑定 `skill-evidence-driven-diagnosis-article` / `skill-independent-campaign-evaluation-article` 之类的稳定 key。
3. **独立审稿**：按 `roles.md` 门槛逐案例执行内容审阅（evidence / technical / privacy / oral），重点核对脱敏是否彻底（源仓库含内部认证信息、真实域名与人员线索）。
4. **统一口播稿标题前缀**（可选）：审稿或更新时把其余案例的口播稿标题补上「口播稿｜」前缀，保持列表可读性。
5. **冻结包与页面验收**：审稿通过后冻结双稿包，逐篇打开后台真实页面验收（桌面 + 移动 + 图片 + 私有草稿状态）。
6. **发布决策**：验收通过的案例清单交由所有者决定是否公开发布，以及走 GitHub Pages 静态链路还是保留在知识库内。
7. **选题排期**：以 41 个已有案例为第一批；源仓库剩余约 190 个 Skill 按 `cblog-content-strategy` 排优先级，不以下批数量为目标。

## 六、风险与注意

- 源仓库 `AGENTS.md` 含内部环境变量清单与内部域名，**任何案例成稿不得携带这些信息**；审稿的 privacy 项是第一优先级。
- 本地 `.knowledge/notes.db` 是今日新建的空库，与远端草稿无关；不要把本地库当作台账来源。
- 远端草稿均无 `display_published_at`，发布前需按 `08-publication-dates.md` 单独设定展示日期。

## 七、进度日志

| 日期 | 事件 | 结果 |
|---|---|---|
| 2026-11-03 | 批量生产并上传 Skill 案例草稿 | 84 篇草稿进入远端工作台（82 篇案例线 + 2 篇 FDE 线），全部 draft |
| 2026-11-04 | 进度盘点（本文档） | 确认 41 个案例成稿、9 篇显式口播稿；标记台账缺失为阻塞项；生产线暂停于「恢复台账」之前 |
| 2026-11-04 | 所有者决定暂停 | 本次会话结束时不推进后续步骤；下次接手从「五、后续安排」第 1 步（恢复台账）开始 |
| 2026-11-04 | 草稿上传 Skill 三端安装 + 凭据配置 | `cblog-draft-publish` 已装入 Kimi Work / Kimi Code / Claude Code；令牌写入 `~/.config/cblog/draft-api-token`（0600）并验证可用 |
| 2026-11-04 | 修复上传 CLI 被边缘拦截 | 本机 workers.dev 直连被 DNS 污染，须走系统代理；默认 Python UA 被边缘 403，已加显式 `User-Agent` 修复（分支 `fix/draft-publish-user-agent`，34 项单测通过） |
| 2026-11-04 | sourceKey 复核 | 用草稿 API 确认 41 个案例全部双稿齐配；更正上午「source_path 均为空」的判断（corpus 视图不含 sourceKey，草稿 API 视图有） |
