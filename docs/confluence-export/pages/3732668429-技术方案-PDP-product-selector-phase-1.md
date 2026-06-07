---
confluence_id: "3732668429"
title: "技术方案 - PDP product selector phase 1"
status: current
parent_id: "2583822375"
depth: 1
domain: product
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3732668429
local_joyboy_doc: null
blog_post: null
---
| 文档版本 | V1.0 |
| **技术栈** | Next.js 14 App Router, Storyblok CMS |
| **核心机制** | 服务端预计算索引 (Server-Side Pre-computed Indexing) |
| **算法复杂度** | slug 查找 O(1) |


---

## 1. 系统概述 (System Overview)

本方案旨在构建一套通用的、高性能的商品详情页 (PDP) selector 系统。针对具有复杂变体结构的产品，系统提供**布局形态 (Layout)**、**具体配置 (Configuration)** 及 **材质属性 (Attribute)** 的三级联动筛选能力。

方案摒弃了传统的实时查询模式，采用 **“全局配置 + 倒排索引分布式缓存”** 方案，确保在海量 SKU 场景下依然保持较短的页面响应速度，同时支持 SEO 全链路抓取。

---

## 2. CMS 数据建模 (Data Modeling)

数据模型遵循严格的层级嵌套约束，确保数据结构的标准化与可维护性。模型包含四个核心实体。

### 2.1 实体关系图 (ER Diagram)

下图展示了从“产品系列”到“具体单品”的包含关系与基数约束：

```
classDiagram
    direction TB
    
    %% 定义类结构
    class ProductSpuGroup {
        +String title
        +List~ProductLayout~ product_layouts
    }

    class ProductLayout {
        +String title
        +List~ProductCategoryGroup~ categories
    }

    class ProductCategoryGroup {
        +String title
        +List~ProductSpu~ products
    }

    class ProductSpu {
        +String name
        +String slug
        +String attribute_tag
        +Asset image
    }

    %% 定义关系
    ProductSpuGroup "1" *-- "N" ProductLayout : 包含 (Contains)
    ProductLayout "1" *-- "N" ProductCategoryGroup : 包含 (Contains)
    ProductCategoryGroup "1" *-- "N" ProductSpu : 包含 (Contains)

    %% 添加注释说明
    note for ProductSpuGroup "Root Node / Organism\n产品系列总集\n(e.g., Dawson Sofa)"
    note for ProductLayout "Level 1 / Organism\n布局形态\n(e.g., L-Shape)"
    note for ProductCategoryGroup "Level 2 / Organism\n具体配置\n(e.g., Sofa with Ottoman)"
    note for ProductSpu "Leaf Node / Molecule\n最小 SKU 单元\n(e.g., Grey Fabric Item)"
```

### 2.2 组件定义与规范

- **Root: Product SPU Group**

- **定义**: 产品系列的顶层容器。
- **职责**: 确立导航系统的上下文范围（Scope）。
- **Level 1: Product Layout**

- **定义**: 产品的空间布局分类。
- **职责**: 对应一级导航（Tabs），解决用户对形态的筛选需求。
- **Level 2: Product Category Group**

- **定义**: 在特定布局下的功能配置。
- **职责**: 对应二级导航（Pills），提供具体的规格选项。
- **Level 3: Attribute Logic (材质聚合)**

- **机制**: 系统不设立专门的“材质文件夹”。而是通过扫描最底层 SPU 的 `Attribute Tag` 字段（如 Fabric/Leather），在运行时动态聚合生成三级导航。
 

---

## 3. 系统架构设计 (System Architecture)

系统利用 Next.js 的 Data Cache 机制实现“读写分离”：CMS 负责数据录入，应用服务器负责索引构建与读取。

### 3.1 核心架构与数据流 (Architecture Diagram)

```
flowchart TD
    %% Actors
    User((End User))
    Editor((Content Editor))

    %% Storyblok System
    subgraph CMS_System [Storyblok CMS]
        ConfigPage[Global Config Page]
    end

    %% Next.js System
    subgraph NextJS [Next.js Server Layer]
        direction TB
        
        subgraph Logic [Execution Logic]
            Optimizer[Tree Optimizer]
            StateResolver[Context Resolver]
        end

        subgraph Storage [Data Cache]
            %% 修正点：使用双引号包裹含特殊字符和换行的文本
            CachedData["Cached Payload<br/>1. Slug Index (查找表)<br/>2. Normalized Tree (渲染树)"]
        end
    end

    %% Flows
    Editor -- 1. 配置并发布 --> ConfigPage
    ConfigPage -- 2. Webhook 触发失效 --> CachedData
    
    %% 缓存生成过程 (Miss)
    ConfigPage -- 3a. 获取原始数据 --> Optimizer
    Optimizer -- 3b. 清洗并生成 索引+树 --> CachedData
    
    %% 缓存读取过程 (Hit)
    User -- 4. 访问 URL --> StateResolver
    CachedData -- 5. 读取 索引+树 --> StateResolver
    
    %% 内部逻辑
    StateResolver -- 6a. 查索引 --> StateResolver
    StateResolver -- 6b. 取树结构 --> StateResolver
    
    StateResolver -- 7. 返回完整 UI 数据 --> User

    %% 样式定义
    classDef storage fill:#d4efdf,stroke:#27ae60,stroke-width:2px;
    classDef logic fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    class CachedData storage
    class Optimizer,StateResolver logic
```

