---
confluence_id: "3213590588"
title: "开发文档-Storyblok(CMS)开发流程"
status: current
parent_id: "2583822375"
depth: 1
domain: cms
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3213590588
local_joyboy_doc: null
blog_post: null
---
## 目录

## 介绍

本指南记录了 Storyblok CMS 如何在 JoyBoy 项目中集成，该项目使用 Next.js App Router 架构和 Storyblok SDK v4+。它旨在作为当前和未来开发者处理 CMS 相关功能的参考文档。

在 JoyBoy 项目中，Storyblok 作为我们的无头 CMS 解决方案，提供内容管理能力，而我们的 Next.js 前端则消费并渲染这些内容。我们实现了两种主要的集成模式：

1. - **组件级集成**：用于可重用 UI 元素，如页头和页脚
2. - **页面级集成**：用于完整的页面模板，如博客和布局页面
## 架构概览

以下是 Storyblok 如何与 JoyBoy 项目集成的高级概览：

```
graph TD
    subgraph "Storyblok CMS"
        A[内容模型] --> C[CDN API]
    end
    
    subgraph "JoyBoy Next.js应用"
        D[服务层抽象/SbService] --> E[数据获取]
        E --> H[组件级集成]
        E --> I[页面级集成]
        
        subgraph "集成模式"
            H[组件级集成]
            I[页面级集成]
        end
    end
    
    C --> D
```

## 设置与配置

我们的项目使用最新的 Storyblok SDK（v4+）与 Next.js App Router 结合。以下是配置方式：

### 1. 服务层抽象

我们通过创建 `SbService` 类来抽象 Storyblok API 的调用，该类扩展了基础服务类 `SbBaseService`：

```
// sbService.ts
import { StoryblokClient, ISbStoriesParams, ISbStoryParams } from '@storyblok/react';
import { SbBaseService } from './sbBaseService';

export class SbService extends SbBaseService {
  constructor({ client }: { client: StoryblokClient }) {
    super({ client });
  }
  
  // 各种特定的数据获取方法
  async getGlobalNav(params?: Partial<ISbStoriesParams>) {
    const res = await this.getStoryWithCache(`${this.region}configuration/global-nav`, params);
    if (!res) {
      console.error('No global nav data found');
      return;
    }
    return res?.content.items;
  }
  
  // 其他方法...
}
```

### 2. API 客户端实例

我们提供了一个预配置的 Storyblok 客户端实例，可以在整个应用中使用：

```
// sbApiClient.ts
import { apiPlugin, storyblokInit } from '@storyblok/react';
import { SbService } from './sbService';

const storyblokClient = storyblokInit({
  accessToken: process.env.STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: process.env.STORYBLOK_REGION || 'us',
  },
});

export const sbApiClient = new SbService({ client: storyblokClient });
```

## 实现模式

我们使用两种主要模式来集成 Storyblok 内容：

### 组件级集成

用于如 Header 和 Footer 等可重用 UI 组件，这些组件需要嵌入到多个页面中。

```
import { sbApiClient } from '@castlery/modules-cms-components';

async function GlobalNavWrapper() {
  const globalNavData = await sbApiClient.getGlobalNav();
  if (!globalNavData) return;
  return (
    <Suspense>
      <WebGlobalNav globalNavData={globalNavData} />
    </Suspense>
  );
}
```

> 如果消费了 sbapi 里数据的组件 不能拿去注册到sb组件中,不然会有依赖冲突

### 页面级集成

用于如博客文章、产品详情页等完整页面模板。

```
import { Container } from '@castlery/fortress';
import { sbApiClient, SbPage } from '@castlery/modules-cms-components';
import { createMetadata } from '@castlery/seo';
import { slugToName } from '@castlery/utils';
import { notFound } from 'next/navigation';
import React, { cache } from 'react';
import { PageClient } from './page.client';

export async function generateMetadata({ params }: { params: { rest: string[] } }) {
  const { rest } = params;
  const slug = rest[0];
  const data = await queryPageBySlug({ slug });
  const title = slugToName(slug);
  return createMetadata({
    title,
    description: data?.meta_data,
  });
}

// 测试页面  sg/interior-styling-service
export default async function Page({ params }: { params: { rest: string[] } }) {
  const { rest } = params;
  const data = await queryPageBySlug({ slug: rest[0] });
  if (!data) return notFound();
  return (
    <>
      {/* <JsonLd /> */}
      <PageClient />
      <Container disableGutters>
        <SbPage blok={data.content} />
      </Container>
    </>
  );
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const result = await sbApiClient.getRestPage(slug);
  return result;
});
```

