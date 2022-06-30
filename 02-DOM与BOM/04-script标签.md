# 04-script 标签

## 一 script 标签引入方式

JavaScript 的代码要被书写于脚本标签中，但是 HTML5 和 HTML4 的脚本标签规范不尽一致：

- HTML4 规范：`<script type="application/javascript"> </script>`
- HTML5 规范：`<script> </script>`

脚本标签有三种书写位置：

```html
<!-- 直接在 html 网页中书写代码，HelloWorld 中使用了内嵌式 -->
<script>
  console.log('Hello World!')
</script>

<!-- 推荐方式。代码位于专门的 js 文件，由脚本标签引入 -->
<script src="./hello.js"></script>

<!-- 极度不推荐。代码直接书写于 html 标签中 -->
<button onclick="fn()">登录</button>
```

一般推荐使用外联式，因为这样可以显著**提升代码的课维护性**，并能**让 JS 文件在浏览器中获得缓存**。

注意：script 标签中的代码不能出现 `</script>`，需要转义为：`<\/script>`

## 二 script 元素的一些属性

script 标签常用的属性有：

- src：表示要包含的外部文件。
- type：表示脚本语言类型，默认都是`type="application/javascript"`，该属性已经替代了 `language` 属性。
- defer：立即下载脚本，延迟到文档解析后执行。该属性值对外部文件有效。写法：`defer="defer"`，H5 中简写为：`defer`。
- async：立即下载脚本，且不阻止其他页面动作。该属性只对外部文件有效。写法：`sync="sync"`，H5 中简写为：`sync`。

注意：`type="application/module"`表示可以出现 import 和 export 关键字，代码被作为 ES6 模块使用。

## 三 script 元素的位置

在传统做法中，所有的 script 元素都应该放在页面的 head 元素中，如下所示：

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="./demo1.js"></script>
    <script src="./demo2.js"></script>
  </head>

  <body></body>
</html>
```

在 head 中引入 JS 外部文件，将会导致必须等到所有 JS 代码都被下载解析、执行完成后，才能呈现页面内容（body 标签），这样会严重影响用户体验，如果脚本文件过大，会导致网页打开时候出现一片空白。

为了避免上述现象，可以将 script 元素放在页面的底部：

```html
<!DOCTYPE html>
<html>
  <head></head>

  <body>
    <script src="./demo1.js"></script>
    <script src="./demo2.js"></script>
  </body>
</html>
```

贴士：多个脚本在引入时，会按照引入顺序依次执行。defer 属性支持下，可以将 js 放在顶部，且多个 JS 文件在下载后会按照顺序执行，但是大多浏览器都不支持顺序执行！！sync 属性由于是异步下载，更不可能按照顺序执行了！所以为了保证顺序，可以不使用 defer、async，把标签都统一放在 body 底部即可！

## 四 属性 defer 与 async

### 4.1 defer 延迟脚本

defer 属性表示告诉浏览器立即下载 JS 外部文件，但是会延迟执行 JS，即脚本会被延迟到整个页面都解析完毕后再运行。

```html
<script src="./demo1.js" defer="defer"></script>
<script src="./demo2.js" defer="defer"></script>
```

此时这个 script 元素即使在 head 元素中，脚本的执行仍然需要等到网页完全呈现后才会执行。在 HTML5 规范中，上述 2 个脚本需要按照顺序进行延迟执行，但是现实往往不尽人意，他们的执行顺序并不固定，所以在使用延迟脚本时，推荐 html 页面中只包含一个延迟脚本。

### 4.2 async 异步脚本

**async 属性的作用是告诉浏览器不必等待脚本的下载、执行，可以直接加载页面！**

异步脚本 async 属性是 H5 中的规范，该属性与 defer 类似，会告诉浏览器立即下载文件，但是 async 脚本用于不让页面等待两个脚本的下载执行，同时也不保证执行的顺序。所以如果要引入多个异步脚本，要确保他们互相之间不再依赖！也建议异步脚本不要在加载期间修改 DOM。

```html
<script src="./demo1.js" async></script>
<script src="./demo2.js" async></script>
```

注意：

- 异步脚本 async 一定会在页面的 load 事件前执行，但可能会在 DOMContentLoaded 事件触发前、后都有可能执行
- 延迟脚本 defer 在 H5 规范中要求要先于 DOMContentLoaded 事件执行，但是现实中不一定！
