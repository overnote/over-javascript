# Electron 与系统化交互

## 一 系统对话框

### 1.1 文件对话框

软件大部分具备打开本地目录的功能，示例如下：

```js
async function() {
      let filePath = await remote.dialog.showOpenDialog({       // 执行打开对话框
        title: "I need to open a file",
        buttonLabel: "click here to open",
        defaultPath: remote.app.getPath("pictures"),            // 默认打开路径
        properties: [],
        filters: [                                              // 过滤显示文件
          {name: "images", extensions: ["jpg", "png", "gif"] },
          {name: "videos", extensions: ["mp4", "avi", "mkv"] },
        ],
      });
    }
```

### 1.2 关于 对话框

软件一般都有 `关于` 这个选项，Electron 应用默认从 `package.json` 中生成，也可以在手动设置：

```js
// 手动设置 关于
app.setAboutPanelOptions({})

// 在其他地方显示 关于 对话框
app.showAboutPanel()
```

## 二 菜单

### 2.1 窗口菜单

窗口菜单基本上不符合需要，可以使用 `autoHideMenuBar:true` 隐藏，但是隐藏后的菜单在打开窗口后还会显示，尤其是 Mac 平台，其菜单是位于系统标题栏，更加需要自定义：

```js
// 创建菜单
const { Mennu } = require('electron')
let menuTemplates = [
    {
        label: '菜单1',
        submenu: [{ label: '子菜单1-1' }, { label: '子菜单1-2' }],
    },
    {
        label: '菜单2',
        submenu: [
            {
                label: '子菜单2-1',
                click() {
                    console.log(111)
                },
            },
            // role表示行为，有：undo、redo、cut、copy、paste、selectAll、reload、minimize、close、quit等
            // 拥有 role 行为的菜单 click 无效
            // Mac 系统必须设置 role，否则窗口不具备 复制、剪切、粘贴功能
            { label: '粘贴', role: 'paste' },
            { label: '菜单2-3', type: 'separator' }, // 设置菜单空格，值还有 checkbox、radio
            { label: '菜单2-4' },
        ],
    },
]
if (process.platform == 'darwin') {
    menuTemplates.unshift({ label: '' }) // 第一个菜单不做任何设置，直接由应用名默认替代
}

let menu = Menu.buildFromTemplate(menuTemplates)
Menu.setApplicationMenu(menu)
```

### 2.2 HTML 右键菜单

使用系统原生菜单：

```js
const { Menu } = window.require('electron').remote
let menu = Menu.buildFromTemplate([
    {
        label: '右键菜单1',
        click() {
            console.log(111)
        },
    },
    { label: '右键菜单2' },
])
window.oncontextmenu = function (e) {
    e.preventDefault()
    menu.popup()
}
```

右键菜单可以是使用 HTML 原生实现，但是会有 bug，如果鼠标移动的到 Electron 应用的边缘，那么右键菜单仍然是在右侧出现，会让应用底部出现滚动条：

```vue
<template>
    <div id="app">
        <div id="menu-list">
            <div class="menu-item">右键菜单1</div>
            <div class="menu-item">右键菜单2</div>
        </div>
    </div>
</template>

<script>
const { screen } = window.require('electron').remote
window.oncontextmenu = function (e) {
    e.preventDefault()
    let menu = document.querySelector('#menu-list')
    let point = screen.getCursorScreenPoint()
    // 菜单窗口的位置应该是相对于窗口的，而不应该相对于鼠标
    console.log('e.clientX: ' + e.clientX + ', e.clientY: ' + e.clientY)
    console.log('point.x: ' + point.x + ',point.y: ' + e.clientY)
    menu.style.left = point.x + 'px'
    menu.style.top = point.y + 'px'
    menu.style.display = 'block'
}

window.onclick = function (e) {
    document.querySelector('#menu-list').style.display = 'none'
}
</script>

<style scoped>
#menu-list {
    width: 125px;
    overflow: hidden;
    border: 0px solid #ccc;
    box-shadow: 3px 3px 3px #ccc;
    position: absolute;
    display: none;
}
#menu-list .menu-item {
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-bottom: 1px solid #ccc;
    background: #fff;
}
</style>
```

## 三 监听快捷键

快捷键的操作直接使用 HTML 原生技术即可：

```js
window.onkeydown = function (e) {
    // Ctrl + S      e.metaKey是mac上的花键
    if ((e.ctrKey || e.metaKey) && e.keyCode == 83) {
        console.log(111)
    }
}
```

如果需要在窗口处于非激活也能监听按键：

```js
const { globalShorcut } = window.require('electron')
// 全局监听 Ctrl + K
globalShorcut.register('CommandOrCControl+K', () => {
    console.log(111)
})
```

## 四 托盘图标

```js
import { app, protocol, BrowserWindow, Tray } from 'electron'

let win;
let tray;   // 托盘图标

createWindow(){

  // 其他代码....


  tray = new Tray(iconPath);    // iconPath 是图标地址
  // 还可以通过定时器 tray.setImage() 来实现通知效果
  tray.on('click', ()=>{
    win.show();
  })

  // 还可以注册托盘图标的彩蛋
  let menu = Menu.buildFromTemplate([
    {label:'显示窗口', type: 'normal', click(){win.show()}},
    {label:'退出应用', type: 'normal', click(){app.quit()}},
  ]);
  tray.setContextMenu(menu);
}
}
```

## 五 剪切板

剪切板模块 clipboard 是主进程、渲染进程都可以使用的模块。

写入数据 API：

```js
const { clipboard, nativeImage } = window.require('electron')
const path = window.require('path')

// 图像的写入需要额外的操作
let imagePath = path.join(__static, 'icon.png')
let img = nativeImage.createFromPath(imagePath)
clipboard.writeImage(img) // 还有： writeText  writeHTML

clipboard.clear() // 清除数据
```

读取数据 API：

```js
// readText  readHTML
// 读取图片 imgSrc 就可以作为 image 标签的的src属性
let imgSrc = clipboard.readImg().toDataURL()
```

在一些场景中，如：读取系统文件夹中的图片，会出现错误，可以利用第三方包：<https://github.com/alex8088/clipboard-files>

## 六 系统通知

网页中使用系统通知，需要先请求用户授权，其 HTML5 的原生 API 为：

```js
Notification.requestPermission( status => {
  if(status !== 'granted'){
    console.log("用户拒绝了请求");
    return
  }

  let notify = new Notification('新消息内容'， {
    body: '消息正文'
  });
})
```

系统显示通知后，如果用户点击通知，则会触发 Notification 的实例事件 click：

```js
notify.onlick = function () {
    console.log('用户点击了消息')
}
```

如果要在主进程内发送通知，Electron 提供了和 H5 API 相似的类 Notification，区别是 H5 的通知在实例化后立即显示，而 Electron 的通知则需要调用 `show()`。

## 七 应用内打开文件

Electron 的 shell 模块可以在 Electron 应用中打开 Word 文档等应用：

```js
const { shell } = require('electron')
shell.openExternal('https://www.baidu.com') // 使用默认浏览器打开网页，该方法是异步的
shell.openItem('D:\\files\\demo.docx') // 打开word文档，该方法是同步的
shell.moveToTrash('D:\\files\\demo.docx') // 删除到回收站，该方法是同步的
```

## 八 使用系统字体

使用系统字体可以利用 CSS3 直接实现：

```html
<div style="font:caption">使用系统默认标题字体</div>
<div style="font:menu">使用系统默认菜单字体</div>
<div style="font:message-box">使用系统默认消息提示字体</div>
<div style="font:status-bar">使用系统默认状态栏字体</div>
```
