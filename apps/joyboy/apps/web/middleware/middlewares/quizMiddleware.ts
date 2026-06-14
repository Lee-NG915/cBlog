import { CustomMiddleware } from '../lib/chain';
import { NextResponse } from 'next/server';
import { buildInternalUrl, getRequiredParams, createRewriteWithState } from '../lib/utils';
import { logger } from '@castlery/observability';

/** 允许访问的 quiz slug，只有这些会进入 quiz/[slug]/page.tsx */
const ALLOWED_QUIZ_SLUGS = ['ideal-vacation-home'] as const;

/**
 * 🧩 Quiz 中间件
 *
 * 功能：
 * - 仅允许访问白名单内的 quiz slug（如 quiz/ideal-vacation-home）
 * - 访问其他 quiz/xxx 时重写到不存在的路径，由 Next.js 返回 404
 */
export function quizMiddleware(middleware: CustomMiddleware): CustomMiddleware {
  return async (request, event, response) => {
    const { originalPathname } = getRequiredParams(request);

    if (!originalPathname?.startsWith('/quiz/')) {
      return middleware(request, event, response);
    }

    const slug = originalPathname.replace(/^\/quiz\/?/, '').split('/')[0] ?? '';

    if (ALLOWED_QUIZ_SLUGS.includes(slug as (typeof ALLOWED_QUIZ_SLUGS)[number])) {
      return middleware(request, event, response);
    }

    logger.info('Quiz slug not allowed, returning 404', {
      middleware: 'Quiz',
      path: originalPathname,
      slug,
      allowed: [...ALLOWED_QUIZ_SLUGS],
    });

    const notFoundUrl = buildInternalUrl(request, '/__quiz_404__');
    return createRewriteWithState(response, notFoundUrl);
  };
}
