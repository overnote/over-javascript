# 01-webpack 基本使用

## 一 webpack 简介

### 1.1 webpack 概念

在开发环境中，现代前端开发技术提倡模块化开发，以降低代码耦合度，便于后期扩展、维护。在生产环境中，前端代码也需要压缩、合并等以提升网页性能。

这些操作手动操作自然是相当繁琐，Webpack 就是这样一款模块打包工具，他会分析项目的结构，找到 JS 模块，将其转换和打包为合适的格式提供给浏览器直接使用。

webpack 的优点：

- 1. 对 CommonJS 、 AMD 、ES6 的语法规范都做了兼容
- 2. 对 js、css、图片等资源文件都支持打包
- 3. 串联式模块加载器以及插件机制，使用更加灵活，扩展性更强
- 4. 有独立的配置文件 webpack.config.js
- 5. 可以将代码切割成不同的 chunk，实现按需加载，降低了初始化时间
- 6. 支持 SourceUrls 和 SourceMaps，易于调试

### 1.2 webpack 与 gulp 区别

Gulp 的定位是 Task Runner, 用来跑一个一个任务，但是没有解决 js module 的问题。其工作方式是：指明对某些文件进行类似编译、组合、压缩等任务的具体步骤，之后 gulp 工具可以自动替你完成这些任务。
![gulp原理](/images/JavaScript/webpack-01.png)
Webpack 工作方式：把项目当做一个整体，通过一个给定的主文件（如 index.js），Webpack 将从这个文件开始找到项目的所有依赖文件，使用 loaders 处理它们，最后打包为一个（或多个）浏览器可识别的 JavaScript 文件。
![webpack原理](/images/JavaScript/webpack-02.png)

## 二 webpack 的安装与运行

### 2.1 webpack4 安装

```txt
# 确保电脑已经安装Node，版本最好大于8.6
node -v

# 基本项目根目录后，安装 webpack。这里推荐本地安装，以保证版本的一致性。
npm i -D webpack@4 webpack-cli@3

# 查看安装的webpack版本
npx webpack -v        # 本笔记基于webpack4，可以避免各种插件的版本错误
```

贴士：在本地安装的 webpack 需要使用 `npx webpack` 命令启动，或者使用 `.\node_modules\.bin\webpack`。也可以全局安装 webpack，就可以直接使用 webpack 命令了，但是笔者不推荐，因为不同的项目可能使用的 webpack 版本不同，全局安装后会影响对不同版本项目的支持。

### 2.2 工程目录与打包

工程目录比如是如下格式：

![工程目录](/images/JavaScript/webpack-03.png)

webpack4 之后，无需配置文件即可实现打包，会自动在 src 目录下寻找 index.js 文件，开始执行打包。

在根目录执行打包：

```txt
npx webpack
```

打包完毕后，会在根目录生成 `dist` 目录，打包后的文件都放在此处。

### 2.3 使用 webpack 打包

在工程根目录下输入打包命令：

```txt
npx webpack index.js
```

打包完毕后会在根目录下生成`dist`文件夹，内部包含一个`test.js`文件被打包后生成的`main.js`文件

webpack 常用命令参数：

```txt
--open          打包后自动打开浏览器
--port          设置端口
--contentBase   打开目的文件目录
--hot           浏览器异步更新  主要针对样式的更改
--config a.js   手动指定配置文件，默认为根目录下的webpack.config.js
```

### 2.4 npm 脚本运行

反复输入上述命令很麻烦，可以配置一个 npm 脚本来替代：

```txt
# 在package.json 中添加一行脚本
"dev": "webpack --mode development"

# 配置完成后使用npm来启动webpack
npm run dev
```

### 2.5 正确认识 webpack

webpack 并不能实现 js 的编译，只能识别到 JS 中的 `import`语法，把 js 中引入的其他 js 文件打包到一起。

如果要打包 html、css、编译 ES6 等，则需要 webpack 大量的 loader、plugin 来实现，其本身只是一个模块打包工具。

## 三 webpack 的配置

### 3.1 webpack.config.js

在实际开发中，webpack 的打包命令需要配置大量的命令参数，这些参数如果都写在 npm 脚本中也会引起 npm 脚本的臃肿，我们可以指定一个 webpack 的配置文件，让 npm 脚本运行的 webpack 命令去该配置文件查找 webapck 的命令行参数：

在项目根目录下创建 webpack.config.js 配置文件：

```js
const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.js'), //入口
  output: {
    path: path.resolve(__dirname, 'dist'), //输出目录
    filename: 'bundle.js', //输出文件名
  },
}
```

贴士：在 webpack4.0 时，打包需要设置 mode，默认值为 production，也可以设置为 development，二者分别用于生产环境（会压缩）和开发环境

## 四 webpack5 的改变

### 4.1 webpack5 新特性

webpack5 对 webpack 几个固有问题进行了优化：

- 打包后文件被大幅缩小，代码更加清爽
- treashaking 进行了优化，打包后的捆绑包更小
- 通过持久缓存提高构建性能！使用了更好的算法和默认值来改善长期缓存（hash 值算法改变）
- 能够识别循环依赖

webpack5 打包后的程序更加清爽，从而也避免了饱受诟病的打包后文件变大的毛病（一个 console 有 1KB，webpack5 打包后只有几十 B）：

```txt
// webpack5打包console后的代码：
(()=>{"use strict";console.log("hello world!")})()
```

## 五 Webpack 打包细节

![webpack打包细节](../images/javascript/webpack-00.png)
