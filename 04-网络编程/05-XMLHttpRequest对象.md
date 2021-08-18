# 05-XMLHttpRequest 对象

## 一 XMLHttpRequest 对象的使用

### 1.0 基础示例

以下示例都需要启动配置好的 NodeJS 服务器，并且需要在同源情况下进行访问，即在 Node 项目的 public 文件夹的 index.html 中书如下 ajax（仍然使用接口：`/hi`）：

```html
<button id="btn">点击执行Ajax</button>
<script>
  let btn = document.querySelector('#btn')

  btn.onclick = function () {
    // 1 创建 Ajax 对象。IE6 中对象为：ActiveXObject("Microsoft.XMLHTTP");
    let xhr = new XMLHttpRequest()
    // 2 设置请求方式、请求地址，参数三可选表示是否异步，默认为true异步
    xhr.open('get', 'http://localhost:3000/hi')
    // 3 发送请求
    xhr.send(null)
    // 4.获取服务器端响应的数据：由于 xhr.send() 是异步的，所以后面只能用事件方式监听
    // 如果是同步请求则这里无需使用事件
    xhr.onload = function () {
      // onload事件在成功接收完响应时触发
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        console.log(xhr.responseText)
      } else {
        console.log('error: ' + xhr.status)
      }
    }

    // 5 如果在收到响应前想取消异步请求
    // xhr.abort()
  }
</script>
```

访问：<http://localhost:3000>，点击按钮即可执行 Ajax。

### 1.1 Ajax 请求阶段

在创建 Ajax 对象，配置 Ajax 请求，发送请求，以及接收服务端响应数据过程中，每一个步骤都对应一个数值，保存在 `xhr.readyState`，状态码改变的监听事件为： `onreadystateChange`。

常见状态：

```txt
0   请求未初始化（未调用open()）
1   请求已建立，但未发送（未调用send()）
2   请求已发送
3   请求正在处理中，此时一般已经接收到了一部分数据
4   响应完成
```

状态获取方式示例：

```js
xhr.onreadystatechange = function () {
  console.log(xhr.readyState) // 依次输出 1 2 3 4

  // DOM Level0 风格的响应处理
  if (xhr.readyState == 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
      console.log(xhr.responseText)
    } else {
      console.log('error: ' + xhr.status)
    }
  }
}
xhr.send(params)
```

### 1.2 HTTP 请求头

每个 HTTP 请求和响应都会携带一些头部字段，默认情况下， XHR 请求会发送以下头部字段：

```txt
Accept：浏览器可以处理的内容类型。
Accept-Charset：浏览器可以显示的字符集。
Accept-Encoding：浏览器可以处理的压缩编码类型。
Accept-Language：浏览器使用的语言。
Connection：浏览器与服务器的连接类型。
Cookie：页面中设置的 Cookie。
Host：发送请求的页面所在的域。
Referer：发送请求的页面的 URI。注意，这个字段在 HTTP 规范中就拼错了，所以考虑到兼容性也必须将错就错。（正确的拼写应该是 Referrer。）
User-Agent：浏览器的用户代理字符串
```

用户也可以自定义一些请求头字段，服务端可以获取到这些自定义字段：

```js
xhr.open('get', 'http://localhost:3000/hi')
xhr.setRequestHeader('token', 'abcdefg123')
xhr.send(null)
```

### 1.3 HTTP 响应头

使用 getResponseHeader()方法 可以获得响应头：

```js
let myHeader = xhr.getResponseHeader('token')
let allHeaders = xhr.getAllResponseHeaders()
```

常见的响应头有：

```txt
Request URL: http://localhost:3000/hi
Request Method: GET
Status Code: 304 Not Modified
Remote Address: [::1]:3000
Referrer Policy: strict-origin-when-cross-origin
```

## 二 XMLHttpRequest 常见配置

### 2.1 请求方式

在使用表单提交请求时，请求参数会被浏览器自动设置好，GET 方式的请求，参数会以 `?username=lisi&password=123` 方式追加到请求地址中，而 POST 方式的请求参数默认会被追加到请求体中，在 Ajax 中也同样有这样的设定。

GET 请求方式：

```js
// 2 设置请求方式、请求地址
let params = 'username=lisi&password=123'
xhr.open('get', 'http://localhost:3000/getDemo' + '?' + params)
// 3 发送请求
xhr.send()
```

