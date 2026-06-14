# POS UMS 认证头改造方案分析

## 1. 结论先行

本次更推荐 **先做 CA-only**：

- CA 市场先接入 UMS 登录
- CA 市场先把 POS 接口认证头从 `X-Access-Token` 切到 `Authorization`
- 其他市场保持现状

原因：

- 当前登录链路刚完成 `login-ums + callback + retailId` 整合，仍在收敛
- 认证头替换不只是登录页改造，还涉及请求层、refresh 逻辑和零散 helper
- CA 是当前明确业务范围，适合先做首发验证

---

## 2. 当前现状

当前 POS 认证方式：

- 默认请求头是 `X-Access-Token`
- 页面访问控制依赖 `isLoggedIn`
- 401 仍走旧 `/oauth/token` refresh 逻辑

当前主要代码落点：

- 统一请求头：`libs/shared/redux/services/src/shared-prepare-headers.ts`
- 旧 refresh：`libs/shared/redux/services/src/shared-base-query-with-re-auth.ts`
- 零散 `X-Access-Token` 使用点：
  - `libs/modules/cart/services/src/lib/cart.helper.ts`
  - `libs/shared/redux/services/src/search.api.ts`
  - `libs/shared/utils/src/lib/fetch.actions.ts`
  - `libs/modules/tracking/domain/src/api/facebook.api.ts`
  - `libs/modules/tracking/domain/src/api/pinterest.api.ts`

结论：`X-Access-Token` 替换不是单点修改，需要处理统一入口和零散落点。

---

## 3. 方案一：仅 CA 市场接入

### 定义

- 仅 CA 使用 UMS 登录
- 仅 CA 市场 POS 请求改为带 `Authorization`
- 仅 CA 停止依赖 `X-Access-Token`
- 其他市场保持旧登录和旧请求头

### 可行性

结论：**可行，且更稳妥**

原因：

- POS 本身是多市场部署，可按 `NEXT_PUBLIC_COUNTRY` 分流
- 代码里已有 `accessInCA` 等市场开关能力
- 请求头主入口较集中，适合先做 CA 条件分支
- 当前业务目标也只覆盖 CA

### 风险

1. 双轨并存，复杂度上升

   - CA 用 UMS + Authorization
   - 其他市场用旧登录 + `X-Access-Token`

2. shared 层会出现市场分支

   - 例如 `shared-prepare-headers.ts`
   - 以及 refresh / auth 相关共享逻辑

3. 可能存在漏改

   - 某些零散 helper 仍继续发送 `X-Access-Token`
   - 造成 CA 市场认证行为不一致

4. 测试矩阵增加
   - 需要同时验证 CA 新链路和其他市场旧链路

### 收益

- 风险可控
- 回滚简单
- 联调范围小
- 可以先验证 CA 后端对 `Authorization` 的支持

---

## 4. 方案二：全市场直接替换

### 定义

- 所有 POS 市场统一切 UMS 登录
- 所有 POS 市场统一使用 `Authorization`
- 全面移除 `X-Access-Token` 作为主认证头

### 可行性

结论：**技术上可行，但短期风险高**

原因：

- 主请求入口较集中，长期看可以统一
- 但当前登录链路、callback、retailId 初始化仍在收敛
- 旧 refresh token 机制尚未完全替换
- 各市场后端对 `Authorization` 的支持尚未全部确认

### 风险

1. 影响范围大

   - 所有 POS 市场登录、请求、回归都会受影响

2. 旧 refresh 与新 UMS 体系冲突

   - Bearer token 已切换
   - 但 401 后仍可能进入旧 `/oauth/token` refresh 逻辑

3. 多市场后端兼容性风险

   - 需要一次性确认所有市场都支持 `Authorization`

4. 隐藏落点更难一次收敛

   - 零散 `X-Access-Token` 使用点更容易遗漏

5. 回滚成本高
   - 出问题会影响所有市场

### 收益

- 认证架构更统一
- 长期维护成本更低
- 后续不需要继续维护市场分支

---

## 5. 两种方案对比

| 维度       | 仅 CA 接入 | 全市场替换 |
| ---------- | ---------- | ---------- |
| 可行性     | 高         | 中         |
| 实施复杂度 | 中         | 高         |
| 影响范围   | 小         | 大         |
| 回滚成本   | 低         | 高         |
| 测试成本   | 中         | 高         |
| 短期风险   | 低到中     | 高         |
| 长期统一性 | 一般       | 高         |

---

## 6. 推荐方案

### 推荐：先做 CA-only

建议 rollout：

1. CA 先切 UMS 登录
2. CA 先切 `Authorization`
3. 保留 `X-Sales-ID`、`X-Retail-Store-ID` 等业务头
4. 跑通完整链路：
   - 登录
   - callback
   - 本地登录态同步
   - retailId 初始化
   - 业务接口鉴权
   - 登出
5. 稳定后再评估其他市场推广

---

## 7. 会议同步建议

会上建议重点同步以下结论：

### 对产品

- CA-only 更符合当前业务范围
- 能更快上线验证，不会一次性影响所有市场

### 对研发

- 认证头替换不是单点修改
- 至少会影响：
  - 登录入口
  - callback
  - 请求头注入
  - refresh
  - 零散 helper

### 对 QA

- CA-only 时测试范围更清晰
- 全市场替换需要完整多市场回归
