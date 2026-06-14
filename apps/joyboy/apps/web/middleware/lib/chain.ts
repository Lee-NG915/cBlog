import { NextMiddlewareResult } from 'next/dist/server/web/types';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

/**
 * 🔗 简化的中间件类型定义
 */
export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
  response: NextResponse
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

/**
 * 🏭 中间件工厂类型
 *
 * 每个具体的中间件都是一个工厂函数，接收下一个中间件作为参数
 * 这样可以实现链式调用和条件中断
 */
export type MiddlewareFactory = (middleware: CustomMiddleware) => CustomMiddleware;

/**
 * 🔗 中间件链组合器
 *
 * 简化的递归实现，将多个中间件工厂组合成单一的执行链
 *
 * @param functions - 中间件工厂数组
 * @param index - 当前递归索引
 * @returns 组合后的中间件函数
 */
export function chain(functions: MiddlewareFactory[], index = 0): CustomMiddleware {
  const current = functions[index];

  if (current) {
    const next = chain(functions, index + 1);
    return current(next);
  }

  // 基础情况：返回最终的 response 对象
  return (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    return response;
  };
}
