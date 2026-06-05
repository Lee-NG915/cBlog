# 本地开发性能优化方案

## 目标

这份方案聚焦两个问题：

- 本地启动慢
- 热更新 / HMR 慢

当前阶段只给方案，不修改代码。

## 范围

主要针对以下链路：

- `pnpm web:us`
- `pnpm web:sg`
- `pnpm pos:us`
- `pnpm pos:sg`

重点分析对象：

- Nx monorepo 开发链路
- Next.js 14 App Router 开发模式
- monorepo 内部路径别名与 barrel export
- 本地开发期额外插件、日志、类型生成、源码映射

## 当前项目的主要特征

从当前仓库配置看，这个项目本地开发慢，属于几个因素叠加：

### 1. Web / POS 都走 `@nx/next:server` + Next dev

参考：

- [`apps/web/project.json`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/web/project.json)
- [`apps/pos/project.json`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/pos/project.json)

这意味着：

- 启动时要拉起 Nx + Next 开发链路
- monorepo 路径解析和模块图会很大
- 变更传播范围受 import 图影响明显

### 2. 路径别名大量直接指向 `src/index.ts`

参考：

- [`tsconfig.base.json`](/Users/abbywang/Documents/castlery_projects/joyboy/tsconfig.base.json)

当前仓库里存在大量：

```json
"@castlery/modules-xxx-services": ["libs/modules/xxx/services/src/index.ts"]
```

这类结构在大型 monorepo 下的典型问题是：

- `index.ts` 成为大范围依赖入口
- 某个库内部改动可能触发更大范围模块失效
- HMR 容易退化成更重的重新编译

### 3. 存在大量 barrel export

仓库里至少有 64 个 `src/index.ts` 入口。  
其中一些 index 文件导出面非常宽，例如：

- [`libs/shared/components/src/index.ts`](/Users/abbywang/Documents/castlery_projects/joyboy/libs/shared/components/src/index.ts)
- [`libs/modules/product/services/src/index.ts`](/Users/abbywang/Documents/castlery_projects/joyboy/libs/modules/product/services/src/index.ts)

这类 barrel export 在构建产物里未必总是致命，但在开发期会放大两件事：

- 模块图规模
- 变更失效范围

对热更新尤其不友好。

### 4. 开发环境启用了额外 webpack 插件

参考：

- [`apps/web/next.config.js`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/web/next.config.js)
- [`apps/pos/next.config.js`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/pos/next.config.js)

当前开发模式下启用了：

- `codeInspectorPlugin`

这类插件在开发体验上有价值，但会增加：

- 编译耗时
- 文件变更后的处理链路
- 客户端重编译负担

### 5. Web / POS 都开启了 fetch 全量日志

参考：

- [`apps/web/next.config.js`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/web/next.config.js)
- [`apps/pos/next.config.js`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/pos/next.config.js)

当前配置包含：

```js
logging: {
  fetches: {
    fullUrl: true,
  },
}
```

这不会单独造成灾难级卡顿，但在请求很多、开发日志很多的页面中，会放大终端 I/O 和调试噪音。

### 6. Web 开启了较多开发期额外能力

参考：

- [`apps/web/next.config.js`](/Users/abbywang/Documents/castlery_projects/joyboy/apps/web/next.config.js)

当前可见的额外特性包括：

- `experimental.typedRoutes = true`
- `experimental.instrumentationHook = true`
- 很长的 `optimizePackageImports` 列表
- 开发期 client 侧 `codeInspectorPlugin`

这些配置不一定都应该关闭，但它们会让 dev 链路更重。

### 7. monorepo 依赖图天然较大

当前工作区包含大量 `libs/modules/*`、`libs/shared/*`、`packages/*`。  
对于 Next dev server 来说，问题不只是“文件多”，而是：

- import graph 广
- 共享入口多
- 变更影响范围难以局部化

## 根因模型

把这次问题拆开看，主要是三层：

### A. 启动慢

来源通常是：

- Nx 启动 + 项目图计算
- Next dev 编译入口多
- 开发期插件初始化
- App Router 首次路由树构建

### B. 单次编译慢

来源通常是：

- import 图太大
- barrel export 太广
- 页面引用过重的 client component
- 编译时需要额外处理大量包和别名

### C. 热更新慢

来源通常是：

- 变更失效范围过大
- 修改一个共享入口引发大面积重编译
- 某些改动无法局部 HMR，只能触发整页甚至整段路由刷新

## 优化原则

这次方案遵循几个原则：

1. 先优化开发链路上的“系统性拖慢项”，再谈组件微优化
2. 先缩小失效范围，再追求单次编译极限
3. 优先做“开发期限定”的开关，不影响生产行为
4. 优先减少大范围 barrel 依赖，再考虑更激进的构建方案

## 优化方案

下面按优先级分阶段给出。

## Phase 1：低风险快速收益

这阶段目标是：

- 不改业务逻辑
- 尽快降低 dev server 负担
- 先拿到可感知收益

