'use strict';
const path = require('path');
const webpack = require('webpack');
const slsw = require('serverless-webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SentryPlugin = require('@sentry/webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = (async () => {
  const config = {
    entry: slsw.lib.entries,
    mode:
      process.env.DEPLOYMENT_STAGE && process.env.DEPLOYMENT_STAGE !== 'dev'
        ? 'production'
        : 'development',
    externals: slsw.lib.webpack.isLocal ? [nodeExternals()] : ['aws-sdk'],
    target: 'node',
    ignoreWarnings: [
      {
        module: /^(?!CriticalDependenciesWarning$)/, // A RegExp
      },
      warning => true,
    ],
    stats: {
      modules: false,
      errorDetails: true,
    },
    optimization: {
      minimize: false,
    },
    devtool: 'source-map',
    target: 'node',
    resolve: {
      extensions: ['.js', '.ts'],
      alias: {
        src: path.resolve(__dirname, 'src'),
        graphql$: path.resolve(__dirname, './node_modules/graphql/index.js'),
      },
      symlinks: false,
      cacheWithContext: false,
    },
    node: {
      __dirname: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new CaseSensitivePathsPlugin(),
      new webpack.IgnorePlugin(/^encoding$/, /node-fetch/),
      new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ }),
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/platform-express',
            'cache-manager',
            'class-validator',
            'class-transformer',
            'class-transformer/storage',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
  if (process.env.DEPLOYMENT_STAGE) {
    config.plugins.push(
      new SentryPlugin({
        release: process.env.RELEASE,
        include: '.webpack/service/src',
        environment: process.env.DEPLOYMENT_STAGE.toUpperCase(),
      }),
    );
    config.plugins.push(
      new RemovePlugin({
        after: {
          test: [
            {
              folder: '.webpack/service/src',
              method: absoluteItemPath => {
                return new RegExp(/\.map$/, 'm').test(absoluteItemPath);
              },
              recursive: true,
            },
          ],
        },
      }),
    );
  }
  return config;
})();
