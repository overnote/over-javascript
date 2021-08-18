# Electron 界面

窗口类似于整个客户端软件的框架结构，界面则是框架内内容区域。

## 一 页面内容 webContents

### 1.1 获取 webContents 实例

webContents 是 Electron 内真正渲染展示 Web 界面的地方，也即内容区域，大量的交互都在此处。

获取方式：

```js
// 通过窗口可以直接获取 webContents 实例
const webContent = win.webContent

// 获取处于激活状态的 webContents
const actWebContent = electron.webContents.getFocusedWebContents()

// 通过渲染进程获取 webContents
webContent = remote.getCurrentWebContents()

// 每次创建窗口时，窗口都有一个制度的整型id值，也可以获取页面内容
webContent = electron.webContents.fromId(yourID)

// 下策：还可以通过遍历所有内容，一一对比方式
const webContentArr = electron.webContents.getAllWebContents()
```

### 1.2 事件的加载与触发顺序

Electron 中页面加载的事件顺序：

```txt
id-start-loading：      页面加载中的第一个事件，浏览器的 tab 页图标开始旋转
page-title-update：     页面标题更新。处理函数的第二个参数为当前页面标题
dom-ready：             页面中的 dom 加载完毕。其本质是网页的事件 DOMContentLoaded。
                        该事件与页面中的 iframe 无关，但是如果有 script 标签则需要等待脚本加载完毕后触发，
                        若 script 标签之前还有 css 资源，则还需要等待 CSS 资源的加载。
                        若没有 script 标签，则无需等待 CSS 资源加载会直接触发事件。
did-frame-finish-load： 框架加载完成。页面中可能有多个 iframe，所以该事件会触发多次，当前页面为 mainFramedid
```

### 1.3 页面跳转事件

页面的跳转事件有两种类型：

- 以 navigate 命名的事件：一般是由客户端控制的跳转
- 以 redirect 命名的事件：一般是由服务端控制的跳转

webContents 的跳转事件有：

```txt
will-redirect：         服务端返回301、302后，浏览器准备跳转时触发。
                        Electron 可以通过 event.preventDefault() 取消该事件，阻止跳转
did-redirect-navigation：will-redirect 事件之后，跳转发生时触发
will-navigation：       用户点击了跳转连接或者 使用了 window.location.href 属性，跳转发生前触发
                        不会触发该事件的场景：webContents.loadURL、webContents.back、更新 window.location.hash、用户点击锚点
did-start-navigation：  一般发生在 will-navigation 之后，跳转发生时触发
did-navigate-in-page：  更新 window.location.hash 时，或者 用户点击锚点 时触发
did-frame-navigate：    主页面和子页面跳转完成时触发，更新 window.location.hash、用户点击锚点 不会触发
did-navigate：          主页面跳转完成时触发（子页面不会），更新 window.location.hash、用户点击锚点 不会触发
```

注意：目前前端项目大多使用 MVVM 框架开发，其路由模式无论是 hash 还是 history，一般情况都是业内跳转，会触发：`did-start-navigation`、`did-navigate-in-page`。

### 1.4 渲染海量数据元素

与传统桌面开发相比，在渲染海量数据时，Electron 的 Web 开发方式需要另辟蹊径，比如使用分页，比如使用 canvas 绘图方式渲染大量数据，因为浏览器的绘制能力非常强悍。

这里在使用 canva 时，推荐 PixiJS 库<https://github.com/pixijs>，该库对 WebGL 进行的二次封装，且兼容 canvas，得到了 Youtube、Adobe 等公司的应用。

如果超过了 canvas 的承载能力呢？

一个可行的方案是：界面加载完成后，只渲染一屏数据，且同时制作一个足够长的滚动条，监听滚动条的滚动事件。当滚动条向下滚动时，更新这一屏数据，把头部内容丢弃！推荐开源项目：<https://github.com/TonyGermaneri/canvas0datagrid>

## 二 页面容器

### 2.1 webFrame

一般情况下，webContents 能够满足多数场景，如果需要在窗口内包含更多子页面，则需要用到 webFrame。在 Electron 中，一个 iframe 对应一个 webFrame，即使一个页面中没有任何子页面，其本身也是一个 webFrame 实例，即 mainFrame。

webFrame 的实例只能在渲染进程中使用：

```js
const { webFrame } = require('electron') // 这里的webFrame其实就是mainFrame
```

