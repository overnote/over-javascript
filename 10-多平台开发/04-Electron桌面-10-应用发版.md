# 10-Electron 应用发版

## 一 打包说明

Electron 应用打包出的软件与计算机系统有关，在 Win 下打包的软件则是 Windows 平台的安装包，在 Mac 下打包的出的软件则是 Mac 平台的安装包。

## 二 应用图标

图标建议准备 1024\*1024 大小的 png 格式，存放在 public 目录下：

```txt
# 安装 electron-icon-builder 组件
npm i -D electron-icon-builder

# 在 package.json 中增加如下 script 指令
"build-icon": "electron-icon-builder" --input=./public/icon.png --output=buil --flatten

# 执行，会在 build/icons 目录生成各种大小的图标文件
npm run build-icon
```

## 三 打包

### 3.1 打包工具

常用的打包工具有：electron-packager、electron-builder，后者内置了自动升级配置，只要将打包的文件随意放置在 web 服务中即可完成自动升级，推荐后者。

使用 `Vue CLI Plugin Electron Builder` 创建的项目，直接使用 `npm run electron:build` 即可打包，且会依据打包系统的不同产生不同平台的安装包。

### 3.2 签名

为了避免包被串改，默认情况下，Mac 只允许从 Store 中下载，Win 下安装未签名的程序会出现风险提示。

给 Windows 应用签名，需要购买签名证书，可以在 digicert、godaddy 等平台购买。

如果使用了 electron-builder 打包，购买证书后可以按照 <https://www.electron.build/configuration/win> 中的文档配置。

如果使用了 `Vue CLI Plugin Electron Builder` 创建的项目打包，则配置信息将放置在 vue.config.js 中：

```js
module.exports = {
    productionSourceMap: false,
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                win: {
                    signingHashAlgorithms: ['sha1', 'sha256'],
                    certificateFile: '证书文件',
                    certificatePassword: '证书密码',
                    certificateSubjectName: '',
                    // ...
                },
            },
            mainProcessFile: 'public/background/start.js',
        },
    },
}
```

在 Mac 中打包时，无需额外配置，electron-builder 会自动加载钥匙串证书，但是该证书必须加入苹果开发者计划获取。

## 四 自动升级

electron-builder 自动升级需要添加配置：

```js
publish: [
    {
        provider: 'generio',
        url: 'http://dowload.demo.com',
    },
]
```

如果使用的是 `Vue CLI Plugin Electron Builder` 创建的项目打包，则此配置位于 vue.config.js 的 builderOptions 节点中。

url 是升级的地址在哪儿，还需要在主进程加入：

```js
const { autoUpdater } = require('electron-updater')

autoUpdater.checkForUpdates()

autoUpdater.on('update-download', () => {
    this.mainWin.webContents.send('updateDownLoaded')
})

ipcMain.on('quitAndInstall', event => {
    autoUpdater.quitAndInstall()
})
```

上述代码尽量保持在窗口启动后适当时机运行，以不占用窗口启动时间。autoUpdater 模块负责管理程序的升级，`checkForUpdates()` 则会检查服务端的配置文件是否存在更新的安装程序（对比 package 中的 version），如果有，则开始下载，下载后会给渲染进程发送消息，由渲染进程提示用户“当前有新版本，是否需要升级”，用户选择升级后，由渲染进程发送 'quitAndInstall' 给主进程，主进程自动升级，退出程序，安装完毕后重启。

打包完毕后，Win 平台上传：`[app]Setup[version].exe` 和 `lastes.yml` 文件到服务端，Mac 上传 `[app]-[version]-mac.zip` 和 `[app]-[version]-mac.dmg` 以及 ``lastes-mac.yml`文件到服务端， Linux 平台则上传：`[app]-[version].AppImage` 和 `lastes-linux.yml`。
