import Config from 'webpack-5-chain';

type IConfigOptions = {
  entry: string[];
};

export async function getConfig(opts: IConfigOptions) {
  const config = new Config();

  return config;
}
