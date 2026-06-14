import { locales, defaultLocale } from '@castlery/config';
import { isLoggedInKeyName } from '@castlery/shared-persistence-kit';
import { NextRequest, NextResponse } from 'next/server';

const whiteList = [
  '/',
  ...locales.map((locale) => `/${locale.value}/health-check`),
  ...locales.map((locale) => `/${locale.value}`),
  ...locales.map((locale) => `/${locale.value}/login`),
  ...locales.map((locale) => `/${locale.value}/auth/callback`),
  ...locales.map((locale) => `/${locale.value}/auth/logout-callback`),
];

const authRoutePaths = new Set([
  '/login',
  '/callback',
  '/auth/callback',
  '/logout-callback',
  '/auth/logout-callback',
  ...locales.flatMap((locale) => [
    `/${locale.value}/login`,
    `/${locale.value}/auth/callback`,
    `/${locale.value}/auth/logout-callback`,
  ]),
]);

function isAuthRoute(pathname: string): boolean {
  return authRoutePaths.has(pathname);
}

// TODO: 后面这里要单独提一个PR来处理整个ＰＯＳ的中间件设计
const middlewareHandler = async (
  request: NextRequest & {
    auth: any;
  }
) => {
  const {
    nextUrl,
    cookies,
    // headers,
    //  url
  } = request;
  if (whiteList.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // 检测国家前缀的API路径模式：/xx/api/*
  const apiMatch = nextUrl.pathname.match(/^\/([a-z]{2})\/api\/(.*)/);

  if (apiMatch) {
    const [, _countryCode, apiPath] = apiMatch;
    // 重写URL到 /api/*
    const newUrl = nextUrl.clone();
    newUrl.pathname = `/api/${apiPath}`;

    // 直接重写到API路径，不经过后续中间件
    return NextResponse.rewrite(newUrl);
  }

  const isLoggedIn = cookies.get(isLoggedInKeyName)?.value;
  if (isLoggedIn) {
    return NextResponse.next();
  }
  const loginUrl = new URL(`/${defaultLocale}/login`, request.url);
  if (!request.nextUrl.searchParams.has('callbackUrl') && !isAuthRoute(nextUrl.pathname)) {
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
  }

  return NextResponse.redirect(loginUrl);
};

export default middlewareHandler;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher

  matcher: [
    /**
     * It matches all paths except:
     * 1. /api/
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (OG tags proxying)
     * 4. /_vercel (Vercel internals)
     * 5. /_static (inside of /public)
     * 6. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     * 7. The paths containing a file extension (e.g., .jpg, .png, etc.)
     */
    '/((?!api/|_next/|_proxy/|_vercel|_static|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\..*).*)',
  ],
};
