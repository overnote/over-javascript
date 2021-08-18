# 02-选择器

## 一 常见选择器

```css
/* CSS2 */
*                   /* 通配符选择器 */
#div                /* id选择器 */
.box                /* 类名选择器 */
div                 /* 标签选择器 */
div p               /* 后代选择器：所有后代 */
div.box             /* 交集选择器 */
div,p,span          /* 并集选择器 */

/* CSS3 */
div>p               /* 子代选择器：直接后代 */
div+p               /* 选中div后同级第一个p */
div~p               /* 选中div后同级所有p */
```

## 二 属性选择器

通过属性来选择元素，具体有以下 5 种形式：

```css
/* CSS2 */
E[attr]               /* 属性名=attr的div */
E[attr="value"]       /* 属性attr值=value的div */

/* CSS3 */
E[attr~="value"]      /* 属性值包含value字符 */
E[attr*="value"]      /* 属性值包含value字符并且在 任意 位置 */
E[attr^="value"]      /* 属性值包含value字符并且在 开始 位置 */
E[attr$="value"]      /* 属性值包含value字符并且在 结束 位置 */
E[attr|="value"]      /* 属性值是value或以 value- 开头的值（比如说zh-cn） */
```

示例：选择以 icon 开头的

```html
<style>
  div[class=^'icon'] {
    color: red;
  }
</style>
```

## 三 伪类选择器

伪类选择器的作用是为一些元素添加特殊效果，这些效果一般会根据用户的行为而进行动态改变：

```css
E:link {
} /* 超链接默认状态，与a{}一样 */
E:visited {
} /* 超链接访问过后的样式 */
E:hover {
} /* 鼠标放到超链接上的样式 */
E:active {
} /* 超链接激活状态下的样式 */

E:focus {
} /* 获取焦点的时候的样式 */
```

示例：

```css
/* 链接伪类的书写顺序最好为：lvha */
a:link:hover {
  color: red;
}
```

CSS3 添加了一些新的伪类，如 input 相关，target 伪类，取反伪类。

表单相关伪类（结合锚点进行使用，处于当前锚点的元素会被选中）：

```css
E:required
E:enabled
E:disabled
E:checked

/* 示例，选择 <input type="text" required>*/
input:required {
}
```

`:target` 伪类匹配的元素需要有 id 属性，用来匹配浏览器中的哈希值

```css
/* 网址为： demo.com/#blue 此时选中 .div 的标签中 id="blue" 的元素 */
.div:target {
}
```

`:not` 伪类用来取反：

```js
div:not(.box) {
     background-color: #2aabd2;
}
```

## 四 结构伪类选择器

CSS3 中新增的结构伪类选择器以某元素相对于其父元素或兄弟元素的位置来获取元素。

```css
/* CSS2 */
E:first-child           /* 第一个子元素 */
E:last-child            /* 最后一个子元素 */

/* CSS3 */
E:nth-child(n)          /* E元素的所有子元素，n为第几个 */
E:nth-last-child(n)     /* 同E:nth-child(n) 相似，只是倒着计算 */

E:nth-of-type(n)        /* E元素的所有子元素中，所在类型的第n个元素 */
E:nth-last-of-type(n)   /* 同上，从后向前计算 */

E:empty                 /* 没有任何子节点（包括空格）的E元素,(子节点包含文本节点) */
```

注意：

- n 遵循线性变化，其取值是：0、1、2、3、4....。n<=0 时选取无效。
- n 可以是多种形式：`nth-child(2n)`、`nth-child(2n+1)`、`nth-child(-1n+5)`、`nth-last-child(-1n+5)`(后五个)等；
- n 可以是特殊字符：`even`(偶数)、`odd`(奇数)

示例：

```html
<style>
  div span:nth-of-type(1) {
    background-colr: pink;
  }
</style>

<div>
  <p>第一个</p>
  <span>111</span>
  <span>222</span>
  <span>333</span>
</div>
```

## 五 伪元素选择器

伪元素选择器用于在选中元素的前、后插入一个行内元素！！该选择器用于不想给页面添加 HTML 标记的场景，示例：

```html
<style>
  div::before {
    content: '你';
  }
</style>

<div>好</div>
```

在上述示例中，浏览器会显示："你好"。
