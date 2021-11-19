# 04-Webpack 常见配置

## 一 CSS 相关

### 1.1 style-loader css-loader

打包 CSS 需要两个 loader 配合：

- css-loader：让 JS 支持 `import` css 模块，会遍历 CSS 文件，然后找到 url() 表达式的关系并处理他们
- style-loader： 把刚才分析得到的 css 代码插入页面 head 标签的 style 标签中。

配置：

```js
// npm i -D style-loader css-loader
module.expors = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
```

### 1.2 less 文件预编译 less-loader

如果用到了 less，则需要安装 less-loader：

```js
// npm i -D less-loader
module.exports = {
  module: {
    rules: [
      {
        test: /\.css|less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
}
```

注意：如果用的是 saas，则需要安装 `node-saas`， `scss-loader`个包。

### 1.3 解决 CSS 兼容性 postcss

postcss 是一个用 JavaScript 工具和插件转换 CSS 代码的工具，其丰富的扩展可用于解决 css 代码的兼容性。

注意：postcss 与 webpack 是无关的，如果要在 webpack 打包时候也能够让 postcss 起作用，则需要加载 postcss-loader。

```js
// npm i -D postcss-loader postcss-preset-env
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => {
                // 用于找到package.json中的 browserlist，通过该配置加载不同的配置信息
                require('postcss-preset-env')()
              },
            },
          },
          'less-loader',
        ],
      },
    ],
  },
}
```

当然该 loader 还需要自己单的配置，根目录下创建 postcss.config.js,内容如下：

```js
module.exports = {
  plugins: [],
}
```

### 1.4 CSS 代码提取

当在 js 文件中使用 `import` 直接引入 css 文件时，不会生成单独的 CSS 文件。如果我们希望 webpack 仍然像传统的打包方式（html，css，js 依次分开），那么就要做 CSS 的代码分割。CSS 代码分割需要借助插件：MiniCssExtractPlugin，该插件不支持热更新，需要手动刷新浏览器，所以我们推荐将该插件配置在**生产环境**中，而不是开发环境。

MiniCssExtractPlugin 使用步骤：

```js
// 安装：npm i -D mini-css-extract-plugin
// 配置生产环境的webpack
const path = require('path')
const webpack = require('webpack')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => {
                // 用于找到package.json中的 browserlist，通过该配置加载不同的配置信息
                require('postcss-preset-env')()
              },
            },
          },
          'less-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? 'css/[name].css' : 'css/[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
  ],
}
```

引入该插件的前后区别：

- 引入前：webpack 将 `import` 的 css 文件直接以 style 标签形式写入 html 文件
- 引入后：引入的所有 css 默认会被打包为 `main.css` ，并以 link 形式写入 html 文件

注意：引入的多个 CSS 文件仍然被打包在了一个 css 文件中，如果不同的入口的 css 要打包到不同的 css 文件,额可以查看插件官网,配置 cacheGroups。

在生产环境中,打包的文件名,即 filename 和 chunkFilename 应该这样书写:`[name].[contentHash].css`,即打包后的名字会带一个由内容产生的 hash,内容不变(源码未改),则会产生缓存,内容改变后,该打包文件名也会改变,则重新请求。

### 1.5 CSS 代码压缩

webpack4 使用 optimize-css-assets-webpack-plugin 插件进行 CSS 代码压缩，webpack5 则使用 css-minimizer-webpack-plugin 实现。

webpack4 的 optimize-css-assets-webpack-plugin 配置：

```js
// npm install -D optimize-css-assets-webpack-plugin
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  plugins: [new OptimizeCssAssetsPlugin()],
}
```

webpack5 的 css-minimizer-webpack-plugin 配置：

```js
// npm install -D css-minimizer-webpack-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  plugins: [new MiniCssExtractPlugin()],
}
```

### 1.6 另一种打包方式

使用 file-loader 与 style-loader 配合，此时 import 的 css 不再以 style 标签的形式插入页面，而是生成 link 标签引入打包的 css，import 了多个 css，则生成多个 link，由于该方式会造成多次请求，所以**很少使用**。

配置如下：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader/url' }, { loader: 'file-loader' }],
      },
    ],
  },
}
```

## 二 JS 相关

webpack4 中，如果在生产环境，JS 的代码在打包时就会被压缩，无需额外插件。

## 三 文件相关

## 二 文件相关 loader

### 2.1 打包文件 file-loader

打包文件需要借助：file-loader，首先需要安装该 loader：

```txt
npm i -D file-loader
```

项目的整体结构图如下所示：
![整体结构图](/images/JavaScript/webpack-04.png)

file-loader 配置：

```js
module: {
  rules: [
    {
      test: /\.(jpg|png|docx|ppt)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'public/images/',
        },
      },
    },
  ]
}
```

此时若在 js 中引入了一个文件：

```js
import demoWord from './public/images/demo.docx'

// 输出的是文件名
console.log('demoWord...', demoWord)
```

执行打包后，文件被打包进了 `dist/public/images/` 目录！

贴士：`[name]` `[hash]` 是 webpack 的占位符，还有很多类似的占位符。

注意：flie-loader 的一般用于打包字体文件，如下所示配置：

```js
module: {
  rules: [
    {
      test: /\.(eot|ttf|svg|)$/,
      use: {
        loader: 'file-loader',
      },
    },
  ]
}
```

### 2.2 打包图片 url-loader

url-loader 具备 file-loader 的功能，且额外拥有自己的一些功能：可以把小图片打包为 base64 格式，所以打包图片一般使用 `url-loader`，可以在一定程度上提升性能。

安装 `url-loader`：

```txt
npm i url-loader -D
```

`url-loader` 配置如下：

```js
module: {
  rules: [
    {
      test: /\.(jpg|png|jpeg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          name: '[name]_[hash].[ext]',
          outputPath: 'public/images/',
          limit: 2048, //如果图片超过2048字节不生成base64
        },
      },
    },
  ]
}
```

### 2.3 压缩图片 img-loader

```js
module: {
  rules: [
    {
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: ['url-loader?limit=10000', 'img-loader'],
    },
  ]
}
```

如果需要配置压缩率，可以添加可选项：

```js
pngquant: {
  quality: 80
}
```

### 2.4 处理 img 标签 html-loader

```js
module: {
  rules: [
    {
      test: /\.html$/,
      use: [
        {
          loader: 'html-loader',
          options: {
            attrs: ['img:src', 'img:data-src'],
          },
        },
      ],
    },
  ]
}
```
