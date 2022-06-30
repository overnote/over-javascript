# 02-工作流工具-Gulp

## 一 工作流概念

在开发阶段，我们往往使用 ES6、less、coffeescript 来提升开发效率，但是这些文件不能直接部署在生产环境中，即在开发部署时，需要对 css、js 等文件执行编译、压缩等等一系列流程任务，我们称之为工作流。

人工处理这些任务的代价是很高的，利用构建工具可以编写一些任务，按照我们需要的流程来执行。

常见的处理任务包括：预处理语言的编译、代码压缩混淆、图片体积优化；

常见的构建工具包括：

- Grunt：已衰落
- Gulp：主流工作流工具，基于 NodeJS 开发的前端构建工具，国内还有对应产品 F.I.S（百度出品）。
- Webpack：也能承担一部分工作流任务，但其核心功能是打包。
- Rollup：适合打包第三方库的工具。
- Vite：新一代构建工具，性能更高，内部采用 ESBuilder。最大优点是：直接支持`hmr update`，速度极快。

贴士：Vue 的构建工具 Vue-cli 目前内部采用的仍然是 webpack，webpack 在开发时，从入口文件开始，将源码打包为一个文件，若某一个模块改变，webpack 也会根据路由变化进行差异化 build，但是 build 完之后，webpack 仍然需要将 build 完毕的内容替换进内存。

Vite 由于使用了 ES6 的模块化加载规则，浏览器原生支持，无需打包，在开发模式下不需要打包可以直接运行，速度极快。

## 二 工作流工具 Gulp

### 2.1 Gulp 基本使用

Gulp 的作用：

- 对 HTML/CSS/JS 等文件进行压缩合并
- 语法转换：es6 转换为 es5，less 转换为 css
- 公共文件抽取

Gulp 也提供了大量的插件来完成更多、更复杂的任务。

Gulp 基础示例：

```txt
第一步：本地安装 gulp。进入项目文件夹后执行下列操作
npm i gulp -D

第二步：在根目录创建配置文件 gulpfile.js
    const gulp = require('gulp');
    //创建一个默认任务
    gulp.task('default',function () {
        console.log("hello gulp");
    });

第三步：执行命令。这里要注意如果 npm 版本小于 5.2，则不支持 npx 命令，需要全局安装一次 gulp，然后直接运行 gulp 命令即可
npx gulp default // 由于 default 是默认任务，这里可以省略
```

### 2.2 使用 Gulp 创建任务

示例：

```js
const gulp = reuqire('gulp')

gulp.task('copyJS', function () {
  // 定义一个任务，名称为 copyJS
  gulp
    .src('src/js/**/*.js') // src() 获取资源路径
    .pipe(gulp.dest('dist/')) // pipe() 将资源传输给插件。dest() 资源构建完毕后自动创建的路径
})
```

gulp.src() 也可以使用 [] 参数/正则，! 表示不匹配， \*\*代表递归：

```js
gulp.src(['src/js/**/*.*', '!src/demo.html'])
```

执行任务：

```txt
npx gulp copyJS
```

### 2.3 Gulp 常见 API

- gulp.src()：获取资源文件
- gulp.dest()：输出资源文件
- gulp.task()：建立 gulp 任务
- gulp.watch()：监控文件变化
- gulp.pipe()：导出获取到的资源

watch 用于监视文件的改变，自动构建：

```js
gulp.task('js', function () {
  //src 下文件发生改变，自动执行 default 任务
  gulp.watch('src/*', ['default'])
})
```

不同任务间存在依赖关系时，可以指定依赖，如下图：

```js
gulp.task('less', ['依赖 1', '依赖 2', '依赖 3'], function () {})
```

### 2.4 Gulp 插件

Gulp 本身只有文件复制等基础 API，通过不同的插件实现构建任务，Gulp 只是按着配置文件调用执行了这些插件。

比如需要编译 less，需要先安装编译 less 的 gulp 插件：`npm install gulp-less -S`

```js
const gulp = require('gulp')
const less = require('gulp-less')

gulp.task('less', function () {
  gulp
    .src('src/**/*.less')
    .pipe(less()) // 调用插件
    .pipe(gulp.dest('dist/'))
})
```

常用 gulp 插件：

```txt
gulp-less   编译 LESS 文件
gulp-cssmin   压缩 CSS
gulp-rname  重命名
gulp-imagemin  图片压缩
gulp-uglify   压缩 JS
gulp-concat   合并
gulp-htmlmin  压缩 HTML
gulp-autoprefixer 添加 CSS 私有前缀
gulp-rev   添加版本号
gulp-rev-collector 内容替换
gulp-connect  创建服务器，默认监听 8080 端口
gulp-useref
gulp-if
```
