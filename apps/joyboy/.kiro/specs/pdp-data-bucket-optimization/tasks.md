# Implementation Plan: PDP Data Bucket API 调用优化

## Overview

本实现计划将重构 `getPdpDataBucketServer` 函数，实现双层缓存策略（React cache + unstable_cache），解决 PDP 页面中 data-bucket API 的重复调用和 404 重试问题。

## Tasks

- [x] 1. 重构 getPdpDataBucketServer 核心函数

  - [x] 1.1 提取内部 fetch 函数 `_fetchPdpDataBucket`
    - 移除缓存逻辑，只保留纯粹的 API 调用
    - 简化参数，只接收 slug
    - 优化 404 处理，确保不抛出错误
    - _Requirements: 2.1, 2.3_
  - [x] 1.2 实现持久化缓存层 `_createCachedFetcher`
    - 使用 unstable_cache 包装 fetch 函数
    - 使用 slug 作为唯一缓存键
    - 配置统一的缓存标签
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 1.3 实现请求级别去重层 `_cachedGetPdpDataBucket`
    - 使用 React cache 包装持久化缓存函数
    - 确保同一请求周期内相同 slug 只调用一次
    - _Requirements: 1.1, 1.3, 4.1, 4.2_
  - [x] 1.4 更新公开 API `getPdpDataBucketServer`
    - 保持向后兼容的函数签名
    - 内部调用去重层函数
    - _Requirements: 1.1, 1.2_
  - [ ]\* 1.5 编写属性测试：请求去重
    - **Property 1: 请求去重**
    - **Validates: Requirements 1.1, 1.2, 4.1, 5.1, 5.2, 5.3**

- [x] 2. 优化错误处理逻辑

  - [x] 2.1 重构 404 响应处理
    - 确保 404 返回 null 而不抛出错误
    - 移除任何可能导致重试的逻辑
    - 确保 404 响应被缓存
    - _Requirements: 2.1, 2.2_
  - [x] 2.2 优化日志级别
    - 404: 不记录日志
    - 4xx (非 404): warn 级别
    - 5xx: error 级别
    - _Requirements: 2.3, 6.3_
  - [x] 2.3 实现错误不缓存逻辑
    - 4xx (非 404) 和 5xx 错误不缓存
    - 允许后续请求重试
    - _Requirements: 4.3_
  - [ ]\* 2.4 编写属性测试：404 响应处理
    - **Property 2: 404 响应不重试**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [ ]\* 2.5 编写属性测试：日志级别正确性
    - **Property 5: 日志级别正确性**
    - **Validates: Requirements 2.3, 6.3**

- [ ] 3. Checkpoint - 核心功能验证

  - 确保所有测试通过，ask the user if questions arise.

- [x] 4. 验证预加载机制

  - [x] 4.1 确认 uspPreload 使用相同的缓存机制
    - 验证预加载调用 getPdpDataBucketServer
    - 确保预加载结果可被组件复用
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]\* 4.2 编写单元测试：预加载与组件共享缓存
    - 测试预加载后组件调用不触发新请求
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. 验证 USP 组件调用

  - [x] 5.1 检查 RefinedUspVariantAServer 调用逻辑
    - 确认使用 getPdpDataBucketServer
    - 无需修改，验证即可
    - _Requirements: 1.1_
  - [x] 5.2 检查 RefinedUspVariantBServer 调用逻辑
    - 确认使用 getPdpDataBucketServer
    - 无需修改，验证即可
    - _Requirements: 1.1_
  - [x] 5.3 检查 RefinedUspVariantCServer 调用逻辑
    - 确认使用 getPdpDataBucketServer
    - 无需修改，验证即可
    - _Requirements: 1.1_

- [x] 6. 编写集成测试

  - [x]\* 6.1 编写属性测试：缓存键一致性
    - **Property 3: 缓存键一致性**
    - **Validates: Requirements 3.1, 3.2**
  - [x]\* 6.2 编写属性测试：错误不缓存
    - **Property 4: 错误不缓存**
    - **Validates: Requirements 4.3**

- [ ] 7. Final Checkpoint - 完整验证
  - 确保所有测试通过，ask the user if questions arise.
  - 验证 PDP 页面加载时的 API 调用数量

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
