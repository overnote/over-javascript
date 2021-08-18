# 07-jQuery-3-事件

## 一 jQuery 事件机制

### 1.0 jQuery 的事件绑定发展历程

jQuery 的事件绑定方式有三种，随着版本迭代逐渐被最终的 on 方式取代：

```js
// 第一阶段：简单事件绑定，类似 click()
$('div').click(callback)

// 第二阶段：bind绑定，在 jQuery1.7 后被 on 取代
$('p').bind('click mouseenter', function (e) {})

// 第三阶段：delegate绑定
$('.parentBox').delegate('p', 'click', function () {
  //为 .parentBox下面的所有的p标签绑定事件
})

// 推荐方式：on
$(selector).on(events, [selector], callback)
```

### 1.2 on 支持绑定多个事件

on 方式比起简单绑定方式，支持一次性绑定多个事件：

```js
//on绑定事件书写方式一
$('div').on('click mouseover', function () {
  alert(123)
})

//on绑定事件书写方式二
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

### 1.3 on 支持事件委托

```js
//注册委托事件：让子元素li执行事件
$('ul').on('click', 'li', function () {
  alert(123)
})
```

### 1.4 on 支持给动态创建的元素绑定事件

```js
let li = $('<li>动态创建的li</li>')
$('ul')
  .append(li)
  .on('click', function () {})
```

### 1.5 jQuery 移除事件绑定

on 事件解绑：

```js
$(selector).off() // 解绑匹配元素的所有事件
$(selector).off('click') // 解绑匹配元素的所有click事件
$(selector).off('click', 'li') // 解绑事件委托
```

bind 与 delegate 事件的解绑：

```js
$(selector).unbind();           //解绑bind所有的事件
$(selector).unbind(“click”);    //解绑bing绑定的指定事件

$( selector ).undelegate();     //解绑所有的delegate事件
$( selector).undelegate( “click” ); //解绑所有的click事件
```

## 二 常见 jQuery 事件

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

## 三 Query 事件对象

jQuery 的事件对象 ev 已经是兼容的，常见属性：

```js
// 事件类型：click，dbclick…
event.type

event.pageX // 鼠标相对于文档左部边缘的位置，同理Y轴
event.clientX //相对于可视区，同理Y轴

// 按键相关
event.which // 鼠标的按键类型：左1 中2 右3
event.keyCode // 键盘按键代码

// 传递给事件处理程序的额外数据
event.data

// 等同于this，当前DOM对象
event.currentTarget
// 触发事件源，不一定===this
event.target

// 阻止行为
event.stopPropagation() // 阻止事件冒泡
event.preventDefault() // 阻止默认行为
```

## 三 事件触发

事件触发是指在某些场景下，让某个元素去执行事件。

```javascript
$(selector).click() //简单事件触发：触发 click事件
$(selector).trigger('click') //让元素触发click事件，和上述相同
$(selector).triggerHandler('click') //此方式不触发浏览器默认行为
```

## 四 阻止冒泡与默认行为

```javascript
event.stopPropagation() //阻止事件冒泡
event.preventDefault() //阻止默认行为
// 如果：return false 则直接阻止全部
```

## 五 节流阀

当类似 onkeydown 事件触发时，用户不停的按按按键，会反复触发，为了保证只触发一次，需要添加节流阀：

```js
//按下1-9这几个数字键，能触发对应的mouseenter事件
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
    //触发对应的li的mouseenter事件
    $('.nav li')
      .eq(code - 49)
      .mouseleave()
  }
})
```
