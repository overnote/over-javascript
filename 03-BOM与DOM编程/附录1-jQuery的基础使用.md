# 附录 1-jQuery 的基础使用

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
// DOM 对象转换为 jQuery 对象：
$(DOM对象)

// jQuery 对象转换为 DOM 对象：
let btn1 = jQuery对象[0] // 方式一：推荐
let btn2 = jQuery对象.get(0) // 方式二
```

## 四 jQuery 的基本选择器

### 4.1 基本选择器

```js
// id 选择器
$('#btn')

// 类选择器
$('.btn')

// 标签选择器
$('div')

// 交集选择器
$('.red.green') // 选择 class 为 red 且 green 的元素

// 并集选择器
$('.red,.green') // 选择 class 为 red 或 green 的元素
```

### 4.2 层级选择器

```js
// 后代选择器（空格）
$('#ul li') // 选择 id 为 ul 的元素的所有后代 li

// 子代选择器（>）
$('#ul > li') // 选择 id 为 ul 的元素的直系后代 li
```

### 4.3 筛选选择器

常见的筛选选择器：

```js
// 选择第一个元素
$('ul li:first') // 获取第一个 li 元素

// 选择最后一个元素
$('ul li:last') // 获取最后一个 li 元素

// 选择匹配索引的元素，索引从 0 开始
$('ul li:eq(2)') // 选择索引号为 2 的 li

// 选择匹配奇数索引元素
$('ul li:odd') // 选择奇数索引的的 li

// 选择匹配偶数索引元素
$('ul li:even') // 选择偶数索引的的 li
```

## 五 筛选方法

```js
// find() 查找所有后代元素
$('#j_wrap').find('li').css('color', 'red')

// children() 查找直接子代元素
$('#j_wrap').children('ul').css('color', 'red')

// parent() 查找父元素
$('#j_liItem').parent('ul').css('color', 'red') //选择 id 为 j_liItem 的父元素

// parents() 查找所有祖先节点：传入参数具备筛选功能（只有复合参数的祖先节点）
$('#j_liItem').parents('ul').css('color', 'red') //选择 id 为 j_liItem 的所有祖先元素

// siblings() 查找所有兄弟元素，不包括自己
$('#j_liItem').siblings().css('color', 'red')

// 查找所有兄弟节点：
nextAll() // 查找当前元素之后的所有兄弟元素
nextUntil() // 作用同上，可以传入参数，查找到指定位置
prevAll() // 查找当前元素之前的所有兄弟元素
prevUntil() // 作用同上，可以传入参数，查找到指定位置

// offsetParent() 获取有定位的父级
offsetParent()

// eq(index) 查找指定元素的第 index 个元素
$('li').eq(2).css('color', 'red') //选择所有 li 元素中的第二个

// 返回选择元素集合从第 start-end 位置的元素
slice(start, end)
```

## 六 常见操作

### 6.1 操作样式

注意：jQuery 操作类样式的时候，所有的类名都不带点

```js
// 获取样式
$(selector).css('font-size')

// 设置样式：可以设置单个、多个
$(selector).css({ color: 'red', 'font-size': '30px' }) // 引号、单位不写也可以

// 添加 class 名
$(selector).addClass('liItem')

// 移除样式：无参表示移除被选中元素的所有类名
$(selector).removeClass('liItem')

// 判断有没有类样式：返回 true 或 false
$(selector).hasClass('liItem')

// 切换类样式：该元素有类则移除，没有指定类则添加
$(selector).toggleClass('liItem')
```

### 6.2 操作属性

```js
// 操作元素固有属性
$(selector).prop('属性名') // 获取
$(selector).prop('属性名', '属性值') // 设置

// 操作元素自定义属性
$(selector).attr('属性名') // 获取
$(selector).attr('属性名', '属性值') // 设置
$(selector).attr('data-属性名') // 获取 H5 的自定 UI 属性，设置同理
$(selector).removeAttr('title') // 移除属性

// 将元素视为一个载体存储数据
$(selector).data('属性名', '属性值') // 存储一个数据在这个元素上
$(selector).data('属性名') // 获取
$(selector).data('自定义属性名') // 无需 data 开头，获取 H5 的自定 UI 属性，设置同理
```

### 6.3 操作节点

```js
//创建元素 $() 或者 节点.html()
let $spanNode = $("<span>我是一个 span 元素</span>");
let node = $("#box").html（"<li>我是 li</li>"）；

