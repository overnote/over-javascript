# 08-File 与 Blob 文件对象

## 一 File 类型

### 1.1 files 集合

Web 应用在早期只能通过`<input type="file">`获取文件，现在的 File API 与 Blob API 是为了让 Web 开发者能以安全的方式访问客户端机器上的文件。

DOM 上的文件输入元素现在拥有 files 集合，可以直接访问文件信息：

```js
let filesList = document.getElementById('files-list')

filesList.addEventListener('change', (event) => {
  let files = event.target.files,
    i = 0,
    len = files.length
  while (i < len) {
    const f = files[i]
    console.log(`${f.name} (${f.type}, ${f.size} bytes)`)
    i++
  }
})
```

### 1.2 FileReader 类型

FileReader 类型表示一种异步文件读取机制。可以把 FileReader 想象成类似于 XMLHttpRequest，只不过是用于从文件系统读取文件，而不是从服务器读取数据，常见方法有：

```txt
readAsText(file, encoding)：从文件中读取纯文本内容并保存在 result 属性中。第二个参数表示编码，是可选的。
readAsDataURL(file)：读取文件并将内容的数据 URI 保存在 result 属性中。
readAsBinaryString(file)：读取文件并将每个字符的二进制数据保存在 result 属性中。
readAsArrayBuffer(file)： 读取文件并将文件内容以 ArrayBuffer 形式保存在 result 属性。
```

常用对应事件有：

```txt
rogress 事件：每 50 毫秒就会触发一次，其与 XHR 的 progress 事件具有相同的信息：lengthComputable、 loaded 和 total。此外，在 progress 事件中可以读取 FileReader 的 result属性，即使其中尚未包含全部数据。

error 事件：会在由于某种原因无法读取文件时触发。触发 error 事件时， FileReader 的 error属性会包含错误信息。这个属性是一个对象，只包含一个属性： code。这个错误码的值可能是 1（未找到文件）、 2（安全错误）、 3（读取被中断）、 4（文件不可读）或 5（编码错误）。

load 事件：会在文件成功加载后触发。如果 error 事件被触发，则不会再触发 load 事件。
```

示例：

```js
let filesList = document.getElementById('files-list')

filesList.addEventListener('change', (event) => {
  let info = '',
    output = document.getElementById('output'),
    progress = document.getElementById('progress'),
    files = event.target.files,
    type = 'default',
    reader = new FileReader()
  if (/image/.test(files[0].type)) {
    reader.readAsDataURL(files[0])
    type = 'image'
  } else {
    reader.readAsText(files[0])
    type = 'text'
  }
  reader.onerror = function () {
    output.innerHTML = 'Could not read file, error code is ' + reader.error.code
  }
  reader.onprogress = function (event) {
    if (event.lengthComputable) {
      progress.innerHTML = `${event.loaded}/${event.total}`
    }
  }
  reader.onload = function () {
    let html = ''
    switch (type) {
      case 'image':
        html = `<img src="${reader.result}">`
        break
      case 'text':
        html = reader.result
        break
    }
    output.innerHTML = html
  }
})
```

如果想提前结束文件读取，则可以在过程中调用 abort()方法，从而触发 abort 事件。在 load、error 和 abort 事件触发后，还会触发 loadend 事件。 loadend 事件表示在上述 3 种情况下，所有读取操作都已经结束。

### 1.3 FileReaderSync 类型

FileReaderSync 类型就是 FileReader 的同步版本。这个类型拥有与 FileReader 相同的方法，只有在整个文件都加载到内存之后才会继续执行。FileReaderSync 只在工作线程中可用，因为如果读取整个文件耗时太长则会影响全局。

## 二 Blob

### 2.1 二进制对象 Blob

某些情况下，可能需要读取部分文件而不是整个文件。为此， File 对象提供了一个名为 slice()的方法。 slice()方法接收两个参数：起始字节和要读取的字节数。这个方法返回一个 Blob 的实例，而 Blob 实际上是 File 的超类。

blob 表示二进制大对象（ binary larget object），是 JavaScript 对不可修改二进制数据的封装类型。包含字符串的数组、 ArrayBuffers、 ArrayBufferViews，甚至其他 Blob 都可以用来创建 blob。 Blob 构造函数可以接收一个 options 参数，并在其中指定 MIME 类型：

