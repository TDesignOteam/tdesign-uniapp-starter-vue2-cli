const { DispatchScriptPlugin } = require('@plugin-light/webpack-plugin-dispatch-script');
const { DispatchVuePlugin } = require('@plugin-light/webpack-plugin-dispatch-vue');
const {
  GenVersionWebPlugin,
  GenVersionMpPlugin,
} = require('@plugin-light/webpack-plugin-gen-version');

const path = require('path');

const USE_TD_UNI_APP_ALIAS = process.argv.indexOf('--alias') > -1;
console.log('[USE_TD_UNI_APP_ALIAS]', USE_TD_UNI_APP_ALIAS);

function resolve(dir) {
  return path.join(__dirname, dir);
}

// GitHub Pages 仓库名，如果是 用户名.github.io 则设置为 '/'
// 如果是 用户名.github.io/仓库名 则设置为 '/仓库名/'
const GITHUB_PAGES_PATH = process.env.GITHUB_PAGES_PATH || '/tdesign-uniapp-starter-vue2-cli/';

const plugins = []

if (process.env.VUE_APP_PLATFORM !== 'h5') {
  plugins.push(new GenVersionMpPlugin());
} else {
  plugins.push(new GenVersionWebPlugin());
}


const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  // 生产环境下设置 publicPath，用于 GitHub Pages 部署
  publicPath: isProd ? GITHUB_PAGES_PATH : '/',
  transpileDependencies: ['@tdesign/uniapp', '@tdesign/uniapp-chat',],
  chainWebpack: (config) => {
    // 禁用 webpack 解析符号链接的真实路径，避免 pnpm 符号链接导致模块 ID 不匹配
    config.resolve.symlinks(false);

    if (USE_TD_UNI_APP_ALIAS) {
        config.resolve.alias
          .set('@tdesign/uniapp', resolve('./src/_tdesign'))
          .set('@tdesign/uniapp-chat', resolve('./src/_tdesign'));
    }
  },
  configureWebpack: {
    plugins: [
      // new DispatchScriptPlugin({}),
      isProd ? new DispatchVuePlugin({}) : null,
      ...plugins,
    ].filter(Boolean),
  },
};