```
'use client';

import { useAppStore } from '@castlery/shared-redux-store';
import { useRef } from 'react';

export function PageClient() {
  // const dispatch = useAppDispatch();
  const store = useAppStore();
  const initialized = useRef(false);

  if (!initialized.current) {
    // 如果要求组件在服务端要拿到接口进行渲染的话, 在page.tax(RSC)获取数据后
    // 在这里进行  store.dispatch 把数据注入到redux中
    // eg
    // store.dispatch(setShsopTheLookData(shopTheLook));

    initialized.current = true;
  }

  return null;
}
```

## 服务层抽象

我们的项目使用一个服务层来抽象所有与 Storyblok 的交互。这提供了几个好处：

1. - **中心化逻辑**：所有 Storyblok 相关逻辑都在一个地方
2. - **类型安全**：通过 TypeScript 接口为每个内容类型提供强类型支持
3. - **缓存控制**：统一管理缓存策略
4. - **错误处理**：集中的错误处理和日志记录
`SbService` 类包含多个专用方法来获取不同类型的内容：

```
// 全局导航
async getGlobalNav(params?: Partial<ISbStoriesParams>)

// 页脚数据
async getGlobalFooter(params?: Partial<ISbStoriesParams>)

// 博客文章列表
async getBlogPosts(params?: Partial<ISbStoriesParams>)

// 单篇博客文章
async getBlogPost(slug: string, params?: Partial<ISbStoryParams>)

// PLA布局
async getPlaLayout(variant: string, params?: Partial<ISbStoryParams>)

// 更多专用方法...
```

这种抽象使开发人员可以轻松找到和使用所需的数据获取方法，而不必担心底层的 Storyblok API 细节。

## 开发工作流

在开发或扩展 Storyblok 集成时，请遵循以下步骤：

1. - **在 Storyblok 中创建内容模型**:

- 在 Storyblok 的模式编辑器中定义内容结构
- 设置必要的字段和关系
2. - **在  Joyboy 项目中生成对应的类型文件**
```
pnpm exec nx run types:generate-sg:types
```

1. - **创建或更新服务层方法**:

- 在 `SbService` 类中添加或修改方法以获取新内容类型
- 确保正确定义 TypeScript 接口以提供类型安全
```
// 添加新的服务方法示例
async getNewContentType(slug: string, params?: Partial<ISbStoryParams>) {
  return await this.getStoryWithCache<NewContentTypeStoryblok>(
    `${this.region}path/to/content/${slug}`,
    params
  );
}
```
### 组件集成

TODO:

类似header这种消费 ,但是不会拿去注册到sb组件表里

### 页面集成

TODO

![](attachment)

页面使用验证

## 最佳实践

1. - **避免循环依赖**:

- CMS 组件不应直接消费 Storyblok API
- 如果组件需要外部数据，在更高级别获取数据并通过属性传递下去
2. - **合理使用服务器组件**:

- 利用服务器组件获取改进的性能
- 使用服务器组件处理初始数据获取
3. - **处理缓存策略**:

- 对于服务器端数据获取，使用 `getStoryWithCache` 方法
4. - **结构化的代码组织**:

- 将所有 Storyblok 相关服务保持在专用目录
- 遵循一致的命名模式
5. - **错误处理**:

- 为 Storyblok 内容实现适当的错误边界
- 如果内容加载失败，提供回退
```
// 错误处理示例
try {
  const data = await sbApiClient.getBlogPost(slug);
  if (!data) {
    return notFound();
  }
  // 渲染内容
} catch (error) {
  console.error('获取Storyblok内容失败:', error);
  return <FallbackComponent />;
}
```

## 常见问题处理

常见问题及解决方案：

1. - **组件获取不到数据**:

- 检查数据路径和 slug 是否正确
- 验证内容是否已发布或环境参数是否正确
2. - **循环依赖错误**:

- 重构组件以避免直接 API 调用
- 使用组合模式将数据从父组件传递下去
3. - **服务器/客户端组件错误**:

- 确保正确区分服务器组件和客户端组件
- 对客户端组件使用 `'use client'` 指令
## 未来改进

JoyBoy 项目中 Storyblok 集成的潜在增强：

1. - **实现内容预览 API**以改进编辑工作流
2. - **使用 Storyblok 的语言功能**添加国际化支持
3. - **优化组件加载**使用动态导入和 React.lazy
4. - **实现更健壮的缓存策略**用于生产环境
5. - **为 Storyblok 组件添加自动化测试**