---
name: cblog-draft-publish
description: 将本地 Markdown 文章和图片导入或更新 cBlog 后台草稿，按稳定来源标识防重复并读回核验。用于已获用户授权的后台草稿写入；不负责公开发布。
---

# cBlog 草稿导入

使用本 Skill 的 Python 标准库 CLI 完成后台草稿写入。保留原文、图表和现有分类；编辑、脱敏和公开发布属于单独任务。

## 入口与凭据

- CLI：`scripts/cblog_draft.py`；运行 `python3 <skill目录>/scripts/cblog_draft.py --help` 查看参数。
- 默认 API 是当前 cBlog 后台的 `/api/v1/automation`；用 `CBLOG_DRAFT_API_URL` 或 `--base-url` 指定其他部署。
- DNS 默认 `auto`：只有默认后台的精确域名在网络失败时才通过 Cloudflare DoH 重试；其他域名使用系统 DNS。已确认本机系统 DNS 返回错误地址时，可在命令前设置 `CBLOG_DRAFT_DNS_RESOLVER=cloudflare`，或在子命令前加 `--dns-resolver cloudflare`。`--dns-resolver system` 关闭回退。无需改系统 DNS。
- 令牌来自 `CBLOG_DRAFT_TOKEN`，或 `~/.config/cblog/draft-api-token`，也可用 `--token-file` 指定。令牌文件必须由当前用户拥有且权限为 `0600`。不要把令牌写进命令参数、文档、manifest 或输出。脚本不获取浏览器 cookies、不创建凭据。

## 导入步骤

1. 用户已要求“更新后台”“导入草稿”等即视为本轮草稿写入授权，不重复确认。仅要求方案、审稿或预览时，只执行离线 `plan`。
2. 选择稳定的 `source-key`，例如 `skill-evidence-driven-diagnosis`；后续修改继续使用同一个 key，不通过改 key 绕过冲突。
3. 用 `groups` 查看分类，选择真实 `topic_id`；未分类用 `--topic-id none`。不要擅自创建分类。
4. 执行 `plan`，确认标题、正文大小及本地图片。Markdown 应是文章正文，避免把私有研究台账或不打算展示的前置元数据导入正文。
5. 执行 `import`。脚本上传本地 PNG/JPEG/WebP 并替换 URL，然后写草稿、读回全文和图片校验。保留 manifest 供更新和中断恢复。
6. 仅在结果为 `verified` 时报告“草稿已保存并读回一致”，附 `admin_url`。这不等于视觉审阅或公开发布。外部图片 URL 原样保留，不验证第三方图片可达性。

```bash
python3 <skill目录>/scripts/cblog_draft.py groups
python3 <skill目录>/scripts/cblog_draft.py plan --markdown article.md --title '文章标题' --source-key skill-example --topic-id ai-engineering --tag Skill
python3 <skill目录>/scripts/cblog_draft.py import --markdown article.md --title '文章标题' --source-key skill-example --topic-id ai-engineering --tag Skill
python3 <skill目录>/scripts/cblog_draft.py read skill-example
python3 <skill目录>/scripts/cblog_draft.py list --limit 50
```

## 冲突与恢复

- 默认 manifest 位于 Markdown 同目录的 `.<文件名>.<source-key>.cblog-manifest.json`，权限 `0600`，含正文和来源路径，属于私有工作文件；可用 `--manifest` 指定。它绑定 API、source-key 和已核验版本。
- 超时后重复同一条命令；未完成请求保留原 mutation ID。不要删 manifest 或换 key 重试。最多尝试 3 次，仍不确定则停止并保留待恢复记录。
- 安全 DNS 仅查询 API 域名，不携带专用令牌；直连解析地址时仍验证原域名的 TLS 证书并保留 Host/SNI，不经过系统 HTTP 代理、不跟随重定向。证书验证失败立即停止，不关闭校验。显式为其他域名启用 Cloudflare 会向该 DNS 服务发送域名，内部地址保持 `system`。
- 远端有人工修改、来源已绑定但缺少 manifest、或文章已公开时停止。先 `read` 审阅，与本地合并；获用户授权后用 `--expected-version <已审阅版本>` 更新。它不能绕过服务器版本检查或把公开文章改为草稿。
- 单张图片不超过 1 MiB，正文不超过 256 KiB；超限先整理资源，不自动压缩或截短。工具不会下载远端图片、删除笔记或触发博客发布。

排查接口问题时读取 [references/api-contract.md](references/api-contract.md)。本地测试：`python3 -m unittest discover -s <skill目录>/tests -v`，只使用模拟服务。
