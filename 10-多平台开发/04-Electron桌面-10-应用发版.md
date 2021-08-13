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

Electron 支持在 package.json 中设置 build 的配置、针对操作系统重写:

```json
"main": "main.js",          // 设定入口文件
"homepage": "./",           // 解决electron file协议导致生产环境加载index.html
"build": {
    "appid":"demo",
    "productName": "示例软件",
    "copyright":"@copyright2021",
    "mac": {
        "productName": "示例软件-MAC版",
    }
}
```

常用的打包工具有：electron-packager、electron-builder，后者内置了自动升级配置，只要将打包的文件随意放置在 web 服务中即可完成自动升级，推荐后者。

**vue 的打包**：

使用 `Vue CLI Plugin Electron Builder` 创建的项目，直接使用 `npm run electron:build` 即可打包，且会依据打包系统的不同产生不同平台的安装包。

**react 的打包**：

额外添加：

```js
"build": {
    "extends":null,
    "files": [                          // 解决文件未被识别打包
        "build/**/*",
        "node_modules/**/*",
        "config/**/*",
        "package.json",
        "main.js",
        "./src/.....js",              // 这里要导入所有 main.js 中使用的js文件
        "./src/.....js",
    ],
},
"scripts": {
    "predist": "npm run build",         // node特性：pre前缀会在 dist前自动执行
    "dist": "electron-builder",         // 生成安装包
    "prepack": "npm run build",         // node特性：pre前缀会在 pack前自动执行
    "pack": "electron-builder --dir"    // 生成绿色安装文件
},
```

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

### 3.3 打包优化

electron 遵守 node 规范，打包时是不会将 dev 依赖打包的。主要能优化的生成文件为 asr 文件，其本质是代码文件+node_modules 文件的压缩文件，优化的核心是正确放置开发依赖，生产依赖。

如果在 main.js 中使用了过多的依赖包，也会造成打包体积过大，优化方式是引入 webpack.config.js：

```js
const path = require('path')
module.exports = {
    target: 'electron-main',
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'main.js',
    },
    node: {
        __dirname: fale,
    },
}
```

打包脚本：

```json
"scripts": {
    "predist": "npm run build && npm run buildMain",
    "prepack": "npm run build && npm run buildMain",
}
"buildMain": 'webpack ',
"build": {
    "files": [            // 可以删除根目录与main相关的js文件了

    ],
    "extraMetadata":{
        "main": "./build/main.js"   // 此时main被打包在了该文件
    },
}
```

注意：此时 main.js 中 load 的地址是： `file://${path.join(__dirname, './index.html')}`。做完这些配置后，就可以将 main.js 中相关不需要的依赖移入到 dev 依赖。

## 四 版本更新

### 4.1 自动发布

首先可以配置代码、安装包发布地址，比如发布到 github 上：`publish: ['github']`，详细示例为：

```js
scripts: {
    "prerelease": "npm run build && npm run buildMain",
    // electron-builder会为release命令添加publish，即不但要打包，还要将其push到远端,GH_TOKEN 为githubtoken
    "release": "cross-env GH_TOKEN=wqewjkhjad21enj2 electron-builder",
},
publish: [
    {
        provider: 'generio',
        url: 'http://dowload.demo.com',
    },
]
```

### 4.2 自动更新

url 是升级的地址在哪儿，还需要在主进程加入：

```js
const { autoUpdater } = require('electron-updater')

app.on('ready', () => {
    // 其他代码

    // 自动升级代码
    autoUpdater.autoDownload = false
    autoUpdater.checkForUpdates()
    autoUpdater.on('error', error => {
        dialog.showErrorBox('更新失败')
        console.log('更新失败:', error)
    })
    autoUpdater.on('update-available', () => {
        dialog.showMessageBox(
            {
                type: 'info',
                title: '应用有新版本',
                message: '应用有新版本，是否现在更新',
                buttons: ['是', '否'],
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    autoUpdater.downloadUpdate()
                }
            }
        )
    })
    autoUpdater.on('update-not-available', () => {
        dialog.showMessageBox({
            title: '没有新版本',
            message: '当前没有版本',
        })
    })

    // 其他代码
})

autoUpdater.on('update-download', () => {
    this.mainWin.webContents.send('updateDownLoaded')
})

ipcMain.on('quitAndInstall', event => {
    autoUpdater.quitAndInstall()
})
```

上述代码尽量保持在窗口启动后适当时机运行，以不占用窗口启动时间。autoUpdater 模块负责管理程序的升级，`checkForUpdates()` 则会检查服务端的配置文件是否存在更新的安装程序（对比 package 中的 version），如果有，则开始下载，下载后会给渲染进程发送消息，由渲染进程提示用户“当前有新版本，是否需要升级”，用户选择升级后，由渲染进程发送 'quitAndInstall' 给主进程，主进程自动升级，退出程序，安装完毕后重启。

注意：如果使用的是 `Vue CLI Plugin Electron Builder` 创建的项目打包，则此配置位于 vue.config.js 的 builderOptions 节点中。

### 4.3 开发环境调试升级功能

在自动更新时，需要一个 app-update.yml 文件，该文件在 release 时会自动生成，开发环境不可能有该文件，此时需要手动创建 dev-app-update.yml 文件：

```yml
owner: ryj
repo: demo
provider: github
```

修改开发环境下的 main.js

```js
app.on('ready', () => {
    if (isDev) {
        autoUpdater.updateConfigPaht = path.join(__dirname, 'dev-app-update.yml')
    }
})
```
