---
confluence_id: "3031760934"
title: "技术方案-CA -Teaser Page"
status: current
parent_id: "2583822375"
depth: 1
domain: product
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3031760934
local_joyboy_doc: null
blog_post: null
---
## 1 Introduction

### 1.1 Purpose

- PRD

-
- 
### 1.2 Scope

- Teaser Page 静态页面开发和部署
- Klaviyo 邮件订阅集成
- Storyblok CMS 内容管理集成
- 性能优化和监控策略
### 1.3 Goals

- 页面加载时间 < 2 秒
- 邮件订阅转化率 > 30%
- 系统可用性 > 99.9%
- 移动端访问占比 > 60%
- 邮件打开率 > 25%
- 邮件点击率 > 15%
## 2 System Context (Level 1)

### 2.1 System Overview

```
C4Context
    Person(customer, "Potential Customer", "Views teaser page and subscribes")
    Person_Ext(marketing, "Marketing Team", "Configures content and campaigns")

    System(teaser, "Teaser Website", "Next.js site with ISR serving CA market entry page")
    
    System_Ext(storyblok, "Storyblok CMS", "Manages and delivers content")
    System_Ext(klaviyo, "Klaviyo", "Email marketing platform")
    System_Ext(ga, "Google Analytics", "Analytics platform")

    Rel(customer, teaser, "Views and subscribes")
    Rel(marketing, storyblok, "Configures content and embedded Klaviyo form")
    Rel(marketing, klaviyo, "Sets up forms and email flows")
    Rel(marketing, ga, "Monitors metrics")
    Rel(teaser, storyblok, "Fetches content at build/revalidate")
    Rel(teaser, klaviyo, "Embeds sign-up form")
    Rel(teaser, ga, "Sends analytics data")
```

### 2.2 Key Users

- **营销团队:**

- 在 Storyblok 中配置页面内容
- 在 Klaviyo 中配置表单和邮件流程
- 通过 GA 和 Klaviyo 监控转化指标
- **潜在客户:** 访问预热页面并订阅新市场通知
### 2.3 External Systems

- **Storyblok:**

- 管理页面内容
- 配置 Klaviyo 表单嵌入
- 管理隐私政策页面内容
- **Klaviyo:**

- 提供邮件订阅表单
- 管理邮件营销流程
- 提供订阅相关指标
- **Google Analytics:**

- 跟踪页面访问和用户行为
- 提供转化漏斗分析
## 3 Container (Level 2)

### 3.1 Container Diagram

```
C4Container
    title Container diagram for Teaser Page System

    Person(customer, "Potential Customer", "Views and subscribes")
    Person_Ext(marketing, "Marketing Team", "Manages content and campaigns")
    
    Container_Boundary(webApp, "Next.js Application") {
        Container(pages, "Pages", "Next.js ISR", "Teaser and privacy pages with ISR")
        Container(storyblokClient, "Storyblok Client", "TypeScript", "Fetches and caches content")
        Container(klaviyoForm, "Klaviyo Form", "Embedded Script", "Email sign-up form")
    }
    
    System_Ext(storyblok, "Storyblok CMS", "Content management")
    System_Ext(klaviyo, "Klaviyo", "Marketing automation")
    System_Ext(ga, "Google Analytics", "Analytics")
    
    Rel(customer, pages, "Visits /ca")
    Rel(marketing, storyblok, "Configures content")
    Rel(pages, storyblokClient, "Uses")
    Rel(storyblokClient, storyblok, "Fetches content at build/revalidate")
    Rel(klaviyoForm, klaviyo, "Sends sign-ups")
    Rel(pages, ga, "Sends analytics")
```

### 3.2 Technologies

- **Next.js App:**

- Next.js 14 with ISR
- React & TypeScript
- Storyblok SDK
- Klaviyo Form Integration
- **External Services:**

- Storyblok CMS
- Klaviyo Marketing Platform
- Google Analytics 4
### 3.3 Router Design

- **主要路由:**

- `/ca`: Teaser Page
- `/ca/privacy-policy`: Privacy Policy 

- eg:
- `/ca/terms-of-use`: Terms of Service 

