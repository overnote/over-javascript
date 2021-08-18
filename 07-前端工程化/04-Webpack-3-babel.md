# 04-webpack 与 babel

## 一 webpack 配置 babel

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

## 二 babel 转换函数

### 2.1 poyfill

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

### 2.2 transform-runtime

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

### 2.3 原理解读

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

## 三 配置 react

安装 react：

```txt
npm i -S react react-dom
```

安装 babel：和配置 babel 一样，注意版本，额外安装 react 相关语法插件即可

```txt
# webpack4 版本
npm i -D babel-preset-react@6
# webpack3 版本
npm i -D @babel/preset-react
```

配置 webpack：和配置 babel 一样

```js
{
 test: /(\.jsx|\.js)$/,
 use: {
  loader: "babel-loader"
 },
 exclude: /node_modules/
}
```

同样 babel 配置需要写在.babelrc 中：

```js
{
 "presets": ["@babel/env", "@babel/react"] //老版为["env", "react"]
}
```
