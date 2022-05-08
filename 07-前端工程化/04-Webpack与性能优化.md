# 04-Webpack 与性能优化

## 一 开发环境优化

在开发环境下，我们往往关注代码的打包速度、调试便捷度等，所以在开发环境下我们需要优化的是构建、调试相关配置。

### 1.1 HMR 热模块替换

默认情况下，任意一个模块被修改了，比如修改了项目的一个 css 文件，项目所有文件都会被重新打包。在大型项目中，这会极大影响开发效率，webpack 服务 的 HMR 功能，即 `hot module replacement（热模块替换）`，可以让项目只打包发生变化的模块，以极大提升构建速度：

```js
devServer: {
  hot: true // 开启HMR功能，必须重启webpack服务
}
```

虽然开启了 HMR 功能，但是不同类型的文件的 HRM 功能配置不一致：

- html 文件：默认没有 HMR 功能，开启 devServer 的 hot 后也会导致 html 不能热刷新，需要配置入口：`entry:['index.js', 'index.html']`，但是其实 html 文件只有一个文件，HMR 功能是不需要的。
- css 文件：style-loader 内部实现了 HMR 功能，开启 hot 后即可实现 HMR。
- js 文件：默认没有 HMR 功能，即使开启 hot，也仍然是一个 js 文件被修改，所有 JS 文件被重新加载。JS 要实现 HMR 需要在代码中体现。

JS 代码中体现 HMR 方式：

```js
if (module.hot) {
  // 监听 demo.js 文件变化
  module.hot.accept('./demo.js', function () {
    // demo.js 发生变化则执行该回调函数
  })
}
```

贴士：入口文件的修改会一直导致所有文件重新加载的！

### 1.2 source-map 配置源码错误追踪

source-map 是源码到构建后代码之间的映射，如果构建后代码出错，通过该映射可以追踪到源码中的错误。webpack 中配置如下：

```js
devtool: 'source-map'
```

配置了 devtool 值为 source-map 后，会在打包后生成一个外部的 source-map 文件，该文件能够准确提供错误代码位置。但是该配置会降低打包速度，所以也额外提供了许多其他配置项：`[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map`，其意义为：

- `inline-source-map`：打包后的 JS 文件内部追加一个 source-map 代码，能够准确提供错误代码位置
- `hidden-source-map`：打包后生成外部 source-map 文件，只能够提示错误原因，不能追踪到错误的源码位置，只能追踪到构建后的代码错误位置
- `eval-source-map`：打包后的 JS 文件内部中，每个被打包的 js 文件后追加一个 eval()函数，eval 内部执行的是 source-map 源码，源码以 base64 形式存在，也能提供准确的错误代码位置
- `nosources-source-map`：打包后生成外部的 source-map 文件，能够准确提供错误代码位置，但是没有源码信息
- `cheap-source-map`：打包后生成外部的 source-map 文件，能够准确提供错误代码位置，但是报错位置的全部一行代码都会提示错误
- `module-source-map` 可以显示第三方模块的问题

一般如下采用：

- 开发环境：`eval>inline>cheap`。目的是在提升打包速度时，也能方便调试。调试最友好：`cheap-module-source-map`，速度快有：`eval-source-map`
- 生产环境：推荐使用 `source-map`

### 1.3 多进程打包

babel-loader 的打包可以交给多进程处理，其处理方式依赖于 `thread-loader`：

```js
{
  test:/\.js$/,
  use:[
    'thread-loader',
    {'loader': 'babel-loader', options:{}}
  ]
}
```

贴士：多进程启动会浪费较多时间，只有时间消耗较长的地方需要多进程，比如：babel-loader、eslint-loader。

## 二 生产环境优化

生产环境下，依然需要优化生产环境的构建速度，当然也需要优化代码的运行性能。

### 2.1 oneOf 降低加载器加载次数

一些文件其实只需要匹配到一个 loader 就可以了，但是 webpack 中默认 loader 配置需要每个文件都走完所有的 loader 的匹配。这时 oneOf 配置就可以强制其只匹配一次：

