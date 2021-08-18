# 01.1-HTML-HTML 概念

## 一 网页标准

### 1.1 网页的构成要素

网页的内容主要由三部分组成：**结构**、**表现**、**行为**。

> 结构：通过 HTML 实现，即 `Hyper text markup language` ，超文本标记语言，负责网页中各种标签内容的显示
> 表现：通过 CSS 实现，即 `Cascading Style Sheets`，层叠样式表，负责网页中各种样式的显示
> 行为：通过 JavaScript 实现，负责网页中各种行为的显示

### 1.2 网页规范

HTML 标准由 W3C 组织制定，经过多年发展，现在的标准版本为 HTML5，当然其兼容性仍然较差，市面上现有的 HTML 标准有：

- HTML4：被大多数浏览器所兼容
- XHTML：是 HTML4 与 XML 的过渡版本，不推荐使用
- XML：可以自定义标签，但是未被浏览器标准接受，被广泛应用于通信协议领域
- HTML5：具备划时代意义的 HTML 版本，已经被 Chrome、FireFox 等浏览器接受，但是很多场合兼容度较低，需要做兼容处理

### 1.3 HTML 网页结构

标准 HTML4 网页结构：

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head>
    <title>Document</title>
  </head>
  <body>
    hello world!
  </body>
</html>
```

HTML 文档整体两部分组成：

- 文档声明：`<!DOCTYPE html>`。用于帮助浏览器正确显示网页，即指示浏览器使用的是哪个 HTML 版本，声明必须放在第一行。
- 文档文本：由 `<html> </html>` 标签包裹，是 HTML 文档的内容展示区。其中 header 用于描述文档基本信息，body 是文档内容

文档声明现在默认使用 H5 标准即可，浏览器大多支持向下兼容，标准的 H5 网页如下所示：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    hello world!
  </body>
</html>
```

## 二 HTML 的基本结构

### 2.1 header

header 标签是网页头部，用于描绘网页的基础信息，其内部包含的标签有：

- link： 网页中引入的样式表、标题小图标
- meta： 网页的元信息
- title： 网页标题

link 用来引入外部资源，如浏览器标题小图标、css：

```html
<link rel="shortcut icon" href="favicon.ico" />
<link rel="stylesheet" href="1.css" />
```

meta 标签用来设置字符集、关键字、描述、重定向等，这些元信息并不是给用户看的，而是告诉浏览器、爬虫等如何显示等：

```html
<!-- 网页字符集 -->
<meta charset="utf-8" />
<!-- 网页关键字 -->
<meta name="keywords" content="流行资讯" />
<!-- 网页描述 -->
<meta name="description" content="最新服装设计流行信息" />
<!-- 2秒后跳转到1.html -->
<meta http-equiv="refresh" content="2; url=1.html" />
```

### 2.2 body

body 标签内的内容是网页的肢体信息，网页内容在这个地方显示：

```html
<body>
  网页内容....
</body>
```

## 三 HTML 网页代码优化

### 3.1 常见规范

CSS 推荐在 head 标签中引入，以让浏览器在输出 HTML 之前获取到样式信息，正确展示。

JS 推荐在 body 标签末尾引入，即页面显示后再载入脚本，可以加快页面呈现给用户的速度，也能正确让 js 操作页面中的元素。

开发中使用代码检查工具，如 ESLint 能够很好的检验代码规范。

一些常见贴士：

```txt
标题标签推荐使用 h1-h6
table 一定要使用 caption 设置表格题目
br 标签一般只用于文本内换行
```

### 3.2 标签嵌套规范

块级元素可以包含内联元素或者某些块级元素，但是内联元素不能包含块级元素，只能包含其他内联元素。

一些特殊的标签只能包含内联元素：`h1-h6`、`p`、`dt`。

ul 与 li，ol 与 li，dl 与 dt、dd 等有父子关系，父级下只能有其对应子标签。

a 标签不能嵌套 a 标签。

```html
<!--正确写法-->
<div><p></p></div>

<!--正确写法-->
<a><span></span></a>

<!--错误写法-->
<span><div></div></span>

<!--错误写法-->
<p><ol></ol></p>

<!--错误写法-->
<ul><div></div><li></li></p>
```

## 四 HTML 中的实体与实体编号

![HTML中的实体](../images/html/01.png)

## 五 编辑器的 emmet 语法

emmet 语法用于提升编辑器的操作速度，笔者这里是 vscode：

- 输入 div，tab 键可以直接输入完整的 div 标签
- 输入 html，tab 键可以直接输入完整的 html 文档
- 输入 `div*3`，tab 键可以直接输入 3 个 div
- 输入 `ul>li*3`， tab 键可以输入 ul/li，并有 3 个 li
- 输入 div+p， tab 键可以输入 div 与 p 两个兄弟节点
- 输入 .demo， tab 键可以直接输入 `<div class="demo"></div>`，类似的也支持 #
- 输入 `.demo\$*3`， tab 键可以为 class 类名做自增， class=demo1

## 六 其他语法

### 6.1 特殊字符

Html 中的特殊字符需要使用转义字符书写：

| 特殊字符 | HTML 中的表示 |
| -------- | ------------- |
| 空格     | `&nbsp;`      |
| <        | `&lt;`        |
| >        | `&gt`         |
| &        | `&amp;`       |

### 6.2 注释

```html
<!-- 这里书写注释 -->
```
