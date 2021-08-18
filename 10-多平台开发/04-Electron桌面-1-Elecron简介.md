# Electron 初识

## 一 Electron 简介

桌面客户端开发常用的库是：QT、GTK、MFC，他们都是基于 C++开发的，开发效率较低，虽然现在也有基于 Go、Py 的 QT，但是仍然存在一定的缺陷。

2011 年，中国英特尔的王文睿开发了 node-webkit 库，用来操作 Webkit，后开该项目失败，却衍生出了跨平台开发框架 NW.js，node-webkit 团队成员赵成到了 Github 团队后开发出了类 node-webkit 项目： Atom Shell，即 Electron 的前身。

NW.js 与 Electron 都是基于 Node、Webkit 这 2 种技术的跨平台（Win、Mac、Linux）桌面应用开发框架，通过该框架可以利用 HTML、CSS、JavaScript 等 web 前端技术来开发跨平台桌面应用，其理念是将 Chromium、Node 进行结合：

- Chromium Content Module：Chromium 的核心组件，包含浏览器核心功能：Blink 渲染引擎、JS 的 V8 引擎，以及提供在单独进程渲染 Web 页面、加速 GPU 等功能
- Node.js 运行时：可以访问本地文件系统、创建服务器、从外部模块加载文件

前者可以负责图形的渲染，后者可以实现对本地文件、网络的访问，互相补充，框架再封装一些系统对话框、托盘、菜单、剪切板等功能，就能基本上满足桌面客户端的所有功能。

但是这 2 个框架在整合 Chromium、Node 也有区别：

- NW.js：NW.js 修改了源码合并了 Chromium 和 Node 的事件循环机制，所以只有一个进程，所有窗口共享一个 Node.js 环境。
- Electron：Electron 利用操作系统的消息循环机制打通 Chromium 和 Node，所以包含主进程、渲染进程，利用 ipc 实现进程间通信。

Electron 现在社区更加活跃，库也更加丰富，其著名实现案例是 VSCode、Skype、国内的飞书。

## 二 Electron 的优劣

Electron 的优势：

- 可以很好的结合 Web 技术，以很快的速度开发出现代应用。如：css3、Html5、Vue、React。
- Electron 也提供了很多官方、非官方的方案，如：实时 NoSQL 数据库 rxdb
- 无需关注 C++开发时需要注意的垃圾回收问题、繁多特性

Electron 的劣势：

- 打包体积大。
- 跨进程通信带来了开发上的难度
- Chromium 带来的资源占用较大问题
- 一些安全性模块默认不可用，在不得不开启后，会引起一些安全隐患

此外，Electron 不支持旧版系统，如 WindowsXP。

Electron 也有一些竞争者，不乏理念上不同的开发方式，如 PWA，PWA 无需像 Electron 这样还需要安装软件安装包，而是利用浏览器直接就能缓存一个本地客户端。但是 PWA 在不同操作系统支持度不同，其推广方 Google 目前也并未投入过多资源。

## 三 Electron 安装

安装 Electron 需要确保电脑上已经安装 Node.js，最好是 8 版本以上

```txt
# 由于国内环境，偶尔需要设置electron的代理
npm config set ELECTRON_MIRROR https://cdn.npm.taobao.org/dist/electron/

# 全局安装：全局安装后electron 提供了 electron 命令。当然也可以本地项目中安装，需要借助npm脚本或者npx启用electron
npm i electron -g
```

> 贴士：笔者推荐在项目本地安装，所以此处全局安装可以忽略，只用注意代理即可。

## 三 Electron 初体验

### 3.1 手动书写一个 HelloWorld 【重要】

第一步：初始化一个项目：

```txt
# 初始化项目
npm init

# 本地安装 electron
npm config set ELECTRON_MIRROR https://cdn.npm.taobao.org/dist/electron/
npm i electron -D

# 如果一直安装失败，则可以在 node_modules/electron 目录，创建一个path.txt文本文件
    Win上，该文本文件输入内容：electron.exe
    Mac上，该文本文件输入内容：Electron.app/Contents/MacOS/Electron
  然后手动从阿里镜像网站下载对应版本的Electron压缩包，解压到node_modules/electron/dist
```

第二步：初始化项目中的文件

- `main.js`：项目入口文件
- `index.html`：软件打开时默认显示的页面，该文件内容书写一个 `hello world` 即可
- `package.json`：node 项目初始化后默认配置文件

第三步：书写 main.js 内容，用来创建窗口

```js
const { app, BrowserWindow } = require('electron')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  // 根据开发环境设置加载地址，build模式下直接加载build文件中的index.html即可
  // 生产打包文件地址： file://${path.join(__dirname, './build/index.html')}
  const urlLocation = 'http://localhost:3000'
  mainWindow.loadURL(urlLocation)
  mainWindow.webContents.openDevTools()

  if (process.platform !== 'darwin') {
    app.quit()
  }
}

app.on('ready', createWindow)

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})
app.on('window-all-closed', () => {
  app.quit()
})
```

