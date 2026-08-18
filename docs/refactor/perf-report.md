# 性能基线对比报告（Phase 5 / PERF-001）

- 对比对象：基线 commit `45d25fe`（重构前）vs 重构完成态，同机同版本 `next build` 产物
- 结论：**NFR-2 达成** —— 文章页首屏 JS 低于基线，共享包持平，重资源全部转为按需加载

## First-Load JS 对比

| 路由 | 基线 | 重构后 | 变化 |
|------|------|--------|------|
| `/`（首页） | 107 kB | 107 kB | 持平 |
| `/posts/[slug]`（文章页） | 106 kB（路由自身 8.96 kB） | **103 kB**（路由自身 1.33 kB） | **-3 kB / 路由自身 -7.6 kB** |
| 全站共享 chunk | 88.4 kB | 88.5 kB | +0.1 kB（可忽略） |

## 按需加载改造

| 资源 | 基线行为 | 现行为 |
|------|----------|--------|
| Mermaid（~1MB 级库） | 页面含图例即整页加载并全量渲染 | 首个图例临近视口才动态加载；每个图例进入视口（rootMargin 200px）才渲染（FR-10.1） |
| KnowledgeGraphExplorer | 打进文章页路由包（约 8KB gzip 后 JS） | `next/dynamic` 拆分，仅知识图谱文章按需加载（FR-10.3） |
| 随文档位图 | 原图直出 | 构建期 sharp：≥50KB 的 png/jpg 生成限宽 1600 的 WebP 副本，manifest 驱动引用替换，原图保留兜底（FR-10.2） |

## 说明

- 未引入 @next/bundle-analyzer 依赖：以 `next build` 的 first-load JS 表格作为度量口径，足以覆盖 NFR-2 判定；需要更细粒度分析时再临时加。
- 当前 content/ 尚无随文档图片（存量图在 public/images/），WebP 管道对存量无影响；新文章经管理端贴图后自动进入该管道。
- srcset 多尺寸响应式图片按 PRD 非目标留作 backlog。
