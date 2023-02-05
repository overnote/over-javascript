# 07-jQuery-5-jQuery 开发思想

## 一 编程思想

### 1.1 隐式迭代

> jQuery 的隐式迭代：jQuery 会在内部对每个匹配到的元素执行相应操作

jQuery 的选择器具备隐式迭代的特性，如下案例所示：

```html
<div>div1</div>
<div>div2</div>
<div>div3</div>

<script>
  let div = $('div')
  console.log($('div')) // 3 个全拿到了
  div.css('background', 'red') // 3 个 div 全部被修改为了 red
</script>
```

**获取索引号方式：`jQuery 对象.index()`**

由于隐式迭代在方法的内部会为匹配到的所有元素进行循环遍历，执行相应的方法；而不用我们再进行循环，简化我们的操作，方便我们调用。
如果获取的是多元素的值，大部分情况下返回的是第一个元素的值。
但是有时候我们需要对获取的元素集合中每个元素做不同的处理，可以使用 each() 方法：

```js
$('li').each(function (i, elem) {
  //i：下标 elem : 每个元素
  $(elem).html(i)
})
```

### 1.2 排他思想

示例：

```html
<div style="background-color: aqua;">div1</div>
<div style="background-color: aqua;">div2</div>
<div style="background-color: aqua;">div3</div>
<script src="https://libs.baidu.com/jquery/1.11.3/jquery.min.js"></script>
<script>
  // 当前元素变化背景，其余去掉颜色
  $('div').click(function () {
    //  this 必须转换为 jQuery 对象
    $(this).css('background', 'green')
    $(this).siblings('div').css('background', '')
  })
</script>
```

### 1.3 链式编程

链式编程原理是 `return this;`。

通常情况下，只有设置操作才能把链式编程延续下去。因为获取操作的时候，会返回获取到的相应的值，无法返回 this。

## 二 命名冲突问题

jQuery 的大量对象名都被限制在了自己的命名空间里，所以 jQuery 在与其他库一起使用时，一般不会引起命名冲突。

当然变量 `$` 的控制权也可以移交给其他库，有很多方案。

方案一：使用 jQuery 代替。

```js
// 将 $ 移交给其他库

jQuery.noConflict()

// 此时只能使用 jQuery 变量
jQuery(function () {
  // 函数内部仍然可以继续使用 $
  $('p').click(function () {
    console.log(1)
  })
})
```

方案二：另启一个变量代替 `$`。

```js
// $j  代替了 $
var $j = jQuery.noConflict()
```

方案三：传参

```js
jQuery.noConflict()
function ($) {
  $(function () {
    $('p').click(function () {
      console.log(1)
    })
  })
}
```

## 三 插件机制

jQuery 只提供了 DOM 等操作，复杂的操作依赖于大量的第三方插件，我们可以称之为 jQuery 的生态。

通过插件的方式，可以扩展 jQuery 的功能，常用的插件网址有：

- <http://www.htmleaf.com>
- <http://www.jq22.com>

案例：

```html
<script>
  $.extend({
    leftTrim: function (str) {
      return str.replace(/^\s+/, '')
    },
    rightTrim: function () {
      //方法体
    },
  })
</script>

<script>
  let str = ' hello '
  console.log($.leftTrim(str))
</script>
```

比较实用的 jQuery 插件是：表单验证插件 Validation、懒加载插件 EasyLazyLoad、全屏滚动插件 fullpage。

## 四 `$` 方法

`$`下的方法大多数为工具类方法，不仅可以给 jQuery 使用，也可以给原生 JS 使用，调用方式统一为：`$.方法 ()`

```js
// 拷贝
$.extend(target, result) // 浅拷贝：源对象的中的复杂数据类型只拷贝地址。同一层的数据如果有冲突会被合并
$.extend(true, target, result) // 深拷贝：完全把数据重新赋值一份给 target

type() //判断类型，比如时间对象返回 Date，而 typeof 返回的都是 Object。

trim() // 去除空白

inArray() //类似 indexOf();

proxy() //改变 this 指向

parseJSON() //将字符串数据转换成 json 对象

makeArray() //将类数组转换成真正的数组

map()

each()
```

