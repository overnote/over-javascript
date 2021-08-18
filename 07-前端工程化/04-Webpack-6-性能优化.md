# 07-webpack 优化

## 一 源码性能优化

### 1.0 代码分析

使用 <http://webpack.github.com/analyse> 可以进行代码分析。

使用步骤：

```txt
# 在package.json中添加
"dev-build": "webpack --profile --json > stats.json --config webpack.config.dev.js"

# 此时打包会在根目录生成  stats.json文件，将该文件传递到上述网址中即可
```

chrome 亚也提供了代码覆盖率分析工具,位于谷歌开发者工具关闭按钮左边三个小点的 more tools 中，名字是 coverage。

### 1.1 异步加载

webpack 推荐使用异步代码，所以在代码分割中，默认配置是：`async`。

因为这里涉及代码利用率的问题，比如首屏加载，会加载很多 js，有一部分是无用的，会降低代码的利用率。

写法：

```js
document.addEventListener('click', ()=>{
    import('./click.js').then(()=>{

    }
})
```

贴士：缓存能够提升的性能非常少，但是异步加载提升空间非常大。

### 1.2 后台加载

当前台需要展示的部分已经加载完毕，我们还希望前端在空闲时间时，内部悄悄地加载异步组件，以供用户触发事件时立即展示，可以这样做：

```js
//异步组件中添加如下魔法
document.addEventListener('click', ()=>{
    import(/* webpackPrefetch: true */ './click.js').then(()=>{

    }
})
```

## 二 开发环境优化

### 2.1 热更新

问题：只修改 CSS 文件，webpack 也会将 其他的文件一起重新打包，严重影响性能。

webpack 的 HMR 功能（hot module replacement，模块热更新）可以实现只会打包发生变化的模块，可以极大提升构建速度：

```js
devServer: {
  hot: true,
  hotObly: true,// 该配置可以不写，其意义仅允许HRM时刷新浏览器
}
```

注意：CSS 文件文件可以实现 HRM 功能，是因为 style-loader 内部实现了 HRM，所以开发环境使用 style-lader，生产环境需要提取单独文件才能性能更好。

html 文件默认不能实现 HRM，需要修改 entry：

```js
entry: ['./src/index.js', './src/index.html']
```

但是 html 文件不需要 HRM 功能，因为一般 webpack 应用于单页面项目，html 只有这一个文件。

js 文件默认也不能实现 HRM，需要在 js 源码中添加 HRM 支持代码：

```js
if (module.hot) {
  // 监听 demo.js 文件变化，一旦发生变化，其他模块不会重新打包
  module.hot.accept('./demo.js', () => {
    // 业务代码
  })
}
```

由上得出，HRM 智能处理非入口 js 文件，因为一旦入口改变，所有文件就会改变。不过我们可以对入口文件引入的一些依赖文件做处理。

### 2.2 source-map

已写

### 2.3 babel 缓存

构建时可以对文件进行缓存，从而让第二次构建性能获得极大提升。

js 文件缓存开启方式：

```js
{
    loader: 'babel-loader',
    options: {
        cacheDirectory: true
    }
}
```

输出代码缓存后，容易引起问题，如：用户网页发生变化后，再次访问，访问到的是原有的网页，需要在输出文件中添加 hash 名：

```js
output: {
  filename: 'js/build.[hash:10].js'
}
```

CSS 文件也需要进行缓存设置，但是 CSS 文件的 hash 值需要重新认识：

- hash：每次打包都会产生新的 hash 值，所以一旦重新构建就会导致所有缓存失效
- chunkhash：css 和 js 入口文件都是 `index.js`，会导致修改 css 文件，新的 CSS 文件不会被重新构建
- contenthash：根据文件内容产生 hash 值

所以 CSS 的 hash 值设置方式为：

```js
plugins: [
  new MiniCssExtractPlugin({
    filename: 'css/build.[contenthash:10].css',
  }),
]
```

## 三 生产环境优化

### 3.1 oneOf 匹配 loader

一个文件会在 webpack 的 rules 规则中进行全部匹配，直到命中，这也会影响性能。

添加 oneof 解决，实现以下 loader 只匹配到一个（注意：如果 2 个 loader 同时处理一种文件，则 loader 只有一个生效，此时单独使用 enforce 解决）。

```js
rulse: [
  {
    {
        test:/\.js$/,
        exlcude: /node_modules/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
            fix:true
        }
    },
    oneOf: [
      // 所有的其他loader
    ],
  },
]
```

### 3.2 TreeShaking

webpack 从版本 2 开始引入了 TreeShaking（树摇），即引入一个文件后，该文件内未被使用的方法，将不会被打包。

**TreeShaking 只支持 ESModule，在生产环境下就会开启！**

如果 development 模式可以通过配置进行开启树摇，但是开启后所有源码依然会被打包，只是会提示 `\*\*` 未被使用。开启方式：

```js
optimization: {
  usedExports: true
}
```

**注意：较旧的 webpack 会对 JS 代码中引入的 CSS 等文件进行树摇，如`import './css/index.css'`，他认为这段语句是未被使用的！**，需要如下配置：

```js
// package.json 文件进行配置。该key的值默认是false，即可以对所有代码进行树摇
"sideEffects":[
    "*.css",
    "@babel/polly-fill"   // 防止 import polyfill这样的文件 也被树摇
]
```