### 3.2 关键技术策略

1. - **服务端内存索引 (In-Memory Indexing)**

- 系统将深层嵌套的树状结构扁平化为 `Slug -> ContextID` 的映射表。
- **优势**: 无论产品层级多深，查找当前商品归属的时间复杂度恒定为 **O(1)**。
2. - **持久化缓存 (Persistent Caching)**

- CMS 配置数据被缓存于服务器 Redis 中。
- **优势**: 消除运行时对 CMS API 的依赖，提升稳定性，降低延迟。
3. - **按需重验证 (On-Demand Revalidation)**

- 通过 Webhook 监听 CMS 发布事件，自动触发缓存刷新，保证数据实时一致性。
---

## 4. 数据处理逻辑 (Data Processing)

本部分描述原始 JSON 数据如何转化为 UI 可用的标准化数据结构。

### 4.1 算法流程 (Algorithm Flow)

```
flowchart LR
    subgraph Input [CMS Raw Data]
        RawTree[嵌套 JSON 树]
    end

    subgraph Processing [数据清洗核心]
        direction TB
        Traverse[递归遍历]
        IndexBuild[构建索引表]
        AttrAgg[材质属性聚合]
        DefaultSort[默认排序策略]
    end

    subgraph Output [UI Data Model]
        Index[倒排索引 Map]
        UITree[标准化导航树]
    end
    
    RawTree --> Traverse
    Traverse --> IndexBuild
    Traverse --> AttrAgg
    AttrAgg --> DefaultSort
    DefaultSort --> UITree
    IndexBuild --> Index

    style Index fill:#d4efdf,stroke:#27ae60
    style UITree fill:#f9e79f,stroke:#f1c40f
```

### 4.2 核心逻辑详述

1. - **索引构建**: 遍历过程中，记录每个 SKU 的完整路径信息（Series ID, Layout ID, Configuration ID）。
2. - **属性聚合**: 在 Configuration 层级，算法自动收集所有子产品的 `attribute_tag`，去重并分组。若某组下只有一个材质，自动标记为“无属性”，前端隐藏选择器。
3. - **默认值计算**: 为每个父级节点（Layout/Configuration）计算“默认跳转链接”，通常指向该节点下排序第一的子产品，确保导航链路连贯。
---

## 5. 交互设计与状态模型 (Interaction Design)

系统采用基于 URL 的路由模式，所有状态切换本质上是页面跳转，而非客户端状态变更。

### 5.1 状态流转图 (State Transition)

```
stateDiagram-v2
    [*] --> ServerRender : HTTP Request
    
    state ServerRender {
        Analyze : 解析 URL Slug
        Lookup : 匹配索引表
        Inject : 注入 Active 状态
    }

    ServerRender --> ClientView : HTML Response

    state ClientView {
        [*] --> Level1_Layout
        Level1_Layout --> Level2_Config
        Level2_Config --> Level3_Attribute
    }

    ClientView --> Navigate : 点击 "L-Shape" (Layout Tab)
    note right of Navigate
        跳转策略：
        目标 Layout -> 默认 Config -> 
        默认 Attribute -> 目标 SPU URL
    end note

    ClientView --> Navigate : 点击 "Sofa with Ottoman" (Config Pill)
    
    ClientView --> Navigate : 点击 "Leather" (Attribute Tag)
    
    Navigate --> ServerRender : Full Page Transition
```

### 5.2 交互规范

- **状态高亮**: 服务端根据当前 URL，自动标记对应的 Layout、Configuration 和 Attribute 按钮为激活态。
- **智能降噪**: 当 Configuration 下仅有一种材质时，Level 3 选择器自动隐藏。
- **深度链接**: 任何一种变体组合都拥有独立的 URL，支持直接访问和分享。
---

## 6. 系统容错与边界处理 (Resilience)

1. - **孤儿数据处理 (Orphan Handling)**

- 若当前访问的商品未在导航树中配置，系统将判定其为独立商品。
- **表现**: 正常展示商品详情，但渲染顶部 Product Selector 原 UI，不阻断用户浏览。
2. - **空节点过滤**

- 若某个 Layout 或 Configuration 下无有效商品，CMS 上会做保存强校验，而算法则会在预处理阶段做兜底二次剔除，避免前端渲染空选项。
3. - **异常回退**

- 若 CMS 数据结构异常（如缺少必要字段），清洗器将跳过错误节点，保证整体树结构的完整性。
---

## 7. 方案总结 (Conclusion)

本方案通过 **结构化的数据建模** 和 **高性能的服务端索引**，实现了复杂产品体系下的高效导航。

- **配置灵活性**: 支持任意层级的扩展与组合，材质分组全自动化。
- **极致性能**: O(1) 的查找效率确保了在高并发场景下的极速响应。
- **SEO 友好**: 扁平化的链接结构与全服务端渲染，最大化了搜索引擎的抓取效率。