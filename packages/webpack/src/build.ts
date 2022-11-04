import path from 'path';
import webpack from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

export async function build(config: webpack.Configuration) {
  const virtualModules = new VirtualModulesPlugin();
  config.plugins?.push(virtualModules);
  const compiler = webpack(config);

  const writeVirtualFile = (requireId: string, content: string) => {
    virtualModules.writeModule(
      path.resolve('node_modules', requireId, 'index.js'),
      content,
    );
  };
  writeVirtualFile(
    '@fs-dite/routes',
    `
  export default { 
    routes: [],
    ssr: true,
    date: ${Date.now()}
  }
  `,
  );
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (stats?.hasErrors()) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}
