/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */

const tailwindcss = require('tailwindcss');
const postcssMixins = require('postcss-mixins');
const postcssPresetEnv = require('postcss-preset-env');
const postcssPurgecss = require('@fullhuman/postcss-purgecss');

const purgecss = postcssPurgecss({
  content: [
    './public/**/*.html',
    './src/**/*.vue',
  ],
  css: [
    './src/**/*.css',
  ],
  defaultExtractor: (content) => content.match(/[\w-/:%]+(?<!:)/g) || [],
  safelist: {
    standard: [
      /-(leave|enter|appear)(|-(to|from|active))$/,
      /^(?!(|.*?:)cursor-move).+-move$/,
      /^router-link(|-exact)-active$/,
      /data-v-.*/,
      /^jtc-.*/,
      /^tooltip.*?/,
      /^popover.*?/,
    ],
    greedy: [
      /^formulate-/,
      /^jtc-/,
      /tooltip/,
      /popover/,
    ],
  },
});

module.exports = {
  plugins: [
    postcssMixins,
    tailwindcss,
    postcssPresetEnv({
      stage: 2,
      features: {
        'nesting-rules': true,
      },
    }),
    ...process.env.NODE_ENV === 'production'
      ? [purgecss]
      : [],
  ],
};
