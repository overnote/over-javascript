# 04-新增对象-1-Buffer

## 一 二进制文件操作

### 1.1 前端操作二进制文件

前端的二进制对象 Blob 使用示例，演示数据与二进制的抓换：

```html
<a href="" id="down">下载</a>
<script>
    let str = `<div>hello world!</div>`
    const b = new Blob([str], { type: 'text/html' }) // 将字符串转换为二进制
    // 点击网页中的a链接实现下载这个二进制文件
    let down = document.querySelector('#down')
    down.setAttribute('download', 'index.html') // 设置下载文件名
    down.href = URL.createObjectURL(b)
</script>
```

同样前端如果要读取二进制文件，可以使用 Blob 的子类 File 类：

```html
<input type="file" id="fileList" />
<script>
    let fileList = document.querySelector('#fileList')
    fileList.addEventListener('change', e => {
        let file = e.target.files[0]
        console.log(file) // 会打印该文件对象的基本信息

        let reader = new FileReader()
        reader.onload = function () {
            let img = document.createElement('img') // 假定操作的是一个图片
            img.src = reader.result
            document.body.appendChild(img)
        }
        reader.readAsDataURL(file) // 这里不推荐该做法，只是演示，推荐的做法是仍然使用 URL.createObjectURL(b)
    })
</script>
```

### 1.2 ArrayBuffer 缓冲区

ArrayBuffer 对象是 ECMAScript 提供的表示固定长度的原始二进制数据缓冲区，其本质是一个字节数组，通常在其他语言中称为“byte array”。

```js
// 申请4个字节的缓冲区（一个字节由八位组成，最大能转换成十进制的255）
const buf = new ArrayBuffer(4)
console.log(buf)

// 实际读取操作数据需要使用其子类
let x = new Uint8Array(buf)
console.log(x) // Uint8Array(4) [0, 0, 0, 0]
x[0] = 1
x[1] = 255
console.log(x) // Uint8Array(4) [1, 255, 0, 0]
```

### 1.3 Node 中的 Buffer 概念

在 H5 之前，JavaScript 不具备文件的能力，所以其语言本身在以前也没有提供操作二进制数据的 API，但是这是后端开发的核心功能之一。Node 为了弥补这个不足，基于 C++ 模块提供了全新的对象 Buffer，用来操作字节。现在在 ES6 中，JavaScript 原生提供了 ArrayBuffer 类型，可以直接操作二进制数据，Node 也将自己的 Buffer 实现转换为了该类的子类：`Uint8Array`（8 表示 8 个位）。

可以将 Buffer 理解为 Node 扩充的数据类型，其作用类似 Array，用于操作二进制数据。

由于 Buffer 对象在 Node 中非常常用，所以在 Node 进程启动时就会被加载进内容，位于全局对象 global 中，可以直接使用。

Buffer 在文件 I/O，网络 I/O 中占据很大使用场合，网络传输中的字符串一般都会转换为 Buffer，以二进制方式进行传输，这样可以有效减轻服务端资源浪费。比如静态内容往往会先转换为 Buffer 格式，这样浏览器在访问网页内容时，服务器就无需转换再传输了！Node 在文件、网络操作中，如果没有显示声明编码格式，默认返回的数据类型都是 Buffer，比如 readFile 回调中的 data。

### 1.4 Buffer 的应用

```js
const fs = require('fs')

fs.readFile('./demo.html', (err, data) => {
    console.log(data) // 二进制Buffer类型数据
    console.log(data.toString()) // html文档转换为了字符串
})
```

## 二 Buffer 的基本使用

### 2.1 Buffer 的创建

```js
// new Buffer() 方式创建由于安全问题已被废弃

// 创建一个长度为 10 的 Buffer，填充了全部值为 `0` 的字节
const buf1 = Buffer.alloc(10)

// 创建一个长度为 10、且用 01 填充的 Buffer。
const buf2 = Buffer.alloc(10, 1)

// 创建一个长度为 10、且未初始化的 Buffer
// 这个方法比调用 Buffer.alloc() 更快，但返回的 Buffer 实例可能包含旧数据。可以理解为 这段字节内存被直接使用了，原来的数据还保留着
// 解决办法：使用 fill()、write() 或其他能填充 Buffer 的内容的函数进行重写。
const buf3 = Buffer.allocUnsafe(10)

// 创建一个包含字节 [1, 2, 3] 的 Buffer。
const buf4 = Buffer.from([1, 2, 3])

// 创建一个包含字节 [1, 1, 1, 1] 的 Buffer，其中所有条目均使用 `(value & 255)` 进行截断以符合 0-255 的范围。
const buf5 = Buffer.from([257, 257.5, -255, '1'])

// 创建一个 Buffer，其中包含字符串 'tést' 的 UTF-8 编码字节：
// [0x74, 0xc3, 0xa9, 0x73, 0x74]（以十六进制表示）
// [116, 195, 169, 115, 116]（以十进制表示）
const buf6 = Buffer.from('test', 'utf-8')

for (let i = 0; i < buf6.length; i++) {
    // 此 length 长度和字符串的长度有区别，指 buffer 的 bytes 大小
    console.log(buf6[i].toString(16)) // buffer[index]: 获取或设置在指定 index 索引未知的 8 位字节内容
    console.log(String.fromCharCode(bf[i])) // 依次输出 t e s t
}
```

### 2.2 Buffer 的实例方法

```js
// 根据参数 offset，将参数 string 数据写入 buffer
buf.write(string, [offset], [length], [encoding])

// 返回一个解码的 string 类型
buf.toString([encoding], [length])

// 返回一个 JSON 表示的 Buffer 实例，JSON.stringify 将会默认调用来字符串序列化这个 Buffer 实例
buf.toJSON()

// 返回一个新的 buffer，这个 buffer 和老的 buffer 引用相同的内存地址
buf.slice([start], [end])

// 进行 buffer 的拷贝，拷贝不会影响老的 buffer
buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])
```

