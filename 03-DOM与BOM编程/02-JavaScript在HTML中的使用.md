# 02-JavaScript 在 HTML 中的使用

## 一 script 标签标签

### 1.1 在 HTML 中使用 JavaScript

要在 HTML 文档中使用 JavaScript，需要插入 `<script>` 标签，有三种书写方式：

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

一般推荐使用外联式，因为这样可以显著**提升代码的可维护性**，并能**让 JS 文件在浏览器中获得缓存**（多个页面用到了同一个 JS 文件时，JS 文件只需要下载一次！）。

注意：script 标签中的代码不能出现 `</script>`，需要转义为：`<\/script>`

### 1.2 script 标签属性

script 标签常用的属性有：

- src：表示要包含的外部文件
- type：表示脚本语言类型（MIME），默认都是 `type="application/javascript"`，该属性已经替代了 `language` 属性，如果值为 `application/module` 则代表代码是 ES6 模块，代码中可以出现 import 和 export 关键字
- crossorigin：可选。默认值为 `anonymous`，即不使用 CORS，值为 `use-credentials` 表示需要设置凭据，即出站请求会包含凭据
- integrity：可选。允许比对接收到的资源和指定的加密签名，以验证子资源完整性，若不匹配，则页面报错。该属性常用于确保 CDN 不会提供恶意内容

script 上设置文件加载行为的属性（只对外部文件有效）：defer、async。

- defer：可选，表示立即下载脚本，但脚本延迟到文档解析、显示后再执行。写法：`defer="defer"`，H5 中简写为：`defer`。
- async：可选，表示立即下载脚本，且不阻止其他页面动作如：下载资源、等待其他脚本加载。这是 H5 新增属性，写法：`sync=sync`

其他废弃或无用属性有：`charset`、`language`，浏览器几乎不会在意这些值。

贴士：src 属性指定的路径文件内容会以 GET 请求结果形式返回，且该请求不受浏览器的同源策略影响，这是 script 标签还有一个极其强大的能力，可以用来加载外部代码，但是我们必须确保域是自己的，或者域是可信来源，`integrity` 属性就是用来防范这个问题的。

页面中也可以插入多个 script 标签，当没有 `defer`、`async` 属性限制时，这些脚本代码会被从上到下解析，下一个脚本必须等待上一个脚本执行完毕后才会执行，依次类推。

## 二 script 脚本的执行

### 2.1 script 元素的位置

在传统做法中，所有的 script 元素都放在页面的 head 元素中，如下所示：

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

### 2.2 defer 延迟脚本

defer 属性告诉浏览器立即下载 JS 外部文件并延迟执行，脚本会被延迟到整个页面都解析完毕后再运行，这样做不会改变页面的结构：

```html
<!--XHTML-->
<script src="./demo1.js" defer="defer"></script>
<!--HTML5-->
<script src="./demo2.js" defer></script>
```

此时这个 script 元素即使在 head 元素中，脚本的执行仍然需要等到网页完全呈现后才会执行。

在 HTML5 规范中，上述 2 个脚本会在 DOMContentLoaded 事件触发前按照顺序执行，但是现实往往不尽人意，他们的执行顺序并不固定，也并不一定都在 DOMContentLoaded 事件触发前执行，所以在使用延迟脚本时，推荐 html 页面中只包含一个延迟脚本。

### 2.3 async 异步脚本

**async 属性的作用是告诉浏览器不必等待脚本的下载、执行，可以直接加载页面！**

异步脚本 async 属性是 H5 中的规范，该属性与 defer 类似，会告诉浏览器立即下载文件，但是 async 脚本用于不让页面等待两个脚本的下载执行，同时也不保证执行的顺序。所以如果要引入多个异步脚本，要确保脚本之间没有依赖关系！也建议异步脚本不要在加载期间修改 DOM。

```html
<!--XHTML-->
<script src="./demo1.js" async="async"></script>
<!--HTML5-->
<script src="./demo2.js" async></script>
```

async 脚本会在页面的 load 事件前执行，但可能会在 DOMContentLoaded 事件触发前、后都有可能执行。

### 2.4 实际开发中的使用

多个脚本在引入时，会按照引入顺序依次执行。defer 属性支持下，可以将 js 放在顶部，且多个 JS 文件在下载后会按照顺序执行，但是大多浏览器都不支持顺序执行！！sync 属性由于是异步下载，更不可能按照顺序执行了！所以为了保证顺序，可以不使用 defer、async，把标签都统一放在 body 底部即可！

## 三 动态加载脚本

利用 DOM 的 API，可以动态插入一个脚本：

```js
let script = document.createElement('script')
script.src = 'demo.js'
// 兼容设置：防止浏览器不支持async
script.async = false
//追加脚本
document.head.appendChild(script)
```

浏览器的预加载机制无法识别以这种方式获取到的资源，如果影响到了性能，则可以在文档头部显式声明：

```html
<link rel="preload" href="demo.js" />
```

## 四 noscript 标签

浏览器目前都已支持 JS，所以 noscript 标签的使用场景基本没有了，但是如果浏览器禁用了 JS，则该标签仍然有用，此时浏览器会渲染该标签内的内容：

```html
<noscript> <p>浏览器不支持JavaScript</p></noscript>
```
