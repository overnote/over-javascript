# 07-jQuery-1-基础使用

## 一 jQuery 简介

原生 JavaScript 在操作 DOM 时，相对复杂且有兼容性问题，为了提升开发体验，诞生了大量相关的库，如：Dojo、ExtJS 等，其中热度最高的当属 jQuery。

jQuery 很好的解决了原生 JavaScript 的痛点，如

- `window.onload` 事件只能出现一次，多次出现会覆盖之前的事件
- 兼容性复杂
- 简单功能原生实现复杂（比如各种循环，jQuery 隐式迭代帮我们做了）

现在 jQuery 也有很多版本，需要依据业务场景进行选择：

- 1.x 版本，兼容 IE6/7/8
- 2.x 版本，不兼容 IE6/7/8
- 3.x 版本，更精简，不再兼容低版 IE

jQuery 诞生于 2006 年，是一个非常轻量级的库，拥有很强的选择器、极便利的 DOM 操作、优秀的浏览器兼容性等，此外链式编程、插件支持等也是其亮点。在 jQuery 基础上，也有针对不同场景的库，如：jQueryUI、jQuery Mobile 等。

## 二 jQuery Hello World

示例：

```html
<div class="div">点击</div>
<script src="https://libs.baidu.com/jquery/1.11.3/jquery.min.js"></script>
<script>
  $(function () {
    $('.div').click(function () {
      alert('hello world!')
    })
  })
</script>
```

`$` 是 jQuery 提供的函数，业务代码写在该函数中即可，不过要注意的是 jQuery 的事件不带 on。

## 三 原生 JavaScript 与 jQuery 的区别

### 3.1 入口函数

原生 JavaScript 的入口函数是：`window.onload = function() { }`。

jQuery 的入口函数是：`$(function(){ })`，该方式其实是下列代码的简写：

```js
// 入口函数
$(document).ready(function () {
  // 业务代码
})
```

原生 JavaScrip 与 jQuery 的入口函数是有区别的：

- 执行时机不同：原生 JS 入口函数需要等待网页所有资源（包括图片）加载完成后才执行，而 jQuery 的入口函数是在 DOM 绘制完毕后即执行，此时 DOM 关联的东西可能没有加载完
- 编写个数不同：原生 JS 入口函数只能出现一次，出现多次会存在事件覆盖的问题，而 jQuery 入口函数可以书写多次，没有覆盖问题。

在大量图片的网页中，jQuery 这样的做法速度更快，但是也可能会出现图片相关的盒子宽高无法设置的问题，如果要让 jQuery 也等待全部资源加载完毕后操作 DOM，和原生 JS 入口函数一致，则可以使用：

```js
$(window).load(function () {})
```

### 3.2 jQuery 对象和 DOM 对象

使用 jQuery 选择器获取到的对象与原生的 DOM 对象是有区别的，**jQuery 获取的元素是对 DOM 对象包装后的伪数组**。

jQuery 这样做的目的是：封装后不需要大量重复的遍历，能够更加简便的实现兼容问题。

不过这样做也让 jQuery 对象完全无法使用原生 DOM 对象，需要转换之后才行：

```js
// DOM对象转换为jQuery对象：
$(DOM对象)

// jQuery对象转换为DOM对象：
let btn1 = jQuery对象[0] // 方式一：推荐
let btn2 = jQuery对象.get(0) // 方式二
```

## 四 jQuery 的基本选择器

### 4.1 基本选择器

```js
// id选择器
$('#btn')

// 类选择器
$('.btn')

// 标签选择器
$('div')

// 交集选择器
$('.red.green') // 选择class为red且green的元素

// 并集选择器
$('.red,.green') // 选择class为red或green的元素
```

### 4.2 层级选择器

```js
// 后代选择器（空格）
$('#ul li') // 选择id为ul的元素的所有后代li

// 子代选择器（>）
$('#ul > li') // 选择id为ul的元素的直系后代li
```

### 4.3 筛选选择器

常见的筛选选择器：

```js
// 选择第一个元素
$('ul li:first') // 获取第一个li元素

// 选择最后一个元素
$('ul li:last') // 获取最后一个li元素

// 选择匹配索引的元素，索引从0开始
$('ul li:eq(2)') // 选择索引号为2的li

// 选择匹配奇数索引元素
$('ul li:odd') // 选择奇数索引的的li

// 选择匹配偶数索引元素
$('ul li:even') // 选择偶数索引的的li
```

## 五 筛选方法

```js
// find() 查找所有后代元素
$('#j_wrap').find('li').css('color', 'red')

// children() 查找直接子代元素
$('#j_wrap').children('ul').css('color', 'red')

// parent() 查找父元素
$('#j_liItem').parent('ul').css('color', 'red') //选择id为j_liItem的父元素

// parents() 查找所有祖先节点:传入参数具备筛选功能（只有复合参数的祖先节点）
$('#j_liItem').parents('ul').css('color', 'red') //选择id为j_liItem的所有祖先元素

// siblings() 查找所有兄弟元素,不包括自己
$('#j_liItem').siblings().css('color', 'red')

// 查找所有兄弟节点：
nextAll() // 查找当前元素之后的所有兄弟元素
nextUntil() // 作用同上，可以传入参数，查找到指定位置
prevAll() // 查找当前元素之前的所有兄弟元素
prevUntil() // 作用同上，可以传入参数，查找到指定位置

// offsetParent() 获取有定位的父级
offsetParent()

// eq(index) 查找指定元素的第index个元素
$('li').eq(2).css('color', 'red') //选择所有li元素中的第二个

// 返回选择元素集合从第 start-end 位置的元素
slice(start, end)
```
