import type { IServiceOptions } from './core.service';
import { CoreService } from './core.service';

type IWebpackServiceOptions = IServiceOptions;

export class WebpackService extends CoreService {
  constructor(opts: IWebpackServiceOptions = {} as IWebpackServiceOptions) {
    super(opts);
  }
}
