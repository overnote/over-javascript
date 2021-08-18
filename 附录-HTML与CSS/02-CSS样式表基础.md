# 01-CSS 样式表基础

## 一 CSS 简介

CSS 即层叠样式表/级联样式表（Cascading Style Sheets），用来描述网页结构（HTML）的样式。

CSS 目前的主流版本是 CSS2.1，该版本于 2002 年发布，是 CSS2.0 的补丁版本，并于 2011 年成为推荐版本。

CSS3 在 CSS2 基础上，增强或新增了许多特性，尤其是动画方面。目前浏览器支持程度差，需要添加私有前缀，但是移动端支持率较高。

CSS 是渐进推进的，其实不存在所谓的 CSS3，CSS3 只是一些级别独立的模块。

## 二 CSS 书写位置

CSS 代码有三种书写位置：行内式（不推荐）、内嵌式（偶尔使用）、外联式（推荐方式）。

行内式：通过给标签直接设置 style 属性来设置样式，样式与结构未分离，代码耦合严重，且会出现大量的代码冗余。

```html
<div style="color:pink; font-size:18px;">Hello</div>
```

内嵌式：在 head 标签内定义 style 标签，用来书写 CSS，初步实现了样式与结构分离，但只能控制一个页面。

```html
<head>
  <style type="text/css">
    /* type="text/css" 在CSS3中可以省略 */
    div {
      color: pink;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div>Hello</div>
</body>
```

外联式：在 head 标签内定义 link 标签，引入一个 css 文件，可以实现多页面样式的通用性！

```html
<head>
  <link rel="stylesheet" href="./1.css" />
</head>
```

外联式的第二种方式是利用@import：

```html
<style>
  /*@import 必须位于样式表开头*/
  @import url(base.css) all;
  @import './base.css' div {
    background-color: blue;
  } ;
</style>
```

link 与@import 的区别：

- 功能多样性不同：link 标签功能更多，可以加载 css、定义 rss、rel 等属性，@import 只能加载 CSS
- 加载书序不同：link 引入的内容与当前文档同时被加载，@import 引入的 css 将会在页面加载完毕后加载
- link 的样式权重大于@import 的权重

## 三 性能问题

将 CSS 的引入放置在 网页底部，即 body 末尾，可以制造延迟加载效果，但是这种方式只适合 JS 文件的引入，绝不适合 CSS。

**浏览器只有掌握了所有 CSS，才能知道把页面渲染成什么样子，从而一次性绘制！绝对不能一边加载新样式一边重新绘制页面，这会导致重排、重绘，引发严重性能问题**。

## 四 厂商前缀

厂商前缀即 CSS 样式前额外添加了标注，如：`-o-border-image`，表示 border-image 这个属性目前没被普遍接受，只在该 opera 浏览器下进行测试。

常用前缀有：

- `-epub`：国际数字出版社论坛定制 ePub 格式
- `-moz-`：firefox 前缀
- `ms`：微软 IE 前缀
- `-o-`：Opera 前缀
- `-webkit-`：基于 Webkit 的浏览器的前缀

## 五 CSS 注释

CSS 注释只能使用 `/* */` 编写。