### 2.3 Buffer 的静态方法

```js
Buffer.isBuffer(buf);              // 判断是不是 Buffer
Buffer.byteLength(str);                 // 获取字节长度，第二个参数为字符集，默认 utf8
Buffer.concat(list[, totalLength])     // Buffer 的拼接
```

### 2.4 Buffer 的转换

Buffer 与 字符串之间的转换：

```js
// 字符串转 Buffer
let buf = Buffer.from('test', 'utf-8')

// Buffer 转换为字符串
buf.toString([encoding], [start], [end])
```

Buffer 对象转换为 Buffer，一个 Buffer 对象可以存储不同编码类型的字符串转码的值，调用 write() 方法可以实现该目标：

```js
buf.write(string, [offset], [length], [encoding])
```

由于可以不断写入内容到 Buffer 对象中，并且每次写入可以指定编码，所以 Buffer 对象中可以存在多种编码转换后的内容，需要小心的是，每种编码所用的字节长度不同，将 buffer 反转回字符串时需要谨慎处理。

### 2.5 Buffer 不支持的编码类型

Node 的 Buffer 不支持中国的 GBK，GB2312，BUG-5 等编码格式。判断 Buffer 是否支持该编码格式：

```js
Buffer.isEncoding(encodibg) // 返回 true、false
```

对于不支持的编码格式，Node 有第三方模块如 iconv 和 iconv-liten。

## 三 Buffer 乱码

### 3.1 乱码的产生

在 Buffer 使用场景中，通常是以一段一段的方式传输，常见从输入流中读取内容的示例如下：

```js
let fs = require('fs')

let rs = fs.createReadStream('./demo.md')
let data = ''

rs.on('data', function (chunk) {
    data += chunk
})

rs.end('end', function () {
    console.log(data)
})
```

上述代码在读取全英文格式内容时，不会有任何问题，但是一旦输入流中存在宽字节编码，就会产生乱码问题。问题来自于 `data += chunk`，该句隐藏了 `toString()` 操作，其内部等价于：

```js
data = data.toString() + chunk.toString()
```

下面模拟宽字节文字读取场景：

```js
let fs = require('fs')

let buf = Buffer.from('白银之手骑士团')

// <Buffer e7 99 bd e9 93 b6 e4 b9 8b e6 89 8b e9 aa 91 e5 a3 ab e5 9b a2 ef bc 81>
console.log('buf:', buf)
console.log('buf.length:', buf.length) // 21
console.log('start:', buf.toString('UTF-8', 0, 3)) // 白  e7 99 bd
console.log('start:', buf.toString('UTF-8', 3, 6)) // 银  e9 93 b6
console.log('start:', buf.toString('UTF-8', 6, 9)) // 之  e4 b9 8b，e6 89 8b，e9 aa 91，e5 a3 ab，e5 9b a2，ef bc 81

let data = ''
let rs = fs.createReadStream('./demo.txt', { highWaterMark: 4 })
rs.on('data', function (chunk) {
    data += chunk
})
rs.on('end', function () {
    console.log('流式读取：', data) // 白�����手骑�����
})
```

在上述案例中，每 3 个长度能够读取到一个汉字，但是在使用流式读取时，每 4 个长度读取一次，在第一读取时，就会读取到多余的数据了，也即输出了 `白�`，在第 4 次读取时，正好又读取了原始数据的存储要求，输出了 `�手`，依次类推。

### 3.2 乱码解决

流式读取可以设置编码：

```js
let rs = fs.createReadStream('./demo.txt', { highWaterMark: 4 })
rs.setEncoding('utf8')
```

此时程序就能正常输出数据！但是这并不是直接说明了输出没有收到 Buffer 大小的影响。在实际运行过程中，无论如何设置编码，触发的 data 事件次数都仍然是相同的。但是在每次 data 事件都会额外通过一个 decoder 对象对 Buffer 进行转换到字符串的解码，然后传递给调用者。而这个 decoder 对象正是 `setEncoding()` 方法时在可读流对象内部设置的。此时 data 收到的不再是原始的 Buffer 对象。decoder 对象会被未转码的部分保留在 StringDecode 实例内部，再下一次 write 的时候，会将上次的剩余字节和后续的新读入的字节进行组合！

setEncding 只能解决 UTF-8，Base64 等带来的编码问题，没有从根本上解决问题。正确的 Buffer 拼接方式应该是用一个数组来存储接收到的所有 Buffer 片段并记录下所有的片段总长度，然后调用 Buffer.concat() 方法生成一个合并的 Buffer 对象。

```js
fs.createReadStream('./test.txt', { highWaterMark: 10 })

let dataArr = []

rs.on('data', function (chunk) {
    dataArr.push(chunk)
})

rs.on('end', function () {
    let buf = Buffer.concat(dataArr)
    console.log(buf.toString())
})
```

Buffer.concat() 方法封装了从小 Buffer 对象向大 Buffer 对象复制过程：

```js
Buffer.concat = function (list, length) {
    if (!Array.isArray(list)) {
        throw new Error('Usage: Buffer.concat(list, [length])')
    }
    if (list.length === 0) {
        return new Buffer(0)
    } else if (list.length === 1) {
        return list[0]
    }

    if (typeof length !== 'number') {
        length = 0
        for (let i = 0; i < list.length; i++) {
            let buf = list[i]
            length += buf.length
        }
    }

    let buffer = new Buffer(length)
    let pos = 0
    for (let i = 0; i < list.length; i++) {
        let buf = list[i]
        buf.copy(buffer, pos)
        pos += buf.length
    }
    return buffer
}
```
