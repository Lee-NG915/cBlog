---
confluence_id: "3412459527"
title: "Joy UI 默认 variant 取色规则"
status: current
parent_id: "3310452890"
depth: 2
domain: design-system
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3412459527
local_joyboy_doc: null
blog_post: null
---
Joy UI 为组件提供了四种主要变体（solid、outlined、soft、plain），每种变体都有一套完整的状态属性规则。这些规则决定了组件在不同状态（默认、悬停、激活、禁用、选中等）下的视觉表现。理解这些规则对于正确配置主题和实现设计意图至关重要。

### 默认取色规则的应用场景

1. - **未显式配置特定变体属性**：当主题中没有明确定义某个组件变体的特定属性（如 `outlinedHoverBg`）时，Joy UI 会根据预设的色阶映射规则自动选择颜色。
2. - **使用标准色系但未定制变体样式**：当使用如 `primary`、`success` 等标准色系，但没有为其定制变体级别的样式时，系统会应用默认映射。例如，`primary.solid` 未定义时，会取 `primary[500]` 作为 `solidBg`。
3. - **组件使用默认 color 属性**：当组件没有指定 `color` 属性时，会使用默认色系（通常是 `primary`）并应用相应的默认规则。
4. - **新增的复合状态**：当添加新的交互状态组合（如 hover+focus）但未在主题中定义对应的样式时，会基于基础状态的默认规则合成。
### 1. solid 变体属性规则

| 状态组合 | 属性 | 默认取色逻辑 | 说明 |
| 默认 | solidBg | color-500 | 背景色 |
|  | solidColor | white | 文字色 |
|  | solidBorder | color-500 | 边框色 |
| hover | solidHoverBg | color-600 | 悬停背景色 |
|  | solidHoverColor | white | 悬停文字色 |
|  | solidHoverBorder | color-600 | 悬停边框色 |
| active | solidActiveBg | color-700 | 激活背景色 |
|  | solidActiveColor | white | 激活文字色 |
|  | solidActiveBorder | color-700 | 激活边框色 |
| focus | solidFocusBg | color-600 | 聚焦背景色 |
|  | solidFocusColor | white | 聚焦文字色 |
|  | solidFocusBorder | color-600 | 聚焦边框色 |
| disabled | solidDisabledBg | 通常使用 disabledBg | 禁用背景色 |
|  | solidDisabledColor | 通常使用 disabledColor | 禁用文字色 |
|  | solidDisabledBorder | 通常使用 disabledBorder | 禁用边框色 |
| selected/checked | solidCheckedBg | color-500 | 选中背景色 |
|  | solidCheckedColor | white | 选中文字色 |
|  | solidCheckedBorder | color-500 | 选中边框色 |
| checked+hover | solidCheckedHoverBg | color-600 | 选中悬停背景色 |
|  | solidCheckedHoverColor | white | 选中悬停文字色 |
|  | solidCheckedHoverBorder | color-600 | 选中悬停边框色 |
| checked+active | solidCheckedActiveBg | color-700 | 选中激活背景色 |
|  | solidCheckedActiveColor | white | 选中激活文字色 |
|  | solidCheckedActiveBorder | color-700 | 选中激活边框色 |
| checked+disabled | solidCheckedDisabledBg | 通常使用 disabledBg | 选中禁用背景色 |
|  | solidCheckedDisabledColor | 通常使用 disabledColor | 选中禁用文字色 |
|  | solidCheckedDisabledBorder | 通常使用 disabledBorder | 选中禁用边框色 |


### 2. outlined 变体属性规则

| 状态组合 | 属性 | 默认取色逻辑 | 说明 |
| 默认 | outlinedBg | transparent | 背景色 |
|  | outlinedColor | color-500 | 文字色 |
|  | outlinedBorder | color-500 | 边框色 |
| hover | outlinedHoverBg | color-50/100 | 悬停背景色 |
|  | outlinedHoverColor | color-600 | 悬停文字色 |
|  | outlinedHoverBorder | color-600 | 悬停边框色 |
| active | outlinedActiveBg | color-100/200 | 激活背景色 |
|  | outlinedActiveColor | color-700 | 激活文字色 |
|  | outlinedActiveBorder | color-700 | 激活边框色 |
| focus | outlinedFocusBg | color-50/100 | 聚焦背景色 |
|  | outlinedFocusColor | color-600 | 聚焦文字色 |
|  | outlinedFocusBorder | color-600 | 聚焦边框色 |
| disabled | outlinedDisabledBg | transparent | 禁用背景色 |
|  | outlinedDisabledColor | 通常使用 disabledColor | 禁用文字色 |
|  | outlinedDisabledBorder | 通常使用 disabledBorder | 禁用边框色 |
| checked | outlinedCheckedBg | color-500 | 选中背景色 |
|  | outlinedCheckedColor | white | 选中文字色 |
|  | outlinedCheckedBorder | color-500 | 选中边框色 |
| checked+hover | outlinedCheckedHoverBg | color-600 | 选中悬停背景色 |
|  | outlinedCheckedHoverColor | white | 选中悬停文字色 |
|  | outlinedCheckedHoverBorder | color-600 | 选中悬停边框色 |
| checked+active | outlinedCheckedActiveBg | color-700 | 选中激活背景色 |
|  | outlinedCheckedActiveColor | white | 选中激活文字色 |
|  | outlinedCheckedActiveBorder | color-700 | 选中激活边框色 |
| checked+disabled | outlinedCheckedDisabledBg | 通常使用 disabledBg | 选中禁用背景色 |
|  | outlinedCheckedDisabledColor | 通常使用 disabledColor | 选中禁用文字色 |
|  | outlinedCheckedDisabledBorder | 通常使用 disabledBorder | 选中禁用边框色 |


