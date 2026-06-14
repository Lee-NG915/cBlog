/* eslint-disable */
import path from 'path';
export default {
  displayName: 'web',
  rootDir: path.join(__dirname, '../..'),
  // preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  testMatch: [
    // '<rootDir>/libs/modules/checkout/**/*.spec.{ts,tsx,js}',
    '<rootDir>/libs/modules/checkout/**/assembly-service/*.(spec|test).(ts|tsx|js)',
    // path.join(__dirname, '../../libs/modules/checkout/*.(spec|test).(ts|tsx|js)'),
  ],
};
