import type { DiteAdapter, DiteIntegration } from 'dite';

export function getAdapter(): DiteAdapter {
  return {
    name: 'dite:adapter:node',
    serverEntrypoint: 'server/main.ts',
    exports: ['createServer'],
  };
}

export function createIntegration(): DiteIntegration {
  return {
    name: 'dite:adapter:node',
    hooks: {
      onConfigDone({ config, setAdapter }) {
        setAdapter(getAdapter());
      },
    },
  };
}

export default createIntegration;
