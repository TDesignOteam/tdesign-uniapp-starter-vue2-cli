# tdesign-uniapp-vue2-cli

[TDesign UniApp](https://www.npmjs.com/package/tdesign-uniapp) 示例，Vue2 + CLI 模式。

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev:h5
npm run dev:mp-weixin
```

## 打包

```bash
npm run build:h5
npm run build:mp-weixin
```

## 调试

开发和构建命令传递 `--alias`，即可使用本地的 `tdesign-uniapp` 和 `tdesign-uniapp-chat`，否则会使用 `npm` 中的相应包。

```bash
npm run dev:h5 -- --alias
npm run dev:mp-weixin -- --alias
```
