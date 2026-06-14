/* eslint-disable */
import path from 'path';
export default {
  displayName: 'pos',
  coverageDirectory: '../../coverage/apps/pos',
  testEnvironment: 'jsdom',
  rootDir: path.join(__dirname, '../..'),
  setupFiles: [
    path.join(__dirname, './setupTests.ts'), // 环境配置
    path.join(__dirname, './setupReducers.tsx'), //store配置
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  // todo: 这里的collectCoverageFrom不生效
  collectCoverage: true, // 启用覆盖率收集
  coverageReporters: ['json', 'html', 'text'], // 输出覆盖率报告的格式
  collectCoverageFrom: [
    '../../libs/modules/checkout/**/checkbox-terms/*.(spec|test).(ts|tsx|js)',
    path.join(__dirname, '../../libs/modules/checkout/**/add-stripe-link-button/*.(spec|test).(ts|tsx|js)'),
  ],
  testMatch: [
    path.join(__dirname, '../../libs/modules/checkout/**/add-payments/*.(spec|test).(ts|tsx|js)'),
    // path.join(__dirname, '../../libs/modules/checkout/**/add-stripe-link-button/*.(spec|test).(ts|tsx|js)'),
  ],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
    '^.+\\.(css|scss)$': 'jest-css-modules-transform',
  },
  transformIgnorePatterns: ['/node_modules/(?!lodash-es).+\\.(js|jsx|ts|tsx)$'], // 转换忽略node_modules下的文件
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // 模块别名配置
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^@castlery/fortress$': path.join(__dirname, '../../libs/fortress/src/index.ts'),
    '^@castlery/fortress/Icons$': path.join(__dirname, '../../libs/fortress/src/Icons/index.ts'),
    '^@castlery/fortress/Theme$': path.join(__dirname, '../../libs/fortress/src/Theme/index.ts'),
    '^@castlery/data-tracking-events$': path.join(__dirname, '../../libs/shared/data-tracking-events/src/index.ts'),
    '^@castlery/config$': path.join(__dirname, '../../libs/config/src/index.ts'),
    '^@castlery/modules-checkout-domain$': path.join(__dirname, '../../libs/modules/checkout/domain/src/index.ts'),
    '^@castlery/fortress/*$': path.join(__dirname, '../../libs/fortress/src/*'),
    '^@castlery/modules-checkout-services$': path.join(__dirname, '../../libs/modules/checkout/services/src/index.ts'),
    '^@castlery/modules-cms-components$': path.join(__dirname, '../../libs/modules/cms/components/src/index.ts'),
    '^@castlery/modules-cms-components/server$': path.join(
      __dirname,
      '../../libs/modules/cms/components/src/server.ts'
    ),
    '^@castlery/modules-cms-domain$': path.join(__dirname, '../../libs/modules/cms/domain/src/index.ts'),
    '^@castlery/modules-cms-services$': path.join(__dirname, '../../libs/modules/cms/services/src/index.ts'),
    '^@castlery/modules-composite-components$': path.join(
      __dirname,
      '../../libs/modules/composite/components/src/index.ts'
    ),
    '^@castlery/modules-composite-components/server$': path.join(
      __dirname,
      '../../libs/modules/composite/components/src/server.ts'
    ),
    '^@castlery/modules-composite-services$': path.join(
      __dirname,
      '../../libs/modules/composite/services/src/index.ts'
    ),
    '^@castlery/modules-order-components$': path.join(__dirname, '../../libs/modules/order/components/src/index.ts'),
    '^@castlery/modules-order-components/server$': path.join(
      __dirname,
      '../../libs/modules/order/components/src/server.ts'
    ),
    '^@castlery/modules-order-domain$': path.join(__dirname, '../../libs/modules/order/domain/src/index.ts'),
    '^@castlery/modules-order-services$': path.join(__dirname, '../../libs/modules/order/services/src/index.ts'),
    '^@castlery/modules-payment-components$': path.join(
      __dirname,
      '../../libs/modules/payment/components/src/index.ts'
    ),
    '^@castlery/modules-payment-components/server$': path.join(
      __dirname,
      '../../libs/modules/payment/components/src/server.ts'
    ),
    '^@castlery/modules-payment-domain$': path.join(__dirname, '../../libs/modules/payment/domain/src/index.ts'),
    '^@castlery/modules-payment-services$': path.join(__dirname, '../../libs/modules/payment/services/src/index.ts'),
    '^@castlery/modules-product-components$': path.join(
      __dirname,
      '../../libs/modules/product/components/src/index.ts'
    ),
    '^@castlery/modules-product-components/server$': path.join(
      __dirname,
      '../../libs/modules/product/components/src/server.ts'
    ),
    '^@castlery/modules-product-domain$': path.join(__dirname, '../../libs/modules/product/domain/src/index.ts'),
    '^@castlery/modules-product-services$': path.join(__dirname, '../../libs/modules/product/services/src/index.ts'),
    '^@castlery/modules-promotion-components$': path.join(
      __dirname,
      '../../libs/modules/promotion/components/src/index.ts'
    ),
    '^@castlery/modules-promotion-components/server$': path.join(
      __dirname,
      '../../libs/modules/promotion/components/src/server.ts'
    ),
    '^@castlery/modules-promotion-domain$': path.join(__dirname, '../../libs/modules/promotion/domain/src/index.ts'),
    '^@castlery/modules-promotion-services$': path.join(
      __dirname,
      '../../libs/modules/promotion/services/src/index.ts'
    ),
    '^@castlery/modules-retails-components$': path.join(
      __dirname,
      '../../libs/modules/retails/components/src/index.ts'
    ),
    '^@castlery/modules-retails-components/server$': path.join(
      __dirname,
      '../../libs/modules/retails/components/src/server.ts'
    ),
    '^@castlery/modules-retails-domain$': path.join(__dirname, '../../libs/modules/retails/domain/src/index.ts'),
    '^@castlery/modules-retails-services$': path.join(__dirname, '../../libs/modules/retails/services/src/index.ts'),
    '^@castlery/modules-tracking-domain$': path.join(__dirname, '../../libs/modules/tracking/domain/src/index.ts'),
    '^@castlery/modules-tracking-services$': path.join(__dirname, '../../libs/modules/tracking/services/src/index.ts'),
    '^@castlery/modules-user-components$': path.join(__dirname, '../../libs/modules/user/components/src/index.ts'),
    '^@castlery/modules-user-components/server$': path.join(
      __dirname,
      '../../libs/modules/user/components/src/server.ts'
    ),
    '^@castlery/modules-user-domain$': path.join(__dirname, '../../libs/modules/user/domain/src/index.ts'),
    '^@castlery/modules-user-services$': path.join(__dirname, '../../libs/modules/user/services/src/index.ts'),
    '^@castlery/pos/(.*)$': path.join(__dirname, '../../apps/pos/$1'),
    '^@castlery/shared-components$': path.join(__dirname, '../../libs/shared/components/src/index.ts'),
    '^@castlery/shared-components/server$': path.join(__dirname, '../../libs/shared/components/src/server.ts'),
    '^@castlery/shared-next-font$': path.join(__dirname, '../../libs/shared/next-font/src/index.ts'),
    '^@castlery/shared-next-font/server$': path.join(__dirname, '../../libs/shared/next-font/src/server.ts'),
    '^@castlery/shared-persistence-kit$': path.join(__dirname, '../../libs/shared/persistence-kit/src/index.ts'),
    '^@castlery/shared-redux-core$': path.join(__dirname, '../../libs/shared/redux/core/src/index.ts'),
    '^@castlery/shared-redux-extra$': path.join(__dirname, '../../libs/shared/redux/extra/src/index.ts'),
    '^@castlery/shared-redux-services$': path.join(__dirname, '../../libs/shared/redux/services/src/index.ts'),
    '^@castlery/shared-redux-store$': path.join(__dirname, '../../libs/shared/redux/store/src/index.ts'),
    '^@castlery/shared-services$': path.join(__dirname, '../../libs/shared/services/src/index.ts'),
    '^@castlery/storybook-host$': path.join(__dirname, '../../libs/storybook-host/src/index.ts'),
    '^@castlery/types$': path.join(__dirname, '../../libs/shared/types/src/index.ts'),
    '^@castlery/utils$': path.join(__dirname, '../../libs/shared/utils/src/index.ts'),
  },
};
