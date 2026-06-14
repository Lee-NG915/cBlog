'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { captureStructuredMessage, BusinessSeverity } from '@castlery/observability/client';
import { useRef } from 'react';

/**
 * 从 DOM 节点提取可读选择器
 * 策略：tag + id + 有意义的 class（过滤掉动态 hash class）
 */
function describeDOMNode(node: Node | null | undefined): string {
  if (!node || !(node instanceof Element)) return '';
  const tag = node.nodeName.toLowerCase();
  const id = node.id ? `#${node.id}` : '';
  const classes =
    node.className && typeof node.className === 'string'
      ? node.className
          .trim()
          .split(/\s+/)
          .filter((c) => {
            // 保留有语义的 MUI/Joy 类名（variant、color、state）
            if (/^Mui\w+-(variant|color|size)\w+$/i.test(c)) return true;
            if (/^Mui\w+-expanded$/i.test(c)) return true;
            // 保留业务类名（如 dy_unit, react-autosuggest 等）
            if (!/^(joy-|css-|Mui\w+-root$)/.test(c)) return true;
            // 过滤：joy-xxxx hash、css-xxxx hash、纯 root 类（MuiBox-root 等）
            return false;
          })
          .map((c) => `.${c}`)
          .join('')
      : '';
  return `${tag}${id}${classes}`;
}

/**
 * 向上遍历 DOM 树，找到最近的有意义的祖先元素
 * 优先查找: data-testid > data-section > data-component > 有 id 的元素
 */
function findAncestorContext(node: Node | null | undefined, maxDepth = 8): string {
  if (!node || !(node instanceof Element)) return '';
  let current: Element | null = node.parentElement;
  let depth = 0;
  while (current && depth < maxDepth) {
    const testId = current.getAttribute('data-testid');
    if (testId) return `[data-testid="${testId}"]`;
    const section = current.getAttribute('data-section');
    if (section) return `[data-section="${section}"]`;
    const component = current.getAttribute('data-component');
    if (component) return `[data-component="${component}"]`;
    // 有意义的 id（排除 __next 等框架生成的）
    if (current.id && !current.id.startsWith('__') && !current.id.startsWith('radix-')) {
      return `#${current.id}`;
    }
    current = current.parentElement;
    depth++;
  }
  return '';
}

function describeRect(rect: DOMRectReadOnly | undefined): string {
  if (!rect) return 'N/A';
  return `(${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)}x${Math.round(rect.height)})`;
}

/**
 * 计算矩形面积变化量（用于排序找到最大偏移源）
 */
function rectShiftArea(prev: DOMRectReadOnly | undefined, curr: DOMRectReadOnly | undefined): number {
  if (!prev || !curr) return 0;
  const dx = Math.abs(curr.x - prev.x);
  const dy = Math.abs(curr.y - prev.y);
  const area = Math.max(prev.width * prev.height, curr.width * curr.height);
  return (dx + dy) * area;
}

/**
 * 检测页面类型
 */
