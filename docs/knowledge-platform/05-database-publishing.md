# 数据库快照驱动的博客发布

## 交付范围

后台仍在 Cloudflare Workers，正文与发布快照在 D1。公开博客继续使用现有 `apps/web` Next.js 静态导出和 GitHub Pages。此改造不要求迁移公开站托管平台。

已经实现：保存屏障、版本检查、不可变公开快照、GitHub 工作流触发、受限构建数据接口、原博客静态构建、任务状态与线上版本核验。

**启用开关默认关闭。** 本轮未推送或合并 GitHub 工作流、未配置构建令牌、未切换当前 GitHub Pages 数据源，因此尚未完成真实 GitHub Actions 端到端上线验收。云端私人笔记也尚未导入。

## 数据流与一致性

1. 编辑器「保存并前往发布」等待正在执行的保存请求、后续编辑和本机草稿清理。断网、标题缺失、保存失败或版本冲突均停止。仅“保存到本机”不能进入发布。
2. 发布页检查本机所有未同步草稿，重新读取数据库语料版本。若版本与展示的公开范围不同，刷新后要求重新确认。
3. 单条 SQL 在同一数据库状态下检查 `expectedRevision` 并创建快照，只包括未删除、`ready`、`public`、有主主题的笔记。主题名和正文版本一起固定；原 posts 的历史 slug 从元数据保留。私有项目名称、原始元数据、会话不交给构建任务。
4. 后台创建 `build_jobs` 并触发 `knowledge-publish.yml`。任务明确关联快照 ID，而不是在各页面构建时反复读最新数据库。
5. GitHub Runner 必须先用 CI Secret 和 run ID 领取任务，之后只能读取该任务的快照与引用图片。快照下载后由本地只读 API 适配成现有博客 DTO；Next 全部页面都从这同一份快照构建。
6. 图片校验 SHA-256 和文件签名，拷贝到静态产物；内部链接通过 Markdown AST 改写，代码示例保持原样。引用私有笔记、丢失图片或旧站未迁移链接会使构建失败。
7. 构建产物附带 `publication.json`（任务 ID、快照 ID、语料版本）。Pages 部署结束后，后台再抓取该文件核验，匹配才标记「已上线」。

保存成功意味着 D1 已保存，发布成功意味着线上版本核验通过。整个构建存在队列、构建、部署与传播延迟，不承诺固定秒数。其他标签页尚未提交的编辑不可能被服务器获知；它们不会进入已经固定的快照。

## 顺序、失败与恢复

- D1 部分唯一索引只允许一个活动任务；工作流与旧 Pages 流程共用 `pages` 并发组。
- 每个任务只能被一个 run 领取；取消的排队任务即使迟到运行也不能读取或部署。
- GitHub 明确拒绝触发时任务失败，可以重试。超时或 5xx 不能推断“没有触发”，保留锁并显示待确认。
- 「取消等待」仅取消尚未领取的任务，使用数据库条件更新避免与领取并发冲突。
- 「核验任务状态」只在 GitHub run 已结束后尝试恢复；运行中的构建或部署不会被解锁。
- 构建失败可重试原快照，但若数据库已变更，必须生成新快照。
- **部署结果不明确时保留部署锁**，即使 GitHub run 结束也不直接宣称失败并开始下一次部署，避免迟到部署覆盖新内容。需人工核验 Pages 部署是否仍进行；目标版本可访问后点击核验即可成功。确实终止但未上线时，应先确认该 run 的 Pages 部署已取消/失败，再由维护者解除对应任务锁。不得仅按超时自动解锁。
- 全部撤回需要确认空公开范围；构建前清理上一轮生成目录，避免残留旧文章。
- 不恢复旧产物来“回滚隐私状态”。内容修正/撤回应创建新快照重新发布。

## GitHub / Cloudflare 启用配置

### 必须先完成

