# 02-webpack 的 loader

## 一 loader 简介

### 1.1 webpack 中的加载器

wepack 只能识别 js 的 `import`语法，要打包 JS、css 文件，或者对这些文件进行预处理，则依赖于大量的加载器（loader），每个加载器都为 webpack 提供了一个功能，多个加载器组合后，才能实现完整的项目打包功能。

### 1.2 加载器配置写法

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

## 二 常用 js loader

## 2.1 编译 JS babel-loader

babel-loader 提供对 ES6、ES7 等编译为 ES5 的功能，详细配置见 04.1 章节。

## 三 常用图片 loader

### 3.1 打包文件 file-loader

打包文件需要借助：file-loader，首先需要安装该 loader：

```txt
npm i -D file-loader
```

项目的整体结构图如下所示：
![整体结构图](/images/JavaScript/webpack-04.png)

file-loader 配置：

```js
      {
        test: /\.(jpg|png|docx|ppt)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'public/images/',
          }
        }
      },
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
      {
        test: /\.(eot|ttf|svg|)$/,
        use: {
          loader: 'file-loader',
        }
      },
```

### 3.2 打包图片 url-loader

url-loader 具备 file-loader 的功能，且额外拥有自己的一些功能：可以把小图片打包为 base64 格式，所以打包图片一般使用 `url-loader`，可以在一定程度上提升性能。

安装 `url-loader`：

```txt
cnpm i url-loader -D
```

`url-loader` 配置如下：

```js
     {
        test:  /\.(jpg|png|jpeg|gif)$/,
        use:{
            loader: 'url-loader',
            options: {
                name: '[name]_[hash].[ext]',
                outputPath: 'public/images/',
                limit: 2048 //如果图片超过2048字节不生成base64
            }
        }
      }
```

### 3.3 压缩图片 img-loader

```js
rules: [
  {
    test: /\.(jpe?g|png|gif|svg)$/i,
    use: ['url-loader?limit=10000', 'img-loader'],
  },
]
```

如果需要配置压缩率，可以添加可选项：

```js
pngquant: {
  quality: 80
}
```

### 3.4 处理 img 标签 html-loader

```js
{
    test: /\.html$/,
    use: [
        {
            loader: 'html-loader',
            options: {
                attrs: ['img:src', 'img:data-src']
            }
        }
    ]
}
```

## 四 打包 CSS loader

### 4.1 style-loader css-loader

打包 CSS 需要两个 loader 配合：

- css-loader：让 JS 支持 `import` css 模块，会遍历 CSS 文件，然后找到 url() 表达式的关系并处理他们
- style-loader： 把刚才分析得到的 css 代码插入页面 head 标签的 style 标签中。

安装 `style-loader` `css-loader`：

```txt
cnpm i -D style-loader css-loader
```

配置：

```js
            {
                test:  /\.css$/,
                use:['style-loader', 'css-loader']
            }
```

### 4.2 less 文件预编译 less-loader

如果用到了 saas，需要安装 `node-saas`， `scss-loader`（同理也有 less-loader）,配置如下：

```js
            {
                test:  /\.(css|scss)$/,
                use:[
                   'style-loader',
                   'css-loader',
                   'less-loader'
                  ]
            }
```

### 4.3 解决浏览器前缀 postcss-loader

如果需要给某些 css 加上类`moz`这样的前缀，需要`postcss-loader`以及 autoprefixer 插件。postcss-loader 的作用类似 babel，babel 用来支持先进的 JS 语法，postcss-loader 在其自身一些插件的作用下，可以支持更先进的 CSS 语法。

安装：

```txt
cnpm i -D postcss-loader autoprefixer
```

webpack 添加 loader：

```js
{
  "test": /\.(css|scss)$/,
  "use": [
    "style-loader",
    {
      "loader": "css-loader",
      "options": {
        "importLoaders": 2
      }
    },
    "scss-loader",
    "postcss-loader"
  ]
}
```

当然该 loader 还需要自己单的配置，根目录下创建 postcss.config.js,内容如下：

```js
module.exports = {
  plugins: [require('autoprefixer')],
}
```

`importLoaders` 的作用是：若已经被打包的 css 文件内部依然有 `@import **.css` 时，可以保证内部引用的 css 文件再次从前 2 个 loader 重新编译一遍，即：`scss-loader`、`postcss-loader`。

### 4.4 另一种打包方式

使用 file-loader 与 style-loader 配合，此时 import 的 css 不再以 style 标签的形式插入页面，而是生成 link 标签引入打包的 css，import 了多个 css，则生成多个 link，由于该方式会造成多次请求，所以**很少使用**。

配置如下：

```js
            {
            test: /\.css$/,
            use: [
              {loader: 'style-loader/url'},
              {loader: 'file-loader'}
            ]
            }
```

## 五 其他 loader

### 5.1 处理 typescript

推荐使用官方的 loader：

```txt
npm i -D ts-loader
```

tsconfig.json 配置：

```js
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "allowJs": true
    },
    "include": [
        "./src/*"
    ],
    "exclude": [
        "./node_module"
    ]
}

```

webpack 配置：

```js
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader'
                    }
                }
```
