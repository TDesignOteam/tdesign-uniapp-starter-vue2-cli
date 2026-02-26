<p align="center">
  <a href="https://tdesign.tencent.com/" target="_blank">
    <img alt="TDesign Logo" width="200" src="https://tdesign.gtimg.com/site/TDesign.png">
  </a>
</p>

<p align="center">
  <a href="https://v2.vuejs.org/"><img src="https://img.shields.io/badge/Vue-2.6-brightgreen.svg" alt="Vue2" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-4.5-blue.svg" alt="TypeScript" /></a>
  <a href="https://webpack.js.org/"><img src="https://img.shields.io/badge/Webpack-5-purple.svg" alt="Webpack" /></a>
  <a href="https://tdesign.tencent.com/uniapp/getting-started"><img src="https://img.shields.io/badge/TDesign-Uniapp-0052d9.svg" alt="TDesign" /></a>
  <a href="https://github.com/TDesignOteam/tdesign-uniapp-starter-vue2-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" /></a>
</p>

# TDesign Uniapp 组件库模板 (Vue 2 CLI)

基于 Vue 2 + TypeScript + Webpack (Vue CLI) + TDesign Uniapp 的跨端移动应用开发模板，支持 H5、微信小程序、支付宝小程序等多平台。

## ✨ 特性

- 🎨 **TDesign 组件库** - 腾讯出品的企业级设计体系
- 📦 **开箱即用** - 完整的项目结构和配置
- 🔧 **TypeScript** - 完整的类型支持
- ⚡ **Vue CLI + Webpack** - 稳定成熟的构建体验
- 🌐 **多平台支持** - H5 / 微信 / 支付宝 / 抖音 / QQ / 百度 / 快手 / 京东 / 小红书等

## 🔧 环境要求

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/TDesignOteam/tdesign-uniapp-starter-vue2-cli.git

# 进入项目目录
cd tdesign-uniapp-starter-vue2-cli

# 安装依赖
npm install

# 启动 H5 开发
npm run dev:h5

# 启动微信小程序开发
npm run dev:mp-weixin
```

## 📱 多平台开发

### 开发模式

| 平台         | 命令                      |
| ------------ | ------------------------- |
| H5           | `npm run dev:h5`          |
| 微信小程序   | `npm run dev:mp-weixin`   |
| 支付宝小程序 | `npm run dev:mp-alipay`   |
| 抖音小程序   | `npm run dev:mp-toutiao`  |
| QQ 小程序    | `npm run dev:mp-qq`       |
| 百度小程序   | `npm run dev:mp-baidu`    |
| 快手小程序   | `npm run dev:mp-kuaishou` |
| 京东小程序   | `npm run dev:mp-jd`       |
| 飞书小程序   | `npm run dev:mp-lark`     |
| 小红书小程序 | `npm run dev:mp-xhs`      |
| 鸿蒙元服务   | `npm run dev:mp-harmony`  |

### 生产构建

| 平台         | 命令                        |
| ------------ | --------------------------- |
| H5           | `npm run build:h5`          |
| 微信小程序   | `npm run build:mp-weixin`   |
| 支付宝小程序 | `npm run build:mp-alipay`   |
| 抖音小程序   | `npm run build:mp-toutiao`  |
| QQ 小程序    | `npm run build:mp-qq`       |
| 百度小程序   | `npm run build:mp-baidu`    |
| 快手小程序   | `npm run build:mp-kuaishou` |
| 京东小程序   | `npm run build:mp-jd`       |
| 飞书小程序   | `npm run build:mp-lark`     |
| 小红书小程序 | `npm run build:mp-xhs`      |
| 鸿蒙元服务   | `npm run build:mp-harmony`  |

## 🔗 调试

开发和构建命令传递 `--alias`，即可使用本地的 `tdesign-uniapp` 和 `tdesign-uniapp-chat`，否则会使用 `npm` 中的相应包。

```bash
npm run dev:h5 -- --alias
npm run dev:mp-weixin -- --alias
```

## 📁 项目结构

```
├── src/
│   ├── components/       # 公共组件
│   ├── mixins/           # 混入
│   ├── pages/            # 主页面目录
│   ├── pages-more/       # 更多页面（组件示例）
│   ├── static/           # 静态资源
│   ├── style/            # 全局样式
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   ├── pages.json        # 页面路由配置
│   ├── manifest.json     # 应用配置
│   └── uni.scss          # uni-app 全局样式变量
├── public/               # 公共资源
├── babel.config.js       # Babel 配置
├── vue.config.js         # Vue CLI 配置
├── postcss.config.js     # PostCSS 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 🔗 相关链接

- [TDesign Uniapp 组件库](https://tdesign.tencent.com/uniapp/getting-started)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 2 文档](https://v2.vuejs.org/)
- [Vue CLI 文档](https://cli.vuejs.org/)

## 📱 扫码预览

<img src="./docs/image/tdesign-uniapp-starter-vue2-cli-h5" width="300" />

## 📄 License

[MIT](LICENSE)
