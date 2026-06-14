const fs = require('fs');

// 读取 package.json 文件
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const map = [
  '@testing-library/dom',
  'dotenv',
  'identity-obj-proxy',
  'jest-css-modules-transform',
  'jest-fetch-mock',
  'redux',
  'redux-mock-store',
];
// 检查并初始化 devDependencies
if (!packageJson.devDependencies) {
  packageJson.devDependencies = {};
}

const newJson = {};
// 将 dependencies 转移到 devDependencies
for (const [key, value] of Object.entries(packageJson.dependencies)) {
  if (map.includes(key)) {
    packageJson.devDependencies[key] = value;
  } else {
    newJson[key] = value;
  }
}

// 清空 dependencies
packageJson.dependencies = newJson;

// 写回 package.json 文件
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf8');

console.log('Dependencies have been moved to devDependencies.');
