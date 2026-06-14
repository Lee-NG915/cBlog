import { getJestProjects } from '@nx/jest';
export default {
  projects: getJestProjects(),
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['./libs/modules/**/*.test.tsx', './libs/modules/**/*.spec.tsx'],
  collectCoverage: true, // 启用覆盖率收集
  coverageReporters: ['json', 'html', 'text'], // 输出覆盖率报告的格式
  collectCoverageFrom: [
    './libs/modules/**/*.tsx', // 收集模块文件夹下的所有 .tsx 文件的覆盖率
  ],
};
