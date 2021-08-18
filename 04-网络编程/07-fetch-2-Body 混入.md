# 07-fetch-2-Body 混入

## 一 Body 混入概念

Request 和 Response 都使用了 Fetch API 的 Body 混入，以实现两者承担有效载荷的能力。这个混入为两个类型提供了只读的 body 属性（实现为 ReadableStream）、只读的 bodyUsed 布尔值（表示 body 流是否已读）和一组方法，用于从流中读取内容并将结果转换为某种 JavaScript 对象类型。

通常，将 Request 和 Response 主体作为流来使用主要有两个原因。一个原因是有效载荷的大小可能会导致网络延迟，另一个原因是流 API 本身在处理有效载荷方面是有优势的。除此之外，最好是一次性获取资源主体。

Body 混入提供了 5 个方法，用于将 ReadableStream 转存到缓冲区的内存里，将缓冲区转换为某种 JavaScript 对象类型，以及通过期约来产生结果。在解决之前，期约会等待主体流报告完成及缓冲被解析。这意味着客户端必须等待响应的资源完全加载才能访问其内容。

## 二 常用 API

### 2.1 Body.text()

Body.text()方法返回期约，解决为将缓冲区转存得到的 UTF-8 格式字符串。下面的代码展示了在 Response 对象上使用 Body.text()：

```js
fetch('https://foo.com')
  .then((response) => response.text())
  .then(console.log)
// <!doctype html><html lang="en">
// <head>
// <meta charset="utf-8">
// ...
```

以下代码展示了在 Request 对象上使用 Body.text()：

```js
let request = new Request('https://foo.com', {
  method: 'POST',
  body: 'barbazqux',
})
request.text().then(console.log)
// barbazqux
```

### 2.2 Body.json()

Body.json()方法返回期约，解决为将缓冲区转存得到的 JSON。下面的代码展示了在 Response 对象上使用 Body.json()：

```js
fetch('https://foo.com/foo.json')
  .then((response) => response.json())
  .then(console.log)
// {"foo": "bar"}
```

在 Request 对象上使用 Body.json()：

```js
let request = new Request('https://foo.com', {
  method: 'POST',
  body: JSON.stringify({ bar: 'baz' }),
})
request.json().then(console.log)
// {bar: 'baz'}
```

### 2.3 Body.formData()

Body.formData()方法返回期约，解决为将缓冲区转存得到的 FormData 实例。下面的代码展示了在 Response 对象上使用 Body.formData()：

```js
fetch('https://foo.com/form-data')
.then((response) => response.formData())
.then((formData) => console.log(formData.get('foo'));
// bar
```

在 Request 对象上使用 Body.formData()

```js
let myFormData = new FormData();
myFormData.append('foo', 'bar');
let request = new Request('https://foo.com',
{ method:'POST', body: myFormData });
request.formData()
.then((formData) => console.log(formData.get('foo'));
// bar
```

### 2.4 Body.arrayBuffer()

有时候，可能需要以原始二进制格式查看和修改主体。为此，可以使用 Body.arrayBuffer()将主体内容转换为 ArrayBuffer 实例。 Body.arrayBuffer()方法返回期约，解决为将缓冲区转存得到的 ArrayBuffer 实例。下面的代码展示了在 Response 对象上使用 Body.arrayBuffer()：

```js
fetch('https://foo.com')
  .then((response) => response.arrayBuffer())
  .then(console.log)
// ArrayBuffer(...) {}
```

在 Request 对象上使用 Body.arrayBuffer()：

```js
let request = new Request('https://foo.com', {
  method: 'POST',
  body: 'abcdefg',
})
// 以整数形式打印二进制编码的字符串
request.arrayBuffer().then((buf) => console.log(new Int8Array(buf)))
// Int8Array(7) [97, 98, 99, 100, 101, 102, 103]
```

### 2.5 Body.blob()

有时候，可能需要以原始二进制格式使用主体，不用查看和修改。为此，可以使用 Body.blob()将主体内容转换为 Blob 实例。 Body.blob()方法返回期约，解决为将缓冲区转存得到的 Blob 实例。下面的代码展示了在 Response 对象上使用 Body.blob()：

```js
fetch('https://foo.com')
  .then((response) => response.blob())
  .then(console.log)
// Blob(...) {size:..., type: "..."}
```

在 Request 对象上使用 Body.blob()：

```js
let request = new Request('https://foo.com', {
  method: 'POST',
  body: 'abcdefg',
})
request.blob().then(console.log)
// Blob(7) {size: 7, type: "text/plain;charset=utf-8"}
```

### 2.6 一次性流

因为 Body 混入是构建在 ReadableStream 之上的，所以主体流只能使用一次。这意味着所有主体混入方法都只能调用一次，再次调用就会抛出错误。

```js
fetch('https://foo.com').then((response) =>
  response.blob().then(() => response.blob())
)
// TypeError: Failed to execute 'blob' on 'Response': body stream is locked
let request = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
request.blob().then(() => request.blob())
// TypeError: Failed to execute 'blob' on 'Request': body stream is locked
```

即使是在读取流的过程中，所有这些方法也会在它们被调用时给 ReadableStream 加锁，以阻止其他读取器访问：

```js
fetch('https://foo.com').then((response) => {
  response.blob() // 第一次调用给流加锁
  response.blob() // 第二次调用再次加锁会失败
})
// TypeError: Failed to execute 'blob' on 'Response': body stream is locked
let request = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
request.blob() // 第一次调用给流加锁
request.blob() // 第二次调用再次加锁会失败
// TypeError: Failed to execute 'blob' on 'Request': body stream is locked
```

