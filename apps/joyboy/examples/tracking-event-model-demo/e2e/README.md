# E2E 冒烟测试模板（Playwright）

> 这里是 **模板**，不是可在本仓库直接跑的脚本。它演示的是：单测层校验"业务 action → trigger payload"，E2E 层校验"真实用户操作 → 真实 dataLayer / 真实 CAPI 网络请求"。

## 它证明什么

单测层无法证明：

- 客户端是否真的把 GA event 推进了 `window.dataLayer`；
- consent gate 是否在生产构建中被打包；
- Meta CAPI 的 server-side endpoint 是否真的被调用、是否带了正确的 `event_id`；
- A/B test 或 feature flag 是否影响了埋点行为。

E2E 层就是来做这件事的——它跑在真实页面（dev / staging / preview），对 `window.dataLayer` 与对外的 conversion API 请求做断言。

## 用法

1. 在能跑起来的项目里安装：

   ```bash
   pnpm add -D @playwright/test
   pnpm exec playwright install chromium
   ```

2. 把 `add-to-cart.spec.ts`、`purchase.spec.ts` 复制到目标项目的 e2e 目录。

3. 修改 `BASE_URL`、选择器、Meta CAPI endpoint hostname 与 fixture 数据，使其匹配真实站点。

4. 跑：

   ```bash
   BASE_URL=https://staging.example.com pnpm exec playwright test
   ```

## 模板中包含的 4 类断言

| 断言                                                              | 出现在                |
| ----------------------------------------------------------------- | --------------------- |
| `window.dataLayer` 里推送的 GA event 数量、名称、字段             | 两个 spec             |
| Meta CAPI 网络请求的 URL、`event_id`、`event_name`、`custom_data` | 两个 spec             |
| GA 与 Meta 共享同一个 `event_id`（验证跨平台 dedupe 契约）        | 两个 spec             |
| consent 未授权时只有 GA、没有 Meta 请求（验证 consent gate）      | `add-to-cart.spec.ts` |

## 与方法论的对照

| README 提到的层                                   | 这里如何落地                                               |
| ------------------------------------------------- | ---------------------------------------------------------- |
| "E2E 冒烟测试 — 真实用户流程是否触发预期公开事件" | `expect(dataLayer).toContainEqual(...)`                    |
| "目的端 payload 回归 snapshot"                    | `expect(metaRequests[0].postDataJSON()).toMatchSnapshot()` |
| "consent 不通过则不触发"                          | 关闭 consent cookie 后断言 `metaRequests.length === 0`     |
