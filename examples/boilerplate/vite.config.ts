import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { dirname, resolve } from 'path';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: resolve(__dirname, 'app', 'public'),
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      // @ts-ignore
      '@': fileURLToPath(new URL('app', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: [
      'reflect-metadata',
      '@nestjs/microservices',
      '@nestjs/websockets',
      'cache-manager',
      'class-transformer',
      'class-validator',
    ],
  },
});