POST 请求方式：

```js
// 2 设置请求方式、请求地址
let params = 'username=lisi&password=123'
xhr.open('post', 'http://localhost:3000/postDemo')
xhr.setRequestHeader(
  // POST 请求必须设置请求头
  'Content-Type',
  'application/x-www-form-urlencoded'
)
// 3 发送请求：在sen的中发送参数，POST的参数封装在请求体中
xhr.send(params)
```

### 2.2 参数传递方式

在上述案例中，请求的参数都是以字符串形式传递的：`"username=lisi&password=123"`，这种方式其实叫做 URL 编码格式。

通过设置请求头，请求参数的格式可以有多种传递方式。

URL 编码传递方式：

```js
// URL 编码格式传递："username=lisi&password=123"
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
```

JSON 格式传递方式：

```js
// JSON 格式传递: {username:"zs","password":"123"}，发送时必须转换为字符串
xhr.setRequestHeader('Content-Type', 'application/json')
xhr.send(JSON.stringify({ username: 'zs', password: '123' }))
```

注意：GET 请求只支持 URL 编码格式，POST 一般推荐请求参数在请求体中。

为了保证请求 URL 编码格式的正确，可以使用下列函数方式添加参数：

```js
function addURLParam(url, name, value) {
  url += url.indexOf('?') == -1 ? '?' : '&'
  url += encodeURIComponent(name) + '=' + encodeURIComponent(value)
  return url
}

let url = 'locahost:3000/getDemo'
// 添加参数
url = addURLParam(url, 'id', '1001')
url = addURLParam(url, 'name', 'Li')
// 初始化请求
xhr.open('get', url, false)
```

## 三 Ajax2.0

### 3.0 Ajax2.0 概念

XMLHttpRequest Level 1 只是把已经存在的 XHR 对象的实现细节明确了一下。 XMLHttpRequest Level 2 又进一步发展了 XHR 对象。

### 3.1 FormData 类型

FormData 类型可以进行表单的序列化，并能快速填充数据

```js
let data = new FormData()
data.append('is', '10001')
```

FormData() 构造函数可以直接传入一个表单元素！这样就能快速执行 Ajax：

```js
let xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
  if (xhr.readyState == 4) {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
      console.log(xhr.responseText)
    } else {
      console.log('error: ' + xhr.status)
    }
  }
}
xhr.open('post', 'localhost:3000/postDemo', true)

let params = new FormData(document.getElementById('loginForm'))
xhr.send(new FormData(form))
```

使用 FormData 的另一个方便之处是不再需要给 XHR 对象显式设置任何请求头部了。 XHR 对象能够识别作为 FormData 实例传入的数据类型并自动配置相应的头部。

### 3.2 超时

IE8 中 XHR 的 timeout 事件现在也成为了 XMLHttpRequest Level 2 规范：

```js
let xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
  if (xhr.readyState == 4) {
    try {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        alert(xhr.responseText)
      } else {
        alert('Request was unsuccessful: ' + xhr.status)
      }
    } catch (ex) {
      // 假设由 ontimeout 处理
    }
  }
}
xhr.open('get', 'localhost:3000', true)
xhr.timeout = 1000 // 1000毫秒超时
xhr.ontimeout = function () {
  alert('Request did not return in a second.')
}
xhr.send(null)
```

### 3.3 overrideMimeType()方法

假设服务器实际发送了 XML 数据，但响应头设置的 MIME 类型是 text/plain。结果就会导致虽然数据是 XML，但 responseXML 属性值是 null。此时调用 overrideMimeType()可以保证将响应当成 XML 而不是纯文本来处理：

```js
let xhr = new XMLHttpRequest()
xhr.open('get', 'localhost:3000', true)
xhr.overrideMimeType('text/xml') // 强行让XHR把响应当做XML处理
xhr.send(null)
```

## 四 进度事件

### 4.0 常见进度事件

有 6 个进度事件：

```txt
loadstart：在接收到响应的第一个字节时触发。
progress：在接收响应期间反复触发。
error：在请求出错时触发。
abort：在调用 abort()终止连接时触发。
load：在成功接收完响应时触发
loadend：在通信完成时，且在 error、 abort 或 load 之后触发。
```

