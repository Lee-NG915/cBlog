/* eslint-disable */
import { readFileSync } from 'fs';

const { exclude: _, ...swcJestConfig } = JSON.parse(readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

export default {
  displayName: 'modules-payment-actions',
  preset: '../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../../../coverage/libs/modules/payment/actions',
};
