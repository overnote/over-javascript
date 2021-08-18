# 07-jQuery-6-优化与技巧

## 一 性能优化

### 1.1 选择器使用

不同的选择器，jQuery 底层使用的实现方式也是不同的，`$(#id)`使用的是原生的 `document.getElementById()`方法，而`$(.class)`在 IE8 中使用的 DOM 搜索到的数组查询结果。

### 1.2 缓存 DOM 对象

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

### 1.3 循环操作 DOM

循环操作 DOM 是对性能影响极大的操作，在 jQuery 中也不例外，比如需要创建 100 个列表，可以先生成列表，最后 append：

```js
var list;
for (var i = 0; i < 100; i++>){
  list += '<li>' + i + '</li>'
}

$(#div).html(list)
```

### 1.4 使用 join 拼接字符串

处理长字符串时，join 的性能往往比直接使用 + 号更高：

```js
var list = [];
for (var i = 0; i < 100; i++>){
  list[i] = '<li>' + i + '</li>'
}

$(#div).html(list.join(''))
```

## 二 常用技巧

### 2.1 输入框文字获取和失去焦点

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

### 2.2 判断浏览器类型

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

### 2.3 返回头部的滑动动画

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

### 2.4 设置 div 在屏幕中央

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

### 2.5 获取选中下拉框

```js
$('#someElement').find('option:selected')
$('#someElement option:selected')
```

### 2.6 切换复选框

```js
var tog = false
$('button').click(function () {
  $('input[type=checkbox]').attr('checked', !tog)
  tog = !tog
})
```

### 2.7 选择同辈元素

```js
$('#nav li').click(function () {
  $(this).addClass('active').siblings().removeClass('active')
})
```