```js
module: {
  rules: [
    {
      oneOf: [
        { test: /\.css$/, use: '' },
        { test: /\.less$/, use: '' },
        { test: /\.js$/, use: '' },
      ],
    },
  ]
}
```

贴士：oneOf 中一个类型的文件，只能有一个加载器！

### 2.2 缓存

JS 模块太多，一个文件变化就需要编译全部，生产环境下不能使用 HMR devserver 环境，这里就需要 babel 开启文件缓存：

```js
{
  loader: "babel-loader",
  options: {
    // 第二次构建时读取之前的缓存
    cacheDirectory:true
  }
}
```

打包后的文件在服务端运行时，需要进行缓存处理，以增进性能，但是带来的问题就是：生产代码改变，已运行的 web 容器内静态内容未刷新。这时候可以让 webpack 每次构建生成唯一的 hash 值，让资源在变化后构建时生成的资源产生变化，有三种变化：

- hash：比如 `output:{filename:'build.[hash:10].js'}`，但是改动一个文件打包后会导致所有缓存失效
- chunkhash：比如 `output:{filename:'build.[chunkhash:10].js'}`，但是如果 js 中引入了样式，js 和 css 属于同一个 chunk，其 hash 值也是一样的。。。
- contenthash：比如 `output:{filename:'build.[contenthash:10].js'}`，此时会根据文件内容生成 hash

### 2.3 tree shaking

tree shaking 用于去除无用的代码，如未引用的代码，开启办法：使用 ES6 模块，并开启生产环境。

注意：在 package.json 中配置：`sideEffects:false`，即所有代码都可以 tree shaking，此时 js 中引入的 css 代码会在在一些 webpack 版本中构建后被去除，这是危险的，此时需要配置为：`sideEffects:["*.css"]`

### 2.4 代码分割 codel split

默认 webpack 会将源码构建为一个 build 文件，这样文件过大，也不方便实现按需加载，代码分割即将代码分割为多个某块，可以支持按需加载。

```js
module.exports = {
  optimization: {
    splitCunks: {
      chunks: 'all',
    },
  },
}
```

添加了上述配置后，会起到 2 个作用：

- 将使用到的 `node_modules` 代码单独打包到一个 chunk，名称类似 `vendor.js`
- 在多入口情况下，还会将多入口的较大公共文件单独打包为一个 chunk，减少重复引用。

如果在单页面情况下，我们仍然希望一部分引入文件被单独打包，可以使用**动态导入**。比如我们期望在代码中自定义的一个工具类文件 httpUtil 被单独打包为一个 chunk，则可以在代码中通过这样引入的方式让 webpack 执行单独打包：

```js
import(/* webpackChubkName: 'httpUtil' */ './httpUtil.js')
  .then((res) => {
    // 文件加载成功
  })
  .catch((err) => {
    // 文件加载失败
  })
```

比如代码中引入了 jquery，则打包后，jqueyr 会被单独打包到一个名称类似为 `vendors.js` 文件。

### 2.5 懒加载、预加载

懒加载即在需要某个文件的时候才去加载，而不是在项目启动的时候就完全加载。

比如现在需要实现点击按钮时候运行加法方法，而该方法由其他文件提供，如下示例是在项目启动时就加载了 `mathUtil` 文件：

```js
import add from 'mathUtil'
btn.onclick = function () {
  add(1, 1)
}
```

使用动态导入如下改动后即可实现懒加载，即点击按钮后才加载 mathUtil：

```js
btn.onclick = function () {
  import(/* webpackChunkName: 'mathUtil' */ 'mathUtil').then(() => {
    add(1, 1)
  })
}
```

贴士：懒加载会进行代码分割，因为动态导入会引起代码分割。

懒加载仍然会引起问题，即：需要使用文件时，如果因为网络、大小等问题会导致延迟，在示例中就是点击按钮会导致响应过慢，为了解决该问题，可使用预加载。

预加载：即项目启动时不会加载引入文件，而是在空闲的时候主动加载。

```js
btn.onclick = function () {
  import(
    /* webpackChunkName: 'mathUtil', webpackPrefetch:true */ 'mathUtil'
  ).then(() => {
    add(1, 1)
  })
}
```

