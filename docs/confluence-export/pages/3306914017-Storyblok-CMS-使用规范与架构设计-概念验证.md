---
confluence_id: "3306914017"
title: "Storyblok CMS 使用规范与架构设计 - 概念验证"
status: current
parent_id: "2583822375"
depth: 1
domain: cms
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3306914017
local_joyboy_doc: null
blog_post: null
---
# Storyblok CMS 使用规范与架构设计 - 概念验证

## 核心架构原则

### 内容分层架构

1. - **内容源数据层** vs **页面组件展示层**

- 明确分离数据源与展示组件
- 提高内容可重用性与系统可维护性
```
graph TD
    CMS[Storyblok CMS] --> ContentSource[内容源数据层]
    CMS --> ComponentLibrary[页面组件展示层]
    
    ContentSource --> ProductData[产品数据]
    ContentSource --> CategoryData[分类数据]
    
    ComponentLibrary --> Atoms[原子组件]
    ComponentLibrary --> Molecules[分子组件]
    ComponentLibrary --> Drafts[开发草稿]
    
    Atoms --> ButtonAtom[按钮组件]
    Atoms --> TypographyAtom[文字组件]
    Atoms --> ImageAtom[图片组件]
    
    Molecules --> HeaderMolecule[页头组件]
    Molecules --> USPMolecule[USP组件]
    
    Drafts --> NewUSPDraft[USP新变体草稿]
```

## 具体实现方案

### 1. 内容源数据层设计规范

内容源数据应采用 Storyblok 内置字段类型，并按市场（国家/地区）进行组织:

```
graph TD
    Content[ContentHub] --> SourceData[SourceData]
    SourceData --> Markets["Markets"]
    Markets --> SG["Singapore (sg)"]
    Markets --> MY["Malaysia (my)"]
    Markets --> Other["其他市场..."]
    
    SG --> SGProducts["ProductCatalog"]
    SGProducts --> SGSPU001["ProductID: GSPU001"]
    SGProducts --> SGSPU002["ProductID: GSPU002"]
    
    SGSPU001 --> Name["productName (文本字段)"]
    SGSPU001 --> Desc["productDescription (富文本)"]
    SGSPU001 --> Specs["productSpecifications (表格)"]
    SGSPU001 --> USPs["USPs (嵌套块)"]
    
    USPs --> USP1["usp-1 (文本字段)"]
    USPs --> USP2["usp-2 (文本字段)"]
    USPs --> USP3["..."]
```

内容源数据目录结构规范:

```
ContentHub
├── SourceData
│   ├── Markets
│   │   ├── sg
│   │   │   ├── ProductCatalog
│   │   │   │   ├── GSPU001
│   │   │   │   │   ├── productName: "产品名称" (文本字段)
│   │   │   │   │   ├── productDescription: "产品描述" (富文本字段)
│   │   │   │   │   ├── productSpecifications: (表格字段)
│   │   │   │   │   └── USPs: (嵌套块) 
│   │   │   │   │       ├── usp-1: "特性亮点1" (文本字段)
│   │   │   │   │       ├── usp-2: "特性亮点2" (文本字段)
│   │   │   │   │       └── ...
│   │   │   │   └── ...
│   │   │   ├── CategoryTree
│   │   │   └── ...
│   │   ├── my
│   │   │   ├── ProductCatalog
│   │   │   └── ...
│   │   └── ...
│   └── ...
```

**内置 field 使用原则:**

- 文本内容: Text field, Textarea, Richtext
- 结构化数据: Table field
- 媒体资源: Asset (图片、视频)
- 关联数据: References to other content entries
### 2. 页面组件开发工作流

**组件开发标准流程:**



```
sequenceDiagram
    participant PM as 产品负责人
    participant Designer as 设计师
    participant Dev as 前端开发者
    participant Editor as 内容构建师
    
    PM->>Designer: 提出组件需求与用例
    Designer->>PM: 提供设计规范与交互原型
    PM->>PM: 在Draft目录创建组件草稿
    PM->>Dev: 请求技术评审
    Dev->>PM: 提供实现建议与优化方案
    PM->>PM: 根据反馈调整组件结构
    Dev->>Dev: 确认并实现组件逻辑
    Dev->>PM: 迁移至正式组件库并发布
    PM->>Editor: 对齐使用方式,组件发布上线
    Editor->>Editor: 使用组件用于内容创建
```

> Data Bucket 研发确定

工作流程标准化步骤:

1. - **需求收集与规范:**

