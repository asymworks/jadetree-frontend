/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const webpack = require('webpack');

// Load Version from package.json
const packageJson = fs.readFileSync('./package.json');
const version = JSON.parse(packageJson).version || 0;

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_VERSION: `"${version}"`,
        },
      }),
    ],
  },
  chainWebpack: (config) => {
    if (config.plugins.has('prefetch')) {
      config.plugin('prefetch').tap((options) => {
        options[0].fileBlacklist = options.fileBlacklist || [];
        options[0].fileBlacklist.push(/\.map$/);
        options[0].fileBlacklist.push(/l10n/);
        return options;
      });
    }

    if (config.plugins.has('html')) {
      config.plugin('html').tap((options) => {
        options[0].title = 'Jade Tree';
        return options;
      });
    }

    if (config.plugins.has('copy')) {
      if (process.env.NODE_ENV === 'production') {
        // Do not copy config.json into production folder
        config.plugin('copy').tap((options) => {
          options[0][0].ignore.push('config.json');
          return options;
        });
      }
    }
  },
};
