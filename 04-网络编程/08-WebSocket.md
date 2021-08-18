# 08-WebSocket

## 一 WebSocket 概念

Web Socket（套接字）的目标是通过一个长时连接实现与服务器全双工、双向的通信。在 JavaScript 中创建 Web Socket 时，一个 HTTP 请求会发送到服务器以初始化连接。服务器响应后，连接使用 HTTP 的 Upgrade 头部从 HTTP 协议切换到 Web Socket 协议。这意味着 Web Socket 不能通过标准 HTTP 服务器实现，而必须使用支持该协议的专有服务器。

因为 Web Socket 使用了自定义协议，所以 URL 方案（ scheme）稍有变化：不能再使用 http://或 https://，而要使用 ws://和 wss://。前者是不安全的连接，后者是安全连接。在指定 Web Socket URL 时，必须包含 URL 方案，因为将来有可能再支持其他方案。

使用自定义协议而非 HTTP 协议的好处是，客户端与服务器之间可以发送非常少的数据，不会对 HTTP 造成任何负担。使用更小的数据包让 Web Socket 非常适合带宽和延迟问题比较明显的移动应用。使用自定义协议的缺点是，定义协议的时间比定义 JavaScript API 要长。 Web Socket 得到了所有主流浏览器支持。

## 二 基本使用

### 2.1 API

要创建一个新的 Web Socket，就要实例化一个 WebSocket 对象并传入提供连接的 URL：

```js
let socket = new WebSocket('ws://www.example.com/demo')
```

注意，必须给 WebSocket 构造函数传入一个绝对 URL。同源策略不适用于 Web Socket，因此可以打开到任意站点的连接。至于是否与来自特定源的页面通信，则完全取决于服务器。（在握手阶段就可以确定请求来自哪里。）

浏览器会在初始化 WebSocket 对象之后立即创建连接。与 XHR 类似， WebSocket 也有一个 readyState 属性表示当前状态。不过，这个值与 XHR 中相应的值不一样：

```txt
WebSocket.OPENING（ 0）：连接正在建立。
WebSocket.OPEN（ 1）：连接已经建立。
WebSocket.CLOSING（ 2）：连接正在关闭。
WebSocket.CLOSE（ 3）：连接已经关闭。
```

WebSocket 对象没有 readystatechange 事件，而是有与上述不同状态对应的其他事件。readyState 值从 0 开始。
任何时候都可以调用 close()方法关闭 Web Socket 连接：

```js
socket.close()
```

调用 close()之后， readyState 立即变为 2（连接正在关闭），

### 2.2 发送和接收数据

打开 Web Socket 之后，可以通过连接发送和接收数据。要向服务器发送数据，使用 send()方法并传入一个字符串、 ArrayBuffer 或 Blob，如下所示：

```js
let socket = new WebSocket('ws://www.example.com/server.php')
let stringData = 'Hello world!'
let arrayBufferData = Uint8Array.from(['f', 'o', 'o'])
let blobData = new Blob(['f', 'o', 'o'])
socket.send(stringData)
socket.send(arrayBufferData.buffer)
socket.send(blobData)
```

服务器向客户端发送消息时， WebSocket 对象上会触发 message 事件。这个 message 事件与其他消息协议类似，可以通过 event.data 属性访问到有效载荷：

```js
socket.onmessage = function (event) {
  let data = event.data
  // 对数据执行某些操作
}
```

与通过 send()方法发送的数据类似， event.data 返回的数据也可能是 ArrayBuffer 或 Blob。这由 WebSocket 对象的 binaryType 属性决定，该属性可能是"blob"或"arraybuffer"。

### 2.3 其他事件

WebSocket 对象在连接生命周期中有可能触发 3 个其他事件：

```txt
open：在连接成功建立时触发。
error：在发生错误时触发。连接无法存续。
close：在连接关闭时触发。
```

WebSocket 对象不支持 DOM Level 2 事件监听器，因此需要使用 DOM Level 0 风格的事件处理程序来监听这些事件：

```js
let socket = new WebSocket('ws://www.example.com/server.php')
socket.onopen = function () {
  alert('Connection established.')
}
socket.onerror = function () {
  alert('Connection error.')
}
socket.onclose = function () {
  alert('Connection closed.')
}
```

在这些事件中，只有 close 事件的 event 对象上有额外信息。这个对象上有 3 个额外属性：wasClean、 code 和 reason。其中， wasClean 是一个布尔值，表示连接是否干净地关闭； code 是一个来自服务器的数值状态码； reason 是一个字符串，包含服务器发来的消息。可以将这些信息显示给用户或记录到日志：

```js
socket.onclose = function (event) {
  console.log(
    `as clean? ${event.wasClean} Code=${event.code} Reason=${event.reason}`
  )
}
```