每次请求都会首先触发 loadstart 事件，之后是一个或多个 progress 事件，接着是 error、abort 或 load 中的一个，最后以 loadend 事件结束。

### 4.1 load 事件

load 事件可以替代检查 readyState，更简洁，但是不兼容 IE 低版本：

```js
let xhr = new XMLHttpRequest()
xhr.onload = function () {
  if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
    alert(xhr.responseText)
  } else {
    alert('Request was unsuccessful: ' + xhr.status)
  }
}
xhr.open('get', 'localhost:3000', true)
xhr.send(null)
```

### 4.2 progress 事件

在浏览器接收数据期间，progress 事件会被反复触发，每次触发时， onprogress 事件处理程序都会收到 event 对象，其 target 属性是 XHR 对象，且包含 3 个额外属性： lengthComputable、 position 和 totalSize。其中， lengthComputable 是一个布尔值，表示进度信息是否可用； position 是接收到的字节数； totalSize 是响应的 ContentLength 头部定义的总字节数。有了这些信息，就可以给用户提供进度条了。以下代码演示了如何向用
户展示进度：

```js
let xhr = new XMLHttpRequest()

xhr.onload = function (event) {
  if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
    alert(xhr.responseText)
  } else {
    alert('Request was unsuccessful: ' + xhr.status)
  }
}

xhr.onprogress = function (event) {
  let divStatus = document.getElementById('status')
  if (event.lengthComputable) {
    divStatus.innerHTML =
      'Received ' + event.position + ' of ' + event.totalSize + ' bytes'
  }
}

// 必须在调用 open()之前添加 onprogress 事件处理程序
xhr.open('get', 'localhost:3000', true)
xhr.send(null)
```

## 五 一些开发问题

### 5.1 IE 中的请求缓存问题

IE8 中，请求的信息会被缓存下来，所以后续的星球会先从浏览器中直接获取结果，如果在这之间服务端出现了数据变化，Ajax 的获取到的数据却不会做响应变更。

解决方案：

```js
// 在请求地址的后面添加请求参数，每一次请求中的请求参数都不相同
xhr.open('get', 'http://www.demo.com?t=' + Math.random())
```

### 5.6 Beacon API

为了把尽量多的页面信息传到服务器，很多分析工具需要在页面生命周期中尽量晚的时候向服务器发送遥测或分析数据。因此，理想的情况下是通过浏览器的 unload 事件发送网络请求。这个事件表示用户要离开当前页面，不会再生成别的有用信息了。

在 unload 事件触发时，分析工具要停止收集信息并把收集到的数据发给服务器。这时候有一个问题，因为 unload 事件对浏览器意味着没有理由再发送任何结果未知的网络请求（因为页面都要被销毁了）。例如，在 unload 事件处理程序中创建的任何异步请求都会被浏览器取消。 为此， 异步 XMLHttpRequest 或 fetch()不适合这个任务。分析工具可以使用同步 XMLHttpRequest 强制发送请求，但这样做会导致用户体验问题。浏览器会因为要等待 unload 事件处理程序完成而延迟导航到下一个页面。

为解决这个问题， W3C 引入了补充性的 Beacon API。这个 API 给 navigator 对象增加了一个 sendBeacon()方法。这个简单的方法接收一个 URL 和一个数据有效载荷参数，并会发送一个 POST 请求。可选的数据有效载荷参数有 ArrayBufferView、 Blob、 DOMString、 FormData 实例。如果请求成功进入了最终要发送的任务队列，则这个方法返回 true，否则返回 false。

```js
// 发送 POST 请求
// URL: 'https://example.com/analytics-reporting-url'
// 请求负载： '{foo: "bar"}'
navigator.sendBeacon(
  'https://example.com/analytics-reporting-url',
  '{foo: "bar"}'
)
```

这个方法虽然看起来只不过是 POST 请求的一个语法糖，但它有几个重要的特性：

```txt
sendBeacon()并不是只能在页面生命周期末尾使用，而是任何时候都可以使用。
调用 sendBeacon()后，浏览器会把请求添加到一个内部的请求队列。浏览器会主动地发送队列中的请求。
浏览器保证在原始页面已经关闭的情况下也会发送请求。
状态码、超时和其他网络原因造成的失败完全是不透明的，不能通过编程方式处理。
信标（ beacon）请求会携带调用 sendBeacon()时所有相关的 cookie。
```
