# 草稿 API v1

根路径 `/api/v1/automation`，`Authorization: Bearer <token>`。专用令牌没有公开发布、删除或分类写入能力。

| 请求 | 用途 |
| --- | --- |
| `GET /capabilities` | service=`cblog-draft-automation`、version=1、mode=`draft-only` |
| `GET /groups` | `{data:[{id,name,kind,parent_id,position,version}]}` |
| `GET /drafts?cursor=<sourceKey>&limit=50` | `{data:[...],nextCursor:string|null}` |
| `GET /drafts/:sourceKey` | 完整正文和版本 |
| `PUT /drafts/:sourceKey` | 创建／更新指定来源的草稿 |
| `POST /assets` | 原始 PNG/JPEG/WebP 二进制，最多 1 MiB |
| `GET /assets/:id` | 带认证读回二进制 |

PUT 只发送 title、body、topic_id（可 null）、tags、可选 display_published_at、expectedVersion、clientMutationId。创建 expectedVersion=0；更新为已审阅或已验证版本。sourceKey 是 1–120 位小写字母、数字、`_`、`-`，首尾字母或数字。clientMutationId 是 UUID，重试不改变。

成功 `{data:{id,sourceKey,version,title,body,topic_id,tags,display_published_at,state:'draft',visibility:'owner',updated_at,body_sha256,admin_url}}`。幂等回执可能额外有 replayed/currentVersion；它对应原请求，不保证仍是当前版本，必须再次 GET 核验。

附件返回 `{data:{id,url,readback_url,mime,bytes,sha256}}`。ID 为内容摘要，相同字节重复上传不产生重复资源。正文地址为同源 `/api/v1/assets/<id>`，读回地址为同源 automation 附件地址。

错误包括 CONFLICT、IDEMPOTENCY_CONFLICT、NOT_DRAFT、NOT_FOUND。权限或版本冲突不自动改来源标识或覆盖。仅网络超时、429 和可重试服务端错误有限重试。原始错误正文不输出，避免凭据回显。

传输诊断使用固定代码 TLS_VERIFY_FAILED、TLS_ERROR、DNS_FAILURE、NETWORK_TIMEOUT、CONNECTION_RESET 等，不打印原始异常或请求头。安全 DNS 使用 Cloudflare JSON DoH 的 A 查询，验证回包 Question、目标名／CNAME 链以及公网 IPv4。先对固定 DNS 服务域名建立正常 HTTPS 连接，连接失败才用固定 bootstrap 地址，TLS 始终验证该服务域名。详情见 [Cloudflare 官方 JSON DoH 协议](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/)。
