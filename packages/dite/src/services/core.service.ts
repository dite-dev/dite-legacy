import loadPkg from './utils/load-pkg';

export type CommandName = 'start' | 'build' | 'dev' | 'routes';

export type IServiceOptions = {
  command: CommandName;
  root?: string;
};

export type DiteConfig = {
  root?: string;
};

export type DiteUserConfig = Partial<DiteConfig>;

type Json = Record<
  string,
  string | number | boolean | Date | Record<string, any>
>;

export class CoreService {
  public command: CommandName;
  public root: string;
  public pkg: Json;
  constructor(opts: IServiceOptions = {} as IServiceOptions) {
    const { command, root = process.cwd() } = opts || {};
    this.command = command;
    this.pkg = loadPkg(root);
    this.root = root;
  }
}
