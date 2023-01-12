# Electron 存储与通信

## 一 Electron 数据存储

### 1.1 本地文件存储

Electron 操作本地数据采用了 Node.js 的 API，利用 `fs` 包可以直接操作文件，但是该包删除子目录需要递归，这里有个第三方库 `fs-extra` 操作文件的 API 封装的更好。

在桌面系统中，客户端的本地文件有系统默认的位置：

```txt
Win：   C:\Users\[user name]\AppData\Roaming\
Linux： /home/[user name]/.config/
Mac：   /Users/[user name]/Library/Appication Support/
```

获取该路径的 API 为：

```js
// 根据参数不同获取不同的路径，参数 userData 用来获取操作系统默认数据存储目录地址 + 应用名 (package.json 中的 name)
app.getPath('userData')

// 其他参数都是获取对应路径：desktop、documents、downloads、video、music、appData（自定义数据目录）、temp、exe（当前程序执行路径）

// 也可以允许用户自定义数据存储路径，同理第一个参数也可以选择上述参数
app.setPath('appData', 'D:\\mydata')
```

当然获取目录也可以借助 Node.js 的能力：

```js
require('os').homedir() // 返回当前用户主目录：C:\Users\[user name]
require('os').tpmdir() // 返回默认临时文件夹：C:\Users\[user name]\AppData\Local\Temp
```

本地文件如果是 JSON 格式，则可以使用第三方库 <https://github.com/typicode/lowdb)>

### 1.2 利用浏览器存储机制

浏览器的存储机制主要有四个：