### 1. 为开发环境增加“轻量模式”

建议新增一组 fast dev 开关，仅在本地开发启用，例如：

- 关闭 `codeInspectorPlugin`
- 降低 fetch logging
- 关闭非必要 instrumentation
- 为 web / pos 增加 `FAST_DEV=true` 模式

适合做成：

- `pnpm web:us:fast`
- `pnpm pos:us:fast`

建议控制项：

- `ENABLE_CODE_INSPECTOR=false`
- `NEXT_DISABLE_FETCH_LOGGING=true`
- `FAST_DEV=true`

原因：

- 当前最容易拿到收益的是减少 dev-only 插件和日志
- 这类改动风险最低

### 2. 关闭或降级开发期 fetch 全量日志

当前 `fullUrl: true` 会放大日志量。  
建议：

- 默认开发不打印全部 fetch
- 需要排查时再显式打开

收益：

- 终端输出更轻
- 高频请求页面的开发噪音下降

### 3. 将 `codeInspectorPlugin` 改为显式开关

当前 web 和 pos 开发模式都会启用。  
建议改为：

- 默认关闭
- 只有需要定位代码时手动打开

原因：

- 这类开发辅助插件不是核心链路
- 对所有开发者默认开启性价比不高

### 4. 清理本地开发常驻重负担设置

建议检查并统一本地运行说明：

- Node 版本固定为 `.nvmrc`
- 推荐 `NODE_OPTIONS=--max-old-space-size=8192`
- 推荐定期执行 `nx reset`

说明：

- 这不是根治，但能减少因为缓存异常导致的“假性慢”

## Phase 2：缩小 HMR 失效范围

这阶段是最关键的，因为它直接决定“改一行为什么会重编很多东西”。

### 1. 限制广域 barrel export 的使用

这是本项目最值得优先处理的结构性问题之一。

当前模式：

- 业务代码大量通过 `@castlery/xxx` 指向 `src/index.ts`
- `src/index.ts` 再 `export *` 很多模块

后果：

- 修改某个被广泛 re-export 的文件，可能触发大面积模块失效
- HMR 更容易退化成整页或整段重编译

建议策略：

- 高频开发路径优先改成“直连导入”
- 优先从 `shared-components`、`shared-services`、`modules-*-services` 开始

优先处理对象：

- [`libs/shared/components/src/index.ts`](/Users/abbywang/Documents/castlery_projects/joyboy/libs/shared/components/src/index.ts)
- `shared` 层公共 hooks / UI 入口
- 被首页、PDP、checkout 共同依赖的入口

建议做法：

- 对高频使用、导出面巨大的 `index.ts` 建立替代直连路径
- 不是全仓库一次性禁止 barrel，而是先缩小最热路径

### 2. 区分“稳定公共入口”和“开发高频入口”

不是所有 `index.ts` 都必须去掉。

建议拆成两类：

- 对外稳定 API 入口：可以保留
- 内部高频开发路径：尽量减少再经由大 barrel 转发

判断标准：

- 如果一个入口被大量页面/布局/shared provider 依赖，同时导出很多内容，它就不适合作为开发期高频入口

### 3. 控制顶层 provider / layout 的依赖膨胀

Next App Router 下，layout 和 provider 一旦依赖很重，改动传播会更明显。

建议检查：

- 根 layout 是否引入了过多 shared UI / tracking / modal / store 逻辑
- 是否有只在个别页面需要的 client 逻辑，被提升到了全局 layout

优化方向：

- 能局部化的 provider 不要放根布局
- 能延迟加载的 client-only 模块不要挂在全局层

这符合 Vercel 的几个高优先规则：

- `bundle-dynamic-imports`
- `server-serialization`
- `bundle-defer-third-party`

## Phase 3：降低 Next dev 编译负担

### 1. 评估并引入更严格的按需导入策略

虽然 web 已配置 `optimizePackageImports`，但当前列表很长，而且包含大量 monorepo 内部包。

这需要注意两点：

- 它不一定能替代“减少 barrel export”
- 配置很长本身说明包边界可能还不够清晰

建议：

- 保留真正有价值的第三方包按需导入优化
- 对内部 monorepo 包，优先靠导出边界治理，而不是无限扩充 `optimizePackageImports`

### 2. 评估 Turbopack 可行性，但不要作为第一优先级

当前仓库走 Nx + Next + 自定义 webpack 配置。  
有以下现实约束：

- `codeInspectorPlugin`
- 自定义 webpack fallback
- Sentry / bundle analyzer / 其它 webpack 相关能力

因此不建议第一步就切 Turbopack。  
建议顺序是：

1. 先降低 import graph 和 dev 插件负担
2. 再做 Turbopack 兼容性试验

如果前面的结构问题不处理，切 Turbopack 也未必解决所有热更新慢的问题。

### 3. 区分“开发配置”和“生产配置”

当前一些配置更像生产优先，但也会影响开发维护成本。  
建议明确把 `next.config.js` 分为两套决策：

