import { chain } from './middleware/lib/chain';
// import { abTestMiddleware } from './middleware/middlewares/abTestMiddleware';
import { apiRewriteMiddleware } from './middleware/middlewares/apiRewriteMiddleware';
import { categoryMiddleware } from './middleware/middlewares/categoryMiddleware';
import { corsMiddleware } from './middleware/middlewares/corsMiddleware';
import { countrySelectMiddleware } from './middleware/middlewares/countrySelectMiddleware';
import { geoLocationMiddleware } from './middleware/middlewares/geoLocationMiddleware';
import { homeMiddleware } from './middleware/middlewares/homeMiddleware';
// import { loggerMiddleware } from './middleware/middlewares/loggerMiddleware';
import { paramResolverMiddleware } from './middleware/middlewares/paramResolverMiddleware';
import { plaMiddleware } from './middleware/middlewares/plaMiddleware';
import { quizMiddleware } from './middleware/middlewares/quizMiddleware';
import { rewriteMiddleware } from './middleware/middlewares/rewriteMiddleware';
import { saleMiddleware } from './middleware/middlewares/saleMiddleware';
import { termsAndConditionMiddleware } from './middleware/middlewares/termsAndConditionMiddleware';
// import { accountMiddleware } from './middleware/middlewares/accountMiddleware';
import { userAuthMiddleware } from './middleware/middlewares/userAuthMiddleware';

export default chain([
  apiRewriteMiddleware,
  corsMiddleware, // 🌐 CORS 跨域处理（API 路径专用）
  paramResolverMiddleware, // 🔍 解析参数，设置 headers
  geoLocationMiddleware, // 🌍地理位置处理
  // loggerMiddleware, // 📝日志记录和监控
  // abTestMiddleware, // 🧪A/B 测试配置
  countrySelectMiddleware, // 🌍 统一国家路径处理（必须在 homeMiddleware 之前）
  userAuthMiddleware, // 🔐用户认证和路由重定向（前置）
  homeMiddleware, // 🏠首页处理（根路径专用，在 countrySelect 之后）
  termsAndConditionMiddleware, // 📋T&C 条款页面路由（统一处理）
  // 🎯 业务中间件 - 按优先级排序
  plaMiddleware, // 🛍️PLA 产品分析页（高优先级）
  saleMiddleware, // 📋 销售页面路由（按地区区分）
  quizMiddleware, // 🧩 Quiz 白名单：仅允许 ideal-vacation-home 等指定 slug
  categoryMiddleware, // 🏷️ 分类着陆页路由（按地区区分）
  // accountMiddleware, // 👤 账户相关路由
  rewriteMiddleware, // 🛒 兜底 rewrite，累积所有修改
]);

/**
 * Middleware Configuration
 *
 * 匹配所有路径，让 API 重写中间件处理 API 路径的重写
 */
export const config = {
  matcher: [
    /**
     * It matches all paths except:
     * 1. /api/ - API routes
     * 2. /_next/ - Next.js internals
     * 3. /_proxy/ - OG tags proxying
     * 4. /_vercel - Vercel internals
     * 5. /_static/ - Static files inside /public
     * 6. /static/ - Static assets
     * 7. /.well-known/ - Well-known URIs (RFC 8615)
     * 8. /favicon.ico, /sitemap.xml, /robots.txt - Common static files
     * 9. /manifest.json - PWA manifest
     * 10. Files with extensions - Any path containing a dot followed by characters (e.g., .jpg, .png, .json, etc.)
     */
    '/((?!api/|_next/|_proxy/|_vercel|_static/|static/|\\.well-known/|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.json|public/|images/|[^/]*\\.[^/]+$).*)',
  ],
};
