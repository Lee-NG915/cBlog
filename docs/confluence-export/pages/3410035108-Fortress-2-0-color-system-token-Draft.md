---
confluence_id: "3410035108"
title: "Fortress 2.0 color system token (Draft)"
status: current
parent_id: "3310452890"
depth: 2
domain: design-system
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3410035108
local_joyboy_doc: null
blog_post: null
---
> 本文初步整理 Fortress2.0 颜色所有配置，旨在优化出更加一致规范的组件系统

> Fortress 2.0 基于 Joy UI 构建了一套完整的 color system token 体系，通过"色阶变量 + 状态 token + variant 默认映射"三层机制，兼顾设计灵活性与视觉一致性。本文档详细说明了 token 的命名规则、变体属性映射及其优先级关系，帮助开发者和设计师高效协作，确保产品设计语言的统一。

## 当前的色系架构

```
theme.palette
│
├── primary (基于 terracotta)
│   ├── solidColor: white
│   ├── solidActiveBg: terracotta-800
│   ├── outlinedBorder: terracotta-500
│   └── ... (其他变体属性)
│
├── neutral (基于 maroonVelvet)
│   ├── solidColor: maroonVelvet-500
│   ├── solidActiveBg: maroonVelvet-500
│   ├── outlinedColor: maroonVelvet-500
│   └── ... (其他变体属性)
│
├── success (基于 leafGreen)
│   │
│   └── outlinedBg: transparent
│
├── danger (基于 rosewood)
│   ├── plainDisabledBg: mono-50
│   └── outlinedBg: transparent
│
├── warning (基于 burntOrange)
│   └── outlinedBg: transparent
│
└── brand
    ├── terracotta
    │   ├── borderColor: terracotta-500
    │   ├── outlineColor: terracotta-100
    │   ├── hoverColor: terracotta-600
    │   ├── activeColor: terracotta-900
    │   ├── checkedColor: white
    │   └── ... (其他状态属性)
    │
    ├── maroonVelvet
    │   ├── outlinedCheckedBg: maroonVelvet-500
    │   ├── outlinedHoverBg: maroonVelvet-400
    │   └── ... (其他变体属性)
    │
    ├── leafGreen
    ├── burntOrange
    │   ├── solidColor: white
    │   ├── solidBg: burntOrange-500
    │   ├── softColor: burntOrange-700
    │   ├── outlinedColor: burntOrange-500
    │   ├── plainColor: burntOrange-500
    │   └── ... (其他变体属性)
    │
    ├── freshWaterBlue
    ├── warmLinen
    │   ├── bgColor: warmLinen-500
    │   ├── borderColor: warmLinen-500
    │   └── color: mono-900
    │
    ├── mono
    │   ├── bgColor: mono-900
    │   ├── borderColor: mono-900
    │   ├── color: white
    │   ├── divider: mono-300
    │   ├── solidColor: white
    │   ├── outlinedColor: mono-900
    │   ├── plainColor: mono-900
    │   └── ... (其他变体属性)
    │
    ├── rosewood
    ├── white: #FFFFFF
    │
    └── black: #000000
```



## 色系应用规则

1. - **可直接用作组件 color 属性的色系**：

- `primary`（基于 terracotta）
- `neutral`（基于 maroonVelvet）
- `success`（基于 leafGreen）
- `danger`（基于 rosewood）
- `warning`（基于 burntOrange）
2. - **brand 下的基础色系**：

- `terracotta`、`maroonVelvet`、`burntOrange` 等
- 这些**不能**直接用作组件的 `color` 属性
## 使用方式区别

```
// ✅ 正确 - 使用顶层色系名称
<Button color="primary" />
<Button color="success" />
<Button color="warning" />

// ❌ 错误 - 不能直接使用 brand 下的色系
<Button color="terracotta" />
<Button color="brand.terracotta" />
```

## 原因分析

1. - **Joy UI 设计决策**：

- Joy UI 的 `color` 属性仅接受预定义的色系名称（primary、neutral、success、danger、warning 等）
- 这些名称必须在主题的顶层 `palette` 中有对应项
2. - **主题结构**：

