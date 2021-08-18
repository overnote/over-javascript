# 06-Node 异步编程

## 一 回调函数编程难点

### 1.1 回调地狱

异步编程最大的痛点也来自于回调函数，很容易形成回调地狱：

```js
fs.readdir(source, function (err, files) {
  if (err) {
    console.log('Error finding files: ' + err)
  } else {
    files.forEach(function (filename, fileIndex) {
      console.log(filename)
      gm(source + filename).size(function (err, values) {
        if (err) {
          console.log('Error identifying file size: ' + err)
        } else {
          console.log(filename + ' : ' + values)
          aspect = values.width / values.height
          widths.forEach(
            function (width, widthIndex) {
              height = Math.round(width / aspect)
              console.log(
                'resizing ' + filename + 'to ' + height + 'x' + height
              )
              this.resize(width, height).write(
                dest + 'w' + width + '_' + filename,
                function (err) {
                  if (err) console.log('Error writing file: ' + err)
                }
              )
            }.bind(this)
          )
        }
      })
    })
  }
})
```

回调地狱的解决方案见下一节。

### 1.2 错误处理

回调函数在异常处理上也会产生问题：

```js
try {
  // 执行业务
} catch (e) {
  // 捕获异常后处理
}
```

上述代码在异步编程中并不适用，Node 的异步 I/O 分为两个阶段：提交请求和处理结果，两个阶段之间通过事件循环进行调度，彼此互不关联。异步方法通常在第一阶段提交请求后就会立即返回，异常通常不会在该阶段产生，try/catch 则无法捕获异常了，如下所示：

```js
// 定义一个异步函数
function asyncFN(callbck) {
  process.nextTick(callback)
}

// 执行该异步函数
try {
  asyncFN(callback)
} catch (e) {}
```

这里只能捕获到 asyncFN 的异常，却无法捕获 callback 的异常，因为 callback 会被存放起来，直到下一个事件循环到达才会取出来执行。

Node 的解决方案是将异常作为回调函数的第一个参数传回:

```js
asyncFN(function (err, results) {})
```

同时也要注意捕获 asyncFN 本身的异常不能这样处理：

```js
try {
  // 业务处理
  callback()
} catch (e) {
  // 错误处理
  callback(e)
}
```

这时候，如果回调函数和原函数都产生异常，则回调函数会执行 2 次，正确写法如下：

```js
try {
  // 业务处理
  callback()
} catch (e) {
  // 错误处理
  return callback(e)
}
callback()
```

### 1.3 代码阻塞

Node 没有 sleep()线程睡眠函数，也导致了阻塞代码执行变得困难，如果使用下面方式，将会引起灾难：

```js
// 模拟 sleep(1000)
var start = new Date()
while (new Date() - start < 1000) {
  // TODO
}
```

上述代码完全破坏了 Node 的事件循环调度，会持续占用 CPU 进行判断，导致整个应用阻塞，与线程睡眠差距极大。

## 二 回调地狱解决方案

### 2.0 方案汇总

回调地狱可以通过对回调函数命名，进行简单的优化，但这并没有从本质上改变编程体验。能够本质改变异步编程体验的解决方案有：‘

- 利用 `events`模块：这是一种发布订阅方式，让回调函数与调用者解耦
- 使用第三方库：Async
- 利用 ES6 的 Promise
- 利用 ES7 的 async/await 语法糖：该方案目前渐渐成为主流

### 2.1 使用事件模块实现发布订阅

原生的回调函数：

```js
obj.api1(function(data1){
    obj.api2(data1, function(data2){
        obj.api3(data2, function(data3){
            obj.api4(data3, function(data4){
                callback(data4);
            });
        });
    });
}){

}
```

普通解耦：

```js
var fn1 = function (data1) {
  obj.api2(data1, fn2)
}

var fn2 = function (data2) {
  obj.api3(data2, fn3)
}

var fn3 = function (data3) {
  obj.api4(data3, fn4)
}

var fn4 = function (data4) {
  callback(data4)
}

obj.api1(fn1)
```

使用事件解耦：

```js
var emitter = new event.Emitter()

emitter.on('step1', function () {
  obj.api1(function (data1) {
    emitter.emit('step2', data1)
  })
})

emitter.on('step2', function (data1) {
  obj.api2(data1, function (data2) {
    emitter.emit('step3', data2)
  })
})

emitter.on('step3', function (data2) {
  obj.api3(data2, function (data3) {
    emitter.emit('step4', data3)
  })
})

emitter.on('step4', function (data3) {
  obj.api1(data3, function (data4) {
    callback(data4)
  })
})

emitter.emit('step1')
```

