import type { RequestHandler } from 'express';

interface Interface {
  new (...input: any): any;
}

export interface NodeHookOptions {
  addMiddleware: (...input: (Interface | RequestHandler)[]) => void;
  addRequestHandler: any;
  config: any;
}

export type NodeAttacher = (options: NodeHookOptions) => Promise<void> | void;

export function hook(opts: NodeAttacher): NodeAttacher {
  return opts;
}
