---
confluence_id: "2791309383"
title: "技术方案 - Dynamic Yield"
status: current
parent_id: "2583822375"
depth: 1
domain: platform
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2791309383
local_joyboy_doc: null
blog_post: null
---
# 概述

## **背景**

Dynamic Yield 是一个领先的个性化平台，旨在通过个性化和优化用户体验来提高业务的数字营销和电子商务表现。**Dynamic Yield可以做什么？** 

- **合并跨渠道数据，为网站体验提供支持**。轻松收集、存储、分类和同步来自CRM、ESP、DMP、api等多个来源的数据，并创建一个内聚的数据集，用于支持网站个性化。
- **深入了解用户的DNA**。通过Audience Explorer对用户细分人群做实时分析和响应。基于过滤器(如设备、地理位置或复杂的自定义操作)查看用户的即时行为快照，了解每个人群细分对转化率或收入目标的贡献。
- **网站实时个性化活动。**通过个性化的内容或产品推荐来提高用户的参与度和现场体验，这些内容或产品推荐是为每个用户在浏览或与网站互动时量身定制的。
- **在用户期望的时候触发高度相关的消息。**利用实时行为和上下文数据或定义自定义事件来启动1:1的促销覆盖、退出意图弹出窗口、重要通知、社会证明消息等。
- **根据访问者的喜好动态调整网站布局。**重新排序网站上的元素，为每个访问者带来相关的产品或内容，简化参与度，并充分最大化整个页面以增加提升。
- **个性化广告**。Dynamic Yield 能够在不同的广告网络和渠道中提供个性化的广告投放，确保广告与用户兴趣高度相关，提高点击率和转化率。
## 现状

Castlery网站现阶段主要使用DY的几个模块： **Web Personalization Campaigns **、**Audience Hub**、**Data Feeds**。

