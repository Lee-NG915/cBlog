# Requirements Document

## Introduction

本文档定义了 PDP Data Bucket API 调用优化的需求。当前系统在 PDP 页面加载时，会对 Storyblok 的 `/pdp/data-bucket/` 接口产生大量重复调用，包括对 404 响应的多次重试，这导致了不必要的 API 负载和潜在的性能问题。

## Glossary

- **PDP**: Product Detail Page，产品详情页
- **Data_Bucket**: Storyblok CMS 中存储产品特定配置数据的内容类型
- **USP_Component**: Unique Selling Point 组件，用于展示产品卖点的 CMS 组件
- **Storyblok_API**: Storyblok 内容管理系统的 CDN API
- **Request_Deduplication**: 请求去重，在同一请求周期内避免重复的 API 调用
- **Cache_Key**: 缓存键，用于标识和检索缓存数据的唯一标识符

## Requirements

### Requirement 1: 请求去重

**User Story:** As a 系统运维人员, I want PDP 页面的 data-bucket 请求被去重, so that 相同 slug 的请求在同一渲染周期内只发送一次。

#### Acceptance Criteria

1. WHEN 多个 USP 组件在同一 PDP 页面渲染时请求相同 slug 的 data-bucket THEN THE Request_Deduplication_System SHALL 确保只发送一次实际的 API 请求
2. WHEN 预加载（uspPreload）和组件渲染同时请求相同 slug THEN THE Request_Deduplication_System SHALL 复用同一个请求结果
3. THE Request_Deduplication_System SHALL 使用 React cache 在请求级别实现去重

### Requirement 2: 404 响应处理优化

**User Story:** As a 系统运维人员, I want 404 响应不触发重试, so that 减少不必要的 API 调用和日志噪音。

#### Acceptance Criteria

1. WHEN Storyblok API 返回 404 状态码 THEN THE Data_Bucket_Fetcher SHALL 立即返回 null 而不进行重试
2. WHEN 404 响应被缓存后 THEN THE Cache_System SHALL 在缓存有效期内直接返回 null 而不发送新请求
3. THE Data_Bucket_Fetcher SHALL 对 404 响应静默处理，不记录错误日志

### Requirement 3: 缓存键一致性

**User Story:** As a 开发人员, I want 缓存键的生成逻辑保持一致, so that 相同 slug 的请求能够正确命中缓存。

#### Acceptance Criteria

1. THE Cache_System SHALL 使用 slug 作为主要缓存键，忽略可选参数的差异
2. WHEN 不同组件使用相同 slug 但不同可选参数调用 data-bucket THEN THE Cache_System SHALL 返回相同的缓存结果
3. THE Cache_System SHALL 为 data-bucket 请求使用统一的缓存标签 `pdp-data-bucket`

### Requirement 4: 并发请求控制

**User Story:** As a 系统运维人员, I want 控制并发请求数量, so that 避免瞬间大量请求对 Storyblok API 造成压力。

#### Acceptance Criteria

1. WHEN 缓存未命中且有多个并发请求相同 slug THEN THE Request_Deduplication_System SHALL 只发送一个实际请求，其他请求等待结果
2. THE Data_Bucket_Fetcher SHALL 在请求级别使用 React cache 实现并发控制
3. WHEN 请求失败 THEN THE Data_Bucket_Fetcher SHALL 不缓存错误结果，允许后续请求重试

### Requirement 5: 预加载优化

**User Story:** As a 开发人员, I want 预加载机制与组件请求共享缓存, so that 预加载的数据能被后续组件直接使用。

#### Acceptance Criteria

1. WHEN uspPreload 被调用 THEN THE Preload_System SHALL 使用与组件相同的缓存机制
2. THE Preload_System SHALL 确保预加载的结果可被后续的 USP 组件复用
3. WHEN 预加载完成后组件请求相同 slug THEN THE Cache_System SHALL 直接返回预加载的结果

### Requirement 6: 可观测性

**User Story:** As a 系统运维人员, I want 能够监控 data-bucket 请求的去重效果, so that 验证优化是否生效。

#### Acceptance Criteria

1. THE Data_Bucket_Fetcher SHALL 在开发环境下记录请求去重的统计信息
2. WHEN 请求被去重时 THEN THE Logging_System SHALL 记录去重事件（仅在 debug 模式）
3. THE Data_Bucket_Fetcher SHALL 保持现有的错误日志级别（404 静默，4xx warn，5xx error）
