---
confluence_id: "2748842031"
title: "技术方案 -  Internationalization(i18n)"
status: current
parent_id: "2583822375"
depth: 1
domain: platform
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2748842031
local_joyboy_doc: null
blog_post: null
---
# 技术选型

## 参阅资料

> - NEXT JS internationalization
- Next Intl
- React I18next
- React i18next 针对nextjs的解决方案
- React i18next针对ts的解决方案
- React i18n的SEO优化方案

## 设计i18n 技术方案要考虑的问题

- 基于**next js **设计i18n方案, 需要考虑i18n对**sever- component**的支持
- 期望和**CMS**结合，支持配置化，支持**预加载**或者**懒加载**
- 兼容第三方库moment，dayjs，joyui等，可做格式化，即icu-formatting （International Components for Unicode）
- 支持变量差值、表达式、条件逻辑等
- 支持良好的ts提示 和 运行前错误校验和提示
- 支持storybook stories
- 支持组件级别的分包
- 支持SEO
- 与后端通信时，携带i18n信息
## 初步技术方案对比

![](attachment)

下面是对 React-i18next 和 Next-intl 两个库的详细对比：

| 特性 | React-i18next | Next-intl |
| **适用框架** | 所有 React 项目 | 仅适用于 Next.js 项目 |
| **集成难易度** | 中等，需要额外配置 | 低，专为 Next.js 设计，集成简单 |
| **功能全面性** | 非常全面，支持占位符替换、复数形式等 | 基本全面，支持常见的国际化需求 |
| **插件和中间件支持** | 丰富，如 i18next-http-backend、i18next-browser-languagedetector | 有限，主要依赖内置功能 |
| **社区和生态系统** | 强大，拥有大量插件和社区支持 | 相对较小，社区和插件较少 |
| **懒加载和预加载** | 需要手动配置懒加载和预加载 | 内置支持懒加载和预加载 |
| **自动语言检测** | 需要插件支持，如 i18next-browser-languagedetector | 内置支持自动语言检测和重定向 |
| **服务器端渲染 (SSR) 支持** | 需要与 next-i18next 配合使用 | 原生支持 |
| **翻译文件格式** | 支持多种格式，如 JSON、YAML | 主要支持 JSON 格式 |
| **调试工具** | 丰富的调试工具和日志支持 | 调试工具相对较少 |
| **默认语言回退机制** | 灵活配置 | 内置，简单配置 |
| **类型定义** | 使用 TypeScript 提供良好的类型定义 | 提供内置类型定义，但可能不如 React-i18next 完备 |
| **locales管理平台集成** | cli  

集成方案 | cli |


### 推荐使用场景

- **Next-intl**:

- **Next.js 项目**：如果你的项目基于 Next.js，并希望简化国际化的实现，Next-intl 是一个理想的选择。它能够充分利用 Next.js 的特性，提供高效的国际化解决方案，集成简单，开箱即用。
- **简单国际化需求**：适用于国际化需求相对简单的项目，默认功能足以满足大多数需求。
- **React-i18next**:

- **通用 React 项目**：适合所有类型的 React 项目，无论是否使用 Next.js。
- **复杂国际化需求**：如果你的项目需要更强大和灵活的国际化功能，React-i18next 是更好的选择。它提供了丰富的插件和中间件支持，可以满足各种复杂的国际化需求。
- **强大社区支持**：如果你需要依赖社区提供的各种插件和扩展功能，React-i18next 具有更强大的社区支持和更丰富的生态系统。
### 选择建议

- **Next.js 项目**：优先考虑 Next-intl，特别是如果你希望快速集成国际化功能并充分利用 Next.js 提供的特性。
- **非 Next.js 项目**：React-i18next 是更好的选择，它提供了更全面的国际化支持和更灵活的配置，适用于所有 React 项目。
## **Locales管理平台集成（初步先不考虑，先使用CMS替代）**

Crowdin 是一个强大的本地化管理平台，广泛应用于软件、应用程序、网站和文档的翻译和本地化管理。它支持自动化流程、多种文件格式、实时预览等功能，适合不同规模的团队使用。如：IBM、GITHUB等

| 特性 | Crowdin | Locize |
| **适用项目** | 软件、应用程序、网站、文档的本地化 | 现代软件开发，特别是 JavaScript 项目 |
| **多文件格式支持** | 支持广泛 | 支持常见格式，特别是与 i18next 集成的格式 |
| **自动化工作流程** | 强大，支持 CI/CD 集成 | 强大，特别是与 i18next 集成 |
| **实时预览和编辑** | 提供实时预览功能 | 提供实时编辑和预览 |
| **翻译记忆库** | 支持 | 支持 |
| **机器翻译集成** | 集成多种机器翻译引擎，如 Google Translate、Microsoft Translator 等，辅助翻译人员工作。 | 集成多种机器翻译引擎 |
| **社区和协作** | 支持众包翻译和社区协作 | 适合团队协作，特别是小团队 |
| **版本管理** | 提供全面的版本管理 | 提供版本管理 |
| **用户界面** | 功能强大，但复杂 | 简洁直观，易于上手 |
| **价格** | 较高，适合大团队和企业 | 相对合理，适合小团队和个人用户 |
| **适用规模** | 适合各种规模的项目 | 适合中小型项目，特别是使用 i18next 的项目 |


### 选择建议

- **Crowdin**: 适合大规模项目、需要强大自动化和多文件格式支持的团队。特别适合企业级应用和有复杂翻译需求的项目。
- **Locize**: 适合使用 i18next 的现代 JavaScript 项目，特别是小型团队和个人用户。提供简洁直观的用户界面和实时编辑功能，适合快速集成和高效管理翻译内容。
根据你的项目需求和团队规模，可以选择适合的本地化管理平台来优化翻译流程，提高翻译效率和质量。

## 选型结论

根据以上对比，以及Github项目经验参考，决定前端使用**Next JS** + **react-i18next **(及其扩展next-i18next + i18next) 。

## 前端技术方案设计

具体详见子级目录。