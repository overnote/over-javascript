# 07-fetch-1-基本使用

## 一 fetch 概述

Fetch API 能够执行 XMLHttpRequest 对象的所有任务，但更容易使用，接口也更现代化，能够在 Web 工作线程等现代 Web 工具中使用。XMLHttpRequest 可以选择异步，而 Fetch API 则必须是异步。

fetch 是基于 Promise 实现的，示例：

```js
fetch('/getDemo')
  .then(
    (res) => {
      console.log(response.status) // 200
      console.log(response.statusText) // OK
      return res.text() // text() 返回 Promise 实例对象，包装的是真实的后台返回数据
    },
    (err) => {} // 因为服务器没有响应而导致浏览器超时
  )
  .then((data) => {
    console.log('请求到的数据：', data)
  })
```

## 二 基本使用

fetch() 既可以发送数据也可以接收数据。使用 init 对象参数，可以配置 fetch() 在请求体中发送各种序列化的数据。

### 2.1 在请求体中发送数据

只需要注明请求时候的方式即可，其实默认就是使用 get 方式请求的

```js
let params = 'foo=bar&baz=qux'
let headers = new Headers({
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
})

fetch('/getDemo', {
  method: 'get', // 必须使用一种方法
  body: params,
  headers: headers,
})
```

请求的地址仍然支持 `?id=123`这样拼接，也支持 REST 风格的 `user/123`。

### 2.2 发送 JSON 数据

```js
let params = JSON.stringify({ id: 1001 })
let headers = new Headers({ 'Content-Type': 'application/json' })

fetch('/postDemo', {
  method: 'post', // 必须使用一种方法
  body: params,
  headers: headers,
})
```

### 2.3 发送文件

因为请求体支持 FormData 实现，所以 fetch() 也可以序列化并发送文件字段中的文件：

```js
let imageFormData = new FormData()
let imageInput = document.querySelector("input[type='file']")
imageFormData.append('image', imageInput.files[0])

fetch('/upload', {
  method: 'POST',
  body: imageFormData,
})
```

这个 fetch() 实现可以支持多个文件：

```js
let imageFormData = new FormData()
let imageInput = document.querySelector("input[type='file'][multiple]")
for (let i = 0; i < imageInput.files.length; ++i) {
  imageFormData.append('image', imageInput.files[i])
}

fetch('/upload', {
  method: 'POST',
  body: imageFormData,
})
```

### 2.4 加载 Blob 文件

Fetch API 也能提供 Blob 类型的响应，而 Blob 又可以兼容多种浏览器 API。一种常见的做法是明确将图片文件加载到内存，然后将其添加到 HTML 图片元素。为此，可以使用响应对象上暴露的 blob() 方法。这个方法返回一个期约，解决为一个 Blob 的实例。然后，可以将这个实例传给 URL.createObjectUrl() 以生成可以添加给图片元素 src 属性的值：

```js
const imageElement = document.querySelector('img')

fetch('my-image.png')
  .then((response) => response.blob())
  .then((blob) => {
    imageElement.src = URL.createObjectURL(blob)
  })
```

### 2.5 发送跨源请求

从不同的源请求资源，响应要包含 CORS 头部才能保证浏览器收到响应。没有这些头部，跨源请求会失败并抛出错误。

```js
fetch('//cross-origin.com')
// TypeError: Failed to fetch
// No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

如果代码不需要访问响应，也可以发送 no-cors 请求。此时响应的 type 属性值为 opaque，因此无法读取响应内容。这种方适合发送探测请求或者将响应缓存起来供以后使用。

```js
fetch('//cross-origin.com', { method: 'no-cors' }).then((response) =>
  console.log(response.type)
)
// opaque
```

### 2.6 中断请求

调用 AbortController.abort() 会中断所有网络传输，特别适合希望停止传输大型负载的情况。中断进行中的 fetch() 请求会
导致包含错误的拒绝：

```js
let abortController = new AbortController()

