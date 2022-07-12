# Electron 窗口

## 一 Electron 窗口

窗口（Browser Window）是桌面应用非常重要的部分。

控制窗口位置：

```txt
属性：x y center movable 说明：x 与 y 控制窗口在屏幕的位置，窗口默认位于屏幕正中
应用：经常用于创建新窗口时，新窗口与当前窗口交错显示
```

控制窗口大小：

```txt
属性：width height minWidth/maxWidth minHeight/maxHeight resizable minimizabel
maximizable 说明：用来设置窗口大小，以及是否允许用户控制窗口大小
应用：用户拖动窗口可以改变大小，如果不想让用户主动改变，可以在设置 width、height 后，设置 resizable 为 false 即可，max/min 可以控制用户能够放大缩小的最大程度
```

```txt
属性：title icon frame autoHideMenuBar titleBarStyle
说明：用来设置窗口的边框、标题栏、菜单栏
应用：窗口默认的 title 为网页 title，icon 默认为可执行文件的图标。frame 设置为 false，才能自定义系统标题栏，实现自定义窗口
```

```txt
属性：nodeIntegration nodeIntegrationInWorker nodeIntegrationInSubFrames
说明：控制窗口加载的网页是否集成 Node 环境
应用：这三个配置的默认选项都是 false，因为会引起安全问题
```

```txt
属性：preload webSecurity contextIsolation
说明：允许最大限度控制渲染进程加载的页面
应用：preload 配置项可以实现渲染进程加载的页面注入脚本，该脚本也能访问 Node 环境，webSecurity 用来控制同源策略
```

## 二 示例：自定义窗口

### 2.1 关闭默认窗口

很多时候默认的窗口样式需要自定义，首先需要关闭默认窗口：

```js
mainWin = new BrowserWindow({
  frame: false,
  webPreferences: { nodeIntegration: true },
})
```

### 2.2 监听窗口变化事件

APP.vue 或者 主页面中自定义 缩小、放大、关闭 三个按钮后，绑定下列函数

```js
const { remote } = require('electron')

const currentWin = remote.getCurrentWindow()

// 最小化
function minisize() {
  currentWin.minisize()
}

// 最大化
function maxsize() {
  currentWin.maxsize()
}

// 重置窗口
function restore() {
  currentWin.resotre()
}

// 关闭窗口
function close() {
  currentWin.close()
}
```

此外还要在生命周期钩子函数中监听窗口是否变化为最大值、最小值，值的变化等：

```js
mounted(){

    currentWin.on('maximize', ()=>{
        this.isMaxSize = true;          // 记录窗口是否最大的值，用来记录最大化图标显示状态
        this.setWindState();            // 用来记录当前窗口状态
    });

    currentWin.on('unmaximize', ()=>{
        this.isMaxSize = false;
        this.setWindState();
    });

    currentWin.on('move', this.debounce(
        ()=>{
            this.setWindState();
        }
    ));

    currentWin.on('resize', this.debounce(
        ()=>{
            this.setWindState();
        }
    ));

    // 每次重启应用时，都能恢复窗口状态
    this.isMaxSize = win.isMaximized();
    this.getWinState();
}
```

注意：上述四个监听窗口变化的函数位于渲染进程，会有潜在 BUG。当用户按下 Ctrl+R 刷新页面后，再次操作窗口来触发最大最小，主进程会出现异常！！原因是 `currentWin` 是通过 `remote` 获得远程对象，这个远程对象位于主进程中，页面刷新后，注册在渲染进程中的事件被再次执行，由于以前安装的回调的上下文已经被释放，在此事件发生时，泄露的回调函数找不到执行体，在主进程引发异常。

处理方案：

- 方案一：将上述逻辑放在主进程中
- 方案二：禁止页面刷新

禁止刷新代码：

```js
mainWin.onkeydown = function (e) {
  if (e.keyCode == 82 && (e.ctrlKey || e.metaKey)) {
    return false
  }
}
```

debounce 是防抖函数：

```js
// 由于会短时间内触发多次，这里可以使用防抖函数：短时间内大量事件被触发，只执行最后一次关联任务
debounce(fn){
    let timeout = null;
    return function(){
        clearTimeout(timeout);
        timeout = setTimeout(()=>{
            fn.apply(this, arguments);
        }, 300);
    }
}

// 附限流函数：短时间大量事件被触发，只执行第一次触发的事件
debounce(fn){
    let timeout = null;
    return function(){
        if(timeout){
            return;
        }
        timeout = setTimeout(()=>{
            fn.apply(this, arguments);
            timeout = null;
        }, 300);
    }
}
```

### 2.3 记录窗口变化状态

`setState()` 把窗口的大小、位置、是否最大化记录在 LocalStorage 中，推荐根据需要自定义：