第四步：运行

```txt
# 直接运行 npx electron . # 为了简便，也可以使用npm脚本运行 #
在package.json中的script内添加一行脚本： "start": "electron ." npm start
```

### 3.2 js 脚本的引入

在 index.html 中可以像普通的前端开发一样，直接使用 script 脚本引入其他的 js 文件即可：

```html
<!-- 在根本目创建一个lib.js，内容如下：  -->
window.data = { key: 'value' }

<!-- 在index.html中使用：  -->
<script src="./lib.js"></script>
<script>
  alert(data.key)
</script>

<!-- ctrl+c 停止运行后重新运行：  -->
npm start
```

但是这里也可以直接利用 Node 的能力来引入，需要提前做配置：main.js 中如下创建：

```js
mainWindow = new BrowserWindow({
  webPreferences: { nodeIntegration: true }, // 该配置会让页面继承Node环境，网页中的js可以使用Node,Web网页不推荐，会引起安全问题
})
```

lib.js 的文件内容：

```js
module.exports = {
  key: 'value',
}
```

此时其他的 js 文件在 index.html 就可以使用如下方式引入：

```html
<script>
  let data = require('./lib')
  alert(data.key)
</script>
```

贴士：

- 开启 `nodeIntegration` 后 jQuery 的引入方式为：`window.$ = window.jQuery = require('./jquery.js')`
- Electron 项目不推荐使用 jQuery，和性能优化有关！

### 3.3 使用官方示例

也可以直接使用官网的 quick start 案例：

```txt
git clone https://github.com/electron/electron-quick-start cd
electron-quick-start npm install && npm start
```

## 四 Electron Electron API

Electron API 项目集成了大量官方的 API 演示案例，[网址](https://github.com/electron/electron-api-demos)为：<https://github.com/electron/electron-api-demos>

## 五 Electron 集成现代框架

### 5.1 Electron 集成 Vue

Vue 集成 Electron，不需要使用示例项目，其 cli 工具直接支持：

```txt
# 安装vue cli 工具
npm i @vue/cli -g

# 创建项目
vue create project

# 进入项目后，集成electron
vue add electron-builder  # 添加background.js为主进程入口，main.js是渲染进程入口

# 贴士：该步骤容易因为网络原因卡住，可以切换源，或者使用 yarn -add -D electron-chromedriver

# 启动 npm run
electron:serve
```

bug 解决：此时国内环境是无法直接启动的，是因为要安装 dev-tools，这个需要翻墙，可以暂时注释

```js
// 注释掉src / background.js中的以下代码就行了;
// if (isDevelopment && !process.env.IS_TEST) {
//   // Install Vue Devtools
//   try {
//     await installVueDevtools();
//   } catch (e) {
//     console.error("Vue Devtools failed to install:", e.toString());
//   }
// }
```

其他 bug 解决：<https://www.psvmc.cn/article/2019-11-05-vue-cli3-electron.html>

### 5.2 Electron 与 vue-element-admin 的集成示例

该示例可以直接启动，在 .vscode 目录中创建了调试工具环境：
<https://github.com/ry-cli/electron-vue-element-admin>

### 5.3 Electron 集成 React

原生继承示例：使用 create-react-app 工具创建 react 项目，进入该项目手动后集成 electron：

```txt
# 第一步：安装electron，以及一些需要的软件
npm i electron -D

# 第二步：项目根目录（src同级目录）创建 main.js，内容与3.1相同

# 第三步：增加package.json键值对： 此时当 yarn start 后，再运行 electron . 项目初级结构已经完成
"main": "main.js",          // 设定入口文件
"homepage": "./",           // 解决electron file协议导致生产环境加载index.html资源404问题

# 第四步：配置electron的启动项脚本。如果想要启动时开启浏览器，则可以移除 cross-env BROWSER=none
npm i concurrently -D    用来运行跨平台脚本，并支持一个npm脚本中运行多个命令
npm i wait-on -D         用来等待web服务启动后才启动electron
npm i cross-env -D       用来执行一些跨平台命令
"dev": "concurrently \"wait-on http://localhost:3000 && electron .\" \"cross-env BROWSER=none npm start\"",
```

目前较为活跃的集成示例是：<https://github.com/electron-react-boilerplate/electron-react-boilerplate>

当然为了规避 Electron 打包体积大，提升性能，推荐使用：ProtonNative(<https://github.com/kusti8/proton-native)>，该项目优点：

- 与 ReactNative 语法一直，可以使用 React 生态，如 Redux
- 也可以使用 Node.js 生态中的包
- 组件为系统原生组件，不再是浏览器

### 5.4 Electron 集成 Angular

目前较为活跃的集成示例是：<https://github.com/maximegris/angular-electron>

### 5.5 Electron 集成 Webpack

很少用到单独集成 Webpack 的项目，为了以防万一，直接按照该示例操作即可：<https://github.com/ry-cli/electron-webpack>
