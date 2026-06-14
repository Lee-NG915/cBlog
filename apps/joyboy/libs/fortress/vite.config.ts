/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import react from '@vitejs/plugin-react';
import preserveDirectives from 'rollup-plugin-preserve-directives';
// import mdx from '@mdx-js/rollup';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import fs from 'fs';
import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';

const OUTPUT_DIR = '../../dist/libs/fortress';
const CJS_DIR = `${OUTPUT_DIR}/cjs`;

// src下所有的index.ts文件
const inputs = Object.fromEntries(
  // path
  // globSync(['src/**/index.ts', 'src/index.ts']).map((file) => {
  globSync([path.join(__dirname, 'src/**/index.{ts,tsx}')], {
    // spec, test, stories.{ts,tsx}, d.ts
    ignore: ['**/*.{spec,test,stories,d}.ts', '**/*.{spec,test,stories}.tsx'],
  }).map((file) => {
    const entryName = path.relative(
      path.join(__dirname, 'src'),
      file.slice(0, file.length - path.extname(file).length)
    );
    const entryUrl = fileURLToPath(new URL(file, import.meta.url));
    return [entryName, entryUrl];
  })
);

// array
// const entries =
//   // 所有的index.ts文件
//   globSync([path.join(__dirname, 'src/**/index.ts'), path.join(__dirname, 'src/index.ts')]).map((file) => {
//     const entryUrl = fileURLToPath(new URL(file, import.meta.url));
//     return entryUrl;
//   });

// console.log('entries', entries);

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/fortress',
  plugins: [
    // mdx(),
    react(),
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      // skipDiagnostics: true,
      outDir: [OUTPUT_DIR, CJS_DIR],
    }),
    preserveDirectives(),
    // build之后 copy package.json到outDir
    {
      name: 'copy-package-json',
      apply: 'build',
      closeBundle() {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
        // 修改package.json中的main, module, types, exports字段
        packageJson.main = './cjs/index.js';
        packageJson.module = './index.js';
        packageJson.types = './index.d.ts';
        // 移除exports
        // delete packageJson.exports;
        packageJson.exports = {
          '.': {
            import: './index.js',
            require: './cjs/index.js',
          },
          './*': {
            import: './*/index.js',
            require: './cjs/*/index.js',
          },
        };
        // 输出到outDir
        fs.writeFileSync(path.join(__dirname, OUTPUT_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
      },
    },
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: OUTPUT_DIR,
    minify: false,
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    // 添加 esbuild 配置以处理 .tsx 文件
    target: 'es2015',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // 'react/jsx-dev-runtime',
        '@emotion/react',
        '@emotion/react/jsx-runtime',
        '@emotion/styled',
        /^@mui\/joy(\/.*)?$/,
        /^@mui\/material(\/.*)?$/,
        // /^@mui\/base(\/.*)?$/,
      ],
      input: {
        ...inputs,
      },
      output: [
        {
          format: 'es',
          // entryFileNames: '[name].js',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name.includes('node_modules')) {
              return chunkInfo.name.replace('node_modules', 'external') + '.js';
            }
            return '[name].js';
          },
          preserveModules: true,
          preserveModulesRoot: path.resolve(__dirname, 'src'),
          exports: 'named',
          dir: path.resolve(__dirname, `${OUTPUT_DIR}`),
        },
        {
          generatedCode: {
            symbols: false,
          },
          esModule: true,
          interop: 'auto',
          exports: 'named',
          format: 'cjs',
          // entryFileNames: '[name].js',
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name.includes('node_modules')) {
              return chunkInfo.name.replace('node_modules', 'external') + '.js';
            }

            return '[name].js';
          },
          preserveModules: true,
          preserveModulesRoot: path.resolve(__dirname, 'src'),
          dir: path.resolve(__dirname, `${CJS_DIR}`),
        },
      ],
    },
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/fortress',
      provider: 'v8',
    },
  },
});
