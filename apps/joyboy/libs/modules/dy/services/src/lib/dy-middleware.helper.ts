import { NextRequest, NextResponse } from 'next/server';
import { makePersistenceHandles, dyid as dyidCookieName } from '@castlery/shared-persistence-kit';

/**
 * @description dy cookies handler
 * @see https://dy.dev/docs/cookie-management to learn what dy-cookies do and where they are stored
 * @param request
 * @param response
 */
export const dyMiddlewareHandler = (request: NextRequest, response: NextResponse) => {
  const pathname = request.nextUrl.pathname;

  // 本地存储page-location
  if (pathname) {
    makePersistenceHandles().dyPageLocation.setItem(pathname, { req: request, res: response });
  }
  // 将DYcookie复制为一方cookie
  const dyid = request.cookies.get(dyidCookieName) as any;
  if (dyid?.value) {
    // if this is a returning user and the DYID cookie exists
    makePersistenceHandles().dyidServer.setItem(dyid.value, { req: request, res: response });
  }
};

export const dyVariantion = 'x-path-variation';
export const dyVariantionSlug = 'x_path_variation_slug';
