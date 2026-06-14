/* eslint-disable */
export default {
  displayName: 'fortress',
  preset: '../../jest.preset.js',
  collectCoverage: true, //覆盖率收集
  coverageDirectory: '../../coverage/libs/fortress', // 设置覆盖率报告的输出目录
  coverageReporters: ['json', 'lcov', 'text', 'clover'], // 设置覆盖率报告的格式
  collectCoverageFrom: [
    'libs/fortress/src/**/*.{js,jsx,ts,tsx}', // 指定需要收集覆盖率信息的文件路径模式
    '!src/**/*.stories.{js,jsx,ts,tsx}', // 排除 Storybook stories
    '!src/**/index.{js,jsx,ts,tsx}', // 排除 index 文件
  ],
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // 添加以下配置解决 Haste 模块冲突
  modulePathIgnorePatterns: ['<rootDir>/dist/'],

  // 增加测试超时时间
  testTimeout: 30000,
};