### 3. soft 变体属性规则

| 状态组合 | 属性 | 默认取色逻辑 | 说明 |
| 默认 | softBg | color-100 | 背景色 |
|  | softColor | color-700 | 文字色 |
|  | softBorder | color-100 | 边框色 |
| hover | softHoverBg | color-200 | 悬停背景色 |
|  | softHoverColor | color-800 | 悬停文字色 |
|  | softHoverBorder | color-200 | 悬停边框色 |
| active | softActiveBg | color-300 | 激活背景色 |
|  | softActiveColor | color-800 | 激活文字色 |
|  | softActiveBorder | color-300 | 激活边框色 |
| focus | softFocusBg | color-200 | 聚焦背景色 |
|  | softFocusColor | color-800 | 聚焦文字色 |
|  | softFocusBorder | color-200 | 聚焦边框色 |
| disabled | softDisabledBg | 通常使用 disabledBg | 禁用背景色 |
|  | softDisabledColor | 通常使用 disabledColor | 禁用文字色 |
|  | softDisabledBorder | 通常使用 disabledBorder | 禁用边框色 |
| checked | softCheckedBg | color-500 | 选中背景色 |
|  | softCheckedColor | white | 选中文字色 |
|  | softCheckedBorder | color-500 | 选中边框色 |
| checked+hover | softCheckedHoverBg | color-600 | 选中悬停背景色 |
|  | softCheckedHoverColor | white | 选中悬停文字色 |
|  | softCheckedHoverBorder | color-600 | 选中悬停边框色 |
| checked+active | softCheckedActiveBg | color-700 | 选中激活背景色 |
|  | softCheckedActiveColor | white | 选中激活文字色 |
|  | softCheckedActiveBorder | color-700 | 选中激活边框色 |
| checked+disabled | softCheckedDisabledBg | 通常使用 disabledBg | 选中禁用背景色 |
|  | softCheckedDisabledColor | 通常使用 disabledColor | 选中禁用文字色 |
|  | softCheckedDisabledBorder | 通常使用 disabledBorder | 选中禁用边框色 |


### 4. plain 变体属性规则

| 状态组合 | 属性 | 默认取色逻辑 | 说明 |
| 默认 | plainBg | transparent | 背景色 |
|  | plainColor | color-500 | 文字色 |
|  | plainBorder | transparent | 边框色 |
| hover | plainHoverBg | color-50 | 悬停背景色 |
|  | plainHoverColor | color-600 | 悬停文字色 |
|  | plainHoverBorder | transparent | 悬停边框色 |
| active | plainActiveBg | color-100 | 激活背景色 |
|  | plainActiveColor | color-700 | 激活文字色 |
|  | plainActiveBorder | transparent | 激活边框色 |
| focus | plainFocusBg | color-50 | 聚焦背景色 |
|  | plainFocusColor | color-600 | 聚焦文字色 |
|  | plainFocusBorder | transparent | 聚焦边框色 |
| disabled | plainDisabledBg | transparent | 禁用背景色 |
|  | plainDisabledColor | 通常使用 disabledColor | 禁用文字色 |
|  | plainDisabledBorder | transparent | 禁用边框色 |
| checked | plainCheckedBg | color-50/100 | 选中背景色 |
|  | plainCheckedColor | color-700 | 选中文字色 |
|  | plainCheckedBorder | transparent | 选中边框色 |
| checked+hover | plainCheckedHoverBg | color-100/200 | 选中悬停背景色 |
|  | plainCheckedHoverColor | color-800 | 选中悬停文字色 |
|  | plainCheckedHoverBorder | transparent | 选中悬停边框色 |
| checked+active | plainCheckedActiveBg | color-200/300 | 选中激活背景色 |
|  | plainCheckedActiveColor | color-800 | 选中激活文字色 |
|  | plainCheckedActiveBorder | transparent | 选中激活边框色 |
| checked+disabled | plainCheckedDisabledBg | 通常使用 disabledBg | 选中禁用背景色 |
|  | plainCheckedDisabledColor | 通常使用 disabledColor | 选中禁用文字色 |
|  | plainCheckedDisabledBorder | transparent | 选中禁用边框色 |


**优先级层级（从高到低）**

1. - **最具体的复合状态 token**：如 `outlinedCheckedHoverBg`（变体+选中+悬停状态）
2. - **次具体的复合状态 token**：如 `outlinedCheckedBg`（变体+选中状态）
3. - **变体特定状态 token**：如 `outlinedHoverBg`（变体+基础状态）
4. - **通用状态 token**：如 `checkedBg`、`hoverBg`（非变体特定）
5. - **变体基础 token**：如 `outlinedBg`（只指定变体）
6. - **通用基础 token**：如 `bgColor`（最基础）
7. - **色阶自动映射**：如 `color-500`（无特定token时）