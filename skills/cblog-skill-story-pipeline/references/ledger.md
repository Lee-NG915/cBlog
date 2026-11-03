# 本地台账协议 v1

入口 `python3 <本Skill>/scripts/pipeline.py --db <私人目录>/pipeline.sqlite <command>`。仅主 Agent 写台账；其他角色返回不可变文件。数据库包含正文、源路径及证据映射，应放在被 Git 忽略的私人目录，不上传。脚本只处理本地文件，无网络、凭据读取或 Agent 启动。

`init` 建表；`status [--case <id>]` 查询；`package-check --package <id>` 检查当前上传门槛并返回冻结包。其他命令都使用 `--spec <UTF-8 JSON文件>`。JSON 中的相对文件路径以该 spec 文件所在目录解析。成功返回 JSON、退出 0；门槛/输入失败退出 2，事务回滚。命令输出也可能包含私人路径或正文，勿写入公开日志。

## 案例、产物与任务

```json
{"id":"story-000123","title":"一个技术判断案例"}
```

交给 `case-add`。案例 ID 为 1–100 位小写字母/数字/下划线/连字符，首尾字母数字，永久稳定。文章和口播 source-key 自动为 `story-000123-article`、`story-000123-script`。案例内部标题用于盘点，最终展示标题在冻结包中单独填写。不要把真实 Issue 号放入 ID。

`artifact-add` 登记已存在材料或人工核对后的产物：

```json
{"id":"story-000123-evidence","case_id":"story-000123","kind":"evidence","path":"run-01/evidence.json","producers":["research-agent"],"dependencies":[]}
```

kind 可为 `source/evidence/claims/article/script/image/visual_source/report`。传文件真实生产者，不用“总控”代替作者。依赖是同案例 artifact_id；脚本记录依赖的当前版本和 hash。更新沿用 artifact_id，但使用新路径，保留旧文件；生产者归属累计，不能改名清除自审冲突。原地改文件立即使检查失败。把旧文稿作为修订输入时，使用任务完成接口，脚本保留旧输入并避免自依赖环。

任务命令示例：

```json
{"id":"story-000123-write-01","case_id":"story-000123","stage":"writing","inputs":["story-000123-evidence"],"depends_on":[]}
```

交给 `task-add`。inputs 指已经登记的材料；depends_on 指同案例已登记任务。未就绪材料不要虚构占位 artifact，待真实材料到位再加任务。

```json
{"task_id":"story-000123-write-01","worker":"writer-agent","lease_seconds":3600}
```

交给 `task-claim`，返回 generation、lease_until 及冻结输入。领取时所有依赖任务须 done；有未过期执行者时拒绝抢占。租约过期可重新领取，代次加一。脚本不会终止旧 Agent，主 Agent 应通知旧执行者停止；即便其迟到，旧代次也无法完成任务。

```json
{"task_id":"story-000123-write-01","worker":"writer-agent","generation":1,"outputs":[{"id":"story-000123-article","kind":"article","path":"run-01/article.md","producers":["writer-agent"],"dependencies":[]}]}
```

交给 `task-finish`。outputs 可多项；脚本自动加入全部任务 inputs 作为产物依赖，不能以省略 dependencies 去除输入绑定。文件须已存在，生产者包含 worker。输入变化、租约到期、代次不符均拒绝提升结果。done 只表示该工作任务结束，不表示文章通过审稿。

同时修订 article 和 script 时，可把两者都列入 inputs 并一次输出两份新版本。完整旧输入仍保留在 claimed_inputs；整组被替换的旧稿依赖递归展开为外部来源依赖，不把“新文章依赖旧口播、新口播依赖新文章”拼成环。生产者继承完整输入组。若新口播确实必须绑定刚写好的新文章版本，应分为两个有序任务，而不是在同次完成中声明新产物互相依赖。

`task-stop` 接收 `task_id/worker/generation/state/reason`；state 为 `blocked/rework/retry_wait`。输入已经变更或租约已到期时，当前代次仍可停止，但不能接受旧代次结果。`task-requeue` 接收 `task_id/reason`；只重开非 running 任务。重开已完成任务会立即使其旧输出失效。后继任务重新领取时读取最新依赖，不复用旧 claim。

## 真实审阅及冻结包

内容或视觉的 `review-add`：

```json
{"case_id":"story-000123","stage":"content","reviewer":"independent-editor","verdict":"passed","artifact_ids":["story-000123-article","story-000123-script","story-000123-evidence","story-000123-claims"],"report_path":"reviews/content-01.md","checks":{"evidence":true,"technical":true,"privacy":true,"oral":true},"blockers":[]}
```

verdict 为 `passed/rework/blocked`。报告先由实际审阅者完成，主 Agent 据实登记。脚本核对当前文件、输入及 producer 回避，不会阅读报告后推断审稿结论。审阅者不能属于受审产物及其来源依赖的生产者；简单换 reviewer 名称不产生真实独立性。

本版每案例、每阶段使用最新一条审阅结论；后一条退回不能被旧通过盖住。内容审阅一次覆盖文章、口播、证据、主张表；视觉审阅一次覆盖本包全部图片和主张表，检查项为 `opened_images/semantics/privacy/desktop/mobile`。分工审阅可先产生多个报告，由独立验收者检查完整覆盖后汇总登记；不能把局部报告当成整套通过。

`freeze`：

```json
{"id":"story-000123-package-01","case_id":"story-000123","artifacts":{"article":"story-000123-article","script":"story-000123-script","evidence":"story-000123-evidence","claims":"story-000123-claims"},"assets":["story-000123-diagram"],"titles":{"article":"技术文章标题","script":"口播稿标题"},"target":{"base_url":"https://blog.example/api/v1/automation","topic_id":"engineering","tags":["Skill"]}}
```

