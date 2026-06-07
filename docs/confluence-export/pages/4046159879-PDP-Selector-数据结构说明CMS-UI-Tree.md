---
confluence_id: "4046159879"
title: "PDP Selector 数据结构说明（CMS → UI Tree）"
status: current
parent_id: "3732668429"
depth: 2
domain: cms
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/4046159879
local_joyboy_doc: null
blog_post: null
---
## 文档信息

| 字段 | 内容 |
| 版本 | v1.9 |
| 创建日期 |  |
| 负责人 | Jasper Zhang |
| 用途 | 供后端同事设计 PDP Selector 自建平台 API schema 参考 |


## 1. 背景

PDP Selector 当前的配置数据存储在 Storyblok CMS，前端通过 `getPdpSelectorConfigServer()` 拉取并解析。后续计划将配置迁移至自建后端平台，前端改为调用内部 API。

本文档描述：

1. - 现有 CMS 返回的原始数据结构（JSON schema）
2. - 前端清洗后交给 UI 组件消费的 UI 交互树结构
供后端同事在设计 API Response Schema 时参考，确保迁移后前端可以无缝切换。

## 2. CMS 原始数据结构（Storyblok 侧）

Storyblok 返回的顶层类型为 `PdpSelectorConfigStoryblok`，内部是 **四层嵌套**：

```
graph TD
    ROOT["PdpSelectorConfigStoryblok\ncomponent: pdp_selector_config"]
    SPU["ProductSpuGroupStoryblok\n产品系列\ntitle · _uid"]
    LAYOUT["ProductLayoutGroupStoryblok\n结构形态\ntitle · _uid"]
    CAT["ProductCategoryGroupStoryblok\n产品类型\ntitle · icon · dimension · _uid"]
    PROD["ProductSpuStoryblok\n具体产品（叶子节点）\nname · slug · spu_code · attribute_tag"]

    ROOT -->|"spu_groups[ ]  1对N"| SPU
    SPU -->|"product_layouts[ ]  1对N"| LAYOUT
    LAYOUT -->|"product_categories[ ]  1对N"| CAT
    CAT -->|"products[ ]  1对N"| PROD

    style ROOT fill:#2C3E50,color:#fff
    style SPU fill:#2471A3,color:#fff
    style LAYOUT fill:#7D3C98,color:#fff
    style CAT fill:#117A65,color:#fff
    style PROD fill:#1E8449,color:#fff
```

### 2.1 JSON 示例（原始结构）