- eg:
> - 其他页面都不给访问，直接都返回 redirect to /ca page
- 到时layout会不一样，因为我们没有具体的header和 footer信息

- **CloudFront 路由规则:**

- 将 `www.castlery.com/ca*` 的请求路由到 joyboy-web-prod-ca
## 4 Component (Level 3)

### 4.1 Component Diagram

```
C4Component
    title Component diagram for Static Web Application

    Container_Boundary(webApp, "Static Web Application") {
        Component(teaserPage, "Teaser Page", "Next.js Page", "Main landing page")
        Component(privacyPages, "Privacy Pages", "Next.js Pages", "Privacy related pages")
        Component(teaserLayout, "Teaser Layout", "React", "Simplified layout without global header/footer")
        
        Component(storyblokManager, "Storyblok Manager", "React SDK", "Manages content state")
        Component(klaviyoForm, "Klaviyo Form", "Embedded Form", "Email sign-up form")
        Component(gaTracker, "GA Tracker", "GA4", "Tracks analytics")
    }

    System_Ext(storyblok, "Storyblok CMS", "Content")
    System_Ext(klaviyo, "Klaviyo", "Marketing")
    
    Rel(teaserPage, storyblokManager, "Gets content")
    Rel(privacyPages, storyblokManager, "Gets content")
    Rel(teaserPage, klaviyoForm, "Embeds")
    Rel(storyblokManager, storyblok, "Fetches content")
    Rel(klaviyoForm, klaviyo, "Submits sign-ups")
```

### 4.2 Key Components

1. - **页面组件**

- Teaser Page (`/ca`)
- Privacy Pages
- Simplified Layout
2. - **集成组件**

- Storyblok Content Components
- Klaviyo Sign-up Form
- GA Tracker
## 5 AWS Deployment Architecture

### 5.1 Infrastructure Diagram

```
graph TB
    subgraph "AWS Global Edge"
        CF[CloudFront]
        R53[Route 53]
    end

    subgraph "AWS Region"
        subgraph "VPC"
            subgraph "Public Subnet"
                ALB[Application Load Balancer]
            end
            
            subgraph "Private Subnet"
                ECS[ECS Service]
                subgraph "ECS Tasks"
                    App[Next.js App]
                end
            end
        end
        
        S3[S3 Static Assets]
    end

    R53 --> CF
    CF --> ALB
    CF --> S3
    ALB --> App
    
    classDef aws fill:#FF9900,stroke:#FF9900,color:white;
    class CF,R53,ALB,ECS,S3 aws;
```

## 6 Implementation Approach

### 6.1 Development Phases

1. - **Phase 1 - 基础设施**

- AWS S3 + CloudFront 配置
- CI/CD 流程建立
- 监控系统搭建
2. - **Phase 2 - 核心功能**

- Teaser Page 开发
- Storyblok 组件开发
- Klaviyo 表单集成
3. - **Phase 3 - 优化**

- 性能优化
- SEO 优化
- 分析工具集成
### 6.2 Key Considerations

1. - **性能优化**

- 静态页面生成 (SSG)
- CDN 分发
- 图片优化
- 代码分割
2. - **内容管理**

- Storyblok 组件设计
- 内容编辑流程
- 多语言支持
3. - **监控告警**

- 性能监控
- 错误追踪
- 用户行为分析
- 业务指标
## 7 Key Code Components

### 7.1 Teaser Page Component

### 7.2 Layout Component

## 8 Risk Management

| 风险 | 影响 | 缓解措施 |
| 性能问题 | 高 | SSG + CDN |
| 内容更新延迟 | 中 | ISR + 合理的缓存策略 |
| CMS 服务可用性 | 中 | 静态生成 + 降级方案 |
| 表单集成故障 | 中 | 客户端错误追踪 + 用户反馈提示 |


## 9 Success Metrics

### 9.1 Technical Metrics

- 页面加载时间 < 2 秒
- First Contentful Paint < 1 秒
- 累计布局偏移 (CLS) < 0.1
- 系统可用性 > 99.9%
### 9.2 Business Metrics

- 邮件订阅转化率 > 30%
- 邮件打开率 > 25%
- 邮件点击率 > 15%
- 跳出率 < 40%
- 平均会话时长 > 2 分钟