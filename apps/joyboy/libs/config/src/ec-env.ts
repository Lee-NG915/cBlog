import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const EC_COUNTRIES_ENUM = z.enum(['SG', 'US', 'AU', 'CA', 'UK']);
/**
 * 现在暂时每个环境变量有个默认值
 * 因为在sb运行时还没有解决环境变量注入
 */
export const EcEnv = createEnv({
  /**
   * TODO 这里要重新梳理
   * 非next_public_环境变量仅在Node.js环境中可用,如果允许 client 访问的话 一定需要 NEXT_PUBLIC_ 开头
   * 默认情况下，环境变量仅在服务器上可用。要向浏览器公开环境变量，必须使用NEXT_PUBLIC_作为前缀。
   * why NEXT_PUBLIC_? learn details: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
   */
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    NEXT_PUBLIC_IS_SERVER: z.boolean(), // 是否是服务端
    NEXT_PUBLIC_API_HOST: z.string(),
    // 站点的域名
    NEXT_PUBLIC_BASE_URL: z.string(),
    NEXT_PUBLIC_COUNTRY: EC_COUNTRIES_ENUM,
    NEXT_PUBLIC_CURRENCY: z.enum(['SGD', 'USD', 'AUD', 'CAD', 'GBP']).optional(),
    NEXT_PUBLIC_CURRENCY_SYMBOL: z.enum(['$', 'C$', '£']).optional(),
    NEXT_PUBLIC_WEB_SERVER_NAME: z.string().optional(),
    NEXT_PUBLIC_LOCALE: z.string(),
    NEXT_PUBLIC_APPLICATION_ENV: z.enum([
      'sg-test',
      'us-test',
      'au-test',
      'ca-test',
      'uk-test',
      'sg-uat',
      'us-uat',
      'au-uat',
      'ca-uat',
      'uk-uat',
      'sg-prod',
      'us-prod',
      'au-prod',
      'ca-prod',
      'uk-prod',
    ]),
    NEXT_PUBLIC_GTM_ID: z.string(),
    NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN: z.string().optional(),
    NEXT_PUBLIC_CHANNEL: z.enum(['POS', 'WEB']),
    NEXT_PUBLIC_MULBERRY_SDK: z.string().optional(),
    NEXT_PUBLIC_GUARDSMAN_PUBLIC_KEY: z.string().optional(),
    NEXT_PUBLIC_GUARDSMAN_WIDGET_SDK: z.string().optional(),
    NEXT_PUBLIC_CAPI_PIXEL_ID: z.string().optional(),
    NEXT_PUBLIC_ACCESS_COUNTRY: z.array(z.enum(['SG', 'US', 'AU', 'CA', 'UK'])),
    NEXT_PUBLIC_APPLICATION_TEST_TAG: z.boolean(),
    // datadog
    NEXT_PUBLIC_DATADOG_APP_ID: z.string().optional(),
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: z.string().optional(),
    GOOGLE_ID: z.string().optional(),
    GOOGLE_SECRET: z.string().optional(),
    // Dynamic Yield
    NEXT_PUBLIC_DY_ACCOUNT_ID: z.string(),
    NEXT_PUBLIC_DY_CLIENT_API_KEY: z.string(),
    DY_SERVER_API_KEY: z.string(),
    // Storyblok
    NEXT_PUBLIC_STORYBLOK_TOKEN: z.string().optional(),
    NEXT_PUBLIC_ASSETS_PATH: z.string().optional(),
    NEXT_PUBLIC_PRODUCTION_ENV: z.string().optional(),
    NEXT_PUBLIC_ONEPIECE_HOST: z.string().optional(),
    // Yopto
    NEXT_PUBLIC_YOTPO_GUID: z.string().optional(),
    NEXT_PUBLIC_YOTPO_ENABLED: z.boolean().default(true),
    NEXT_PUBLIC_YOTPO_API_KEY: z.string().optional(),
    NEXT_PUBLIC_TIME_ZONE: z.string().optional(),
    NEXT_PUBLIC_YOTPO_REFERRAL_ID: z.string().optional(),
    NEXT_PUBLIC_FRIENDBUY_ENABLED: z.boolean().optional(),
    // Gladly
    NEXT_PUBLIC_GLADLY_APPID: z.string().optional(),
    NEXT_PUBLIC_GLADLY_CDN: z.string().optional(),
    NEXT_PUBLIC_GLADLY_HC_API: z.string().optional(),
    NEXT_PUBLIC_GLADLY_HC_ORGID: z.string().optional(),
    NEXT_PUBLIC_GLADLY_HC_BRANDID: z.string().optional(),
    NEXT_PUBLIC_GLADLY_ENABLED: z.boolean().optional(),
    // Redis
    REDIS_URL: z.string().optional(),
    // Cookieyes
    NEXT_PUBLIC_COOKIEYES_CDN: z.string().optional(),
    NEXT_PUBLIC_COOKIEYES_ENABLED: z.boolean().optional().default(false),
    // revalidate
    NEXT_PUBLIC_KNIGHT_API_REVALIDATE_TIME: z.number().optional(),
    NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME: z.number().optional(),
    // Ptengine
    NEXT_PUBLIC_PTENGINE_ID: z.string().optional(),
    // Storyblok Webhook
    NEXT_PUBLIC_STORYBLOK_WEBHOOK_SECRET: z.string().optional(),
    //Posthog
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
    // Fresh chat
    NEXT_PUBLIC_FRESHCHAT_ID: z.string().optional(),
    NEXT_PUBLIC_FRESHCHAT_ENABLED: z.boolean().optional(),
    // Klaviyo
    NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY: z.string().optional(),
    // ReCaptcha
    NEXT_PUBLIC_RECAPTCHA_KEY: z.string().optional(),
    // Affirm
    NEXT_PUBLIC_AFFIRM_ENABLED: z.boolean().optional(),
    NEXT_PUBLIC_AFFIRM_PUBLIC_KEY: z.string().optional(),
    NEXT_PUBLIC_AFFIRM_SCRIPT: z.string().optional(),
    // Instalment
    NEXT_PUBLIC_INSTALMENT_ENABLED: z.boolean().optional(),
    NEXT_PUBLIC_INSTALMENT_URL: z.string().optional(),
    NEXT_PUBLIC_INSTALMENT_ENCRYPT: z.string().optional(),
    // ZipPay
    NEXT_PUBLIC_ZIP_ENABLED: z.boolean().optional(),
    NEXT_PUBLIC_ZIP_PUBLIC_KEY: z.string().optional(),
    NEXT_PUBLIC_ZIP_URL: z.string().optional(),
    // Middleware Logging
    // 中间件日志级别控制：0=ERROR, 1=WARN, 2=INFO, 3=DEBUG
    // 生产环境建议使用 1 (WARN)，开发环境使用 3 (DEBUG)
    MIDDLEWARE_LOG_LEVEL: z.coerce.number().min(0).max(3).default(1).optional(),
    // Google Customer Reviews
    NEXT_PUBLIC_GOOGLE_MERCHANT_ID: z.string().optional(),
    // OAuth Providers
    NEXT_PUBLIC_FACEBOOK_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_APPLE_CLIENT_ID: z.string().optional(),
    // UMS OIDC（回调路径、logout 路径、scopes 固定在 libs/modules/user/services ums-auth.config）
    NEXT_PUBLIC_UMS_ISSUER: z.string().optional(),
    NEXT_PUBLIC_UMS_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_UMS_API_BASE_URL: z.string().optional(),
    // Application Version
    NEXT_PUBLIC_VERSION: z.string().optional(),
    // Facebook
    NEXT_PUBLIC_FB_CAPI_PIXEL_ID: z.string().optional(),
    // Password Encryption
    NEXT_PUBLIC_PASSWORD_ENCRYPTION_PUBLIC_KEY: z.string().optional(),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional().default('info'),
    // Impact
    NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID: z.string().optional(),
    NEXT_PUBLIC_IMPACT_UTT_CDN_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_DATADOG_APP_ID: z.string().optional(),
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: z.string().optional(),
  },
  server: {
    PORT: z.coerce.number().optional(),
    AUTH_SECRET: z.string().default('AUTH_SECRET'),
    ELASTICSEARCH_HOST: z.string().url(),
    ELASTICSEARCH_USERNAME: z.string(),
    ELASTICSEARCH_PASSWORD: z.string(),
    ALLOWED_ORIGINS: z.string().optional(),
    // Next.js API Route
    APP_API_BASE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env['NODE_ENV'],
    PORT: process.env['PORT'],
    AUTH_SECRET: process.env['AUTH_SECRET'],
    NEXT_PUBLIC_IS_SERVER: typeof window === 'undefined',
    //
    NEXT_PUBLIC_API_HOST: process.env['NEXT_PUBLIC_API_HOST'],
    NEXT_PUBLIC_COUNTRY: process.env['NEXT_PUBLIC_COUNTRY'],
    NEXT_PUBLIC_LOCALE: process.env['NEXT_PUBLIC_LOCALE'],
    NEXT_PUBLIC_CHANNEL: process.env['NEXT_PUBLIC_CHANNEL'],
    NEXT_PUBLIC_GTM_ID: process.env['NEXT_PUBLIC_GTM_ID'],
    NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN: process.env['NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN'],
    NEXT_PUBLIC_MULBERRY_SDK: process.env['NEXT_PUBLIC_MULBERRY_SDK'],
    NEXT_PUBLIC_GUARDSMAN_PUBLIC_KEY: process.env['NEXT_PUBLIC_GUARDSMAN_PUBLIC_KEY'],
    NEXT_PUBLIC_GUARDSMAN_WIDGET_SDK: process.env['NEXT_PUBLIC_GUARDSMAN_WIDGET_SDK'],
    NEXT_PUBLIC_APPLICATION_ENV: process.env['NEXT_PUBLIC_APPLICATION_ENV'],
    NEXT_PUBLIC_CURRENCY: process.env['NEXT_PUBLIC_CURRENCY'],
    NEXT_PUBLIC_CURRENCY_SYMBOL: process.env['NEXT_PUBLIC_CURRENCY_SYMBOL'],
    NEXT_PUBLIC_WEB_SERVER_NAME: process.env['NEXT_PUBLIC_WEB_SERVER_NAME'],
    NEXT_PUBLIC_CAPI_PIXEL_ID: process.env['NEXT_PUBLIC_CAPI_PIXEL_ID'],
    // NEXT_PUBLIC_NEXT_PUBLIC_YOTPO_GUID: process.env['NEXT_PUBLIC_YOTPO_GUID'],
    // NEXT_PUBLIC_YOTPO_GUID: process.env['NEXT_PUBLIC_YOTPO_GUID'],
    // NEXT_PUBLIC_YOTPO_REWARDS_ID: process.env['NEXT_PUBLIC_YOTPO_REWARDS_ID'],
    NEXT_PUBLIC_YOTPO_REFERRAL_ID: process.env['NEXT_PUBLIC_YOTPO_REFERRAL_ID'],
    // NEXT_PUBLIC_YOTPO_REFERRAL_POPUP_ID: process.env['NEXT_PUBLIC_YOTPO_REFERRAL_POPUP_ID'],
    NEXT_PUBLIC_YOTPO_API_KEY: process.env['NEXT_PUBLIC_YOTPO_API_KEY'],
    // @ts-ignore
    NEXT_PUBLIC_ACCESS_COUNTRY: process.env['NEXT_PUBLIC_ACCESS_COUNTRY']?.split(',') || [],
    NEXT_PUBLIC_APPLICATION_TEST_TAG:
      process.env['NEXT_PUBLIC_APPLICATION_ENV'] === 'au-test' ||
      process.env['NEXT_PUBLIC_APPLICATION_ENV'] === 'sg-test' ||
      process.env['NEXT_PUBLIC_APPLICATION_ENV'] === 'us-test' ||
      process.env['NEXT_PUBLIC_APPLICATION_ENV'] === 'ca-test' ||
      process.env['NEXT_PUBLIC_APPLICATION_ENV'] === 'uk-test',
    NEXT_PUBLIC_DATADOG_APP_ID: process.env['NEXT_PUBLIC_DATADOG_APP_ID'],
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: process.env['NEXT_PUBLIC_DATADOG_CLIENT_TOKEN'],
    GOOGLE_ID: process.env['GOOGLE_ID'] || '',
    GOOGLE_SECRET: process.env['GOOGLE_SECRET'] || '',

    // Dynamic Yield
    DY_SERVER_API_KEY: process.env['DY_SERVER_API_KEY'] || '',
    NEXT_PUBLIC_DY_ACCOUNT_ID: process.env['NEXT_PUBLIC_DY_ACCOUNT_ID'] || '',
    NEXT_PUBLIC_DY_CLIENT_API_KEY: process.env['NEXT_PUBLIC_DY_CLIENT_API_KEY'] || '',
    NEXT_PUBLIC_BASE_URL: process.env['NEXT_PUBLIC_BASE_URL'] || 'http://localhost',

    // Storyblok
    NEXT_PUBLIC_STORYBLOK_TOKEN: process.env['NEXT_PUBLIC_STORYBLOK_TOKEN'],

    // Fresh Chat
    NEXT_PUBLIC_FRESHCHAT_ID: process.env['NEXT_PUBLIC_FRESHCHAT_ID'],
    NEXT_PUBLIC_FRESHCHAT_ENABLED: process.env['NEXT_PUBLIC_FRESHCHAT_ENABLED'] === 'true',

    // Gladly
    NEXT_PUBLIC_GLADLY_APPID: process.env['NEXT_PUBLIC_GLADLY_APPID'] || '',
    NEXT_PUBLIC_GLADLY_CDN: process.env['NEXT_PUBLIC_GLADLY_CDN'] || '',
    NEXT_PUBLIC_GLADLY_HC_API: process.env['NEXT_PUBLIC_GLADLY_HC_API'] || '',
    NEXT_PUBLIC_GLADLY_HC_ORGID: process.env['NEXT_PUBLIC_GLADLY_HC_ORGID'] || '',
    NEXT_PUBLIC_GLADLY_HC_BRANDID: process.env['NEXT_PUBLIC_GLADLY_HC_BRANDID'] || '',
    NEXT_PUBLIC_GLADLY_ENABLED: process.env['NEXT_PUBLIC_GLADLY_ENABLED'] === 'true',

    NEXT_PUBLIC_ASSETS_PATH: process.env['NEXT_PUBLIC_ASSETS_PATH'] || '',
    NEXT_PUBLIC_PRODUCTION_ENV: process.env['NODE_ENV'],
    NEXT_PUBLIC_ONEPIECE_HOST: process.env['NEXT_PUBLIC_ONEPIECE_HOST'],
    // Yopto
    NEXT_PUBLIC_YOTPO_GUID: process.env['NEXT_PUBLIC_YOTPO_GUID'],
    NEXT_PUBLIC_YOTPO_ENABLED: process.env['NEXT_PUBLIC_YOTPO_ENABLED'] === 'true',
    NEXT_PUBLIC_TIME_ZONE: process.env['NEXT_PUBLIC_TIME_ZONE'] || 'Asia/Singapore',
    NEXT_PUBLIC_FRIENDBUY_ENABLED: process.env['NEXT_PUBLIC_FRIENDBUY_ENABLED'] === 'true',

    // Redis
    REDIS_URL: process.env['REDIS_URL'] || '',
    // Cookieyes
    NEXT_PUBLIC_COOKIEYES_CDN: process.env['NEXT_PUBLIC_COOKIEYES_CDN'],
    NEXT_PUBLIC_COOKIEYES_ENABLED: process.env['NEXT_PUBLIC_COOKIEYES_ENABLED'] === 'true',
    // Ptengine
    NEXT_PUBLIC_PTENGINE_ID: process.env['NEXT_PUBLIC_PTENGINE_ID'],
    // Revalidate
    NEXT_PUBLIC_KNIGHT_API_REVALIDATE_TIME: Number(process.env['NEXT_PUBLIC_KNIGHT_API_REVALIDATE_TIME']) || 600,
    NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME: Number(process.env['NEXT_PUBLIC_STORYBLOK_REVALIDATE_TIME']) || 600,
    // Storyblok Webhook
    NEXT_PUBLIC_STORYBLOK_WEBHOOK_SECRET: process.env['NEXT_PUBLIC_STORYBLOK_WEBHOOK_SECRET'],
    // Klaviyo
    NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY: process.env['NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY'] || '',
    //Posthog
    NEXT_PUBLIC_POSTHOG_KEY: process.env['NEXT_PUBLIC_POSTHOG_KEY'],
    NEXT_PUBLIC_POSTHOG_HOST: process.env['NEXT_PUBLIC_POSTHOG_HOST'],
    // Affirm
    NEXT_PUBLIC_AFFIRM_ENABLED: process.env['NEXT_PUBLIC_AFFIRM_ENABLED'] === 'true',
    NEXT_PUBLIC_AFFIRM_PUBLIC_KEY: process.env['NEXT_PUBLIC_AFFIRM_PUBLIC_KEY'],
    NEXT_PUBLIC_AFFIRM_SCRIPT: process.env['NEXT_PUBLIC_AFFIRM_SCRIPT'],
    // Instalment
    NEXT_PUBLIC_INSTALMENT_ENABLED: process.env['NEXT_PUBLIC_INSTALMENT_ENABLED'] === 'true',
    NEXT_PUBLIC_INSTALMENT_URL: process.env['NEXT_PUBLIC_INSTALMENT_URL'],
    NEXT_PUBLIC_INSTALMENT_ENCRYPT: process.env['NEXT_PUBLIC_INSTALMENT_ENCRYPT'],
    // ZipPay
    NEXT_PUBLIC_ZIP_ENABLED: process.env['NEXT_PUBLIC_ZIP_ENABLED'] === 'true',
    NEXT_PUBLIC_ZIP_PUBLIC_KEY: process.env['NEXT_PUBLIC_ZIP_PUBLIC_KEY'],
    NEXT_PUBLIC_ZIP_URL: process.env['NEXT_PUBLIC_ZIP_URL'],
    // Searchkit
    ELASTICSEARCH_HOST: process.env['ELASTICSEARCH_HOST'],
    ELASTICSEARCH_USERNAME: process.env['ELASTICSEARCH_USERNAME'],
    ELASTICSEARCH_PASSWORD: process.env['ELASTICSEARCH_PASSWORD'],
    // ReCaptcha
    NEXT_PUBLIC_RECAPTCHA_KEY: process.env['NEXT_PUBLIC_RECAPTCHA_KEY'],
    // Middleware Logging
    MIDDLEWARE_LOG_LEVEL: process.env['MIDDLEWARE_LOG_LEVEL'] ? Number(process.env['MIDDLEWARE_LOG_LEVEL']) : undefined,
    ALLOWED_ORIGINS: process.env['ALLOWED_ORIGINS'],
    // Google Customer Reviews
    NEXT_PUBLIC_GOOGLE_MERCHANT_ID: process.env['NEXT_PUBLIC_GOOGLE_MERCHANT_ID'],
    // OAuth Providers
    NEXT_PUBLIC_FACEBOOK_CLIENT_ID: process.env['NEXT_PUBLIC_FACEBOOK_CLIENT_ID'],
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'],
    NEXT_PUBLIC_APPLE_CLIENT_ID: process.env['NEXT_PUBLIC_APPLE_CLIENT_ID'],
    NEXT_PUBLIC_UMS_ISSUER: process.env['NEXT_PUBLIC_UMS_ISSUER'],
    NEXT_PUBLIC_UMS_CLIENT_ID: process.env['NEXT_PUBLIC_UMS_CLIENT_ID'],
    NEXT_PUBLIC_UMS_API_BASE_URL: process.env['NEXT_PUBLIC_UMS_API_BASE_URL'],
    // Application Version
    NEXT_PUBLIC_VERSION: process.env['NEXT_PUBLIC_VERSION'],
    // Password Encryption Public Key
    NEXT_PUBLIC_PASSWORD_ENCRYPTION_PUBLIC_KEY: process.env['NEXT_PUBLIC_PASSWORD_ENCRYPTION_PUBLIC_KEY'],
    APP_API_BASE_URL: `${process.env['APP_API_BASE_URL']}/${process.env[
      'NEXT_PUBLIC_COUNTRY'
    ]?.toLocaleLowerCase()}/api`,
    // Facebook
    NEXT_PUBLIC_FB_CAPI_PIXEL_ID: process.env['NEXT_PUBLIC_FB_CAPI_PIXEL_ID'],
    NEXT_PUBLIC_LOG_LEVEL: process.env['NEXT_PUBLIC_LOG_LEVEL'] || 'info',
    // Impact
    NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID: process.env['NEXT_PUBLIC_IMPACT_CONVERSION_EVENT_ID'],
    NEXT_PUBLIC_IMPACT_UTT_CDN_URL: process.env['NEXT_PUBLIC_IMPACT_UTT_CDN_URL'],
  },
});