- 在当前 theme.tsx 中，`terracotta` 等色系定义在 `palette.brand` 下，而非直接在 `palette` 下
- Joy UI 组件寻找色系时，会查找 `palette[color]`，无法查找 `palette.brand[color]`
3. - **设计意图**：

- 这种设计允许品牌色（brand colors）与语义色（semantic colors）分离
- 语义色（如 primary、success）可以映射到不同品牌色，便于主题切换


## 1. Joy UI 默认 variant 取色规则

[Fortress 2.0 color system token | 默认取色规则](https://castlery.atlassian.net/wiki/spaces/EC/pages/3410035108/Fortress+2.0+color+system+token+Draft#%E9%BB%98%E8%AE%A4%E5%8F%96%E8%89%B2%E8%A7%84%E5%88%99%E7%9A%84%E5%BA%94%E7%94%A8%E5%9C%BA%E6%99%AF) 

### 默认取色规则的应用场景

1. - **未显式配置特定变体属性**：当主题中没有明确定义某个组件变体的特定属性（如 `outlinedHoverBg`）时，Joy UI 会根据预设的色阶映射规则自动选择颜色。
2. - **使用标准色系但未定制变体样式**：当使用如 `primary`、`success` 等标准色系，但没有为其定制变体级别的样式时，系统会应用默认映射。例如，`primary.solid` 未定义时，会取 `primary[500]` 作为 `solidBg`。
3. - **组件使用默认 color 属性**：当组件没有指定 `color` 属性时，会使用默认色系（通常是 `primary`）并应用相应的默认规则。
4. - **新增的复合状态**：当添加新的交互状态组合（如 hover+focus）但未在主题中定义对应的样式时，会基于基础状态的默认规则合成。


## 2. 色阶变量体系（以 terracotta 为例）

Fortress 2.0 的每个品牌色系（如 terracotta、maroonVelvet、burntOrange 等）都定义了一套完整的色阶 token，命名规范如下：

**说明：**  

- 这些 token 通过 `...paletteV2.terracotta` 注入到 theme，供所有组件和 variant 自动引用。
## 3. 所有色系的 variant 详细配置

只要 theme 里注入了全色阶变量，variant 级别的颜色就会自动走 Joy UI 的默认色阶分配。

如需自定义 variant 颜色，只需在 theme 里补充对应的 solidBg/outlinedBorder 等 token。

### 3.1 terracotta

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 通用状态token | borderColor | terracotta-500 | 通用边框色，优先级高于variant级别 |
|  | outlineColor | terracotta-100 | 通用外轮廓色 |
|  | bgColor | white | 通用背景色 |
|  | hoverColor | terracotta-600 | 通用悬停文字色 |
|  | hoverBg | terracotta-100 | 通用悬停背景色 |
|  | hoverBorder | terracotta-200 | 通用悬停边框色 |
|  | hoverOutlineColor | terracotta-200 | 通用悬停外轮廓色 |
|  | hoverBoxShadow | terracotta-100 | 通用悬停阴影色 |
|  | activeColor | terracotta-900 | 通用激活文字色 |
|  | activeBg | terracotta-100 | 通用激活背景色 |
|  | activeBorder | terracotta-200 | 通用激活边框色 |
|  | activeOutlineColor | terracotta-200 | 通用激活外轮廓色 |
|  | activeBoxShadow | terracotta-100 | 通用激活阴影色 |
|  | checkedColor | white | 通用选中文字色 |
|  | checkedBg | terracotta-500 | 通用选中背景色 |
|  | checkedBorder | terracotta-500 | 通用选中边框色 |
|  | checkedOutlineColor | terracotta-200 | 通用选中外轮廓色 |
|  | checkedActiveBg | terracotta-900 | 通用选中激活背景色 |
|  | checkedActiveBorder | terracotta-900 | 通用选中激活边框色 |
|  | disabledColor | mono-500 | 通用禁用文字色 |
|  | disabledBg | mono-200 | 通用禁用背景色 |
|  | disabledBorder | mono-200 | 通用禁用边框色 |
|  | disabledOutlineColor | mono-200 | 通用禁用外轮廓色 |
| solid | 未声明 | Joy UI 默认 | 当组件使用此variant时会被上面的通用token覆盖 |
| soft | 未声明 | Joy UI 默认 |  |
| outlined | 未声明 | Joy UI 默认 |  |
| plain | 未声明 | Joy UI 默认 |  |


terracotta 直接声明的状态 token（如 borderColor、hoverBg 等）优先级高于 variant 级别的颜色。

- 这意味着如果同时存在 `borderColor` 和 `solidBorder`，组件将优先使用 `borderColor`
- 例如，一个使用 terracotta 色系的 Button 组件，其边框色会使用 terracotta-500，而不是 variant 默认的色阶取值
### 3.2 maroonVelvet

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| outlined | outlinedCheckedBg | maroonVelvet-500 | 选中背景色 |
|  | outlinedCheckedHoverBg | maroonVelvet-400 | 选中悬停背景色 |
|  | outlinedHoverBg | maroonVelvet-400 | 悬停背景色 |
|  | outlinedFocusBg | maroonVelvet-400 | 聚焦背景色 |
|  | outlinedActiveBg | maroonVelvet-500 | 激活背景色 |
|  | outlinedColor | maroonVelvet-500 | 文字色 |
|  | outlinedBorder | maroonVelvet-500 | 边框色 |
|  | outlinedDisabledColor | mono-500 | 禁用文字色 |
| 其他 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 4.3 leafGreen

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 全部 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 3.4 burntOrange

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| solid | solidColor | white | 文字色 |
|  | solidBg | burntOrange-500 | 背景色 |
|  | solidBorder | burntOrange-500 | 边框色 |
|  | solidHoverColor | white | 悬停文字色 |
|  | solidHoverBg | burntOrange-600 | 悬停背景色 |
|  | solidHoverBorder | burntOrange-600 | 悬停边框色 |
|  | solidFocusBg | burntOrange-600 | 聚焦背景色 |
|  | solidActiveColor | white | 激活文字色 |
|  | solidActiveBg | burntOrange-800 | 激活背景色 |
|  | solidActiveBorder | burntOrange-800 | 激活边框色 |
|  | solidDisabledColor | mono-500 | 禁用文字色 |
|  | solidDisabledBg | mono-200 | 禁用背景色 |
|  | solidDisabledBorder | mono-200 | 禁用边框色 |
| soft | softColor | burntOrange-700 | 文字色 |
|  | softBg | burntOrange-100 | 背景色 |
|  | softBorder | burntOrange-100 | 边框色 |
|  | softHoverColor | burntOrange-800 | 悬停文字色 |
|  | softHoverBg | burntOrange-200 | 悬停背景色 |
|  | softHoverBorder | burntOrange-200 | 悬停边框色 |
|  | softActiveColor | burntOrange-800 | 激活文字色 |
|  | softActiveBg | burntOrange-300 | 激活背景色 |
|  | softActiveBorder | burntOrange-300 | 激活边框色 |
|  | softDisabledColor | mono-500 | 禁用文字色 |
|  | softDisabledBg | mono-100 | 禁用背景色 |
|  | softDisabledBorder | mono-100 | 禁用边框色 |
| outlined | outlinedColor | burntOrange-500 | 文字色 |
|  | outlinedBorder | burntOrange-900 | 边框色 |
|  | outlinedBg | transparent | 背景色 |
|  | outlinedHoverColor | burntOrange-600 | 悬停文字色 |
|  | outlinedHoverBorder | burntOrange-400 | 悬停边框色 |
|  | outlinedHoverBg | burntOrange-50 | 悬停背景色 |
|  | outlinedActiveColor | burntOrange-800 | 激活文字色 |
|  | outlinedActiveBorder | burntOrange-500 | 激活边框色 |
|  | outlinedActiveBg | burntOrange-100 | 激活背景色 |
|  | outlinedDisabledColor | mono-500 | 禁用文字色 |
|  | outlinedDisabledBorder | mono-300 | 禁用边框色 |
|  | outlinedDisabledBg | transparent | 禁用背景色 |
| plain | plainColor | burntOrange-500 | 文字色 |
|  | plainBg | transparent | 背景色 |
|  | plainBorder | transparent | 边框色 |
|  | plainHoverColor | burntOrange-600 | 悬停文字色 |
|  | plainHoverBg | burntOrange-50 | 悬停背景色 |
|  | plainHoverBorder | transparent | 悬停边框色 |
|  | plainFocusColor | burntOrange-600 | 聚焦文字色 |
|  | plainActiveColor | burntOrange-800 | 激活文字色 |
|  | plainActiveBg | burntOrange-100 | 激活背景色 |
|  | plainActiveBorder | transparent | 激活边框色 |
|  | plainDisabledColor | mono-500 | 禁用文字色 |
|  | plainDisabledBg | transparent | 禁用背景色 |
|  | plainDisabledBorder | transparent | 禁用边框色 |


### 3.5 freshWaterBlue

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 全部 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 3.6 warmLinen

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 默认 | bgColor | warmLinen-500 | 背景色 |
|  | borderColor | warmLinen-500 | 边框色 |
|  | color | mono-900 | 文字色 |
| 其他 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 3.7 mono

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 默认 | bgColor | mono-900 | 背景色 |
|  | borderColor | mono-900 | 边框色 |
|  | color | white | 文字色 |
|  | divider | mono-300 | 分割线 |
|  | hoverBg | mono-100 | 悬停背景色 |
|  | disabledBg | mono-100 | 禁用背景色 |
| solid | solidColor | white | 文字色 |
|  | solidBg | mono-900 | 背景色 |
|  | solidBorder | mono-900 | 边框色 |
|  | solidHoverColor | white | 悬停文字色 |
|  | solidHoverBg | mono-900 | 悬停背景色 |
|  | solidHoverBorder | mono-900 | 悬停边框色 |
|  | solidActiveColor | white | 激活文字色 |
|  | solidActiveBg | mono-800 | 激活背景色 |
|  | solidActiveBorder | mono-800 | 激活边框色 |
|  | solidDisabledColor | mono-500 | 禁用文字色 |
|  | solidDisabledBg | mono-200 | 禁用背景色 |
|  | solidDisabledBorder | mono-200 | 禁用边框色 |
| outlined | outlinedColor | mono-900 | 文字色 |
|  | outlinedBorder | mono-900 | 边框色 |
|  | outlinedBg | transparent | 背景色 |
|  | outlinedHoverColor | mono-200 | 悬停文字色 |
|  | outlinedHoverBorder | mono-300 | 悬停边框色 |
|  | outlinedHoverBg | mono-200 | 悬停背景色 |
|  | outlinedActiveColor | mono-800 | 激活文字色 |
|  | outlinedActiveBorder | mono-800 | 激活边框色 |
|  | outlinedActiveBg | mono-800 | 激活背景色 |
|  | outlinedDisabledColor | mono-500 | 禁用文字色 |
|  | outlinedDisabledBorder | mono-500 | 禁用边框色 |
|  | outlinedDisabledBg | transparent | 禁用背景色 |
| plain | plainColor | mono-900 | 文字色 |
|  | plainBg | transparent | 背景色 |
|  | plainBorder | transparent | 边框色 |
|  | plainHoverColor | mono-900 | 悬停文字色 |
|  | plainHoverBorder | transparent | 悬停边框色 |
|  | plainHoverBg | transparent | 悬停背景色 |
|  | plainActiveColor | mono-800 | 激活文字色 |
|  | plainActiveBorder | transparent | 激活边框色 |
|  | plainActiveBg | transparent | 激活背景色 |
|  | plainDisabledColor | mono-500 | 禁用文字色 |
|  | plainDisabledBorder | transparent | 禁用边框色 |
|  | plainDisabledBg | transparent | 禁用背景色 |


### 3.8 rosewood

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 全部 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 3.9 white / black

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| 默认 | white | white |  |
|  | black | black |  |


### 3.10 primary

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| solid | solidColor | white | 文字色 |
|  | solidActiveBorder | terracotta-800 | 激活边框色 |
|  | solidActiveBg | terracotta-800 | 激活背景色 |
|  | solidDisabledColor | mono-solidDisabledColor | 禁用文字色 |
|  | solidDisabledBorder | mono-solidDisabledBorder | 禁用边框色 |
|  | solidDisabledBg | mono-solidDisabledBg | 禁用背景色 |
| outlined | outlinedBg | transparent | 背景色 |
|  | outlinedBorder | terracotta-500 | 边框色 |
|  | outlinedActiveBorder | terracotta-800 | 激活边框色 |
|  | outlinedActiveBg | terracotta-200 | 激活背景色 |
|  | outlinedDisabledColor | mono-outlinedDisabledColor | 禁用文字色 |
|  | outlinedDisabledBorder | mono-outlinedDisabledBorder | 禁用边框色 |
|  | outlinedDisabledBg | mono-outlinedDisabledBg | 禁用背景色 |
| plain | plainColor | maroonVelvet-500 | 文字色 |
|  | plainHoverColor | terracotta-600 | 悬停文字色 |
|  | plainHoverBg | terracotta-100 | 悬停背景色 |
|  | plainActiveColor | warmLinen-500 | 激活文字色 |
|  | plainActiveBg | terracotta-500 | 激活背景色 |
|  | plainDisabledColor | mono-plainDisabledColor | 禁用文字色 |
| soft | softActiveColor | terracotta-800 | 激活文字色 |
|  | 其他属性 | 未声明，Joy UI 默认 | 使用色阶自动映射 |


### 3.11 neutral

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| solid | solidColor | maroonVelvet-500 | 文字色 |
|  | solidActiveColor | warmLinen-500 | 激活文字色 |
|  | solidActiveBg | maroonVelvet-500 | 激活背景色 |
|  | solidActiveBorder | maroonVelvet-500 | 激活边框色 |
|  | solidHoverColor | warmLinen-500 | 悬停文字色 |
|  | solidHoverBg | maroonVelvet-400 | 悬停背景色 |
|  | solidHoverBorder | maroonVelvet-400 | 悬停边框色 |
| plain | plainColor | maroonVelvet-500 | 文字色 |
|  | plainActiveColor | warmLinen-500 | 激活文字色 |
|  | plainActiveBg | transparent | 激活背景色 |
|  | plainActiveBorder | transparent | 激活边框色 |
|  | plainHoverColor | warmLinen-500 | 悬停文字色 |
|  | plainHoverBg | transparent | 悬停背景色 |
|  | plainHoverBorder | transparent | 悬停边框色 |
|  | plainDisabledColor | mono-500 | 禁用文字色 |
| outlined | outlinedBg | transparent | 背景色 |
|  | outlinedColor | maroonVelvet-500 | 文字色 |
|  | outlinedActiveColor | warmLinen-500 | 激活文字色 |
|  | outlinedActiveBorder | maroonVelvet-500 | 激活边框色 |
|  | outlinedActiveBg | maroonVelvet-500 | 激活背景色 |
|  | outlinedHoverColor | warmLinen-500 | 悬停文字色 |
|  | outlinedHoverBorder | maroonVelvet-400 | 悬停边框色 |
|  | outlinedHoverBg | maroonVelvet-400 | 悬停背景色 |
|  | outlinedDisabledBorder | mono-300 | 禁用边框色 |
| soft | softColor | maroonVelvet-500 | 文字色 |
|  | softActiveColor | warmLinen-500 | 激活文字色 |
|  | softActiveBg | maroonVelvet-500 | 激活背景色 |
|  | softActiveBorder | maroonVelvet-500 | 激活边框色 |
|  | softHoverColor | warmLinen-500 | 悬停文字色 |
|  | softHoverBg | maroonVelvet-400 | 悬停背景色 |
|  | softHoverBorder | maroonVelvet-400 | 悬停边框色 |


### 3.12 success

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| outlined | outlinedBg | transparent | 背景色 |
| 其他 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 3.13 danger

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| plain | plainDisabledBg | mono-50 | 禁用背景色 |
| outlined | outlinedBg | transparent | 背景色 |
| 其他 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |


### 3.14 warning

| variant | 属性 | 色值/变量（token key） | 说明/备注 |
| outlined | outlinedBg | transparent | 背景色 |
| 其他 | 未声明 | Joy UI 默认 | 使用色阶自动映射 |