## 五 性能优化

### 5.1 选择器使用

不同的选择器，jQuery 底层使用的实现方式也是不同的，`$(#id)`使用的是原生的 `document.getElementById()`方法，而`$(.class)`在 IE8 中使用的 DOM 搜索到的数组查询结果。

### 5.2 缓存 DOM 对象

获取到的 DOM 如果要反复使用最好使用变量保存，而不是一直重新获取：

```js
// 效率低的写法
$('#box').bind('click', function () {})
$('#box').css('border', '1px solid red')

// 效率高写法
var box = $('#box')
box.bind('click', function () {})
box.css('border', '1px solid red')

// 或者直接采用链式写法
$('#box')
  .bind('click', function () {})
  .css('border', '1px solid red')
```

### 5.3 循环操作 DOM

循环操作 DOM 是对性能影响极大的操作，在 jQuery 中也不例外，比如需要创建 100 个列表，可以先生成列表，最后 append：

```js
var list;
for (var i = 0; i < 100; i++>){
  list += '<li>' + i + '</li>'
}

$(#div).html(list)
```

### 5.4 使用 join 拼接字符串

处理长字符串时，join 的性能往往比直接使用 + 号更高：

```js
var list = [];
for (var i = 0; i < 100; i++>){
  list[i] = '<li>' + i + '</li>'
}

$(#div).html(list.join(''))
```

## 六 常用技巧

### 6.1 输入框文字获取和失去焦点

```js
$(document).ready(function () {
  $('input.text1').val('Enter your search text here')
  textFill($('input.text1'))
})
function textFill(input) {
  //input focus text function
  var originalvalue = input.val()
  input
    .focus(function () {
      if ($.trim(input.val()) == originalvalue) {
        input.val('')
      }
    })
    .blur(function () {
      if ($.trim(input.val()) == '') {
        input.val(originalvalue)
      }
    })
}
```

### 6.2 判断浏览器类型

```js
$(document).ready(function () {
  // Firefox 2 and above
  if ($.browser.mozilla && $.browser.version >= '1.8') {
    // do something
  }
  // Safari
  if ($.browser.safari) {
    // do something
  }
  // Chrome
  if ($.browser.chrome) {
    // do something
  }
  // Opera
  if ($.browser.opera) {
    // do something
  }
  // IE6 and below
  if ($.browser.msie && $.browser.version <= 6) {
    // do something
  }
  // anything above IE6
  if ($.browser.msie && $.browser.version > 6) {
    // do something
  }
})
```

### 6.3 返回头部的滑动动画

```js
jQuery.fn.scrollTo = function (speed) {
  var targetOffset = $(this).offset().top
  $('html,body').stop().animate({ scrollTop: targetOffset }, speed)
  return this
}
// use
$('#goheader').click(function () {
  $('body').scrollTo(500)
  return false
})
```

### 6.4 设置 div 在屏幕中央

```js
$(document).ready(function () {
  jQuery.fn.center = function () {
    this.css('position', 'absolute')
    this.css(
      'top',
      ($(window).height() - this.height()) / 2 + $(window).scrollTop() + 'px'
    )
    this.css(
      'left',
      ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + 'px'
    )
    return this
  }
  //use
  $('#XY').center()
})
```

### 6.5 获取选中下拉框

```js
$('#someElement').find('option:selected')
$('#someElement option:selected')
```

### 6.6 切换复选框

```js
var tog = false
$('button').click(function () {
  $('input[type=checkbox]').attr('checked', !tog)
  tog = !tog
})
```

### 6.7 选择同辈元素

```js
$('#nav li').click(function () {
  $(this).addClass('active').siblings().removeClass('active')
})
```
