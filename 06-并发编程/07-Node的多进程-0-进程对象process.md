# 07-Node 的多进程-0-进程对象 process

## 一 全局对象 process

### 1.1 process 上挂载的属性

process 是 Node 默认提供的一个全局对象，用于保存当前进程相关信息

常见方法有：

```js
process.pid // 获取程序进程id
process.version // 获取node版本号
process.config // 查看node配置
process.title // 获取进程名称
process.argv // 获取当前进程命令行参数数组
process.platform // 获取操作系统信息
process.env // 获取当前shell环境变量参数
```

### 1.2 process 提供的标准流

Node 的 console 其实是通过 process 模块实现的：

标准输出流：

```js
process.stdout.write('hello world\n') // 添加换行符后，其功能与log一致
```

标准错误流：

```js
process.stderr.write('err\n')
```

标准输入流：

```js
process.stdin.setEncoding('utf8') //控制台接受输入
process.stdin.on('readable', function () {
  let chunk = process.stdin.read()
  if (chunk != null) {
    process.stdout.write(chunk)
  }
})

process.stdin.on('end', function () {
  process.stdout.write('end') //控制台结案数输入
})
```

### 1.3 process 操作信号

杀死进程：

```js
process.on('SIGHUP', function () {
  console.log('get SIGHUP')
})
setTimeout(function () {
  process.exit(0) //真正的杀死进程
}, 1000)
process.kill(process.pid, 'SIGHUP') //kill方法只是发送一个sighup信号
```

### 1.4 process 的 nextTick()方法

异步方法：`process.nextTick();` 比 setTimeout 效率高很多：

```js
console.time('timeout---')
setTimeout(function () {
  console.log('test timeout')
}, 0)
console.timeEnd('timeout---')

console.time('timeout---')
process.nextTick(function () {
  console.log('test nextTick')
})
console.timeEnd('timeout---')
```

## 二 process.env 与 环境变量 NODE_ENV

### 2.1 NODE_ENV 概念

`process.env` 是非常常见的一个属性，仅仅表示当前系统的环境变量！

在很多前端项目中都需要配置 Node 的环境变量，通常在 `package.json` 的 `scripts` 命令内容和 webpack 配置文件中可以看到 `NODE_ENV` 这个变量，值一般为 `production` 或者 `product`，也可以简写为 `dev` 或 `prod`。但是 `NODE_ENV` 并不是 process 对象上的，而是开发者自定义的环境变量，`process.env` 中也没有该变量相关信息。

`NODE_ENV` 仅仅用来区分开发与生产环境，用来加载不同的配置，或这执行不同命令。若该值配置过后，就可以在 js 中直接获取：

```js
process.env.NODE_ENV
```

### 2.2 配置 NODE_ENV 环境变量

由于 `NODE_ENV` 是个环境变量，自然可以直接在操作系统中配置，但是笔者推荐在项目的`package.json` 中配置：

```json
"scripts": {
    "start": "export NODE_ENV='development' && node app.js" // 在Mac和Linux上使用export， 在Win上export要换成set
},
```

为了解决上述平台兼容问题，可以安装第三方包 cross-env 来解决：

```json
// 安装第三方包：npm install cross-env -D

// 配置 package.json
"scripts": {
  "start": "cross-env NODE_ENV=development && node app",
  "build": "cross-env NODE_ENV=production && node app"
}
```

webpack 中如果需要对 `NODE_ENV` 做默认值处理，则可以添加如下键值对：

```js
NODE_ENV: process.env.NODE_ENV || 'development',
```

## 三 获取启动参数

项目启动命令中可以输入额外参数，通过 process 可以获取：

```js
// 在 app.js 中输入以下代码
console.log(process.argv.slice(2))
```

此时使用命令 `node app.js a b c` 得到运行结果为：

```txt
[ 'a', 'b', 'c' ]
```

通常命令行参数都使用 `--port 3000` 方式：

```js
let cfg = process.argv.slice(2).reduce((mem, cur, index, arr) => {
  if (cur.startsWith('--')) {
    mem[cur.slice(2)] = arr[index + 1]
  }
  return mem
}, {})

// 启动命令：node app --port 3000 --config webpack.config.js
console.log(cfg) // { port: '3000', config: 'webpac.config.js' }
```

当然实际开发中推荐使用第三方模块：<https://www.npmjs.com/package/commander>
