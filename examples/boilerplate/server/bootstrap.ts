import { logger } from '@dite/utils';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// const useVite = true;

// const adapter = hook(
//   async ({ addMiddleware, addRequestHandler, config, vite }) => {
//     logger.debug('dite adapter start');
//     if (useVite) {
//       addMiddleware(vite.middlewares);
//       logger.debug('dite adapter vite.middlewares');
//       const htmlTemplate = fs.readFileSync(
//         path.resolve(config.root, 'app/index.html'),
//         'utf-8',
//       );
//       addRequestHandler('*', async (req, res, next) => {
//         const url = req.originalUrl;
//         if (url.startsWith('/api')) {
//           next();
//           return;
//         }

//         try {
//           const template = await vite.transformIndexHtml(url, htmlTemplate);
//           const { render } = await vite.ssrLoadModule('/app/entry-server.ts');
//           const appHtml = await render(url);
//           const html = template.replace('<!--ssr-outlet-->', appHtml);
//           res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
//         } catch (e) {
//           // vite.ssrFixStacktrace(e);
//           console.error(e);
//           next();
//         }
//       });
//     }
//   },
// );
// export default adapter;

export async function bootstrap(opts) {
  const { config } = opts;
  logger.debug('createServer');
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
  logger.debug('finish listen');
  return app;
}
