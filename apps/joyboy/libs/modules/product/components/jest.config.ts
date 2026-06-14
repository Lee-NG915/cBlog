/* eslint-disable */
export default {
  displayName: 'modules-product-components',
  preset: '../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      { jsc: { parser: { syntax: 'typescript', tsx: true }, transform: { react: { runtime: 'automatic' } } } },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/modules/product/components',
  transformIgnorePatterns: ['/node_modules/(?!(@mui|@emotion|react-slick)/)'],
};
