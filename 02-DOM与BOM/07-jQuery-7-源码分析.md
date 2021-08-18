# 07-jQuery-7-源码分析

## 一 jQuery 的模块产生

在 jQuery 中，并没有 new 关键字来构建对象，而是直接这样写：

```js
$.('.div').css('width');
```

jQuery 是 JS 的第三方库，库在 JS 中可以理解为一个单独的模块，使用自执行函数就能模拟一个模块：

```js
// 基于jQuery1.X版本
;(function () {
  // do somethin
})(window)
```

jQuery 与\$两个变量可以直接调用，说明他们被挂载到了全局对象上：

```js
;(function (w) {
  var jQuery = function () {}

  // do something

  w.$ = w.jQuery = jQuery
})(window)
```

## 二 jQuery 对象的产生

\$既然可以直接使用，那么就相当于直接调用构造函数 jQuery 创建了实例，所以 new 关键字应该在 jQuery 函数中：

```js
(function(w){

    // jQuery 构造函数
    var jQuery = function(selector){
        // init 才是真正的构造函数
        return new jQuery.fn.init(selector);
    }

    jQuery.fn = jQuery.prototype = {
        constructor: jQuery,
        version: '1.0.0',
        init: function(selector){
            var elem, selector;
            elem = document.querySelector(selector);
            this[0] = elem;
            // jQuery 中返回的是一个由所有原型属性方法组成的数组，这里简化为this
            return this;
        }
    }

    // 现在可以在原型上添加方法了
    toArray: function(){};
    get: function(){};
    // ...

    // init方法的原型指向jQuery的原型
    jQuery.fn.init.prototype = jQuery.fn;

    w.jQuery = w.$ = jQuery;

})(window)
```

## 三 扩展插件的实现

jQuery 扩展插件的实现：

```js
;(function (w) {
  // ....

  jQuery.extend = jQuery.fn.extend = function (options) {
    var target = this // 根据参数进行判断，这里设定只有一种
    var copy
    for (v in options) {
      copy = options[name]
      target[name] = copy
    }
    return target
  }

  // 添加静态方法：也是工具方法
  jQuery.extend({
    isFunction: function () {},
    type: function () {},
    ajax: function () {},
    //....
  })

  // 添加原型方法
  jQuery.fn.extend({
    val: function () {},
    css: function () {},
    // ...
  })

  w.jQuery = w.$ = jQuery
})(window)
```
