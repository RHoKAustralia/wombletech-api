import { resolve } from 'path';
import { Configuration } from 'webpack';
const { readdirSync } = require('fs')

const getSourceDirectories = () => readdirSync('./src', { withFileTypes: true })
  .filter((entry: any) => entry.isDirectory && entry.name !== 'lib')
  .map((entry: any) => entry.name);

const config: Configuration = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  entry: getSourceDirectories().reduce((acc: any, dirName: any) => {
    acc[dirName] = `./src/${dirName}/app.ts`;
    return acc;
  }, {}),
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