1. 将本分支代码推送到 `Lee-NG915/cBlog`，经审核合入 `main`。新工作流必须存在于默认分支。当前 `BUILD_REF=main`，不使用任意用户输入决定检出分支。
2. 在云端完成本人登录与测试数据的编辑、保存验证；导入真实笔记之前保持默认私有。
3. 首次启用前核对拟公开内容及旧链接映射。新工作流将完全以 D1 公开快照替换仓库 Markdown 生成的博客；D1 为空时不要直接发布。

### Cloudflare Worker

配置文件 `apps/api/wrangler.jsonc`：

| 变量 | 值 |
| --- | --- |
| BUILD_PIPELINE_ENABLED | 最后启用时改为 `true` |
| BUILD_REPOSITORY | `Lee-NG915/cBlog` |
| BUILD_REF | `main` |
| BUILD_WORKFLOW | `knowledge-publish.yml` |
| PUBLIC_ORIGIN | `https://lee-ng915.github.io/cBlog` |

Secret：

- `BUILD_DISPATCH_TOKEN`：专用 GitHub fine-grained PAT，仅此仓库，Actions read/write（元数据 read），用于触发和查询工作流；不用登录用户 OAuth Token，不写入 Git 或聊天。
- `BUILD_PIPELINE_SECRET`：高强度随机共享密钥，Worker 与 GitHub Actions 各配置一份相同值，用于快照读取和构建回报，不放到 workflow inputs 或 URL。

设置命令（交互输入密钥）：

```sh
cd apps/api
pnpm exec wrangler secret put BUILD_DISPATCH_TOKEN
pnpm exec wrangler secret put BUILD_PIPELINE_SECRET
```

### GitHub 仓库

Actions Secret：`BUILD_PIPELINE_SECRET`（与 Worker 相同）。

Actions Variables：

| 变量 | 值 |
| --- | --- |
| KNOWLEDGE_API_ORIGIN | `https://color-notes-admin-preview.donghaili915.workers.dev` |
| PUBLIC_SITE_URL | `https://lee-ng915.github.io/cBlog` |
| KNOWLEDGE_PIPELINE | 完成配置、旧构建清空并准备切换时设 `true` |

Pages 保持 GitHub Actions 发布源。`KNOWLEDGE_PIPELINE=true` 时旧 `deploy.yml` 跳过构建，避免后续代码 push 又把旧 Markdown 内容覆盖回去。先等待旧工作流与 Pages 部署全部结束，再开后台开关。之后重部署后台。

## 验收

- 当前后端/迁移/快照测试：29 项通过。
- 浏览器：新增保存成功屏障、保存失败阻断 2 项；桌面/手机专题导航回归 2 项通过。
- 用合成快照真实运行 Next 博客构建成功，文章包含快照标记；随后空快照构建成功，旧文章不在新产物。
- 后台类型检查及 Vite 构建通过。
- 云端 `0003_build_jobs.sql` 已执行，当前没有配置构建凭据或启用开关；真实 GitHub 触发、Pages 上线及回报待启用后验收，不能将 mock 测试记为线上验收。

新增用例覆盖未登录触发拒绝、快照过期、并发触发、重复领取、伪造 run ID、无效 CI Secret、模糊触发结果、迟到任务、构建后继续编辑、错误线上版本、回报丢失恢复，以及不明确部署不能释放锁。

## 已知边界

当前公开适配器将允许公开的笔记统一渲染为文章和主题分类；后台的私有项目/学习路径不导出为公开专栏。原 posts 保留历史 slug；存量专栏若将来选择公开，需要另外制定旧专栏 URL 的映射和重定向，不能直接宣称旧专栏路由无损迁移。

D1 单行大小及 Worker 内存/CPU 都有上限，当前方案继承单行公开快照模型。CI 将快照响应限制为 4 MiB，图片每张 1 MiB；规模增大前应改为事务元数据 + 分页不可变快照表。构建前已清理 Next 缓存，不复用跨快照的数据缓存。

因本机 workers.dev DNS 曾异常，线上验收需要正常解析的网络；不要关闭 TLS 校验。GitHub Runner 是否能访问后台仍须真实运行验证。
