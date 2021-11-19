# 03-webpack 的 plugins

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

## 三 提取公共代码插件

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
