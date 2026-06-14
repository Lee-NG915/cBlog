import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@castlery/modules-cms-components': resolve(__dirname, './src/index.ts'),
    },
  },
});