- cookie：最多只能存储 4KB 数据，数据有过期时间，数据也会被传递到服务端
- LocalStorage：最多只能存储 10M 数据，数据没有过期时间，数据不会自动随浏览器传递到服务端
- SessionStorage：特性与 LocalStorage 相同，但是只是会话存储，浏览器关闭后，数据也会清除
- IndexDB：基于 JavaScript 的面向对象数据库存储，可以用于存储大量数据，推荐使用第三方库：[Dexie.js](https://github.com/dfahlander/Dexie.js)、<https://github.com/jakearchibald/idb>、<https://pouchdb.com/>(类似 CouchDB 的强大数据库，上手成本高)

浏览器原生的 document 可以访问 cookie，但是一旦 cookie 受限，则无法继续操作。Electron 提供了独立的 cookie 操作 API，可以用来访问受限的 cookie：

```js
const { remote } = require("electron");

// 获取 cookie
let getCookie = async function (key) {
  let cookies = await remote.session.defaultSession.cookies.get({ key });
  if (cookies.length > 0) {
    return cookies[0].value;
  } else {
    return "";
  }
};

// 设置 cookie：参数是 cookie 对象，包含 cookie 常见属性，以及 HttpOnly、secure 等
// 这两个属性可以保护 cookie，secure 只允许 https 方式，以防止第三方嗅探。HttpOnly 用来防止 XSS 跨站脚本攻击
  await remote.session.defaultSession.cookies.set(cookie);
};

// 清空浏览器缓存
let clearCookie = async function(){
    remote.session.defaultSession.clearStorageData({
        storage: 'cookies, localstorage'
    });
}
```

上述代码运行在渲染进程中，defaultSession 是当前浏览器的会话实例。获取当前页面的 session 方式如下：

```js
let session = win.webContents.session
```

### 1.3 第三方存储

一些轻量级的第三方数据库也可以直接安装在 Electron 内：

- SQLite：轻量关系型数据库，常用于客户端存储方案。推荐驱动为 knex.js
- rxdb：可以运行在浏览器中的实时数据库！支持订阅数据变更事件。在 Electron 中，操作一个窗口数据，无需发消息给另外一个窗口，那个窗口可以通过数据变更事件获悉变更的内容！git 仓库为：<https://github.com/pubkey/rxdb>

## 二 Electron 通信

### 2.1 Electron 中的一些通信常识

Electron 的通信可以依赖于浏览器的 Ajax 能力，也可以依赖 Node.js 的能力，但是在使用 Ajax 时会遇到跨域问题，Electron 可以实现禁用同源策略：

```js
let win = new BrowserWindow({
  webPreferences: {
    // ... 其他配置
    webSecurity: false, // 禁用当前窗口的同源策略
    // 此外还可以在 HTTPS 页面内访问 HTTP 协议服务
    allowRunningInsecureContent: true,
  },
})
```

贴士：大部分数据请求都发生在渲染进程，所以可以尽量避免使用 Node.js 的能力。此外 Electron 也封装了 net 模块用来进行网络请求。

笔者这里建议使用**axios**，它同时支持 Node 与浏览器环境！有条件的，也推荐使用 H5 提供 Fetch。

在一些场景中，还需要截获并修改网络请求，比如为第三方网页注入一个脚本，让这个脚本修改 XMLHttpRequest 对象，并获取第三方网页 Ajax 请求后的数据：

```js
// 先将原始的 open 方法保存起来
let open = window.XMLHttpRequest.prototype.open

window.XMLHttpRequest.prototype.open = function (method, url, params) {
  this.addEventListener(
    'readystatechange',
    () => {
      if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText) // 打印截获的服务端数据
      }
    },
    false
  )
  // 自定义的 open 调用完毕后，再用原来的 open 方法再次调用
  open.apply(this, arguments)
}
```

上述方法也有局限性：无法截获静态文件请求、无法修改响应数据，此时可以使用 Electron 提供的方法：

```js
this.wind.webContents.session.webRequest.onBeforeRequest(
  { urls: ['https://*/*'] },
  (details, cb) => {
    if (details.url === 'https://demo.com/demo.css') {
      cb({ redirectURL: 'http://redirectdemo.com/demo.css' })
    } else {
      cb(null)
    }
  }
)
```

### 2.2 Electron 与系统其他应用通信

Electron 没有提供与操作系统内其他应用通信的 API，需要借助 IPC 命名管道来实现：

lectron 内创建一个命名管道，用来接收数据示例：

```js
const net = require('net')

const PIPE_NAME = '\\\\.\\ pipe\\ mypipe'

const server = net.createServer((conn) => {
  conn.on('data', (r) => {
    console.log('receive:', r.toString())
  })

  conn.on('end', () => {
    console.log('client close')
  })

  conn.write('client ready, starting to send data!')
})

server.on('end', () => {
  console.log('server close')
})

// 创建一个命名管道 server，一旦有客户端连接此管道，则触发 createServer 的回调函数
server.listen(PIPE_NAME, () => {
  console.log('Server is ready')
})
```

Electron 应用向其他应用开启的管道发送数据示例：

```js
const net = require('net')

const PIPE_NAME = '\\\\.\\ pipe\\ mypipe'

const client = net.connect(PIPE_NAME, () => {
  console.log('connect success')
  client.write('send data...')
})

client.on('data', (r) => {
  console.log('receive:', r.toString())
  client.end('close client')
})

client.on('end', () => {
  console.log('Client end...')
})
```

### 2.3 Electron 与 网页通信

网页环境是一个沙箱环境，无法使用命名管道方式来实现通信，这里其实可以曲线救国：可以在 Electron 内启动一个 HTTP 服务、Websocket 服务来和网页通信。

### 2.4 自定义协议

在 Electron 内部开启 http 服务器会产生额外的消耗，FTP 协议在使用上不能很好支持路径查找，这时候往往需要自定义协议。Electron 允许开发者自定义一个类似 HTTP、FTP 的协议，一旦应用内出现该协议请求，则可以进行拦截、处理、响应请求：

```js
// 以下代码需要在程序启动前设置（ready 前）
const { protocol } = require('electron')

const option = [
  {
    scheme: 'app', // 协议名称
    privileges: { secure: true, standard: true },
  },
]

protocol.registerSchemesAsprivileged(option)
```

注册该协议：

```js
const { protocol } = require('electron')
const path = require('path')
const fs = require('fs')

// 主持一个基于缓冲区的协议：当用户发起类似”app://”开头的请求时，此回调函数会截获用户的请求，完成一个静态服务
protocol.registerBufferProtocol(
  'app',
  (req, respond) => {
    let pathName = new URL(req.url).pathname
    let fullName = path.join(__dirname, pathName)
    fs.readFile(fullName, (err, data) => {
      if (err) {
        console.log(err)
        return
      }
      let ext = path.extname(pathName).toLowerCase()
      let mimeType = ''
      if (ext === '.js') {
        mimeType = 'text/javascript'
      } else if (ext === '.html') {
        mimeType = 'text/html'
      } else if (ext === '.css') {
        mimeType = 'text/css'
      }
      respond({ mimeType, data })
    })
  },
  (error) => {
    if (error) {
      console.log(error)
    }
  }
)
```

### 2.5 代理

假如在一个域内，有电脑 A 和电脑 B，电脑 A 不能访问外网，但是电脑 B 可以，如果要实现电脑 A 也能访问外网，那么只需要将电脑 A 的网络代理到电脑 B 即可，常用的代理有 HTTP 代理、HTTPS 代理、socks 代理。socks 代理隐蔽性更高、效率更高，推荐使用。

socks5 的适用性更强，使用方式如下：

```js
let result = await win.webContents.session.setProxy({
  proxyRules: 'socks5://192.168.1.101',
})
```

如果要给整个应用程序设置代理，则可以如下设置：

```js
app.commandLine.appendSwitch('proxy-server', 'socks://192.168.1.101')
```
