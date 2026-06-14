import { formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { ComponentGeneratorSchema } from './schema';
import { pascal } from 'case';
import { cwd } from 'process';
export async function fortressComponentGenerator(tree: Tree, options: ComponentGeneratorSchema) {
  // 只能获取到当前workspace根目录
  const relativePath = path.relative(tree.root, cwd());
  console.log(relativePath); // 输出 'libs/fortress'
  options.componentName = pascal(options.name); //转换name为大驼峰
  const projectRoot = `${options.name}`;
  const targetDirectory = `${relativePath}/${projectRoot}`; // 获取当前目录
  generateFiles(tree, path.join(__dirname, 'files'), targetDirectory, options);
  await formatFiles(tree);
}

export default fortressComponentGenerator;