预加载原理：普通加载情况下多个文件在同一时间是并行加载的，而预加载是等待其他必须的资源加载完毕后才会加载，这才是最合理的效果。

### 2.5 代码分割常见配置

```js
module.exports = {
  optimization: {
    //代码分割方案：该值如果为{}，则走默认配置
    splitChunks: {
      chunks: 'all', //默认为async（只分割异步代码），其他值有all，initial（只分割同步代码）,其实只需要这一个配置即可，其他地方全部不需要
      minSize: 30000, //引入模块大小大于30KB才做代码分割
      // maxSize: 50000,         //一般不配置
      minChunks: 1, //至少引入了多少次才做分割
      maxAsyncRequests: 5, //只打包前5个需要分割的文件（防止太多被分割造成请求多）
      maxInitialRequest: 3, //入口文件被分割数量
      automaticNameDelimiter: '~', //打包后文件名的连接符
      name: true, //是否让cacheGroups内名字生效
      cacheGroups: {
        //打包同步代码将会走这一步
        vendors: {
          //默认为false,指定打包后文件名是否有前缀
          test: /[\\/]node_modules[\\/]/, //引入文件位于node_modules时打包方式
          priority: -10, //vendors和default打包优先级
          //filename: 'vendors.js'  //强行指定打包后文件名
        },
        default: {
          //默认打包配置，如果不符合vendors要求，如下打包
          priority: -20,
          reuseExistingChunk: true, //当前模块之前已经被打包，是否直接引用之前被打包的模块
          //filename: 'default.js'  //强行指定打包后文件名
        },
      },
    },
    // 解决问题：修改a文件导致b文件的contenthash发生变化。原理：将当前模块的hash单独打包为一个runtime文件
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },
    // 代码压缩方案
    minimizer: {
      new TerserWebpackPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      })
    }
  },
}
```

### 2.6 externals 加载外部 CDN 资源

一些依赖包文件打包文件过大，可以通过 webpack 的 externals 节点配置 CDN 资源解决，声明在 externals 中的第三方依赖包不会被打包：

常用方式：

```js
// webpack 配置
module.exports = {
  externals: {
    jquery: 'jQuery',
  },
}
```

使用 chainWebpack 方式：

```js
// key 为包名
module.exports = {
  chainWebpack: (config) => {
    config.when(process.env.NODE_ENV === 'production', (config) => {
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        lodash: '_',
        echarts: 'echarts',
      })
    })
  },
}
```

配置完 webpack 后，这些对应资源需要在 `public/index.html` 头部中配置 CDN 资源：

```html
<head>
    <link rel="stylesheet" href="https://cdn.echarts.css"></link>
    <script src="https://cdn.vue.com/2.6/vue.min.js"></script>
    </head>
```

而且此时生产环境、开发环境由于已经配置了不同入口，就可以在生产环境的入口中取消 import 上述文件。

### 三 其他配置

### 3.1 console 移除

build 阶段可以移除 console 信息，babel 插件：`babel-plugin-transform-remove-console` 可以帮助实现该功能，babel 中的配置如下：

```js
// // 只在发布阶段移除
// const plugins = []
// if (process.env.NODE_ENV === 'production') {
//   plugins.push('transform-remove-console')
// }

plugins: ['transform-remove-console']
```

### 3.2 dll 配置

贴士：DLL 技术目前已经不被推荐！！！！

代码分割默认配置下，会将 node_modules 文件夹单独打包为一个 chunk，实际开发中，该文件往往无比巨大，需要对一些库进行单独打包。

```js
module.exports = {
  entry: {
    jquery: ['jquery'],
  },
  output: {
    filename: '[name],js',
    path: path.resolve(__dirname, 'dll'), // 打包到dll目录下
    library: '[name]', // 打包的库向外暴露的名称
  },
  plugins: [
    // 该插件用于帮助打包生成 manifest文件，提供jqueyr映射关系，告知webpack jquery无需打包，位置在哪
    new webpack.DllPlugin({
      name: '[name]', // 映射库暴露的名称
      path: path.resolve(__dirname, 'dll/manifest.json'), // 输出的名称
    }),
  ],
}
```