- 产品团队提出详细需求说明文档(PRD)
- 设计团队提供标准设计规范与交互原型
2. - **组件草稿阶段:**

- 在 `ComponentLibrary/Drafts/{componentName}-{variant}` 创建
- 遵循命名规范: 小驼峰命名法，功能-变体形式
- 必须包含组件说明文档(README)定义用途与配置项
3. - **技术评审阶段:**

- 开发团队进行代码可行性与性能评估
- 提出具体技术实现方案与优化建议
- 确认与现有组件库的兼容性
4. - **开发实现阶段:**

- 根据评审反馈优化组件结构
- 进行组件单元测试与渲染性能测试
- 完成组件文档与使用示例
5. - **发布集成阶段:**

- 从 Drafts 迁移至 `ComponentLibrary/Molecules` 或适当目录
- 更新组件索引与版本记录
- 向内容团队提供使用培训与最佳实践
### 3. 组件库分层架构

所有页面组件采用原子设计模式(Atomic Design)构建:

```
graph TD
    ComponentLibrary[ComponentLibrary] --> Atoms[Atoms]
    ComponentLibrary --> Molecules[Molecules] 
    ComponentLibrary --> Organisms[Organisms]
    ComponentLibrary --> Templates[Templates]
    ComponentLibrary --> Drafts[Drafts]
    
    Atoms --> ButtonAtom[buttonComponent]
    Atoms --> LinkAtom[linkComponent]
    Atoms --> TypographyAtom[typographyComponent]
    Atoms --> ImageAtom[imageComponent]
    Atoms --> VideoAtom[videoComponent]
    Atoms --> IconAtom[iconComponent]
    Atoms --> SpacerAtom[spacerComponent]
    Atoms --> DividerAtom[dividerComponent]
    
    Molecules --> HeaderMolecule[headerComponent]
    Molecules --> FooterMolecule[footerComponent]
    Molecules --> NavigationMolecule[navigationComponent]
    Molecules --> CardMolecule[cardComponent]
    Molecules --> SellingPointMolecules[uspComponents]
    
    SellingPointMolecules --> VariantA[usp-iconHorizontal]
    SellingPointMolecules --> VariantB[usp-card]
    
    Organisms --> ProductDetailOrganism[productDetailSection]
    Organisms --> HeroOrganism[heroSection]
    
    Templates --> ProductTemplate[productTemplate]
    Templates --> CategoryTemplate[categoryTemplate]
    
    Drafts --> VariantC[usp-carousel]
```

组件库目录结构规范:

```
ComponentLibrary
├── Atoms
│   ├── buttonComponent
│   ├── linkComponent
│   ├── typographyComponent
│   ├── imageComponent
│   ├── videoComponent
│   ├── iconComponent
│   ├── spacerComponent
│   ├── dividerComponent
│   └── ...
├── Molecules
│   ├── headerComponent
│   ├── footerComponent
│   ├── navigationComponent
│   ├── cardComponent
│   ├── uspComponents
│   │   ├── usp-iconHorizontal
│   │   ├── usp-card
│   │   └── ...
│   └── ...
├── Organisms
│   ├── productDetailSection
│   ├── heroSection
│   └── ...
├── Templates
│   ├── productTemplate
│   ├── categoryTemplate
│   └── ...
└── Drafts
    ├── usp-carousel
    └── ...
```

### 4. 产品卖点(SellingPoints)实现规范

产品卖点数据与展示组件严格分离:

```
graph LR
    DataSource[数据源层] --> PresentationLayer[展示层]
    
    subgraph "ContentHub/SourceData/Markets/sg/ProductCatalog/[GSPU-ID]"
        SPData[产品卖点数据]
    end
    
    subgraph "ComponentLibrary/Molecules/uspComponents"
        VariantA[usp-iconHorizontal]
        VariantB[usp-card]
        VariantC[usp-carousel]
    end
    
    SPData --> VariantA
    SPData --> VariantB
    SPData --> VariantC
    
    SPData --> |结构化数据| JSONStructure[卖点数据结构]
    
    VariantA --> |横向图标布局| LayoutA[布局效果A]
    VariantB --> |卡片式布局| LayoutB[布局效果B]
    VariantC --> |轮播式布局| LayoutC[布局效果C]
```



**数据源层 (ContentHub/SourceData/Markets/sg/ProductCatalog/[GSPU-ID]):**

