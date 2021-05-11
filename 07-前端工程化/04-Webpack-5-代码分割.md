# 06-CodeSplitting 代码分割

## 一 代码分割简介

默认情况下，webpack 打包后的文件只有一个，体积非常大，会造成严重的性能问题。如果能够对打包后的文件进行分割，网页不但能进行多个 js 文件并行加载，也能实现按需加载！

## 二 代码分割操作

### 2.1 手动代码分割

比如现在有一个业务文件：index.js，其内容容下所示：

```js
import _ from 'lodash'
console.log(_.join(['a', 'b', 'c'], '***'))
```

此时，打包后的结果是，lodash 文件和当前的 index.js 都被打到了输出文件 main.js 内，一般理想化的情况是 lodash 本身被打包为一个 js 文件。

手动代码分割的步骤如下：

```js
// 在libs目录下创建lodash.js文件
import lodash from 'lodash';
window.lodash = lodash;
window._ = lodash;

//webpack配置
entry: {
    "libs/lodash": path.resolve(__dirname, './src/lib/lodash.js'),
    main: path.resolve(__dirname, './src/index.js')
},
```

配置了上述 webpack 配置项后，源码的 index.js 中就无需引入 loadsh ，直接使用 lodash 的功能

```js
console.log(_.join(['a', 'b', 'c'], '***'))
```

打包时，`libs/lodash` 文件被当做了一个 chunk，进行独立打包，最终产生 2 个打包后的 js 文件。

### 2.2 使用 webpack4 代码分割工具

webpack4 内部自带了自动代码分割的插件，无需对 entry 入口进行设置，只需要添加如下配置：

```js
optimization: {
    splitChunks: {
        chunks: 'all'
    }
},
```

使用该插件，我们的源码也无需删除 import，该怎么用就怎么用，这才符合正常的开发习惯：

```js
import _ from 'lodash'
console.log(_.join(['a', 'b', 'c'], '***'))
```

打包后生成了两个文件，且都被 html 文件引入了：

- 引入文件 loadsh 被单独打包为：`vendors~main.js`。不过这里其实是将 `node_modules` 被当做了单独的 chunk
- 入口文件 index 被打包为：`main.js`

贴士：如果多入口时引入了库 A，而项目中也 import 了库 A，那么 webpack 会对此进行分析，最终只会打包成一个 chunk。

### 2.3 动态导入与懒加载

我们自己的业务代码也需要进行一定程度的代码分割，此时需要借助动态导入：

```js
// 未测试：新版webpack未知是否已经默认支持动态导入，需要测试
// 先安装 babel 插件：npm i -D @babel/plugin-syntax-dynamic-import

// 在 .babelrc 中添加配置
{
  plugins: ['@babel/plugin-syntax-dynamic-import']
}
```

如下所示，动态导入的 demo.js 模块会直接被 webpack 打包为一个 chunk：

```js
import(/* webpackChunkName: 'demo' */ './demo.js')
  .then((data) => {
    // 业务代码
  })
  .catch((err) => {
    // 业务代码
  })
```

不过实际开发中，往往需要在一些情况下才会引入一个模块，即：懒加载，也就是异步加载模块，这样能有效提升项目性能。

如：只有触发了点击事件才会加载 demo.js，否则不需要：

```js
btn.onclick = function () {
  import(/* webpackChunkName: 'demo' */ './demo.js')
    .then((data) => {
      // 业务代码
    })
    .catch((err) => {
      // 业务代码
    })
}
```

此时 webpack 默认是不会打包 demo.js，而是在点击了事件之后，才会加载。

贴士：`webpackChunkName: 'demo'`用来标识打包后的文件名为 demo，如果没有该说明，则默认以递增的数值 id 显示文件名。

### 2.4 预加载

除了懒加载，也有一些 js 文件需要提前加载，则可以使用预加载：

```js
import(/* webpackChunkName: 'demo', webpackPrefetch: true */ './demo.js')
  .then((data) => {
    // 业务代码
  })
  .catch((err) => {
    // 业务代码
  })
```