```
{
  "component": "pdp_selector_config",
  "_uid": "config-uid-001",
  "spu_groups": [
    {
      "component": "product_spu_group",
      "_uid": "group-uid-001",
      "title": "Adams Collection",
      "product_layouts": [
        {
          "component": "product_layout_group",
          "_uid": "layout-uid-001",
          "title": "L-Shape",
          "product_categories": [
            {
              "component": "product_category_group",
              "_uid": "cat-uid-001",
              "title": "Sofa",
              "icon": { "filename": "https://cdn.storyblok.com/icon-sofa.png" },
              "dimension": "W290 x D175 x H85 cm",
              "products": [
                {
                  "component": "product_spu",
                  "_uid": "spu-uid-001",
                  "name": "Adams L-Shape Sofa Fabric",
                  "slug": "adams-l-shape-sofa-fabric",
                  "spu_code": "ADS-L-001",
                  "attribute_tag": "fabric"
                },
                {
                  "component": "product_spu",
                  "_uid": "spu-uid-002",
                  "name": "Adams L-Shape Sofa Leather",
                  "slug": "adams-l-shape-sofa-leather",
                  "spu_code": "ADS-L-002",
                  "attribute_tag": "leather"
                }
              ]
            },
            {
              "component": "product_category_group",
              "_uid": "cat-uid-002",
              "title": "Sofa with Ottoman",
              "icon": { "filename": "https://cdn.storyblok.com/icon-sofa-ottoman.png" },
              "dimension": "W290 x D220 x H85 cm",
              "products": [
                {
                  "component": "product_spu",
                  "_uid": "spu-uid-003",
                  "name": "Adams L-Shape Sofa with Ottoman Fabric",
                  "slug": "adams-l-shape-sofa-ottoman-fabric",
                  "spu_code": "ADS-LO-001",
                  "attribute_tag": "fabric"
                }
              ]
            }
          ]
        },
        {
          "component": "product_layout_group",
          "_uid": "layout-uid-002",
          "title": "3-Seater",
          "product_categories": [
            {
              "component": "product_category_group",
              "_uid": "cat-uid-003",
              "title": "Sofa",
              "icon": { "filename": "https://cdn.storyblok.com/icon-sofa.png" },
              "dimension": "W220 x D90 x H85 cm",
              "products": [
                {
                  "component": "product_spu",
                  "_uid": "spu-uid-004",
                  "name": "Adams 3-Seater Sofa Fabric",
                  "slug": "adams-3-seater-sofa-fabric",
                  "spu_code": "ADS-3-001",
                  "attribute_tag": "fabric"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.2 各层字段详情

| 字段 | 类型 | 必填 | 说明 |
| `title` | `string` | 是 | 系列名称，如 "Adams Collection" |
| `product_layouts` | `ProductLayoutGroupStoryblok[]` | 是 | 该系列下的形态列表 |
| `_uid` | `string` | 是 | 节点唯一 ID |
| `component` | `"product_spu_group"` | 是 | 组件类型标识 |


| 字段 | 类型 | 必填 | 说明 |
| `title` | `string` | 是 | 形态名称，如 "L-Shape"、"3-Seater" |
| `product_categories` | `ProductCategoryGroupStoryblok[]` | 是 | 该形态下的产品类型列表 |
| `_uid` | `string` | 是 | 节点唯一 ID |
| `component` | `"product_layout_group"` | 是 | 组件类型标识 |


| 字段 | 类型 | 必填 | 说明 |
| `title` | `string` | 是 | 类型名称，如 "Sofa"、"Sofa with Ottoman" |
| `icon` | `AssetStoryblok` | 否 | 图标资源，取 `icon.filename` 作为图片 URL |
| `dimension` | `string` | 否 | 尺寸描述文字 |
| `products` | `ProductSpuStoryblok[]` | 是 | 该类型下的具体产品列表 |
| `_uid` | `string` | 是 | 节点唯一 ID |
| `component` | `"product_category_group"` | 是 | 组件类型标识 |


| 字段 | 类型 | 必填 | 说明 |
| `name` | `string` | 是 | 产品展示名称 |
| `slug` | `string` | 是 | 产品唯一标识，同时用于路由 /products/[slug] |
| `spu_code` | `string` | 是 | 内部产品编码 |
| `attribute_tag` | `number | string` | 否 | 材质标签，如 "fabric"、"leather"，用于前端材质分组 |
| `_uid` | `string` | 是 | 节点唯一 ID |
| `component` | `"product_spu"` | 是 | 组件类型标识 |


## 3. 前端 UI 交互树结构

前端通过 `buildIndexMapAndBaseStructure()` 将 CMS 数据解析为 `PDPConfig`。结构如下：

```
graph TD
    PDPConfig --> IDX["indexMap\nRecord~slug, SpuIndexEntry~\nO(1) 反查表"]
    PDPConfig --> uiTree["uiTree\n{ spuGroups }"]
    PDPConfig --> raw["raw\n原始 CMS 数据（备用）"]

    uiTree --> SG["SpuGroup\nid · title · defaultLink\nisActive · categoryCount"]
    SG -->|"layoutGroups[ ]"| LG["LayoutGroup\nid · title · defaultLink\nisActive · activeCategoryGroupId"]
    LG -->|"categoryGroups[ ]"| CG["CategoryGroup\nid · title · icon · dimension\nisActive · showGroupOptions\nactiveGroupKey · groupKeys"]
    CG -->|"groupKeyBuckets[ ]"| BK["GroupKeyBucket\ngroupKey · defaultLink"]
    BK -->|"products[ ]"| SI["SpuItem\nslug · name · isCurrent · attributeTag"]

    style PDPConfig fill:#2C3E50,color:#fff
    style IDX fill:#C0392B,color:#fff
    style raw fill:#7F8C8D,color:#fff
    style uiTree fill:#2C3E50,color:#fff
    style SG fill:#2980B9,color:#fff
    style LG fill:#8E44AD,color:#fff
    style CG fill:#16A085,color:#fff
    style BK fill:#E67E22,color:#fff
    style SI fill:#27AE60,color:#fff