//添加子元素 append()
$(selector).append($node);              //追加传入 jQuery 对象
$(selector).append('<div></div>');      //直接传入 html 片段
appendTo(s)          //添加到 s 元素最后面，原生没有
prepend()           //添加到子元素最前面，类似原生的 appendChild()

//添加兄弟元素
after()             //添加到自己后面（作为兄弟）
before()            //添加到自己前面（作为兄弟）

//获取到的元素剪切到某个位置
nsertBefore()       //原生 JS 这里是选中后复制到某个位置
insertAfter()       //原生 JS 没有 insertAfter()

//html() val() text
html(): 没有参数是获取包含标签的内容，有参数是插入内容,
        设置内容时，如果是html标记，与原生 innerHTML相同
text(): 没有参数获取不包含标签的内容(字符串)，有参数是插入内容，
        设置内容时，类似原生innerText（火狐使用textContent获取），无视HTML标记插入纯文本，但是text()不存在兼容问题
val():  获取匹配元素的值，只匹配第一个元素，
        有参数时设置所有匹配到的元素的值

//删除与清空元素
$(selector).empty();        // 清空参数所有子元素，会清除事件，推荐使用
$(selector).html("");       // 同上，但元素事件不会被清空，会出现内存泄露
$(selector).remove();       // 删除元素与事件，包括自己，返回被删除的元素
$(selector).detach();       // 同上，但是会保留事件

//复制元素 clone()
$(selector).clone();        //复制匹配的元素，返回值为复制的新元素
$(selector).clone(true);    //同时复制操作行为

```

### 6.4 操作尺寸位置

```js
// 操作本身宽高，以下 width 同理 height 方法
$(selector).width() //获取高度，结果是数字类型
$(selector).width(200) //设置高度

// 操作 宽高 + padding。
$(selector).innerWidth() //获取 width+左右 padding

// 操作 宽高 + padding + border。
$(selector).outerWidth() // 原生的 outerWidth 无法获取隐藏元素的值，而 jQquery 可以

// 操作 宽高 + padding + border + margin
$(selector).outerWidth(true)

//  操作 offset 注意：设置 offset 后，如果元素没有定位 (默认值：static)，则被修改为 relative
$(selector).offset()
$(selector).offset({ left: 100, top: 150 })

// position() 获取相对于其最近的具有定位的父元素的位置，只能获取不能设置
$(selector).position() // 返回值为对象：{left:num, top:num}

// scrollTop() 获取或者设置元素垂直方向滚动的位置
$(selector).scrollTop(100) //无参数表示获取偏移，有参数表示设置偏移

// scrollLeft() :获取或者设置元素水平方向滚动的位置
$(selector).scrollLeft(100)

//总结：
$('div').offset() // 获取或设置坐标值，设置值后变成相对定位
$('div').position() // 获取坐标值 子绝父相只能读取不能设置

$('div').scrollTop() // 被卷曲的高度，即相对于滚动条顶部的偏移
$('div').scrolllLeft() // 被卷曲的宽度，即相对于滚动条左部的偏移
/*
垂直滚动条位置 是可滚动区域 在 可视区域上方的 被隐藏区域的高度。
如果滚动条在最上方没有滚动 或者 当前元素没有出现滚动条，那么这个距离为 0
*/
```

### 6.5 操作元素内容

```js
// 以 html 方式操作元素内容
$(selector).html() // 不传值用于获取内容，传值用于修改元素内的 html 结构

// 操作文本
$(selector).text()

// 获取表单值
$('input').val()
```

## 七 jQuery 事件机制

### 7.1 jQuery 的事件绑定发展历程

jQuery 的事件绑定方式有三种，随着版本迭代逐渐被最终的 on 方式取代：

```js
// 第一阶段：简单事件绑定，类似 click()
$('div').click(callback)

// 第二阶段：bind 绑定，在 jQuery1.7 后被 on 取代
$('p').bind('click mouseenter', function (e) {})

// 第三阶段：delegate 绑定
$('.parentBox').delegate('p', 'click', function () {
  //为 .parentBox 下面的所有的 p 标签绑定事件
})

