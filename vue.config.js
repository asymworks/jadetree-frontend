/* eslint-disable no-param-reassign */

module.exports = {
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