```
{
  "USPs": [
    {
      "title": "Room for Everyone",
      "description": "Introverts love the cosy chaise for curling up with a book. Extroverts love the party-friendly seating with space for face-to-face catch-ups and side-by-side snuggling with kids.",
      "image": "<https://res.cloudinary.com/castlery/image/upload/v1741679728/marketing/US/AB%20Test/USP%20assets/Owen%20chaise%20sectional%20sofa/PLA_Web_Owen_Big_USP_RoomforEveryone.png>"
    },
    {
      "title": "Room for Everyone",
      "description": "Introverts love the cosy chaise for curling up with a book. Extroverts love the party-friendly seating with space for face-to-face catch-ups and side-by-side snuggling with kids.",
      "image": "<https://res.cloudinary.com/castlery/image/upload/v1741679728/marketing/US/AB%20Test/USP%20assets/Owen%20chaise%20sectional%20sofa/PLA_Web_Owen_Big_USP_RoomforEveryone.png>"
    },
    
  ]
}
```

**展示组件层 (ComponentLibrary/Molecules/uspComponents):**

```
ComponentLibrary
├── Molecules
│   ├── uspComponents
│   │   ├── usp-iconHorizontal (横向图标布局)
│   │   ├── usp-card (卡片式布局)
│   │   └── usp-carousel (轮播式布局)
```

## 组件开发标准流程

```
sequenceDiagram
    participant PM as 产品负责人
    participant Designer as 设计师
    participant Editor as 内容构建师
    participant Dev as 前端开发者
    
    PM->>Designer: 提出新组件需求与业务场景
    Designer->>Editor: 提供设计规范与交互原型
    Editor->>Editor: 在Drafts目录创建组件草稿
    Editor->>Dev: 请求技术评审与实现建议
    Dev->>Editor: 提供技术优化方案
    Editor->>Editor: 根据反馈调整组件配置
    Dev->>Dev: 确认并实现组件功能
    Dev->>Editor: 迁移至正式组件库并发布
    Editor->>PM: 新组件可用于页面构建
```

案例实战流程:

1. - **需求定义:**

- 产品负责人: "我们需要一个新的产品卖点展示组件，支持水平轮播功能以适应移动端展示"
- 定义明确的业务目标与用户场景
2. - **草稿创建:**

- 在 `ComponentLibrary/Drafts/usp-carousel` 创建组件草稿
- 基于原子组件组合: typographyComponent + imageComponent + containerComponent
- 添加组件README文档说明用途与配置项
3. - **技术评审:**

- 开发团队评估技术可行性与性能影响
- 提供优化建议: "建议使用carouselBase组件代替自定义滚动逻辑，以确保性能与兼容性"
- 确认与现有组件的交互关系
4. - **优化调整:**

- 根据反馈调整组件结构与配置项
- 增加响应式布局支持与A11Y可访问性特性
- 完善组件文档与使用示例
5. - **正式发布:**

- 从Drafts迁移至 `ComponentLibrary/Molecules/uspComponents/usp-carousel`
- 更新组件索引与版本记录
- 向内容团队提供使用培训与示例
## 架构优势与实施效益

1. - **内容重用最大化:**

- 通过严格分离数据源与展示组件，同一产品数据可通过多种组件形式展示
- 支持跨页面、跨渠道的内容复用，提高内容投资回报率
2. - **系统可维护性提升:**

- 组件变更不影响底层数据，降低系统耦合度
- 采用标准化的组件命名与目录结构，降低学习与维护成本
- 清晰的版本控制与变更管理机制
3. - **开发与运营效率:**

- 标准化的组件开发流程减少沟通成本
- 原子设计模式加速组件复用与迭代
- 明确的角色职责划分，优化协作流程
4. - **用户体验一致性:**

- 基于标准原子组件构建，确保全站UI/UX一致性
- 数据与展示分离支持A/B测试与个性化体验
- 市场级内容管理支持本地化与区域化策略
5. - **系统可扩展性:**

- 松耦合架构便于功能扩展与技术升级
- 标准化接口简化第三方系统集成
- 模块化设计支持大规模内容运营
## Storyblok 与 Storybook 集成工作流

### 1. 工作流概述

前端通过 Storybook 对业务组件进行展示、测试和文档化。为实现 Storyblok CMS 与 Storybook 的无缝集成，我们建立了一套完整的工作流程：

