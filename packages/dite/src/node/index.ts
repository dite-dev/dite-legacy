import type { DiteAdapter, DiteConfig, DiteIntegration } from './core/config';
import { defineConfig } from './core/config';
import { matchRoutes } from './core/router';

export type { DiteConfig, DiteIntegration, DiteAdapter };
export { defineConfig, matchRoutes };