- 开发期：
  - 尽量少插件
  - 尽量少日志
  - 尽量少非必要 experimental
- 生产期：
  - 保留 observability、分析、source maps、instrumentation

关键思想：

- 开发目标是短反馈回路
- 生产目标是稳定、可观测、可发布

这两者不应该完全复用一套重量级配置

## Phase 4：按页面和模块治理重量级客户端代码

这阶段不是先看 bundle 体积，而是看“谁拖慢开发重新编译”。

### 1. 标出高频开发路径的重模块

优先关注：

- checkout
- cart
- PDP
- layout / provider
- recommendation / tracking / payment

建议检查项：

- 是否在 client component 中导入了大而全的 shared 入口
- 是否把仅交互时需要的组件静态导入到了首屏
- 是否把第三方 SDK 提前注入到所有页面

### 2. 对重交互模块使用更明确的延迟加载

符合 Vercel 的建议：

- `bundle-dynamic-imports`
- `bundle-conditional`
- `bundle-defer-third-party`

适合优先处理的模块类型：

- 支付 SDK
- recommendation carousel
- video / player
- 较重的 modal 体系
- 只在用户交互后出现的组件

### 3. 降低全局 client component 的比例

App Router 下，如果 server / client 边界不够克制，会直接拉高 dev 编译和 hydration 成本。

建议原则：

- 默认 server component
- 只把真正需要 state / effect / browser API 的叶子节点标为 client

这不仅有利于线上性能，也有利于本地开发编译速度。

## Phase 5：建立可量化的性能基线

如果不量化，优化很容易变成“感觉快了一点”。

建议建立以下本地指标：

### 启动指标

- `pnpm web:us` 到首个路由可访问的时间
- `pnpm pos:us` 到首个路由可访问的时间

### HMR 指标

选择 3 类文件做对比：

1. 页面叶子组件
2. 高频 shared component
3. 大 barrel 导出下游模块

记录修改后到页面更新完成的时间。

### 编译指标

- 首次编译耗时
- 改单个叶子组件的增量编译耗时
- 改 `shared-components` 导出模块的增量编译耗时

### 建议观察工具

- Next dev terminal 输出
- 浏览器 DevTools Performance
- `nx graph`
- `pnpm web:analyze` 用于辅助识别重包，不作为 HMR 唯一依据

## 建议执行顺序

如果只能按最小成本推进，建议顺序如下：

1. 给 dev 增加轻量模式
2. 关闭默认 `codeInspectorPlugin`
3. 降低 fetch logging
4. 先治理 `shared-components` 等超大 barrel 入口
5. 再治理 layout / provider 级别的高扇出依赖
6. 最后再评估 Turbopack

这个顺序的原因是：

- 先拿低风险收益
- 再处理真正影响 HMR 的结构性问题
- 最后再看底层构建器替换是否值得

## 不建议的做法

### 1. 不建议一开始就全仓库去 barrel

原因：

- 改动面太大
- review 成本高
- 风险不好控

更合理的是：

- 只优先治理高扇出、高频修改、高频页面依赖的入口

### 2. 不建议先花大量时间做 bundle 分析

本地热更新慢不完全等于线上 bundle 大。  
bundle 分析有帮助，但不能代替开发期失效范围治理。

### 3. 不建议默认把所有开发插件都保留

开发插件的原则应是：

- 有明确收益才默认启用
- 否则应显式开关

## 可执行清单

### 第一批

- 为 web / pos 增加 fast dev 模式
- 将 `codeInspectorPlugin` 改为环境变量控制
- 将 fetch logging 改为环境变量控制
- 记录 web / pos 的启动基线与 HMR 基线

### 第二批

- 排查 `shared-components`、`shared-services`、`modules-*-services` 的高扇出 barrel
- 对高频开发路径改为直连导入
- 缩小顶层 layout / provider 的依赖面

### 第三批

- 对重 client 模块做 dynamic import / conditional load
- 评估 Turbopack 兼容性
- 根据测量结果继续缩减最热路径依赖图

## 建议产出

建议后续把优化工作拆成 3 类任务：

1. `dev infra`

   - 轻量模式
   - 日志与插件开关
   - 启动链路优化

2. `module boundary`

   - barrel 治理
   - 高频路径直连导入
   - provider / layout 降扇出

3. `runtime weight`
   - 动态导入
   - client/server 边界收缩
   - 第三方 SDK 延迟加载

## 总结

这个项目本地运行慢，核心不是某一个配置写错了，而是：

- monorepo 规模大
- 共享入口过宽
- dev-only 插件与日志偏多
- 顶层依赖图偏重

因此最有效的路线不是先做“零散小优化”，而是：

1. 先做开发期轻量化
2. 再治理 barrel 和高扇出依赖
3. 再压缩顶层 client 依赖
4. 最后再评估构建器层面的升级

如果后续要进入实施阶段，建议先从 `web` 开始，优先处理：

- `next.config.js` 的 dev-only 开关
- `shared-components` 的高扇出入口
- 根 layout / provider 的依赖收缩
