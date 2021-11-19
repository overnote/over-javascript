# 04-webpack 与 babel

## 一 babel 基本使用

ES6 React 等写法在浏览器中并未得到完全的支持，利用 Babel 工具可以将 ES6、React 等语法编译为浏览器识别的 ES5。

使用步骤：

```txt
1 项目根目录安装：
    旧版：npm i -D babel-cli babel-core babel-preset-env
    新版：npm i -D @babel/cli @babel/core @babel/preset-env

2 项目根目录创建 .babelrc ,内容如下:
    旧版：{"presets":["env"]}
    新版：{"presets":["@babel/env"]}

3 编译src目录下所有文件到dist目录下
    npx babel src -d dist                           // 若npm<5.2，则可以使用 ./node_modules/.bin/babel
```

babel-cli 只是一个执行 babel 命令行工具，本身不具备编译功能，编译功能是由插件 babel-preset-env 提供的。

带 env 是指最新的 babel 编译工具，包含了所有的 ES\*功能，如果我们不需要这么多的新特性，可以有选择的安装编译插件：

```txt
# ES2015转码规则
$ npm install --save-dev babel-preset-es2015
# react转码规则
$ npm install --save-dev babel-preset-react
# ES7不同阶段语法提案的转码规则（共有4个阶段），选装一个
$ npm install --save-dev babel-preset-stage-0
$ npm install --save-dev babel-preset-stage-1
$ npm install --save-dev babel-preset-stage-2
$ npm install --save-dev babel-preset-stage-3
```

在命令行中敲击大量命令显然不是高效的，可以直接通过配置文件配置 babel，新建文件 `.babelrc`即可：

```js
  {
    "presets": [
      "es2015",
      "react",
      "stage-2"
    ],
    "plugins": []
  }
```

## 二 webpack 配置 babel

转译 ES6，ES7 需要 babel-loader 加载器。

安装 babel-loader：

```txt
npm i -D babel-loader @babel/core @babel/preset-env
```

添加 babel-loader 加载器：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
}
```

此时 babel-loader 不知道用哪种 babel 格式转译，配置 .babelrc

```js
{
 "presets": ["@babel/preset-env"]   // 如果是 babel6，此处配置为：["babe-preset-env"]，安装的npm包名也如此
}
```

贴士：也可以不添加.babelrc 文件，在 babel-loader 插件内直接配置：

```js
 use: {
  loader: "babel-loader",
  options: {
   presets: ["@babel/preset-env"]
  }
 },
```

## 三 babel 转换函数

### 3.1 poyfill

虽然 babel 把 ES6 解析为了 ES5，但是仍然有许多变量在低版本不支持，比如：Promise,Set,Symbol,Array.from,async 等。

此时需要 poyfill，该模块的作用是当代码中用到了某个浏览器不支持的 ES6 变量，如 Map，则加载一个 Map 的实现类。

```js
// npm install -S @babel/polyfill

// .babelrc 中配置
presets: [
  ["@babel/preset-env", {useBuiltIns: "usage}]
]

// 在业务源码的顶部引入 pollyfill，如果配置了useBuiltIns，则无需引入，会自动引入
import "@babel/pollyfill"
```

### 3.2 transform-runtime

如果当前书写的不是业务代码，而是一些插件、框架，那么 pollyfill 的方式不推荐。因为 pollyfill 生成的 map、promise 都是以全局变量的形式存在，会污染框架的环境。

此时推荐使用 transform-runtime：

```js
// 安装
// npm i -D @babel/plugin-transform-runtime
// npm i -S @babel/runtime
// npm i -S @babel/runtime-corejs2

// 删除presets配置，添加plugins
options: {
  "plugins":[
    ["@babel/plugin-transform-runtime",{
      "corejs": 2,
      "helpers": true,
      "regenerator": true,
      "useESModules": false
    }]
  ]
}
```

### 3.3 原理解读

```js
// 原生代码如下：
const foo = (a, b) => {
  return Object.assign(a, b)
}

//经过babel编译后为：
;('use strict')
var foo = function foo(a, b) {
  return Object.assign(a, b)
}
```

Object.assign 作为 ES6 语法被编译成了普通函数，而不是我们理想的结果：

```js
Object.assign ||
  function () {
    /*...*/
  }
```

这样编译为了保证正确的语义，只能转换语法而不是去增加或修改原有的属性和方法。所以 babel 不处理 Object.assign 反倒是最正确的做法。而处理这些方法的方案则被称为 polyfill。

babel 针对每个 API 都提供了对应的转换插件，如上述案例需要安装的插件是：

```txt
# 安装
npm i - S @babel/plugin-transform-object-assign (注意旧版写法)

# .babelrc配置：
 "plugins": ["@babel/transform-object-assign"]
```
