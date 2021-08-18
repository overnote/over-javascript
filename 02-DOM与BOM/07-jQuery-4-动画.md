# 07-jQuery-4-动画

## 一 jQuery 动画

### 1.1 显示/隐藏 show/hide

```js
$(selector).show() //作用同于 css(“display”, ”block”)
$(selector).show(2000) //带参，表示 多少毫秒内执行完毕
$(selector).show(2000, function () {}) //支持执行完毕后的回调函数
$(selector).show('slow') //常用参数值

//hide用法同上
```

### 1.2 滑入/滑出 slideDown/slideUp

该方法可以让元素采用下拉/上拉效果展示/隐藏

```javascript
$(selector).slideDown(speed, callback)
$(selector).slideUp(speed, callback)
$(selector).slideToggle(speed, callback) //滑入滑出切换动画效果
```

注意：以上方法省略参数或者传入不合法的字符串，那么则使用默认值：400 毫秒

### 1.3 淡入/淡出 fadeIn/fadeOut

```javascript
$(selector).fadeIn(speed, callback)
$(selector).fadeOut(1000)
//淡入淡出切换动画效果：通过改变透明度，切换匹配元素的显示或隐藏
$(selector).fadeToggle('fast', function () {})
```

### 1.4 改变透明度 fadeTo

与淡入淡出的区别：淡入淡出只能控制元素的不透明度从 完全不透明 到完全透明；而 fadeTo 可以指定元素不透明度的具体值。时间参数是必需的！

```javascript
// 参数一：时长， 参数二：不透明度值，取值范围：0-1
$(selector).fadeTo(1000, 0.5) //  0全透，1全不透

// 第一个参数为0，此时作用相当于：.css(“opacity”, .5);
$(selector).fadeTo(0, 0.5)
```

### 1.5 停止动画

如果一个以上的动画方法在同一个元素上调用，那么对这个元素来说，后面的动画将被放到效果队列中。这样就形成了动画队列， 动画队列里面的动画不会执行，直到第一个动画执行完成。所以有时候需要停止动画：

```javascript
$(selector).stop(clearQueue, jumpToEnd)
//参数一：表示后续动画是否终止，默认false代表不阻止后续动画执行
//参数二：表示当前动画是否终止，默认false代表终止当前动画。
//案例：
$(selector).stop().slideDown() //先停止别人的动画，再执行自己的动画。
```

案例：鼠标离开时停止动画

```js
$('#test').hide(500).stop()
```

注意：如果元素动画还没有执行完，此时调用 sotp()方法，那么动画将会停止。并且动画没有执行完成，那么回调函数也不会被执行。

### 1.6 自定义动画

自定义动画：执行一组 CSS 属性的自定义动画

```javascript
//第一个参数 : {} 运动的值和属性
//第二个参数 : 时间(运动快慢的) 默认 : 400，可选
//第三个参数 : 运动形式 只有两种：swing(慢快慢，默认) linear(匀速) ，可选
//第四个参数 : 回调函数，可选

$(this).animate({ width: 300 }, 4000, 'linear', function () {
  alert(123)
})
```

注意：所有能够执行动画的属性必须只有一个数字类型的值，比如：要改变字体大小，要使用：fontSize（font-size），不要使用：font
