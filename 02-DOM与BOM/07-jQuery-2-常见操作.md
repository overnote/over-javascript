# 07-jQuery-2-常见操作

## 一 操作样式

注意：jQuery 操作类样式的时候，所有的类名都不带点

```js
// 获取样式
$(selector).css('font-size')

// 设置样式:可以设置单个、多个
$(selector).css({ color: 'red', 'font-size': '30px' }) // 引号、单位不写也可以

// 添加class名
$(selector).addClass('liItem')

// 移除样式：无参表示移除被选中元素的所有类名
$(selector).removeClass('liItem')

// 判断有没有类样式：返回true或false
$(selector).hasClass('liItem')

// 切换类样式：该元素有类则移除，没有指定类则添加
$(selector).toggleClass('liItem')
```

## 二 操作属性

```js
// 操作元素固有属性
$(selector).prop('属性名') // 获取
$(selector).prop('属性名', '属性值') // 设置

// 操作元素自定义属性
$(selector).attr('属性名') // 获取
$(selector).attr('属性名', '属性值') // 设置
$(selector).attr('data-属性名') // 获取H5的自定UI属性，设置同理
$(selector).removeAttr('title') // 移除属性

// 将元素视为一个载体存储数据
$(selector).data('属性名', '属性值') // 存储一个数据在这个元素上
$(selector).data('属性名') // 获取
$(selector).data('自定义属性名') // 无需data开头，获取H5的自定UI属性，设置同理
```

## 三 操作节点

```js
//创建元素 $() 或者 节点.html()
let $spanNode = $("<span>我是一个span元素</span>");
let node = $("#box").html（"<li>我是li</li>"）；

//添加子元素 append()
$(selector).append($node);              //追加传入jQuery对象
$(selector).append('<div></div>');      //直接传入html片段
appendTo(s)          //添加到s元素最后面，原生没有
prepend()           //添加到子元素最前面，类似原生的appendChild()

//添加兄弟元素
after()             //添加到自己后面（作为兄弟）
before()            //添加到自己前面（作为兄弟）

//获取到的元素剪切到某个位置
nsertBefore()       //原生JS这里是选中后复制到某个位置
insertAfter()       //原生JS没有insertAfter()

//html() val() text
html(): 没有参数是获取包含标签的内容，有参数是插入内容,
        设置内容时，如果是html标记，与原生 innerHTML相同
text(): 没有参数获取不包含标签的内容(字符串)，有参数是插入内容，
        设置内容时，类似原生innerText（火狐使用textContent获取），无视HTML标记插入纯文本，但是text()不存在兼容问题
val():  获取匹配元素的值，只匹配第一个元素，
        有参数时设置所有匹配到的元素的值

//删除与清空元素
$(selector).empty();        // 清空参数所有子元素，会清除事件，推荐使用
$(selector).html("");       // 同上，但元素事件不会被清空,会出现内存泄露
$(selector).remove();       // 删除元素与事件，包括自己，返回被删除的元素
$(selector).detach();       // 同上，但是会保留事件

//复制元素 clone()
$(selector).clone();        //复制匹配的元素，返回值为复制的新元素
$(selector).clone(true);    //同时复制操作行为

```

## 四 操作尺寸位置

```js
// 操作本身宽高，以下 width 同理 height 方法
$(selector).width() //获取高度，结果是数字类型
$(selector).width(200) //设置高度

// 操作 宽高 + padding。
$(selector).innerWidth() //获取width+左右padding

// 操作 宽高 + padding + border。
$(selector).outerWidth() // 原生的outerWidth无法获取隐藏元素的值，而jQquery可以

// 操作 宽高 + padding + border + margin
$(selector).outerWidth(true)

//  操作 offset 注意：设置offset后，如果元素没有定位(默认值：static)，则被修改为relative
$(selector).offset()
$(selector).offset({ left: 100, top: 150 })

// position() 获取相对于其最近的具有定位的父元素的位置,只能获取不能设置
$(selector).position() // 返回值为对象：{left:num, top:num}

// scrollTop() 获取或者设置元素垂直方向滚动的位置
$(selector).scrollTop(100) //无参数表示获取偏移,有参数表示设置偏移

// scrollLeft() :获取或者设置元素水平方向滚动的位置
$(selector).scrollLeft(100)

//总结：
$('div').offset() // 获取或设置坐标值，设置值后变成相对定位
$('div').position() // 获取坐标值 子绝父相只能读取不能设置

$('div').scrollTop() // 被卷曲的高度，即相对于滚动条顶部的偏移
$('div').scrolllLeft() // 被卷曲的宽度，即相对于滚动条左部的偏移
/*
垂直滚动条位置 是可滚动区域 在 可视区域上方的 被隐藏区域的高度。
如果滚动条在最上方没有滚动 或者 当前元素没有出现滚动条，那么这个距离为0
*/
```

## 五 操作元素内容

```js
// 以html方式操作元素内容
$(selector).html() // 不传值用于获取内容，传值用于修改元素内的html结构

// 操作文本
$(selector).text()

// 获取表单值
$('input').val()
```

## 六 常见案例

### 6.1 filter has not

```js
$('div').filter('#div1').css('background','red');
$('div').has('span').css('background','green');

filter()：  // 过滤
not()：     // filter的反义词
has()：     // has查看的是当前元素是否包含，filter过滤的是所有同级元素
```

### 6.2 全选/反选

```js
$(selector).prop('checked', true) //全选
$(selector).prop('checked', false) //全不选
```

### 6.3 快速操作表单 serialize

```html
<form>
    <input type="text" name="a" value="1">
<input type="text" name="b" value="2">
<input type="text" name="c" value="3">
</form>
<script>
    $(function(){

        let str = $('form').serialize());
        let arr = $('form').serializeArray();

        /*
        str = a=1&b=2&c=3
        arr = [
            { name : 'a' , value : '1' },
            { name : 'b' , value : '2' },
            { name : 'c' , value : '3' }
        ]
        */

    });

```