```
graph TD
    A[Storyblok CMS] --> B[Schema 配置]
    B --> C[组件设计]
    C --> D1[基础组件映射]
    C --> D2[业务组件定义]
    D1 --> E1[Fortress 组件]
    D2 --> E2[Schema TS 类型生成]
    E2 --> F[业务组件开发]
    F --> G[Storybook-Host 展示]
    E1 --> G
    G --> H[组件文档与测试]

    subgraph "Storyblok CMS"
    A
    B
    C
    D1
    D2
    end

    subgraph "前端开发"
    E1
    E2
    F
    end

    subgraph "组件展示与测试"
    G
    H
    end
```

### 1.2 集成工具链

#### 1.2.1 @castlery/storyblok-to-storybook 工具

我们开发了 `@castlery/storyblok-to-storybook` 工具，用于自动从 Storyblok 配置生成 Storybook 的 args/argTypes：

- **功能**：通过右键点击 stories 文件，自动生成将 Storyblok 中对应业务组件的配置数据转换为 Storybook 展示所需的 args 配置文件
- **使用场景**：快速生成业务组件测试数据，减少手动编写 mock 数据的工作量
- **集成方式**：作为 IDE 插件集成到开发环境中
#### 1.2.2 @castlery/addon-nest-controls 插件

为解决 Storybook 控制面板无法支持深层嵌套对象的限制，开发 `storybook-addon-nest-controls` 插件：

- **功能**：提供友好的界面，支持深层嵌套对象的可视化编辑和预览
- **使用场景**：适用于结构复杂的组件配置数据调整和测试
- **优势**：让产品、设计等非开发人员也能在 Storybook 中便捷地调整组件配置
- **集成方式**：Storybook 项目中引入
### 1.3 集成工作流详解

#### 1.3.1 基础组件与业务组件映射

1. - **基础组件映射**

- 在 Storyblok CMS 中创建与 Fortress 基础组件 1:1 对应的原子组件
- 这些组件在 Storyblok 中充当"构建块"，供 PM 使用
2. - **业务组件配置**

- PM 使用原子组件通过拖拽方式构建业务组件
- 在 Storyblok 上完成业务组件配置，生成标准化的 Schema 数据
#### 1.3.2 类型生成与组件开发

1. - **Schema 类型生成**

- 自动从 Storyblok 生成 TypeScript 类型定义
- 前端组件开发基于类型约束进行实现
- 对于复杂业务场景，可创建 Storyblok Data Bucket 存储更细致的配置数据
2. - **业务组件开发**

- 基于生成的 Schema 类型进行组件开发
- 使用 TypeScript 确保组件实现与 Schema 定义保持一致
- 完成后在 storybook-host 项目中进行展示和测试
#### 1.3.3 展示与协作

1. - **Storybook 展示**

- 使用 `@castlery/storyblok-to-storybook` 工具自动生成 Storybook args/argsType 参数
- 通过 `storybook-addon-nest-controls` 插件提供深层对象的编辑能力
- fortress storybook 在 storybook-host 项目通过 Storybook Composition 功能整合展示
2. - **跨团队协作**

- PM、UI、QA 等可在 Storybook 页面上获得类似 Storyblok 的配置体验
- 支持非开发人员快速调整组件配置，进行视觉验证
- 形成从设计、配置、开发到展示的完整闭环
### 1.4 工作流优势

1. - **开发效率提升**

- 配置一次，自动生成类型约束和测试数据
- 减少手动编写 mock 数据的工作量
- 更快地进行组件验证和测试
2. - **跨角色协作增强**

- 产品、设计和开发使用统一的组件语言
- 非开发人员可通过 UI 直观地调整组件配置
- 减少沟通成本，提高协作效率
3. - **质量保障**

- 类型安全确保前端实现符合预期配置
- 组件标准化提高代码质量和可维护性
- 通过可视化测试提前发现问题
4. - **文档即代码**

- Storybook 同时作为开发工具和组件文档
- 组件使用示例自动生成并保持更新
- 降低学习成本，加速新成员融入
## 实施路线与里程碑

1. - **第一阶段: 架构设计与规范制定** (1-2周)

- 完成内容模型设计与组件库架构
- 制定命名规范与目录结构标准
- 建立组件开发与审核流程
2. - **第二阶段: 核心组件开发** (2-4周)

- 构建原子组件库(Atoms)
- 开发基础分子组件(Molecules)
- 建立组件文档与使用示例
3. - **第三阶段: 内容迁移与优化** (3-6周)

- 按新架构重构现有内容
- 数据源与展示组件分离迁移
- 按市场(国家/地区)重组内容结构
4. - **第四阶段: 培训与全面推广** (1-2周)

- 内容团队培训与最佳实践分享
- 开发团队技术交接与规范落地
- 建立长期维护与治理机制