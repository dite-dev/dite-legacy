import { defineConfig as defineBaseConfig, Options } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export function defineConfig(opts: Options | Options[]) {
  const options = [opts].flat();
  options.forEach((opt) => {
    opt.clean = isProd;
    opt.minify = isProd;
    opt.sourcemap = !isProd;
  });
  return defineBaseConfig(options);
}
