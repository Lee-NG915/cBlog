# 同步台账约定

台账与远端快照放在 `docs/internal/notion-sync/` 或成果原有私人目录，避免把私人页面映射提交到公开内容目录。配置入口为 `docs/internal/notion-sync/config.json`。如不存在，按SKILL默认值创建；不得包含认证信息。

每个成果使用稳定artifact_id（UUID），路径改变保留ID。状态：pending_review、ready、uploading、pending_verification、synced、conflict、failed。只有审阅范围与当前内容哈希匹配才从pending_review进入ready。

manifest至少保存以下信息：

```json
{
  "schema_version": 1,
  "artifact_id": "实际UUID",
  "source_path": "相对项目根目录的源路径",
  "source_sha256": "当前SHA256",
  "review": {"status": "passed", "evidence_path": "review.md", "reviewed_at": "ISO8601", "reviewed_source_sha256": "实际值", "reviewed_assets": []},
  "notion": {"parent_id": "实际父页ID", "page_id": null, "url": null},
  "assets": [],
  "unresolved_links": [],
  "status": "ready",
  "last_success": null,
  "last_error": null
}
```

这是字段说明，不能将示例值当真实记录。assets每项保存path、sha256、bytes、upload_status、持久file_id/markdown_source、attached_page_id、verified_at；图片短期签名下载URL不是稳定身份，不持久化上传凭证。
last_success保存synced_at、source_sha256、资产哈希列表、base_local_snapshot_path、base_remote_snapshot_path。快照保留用于三方合并的正文；忽略易变元数据，但不要忽略用户新增内容。

写台账先写同目录临时文件再原子替换，避免中断留下半个JSON；创建远端页面后立刻保存page_id，图片上传后立即保存返回标识。失败记录步骤、可公开错误摘要、时间和下一步；不得包含密钥或签名头。

正文可保留简短“同步信息”：artifact_id、相对源路径、源版本摘要、最近同步时间，便于断点后查找；不附用户名所在的绝对机器路径。审阅结论仅代表相应版本。

## 行为验收场景

1. 重复执行相同源文：复用page_id，无重复页面、无重复附件。
2. 文本更新、图片未变：更新正文并复用附件。
3. 图片更新：上传新哈希版本并验证引用，再记成功。
4. 图片缺失/超限/无法预览：保留错误，不标整套synced。
5. 远端同段被改：记录冲突，保留两版，不能覆盖。
6. 创建超时：先凭artifact_id查找远端，不能直接再次创建。
7. 旧稿通过后被退回：pending_review，不纳入已通过成果。
8. 目录未指定：新建主题目录；默认父页无权限时不换工作区。

这些是执行时的验收要求；静态技能校验不等于已经做过真实上传测试。