- [**Web Personalization Campaigns**](https://castlery.atlassian.net/wiki/spaces/EC/pages/edit-v2/2791309383#%E7%BD%91%E7%AB%99%E4%B8%AA%E6%80%A7%E5%8C%96%E6%B4%BB%E5%8A%A8)：实现网站的个性化推荐和AB Test实验等。
- [**Audience Hub**](https://castlery.atlassian.net/wiki/spaces/EC/pages/edit-v2/2791309383#%E7%94%A8%E6%88%B7%E4%B8%AD%E5%BF%83)：对用户细分，以获取用户行为分析、收益分析等。
- **Data Feeds：**Product Data Feeds，将产品数据同步给DY，是DY个性化推荐的前提，也是收益、转化率等数据计算的基础。
### **Dynamic Yield 功能清单**

#### **网站个性化活动**

| **网站个性化活动类型**

Web personalization campaigns types | **用例**

Use Case | **例子**

Example | **实现** |
| Tips:  Client :仅在客户端可用;  Script-based：依赖于Script实现的功能。 |
| [Dynamic Content](https://support.dynamicyield.com/hc/en-us/articles/360021625514) | 用动态元素替换或添加任何页内元素。 |  | - Client
- Script-based |
| [Recommendations](https://support.dynamicyield.com/hc/en-us/articles/360022549294) | 根据用户活动和其他算法显示产品。 | 根据用户的喜好设置推荐策略，并根据他们的个人偏好和当前意图为每个访问者提供一组独特的产品显示在网站上。 | - Client+Server
- Script / API |
| [Overlay](https://support.dynamicyield.com/hc/en-us/articles/360021865974) | 在屏幕中间触发一个显眼的弹窗。 | 为添加商品到购物车，但没有结算准备离开的用户，弹出一个退出意图收集的弹窗。 | - Client
- Script-based |
| [Notification](https://support.dynamicyield.com/hc/en-us/articles/360022065193) | 在屏幕边缘触发通知消息（message、toast） | 向已向购物车中添加商品的访问者提供通知，告知他们距离免运费阈值还有多远。 | - Client
- Script-based |
| [Custom Code](https://support.dynamicyield.com/hc/en-us/articles/360022065213) | 在页面上执行任何Javascript代码（不可滥用） | 根据用户首选项更改导航栏的顺序。 | - Client
- Script-based |
| [Visual Edit](https://support.dynamicyield.com/hc/en-us/articles/360022065413) | 使用简单的编辑器编辑任何网站已有的页面。 | 编辑网站上文案和样式，调整元素顺序等。 | - Client
- Script-based |
| [Multi-Touch](https://support.dynamicyield.com/hc/en-us/articles/360021813013) | 允许跨页面或者漏斗实验，使用同一个变体分组。 | 在整个网站测试免费送货vs15%折扣。 | - Client
- Script-based |
| [API Custom Code](https://support.dynamicyield.com/hc/en-us/articles/9675296138525) | 基于DY动态收益测试和分配的力量，通过JSON数据完全控制活动如何在的网站上呈现 | AB test、营销活动实验等等 | - Client+Server
- API |


**Some Useful Cases**： [Campaign Tactical Guides](https://support.dynamicyield.com/hc/en-us/sections/360005081273-Campaign-Tactical-Guides)  （for business-side ）

#### 用户中心

| [**用户中心**](https://support.dynamicyield.com/hc/en-us/articles/360022734273-Audience-Hub)

Audience Hub |
| **功能** | - **用于制定实验体验** (例如，向过去购买过鞋子的用户展示新鞋系列的促销活动)。
- **用于制定推荐策略** （例如，为重复购买者的用户制定一个独特的策略）
- **分解报告数据 **(例如，查看按移动用户和桌面用户划分的A/B测试结果)。这是一种识别隐藏的个性化机会的好方法，即当特定用户表现出对一种变体的偏好时。
- **导出用户分组，推给第三方平台。** (例如，导出对鞋子感兴趣的用户的电子邮件地址，以便您可以在电子邮件平台/广告平台中针对他们发送营销)。 |
| **用户类型** | - **基于用户属性创建的用户分组:** 这是最广泛的受众类型，是基于逻辑和属性的任意组合构建的。
- **基于用户活动流量创建的用户分组:** 这种受众类型使您能够在用户进入您的网站的第一刻就将其包含在适当的受众中，这是基于将他们带到您的网站的获取活动。 |
| **DY的标准用户模型（DY算法产生的用户分组）** | ![](attachment) |


## **目标**

- **实现个性化网站，包括个性化内容推荐（产品推荐和内容推荐）、AB test 实验**。（Web Personalization Campaigns）
- **实现DY的多数据来源的数据同步（Data Feeds），以更好的支撑Dynamic Yield对用户数据的覆盖。**
- **实现自定义全局空白组**。（Group Control Group）
- **用户行为收集和分析。**完善用户在网站上的旅程分析。(Track Events)
- **与CMS、CRM、CDP、DMP等平台集成。**
- **个性化广告**。在不同的广告网络和渠道中提供个性化的广告投放，确保广告与用户兴趣高度相关，提高点击率和转化率。
## 技术背景

- 前端
Castlery电商平台，是建立于Next JS技术栈，支持客户端渲染CSR和服务端渲染SSR两种方式的网站。因此在集成Dynamic yield时，需考虑对不同渲染方式的支持。

# 网站集成方案

现有两种方式，可实现在网站上呈现DY的功能，**Script** 和 **Experience API，**如何选择呢？

## **Script or Experience API?**

| **方案** | **如何实现** | **SSR支持** |
| **Script** | 将Dynamic Yield脚本放在网站上，用于收集信息，并呈现一对一个性化、细分行为目标、测试和优化等活动。 | **Client Only** |
| **Experience API** | 在网站代码调用server-side Experience API端点，以获得和**Script**方式提供的相同的个性化和数据收集功能。 | **Both Client and Server** |
| **官方推荐**

 

**采纳官方推荐方案** | **两种方式同时在代码中集成。**

在网站上，可以在基于scripts的客户端实现的同时，使用experience api。例如，可以在客户端实现脚本和事件，但通过服务器端实现运行全部(或部分)活动。

![](attachment) | **Both Client and Server** |


## **Script**、**Experience API **职责分布

详细了解各模块的功能和使用方法，查看[网站个性化活动](https://castlery.atlassian.net/wiki/spaces/EC/pages/edit-v2/2791309383#%E7%BD%91%E7%AB%99%E4%B8%AA%E6%80%A7%E5%8C%96%E6%B4%BB%E5%8A%A8)

```
模块/功能              | Script   | Experience API
----------------------|----------|----------------
网站数据监测            |  ██████  | 
用户行为收集            |  ██████  |     
Dynamic Content       |  ██████  |  
Notification          |  ██████  |  
Custom Code           |  ██████  |  
Overlay               |  ██████  |  
Multi-Touch           |  ██████  |  
Recommendations       |  ██████  |    ██████   
Api custom code       |          |    ██████   
CMS                   |          |    ██████
```

# 功能模块设计

| **功能模块** | **备注** |
| [**Dynamic Yield Script**](https://castlery.atlassian.net/wiki/spaces/EC/pages/edit-v2/2791309383?draftShareId=75f6c0d5-1c94-45fb-a06d-d6a411a4450e#Dynamic-Yield-Script) |  |
| **Experience API** |  |
| **Page context ** |  |
| **Dynamic Yield Cookies** |  |
| **Tracking Events -** |  |
| **Global Control Group-GCG** |  |
| **CMS Integration** |  |
| **Data Feeds** | - Product Data Feeds
- User Data Feeds |


## 功能模块-技术侧

### **Dynamic Yield Scripts**

**在网站集成DynamicYield Scripts （Client Only）**

在Castlery网站页面上注入Scripts，Scripts将调用DY服务器来设置网站上的用户和站点数据。同时Scripts从CDN加载DY的收集脚本，收集脚本执行所有数据收集。从而实现DY一对一个性化、细分行为目标、测试和优化等功能。

 可在on-page API（window.DYO）中访问DY数据。

 根据官网最佳实践提示：

1. - 将script标签直接嵌入网站代码中，不要将脚本通过第三方脚本管理器（GTM等）引入，避免闪烁。
2. - 避免将脚本配置为异步运行（async），以防出现不可预测的问题。Dynamic Yield提供了高服务器冗余率和快速加载时间，无需在代码中异步引入。
#### **1 封装DYResourceTag组件**

将DY的资源脚本等封装成`DYResourceTag`组件，在想要包含在个性化程序中的任何页面调用`<DYResourceTag />`，网站用户的活动将会被跟踪，并可在客户端通过`window.DY/window.DYO`实现对DY功能的访问。

> **DyPreloadResources **

`在Next14 App Router模式下，不支持使用<Head><link/></Head>为html注入link，可选择使用自定义Metadata，但preconnect和prefetchDNS类型的metadata还未被支持，所以按官方文档推荐的方式ReactDOM.preconnect/ReactDOM.prefetchDNS注入link。`

Doc

注意：需要在'use-client'的组件内使用这些方法，在初始页面加载时仍然是服务器端呈现的。也就是SSR时，会执行此代码，并在html中插入links，只是在客户端才发出link资源加载的请求。

如何判断资源是否成功加载？在浏览器打开network，查看st.dynamicyield.com等脚本是否请求成功，并查看_dy_id等cookie是否在.castlery.com域名下设置成功。 

```
'use client';
import ReactDOM from 'react-dom';

export const DyPreloadResources = () => {
  ReactDOM.preconnect('//rcom.dynamicyield.com');
  ReactDOM.prefetchDNS('//cdn.dynamicyield.com');
  ReactDOM.prefetchDNS('//st.dynamicyield.com');
  ReactDOM.prefetchDNS('//rcom.dynamicyield.com');
  return null;
};
//如何判断资源是否成功加载？
//在浏览器打开network，查看st.dynamicyield.com等脚本是否请求成功
```

**Scripts** 

DY通过执行网站页面注入的以下Scripts，发出请求，加载更多关联脚本。

查看更多DY脚本的功能摘要： 

```
'use client'
export const ResourceTag = ({ recommendationContext }: DYResourceTagProps) => {
  return (
    <Fragment>
      <DyPreloadResources />
      {/* ========================================= Inline Script ======================================== */}
      {/* https://dy.dev/docs/code-context */}
      <Script type="text/javascript" strategy="beforeInteractive">
        {`
          window.DY = window.DY || {};
          DY.recommendationContext = ${recommendationContext};
        `}
      </Script>
      {/* ========================================= Scripts ======================================== */}
      {/* Dynamic Yield injects scripts inside your website only within the body tag. Any element placed outside of it would violate the HTML doc definition and could result in unexpected behavior across browsers. */}
      {/* Avoid configuring scripts to run asynchronously. reference https://dy.dev/docs/implement-script#best-practices */}
      {/* What do these scripts do? reference https://dy.dev/docs/implement-script#experiment-scripts */}
      {/* Implementing api_static and api_dynamic on the page will render the campaigns on your site. */}
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src={`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_dynamic.js`}
      />
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src={`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_static.js`}
      />
    </Fragment>
  );
};
```

#### 2 使用**DYResourceTag为页面注入DY Scripts**

在页面调用`<DYResourceTag recommendationContext={recommendationContext} />`,即可为页面注入DY 资源。

```
export default async function HomePage() {
  const recommendationContext = DYConfigurations.get(DYPageTypes.HOME).recommendationContext();
  return (
    <React.Fragment>
      <DYResourceTag recommendationContext={recommendationContext} />
      <Typography>Home Page</Typography>
    </React.Fragment>
  );
}
```

#### 3 DY Scripts的功能和执行顺序

- 在页面上注入`api_static.js`和`api_dynamic.js`,即可在网站上呈现在DY dashboard 配置的Campaigns。
- 集合注入默认调用`st.dynamicyield.com/st`，它将返回用户和网站数据，并加载DY的收集脚本`dy-coll-nojq-min.js`。
- 收集脚本触发`async-px.dynamicyield.com`调用，向服务器报告收集端点。
![](attachment)

### **Experience APIs**

**在网站集成Experience API** （Client & Server）

Experience api使您能够通过服务器端api实现Dynamic Yield。这些api涵盖了实现的所有方面，从跟踪页面浏览量、分配目标体验、跟踪点击和事件。

#### **1 Experience API 接口文档**

 

#### 2 Experience API 开发指引



 

客户端client和服务器端server API调用的url是不同的:

| **US Server** | **Base Url** |
| **Client** | `https://direct.dy-api.com/v2/` |
| **Server** | `https://dy-api.com/v2/` |


| **EU Server** | **Base Url** |
| **Client** | `https://direct.dy-api.eu/v2/` |
| **Server** | `https://dy-api.eu/v2/` |


##### 1 封装 `dyCampaignsFetcher` ，调用experience api

- **Feature：**获取campaigns数据，包括AB test、recommendations等
- **API：(EU server下需要更换base url )**

- **Client：**`POST https://direct.dy-api.com/v2/serve/user/choose`
- **Server ：**`POST https://dy-api.com/v2/serve/user/choose`
```
/**
 * @description Fetcher for dy to fetch campaigns data,based on `API /serve/user/choose`
 * @doc https://dy.dev/docs/best-practices-for-experience-apis-implementation
 * @example
 * ```ts
 *  dyCampaignsFetcher({
 *    recommendationContext,
 *    campaignNames,
 *    //...
 * })
 * ```
 */
export const dyCampaignsFetcher = async (
  {
    recommendationContext,
    campaignNames,
    campaignGroups = [],
    realtimeFilters,
    customPageAttributes = {},
    locale = 'en',
    pathname,
    query,
  }: CampaignsRequestOptions,
  cookies?: Function
) => {
  //服务端渲染时，需要传入cookies
  if (IS_SERVER && !cookies) {
    throw new Error('[dyCampaignsFetcher Error][Server-side]: cookies is required');
  }
  const payload = generateDyPayload(
    {
      recommendationContext,
      campaignNames,
      campaignGroups,
      realtimeFilters,
      customPageAttributes,
      locale,
    },
    cookies || null
  );
  return await fetch(`${IS_SERVER ? DY_BASE_URL.SERVER : DY_BASE_URL.CLIENT}serve/user/choose`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'dy-api-key': IS_SERVER ? DY_API_KEYS.sg.test.server : DY_API_KEYS.sg.test.client,
    },
    body: JSON.stringify(payload),
  });
};
```

##### 2 在Redux中缓存Campagins数据(部分缓存)

---

---

TODO：待补充

---

---

#### 3 Experience API - Realtime Data Filter Rules

**当我们在网站上调用Experience Api时，可设置Filter Rules，来实时过滤会话中获得的实时数据结果。**例如，在Product Recommendation Campaign 中，通过设置Filter Rules，来显示价格高于当前查看产品的产品或基于用户明确选择的当前产品。我们也可以通过Client Script返回实时过滤器数据。

常见的用例包括：

![](attachment)

在设置推荐策略Recommendations strategy时，可以添加过滤规则Filter Rules来定制推荐算法。可以通过使用Exclude或Include规则来保证某些产品被包含或排除在外。

查看： [过滤规则说明](https://support.dynamicyield.com/hc/en-us/articles/360022549994-Recommendation-Custom-Filter-Rules)

查看：[filter rules api doc](https://support.dynamicyield.com/hc/en-us/articles/4414496292497-Return-Recommendations-Real-time-Filter-Data#return-recommendations-real-time-filter-data-0-0)

```
export interface RealtimeFilters {
  [campaignName: string]: {
    realtimeRules: Array<{
      id?: number /**Client-side API only. The unique ID number for every rule. This ID is used in the API response (if 2 rules have the same ID, the second rule is dropped). */;
      type: 'include' | 'exclude';
      slots: number[]; //int
      query: {
        /** conditions is 'and' */
        conditions: Array<{
          field: string /** Field within the returned results to apply the query for. */;
          /** A list of arguments for a query condition. */
          /** arguments is 'or' */
          arguments: Array<{
            action: 'IS' | 'IS_NOT' | 'CONTAINS' | 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE';
            value: string;
          }>;
        }>;
      };
    }>;
  };
}
```

### Page Context Rules

页面上下文Page Context是网站传递给DY的关于网站的每个页面的上下文信息。此信息用于定位(例如，在购物车页面上使用覆盖)，将用户划分为受众(例如，查看特定类别的用户)以及DY的其他基本功能。可以在站点的标记中手动实现页面上下文，也可以根据DY控制台中定义的规则自动实现上下文。

#### **1 页面上下文包含属性**

1. - 页面类型和属性：例如，确定该页面是网站主页还是类别页面(例如，鞋子或高级卡)。页面属性因行业而异（[Castlery归属于电商行业](https://dy.dev/docs/page-context#page-context-for-e-commerce)）。页面类型必须全大写。
2. - 本地化：用户当前正在查看此页的语言或地区。这是可选的，只有当你的网站是多语言的。
#### **2 页面上下文的PageType和Attributes的取值**

![](attachment)

#### **3 如何在代码中设置页面上下文**

**(已经封装进DYResourceTag)**

```
<Script type="text/javascript" strategy="beforeInteractive">
    {`
      window.DY = window.DY || {};
      DY.recommendationContext = ${JOSN.stringify(recommendationContext)};
    `}
</Script>
```

### **Dynamic Yield Cookies**

#### 1 Dynamic Yield Cookies

当网站中集成了Dynamic yield，DY（主要是DY scripts）会在网站种植cookies，以做用户识别等，来完成DY的功能。**DY cookies 主要存储于dynamicyield.com的域名下，对Castlery网站来讲，属于第三方cookie**。由于浏览器已经开始对第三方cookie功能施加限制。2019年，Safari开始强制第三方cookie的有效期为7天，Firefox开始默认阻止它们。在2024年第一季度，Google Chrome开始默认阻止1%的用户的第三方cookie，并在2024年下半年增加到所有用户（截止目前，谷歌已经放弃弃用第三方cookies）。**DY推荐实现第一方cookie，解决第三方cookie浏览器限制。**

了解DY设置了哪些cookies、cookies的存储位置及功能？

  

#### 2 Dynamic Yield Cookies对于功能的影响

如果没有DY cookies用于识别，访问者被认为是新用户。在Safari中，这发生在最近一次访问7天后，如果cookie被完全阻止，访问者在每次页面浏览时都被视为新用户。这意味着:用户数量膨胀，A/B测试中的变化粘性破裂，分离的历史数据等等。

要克服这一限制，必须从服务器提供DYID cookie（**_dyid_server**），使其成为不受新限制影响的第一方cookie。

#### 3 Cookies解决方案

当用户访问Castlery网站时，网站加载DY Scripts，DY scripts注入cookies到浏览器，Dynamic yield 会为用户生成一个`cookie:_dyid；domian: dynamicyield.com`,` cookie:_dyid；domian: castlery.com;`用于持续标记用户（DY会将_dyid同时存储于两个域名下）。**为突破第三方cookie限制，我们将根据DY指引，复制_dyid为_dyid_server，由服务端返回，并种植在浏览器castlery.com域名下，作为第一方cookie使用。**

- 根据DY的方案，DY Scripts并不依赖_dyid来识别用户，而是依赖_dyid_server。
- 在Experience api调用时，我们同时传递_dyid、dyid_server作为用户身份标识。
```
user: {
      dyid: dyCookieHandler.get(DY_COOKIES.DY_ID),
      dyid_server: dyCookieHandler.get(DY_COOKIES.DY_ID_SERVER),
  },
```

| **这个解决方案是如何工作的:**

1. - 一个访问者进入你的网站。
2. - 您的服务器(Server-Side)收到浏览器访问网页的请求。
3. - 应用服务器执行以下步骤:

1. - 检查请求是否包含_dyid cookie。
2. - 如果找到了_dyid cookie，它将其复制为一个新的_dyid_server cookie。返回新的cookie在响应头中，有效期为1年。这将其设置为访问者浏览器中的服务器端第一方cookie，不受cookie过期强制执行的影响。(注意_dyid cookie会继续被返回，这应该不会改变)。
4. - DY的脚本现在使用_dyid_server cookie在网站页面上运行。这样，即使用户超过7天没有访问您的网站，也不会丢失返回的用户数据。
5. - 注意，如果网站启用了Active Cookie Consent，那么等待同意对象并对其结果采取行动是很重要的。否则，您可能会为选择退出的用户编写cookie。 |
| ![](attachment) |


#### 4 代码实现

**1 server-side 、client-side 对cookie的访问和操作**

由于服务器端渲染（SSR）在 Node.js 环境中运行，因此无法直接使用浏览器的 document.cookie。所以, 引入cls-hooked，通过访问请求上下文（request headers/response headers），实现服务端对cookie的访问和操作。

> 在Server-side获取cookies，需要依赖于Request上下文，对于SSR时，DY cookies的获取，依赖 next/headers 实现。

**cookie-next访问服务端cookie：**

```
// middleware.ts or api/route.ts
getCookie('nothing', {req,res}); 

// server component
import {cookies} from "next/headers"
getCookie('nothing', {cookies});
```

**2 将三方cookie实现为一方cookie**

在Next middleware.ts中，检测请求头中的cookie _dyid，并复制为名为_dyid_server的cookie，携带在响应头中返回，由浏览器设置在用户浏览器castlery域名下的cookie存储中。

```
// apps/web/middleware.ts
export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  const requestCookies = request.cookies;
  const reqDyid = requestCookies.get('_dyid');
  const reqDyidServer = requestCookies.get('_dyid_server');
  if (reqDyid && (!reqDyidServer || reqDyidServer !== reqDyid)) {
    response.cookies.set('_dyid_server',reqDyid,{
      expires: new Date(Date.now() + 31540000000000), // Set a 1 year expiration for the new cookie
    })
  }
  return response;
}
```

在网站Network面板查看response 响应头中是否携带cookie `_dyid_server`，并在网站上打开Application > cookies查看是否有成功种植cookie `_dyid_server` 在catslery.com域名下。

### 高阶组件HOC - withDynamicYield （推荐使用）

在以上部分我们封装了`DyResourceTag`、`dyCampaignsFetcher`、`dy cookies`等基础原子方法。在这些方法基础上，封装高阶组件`withDynamicYield`，实现简洁配置、一键调用。

#### **1 功能有哪些？**

| **Hoc withDynamicYield -Features** |
| 默认自动注入DyResourceTag到页面html中，无需手动引入，且可传参禁止默认行为 |
| 自动调API获取campaigns数据,并且默认注入campaigns result data 到组件中。 |
| 内置SSR场景下cookies的处理函数。 |
| Client- Side中，使用`useSWR`对 campaigns api数据缓存。 |


#### **2 **如何使用

```
// 接口返回的dy数据，自动注入到组件中
interface CampaignsData {
  campaigns: {
    [campaignName: string]: any;
  };
  error?: string;
  loading?: boolean;
}
interface DemoPageOwnProps {
  params: {
    locale: string;
    region: string;
  };
}
async function DemoPage({ params, campaigns }: DemoPageOwnProps & CampaignsData) {
  return (
    <React.Fragment>
      <Typography>Demo Page</Typography>
    </React.Fragment>
  );
}
// 使用withDynamicYield函数实现，自动引入DYResourceTag+自动调API获取数据的功能
export default withDynamicYield({ campaignNames: ['campaign1'] })(DemoPage);
```

#### **3 **代码实现

 client hoc待修改：TODO  

```
// client 
'use client';
export const withDynamicYieldClient =
  (
    options: CampaignsRequestOptions,
    extraOptions?: {
      withResoureTag?: boolean;
    }
  ) =>
  (Component: ComponentType<any>) => {
    const _withResoureTag = extraOptions?.withResoureTag || true;
    return (props: { fallbackKey?: string | any[] | Function } & any) => {
      const [data, setData] = React.useState(null);
      const [error, setError] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const fallbackKey = props.fallbackKey || '/api/dy-campaigns';

      React.useEffect(() => {
        const { data, error } = useSWR(fallbackKey, () => dyCampaignsFetcher(options));
        setLoading(false);
        if (error) {
          setError(error);
        }
        if (data) {
          setData(data as any);
        }
      }, [fallbackKey]);
      return (
        <React.Fragment>
          {_withResoureTag && (
            <DYResourceTag recommendationContext={options.recommendationContext || { type: DYPageTypes.OTHER }} />
          )}
          <Component {...props} campaigns={data} error={error} loading={loading} />;
        </React.Fragment>
      );
    };
  };
```

```
// server
export const withDynamicYieldServer =
  (
    options: CampaignsRequestOptions,
    extraOptions?: {
      withResoureTag?: boolean;
    }
  ) =>
  (Component: ComponentType<any>) => {
    const _withResoureTag = extraOptions?.withResoureTag || true;

    return async (props: any) => {
      const res = await dyCampaignsFetcher(
        {
          ...options,
          locale: props?.params?.locale,
        },
        cookies
      );
      const result = {
        data: null,
        error: '',
      };
      if (!res || !res.ok) {
        result.error = 'Failed to fetch';
      }
      if (res.ok) {
        result.data = await res.json();
      }
      return (
        <React.Fragment>
          {_withResoureTag && (
            <DYResourceTag recommendationContext={options.recommendationContext || { type: DYPageTypes.OTHER }} />
          )}
          <Component {...props} campaigns={result.data} error={result.error} />
        </React.Fragment>
      );
    };
  };
```

```
export const withDynamicYield = IS_SERVER ? withDynamicYieldServer : withDynamicYieldClient;
```

### 用户行为收集 - Tracking Events

我们可以在网站上使用window.DYO或者调用Experience API来实现对用户行为的跟踪，Dynamic Yield提供了各种预定义的事件模式，或者我们可以创建自己的事件模式。我们还可以使用像素跟踪“场外”触发的自定义事件。

#### 1 多渠道用户身份识别码统一（重要）

**用户身份识别码**：用于在网站上任何时刻识别访问者，例如在结账过程中。可以是散列的电子邮件地址（sha256 hashed email）、散列的电话号码或您定义的自定义ID(user-id)。当一个用户多次使用相同的标识符进行标识时，他们的历史记录、关联配置文件和受众成员关系将是统一的。

为此，**每个跟踪事件必须使用一致的用户标识。由于DY可以合并跨渠道数据，比如收集、存储、分类和同步来自CRM、ESP、DMP、API等多个来源的数据，并创建一个内聚的Customer数据集，所以需要保持多渠道用户身份识别码统一。**

**用户识别码可以有哪些？**

![](attachment)

由于Castlery网站，以及在多个第三方服务（yotpo 、klaviyo等）中，用户身份标识使用的均是email，所以我们选择**hasedEmail**作为DY平台的唯一用户身份识别码。

```
const hasedEmail = window.DYO.dyhash.sha256(email.toLowerCase())
```

> 为什么是hashedEmail而不是email？

因为在与第三方服务数据共建时，我们通常会出于数据安全问题，避免暴露用户隐私等，做数据混淆，hashedEmail是数据混淆的一部分。

DY可以通过hashedEmail命中网站上的用户，但DY并不知道用户的真实信息。

#### 2 标准事件

DY已经制定了一系列电商平台的标准事件，并根据对用户事件的跟踪，来分析用户在网站的行为、偏好、用户旅程、收益等等。

事件跟踪有意义的用户交互(例如购买、添加到购物车、表单完成或对产品进行评级)，因此可以将这些信息用于行为定位、报告、设置优化目标、推荐和构建受众。每当一个定义的行为发生时，一个事件就会被“触发”到Dynamic Yield，使DY系统能够在我们的个性化网站中使用这些信息。

**查看全部标准事件和事件的用途：** 

![](attachment)

**举例说明：**

**事件名称：Add to Cart**

**触发时机：**用户向购物车中添加了一项商品。

**用途：**向购物车中添加物品通常被用作优化目标，并有助于用户的亲和力配置文件。

**注意：**登录、注册、识别用户和时事通讯订阅事件都用于将当前设备和会话连接到用户的配置文件，从而实现统一的多渠道体验。
每个事件都必须包含本节中使用的唯一标识符，该标识符可以是散列电子邮件地址、散列电话号码或自定义ID。我们使用**hashedEmail**。

#### 3 事件handlers

跟踪事件执行流程：

** 1 基础事件**`dyAddToCartTrigger`**开发(举例ATC)**

```
export const dyAddToCartTrigger = (args: DyAddToCartArgs): DyAddToCartEvent => {
  return {
    name: DyMetrics.add_to_cart,
    properties: {
      dyType: 'add-to-cart-v1',
      ...findItemFromOrder(args.currentItemId, args.order),
      cart: formatCart(args.order),
    },
  };
};
```

**2 在 **`DtManager`类**中增加DY渠道的事件跟踪方法**`trackDy` 

 无需每个事件增加`trackDy`，仅需要每个渠道配置一次

```
export class DtManager {
    //...
    trackDy(triggerName: (typeof EventsNames)[keyof typeof EventsNames]) {
      const trigger = TriggersMap[triggerName];
      return (eventData: Record<string, any>) => {
          if (window && (window as any).DY) {
            (window as any).DY.API('event', trigger(eventData as any));
          } else {
            throw Error('[DT Error] => window.DY is not defined');
          }
      };
  }
}
const dt = new DtManager();
export default dt;
```

**3 增加**`trackDyAddToCart`**事件的adapter**

在adapters读取store数据，返回事件参数，事件执行流程：page->adpaters->dtmanager->dy

```
/**
 * triggered when user added an item to the cart.
 */
export const trackDyAddToCart = createAsyncThunk('tracking/trackDyAddToCart', (_, { getState, rejectWithValue }) => {
  const rootState = getState() as any;
  const order = selectOrder(rootState);
  const currentItemId =
    Array.isArray(order?.line_items) && order?.line_items?.length > 0
      ? order?.line_items[order.line_items.length - 1]?.variant.sku
      : '';
  if (!currentItemId) {
    return Promise.resolve();
  }
  try {
    dt.trackDy(EventsNames.EVENT_DY_ADD_TO_CART)({
      currentItemId: currentItemId,
      order,
    });
    return Promise.resolve();
  } catch (e) {
    return rejectWithValue(e);
  }
});
```

**4 在页面用户交互时，触发事件跟踪**

```
// /pdp/page.tsx
export function PdpPage (){
  const onAtc = async() => {
    await fetch('post',xxxxx',{...})
    await dispatch(trackDyAddToCart())
  }
  return (
    <Button onClick={onAtc}>Add to Cart</Button>  
  )
}
```

### Global Control Group-GCG

在Dynamic YieldA/BTest中，默认是对所有流量进行实验的，我们可以通过设置cookie:`_dy_cs_gcg`,来控制哪些流量不参与DY实验。

**官方提供两种方案实现：**

[**Global Control Group guide for sections using API Campaigns **](https://support.dynamicyield.com/hc/en-us/articles/10371869422621-Global-Control-Group-guide-for-sections-using-API-Campaigns)[ ](https://support.dynamicyield.com/hc/en-us/articles/10371869422621-Global-Control-Group-guide-for-sections-using-API-Campaigns)

[**Global Control Group guide for sections with (only) script-based campaigns**](https://support.dynamicyield.com/hc/en-us/articles/6756764980893-Global-Control-Group-guide-for-sections-with-only-script-based-campaigns)

为满足Client和Server两种渲染场景，同时，我们使用Experience apis来实现AB test，所以我们选择使用[**Global Control Group guide for sections using API Campaigns**](https://support.dynamicyield.com/hc/en-us/articles/10371869422621-Global-Control-Group-guide-for-sections-using-API-Campaigns)方案来完成全局空白组的设置。

#### 1 如何实现

我们采用官方方案中的**Option B：在发出其他API请求之前，为GCG发出API请求，即在发出experience API 请求前，检测是否存在cookie：**`_dy_cs_gcg`**，如果未存在，则先执行GCG请求，在响应时种植cookie到浏览器。**

cookie取值：

```
{"_dy_cs_gcg":"Dynamic Yield Experiences"} //可在dy设置分组流量占比 
{"_dy_cs_gcg" : "Control" }
```

具体操作步骤查看 

代码实现：

```
//官方提供的名字Global Control Test
export const GCGSelectorName = 'Global Control Test';
export const dYGlobalControlCheck = (cookies?: any) => {
  const gcgCookie = makePersistenceHandles().dyGlobalControlGroup.getItem(cookies ? { cookies } : {});
  if (!gcgCookie || gcgCookie === 'undefined') {
    const url = `${IS_SERVER ? DY_BASE_URL.SERVER : DY_BASE_URL.CLIENT}serve/user/choose`;
    const payload = generateDyPayload(
      {
        campaignNames: [GCGSelectorName],
      },
      cookies || null
    );
    return fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'dy-api-key': IS_SERVER ? DY_API_KEYS.sg.test.server : DY_API_KEYS.sg.test.client,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const gcg = res?.choices[0]?.variations[0]?.payload?.data?._dy_cs_gcg;
        makePersistenceHandles().dyGlobalControlGroup.setItem(gcg, {
          ...(cookies ? { cookies } : {}),
          expires: new Date(Date.now() + 31540000000000),
        });
        return gcg;
      });
  }
  return Promise.resolve(gcgCookie);
};
```

## Data Feeds -业务侧

Data Feeds

 

| **Data Feeds** | **Feature ** | **Reference** |
| **User Data Feeds** | optional

给DY同步包含自定义用户属性的用户数据。比如用户在yotpo的积分、GA捕捉到的用户偏好的商品类型等等，用于丰富DY维护的customer database,更好的做用户分组和个性化实验。 |  |
| **Production Data Feeds** | required 

 同步产品数据到DY，DY推荐功能都以此数据为基础。比如在购物车推荐用户标记过喜欢的商品，或者推荐和用户购物车商品类似的商品等。 |  |


## CMS集成 - 技术&业务 In progress

详见精细化运营模块。



# 参阅

#### 用户身份识别

#### Web Personalization Campaigns教程

#### Dynamic Yield有什么功能