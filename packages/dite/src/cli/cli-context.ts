import { ServerMode } from '@dite/core/config';

export class Context {
  public readonly root: string;
  public readonly mode: ServerMode;

  constructor(opts: { root: string; mode: ServerMode }) {
    this.root = opts.root;
    this.mode = opts.mode;
  }
}