预加载与直接 `import 'demo.js'` 区别：预加载是指浏览器在必要资源加载完毕后，偷偷加载一些资源。比如懒加载时，加载的文件较大，则点击按钮后，则会消耗较长的时间，这时可以对其配置预加载。

## 二 常见配置

```js
splitChunks: {              //该值如果为{}，则走默认配置
    chunks: 'all',          //默认为async（只分割异步代码），其他值有all，initial（只分割同步代码）,其实只需要这一个配置即可，其他地方全部不需要
    minSize: 30000,         //引入模块大小大于30KB才做代码分割
    // maxSize: 50000,         //一般不配置
    minChunks: 1,           //至少引入了多少次才做分割
    maxAsyncRequests: 5,    //只打包前5个需要分割的文件（防止太多被分割造成请求多）
    maxInitialRequest: 3,   //入口文件被分割数量
    automaticNameDelimiter: '~',    //打包后文件名的连接符
    name: true,             //是否让cacheGroups内名字生效
    cacheGroups: {          //打包同步代码将会走这一步
        vendors: {          //默认为false,指定打包后文件名是否有前缀
            test: /[\\/]node_modules[\\/]/, //引入文件位于node_modules时打包方式
            priority: -10,  //vendors和default打包优先级
            //filename: 'vendors.js'  //强行指定打包后文件名
        },
        default: {          //默认打包配置，如果不符合vendors要求，如下打包
            priority: -20,
            reuseExistingChunk: true    //当前模块之前已经被打包，是否直接引用之前被打包的模块
            //filename: 'default.js'  //强行指定打包后文件名
        }
    }
}
```

## 三 CSS 代码分割

### 3.1 入口文件与引入文件打包的不同

```js
entry:{
    main: './src/index.js'
},
output: {
    filename: '[name],js',              // entry中的文件被打包后的名字main
    chunkFilename: '[name].chunk.js'    // 非入口，被入口文件引入的模块文件
}
```

### 3.2 CSS 代码分割插件 MiniCssExtractPlugin

当直接在 js 文件中使用 import 直接引入 css 文件时，webpack 的`css-loader`将会采取`css in js`的方式打包，即不会生成该 js 文件。

如果我们不希望 webpack 这样打包，而是仍然像传统的打包方式（html，css，js 依次分开），

MiniCssExtractPlugin 插件暂时不支持热更新，需要手动刷新浏览器，所以我们推荐将该插件配置在生产环境中，而不是开发环境.

```js
// 安装
cnpm i -D mini-css-extract-plugin

// 配置 webpack.config.prod.js
// 第一步:移除base配置中的css相关配置,并拷贝到dev环境中
// 第二步:配置生产环境中css
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",            // 此时import方式引入的css走此步打包,并生成一个link加入html中,以前是直接以style形式追加
      chunkFilename: "[id].css"
    })
  ]
//此时打包生成了css:main.css
```

注意 1:由于 TreeShaking 的存在,CSS 文件往往不会被打包,需要配置 package.jso 如下:

```js
sideEffects: ['*.css', '*.scss']
```

注意 2: index.js 内引入了 2 个 css 文件,那么这 2 个 CSS 文件都会被打包到 main.css 文件中!!!!

注意 3: 打包的 css 需要压缩,需要使用插件:optimize-css-assets-webpack-plugin

注意 4: 如果不同的入口的 css 要打包到不同的 css 文件,额可以查看插件官网,配置 cacheGroups

注意 5: 在生产环境中,打包的文件名,即 filename 和 chunkFilename 应该这样书写:`[name].[contentHash].css`,即打包后的名字会带一个由内容产生的 hash,内容不变(源码未改),则会产生缓存,内容改变后,该打包文件名也会改变,则重新请求.

注意 6:旧版的 webpack 的 hash 值仍然会变化,需要添加配置

```js
optimization: {
  runtimeChunk: {
    name: 'runtime'
  }
}
```