作为 Body 混入的一部分， bodyUsed 布尔值属性表示 ReadableStream 是否已摄受（ disturbed），意思是读取器是否已经在流上加了锁。这不一定表示流已经被完全读取。下面的代码演示了这个属性：

```js
let request = new Request('https://foo.com', { method: 'POST', body: 'foobar' })
let response = new Response('foobar')
console.log(request.bodyUsed) // false
console.log(response.bodyUsed) // false
request.text().then(console.log) // foobar
response.text().then(console.log) // foobar
console.log(request.bodyUsed) // true
console.log(response.bodyUsed) // true
```

### 2.7 使用 ReadableStream 主体

JavaScript 编程逻辑很多时候会将访问网络作为原子操作，比如请求是同时创建和发送的，响应数据也是以统一的格式一次性暴露出来的。这种约定隐藏了底层的混乱，让涉及网络的代码变得很清晰。

从 TCP/IP 角度来看，传输的数据是以分块形式抵达端点的，而且速度受到网速的限制。接收端点会为此分配内存，并将收到的块写入内存。 Fetch API 通过 ReadableStream 支持在这些块到达时就实时读取和操作这些数据。

正如 Stream API 所定义的， ReadableStream 暴露了 getReader()方法，用于产生 ReadableStreamDefaultReader，这个读取器可以用于在数据到达时异步获取数据块。数据流的格式是 Uint8Array。下面的代码调用了读取器的 read()方法，把最早可用的块打印了出来：

```js
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then((body) => {
    let reader = body.getReader()
    console.log(reader) // ReadableStreamDefaultReader {}
    reader.read().then(console.log)
  })
// { value: Uint8Array{}, done: false }
```

在随着数据流的到来取得整个有效载荷，可以像下面这样递归调用 read()方法：

```js
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then((body) => {
    let reader = body.getReader()
    function processNextChunk({ value, done }) {
      if (done) {
        return
      }
      console.log(value)
      return reader.read().then(processNextChunk)
    }
    return reader.read().then(processNextChunk)
  })
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// ...
```

异步函数非常适合这样的 fetch()操作。可以通过使用 async/await 将上面的递归调用打平：

```js
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then(async function (body) {
    let reader = body.getReader()
    while (true) {
      let { value, done } = await reader.read()
      if (done) {
        break
      }
      console.log(value)
    }
  })
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// ...
```

另外， read()方法也可以真接封装到 Iterable 接口中。因此就可以在 for-await-of 循环中方便地实现这种转换：

```js
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then(async function (body) {
    let reader = body.getReader()
    let asyncIterable = {
      [Symbol.asyncIterator]() {
        return {
          next() {
            return reader.read()
          },
        }
      },
    }
    for await (chunk of asyncIterable) {
      console.log(chunk)
    }
  })
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// { value: Uint8Array{}, done: false }
// ...
```

通过将异步逻辑包装到一个生成器函数中，还可以进一步简化代码。而且，这个实现通过支持只读取部分流也变得更稳健。如果流因为耗尽或错误而终止，读取器会释放锁，以允许不同的流读取器继续操作：

```js
async function* streamGenerator(stream) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then(async function (body) {
    for await (chunk of streamGenerator(body)) {
      console.log(chunk)
    }
  })
```

在这些例子中，当读取完 Uint8Array 块之后，浏览器会将其标记为可以被垃圾回收。对于需要在不连续的内存中连续检查大量数据的情况，这样可以节省很多内存空间。

缓冲区的大小，以及浏览器是否等待缓冲区被填充后才将其推到流中，要根据 JavaScript 运行时的实现。浏览器会控制等待分配的缓冲区被填满，同时会尽快将缓冲区数据（有时候可能未填充数据）发送到流。

不同浏览器中分块大小可能不同，这取决于带宽和网络延迟。此外，浏览器如果决定不等待网络，也可以将部分填充的缓冲区发送到流。最终，我们的代码要准备好处理以下情况：

```txt
不同大小的 Uint8Array 块；
部分填充的 Uint8Array 块；
块到达的时间间隔不确定。
```

默认情况下，块是以 Uint8Array 格式抵达的。因为块的分割不会考虑编码，所以会出现某些值作为多字节字符被分散到两个连续块中的情况。手动处理这些情况是很麻烦的，但很多时候可以使用 Encoding API 的可插拔方案。

要将 Uint8Array 转换为可读文本，可以将缓冲区传给 TextDecoder，返回转换后的值。通过设置 stream: true，可以将之前的缓冲区保留在内存，从而让跨越两个块的内容能够被正确解码：

```js
let decoder = new TextDecoder()
async function* streamGenerator(stream) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then(async function (body) {
    for await (chunk of streamGenerator(body)) {
      console.log(decoder.decode(chunk, { stream: true }))
    }
  })
// <!doctype html><html lang="en"> ...
// whether a <a data-link-type="dfn" href="#concept-header" ...
// result to <var>rangeValue</var>. ...
// ...
```

因为可以使用 ReadableStream 创建 Response 对象，所以就可以在读取流之后，将其通过管道导入另一个流。然后在这个新流上再使用 Body 的方法，如 text()。这样就可以随着流的到达实时检查和操作流内容:

```js
fetch('https://fetch.spec.whatwg.org/')
  .then((response) => response.body)
  .then((body) => {
    const reader = body.getReader()
    // 创建第二个流
    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) {
              break
            }
            // 将主体流的块推到第二个流
            controller.enqueue(value)
          }
        } finally {
          controller.close()
          reader.releaseLock()
        }
      },
    })
  })
  .then((secondaryStream) => new Response(secondaryStream))
  .then((response) => response.text())
  .then(console.log)
// <!doctype html><html lang="en"><head><meta charset="utf-8"> ...
```
