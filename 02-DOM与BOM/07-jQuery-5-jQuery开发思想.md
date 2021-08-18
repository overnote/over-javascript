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
  console.log($('div')) // 3个全拿到了
  div.css('background', 'red') // 3个div全部被修改为了red
</script>
```

**获取索引号方式：`jQuery对象.index()`**

由于隐式迭代在方法的内部会为匹配到的所有元素进行循环遍历，执行相应的方法；而不用我们再进行循环，简化我们的操作，方便我们调用。
如果获取的是多元素的值，大部分情况下返回的是第一个元素的值。
但是有时候我们需要对获取的元素集合中每个元素做不同的处理，可以使用 each()方法：

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
    //  this 必须转换为 jQuery对象
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

// 此时只能使用 jQuery变量
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

`$`下的方法大多数为工具类方法，不仅可以给 jQuery 使用，也可以给原生 JS 使用，调用方式统一为：`$.方法()`

```js
// 拷贝
$.extend(target, result) // 浅拷贝：源对象的中的复杂数据类型只拷贝地址。同一层的数据如果有冲突会被合并
$.extend(true, target, result) // 深拷贝：完全把数据重新赋值一份给target

type() //判断类型，比如时间对象返回Date，而typeof返回的都是Object。

trim() // 去除空白

inArray() //类似indexOf();

proxy() //改变this指向

parseJSON() //将字符串数据转换成json对象

makeArray() //将类数组转换成真正的数组

map()

each()
```
