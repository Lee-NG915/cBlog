# 仅更新前端，保留已上线内容

GitHub Pages 继续承载公开博客。`KNOWLEDGE_PIPELINE=true` 保留，后台新增/修改内容仍通过 `knowledge-publish.yml` 发布。

## 发布入口

在 GitHub Actions 选择 **Publish frontend with live content**，分支选 `main`，点击 Run workflow。也可以执行：

```sh
gh workflow run frontend-publish.yml --repo Lee-NG915/cBlog --ref main
```

这是手动入口，普通推送不自动替换公开内容。后台笔记的保存、编辑、发布状态均不由此流程修改。

## 内容如何保持不变

1. 与原 Pages 和数据库发布共用整个工作流的 `pages` 并发锁。
2. 读取 `github-pages` 环境当前成功部署对应的工作流 run，不取最新提交或最新构建。
3. 下载该 run 的 `published-content` artifact。数据库发布保存当次不可变公开快照及引用图片；旧发布保存文章来源提交。
4. 用当前前端代码重新构建该来源。数据库方案保留 `publication.json` 的 jobId、publicationId、revision，不重新查询后台当前笔记，也不创建内容发布任务。
5. 部署前再次核对成功部署 ID、内容版本和前端版本；若已变化则失败，不能覆盖。
6. 上线后检查 `frontend.json` 的代码 SHA/run ID 和未变化的 `publication.json`，匹配才报告成功。

数据库快照使用原始图片校验和再次验证；空快照也是有效内容状态，不自动回退到仓库文章。快照文件保存在 Actions artifact 中，不放入网站公开目录。

## 旧站首次接入

接入前的旧部署没有内容 artifact。只有明确验证线上仍为旧仓库发布、没有 `publication.json`，且指定 SHA 等于当前成功部署提交时，允许一次引导：

```sh
gh workflow run frontend-publish.yml --repo Lee-NG915/cBlog --ref main \
  -f legacy_content_sha=<当前线上旧部署的完整40位提交SHA>
```

首次前应核对该部署使用的是 filesystem 数据源。该流程在临时 CI checkout 恢复该提交的 `content/`、`data/blog.db` 和文章图片，使用当前前端构建。不能拿任意历史提交回滚内容。新发布会保存来源，后续无需再传 SHA。

## 限制与失败处理

- artifact 保留 90 天，每次前端成功发布都会续存到新 run。若过期或丢失，数据库来源必须在后台核对范围后重新发布；流程会停止，不能悄悄换成旧 Markdown。旧站未接入情况仅支持上面明确验证的引导。
- 不支持将其他网站、未知工作流或旧 Content API 影子 fixture 作为生产内容。
- 若部署成功但核验失败，先核对当前线上标记和 GitHub 部署状态，不直接回滚或重新发布旧内容。
- `frontend.json` 只标识前端版本，不能替代内容发布标记；后台现有的内容上线核验仍可正常工作。
- 本次不会修复 `shadow-build.yml` 中历史 fixture 与仓库内容不一致的问题；该影子流程不负责生产发布。

## 检查

```sh
node --test scripts/knowledge/frontend-publish.test.mjs
pnpm --filter @cblog/knowledge-api exec node --import tsx --test test/snapshot-build.test.ts
```

覆盖：当前 run 排除、并发部署阻断、禁止跨数据源回退、内容版本匹配、图片归档、上线前版本变化拒绝。真实部署结果应另外记录，单元测试不等于已上线。
