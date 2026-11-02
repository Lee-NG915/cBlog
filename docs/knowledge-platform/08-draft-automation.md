# 草稿导入 API 与 Skill

日常整理文章可以直接调用草稿 API，一次完成 Markdown、分类、标签和图片上传，再读回校验。网页仍用于阅读、编辑和决定是否公开发布。

## 权限与数据边界

- API 前缀：`/api/v1/automation`。使用专用 `Authorization: Bearer …`；现有浏览器接口仍要求所有者会话和 CSRF。
- 固定保存为 `draft + owner`。不提供公开发布、下线、删除、恢复、改权限或触发构建的入口。
- 只能修改通过本接口创建、从未发布、仍为私有草稿的笔记。无法接管旧笔记；人工改动通过版本检查保护。
- 以稳定 `sourceKey` 标识一篇稿件，以 `clientMutationId` 标识一次内容提交。网络超时重试同一次操作；内容改变必须产生新操作。
- 服务端仅保存专用凭据的 SHA-256。原始随机凭据保存在本机权限为 `0600` 的文件中，不进入 Git、正文、报告或日志。
- 本接口上传的图片按内容去重，并进行容器格式、大小和存储回读检查。凭据不能读取未通过此接口登记的私有旧附件。

## 常用入口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/capabilities` | 校验服务、权限模式及容量限制 |
| GET | `/groups` | 查询已有分类、路径与项目元数据 |
| GET | `/drafts` | 分页列出由接口导入的笔记 |
| GET | `/drafts/:sourceKey` | 读回正文、版本、校验值和后台链接 |
| PUT | `/drafts/:sourceKey` | 创建或按预期版本更新草稿 |
| POST | `/assets` | 上传 PNG、JPEG、静态 WebP 二进制 |
| GET | `/assets/:id` | 读回本接口已登记的图片 |

正文最多 256 KiB（UTF-8），单图最多 1 MiB。Mermaid 与 Markdown 表格原样保留。分类使用查询所得 `topic_id`，不存在的分类在后台明确创建后再使用，避免自动生成大量同义分类。

Skill 的可维护源文件在 `skills/cblog-draft-publish/`，其脚本、参数说明与运行记录规则以该目录中的 `SKILL.md` 和引用文件为准。安装到 Codex 技能目录后可用 `$cblog-draft-publish` 调用。

## 部署与凭据配置

先运行 API 测试、类型检查和 Worker 打包，审阅迁移。新增迁移只建立来源与附件登记表，不修改原有笔记内容。

```sh
pnpm --filter @cblog/knowledge-api exec wrangler d1 migrations apply color-notes-preview --remote
pnpm knowledge:build
pnpm --filter @cblog/knowledge-api exec wrangler deploy
node scripts/knowledge/provision-draft-api.mjs
```

最后一个命令生成或复用 `~/.config/cblog/draft-api-token`，通过 stdin 配置 `DRAFT_API_TOKEN_SHA256`。远端已有凭据而本地缺失时拒绝覆盖；找回原凭据或明确执行轮换。撤销可删除 Worker 的该 Secret，既有内容和网页登录不受影响。

凭据设置后，用 Skill 查询能力并导入一份获准稿件，再读回正文、分类、标签、版本与图片；第二次导入同一内容应返回无变化。后台实际显示仍需检查，API 写入回执不等于公开博客上线。

相关平台约定：[D1 batch 事务](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)、[Worker Secret 配置](https://developers.cloudflare.com/workers/configuration/secrets/)。
