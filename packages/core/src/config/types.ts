import { ServerMode } from './server-mode';

export interface DiteAdapter {
  name: string;
  serverEntrypoint?: string;
  exports?: string[];
  args?: any;
}

export interface DiteIntegration {
  name: string;
  hooks?: {
    onConfigDone?: (options: {
      config: DiteConfig;
      setAdapter: (adapter: DiteAdapter) => void;
    }) => void | Promise<void>;
  };
}

export interface DiteConfig {
  port: number;
  serverBuildPath: string;
  buildPath: string;
  root: string;
  mode: ServerMode;
  adapter?: DiteIntegration[];
}

export type DiteUserConfig = Partial<DiteConfig>;