冻结前需有效内容审阅；有图片时需视觉审阅。target 可额外给 `display_published_at`，时间含时区。使用真实已存在分类，未分类 topic_id 为 null。文章/口播必须是最终上传的正文，不夹带私人前置元数据或来源账。

脚本复用同级上传 Skill 的离线 `make_plan` 校验格式与大小，冻结实际正文、元数据、图片引用、字节摘要及目标。所有图片须为 assets 中已审阅的本地图片，登记资产应恰好被双稿引用；同一图片仅登记一次。原生 Mermaid/表格仍保留在正文中。图的可编辑源文件另登记 visual_source，不作为上传图片。

冻结生成 package hash，状态为 awaiting_package_review。最终包审阅通过后登记：

```json
{"stage":"package","package_id":"story-000123-package-01","reviewer":"package-editor","verdict":"passed","report_path":"reviews/package-01.md","checks":{"rendered":true,"links":true,"formatting":true,"metadata":true},"blockers":[]}
```

随后 `package-check` 才能返回 upload_ready。新输入/稿件/图片会使旧门槛失效；新冻结包也撤销同案例旧包的上传资格。修改包用新 package_id，source-key 保持不变。上传前再次执行 package-check；它是时点检查，运行期间不要修改输入文件。

每次包检查还会重新运行上传器的离线解析，将整个当前 plan 与冻结 plan 对比，包括图片解析后的路径与摘要；图片软链接改指向另一文件也会阻止上传。通过检查后仍需保持文件/链接不变，这不是针对恶意并发修改的文件系统隔离。

## 只通过原 Skill 上传

先 `upload-begin`：`{"package_id":"...","kind":"article","operator":"coordinator"}`。返回 session_id。一个台账全局只有一个上传会话，article/script 分别处理。

从冻结包 plans 中取 markdown、sourceKey、fields.title、topic_id、tags，target 中取 base_url，按原 [cblog-draft-publish](../../cblog-draft-publish/SKILL.md) 的 `plan/import/read` 协议调用；原上传器负责凭据、版本 CAS、HTTP 重试、图片上传/读回与 pending mutation。本脚本不调用网络，不拼请求。

每次成功后，保留原可继续更新的 CLI manifest；另外将该次 manifest、CLI verified 输出、最新 `read` 完整输出复制到本次不可变证据目录。这三份含正文和私人路径，不可提交仓库。

```json
{"package_id":"story-000123-package-01","kind":"article","cli_manifest_path":"receipts/run-01/manifest.json","cli_receipt_path":"receipts/run-01/import.json","readback_path":"receipts/run-01/read.json"}
```

交给 `receipt-add`。它检查目标/source-key、无 pending、原输入摘要、替换图片 URL 后的完整正文、元数据、图片映射、最新版本及 draft/owner；图片字节已读回由原 CLI 的 verified 回执证明。它不能鉴别手工伪造的 JSON，也不会主动刷新远端；总控必须保存真实工具输出，不能手填成功结果。

`upload-end`：`{"session_id":"...","operator":"coordinator","outcome":"verified"}`，需先登记本轮机器回执。请求结果不确定时用 outcome=`uncertain`，会话保留且永不过期。仅在从未发送请求时可用 `not_started`，同时给 `no_request_sent:true` 和事实报告 `report_path`。

崩溃后检查实际进程和原 manifest；确认旧进程停止后，使用同一 package/kind/operator 再 `upload-begin`，额外给 `previous_process_stopped:true,recovery_report_path`。它返回同一 session_id。继续原 CLI 命令和 pending mutation；结果读回前不释放上传会话。租约和本地 SQLite 约束不约束服务端，也不能阻止另一个数据库或绕开工具的上传。

上传会话未解决时，脚本拒绝变更该案例的产物、审阅、冻结包及重开任务；其他案例可以继续研究与审阅。这样保留原包的恢复入口。不要直接修改磁盘上的冻结文件；真实进程未停止时，任何本地状态都不能证明远端请求已经结束。

输入被误改或旧包失效时先恢复原冻结输入用于确认旧请求状态；不要直接创建新包顶替未知请求。若权限或不可恢复远端状态使原请求无法确认，保留 uncertain，停止该上传入口并由主 Agent 处理，不能删除锁行宣称解决。

## 页面验收与双稿完成

独立验收者逐份打开真实后台页面后，主 Agent 调用 `ui-add`：

```json
{"package_id":"story-000123-package-01","kind":"article","reviewer":"page-reviewer","note_id":"returned-note-id","version":1,"report_path":"reviews/ui-article-01.md","checks":{"desktop":true,"mobile":true,"images":true,"content":true,"private_draft":true}}
```

报告记录实际观察、截图引用、note_id/version 与未执行项。脚本要求 reviewer 回避生产者、版本对应最新 receipt；它不操作浏览器。图片验收逐张，视口检查不能由 API 返回 200 替代。

交付状态计算：无回执 `ready_to_upload`；一份有效回执 `partial_saved`；两份机器读回但页面未齐 `pending_ui`；双稿机器/页面均通过 `delivered`。上传会话尚未解决则 `upload_result_pending`，此时不能登记最终页面验收。输入/审阅过期则 `needs_revalidation`。后来的机器回执使该稿旧页面验收失效，即便 source-key 相同。状态只反映已保存证据的时点，远端人工修改仍需重新 read 核对。

只有与约定数量一致的全部产物都交付才标整批完成。保持案例完成数、来源去向覆盖和草稿数量分别报告，不把 blocked 或研究 done 计为已交付。
