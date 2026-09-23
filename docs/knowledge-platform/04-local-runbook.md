# 本地验收使用说明

此版本是独立工作台，原博客继续保留。实现与限制见[实现记录](./03-implementation-status.md)。

## 打开

服务运行时打开 [本地知识库](http://127.0.0.1:8787/)，点击「进入本地工作台」。不需要注册、不需要 GitHub OAuth，也不访问外部模型。

关闭终端或重启电脑后，在项目根目录运行：

```bash
pnpm knowledge:dev
```

新设备首次准备（Node.js 24+，pnpm；当前锁文件由 pnpm 12 生成）：

```bash
pnpm install --frozen-lockfile
pnpm knowledge:migrate:plan
pnpm knowledge:import:local
pnpm knowledge:build
pnpm knowledge:dev
```

服务只绑定 `127.0.0.1`，不要改成 `0.0.0.0` 或用公网 Tunnel 暴露。手机尺寸可先在桌面开发者工具模拟；实际手机验收要另建有鉴权的安全预览环境，不能把 loopback 登录入口暴露给局域网。

前端开发可另开终端执行 `pnpm knowledge:ui`，访问 5173 热更新端口；8787 API 服务仍需运行。正式验收页面使用构建产物，改代码后需重新 `pnpm knowledge:build`。

## 建议验收流程

1. 浏览「知识库」与领域，点开长文，试字号、表格、代码、图表和本篇目录。
2. 点「新建笔记」，输入标题与正文，打开「笔记属性」选主题与标签；试格式工具栏和阅读预览。
3. 保存时继续打字、断网再联网；留意「本机已保存」与「已同步」的区别。刷新或关闭页面后，已写入 IndexedDB 的稿件可在编辑页恢复。
4. 在学习路径中「编排笔记」，添加已有笔记、上下移动；同一笔记可用于多个路径/项目。
5. 搜索「广告」「埋点」或完整问题，切换主题；当前是全文与有限同义词匹配，模型问答未启用。
6. 上传一张截图，切阅读预览确认文字可读；大图会先压缩，超过 1 MiB 会明确拒绝。
7. 将一篇测试笔记设为「可发布」「允许公开」并选择主题；到发布记录创建快照，点「构建阅读站」，打开 `/published/` 预览匿名静态阅读。
8. 改成仅自己，再创建并构建新快照，检查旧公开 URL 返回 404。快照创建后继续修改会令旧快照失效，需要重新生成，不会混入后续编辑。

90 篇原笔记迁移后默认仅自己。学习路径和初始分类是可修改的组织建议，不代表原 noindex 内容已经确认可公开。

## 数据与备份

| 位置 | 内容 |
| --- | --- |
| `.knowledge/notes.db` | 独立本地数据库，含编辑、关系、版本和会话 |
| `.knowledge/images/` | 私人图片字节 |
| `.knowledge/migration-plan.json` | 来源、哈希、默认权限与迁移建议 |
| `.knowledge/migration-link-report.json` | 无法解析的源链接 |
| `.knowledge/public/` | 当前公开静态快照；仍仅在本机访问 |
| `.knowledge/backups/` | 手动完整备份 |
| `.knowledge/restore-drills/` | 恢复演练产生的隔离库 |
| 浏览器 IndexedDB | 当前设备未同步稿，不能替代完整备份 |

以上路径均忽略 Git 提交。不要删除 `.knowledge/` 来“清理缓存”，它包含新增笔记。退出前先处理未同步内容；退出会清理该浏览器草稿，不会删数据库笔记。

完整备份和恢复验证：

```bash
pnpm knowledge:export:local
pnpm knowledge:restore:drill
```

第二条会把最近备份恢复到新目录，验证正文/关系/附件哈希，**不会覆盖正在使用的数据库**。可以显式传备份路径：`node scripts/knowledge/restore.mjs /absolute/path/to/backup`。尚不提供一键覆盖当前运行库，恢复演练结果需检查后再规划切换。

再次导入会按 source_path 去重，保留已经在工作台修改的笔记；不会把原文件的新修改自动覆盖到工作台。后续若需要双向合并，必须通过另一个显式差异流程实现。

## 重复验证

```bash
pnpm --filter @cblog/knowledge typecheck
pnpm --filter @cblog/knowledge-api typecheck
pnpm knowledge:test
pnpm knowledge:e2e
```

E2E 需要运行中的 8787 服务，默认使用本机 Google Chrome，创建标题以「验收」开头的合成测试笔记/主题；建议在交付前或独立数据副本上运行，避免把测试内容混入日常工作台。没有 Chrome 时先安装 Playwright Chromium 并修改测试配置 channel。浏览器自动化不等于 iOS/Android 真机认证。

## 常见问题

- **打不开网页**：确认服务终端仍在运行，端口为 8787；需要时重新执行 `pnpm knowledge:dev`。
- **修改代码后界面没变化**：8787 提供 build 产物，重新 build，或使用 5173 热更新入口。
- **保存冲突**：不要连续覆盖提交。点查看差异，导出本机稿，再人工合并。
- **公开构建失败**：检查引用是否指向私人笔记、原缺失文件、未就绪图片，或快照是否过时。旧静态站保留。
- **问答不可用**：模型尚未接入，不是需要充值。普通全文搜索不依赖模型。
- **想迁移到 Cloudflare**：先完成真实 OAuth、云绑定、Free 额度和权限测试；当前 Wrangler ID 是占位值，不能直接视为线上配置完成。