fetch('wikipedia.zip', { signal: abortController.signal })
  .catch(() => console.log('aborted!')

// 10 毫秒后中断请求
setTimeout(() => abortController.abort(), 10)
```

## 三 Headers 对象

### 3.1 访问 Headers

Headers 对象是所有外发请求和入站响应头部的容器。每个外发的 Request 实例都包含一个空的 Headers 实例，可以通过 Request.prototype.headers 访问，每个入站 Response 实例也可以通过 Response.prototype.headers 访问包含着响应头部的 Headers 对象。这两个属性都是可修改属性。另外，使用 new Headers() 也可以创建一个新实例。

### 3.2 Headers 基本使用

Headers 支持使用键值对初始化：

```js
let seed = { foo: 'bar' }
let h = new Headers(seed)
console.log(h.get('foo')) // bar

// 通过 append 追加
h.append('name', 'Li')
console.log(h.get('name')) // "Li"
```

Headers 与 Map 类似，支持 get()、set()、has() 和 delete() 等实例方法，也支持使用一个可迭代对象进行初始化：

```js
let seed = [
  ['foo', 'bar'],
  ['baz', 'qux'],
]
let h = new Headers(seed)
console.log(h.get('foo')) // bar

console.log(...h.keys()) // foo, baz
console.log(...h.values()) // bar, qux
console.log(...h.entries()) // ['foo', 'bar'], ['baz', 'qux']
```

### 3.3 头部守卫

Headers 可以使用守卫设置一些属性不被客户端修改，不同的守卫设置会改变 set()、append() 和 delete() 的行为。违反护卫限制会抛出 TypeError。

```txt
none：在通过构造函数创建 Headers 实例时激活，无限制
request：在通过构造函数初始化 Request 对象，且 mode 值为非 no-cors 时激活，不允许修改禁止修改的头部
request-no-cors：在通过构造函数初始化 Request 对象，且 mode 值为 no-cors 时激活，不允许修改非简单头部（
response：在通过构造函数初始化 Response 对象时激活，不允许修改禁止修改的响应头部
immutable：在通过 error() 或 redirect() 静态方法初始化 Response 对象时激活
```

## 四 Request 对象

### 4.1 Request 对象基本使用

Request 对象是获取资源请求的接口，暴露了请求的相关信息：

```js
// 用所有默认值创建 Request 对象，查看对象的成员
console.log(new Request(''))

let req = new Request('https://foo.com',{ method: 'POST' }))
console.log(req) // Request {...}
```

### 4.2 Request 对象克隆

Fetch API 提供了两种不太一样的方式用于创建 Request 对象的副本：使用 Request 构造函数和使用 clone() 方法。

将 Request 实例作为 input 参数传给 Request 构造函数，会得到该请求的一个副本：

```js
let r1 = new Request('https://foo.com')
let r2 = new Request(r1)
console.log(r2.url) // https://foo.com/
```

如果再传入 init 对象，则 init 对象的值会覆盖源对象中同名的值：

```js
let r1 = new Request('https://foo.com')
let r2 = new Request(r1, { method: 'POST' })
console.log(r1.method) // GET
console.log(r2.method) // POST
```

这种克隆方式并不总能得到一模一样的副本。最明显的是，第一个请求的请求体会被标记为“已使用”：

```js
let r1 = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
let r2 = new Request(r1)
console.log(r1.bodyUsed) // true
console.log(r2.bodyUsed) // false
```

如果源对象与创建的新对象不同源，则 referrer 属性会被清除。此外，如果源对象的 mode 为 navigate，则会被转换为 same-origin。

第二种克隆 Request 对象的方式是使用 clone() 方法，这个方法会创建一模一样的副本，任何值都不会被覆盖。与第一种方式不同，这种方法不会将任何请求的请求体标记为“已使用”：

```js
let r1 = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
let r2 = r1.clone()
console.log(r1.url) // <https://foo.com/>
console.log(r2.url) // <https://foo.com/>
console.log(r1.bodyUsed) // false
console.log(r2.bodyUsed) // false
```

如果请求对象的 bodyUsed 属性为 true（即请求体已被读取），那么上述任何一种方式都不能用来创建这个对象的副本。在请求体被读取之后再克隆会导致抛出 TypeError。

```js
let r = new Request('https://foo.com');
r.clone();
new Request(r);
// 没有错误
r.text(); // 设置 bodyUsed 为 true
r.clone();
// TypeError: Failed to execute 'clone' on 'Request': Request body is already used
new Request(r);
// TypeError: Failed to construct 'Request': Cannot construct a Request with a
Request object that has already been used.
```

### 4.3 在 fetch() 中使用 Request 对象

在调用 fetch() 时，可以传入已经创建好的 Request 实例而不是 URL。与 Request 构造函数一样，传给 fetch() 的 init 对象会覆盖传入请求对象的值：

```js
let r = new Request('https://foo.com')
// 向 foo.com 发送 GET 请求
fetch(r)
// 向 foo.com 发送 POST 请求
fetch(r, { method: 'POST' })
```

fetch() 会在内部克隆传入的 Request 对象。与克隆 Request 一样，fetch() 也不能拿请求体已经用过的 Request 对象来发送请求：

```js
let r = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
r.text()
fetch(r)
// TypeError: Cannot construct a Request with a Request object that has already been used.
```

通过 fetch 使用 Request 会将请求体标记为已使用。也就是说，有请求体的 Request 只能在一次 fetch 中使用。（不包含请求体的请求不受此限制。）演示如下：

```js
let r = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
fetch(r)
fetch(r)
// TypeError: Cannot construct a Request with a Request object that has already been used.
```

要想基于包含请求体的相同 Request 对象多次调用 fetch()，必须在第一次发送 fetch() 请求前调用 clone()：

```js
let r = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
// 3 个都会成功
fetch(r.clone())
fetch(r.clone())
fetch(r)
```

## 五 Response 对象

### 5.1 Response 对象 基本使用

Response 对象是获取资源响应的接口。这个接口暴露了响应的相关信息。可以通过构造函数初始化 Response 对象且不需要参数。此时响应实例的属性均为默认值，因为它并不代表实际的 HTTP 响应：

```js
let res = new Response()
console.log(res)
```

Response 构造函数接收一个可选的 body 参数。这个 body 可以是 null，等同于 fetch() 参数 init 中的 body。还可以接收一个可选的 init 对象，这个对象可以包含下表所列的键和值：

```txt
headers：必须是 Headers 对象实例或包含字符串键/值对的常规对象实例，默认为没有键/值对的 Headers 对象
status：表示 HTTP 响应状态码的整数，默认为 200
statusText：表示 HTTP 响应状态的字符串，默认为空字符串
```

示例：

```js
let r = new Response('foobar', {
  status: 418,
  statusText: "I'm a teapot",
})
console.log(r)
```

注意：产生 Response 对象的主要方式是调用 fetch()，它返回一个最后会解决为 Response 对象的期约。

Response 类还有两个用于生成 Response 对象的静态方法：Response.redirect() 和 Response.error()。前者接收一个 URL 和一个重定向状态码（301、302、303、307 或 308），返回重定向的 Response 对象：

```js
// 提供的状态码必须对应重定向，否则会抛出错误
console.log(Response.redirect('https://foo.com', 301)) // 200 会报错
```

另一个静态方法 Response.error() 用于产生表示网络错误的 Response 对象（网络错误会导致 fetch() 期约被拒绝）：

```js
console.log(Response.error())
```

### 5.2 读取响应状态信息

Response 对象包含一组只读属性，描述了请求完成后的状态：

```js
fetch('//foo.com/redirect-me').then(console.log)
```

### 5.3 克隆 Response 对象

克隆 Response 对象的主要方式是使用 clone() 方法，这个方法会创建一个一模一样的副本，不会覆盖任何值。这样不会将任何请求的请求体标记为已使用：

```js
let r1 = new Response('foobar')
let r2 = r1.clone()
console.log(r1.bodyUsed) // false
console.log(r2.bodyUsed) // false
```

如果响应对象的 bodyUsed 属性为 true（即响应体已被读取），则不能再创建这个对象的副本。在响应体被读取之后再克隆会导致抛出 TypeError。

```js
let r = new Response('foobar')
r.clone()
// 没有错误
r.text() // 设置 bodyUsed 为 true
r.clone()
// TypeError: Failed to execute 'clone' on 'Response': Response body is already used
```

有响应体的 Response 对象只能读取一次。（不包含响应体的 Response 对象不受此限制。）比如：

```js
let r = new Response('foobar')
r.text().then(console.log) // foobar
r.text().then(console.log)
```

要多次读取包含响应体的同一个 Response 对象，必须在第一次读取前调用 clone()：

```js
let r = new Response('foobar')
r.clone().text().then(console.log) // foobar
r.clone().text().then(console.log) // foobar
r.text().then(console.log) // foobar
```

此外，通过创建带有原始响应体的 Response 实例，可以执行伪克隆操作。关键是这样不会把第一个 Response 实例标记为已读，而是会在两个响应之间共享：

```js
let r1 = new Response('foobar')
let r2 = new Response(r1.body)
console.log(r1.bodyUsed) // false
console.log(r2.bodyUsed) // false
r2.text().then(console.log) // foobar
r1.text().then(console.log)
// TypeError: Failed to execute 'text' on 'Response': body stream is locked
```
