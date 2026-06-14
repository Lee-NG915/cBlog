import path from 'node:path';
import ejs from 'ejs';
import fs from 'node:fs';

/**
 * @description 生成.env.development文件
 * @param --country=sg,au,us
 * @demo pnpm nx run pos:init-env:development --country=au
 */

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const templatePath = path.resolve(__dirname, '../../../etc/templates/env.ejs');  // template file
const outputPath = path.resolve(__dirname, '../../../.env.serve.development');   // output file

// 获取命令参数
const args = process.argv.slice(2);
/**
 * --country=sg,au,us
 */
const params =
  Object.fromEntries(
    args.reduce((pre, item) => {
      if (item.startsWith('--')) {
        return [...pre, item.slice(2).split('=')];
      }
      return pre;
    }, [])
  ) || {};

if (!params.country) {
  console.error('Please provide a country parameter, e.g. --country=sg,au,us');
  process.exit(1);
}

// 获取json文件
const jsonFile = path.resolve(__dirname, `../../../env.${params.country}.json`);
const secretData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
console.log('secretData', secretData);

const template = fs.readFileSync(templatePath, 'utf8');
const result = ejs.render(template, secretData);
fs.writeFileSync(outputPath, result);

console.log(`.env.local file generated successfully!`);
