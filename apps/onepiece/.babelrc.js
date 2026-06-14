module.exports = {
  presets: ['@babel/preset-env', 
    ["@babel/preset-react",{
      "runtime": "automatic"
    }], 
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-transform-runtime',
    // 已集成到 @babel/preset-env
    // '@babel/plugin-proposal-class-properties',
    // 已集成到 @babel/preset-env
    // '@babel/plugin-syntax-dynamic-import',
    // 已集成到 @babel/preset-env
    // '@babel/plugin-proposal-optional-chaining',
    '@loadable/babel-plugin',
    // 'lodash'
  ],
};
