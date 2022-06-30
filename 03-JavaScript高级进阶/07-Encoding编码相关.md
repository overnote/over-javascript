# 07-Encoding 编码相关

## 一 Encoding API

字符串与定型数组（二进制）之间的转换依赖于 EncodingAPI，如：TextEncoder、TextEncoderStream、TextDecoder 和 TextDecoderStream。

## 二 编码 - 字符串转换为定型数组

### 2.0 转换方式归纳

Encoding API 提供了两种将字符串转换为定型数组二进制格式的方法：批量编码和流编码。把字符串转换为定型数组时，编码器始终使用 UTF-8。

### 2.1 批量编码

TextEncoder 对象使用示例：

```js
const encoder = new TextEncoder()

const encoderText = encoder.encode('foo')
// f 的 UTF-8 编码是 0x66（102），o 的 UTF-8 编码是 0x6F(111)
console.log(encoderText) // Uint8Array(3) [102, 111, 111]
```

TextEncoder 的实例方法 encodeInto() 接收一个字符串和目标 Unit8Array，返回一个字典，该字典包含 read 和 written 属性，分别表示成功从源字符串读取了多少字符和向目标数组写入了多少字符。如果定型数组的空间不够，编码就会提前终止：

```js
const encoder = new TextEncoder()

const fooArr = new Uint8Array(3)
const fooRes = encoder.encodeInto('foo', fooArr)
console.log(fooRes) // { read: 3, written: 3 }

const barArr = new Uint8Array(2)
const barRes = encoder.encodeInto('bar', barArr)
console.log(barRes) // { read: 2, written: 2 }
```

注意：由于 encodeInto() 不需要像 encode() 那样需要分配一个新的 Unit8Array，会有性能上的提升。

### 2.2 流编码

TextEncoderStream 其实就是 TransformStream 形式的 TextEncoder。将解码后的文本流通过管道输入流编码器会得到编码后文本块的流：

```js
async function* chars() {
  const decodedText = 'foo'
  for (let char of decodedText) {
    yield await new Promise((resolve) => setTimeout(resolve, 1000, char))
  }
}

const decodedTextStream = new ReadableStream({
  async start(controller) {
    for await (let chunk of chars()) {
      controller.enqueue(chunk)
    }
    controller.close()
  },
})

const encodedTextStream = decodedTextStream.pipeThrough(new TextEncoderStream())
const readableStreamDefaultReader = encodedTextStream.getReader()

;(async function () {
  while (true) {
    const { done, value } = await readableStreamDefaultReader.read()
    if (done) {
      break
    } else {
      console.log(value)
    }
  }
})()
// Uint8Array[102]
// Uint8Array[111]
// Uint8Array[111]
```

## 三 解码 - 定型数组转换为字符串

### 3.0 转换方式归纳

Encoding API 提供了两种将定型数组转换为字符串的方式：批量解码和流解码。解码器默认字符编码格式是 UTF-8，但是也支持其他字符串编码。

### 3.1 批量解码

```js
const decoder = new TextDecoder() // 可传入参数 'utf-16' 改变默认编码

const source = Uint32Array.of(102, 111, 111)
const decodeText = decoder.decode(source)
console.log(decodeText) // foo
```

### 3.2 流解码

TextDecoderStream 其实就是 TransformStream 形式的 TextDecoder。将编码后的文本流通过管道输入流解码器会得到解码后文本块的流：

```js
async function* chars() {
  // 每个块必须是一个定型数组
  const encodedText = [102, 111, 111].map((x) => Uint8Array.of(x))
  for (let char of encodedText) {
    yield await new Promise((resolve) => setTimeout(resolve, 1000, char))
  }
}

const encodedTextStream = new ReadableStream({
  async start(controller) {
    for await (let chunk of chars()) {
      controller.enqueue(chunk)
    }
    controller.close()
  },
})

const decodedTextStream = encodedTextStream.pipeThrough(new TextDecoderStream())
const readableStreamDefaultReader = decodedTextStream.getReader()

;(async function () {
  while (true) {
    const { done, value } = await readableStreamDefaultReader.read()
    if (done) {
      break
    } else {
      console.log(value)
    }
  }
})()
// f
// o
// o
```

文本解码器流能够识别可能分散在不同块上的代理对。解码器流会保持块片段直到取得完整的字符。比如在下面的例子中，流解码器在解码流并输出字符之前会等待传入 4 个块：

```js
async function* chars() {
  // ☺的 UTF-8 编码是 0xF0 0x9F 0x98 0x8A（即十进制 240、159、152、138）
  const encodedText = [240, 159, 152, 138].map((x) => Uint8Array.of(x))
  for (let char of encodedText) {
    yield await new Promise((resolve) => setTimeout(resolve, 1000, char))
  }
}

const encodedTextStream = new ReadableStream({
  async start(controller) {
    for await (let chunk of chars()) {
      controller.enqueue(chunk)
    }
    controller.close()
  },
})

const decodedTextStream = encodedTextStream.pipeThrough(new TextDecoderStream())
const readableStreamDefaultReader = decodedTextStream.getReader()

;(async function () {
  while (true) {
    const { done, value } = await readableStreamDefaultReader.read()
    if (done) {
      break
    } else {
      console.log(value)
    }
  }
})()
// ☺
```

文本解码器流经常与 fetch() 一起使用，因为响应体可以作为 ReadableStream 来处理：

```js
const response = await fetch(url)
const stream = response.body.pipeThrough(new TextDecoderStream())
const decodedStream = stream.getReader()
for await (let decodedChunk of decodedStream) {
  console.log(decodedChunk)
}
```
