import { defineConfig as defineBaseConfig, Options } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export function defineConfig(opts: Options | Options[]) {
  const options = [opts].flat();
  return defineBaseConfig(
    options.map((opt) => ({
      ...opt,
      clean: isProd,
      sourcemap: !isProd ? 'inline' : false,
      target: opt.target ?? 'es2020',
      outDir: opt.outDir ?? 'dist',
      silent: isProd,
      shims: true,
      minify: isProd,
    })),
  );
}
