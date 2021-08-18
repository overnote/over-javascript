# 03-webpack 的 plugins

## 一 plugins 简介

### 1.1 plugins 的作用

webpack 的各种 loader 提供了对对应类型文件的打包方式，plugins 则不同，它只是 webpack 打包过程的便利性、增强型工具。

### 1.2 pugin 是的配置书写方式

plugins 配置位于 webpack 配置文件的 `plugins` 字段：

```js
plugins: []
```

## 二 常用插件

### 2.1 移动 html 插件 html-webpack-plugin

该插件可以将源码中的 html 页面从 src 拷贝到 dist 下，且会自动将入口文件打包的 js 文件插入 html 页面的 script 标签中。

安装插件：

```txt
cnpm i -D html-webpack-plugin
```

配置插件：

```js
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // .... 省略了其他配置
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    }),
  ],
}
```

### 2.2 去除注释插件

去除注释插件为：`uglifyjs-webpack-plugin`,但是 webpack4 不再需要该插件，因为在打包时候如果使用了`mode`为`production`，则自动去除注释。

### 2.3 bootstrap 库的打包问题

引入类似 jqueryui,bootstrap 这样的库，他们依赖于 jquery，打包配置方式如下：

```js
const webpack = require('webpack')
//插件数组添加如下元素
new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery',
})
```

此时 webpack 在 bootstrap 源码中偷偷加入`import "jquery"`

### 2.4 其他常用插件

```txt
clean-webpack-plugin    删除目录插件
copy-webpack-plugin     拷贝文件插件
webpack.ProvidePlugin   全局注入变量
webpack-merge           合并不同webpack配置文件
```

## 三 提取公共代码插件

### 3.1 提取 CSS 公共代码插件

旧版 webpack 使用插件：extract-text-webpack-plugin 。webpack4 推荐使用插件：mini-css-extract-plugin。

提取的公共 CSS 将会以 link 标签的形式插入在网页中。

mini-css-extract-plugin 使用：

```js
// 需要先安装：npm i -D mini-css-extract-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // ... 省略其他配置
  module: {
    rules: [
      {
        test: /\/css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // 不再使用 style-loader
      },
      {
        test: /\/less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'], // 不再使用 style-loader
      },
    ],
  },
  plugins: [
    // ... 省略其他配置
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
  ],
}
```

### 3.2 提取 JS 公共代码插件

webpack 内置了提取公共代码的插件，主要针对多入口配置：

```js
entry: {
    'pageA': './src/pageA',
    'pageB': './src/pageB',
    'vendor': ['lodash']
},
output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
},
plugins: [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    })
]
```

此时 入口 pageA 和入口 pageB 引入的共同文件将会被打包到一个公共 js 中，名为插件配置中的 name，如果 name 的值和入口中某个文件相同，那么会被打包到该入口文件中。

vendor 是默认该项目引入的一系列第三方包，其他入口的功用代码也会被打包到该文件中。
如果不想被打包如某个入口文件，可以在 plugins 中修改 name，或者再配置一个 optimize。
也可以这样配置：

```js
new webpack.optimize.CommonsChunkPlugin({
  name: ['vendor', 'manifest'],
  minChunks: Infinity,
})

new webpack.optimize.CommonsChunkPlugin({
  name: 'common',
  minChunks: 2,
  chunks: ['pageA', 'pageB'],
})
```

## 四 压缩文件插件

JS 的代码在打包时就会被压缩，而 CSS 不会，需要借助插件的支持。webpack4 默认提供了相关选项：

```js
// npm i -D optimize-css-assets-webpack-plugin

const optimizeCss = require('optimize-css-assets-webpack-plugin')

module.exports = {
  optimization: {
    // 优化项
    minimizer: [new optimizeCss()],
  },
}
```

使用了上述插件后，JS 反而不会被压缩，这里需要进行如下配置：

```js
// npm i -D uglifyjs-webpack-plugin
const uglifyJS = require('uglifyjs-webpack-plugin')

module.exports = {
  // 优化项
  optimization: {
    minimizer: [
      // 优化JS：压缩
      new uglifyJS({
        cache: true,
        parallel: true, // 并发打包
        sourceMap: true,
      }),
      // 优化CSS
      new optimizeCss(),
    ],
  },
}
```
