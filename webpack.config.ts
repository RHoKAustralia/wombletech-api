import { resolve } from 'path';
import { Configuration } from 'webpack';
const glob = require('glob');

const isProduction = process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';
console.info(`Build type: ${mode}`);

type LambdaFolder = {
  path: string;
  name: string;
}

const expr = /\.\/src\/(.+)\/app.ts$/;
const paths: LambdaFolder[] = glob.sync('./src/**/app.ts')
  .map((path: string) => path.match(expr))
  .map((match: any) => ({ path: match[0], name: match[1] }));

console.log(paths);  

const config: Configuration = {
  mode: mode,
  devtool: isProduction ? false : 'eval-cheap-module-source-map',
  entry: paths.reduce((acc: any, lambda) => {
    acc[lambda.name] = lambda.path;
    return acc;
  }, {}),
  externals: isProduction ? ['aws-sdk'] : [],
  output: {
    filename: '[name]/app.js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'dist'),
  },
  // more
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  target: 'node',
};

export default config;