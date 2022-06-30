# 04-新增对象 -2-Stream

## 一 Stream 流

### 1.1 Stream 流简介

假设我们要读取一个大文件发送给服务端，如果直接使用 readFile() 方法是极其浪费资源的，因为只有读取完毕后才能利用网络进行发送，这样磁盘、网络都没有得到有效的利用。如果能够读取一点，就发送一点，那么就能让磁盘、网络获得最大限度的利用，这便是流。

Node 提供了多种流（Stream）对象，如 `process.stdout`，这些对象都继承自 `EventEmitter`。

在 Node 有四种基础的 Stream 类型：

```txt
Readable    可读流，如：fs.createWriteStream()
Writeable   可写流，如：fs.createReadStream()
Duplex      读写流，也称为双工流，如：net.Socket
Transform   转换流，在读写时，可以修改或者转换数据的 Duplex 流，如 zlib 流、crypto 流
```

### 1.2 Stream 流的使用

示例：

```js
const fs = require('fs')

let rs = fs.createReadStream('./demo-read.txt', 'utf-8')

rs.on('data', (data) => {
  console.log(data) // 输出第一次读取到的数据
})

rs.on('error', (error) => {
  console.log('error:', error) // 如果有错误，输出错误
})

rs.on('end', () => {
  console.log('end')
})

rs.on('close', () => {
  console.log('close') // 读取完毕后输出 close
})

// 将读取到的数据填入可写流
let ws = fs.createWriteStream('./demo-write.txt') // 创建可写流
rs.pipe(ws) // 将数据以流形式写入
```

上述案例将会依次输出：文件内的数据、end、close。同理，在服务端，如果要返回大文件给前端，则：

```js
const http = require('http')
const fs = require('fs')

http
  .createServer((req, res) => {
    let rs = fs.createReadStream('./1.jpg')
    rs.pipe(res) // 将流写入返回结果 res
  })
  .listen(8000)
```

注意：只有流才有 on 监听事件，所以 req、res 也是流，而且流是有方向的！

### 1.3 对象模式

Node 中的流都运作在字符串、Buffer、Unit8Array 上。但是流可以用其他的 JavaScript 数据类型来创建（null 除外），这些流将会以对象形式进行操作。

在创建流时使用 objectMode 选项将流实例转换为对象模式。

```js
const { Transform } = require('stream')

const commaSplitter = new Transform({
  readableObjectMode: true,
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().trim().split(','))
    callback()
  },
})

const arrayToObject = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    const obj = {}
    for (let i = 0; i < chunk.length; i += 2) {
      obj[chunk[i]] = chunk[i + 1]
    }
    this.push(obj)
    callback()
  },
})

const objectToString = new Transform({
  writableObjectMode: true,
  transform(chunk, encoding, callback) {
    this.push(JSON.stringify(chunk) + '\n')
    callback()
  },
})

process.stdin
  .pipe(commaSplitter)
  .pipe(arrayToObject)
  .pipe(objectToString)
  .pipe(process.stdout)
```

注意：将已经存在的流切换到对象模式是不安全的。

### 1.4 流的缓冲区

可写流与可读流都会在内部的缓冲区中存储数据，可缓冲的数据大小取决于构造实例时可选项 highWaterMark 大小，该选项用来指定字节的总数或者对象的总数。

当调用 `stream.push(chunk)` 时，数据会被缓冲到可读流中，如果流的消费者没有调用 `stream.read()` 则数据会保留在内部队列中直到被消费。缓存中的数据通过 `writable.writableBuffer`、`readable.readableBuffer` 获取。

当内部的可读缓冲的总大小达到 highWaterMark 时，流会暂时停止从底层资源读取数据，直到当前缓冲的数据被消费。使用 `writeable.write(chunk)` 用于写入数据到流中，其返回值为 true，则证明可写缓冲大小小于 highWaterMark，反之亦然。

注意：为了避免读写速度不一致，一些 Stream API，如 `stream.pipe()` 会限制缓冲区。

双工流与转换流内部各自维护了两个相对独立的内部缓冲区用于读取与写入，如 `net.Socket` 的可读端可以消费从 socket 接收打数据，可写端则可以将数据写入到 socket。

## 三 自定义 Stream

### 3.1 自定义一个 Stream

当原生的 stream 无法满足要求时，可以自定义 stream：

```js
const { Readable } = require('stream')

//这里我们自定义了一个用来读取数组的流
class ArrRead extends Readable {
  constructor(arr, opt) {
    //注意这里，需调用父类的构造函数
    super(opt)
    this.arr = arr
    this.index = 0
  }

  //实现 _read() 方法
  _read(size) {
    //如果当前下标等于数组长度，说明数据已经读完
    if (this.index == this.arr.length) {
      this.push(null)
    } else {
      this.arr.slice(this.index, this.index + size).forEach((value) => {
        this.push(value.toString())
      })
      this.index += size
    }
  }
}

let arr = new ArrRead([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], {
  highWaterMark: 2,
})

//这样当我们监听 'data' 事件时，流会调用我们实现的 _read() 方法往缓冲区中读取数据
//然后提供给消费者
arr.on('data', function (data) {
  console.log(data.toString())
})
```

### 3.2 自定义双工流

```js
const { Duplex } = require('stream')

const kSource = Symbol('source')

class MyDuplex extends Duplex {
  constructor(source, options) {
    supre(options)
    this[kSource] = source
  }

  _write(chunk, endcoding, callback) {
    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString()
    }
    this[kSource].writeSomeData(chunk)
    callback()
  }

  _read(size) {
    this[kSource].fetchSomeData(size, (data, encoding) => {
      this.push(Buffer.from(data, encoding))
    })
  }
}
```
