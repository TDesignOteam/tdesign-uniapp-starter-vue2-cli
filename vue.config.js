const path = require('path');

const USE_TD_UNI_APP_ALIAS = process.argv.indexOf('--alias') > -1;
console.log('[USE_TD_UNI_APP_ALIAS]', USE_TD_UNI_APP_ALIAS);

function resolve(dir) {
  return path.join(__dirname, dir);
}

// GitHub Pages 仓库名，如果是 用户名.github.io 则设置为 '/'
// 如果是 用户名.github.io/仓库名 则设置为 '/仓库名/'
const GITHUB_PAGES_PATH = process.env.GITHUB_PAGES_PATH || '/tdesign-uniapp-vue2-cli-demo/';

module.exports = {
  // 生产环境下设置 publicPath，用于 GitHub Pages 部署
  publicPath: process.env.NODE_ENV === 'production' ? GITHUB_PAGES_PATH : '/',
  transpileDependencies: ['tdesign-uniapp', 'tdesign-uniapp-chat'],
  chainWebpack: (config) => {
    if (USE_TD_UNI_APP_ALIAS) {
        config.resolve.alias
          .set('@tdesign/uniapp', resolve('./src/_tdesign'))
          .set('@tdesign/uniapp-chat', resolve('./src/_tdesign'));
    }
  },
};
