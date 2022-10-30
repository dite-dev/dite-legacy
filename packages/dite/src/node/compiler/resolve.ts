import type { Plugin } from 'esbuild';

export const resolvePlugin = (): Plugin => {
  return {
    name: 'dite-server-resolve',
    async setup(build) {},
  };
};
