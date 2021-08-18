# 02-工作流工具-Gulp

## 一 Gulp 概念

Gulp 的作用：

- 对 HTML/CSS/JS 等文件进行压缩合并
- 语法转换：es6 转换为 es5，less 转换为 css
- 公共文件抽取

Gulp 也提供了大量的插件来完成更多、更复杂的任务。

## 二 Gulp 使用

### 2.1 Gulp 基础示例

```txt
第一步：本地安装gulp。进入项目文件夹后执行下列操作
npm i gulp -D

第二步：在根目录创建配置文件 gulpfile.js
    const gulp = require('gulp');
    //创建一个默认任务
    gulp.task('default',function () {
        console.log("hello gulp");
    });

第三步：执行命令。这里要注意如果npm版本小于5.2，则不支持npx命令，需要全局安装一次gulp，然后直接运行gulp命令即可
npx gulp default // 由于default是默认任务，这里可以省略
```

### 2.2 使用 Gulp 创建任务

示例：

```js
const gulp = reuqire('gulp')

gulp.task('copyJS', function () {
  // 定义一个任务，名称为 copyJS
  gulp
    .src('src/js/**/*.js') // src()获取资源路径
    .pipe(gulp.dest('dist/')) // pipe()将资源传输给插件。dest()资源构建完毕后自动创建的路径
})
```

gulp.src() 也可以使用[]参数/正则，!表示不匹配， \*\*代表递归：

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
  //src下文件发生改变，自动执行default任务
  gulp.watch('src/*', ['default'])
})
```

不同任务间存在依赖关系时，可以指定依赖，如下图：

```js
gulp.task('less', ['依赖1', '依赖2', '依赖3'], function () {})
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
gulp-less   编译LESS文件
gulp-cssmin   压缩CSS
gulp-rname  重命名
gulp-imagemin  图片压缩
gulp-uglify   压缩JS
gulp-concat   合并
gulp-htmlmin  压缩HTML
gulp-autoprefixer 添加CSS私有前缀
gulp-rev   添加版本号
gulp-rev-collector 内容替换
gulp-connect  创建服务器，默认监听8080端口
gulp-useref
gulp-if
```