从上述看出，使用事件的方式，需要预先设定执行流程，这是由发布订阅模式的机制决定的。

### 2.2 第三方库 Async 库

第三方库 Async 是 ES7 async/await 出现之前（node7.6），最常使用的异步库。

```js
var async = require('async')

async.waterfall(
  [
    function (callback) {
      callback(null, 'one', 'two')
    },
    function (arg1, arg2, callback) {
      // arg1 now equals 'one' and arg2 now equals 'two'
      callback(null, 'three')
    },
    function (arg1, callback) {
      // arg1 now equals 'three'
      callback(null, 'done')
    },
  ],
  function (err, result) {
    // result now equals 'done'
  }
)
```

### 2.3 使用 Promise

由于事件模式必须预先设定执行流程，如下所示：

```js
$.get('/api', {
  sucess: onSuccess,
  error: onError,
  complete: onComplete,
})
```

上面的三个异步调用必须严谨的设置目标，但是在 Promise 方案中，可以先执行异步调用，延迟传递处理，即 Promise/Deferred 模式，jQuery1.5 利用该模式重构了 ajax，如下所示：

```js
$.get('/api')
    .sucess(onSuccess),
    .error(onError),
    .complete(onComplete);
```

即使不调用`success()`，`error()`等方法，ajax 也会执行，这样写起来感觉上更加优雅。该异步模型被 CommonJS 规范接受后，逐渐抽象出了 Promise/A，Promise/B，Promise/D 等异步模型。至于这些模型都是什么概念，请查阅本笔记 ES6 相关章节。

Promise 现在是 ES6 官方认可的社区异步方案，已进入标准化：

```js
new Promise(function (resolve, reject) {
  // 一段耗时的异步操作
  resolve('成功') // 数据处理完成
  // reject('失败') // 数据处理出错
}).then(
  (res) => {
    console.log(res)
  }, // 成功
  (err) => {
    console.log(err)
  } // 失败
)
```

详细使用参见 ES6 章节

### 2.4 Generator

generator 也是 ES6 退出的异步解决方案，但是是过渡性方案，现在已经不再使用，async/await 异步控制方案是当前最主流的异步控制方案

### 2.5 async/await

```js
function fn() {
  return new Promise((resolve, reject) => {
    let sino = parseInt(Math.random() * 6 + 1)
    setTimeout(() => {
      resolve(sino)
    }, 3000)
  })
}
async function test() {
  let n = await fn()
  console.log(n)
}
test()
```

详细使用参见 ES6 章节

## 三 Node 的异步并发按控制

Node 虽然很容易实现并发，但是也必须对并发做出限制：

```js
for (var i = 0; i < 10000; i++>) {
    fs.readFile()
}
```

上述代码瞬间对文件系统发起大量并发调用，操作系统的文件描述符数量会被瞬间用光：

```js
Error: EMFILE, too many open files
```

这是异步 I/O 和同步 I/O 的最大编程体验差距，同步 I/O 中的调用时一个接一个的，不会出现文件描述符耗尽的情况，但是性能低下，而异步 I/O 并发实现简单，但是需要提供一定的过载保护！

一般可以通过队列来控制并发量：

- 如果当前活跃（调用发起但未执行回调）的异步调用量小于限定值，从队列中取出执行
- 如果活跃调用达到限定值，调用暂时存放到队列中
- 每个异步调用结束时，从队列中取出新的异步调用执行

async 库解决方案：

```js
async.parallelLimit(
  [
    function (callback) {
      fs.readFile('file1.txt', 'utf-8', callback)
    },
    function (callback) {
      fs.readFile('file2.txt', 'utf-8', callback)
    },
  ],
  1,
  function (err, results) {
    // TODO
  }
)
```

parallelLimit()方法与 parallel()类似，但多了一个用于限制并发数量的参数，使得任务只能同时并发一定数量，而不是无限制并发。

parallelLimit()方法的却显示是无法动态增加并行任务，async 的 queue()方法可以，比如用来遍历文件目录等操作十分有效：

```js
var q = async.queue(function (file, callback) {
  fs.readFile(file, 'utf-8', callback)
}, 2)

q.drain = function () {
  // 完成了对了队列中的所有任务
}

fs.readdirSync('.').forEach(function (file) {
  q.push(file, function (err, data) {
    // TODO
  })
})
```

queue()的却显示接收参数固定，丢失了 parallelLimit()方法的灵活性。
