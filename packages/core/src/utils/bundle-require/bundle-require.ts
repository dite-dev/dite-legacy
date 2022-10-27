import { build, BuildResult, Loader, Plugin as EsbuildPlugin } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { loadTsConfig } from './load-tsconfig';
import { getRandomId, __require } from './utils';

export const JS_EXT_RE = /\.(mjs|cjs|ts|js|tsx|jsx)$/;

function inferLoader(ext: string): Loader {
  if (ext === '.mjs' || ext === '.cjs') return 'js';
  return ext.slice(1) as Loader;
}

export { loadTsConfig };

export type GetOutputFile = (filepath: string) => string;

export interface Options {
  /**
   * The filepath to bundle and require
   */
  filepath: string;
}

// Use a random path to avoid import cache
const defaultGetOutputFile: GetOutputFile = (filepath) =>
  filepath.replace(JS_EXT_RE, `.bundled_${getRandomId()}.${'cjs'}`);

export const tsconfigPathsToRegExp = (paths: Record<string, any>) => {
  return Object.keys(paths || {}).map((key) => {
    return new RegExp(`^${key.replace(/\*/, '.*')}$`);
  });
};

export const match = (id: string, patterns?: (string | RegExp)[]) => {
  if (!patterns) return false;
  return patterns.some((p) => {
    if (p instanceof RegExp) {
      return p.test(id);
    }
    return id === p || id.startsWith(p + '/');
  });
};

/**
 * An esbuild plugin to mark node_modules as external
 */
export const externalPlugin = ({
  external,
  notExternal,
}: {
  external?: (string | RegExp)[];
  notExternal?: (string | RegExp)[];
} = {}): EsbuildPlugin => {
  return {
    name: 'bundle-require:external',
    setup(ctx) {
      ctx.onResolve({ filter: /.*/ }, async (args) => {
        if (args.path[0] === '.' || path.isAbsolute(args.path)) {
          // Fallback to default
          return;
        }

        if (match(args.path, external)) {
          return {
            external: true,
          };
        }

        if (match(args.path, notExternal)) {
          // Should be resolved by esbuild
          return;
        }

        // Most like importing from node_modules, mark external
        return {
          external: true,
        };
      });
    },
  };
};

export const replaceDirnamePlugin = (): EsbuildPlugin => {
  return {
    name: 'bundle-require:replace-path',
    setup(ctx) {
      ctx.onLoad({ filter: JS_EXT_RE }, async (args) => {
        const contents = await fs.promises.readFile(args.path, 'utf-8');
        return {
          contents: contents
            .replace(/[^"'\\]\b__filename\b[^"'\\]/g, (match) =>
              match.replace('__filename', JSON.stringify(args.path)),
            )
            .replace(/[^"'\\]\b__dirname\b[^"'\\]/g, (match) =>
              match.replace(
                '__dirname',
                JSON.stringify(path.dirname(args.path)),
              ),
            )
            .replace(/[^"'\\]\bimport\.meta\.url\b[^"'\\]/g, (match) =>
              match.replace(
                'import.meta.url',
                JSON.stringify(`file://${args.path}`),
              ),
            ),
          loader: inferLoader(path.extname(args.path)),
        };
      });
    },
  };
};

export async function bundleRequire<T = any>(
  options: Options,
): Promise<{
  mod: T;
  dependencies: string[];
}> {
  if (!JS_EXT_RE.test(options.filepath)) {
    throw new Error(`${options.filepath} is not a valid JS file`);
  }

  const preserveTemporaryFile = !!process.env.BUNDLE_REQUIRE_PRESERVE;
  const cwd = process.cwd();
  const resolvePaths = tsconfigPathsToRegExp({});

  const extractResult = async (result: BuildResult) => {
    if (!result.outputFiles) {
      throw new Error(`[bundle-require] no output files`);
    }

    const { text } = result.outputFiles[0];

    const getOutputFile = defaultGetOutputFile;
    const outfile = getOutputFile(options.filepath);

    await fs.promises.writeFile(outfile, text, 'utf8');

    let mod: any;
    try {
      mod = await __require(outfile);
    } finally {
      if (!preserveTemporaryFile) {
        // Remove the outfile after executed
        await fs.promises.unlink(outfile);
      }
    }

    return {
      mod,
      dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
    };
  };

  const result = await build({
    entryPoints: [options.filepath],
    absWorkingDir: cwd,
    outfile: 'out.js',
    format: 'cjs',
    platform: 'node',
    sourcemap: 'inline',
    bundle: true,
    metafile: true,
    write: false,
    plugins: [
      externalPlugin({
        notExternal: resolvePaths,
      }),
      replaceDirnamePlugin(),
    ],
  });

  return extractResult(result);
}