```js
console.log(new Blob(['foo']))
// Blob {size: 3, type: ""}
console.log(new Blob(['{"a": "b"}'], { type: 'application/json' }))
// {size: 10, type: "application/json"}
console.log(new Blob(['<p>Foo</p>', '<p>Bar</p>'], { type: 'text/html' }))
// {size: 20, type: "text/html"}
```

Blob 对象有一个 size 属性和一个 type 属性，还有一个 slice()方法用于进一步切分数据。另外也可以使用 FileReader 从 Blob 中读取数据。下面的例子只会读取文件的前 32 字节：

```js
let filesList = document.getElementById('files-list')
filesList.addEventListener('change', (event) => {
  let info = '',
    output = document.getElementById('output'),
    progress = document.getElementById('progress'),
    files = event.target.files,
    reader = new FileReader(),
    blob = blobSlice(files[0], 0, 32)
  if (blob) {
    reader.readAsText(blob)
    reader.onerror = function () {
      output.innerHTML =
        'Could not read file, error code is ' + reader.error.code
    }
    reader.onload = function () {
      output.innerHTML = reader.result
    }
  } else {
    console.log("Your browser doesn't support slice().")
  }
})
```

只读取部分文件可以节省时间，特别是在只需要数据特定部分比如文件头的时候。

### 2.2 对象 URL 与 Blob

对象 URL 有时候也称作 Blob URL，是指引用存储在 File 或 Blob 中数据的 URL。对象 URL 的优点是不用把文件内容读取到 JavaScript 也可以使用文件。只要在适当位置提供对象 URL 即可。要创建对象 URL，可以使用 window.URL.createObjectURL()方法并传入 File 或 Blob 对象。这个函数返回的值是一个指向内存中地址的字符串。因为这个字符串是 URL，所以可以在 DOM 中直接使用。例如，以下代码使用对象 URL 在页面中显示了一张图片：

```js
let filesList = document.getElementById('files-list')
filesList.addEventListener('change', (event) => {
  let info = '',
    output = document.getElementById('output'),
    progress = document.getElementById('progress'),
    files = event.target.files,
    reader = new FileReader(),
    url = window.URL.createObjectURL(files[0])
  if (url) {
    if (/image/.test(files[0].type)) {
      output.innerHTML = `<img src="${url}">`
    } else {
      output.innerHTML = 'Not an image.'
    }
  } else {
    output.innerHTML = "Your browser doesn't support object URLs."
  }
})
```

如果把对象 URL 直接放到`<img>`标签，就不需要把数据先读到 JavaScript 中了。 `<img>`标签可以直接从相应的内存位置把数据读取到页面上。

使用完数据之后，最好能释放与之关联的内存。只要对象 URL 在使用中，就不能释放内存。如果想表明不再使用某个对象 URL，则可以把它传给 window.URL.revokeObjectURL()。页面卸载时，所有对象 URL 占用的内存都会被释放。不过，最好在不使用时就立即释放内存，以便尽可能保持页面占用最少资源。

## 三 读取拖放文件

组合使用 HTML5 拖放 API 与 File API 可以创建读取文件信息的有趣功能。在页面上创建放置目标后，可以从桌面上把文件拖动并放到放置目标。这样会像拖放图片或链接一样触发 drop 事件。被放置的文件可以通过事件的 event.dataTransfer.files 属性读到，这个属性保存着一组 File 对象，就像文本输入字段一样。

下面的例子会把拖放到页面放置目标上的文件信息打印出来：

```js
let droptarget = document.getElementById('droptarget')
function handleEvent(event) {
  let info = '',
    output = document.getElementById('output'),
    files,
    i,
    len
  event.preventDefault()
  if (event.type == 'drop') {
    files = event.dataTransfer.files
    i = 0
    len = files.length
    while (i < len) {
      info += `${files[i].name} (${files[i].type}, ${files[i].size} bytes)<br>`
      i++
    }
    output.innerHTML = info
  }
}
droptarget.addEventListener('dragenter', handleEvent)
droptarget.addEventListener('dragover', handleEvent)
droptarget.addEventListener('drop', handleEvent)
```

贴士：必须取消 dragenter、 dragover 和 drop 的默认行为。在 drop 事件处理程序中，可以通过 event.dataTransfer.files 读到文件，此时可以获取文件的相关信息。