// 推荐方式：on
$(selector).on(events, [selector], callback)
```

### 7.2 on 支持绑定多个事件

on 方式比起简单绑定方式，支持一次性绑定多个事件：

```js
//on 绑定事件书写方式一
$('div').on('click mouseover', function () {
  alert(123)
})

//on 绑定事件书写方式二
$('div').on({
  click: function () {
    alert(123)
  },
  mouseover: function () {
    alert(456)
  },
})

//绑定一次性事件
$('p').one('click', function () {
  alert($(this).text())
})
```

如果一个元素被父级绑定了委托事件，自己也绑定了普通事件，优先执行委托事件。
注意：on 还有一个可选参数 data，在事件函数内，data 的访问方式是：e.data

### 7.3 on 支持事件委托

```js
//注册委托事件：让子元素 li 执行事件
$('ul').on('click', 'li', function () {
  alert(123)
})
```

### 7.4 on 支持给动态创建的元素绑定事件

```js
let li = $('<li>动态创建的 li</li>')
$('ul')
  .append(li)
  .on('click', function () {})
```

### 7.5 jQuery 移除事件绑定

on 事件解绑：

```js
$(selector).off() // 解绑匹配元素的所有事件
$(selector).off('click') // 解绑匹配元素的所有 click 事件
$(selector).off('click', 'li') // 解绑事件委托
```

bind 与 delegate 事件的解绑：

```js
$(selector).unbind();           //解绑 bind 所有的事件
$(selector).unbind(“click”);    //解绑 bing 绑定的指定事件

$( selector ).undelegate();     //解绑所有的 delegate 事件
$( selector).undelegate( “click” ); //解绑所有的 click 事件
```

### 7.6 常见 jQuery 事件

常见 jQuery 事件：

```js
click(handler) // 单击事件
blur(handler) // 失去焦点事件
mouseenter(handler) // 鼠标进入事件
mouseleave(handler) // 鼠标离开事件
dbclick(handler) // 双击事件
change(handler) // 改变事件，如：文本框值改变，下来列表值改变等
focus(handler) // 获得焦点事件
keydown(handler) // 键盘按下事件
```

### 7.7 Query 事件对象

jQuery 的事件对象 ev 已经是兼容的，常见属性：

```js
// 事件类型：click，dbclick…
event.type

event.pageX // 鼠标相对于文档左部边缘的位置，同理 Y 轴
event.clientX //相对于可视区，同理 Y 轴

// 按键相关
event.which // 鼠标的按键类型：左 1 中 2 右 3
event.keyCode // 键盘按键代码

// 传递给事件处理程序的额外数据
event.data

// 等同于 this，当前 DOM 对象
event.currentTarget
// 触发事件源，不一定===this
event.target

// 阻止行为
event.stopPropagation() // 阻止事件冒泡
event.preventDefault() // 阻止默认行为
```

### 7.8 事件触发

事件触发是指在某些场景下，让某个元素去执行事件。

```javascript
$(selector).click() //简单事件触发：触发 click 事件
$(selector).trigger('click') //让元素触发 click 事件，和上述相同
$(selector).triggerHandler('click') //此方式不触发浏览器默认行为
```

### 7.9 阻止冒泡与默认行为

```javascript
event.stopPropagation() //阻止事件冒泡
event.preventDefault() //阻止默认行为
// 如果：return false 则直接阻止全部
```

## 八 节流阀

当类似 onkeydown 事件触发时，用户不停的按按按键，会反复触发，为了保证只触发一次，需要添加节流阀：

```js
//按下 1-9 这几个数字键，能触发对应的 mouseenter 事件
$(document).on('keydown', function (e) {
  if (flag) {
    flag = false
    //获取到按下的键
    let code = e.keyCode
    if (code >= 49 && code <= 57) {
      //触发对应的li的mouseenter事件
      $('.nav li')
        .eq(code - 49)
        .mouseenter()
    }
  }
})

$(document).on('keyup', function (e) {
  flag = true

  //获取到按下的键
  let code = e.keyCode
  if (code >= 49 && code <= 57) {
    //触发对应的 li 的 mouseenter 事件
    $('.nav li')
      .eq(code - 49)
      .mouseleave()
  }
})
```
