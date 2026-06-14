const fs = require('fs');
const path = require('path');

// TODO 后续再思考弄成webpack的 或者别的方式吧
const directoryPath = path.join(__dirname, './svg');
const exportStatements = [`export * from './map';`];

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(JSON.stringify({ message: 'Icon generation error', error: '无法读取目录: ' + err?.toString() }, null, 2));
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);

    if (path.extname(filePath) === '.tsx') {
      const fileName = path.basename(file, '.tsx');
      const exportStatement = `export { default as ${fileName} } from './svg/${fileName}';`;
      exportStatements.push(exportStatement);
    }
  });

  const output = exportStatements.join('\n');

  fs.writeFileSync(path.join(__dirname,'index.ts'), output);

  console.log('导出语句已写入到 map2.ts 文件');
});
