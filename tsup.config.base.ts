import { defineConfig as defineBaseConfig, Options } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export function defineConfig(opts: Options | Options[]) {
  const options = [opts].flat();
  return defineBaseConfig(
    options.map((opt) => ({
      ...opt,
      clean: true,
      sourcemap: !isProd ? 'inline' : false,
      target: opt.target ?? 'es2020',
      outDir: opt.outDir ?? 'dist',
      silent: true,
      shims: true,
      minify: isProd,
    })),
  );
}
