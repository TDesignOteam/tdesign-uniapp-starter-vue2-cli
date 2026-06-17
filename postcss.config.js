const path = require('path');
const webpack = require('webpack');

// 按需开启，开启后包体积会变小，但会加重心智负担，开发者需关注用到的图标列表
// const { postcssPluginRemoveSelector } = require('@novlan/postcss-plugin-remove-selector');

const { deepSelectorPlugin, rpxToPxPlugin } = require('t-comm');

const config = {
  parser: require('postcss-comment'),
  plugins: [
    require('postcss-import')({
      resolve(id) {
        if (id.startsWith('~@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3));
        } if (id.startsWith('@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2));
        } if (id.startsWith('/') && !id.startsWith('//')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1));
        }
        return id;
      },
    }),
    require('autoprefixer')({
      remove: process.env.UNI_PLATFORM !== 'h5',
    }),
    // Vue3 :deep() 转 Vue2 ::v-deep，需要放在前面处理
    deepSelectorPlugin(),
    // 移除未使用的 tdesign 图标选择器，减少样式体积
    // postcssPluginRemoveSelector({
    //   mode: 'tdesign',
    //   customUsed: [
    //     // 首页导航图标
    //     'app', 'bulletpoint', 'chat', 'image', 'view-module',
    //     // 通用操作图标
    //     'add', 'close', 'check', 'search', 'delete', 'edit', 'edit-1', 'remove', 'refresh',
    //     // 方向/导航图标
    //     'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right',
    //     'chevron-left-double', 'chevron-right-double', 'enter', 'jump',
    //     // 状态/提示图标
    //     'check-circle', 'check-circle-filled', 'close-circle', 'error-circle', 'close-circle-filled',
    //     'error-circle-filled', 'info-circle-filled', 'loading', 'success', 'check-rectangle-filled',
    //     'minus-circle-filled',
    //     // 业务图标
    //     'bookmark', 'browse', 'browse-off', 'camera', 'cart', 'circle',
    //     'cloud-upload', 'discount', 'dot', 'download', 'file-add', 'file-word-filled',
    //     'gesture-press', 'home', 'internet', 'link', 'lock-on',
    //     'notification', 'notification-filled', 'pin', 'poweroff', 'queue',
    //     'rectangle', 'send-filled', 'service', 'share', 'shop', 'sound',
    //     'star', 'star-filled', 'thumb-up', 'update',
    //     'user', 'user-add', 'user-avatar', 'backtop',

    //     'replay', 'copy', 'good', 'bad', 'share', 'thumb-down', 'thumb-up', 'share-1',
        
    //     'file-excel-filled', 'file-pdf-filled', 'file-ppt-filled', 'file-word-filled',
    //     'file-zip-filled', 'file-powerpoint-filled', 'video-filled',

    //     'multiply',
    //   ],
    // }),
    // rpx 转 px，内置仅在 h5 平台执行
    // 必须放在 @dcloudio/vue-cli-plugin-uni/packages/postcss 之前
    rpxToPxPlugin(),
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss')({
      include: /node_modules\/.*/
    }),
  ],
};
if (webpack.version[0] > 4) {
  delete config.parser;
}
module.exports = config;