```js
    setWindState(){
        let currentWin = remote.getCurrentWindow();
        let rect = currentWin.getBounds();
        let isMaxSize = currentWin.isMaxSized();
        let obj = {rect, isMaxSize};
        localStorage.setItem("winState", JSON.stringify(obj));
    }

    // 每次打开应用，就可以恢复这些觳觫
    getWinState(){
        let currentWin = remote.getCurrentWindow();
        let winState = localStorage.getItem("winState");
        if(!winState){
            return;
        }
        winState = JSON.parse(winState);
        if(winState.isMaxSize){
            win.maximize();
        } else {
            win.setBounds(winState.rect);
        }

        let rect = currentWin.getBounds();
        let isMaxSize = currentWin.isMaxSized();
        let obj = {rect, isMaxSize};
        localStorage.setItem("winState", JSON.stringify(obj));
    }
```

### 2.4 打开窗口时位置优化

软件在打开时，窗口默认位于屏幕中间，然后才会移动到记录的状态位置，这样的用户体验极度不佳：

```js
// 创建窗口时，不显示窗口
mainWin = new BrowserWindow({
  // 其他配置...
  show: false,
})
```

`getState()` 方法中应该在数据准备完毕后显示窗口：

```js
// 末尾加入 show
currentWin.show()
```

但是这里官方推荐通过这种方式实现：监听 `BrowserWindow` 的 `ready-to-show` 事件。但是这样做有缺陷：窗口可以显示时，JS 的代码可能尚未准备完毕。

### 2.5 阻止窗口关闭

若用户在完成大量操作后，误关了窗口，就会有很多数据未提交，所以应用一般需要在关闭时提醒用户。

Electron 无法像网页那样监听 `onbeforeunload` 阻止关闭，但是可以在该事件中操作 DOM，创建一个浮动 div 来提示用户，用户确定后：

```js
currentWin.onbeforeunload = function () {
  currentWin.destroy() // 不能使用 close()，因为该函数会再次触发 onbeforeunload 事件，造成死循环
}
```

还有一个方案是，使用 close 事件阻止：

```js
currentWin.on('close', (e) => {
  // 由渲染进程显示提示信息，根据用户选择发送消息给主进程
  e.preventDefault()
})
```

注意：使用 onbeforeunload 事件方式来实现阻止窗口关闭时，如果 Electron 加载了一个注册了 onbeforeunload 事件的第三方网页，则该窗口无法关闭！这时候可以监听 webContents 的 `will-prevent-unload` 事件：

```js
win.webContents.on('will-prevent-unload', (event) => {
  event.preventDefault()
})
```

## 三 窗口使用的注意点

### 3.1 多窗口资源竞争

多个渲染窗口同时对一个本地文件进行更新，就会造成资源竞争（类似多进程同步问题、多线程同步问题）。

解决方案一：窗口之间通过渲染进程之间的消息通信来保证读写顺序。即当一个渲染进程准备更新文件，需要先广播消息给其他渲染进程，禁止其他渲染进程访问该文件，等待当前渲染进程更新完毕后，再广播消息给其他渲染进程说明可以更新。

解决方案二：利用 Node 的 `fs.watch` 监听文件变化，一旦文件发生改变，加载最新文件，无论哪个窗口拿到的文件都是最新的。当窗口需要保存文件时，渲染进程向主进程发送更新文件的消息，多个更新消息就会入驻主进程的队列。

解决方案三：在主进程设置一个令牌 `global.fileLock = false;` 然后在渲染进程中读取该令牌 `remote.getGlobal('fileLock')`。这里看上去简便很多，但是当需要更新文件时，仍然需要发送消息给主进程。

推荐方案二：因为方案二利用了 JS 单线程特性，队列保证了有序，程序结构上更加解耦。

### 3.2 模态框

用户在操作窗口 A 时，需要的打开窗口 B，在窗口 B 完成一系列操作后需要关闭窗口 B 才能操作窗口 A，此时，窗口 B 就是窗口 A 的模态框。

一旦模态框出现，就不能再操作父窗口，打开模态框的示例

```js
const remote = require("electron").remote;

this.win = new remote.BrowserWindow({
    parent: remote.getCurrentWindow();
    modal: true,
    webPreferences: {
        nodeIntegration: true
    }
})
```

贴士：虽然父窗口此时无法使用，但并不代表其已经被禁用，仍然可以接收点击事件、完成用户输入。

贴士：窗口不但有父子也有激活与否的判断，获取当前激活的窗口方法：`BrowserWindow.getFocusedWindow()`，这里与`currentWindow`不是一个概念，后者只是当前渲染进程关联的窗口。

### 3.3 Mac 系统注意点

Mac 上应用程序在关闭后，仍然会保留在 Docker 栏上，方便快速启动，Electron 项目也可以这样实现，以保证 Mac 上的用户体验：

```js
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 如果不是 Mac 系统，才会退出，是 Mac 系统则什么都不做！
    app.quit()
  }
})

// Mac 专用事件，Docker 上的应用激活时触发
app.on('activate', () => {
  if (win == null) {
    createWindow()
  }
})
```

Mac 下还有 DarkMode，可以通过如下方式获取系统是否处于深色模式 (这是主进程中只读的属性)：

```js
// 6.X 及之前，已废弃
const isDarkMode = electron.remote.systemPreferences.isDarkMode()

// 7.X 及之后
const currentMode = electron.nativeTheme.shouldUseDarkColors
```