function detectPageType(pathname: string): string {
  if (/\/products\//.test(pathname)) return 'pdp';
  if (/\/(chairs|sofas|tables|storage|beds|outdoor|dining|living|bedroom)\//.test(pathname)) return 'plp';
  if (/\/search/.test(pathname)) return 'search';
  if (/\/cart/.test(pathname)) return 'cart';
  if (/\/account/.test(pathname)) return 'account';
  if (/\/wishlist/.test(pathname)) return 'wishlist';
  // 首页: /{region} 或 /{region}/{locale}（兼容 trailing slash）
  if (/^\/[a-z]{2}(\/[a-z]{2})?\/?$/.test(pathname)) return 'homepage';
  return 'other';
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources?: {
    node: Node | null;
    previousRect: DOMRectReadOnly;
    currentRect: DOMRectReadOnly;
  }[];
}

export function WebVitals() {
  const sampled = useRef(process.env.NODE_ENV === 'production' && Math.random() < 0.1);

  useReportWebVitals((metric) => {
    if (!sampled.current) return;
    if (metric.name !== 'CLS') return;
    if (metric.value <= 0.15) return;

    const entries = (metric.entries || []) as LayoutShiftEntry[];
    const viewport = `${window.innerWidth}x${window.innerHeight}`;
    const pathname = window.location.pathname;
    const pageType = detectPageType(pathname);

    // 统计：有多少偏移是用户交互触发的
    const totalEntries = entries.length;
    const userTriggeredCount = entries.filter((e) => e.hadRecentInput).length;

    // 只统计非用户交互触发的偏移（这才是 CWV 关心的）
    const unexpectedEntries = entries.filter((e) => !e.hadRecentInput);

    // 收集所有偏移源，按偏移面积降序排列（最大偏移排前面）
    const allSources = unexpectedEntries
      .flatMap((entry) => {
        return (entry.sources || []).map((source) => ({
          node: source.node,
          nodeDesc: describeDOMNode(source.node),
          ancestorContext: findAncestorContext(source.node),
          previousRect: source.previousRect,
          currentRect: source.currentRect,
          shiftValue: entry.value,
          timestamp: entry.startTime,
          shiftArea: rectShiftArea(source.previousRect, source.currentRect),
        }));
      })
      .sort((a, b) => b.shiftArea - a.shiftArea);

    // 序列化用于上报（去掉 DOM node 引用）
    const sourcesForReport = allSources.slice(0, 8).map((s) => ({
      node: s.nodeDesc || 'detached',
      ancestor: s.ancestorContext || 'none',
      previousRect: describeRect(s.previousRect),
      currentRect: describeRect(s.currentRect),
      shiftValue: s.shiftValue.toFixed(4),
      timestamp: Math.round(s.timestamp),
    }));

    // 主要嫌疑元素：取偏移面积最大的那个
    const primarySource = allSources[0];
    const primaryCulprit = primarySource?.nodeDesc || 'unknown';
    const ancestorContext = primarySource?.ancestorContext || '';

    // 构建 fingerprint 用的简化选择器
    // 只去掉真正无意义的动态 hash 类
    const simplifiedCulprit = primaryCulprit
      .replace(/\.joy-[a-z0-9-]+/gi, '') // Joy UI 动态 hash
      .replace(/\.css-[a-z0-9]+/gi, '') // emotion css hash
      .replace(/\.\./g, '.')
      .replace(/\.$/, '')
      .trim();

    // 完整的嫌疑描述（用于 message，包含祖先上下文）
    const culpritDisplay = ancestorContext
      ? `${simplifiedCulprit || primaryCulprit} in ${ancestorContext}`
      : simplifiedCulprit || primaryCulprit;

    captureStructuredMessage(`CLS: ${metric.value.toFixed(3)} - ${culpritDisplay}`, {
      severity: BusinessSeverity.MEDIUM,
      tags: {
        page: pathname,
        pageType,
        clsValue: metric.value.toFixed(4),
        clsRating: metric.rating,
        primaryCulprit: simplifiedCulprit || primaryCulprit,
        ancestorContext: ancestorContext || 'none',
        viewport,
        hasUnexpectedShifts: unexpectedEntries.length > 0 ? 'yes' : 'no',
      },
      fingerprint: ['cls-v2', simplifiedCulprit || primaryCulprit],
      extra: {
        pathname,
        pageType,
        clsValue: metric.value,
        clsRating: metric.rating,
        sources: sourcesForReport,
        viewport,
        totalEntries,
        unexpectedEntries: unexpectedEntries.length,
        userTriggeredEntries: userTriggeredCount,
        // 如果主元素是 unknown/detached，记录 rect 信息帮助追踪
        primaryRect: primarySource
          ? {
              previous: describeRect(primarySource.previousRect),
              current: describeRect(primarySource.currentRect),
            }
          : null,
      },
    });
  });

  return null;
}
