import esbuild from 'esbuild';
import fs from 'fs-extra';
import { dirname, sep } from 'path';
import { IConfig } from '../config';

export async function build(
  config: IConfig,
  options: { mode: 'development' | 'production' },
) {
  return esbuild
    .build({
      absWorkingDir: config.root,
      entryPoints: { index: 'server/main.ts' },
      outdir: config.serverBuildPath,
      jsx: 'automatic',
      write: false,
      format: 'cjs',
      minify: options.mode === 'production',
      platform: 'node',
      bundle: true,
      // splitting: true,
      keepNames: true,
      treeShaking: true,
      external: [
        '@nestjs/microservices',
        'class-transformer',
        'cache-manager',
        'class-validator',
        '@nestjs/websockets',
        '@nestjs/core',
        '@nestjs/common',
      ],
      // stdin: {
      //   contents: `export * from ${JSON.stringify(
      //     '@dite/node'
      //   )};\``,
      //   resolveDir: root,
      //   loader: 'ts'
      // }
    })
    .then(async (build) => {
      await writeServerBuildResult(
        { serverBuildPath: config.serverBuildPath },
        build.outputFiles,
      );
      return build;
    });
}

export async function writeServerBuildResult(
  config: { serverBuildPath: string },
  outputFiles: esbuild.OutputFile[],
) {
  fs.ensureDir(dirname(config.serverBuildPath));
  for (const file of outputFiles) {
    if (file.path.endsWith('.js')) {
      // fix sourceMappingURL to be relative to current path instead of /build
      const filename = file.path.substring(file.path.lastIndexOf(sep) + 1);
      const escapedFilename = filename.replace(/\./g, '\\.');
      const pattern = `(//# sourceMappingURL=)(.*)${escapedFilename}`;
      let contents = Buffer.from(file.contents).toString('utf-8');
      contents = contents.replace(new RegExp(pattern), `$1${filename}`);
      await fs.writeFile(file.path, contents);
    } else if (file.path.endsWith('.map')) {
      // remove route: prefix from source filenames so breakpoints work
      let contents = Buffer.from(file.contents).toString('utf-8');
      contents = contents.replace(/"route:/gm, '"');
      await fs.writeFile(file.path, contents);
    } else {
      await fs.ensureDir(dirname(file.path));
      await fs.writeFile(file.path, file.contents);
    }
  }
}
