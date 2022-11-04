import webpack from 'webpack';
export { esbuildLoader } from './loader/esbuild';
export async function build(config: webpack.Configuration) {
  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      console.log(err);
      if (stats?.hasErrors()) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

export async function serve() {}

export async function dev() {}