在获得 mainFrame 后，可以通过下列方式查找自己所需要的 webFrame：

```js
webFrame.findFrameByName(name)
webFrame.findFramebyRoutingId(routingId) // routingId 是 webFrame 的整型属性，webFrame.routingId
webFrame.firstChild()
```

注意：子页面无法使用 require 等，可以在 Electron 应用中添加如下配置：

```js
let win = new BrowserWindow({
  // ... 一系列配置
  nideIntegrationSubFrames: true,
})
```

当然也有其他解决方案，在父页面中：

```js
let myIframe = document.querySelectro("#iframeID");
myIframe.onload = function(){
    let iframeWin = myIframe.contentWindow;
    let iframe.require = myIframe.require;          // 也可以采用该方式：在子页面中获取父窗口的require
}
```

### 2.2 webview

Electron 额外提供了一个专有标签 webview，可以在网页中实现直接嵌入另外一个网页的内容（可以是第三方网页），但是该功能貌似 Electron 官方不推荐使用，后续版本很可能删除！

使用该标签需要提前开启：

```js
let win = new BrowserWindow({
  // ... 一系列配置
  webviewTag: true,
})
```

使用方式：

```html
<webview
  id="myview"
  src="https://www.baidu.com"
  style="width:100px; height:100px;"
></webview>
```

### 2.3 BrowserView

webFrame 与 webview 都有其缺陷，BrowserView 可以满足很多更复杂的场景，如应用中内嵌一个浏览器。

BrowserView 完全依托于 BrowserWindow 存在，可以绑定在 BrowserWindow 的一个具体区域，可以看做其内部的一个元素，可以随着 BrowserWindow 的放大缩小而放大缩小。

```js
let view = new BrowserView({
  webPreferences: { preload },
})

win.setBrowserView(view) // win是BrowserWindow对象，这里为自己设置一个 BrowserView容器

let size = win.getSize()
// 设定绑定区域
view.setBounds({
  x: 0,
  y: 80,
  width: size[0],
  height: size[1] - 80,
})
// 自适应
view.setAutoResize({
  width: true,
  heigth: true,
})
view.webContents.loadURL(url)
```

如果开发的内嵌浏览器需要支持多标签页，则不能使用 setBrowserView()，因为该方法会为当前窗口设置，属于替换效果！需要使用 addBrowserView 方法。移除 BrowserView 的方法是：`win.removeBrowserView(view)`，这里其实只是隐藏，再次显示不会造成重新渲染，此外还有如下方法：

```js
// 显示
view.webContents.insertCSS('html{display: block}')
// 隐藏
view.webContents.insertCSS('html{display: none}')
```

## 三 脚本注入

开发者可以利用 Electron 提供的脚本注入功能，把一段 JS 代码注入到目标网页中，这段代码可以访问该网页的内容，如：DOM、Cookie、服务端资源、Node 能力等。

### 3.1 preload 参数注入脚本

注入方式：

```js
let win = new BrowserWindow({
    webPreferences: {
        // ...其他配置
        preload: jsFileSrc;           // 这里是绝对路径
    }
})
```

绝对路径获取方式：

```js
const { app } = require('electron')
const path = require('path')
let jsFileSrc = path.join(app.getAppPath(), 'yourPreload.js')
```

preload.js 文件示例：

```js
window.onload = function () {
  alert("I'm watching u")
}
```

注意：如果使用的是 vue-electron 构建，则 `app.getAppPath()` 指向应用程序的编译路径。如果需要使用 Vue 下的 public 静态文件目录，则可以使用 `__static` 全局变量，该目录不会被 webpakc 打包！

如果使用 BrowserView、webview 标签来嵌入第三方页面，他们都能通过类似机制都可以给第三方页面注入脚本。注入的脚本无论是否配置了 Node 访问能力，都可以访问 Node，不同之处在于，一旦开启支持 Node 访问能力，第三方网页在被注入脚本后，也能访问 Node，这会造成很大的安全问题，因为第三方网页此时可以完全访问 Electron 应用。

### 3.2 executeJavaScript 注入简单脚本

如果只是要注入很短的几句脚本，直接使用 webContents 的 executeJavaScript 即可。

```js
await win.webContents.executeJavaScript("document.alert('hello world!')")
// 贴士：也可以使用类似方式注入css
await win.webContents.insertCSS('html, body{ background-color: red }')
```