```

### 3.1 JSON 示例（UI 交互树，当前访问 adams-l-shape-sofa-fabric）

```
{
  "indexMap": {
    "adams-l-shape-sofa-fabric": {
      "spuGroupId": "group-uid-001",
      "spuGroupTitle": "Adams Collection",
      "layoutGroupId": "layout-uid-001",
      "layoutGroupTitle": "L-Shape",
      "categoryGroupId": "cat-uid-001",
      "categoryGroupTitle": "Sofa",
      "groupKey": "fabric"
    },
    "adams-l-shape-sofa-leather": {
      "spuGroupId": "group-uid-001",
      "spuGroupTitle": "Adams Collection",
      "layoutGroupId": "layout-uid-001",
      "layoutGroupTitle": "L-Shape",
      "categoryGroupId": "cat-uid-001",
      "categoryGroupTitle": "Sofa",
      "groupKey": "leather"
    },
    "adams-l-shape-sofa-ottoman-fabric": {
      "spuGroupId": "group-uid-001",
      "spuGroupTitle": "Adams Collection",
      "layoutGroupId": "layout-uid-001",
      "layoutGroupTitle": "L-Shape",
      "categoryGroupId": "cat-uid-002",
      "categoryGroupTitle": "Sofa with Ottoman",
      "groupKey": "fabric"
    },
    "adams-3-seater-sofa-fabric": {
      "spuGroupId": "group-uid-001",
      "spuGroupTitle": "Adams Collection",
      "layoutGroupId": "layout-uid-002",
      "layoutGroupTitle": "3-Seater",
      "categoryGroupId": "cat-uid-003",
      "categoryGroupTitle": "Sofa",
      "groupKey": "fabric"
    }
  },
  "uiTree": {
    "spuGroups": [
      {
        "id": "group-uid-001",
        "title": "Adams Collection",
        "defaultLink": "/products/adams-l-shape-sofa-fabric",
        "isActive": true,
        "categoryCount": 3,
        "layoutGroups": [
          {
            "id": "layout-uid-001",
            "title": "L-Shape",
            "defaultLink": "/products/adams-l-shape-sofa-fabric",
            "isActive": true,
            "activeCategoryGroupId": "cat-uid-001",
            "categoryGroups": [
              {
                "id": "cat-uid-001",
                "title": "Sofa",
                "icon": "https://cdn.storyblok.com/icon-sofa.png",
                "dimension": "W290 x D175 x H85 cm",
                "defaultLink": "/products/adams-l-shape-sofa-fabric",
                "isActive": true,
                "showGroupOptions": true,
                "activeGroupKey": "fabric",
                "groupKeys": ["fabric", "leather"],
                "groupKeyBuckets": [
                  {
                    "groupKey": "fabric",
                    "defaultLink": "/products/adams-l-shape-sofa-fabric",
                    "products": [
                      {
                        "slug": "adams-l-shape-sofa-fabric",
                        "name": "Adams L-Shape Sofa Fabric",
                        "isCurrent": true,
                        "attributeTag": "fabric",
                        "image": ""
                      }
                    ]
                  },
                  {
                    "groupKey": "leather",
                    "defaultLink": "/products/adams-l-shape-sofa-leather",
                    "products": [
                      {
                        "slug": "adams-l-shape-sofa-leather",
                        "name": "Adams L-Shape Sofa Leather",
                        "isCurrent": false,
                        "attributeTag": "leather",
                        "image": ""
                      }
                    ]
                  }
                ]
              },
              {
                "id": "cat-uid-002",
                "title": "Sofa with Ottoman",
                "icon": "https://cdn.storyblok.com/icon-sofa-ottoman.png",
                "dimension": "W290 x D220 x H85 cm",
                "defaultLink": "/products/adams-l-shape-sofa-ottoman-fabric",
                "isActive": false,
                "showGroupOptions": false,
                "activeGroupKey": null,
                "groupKeys": ["fabric"],
                "groupKeyBuckets": [
                  {
                    "groupKey": "fabric",
                    "defaultLink": "/products/adams-l-shape-sofa-ottoman-fabric",
                    "products": [
                      {
                        "slug": "adams-l-shape-sofa-ottoman-fabric",
                        "name": "Adams L-Shape Sofa with Ottoman Fabric",
                        "isCurrent": false,
                        "attributeTag": "fabric",
                        "image": ""
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "id": "layout-uid-002",
            "title": "3-Seater",
            "defaultLink": "/products/adams-3-seater-sofa-fabric",
            "isActive": false,
            "activeCategoryGroupId": null,
            "categoryGroups": [
              {
                "id": "cat-uid-003",
                "title": "Sofa",
                "icon": "https://cdn.storyblok.com/icon-sofa.png",
                "dimension": "W220 x D90 x H85 cm",
                "defaultLink": "/products/adams-3-seater-sofa-fabric",
                "isActive": false,
                "showGroupOptions": false,
                "activeGroupKey": null,
                "groupKeys": ["fabric"],
                "groupKeyBuckets": [
                  {
                    "groupKey": "fabric",
                    "defaultLink": "/products/adams-3-seater-sofa-fabric",
                    "products": [
                      {
                        "slug": "adams-3-seater-sofa-fabric",
                        "name": "Adams 3-Seater Sofa Fabric",
                        "isCurrent": false,
                        "attributeTag": "fabric",
                        "image": ""
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

*isActive、isCurrent、activeGroupKey 等为前端动态注入字段，非 CMS 原始字段。*`image`* 字段由前端懒加载填充，初始为空字符串。*

### 3.2 indexMap — SpuIndexEntry 字段

**Key**：product slug（如 `"adams-l-shape-sofa-fabric"`）

| 字段 | 类型 | 说明 |
| `spuGroupId` | `string` | 所属产品系列的 _uid |
| `spuGroupTitle` | `string` | 所属产品系列名称 |
| `layoutGroupId` | `string` | 所属形态的 _uid |
| `layoutGroupTitle` | `string` | 所属形态名称 |
| `categoryGroupId` | `string` | 所属产品类型的 _uid |
| `categoryGroupTitle` | `string` | 所属产品类型名称 |
| `groupKey` | `string` | 材质 key：`"fabric"` / `"leather"` / `"default"` |


### 3.3 uiTree 各层完整字段

| 字段 | 类型 | 来源 | 说明 |
| `id` | `string` | CMS _uid | 系列唯一 ID |
| `title` | `string` | CMS title | 系列名称 |
| `defaultLink` | `string` | 前端计算 | 该系列第一个产品的路由链接 |
| `isActive` | `boolean` | 前端注入 | 是否包含当前页面产品 |
| `categoryCount` | `number` | 前端计算 | 该系列下所有 CategoryGroup 的总数 |
| `layoutGroups` | `LayoutGroup[]` | CMS 映射 | 子节点列表 |


| 字段 | 类型 | 来源 | 说明 |
| `id` | `string` | CMS _uid | 形态唯一 ID |
| `title` | `string` | CMS title | 形态名称 |
| `defaultLink` | `string` | 前端计算 | 该形态第一个产品的链接 |
| `isActive` | `boolean` | 前端注入 | 是否包含当前页面产品 |
| `activeCategoryGroupId` | `string | null` | 前端注入 | 当前激活的 CategoryGroup id |
| `categoryGroups` | `CategoryGroup[]` | CMS 映射 | 子节点列表 |


| 字段 | 类型 | 来源 | 说明 |
| `id` | `string` | CMS _uid | 类型唯一 ID |
| `title` | `string` | CMS title | 类型名称 |
| `icon` | `string | undefined` | CMS icon.filename | 图标图片 URL |
| `dimension` | `string | undefined` | CMS dimension | 尺寸描述 |
| `defaultLink` | `string | undefined` | 前端计算 | 该类型第一个产品的链接 |
| `isActive` | `boolean` | 前端注入 | 是否包含当前页面产品 |
| `showGroupOptions` | `boolean` | 前端计算 | groupKeys 长度 > 1 时为 true |
| `activeGroupKey` | `string | null` | 前端注入 | 当前激活的材质 key |
| `groupKeys` | `string[]` | 前端计算 | 该类型下所有材质 key 列表 |
| `groupKeyBuckets` | `GroupKeyBucket[]` | 前端计算 | 按材质分组后的产品桶 |


| 类型 | 字段 | 类型 | 说明 |
| **GroupKeyBucket** | `groupKey` | `string` | 材质标识，如 "fabric"、"leather" |
| `defaultLink` | `string` | 该材质桶第一个产品的链接 |
| `products` | `SpuItem[]` | 该材质下的产品列表 |
| **SpuItem** | `slug` | `string` | 产品唯一标识（同 CMS slug） |
| `name` | `string` | 产品名称 |
| `isCurrent` | `boolean` | 是否是当前正在浏览的产品 |
| `attributeTag` | `string | undefined` | 材质标签（已 normalize 为字符串） |
| `image` | `string` | 产品图片（前端懒加载填充，初始为空字符串） |


## 4. 数据处理关键规则

> 以下规则在前端 `buildIndexMapAndBaseStructure()` 中实现。

| 规则 | 说明 |
| **去重** | 同一 slug 只能出现在一个 SpuGroup，后续重复出现跳过（first-win） |
| **材质分组** | 同一 CategoryGroup 内的产品按 `attribute_tag` 聚合成独立的 GroupKeyBucket |
| **材质排序** | `fabric` → `leather` → 其余按字母序 |
| **isActive 动态注入** | indexMap + baseSpuGroups 全局缓存；`isActive` / `isCurrent` 每次请求按 currentSlug 动态计算，不进缓存 |
| **uiTree 过滤** | 有 currentSlug 时，spuGroups 只返回包含该产品的单个 SpuGroup |


## 5. 完整数据流

```
flowchart TD
    subgraph CMS["Storyblok CMS"]
        SB[("Storyblok API")]
    end

    subgraph Parse["解析层"]
        RAW["PdpSelectorConfigStoryblok\n原始 JSON（四层嵌套）"]
        BUILD["buildIndexMapAndBaseStructure()"]
    end

    subgraph Cache["全局缓存（unstable_cache + reactCache）"]
        IDX["indexMap\nRecord~slug, SpuIndexEntry~"]
        BASE["baseSpuGroups\nSpuGroup[]  isActive = false"]
    end

    subgraph PerRequest["每次请求（按 currentSlug）"]
        APPLY["applyCurrentSlugToUiTree()\n1. 查 indexMap 定位 slug\n2. 过滤到对应 SpuGroup\n3. 注入 isActive / isCurrent"]
        OUT["PDPConfig\n{ indexMap, uiTree, raw }"]
    end

    SB -->|"getPdpSelectorConfigServer()"| RAW
    RAW --> BUILD
    BUILD --> IDX
    BUILD --> BASE
    IDX --> APPLY
    BASE --> APPLY
    APPLY --> OUT

    classDef cache fill:#d4efdf,stroke:#27ae60,stroke-width:2px
    classDef logic fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    class IDX,BASE cache
    class BUILD,APPLY logic
```