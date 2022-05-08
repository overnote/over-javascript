# 03-Webpack-2-常用 loader

## 一 常用加载器

### 1.0 加载器配置写法

loader 在 webpack 配置文件的 module 字段中配置，位于 rules 字段中，其值可以是字符串、数组、json 等五花八门，但是笔者推荐使用如下格式：

```js
module: {
  rules: [
    {
      test: /(\.jsx|\.js)$/, //正则匹配 哪些文件 需要该加载器
      use: {
        //匹配到的文件使用哪个加载器
        loader: 'babel-loader',
        options: {
          //加载器的参数
          presets: ['env'],
        },
      },
      exclude: /node_modules/, //忽略掉哪些文件不走该加载器
    },
    {
      //后续的其他加载器
    },
  ]
}
```

注意事项：

- 每个 loader 都不是 webpack 本身的功能，所以需要安装这些第三方 loader 才能使用
- **多个 loader 的处理顺序是：从下到上，从右到左！**

## 1.1 babel-loader 编译 JS

babel-loader 提供对 ES6、ES7 等编译为 ES5 的功能，详细配置见 webpack-babel 章节。

### 1.2 style-loader css-loader 打包 css

打包 CSS 需要两个 loader 配合：

- css-loader：让 JS 支持 `import` css 模块，会遍历 CSS 文件，然后找到 url() 表达式的关系并处理他们
- style-loader： 把刚才分析得到的 css 代码插入页面 head 标签的 style 标签中。

安装 `style-loader` `css-loader`：

```txt
npm i -D style-loader css-loader
```

配置：

```js
module: {
  rules: [
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
  ]
}
```

### 1.3 打包 saas、less

如果用到了 saas，需要安装 `node-saas`， `scss-loader`（同理也有 less-loader）,配置如下：

```js
module: {
  rules: [
    {
      test: /\.(css|scss)$/,
      use: ['style-loader', 'css-loader', 'less-loader'],
    },
  ]
}
```

### 1.4 解决浏览器 CSS 兼容性问题加载器 postcss-loader

如果需要给某些 css 加上类`moz`这样的前缀，需要`postcss-loader`以及 autoprefixer 插件。postcss-loader 的作用类似 babel，babel 用来支持先进的 JS 语法，postcss-loader 在其自身一些插件的作用下，可以支持更先进的 CSS 语法。

安装：

```txt
npm i -D postcss-loader autoprefixer
```

webpack 添加 loader：

```js
// 需要 package.json 中定义 browserslist
module: {
  rules: [
    {
      test: /\.(css|scss)$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    },
  ]
}
```

当然该 loader 还需要自己单的配置，根目录下创建 postcss.config.js,内容如下：

```js
module.exports = {
  plugins: [require('autoprefixer')],
}
```

postcss-loader 也支持一些自定义配置：

```js
module: {
  rules: [
    {
      test: /\.(css|less)$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [require('postcss-preset-env')],
          },
        },
        'less-loader',
      ],
    },
  ]
}
```

### 1.5 打包图片 url-loader

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

### 1.6 处理 img 标签 html-loader

处理 html 中的图片：

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
            limit: 8 * 1024,
            outputPath: 'public/images',
            esModule: false, // 该加载器使用的是commonjs
          },
        },
      ],
    },
  ]
}
```

### 1.7 压缩图片 img-loader

```js
module: {
  rules: [
    {
      test: /\.(jpe?g|png|gif|svg)$/i,
      use: ['url-loader?limit=10000', 'img-loader'],
      pngquant: {
        quality: 80,
      },
    },
  ]
}
```

### 1.8 打包文件 file-loader

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
