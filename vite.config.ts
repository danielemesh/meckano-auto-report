import { resolve } from 'path';
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es']
    },
    minify: false,
    modulePreload: {
      polyfill: false
    }
  }
})