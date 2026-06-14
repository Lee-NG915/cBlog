import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';
import fs from 'fs';
import * as webpack from 'webpack';


require('dotenv').config({
  path: '../.env',
}); // load env sett ings from .env file


const config: StorybookConfig = {
  stories: [
    // '../src/**/*.mdx' ,
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/fortress/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    '@storybook/addon-storysource',
    '@storybook/addon-mdx-gfm',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-styling',
      options: {
        cssBuildRule: {
          test: /\.[s]?css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                modules: {
                  mode: 'global',
                  localIdentName: '[path][name]__[local]',
                },
              },
            },
            { loader: 'postcss-loader' },
            {
              loader: 'sass-loader',
              options: {
              },
            },
          ],
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  core: {},
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // speeds up storybook build time
      // allowSyntheticDefaultImports: false,
      // speeds up storybook build time
      // esModuleInterop: false,
      // makes union prop types like variant and size appear as select controls
      shouldExtractLiteralValuesFromEnum: true,
      // makes string and boolean types that can be undefined appear as inputs and switches
      shouldRemoveUndefinedFromOptional: true,
      // Filter out third-party props from node_modules except @mui packages
      propFilter: (prop) => (prop.parent ? !/node_modules\/(?!@mui)/.test(prop.parent.fileName) : true),
    },
  },
  docs: {
    autodocs: true,
  },
  webpackFinal: async (config) => {
      // I think it's a bad solution, but i have no option
      config.resolve!.modules = [path.resolve(__dirname, '../src'), 'node_modules'];
      const phrases = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, `../src/lang/${process.env.LANGUAGE}.json`), 'utf-8')
      );
      const locale = process.env?.LANGUAGE?.split('-')[0];
      const host = process.env.ONE_PIECE_WEB_SERVER_NAME;
      const baseRoute = process.env.BASE_ROUTE;
  
      config.plugins!.push(
        new webpack.DefinePlugin({
          // ....
          __SERVER__: JSON.stringify(false),
          __CLIENT__: JSON.stringify(true),
          //....
          __DEVELOPMENT__: JSON.stringify(process.env.NODE_ENV !== 'production'),
          //
          __ONE_PIECE_WEB_SERVER_NAME__: JSON.stringify(process.env.ONE_PIECE_WEB_SERVER_NAME),
          __PORT__: JSON.stringify(process.env.PORT),
          // Below should be passed via .env except port
          __APPLICATION_ENV__: JSON.stringify(process.env.APPLICATION_ENV),
          __HOST__: JSON.stringify(process.env.DEV_HOST),
          __APIHOST__: JSON.stringify(process.env.APIHOST),
          __TIME_ZONE__: JSON.stringify(process.env.TIME_ZONE),
          __COUNTRY__: JSON.stringify(process.env.COUNTRY),
          __CURRENCY__: JSON.stringify(process.env.CURRENCY),
          __BASE_ROUTE__: JSON.stringify(baseRoute),
          __BASE_URL__: JSON.stringify(`${host}${baseRoute}`),
          __FACEBOOK_CLIENT_ID__: JSON.stringify(process.env.FACEBOOK_CLIENT_ID),
          __GOOGLE_MAP_API_KEY__: JSON.stringify(process.env.GOOGLE_MAP_API_KEY),
          __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
          __FULLSTORY_ENABLED__: process.env.FULLSTORY_ENABLED === 'true',
          __LOCALE__: JSON.stringify(process.env.LANGUAGE?.split('-')[0]),
          __PHRASES__: JSON.stringify(phrases),
          __ZIP_ENABLED__: process.env.ZIP_ENABLED === 'true',
          __INSTALMENT_ENABLED__: process.env.INSTALMENT_ENABLED === 'true',
          __INSTALMENT_URL__: JSON.stringify(process.env.INSTALMENT_URL),
          __INSTALMENT_ENCRYPT__: JSON.stringify(process.env.INSTALMENT_ENCRYPT),
          __PAYPAL_ENABLED__: process.env.PAYPAL_ENABLED === 'true',
          __PAYPAL_CLIENT_ID__: JSON.stringify(process.env.PAYPAL_CLIENT_ID),
          __AFFIRM_ENABLED__: process.env.AFFIRM_ENABLED === 'true',
          __GRABPAY_ENABLED__: process.env.GRABPAY_ENABLED === 'true',
          __AFFIRM_PUBLIC_KEY__: JSON.stringify(process.env.AFFIRM_PUBLIC_KEY),
          __AFFIRM_SCRIPT__: JSON.stringify(process.env.AFFIRM_SCRIPT),
          __APP_VERSION__: JSON.stringify(process.env.APP_VERSION),
          __APP_ENV__: JSON.stringify(process.env.APP_ENV),
          __APP_NAME__: JSON.stringify(process.env.APP_NAME),
          __RECAPTCHA_KEY__: JSON.stringify(process.env.RECAPTCHA_KEY),
          __ZIP_PUBLIC_KEY__: JSON.stringify(process.env.ZIP_PUBLIC_KEY),
          __STRIPE_ENABLED__: process.env.STRIPE_ENABLED === 'true',
          __GTM_ID__: JSON.stringify(process.env.GTM_ID),
          __GOOGLE_MERCHANT_ID__: process.env.GOOGLE_MERCHANT_ID,
          __FRESHCHAT_ENABLED__: process.env.FRESHCHAT_ENABLED === 'true',
          __FRESHCHAT_ID__: JSON.stringify(process.env.FRESHCHAT_ID),
          __GOOGLE_REVIEW_ENABLED__: process.env.GOOGLE_REVIEW_ENABLED === 'true',
          __DY_ENABLED__: process.env.DY_ENABLED === 'true',
          __DY_SECTION_ID__: JSON.stringify(process.env.DY_SECTION_ID),
          __PODCAST_PIXEL_ID__: JSON.stringify(process.env.PODCAST_PIXEL_ID),
          __DATADOG_APPLICATION_ID__: JSON.stringify(process.env.DATADOG_APPLICATION_ID),
          __DATADOG_CLIENT_TOKEN__: JSON.stringify(process.env.DATADOG_CLIENT_TOKEN),
          __KLAVIYO_PUBLIC_KEY__: JSON.stringify(process.env.KLAVIYO_PUBLIC_KEY),
          __SERVER_DY_API_KEY__: JSON.stringify(process.env.SERVER_DY_API_KEY),
          __CLIENT_DY_API_KEY__: JSON.stringify(process.env.CLIENT_DY_API_KEY),
          __APPLE_CLIENT_ID__: JSON.stringify(process.env.APPLE_CLIENT_ID),
          __MULBERRY_PUBLIC_TOKEN__: JSON.stringify(process.env.MULBERRY_PUBLIC_TOKEN),
          __MULBERRY_SDK__: JSON.stringify(process.env.MULBERRY_SDK),
          __GOOGLE_CLIENT_ID__: JSON.stringify(process.env.GOOGLE_CLIENT_ID),
          __YOTPO_GUID__: JSON.stringify(process.env.YOTPO_GUID),
          __YOTPO_API_KEY__: JSON.stringify(process.env.YOTPO_API_KEY),
          __YOTPO_REWARDS_ID__: JSON.stringify(process.env.YOTPO_REWARDS_ID),
          __YOTPO_REFERRAL_ID__: JSON.stringify(process.env.YOTPO_REFERRAL_ID),
          __YOTPO_REFERRAL_POPUP_ID__: JSON.stringify(process.env.YOTPO_REFERRAL_POPUP_ID),
          __YOTPO_ENABLED__: process.env.YOTPO_ENABLED === 'true',
          __FRIENDBUY_ENABLED__: process.env.FRIENDBUY_ENABLED === 'true',
          __GLADLY_HC_API__: JSON.stringify(process.env.GLADLY_HC_API),
          __GLADLY_HC_ORGID__: JSON.stringify(process.env.GLADLY_HC_ORGID),
          __GLADLY_HC_BRANDID__: JSON.stringify(process.env.GLADLY_HC_BRANDID),
          __GLADLY_CDN__: JSON.stringify(process.env.GLADLY_CDN),
          __GLADLY_APPID__: JSON.stringify(process.env.GLADLY_APPID),
          __GLADLY_ENABLED__: process.env.GLADLY_ENABLED === 'true',
          __PINTEREST_ENABLED__: JSON.stringify(process.env.PINTEREST_ENABLED === 'true'),
          __PAPERFORM_ID__: JSON.stringify(process.env.PAPERFORM_ID),
          __OPEN_GRADUATE_APPLICATION__: JSON.stringify(process.env.OPEN_GRADUATE_APPLICATION === 'true'),
          __GRADUATE_PROGRAM_GREENHOUSE__: JSON.stringify(process.env.GRADUATE_PROGRAM_GREENHOUSE),
          __STORYBLOK_ACCESS_TOKEN__: JSON.stringify(process.env.STORYBLOK_ACCESS_TOKEN),
          __COOKIEYES_ENABLED__: process.env.COOKIEYES_ENABLED === 'true',
          __COOKIYES_CDN__: JSON.stringify(process.env.COOKIYES_CDN),
          __PASSWORD_ENCRYPTION_PUBLIC_KEY__: JSON.stringify(process.env.PASSWORD_ENCRYPTION_PUBLIC_KEY),
        })
      );
      config.resolve!.fallback = {
        timers: false,
        fs: false,
        async_hooks: false,
        stream: false,
        constants: false,
        path: false,
      };
      return config;
  },
};
export default config;
