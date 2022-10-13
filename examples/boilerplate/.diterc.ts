import node from '@dite/node';
import { defineConfig } from 'dite';

export default defineConfig({
  port: 3001,
  adapter: [node()],
});
