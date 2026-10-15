## 慎用will-change属性提高动画性能

will-change 会导致 GPU 开销，非必要情况下，普通动画无需开启，一旦匹配will-change属性的元素较多，性能开销就很大：

```css
.will-change {
  will-change: transform;
  transition: transform 0.3s;
}
.will-change:hover {
  transform: scale(1.5);
}
```

上述代码推荐修改为：在父元素的:hover伪类状态中声明will-change属性，这样鼠标指针移出当前元素的时候会自动清除GPU开销。

```css
.will-change-parent:hover .will-change {
  will-change: transform;
}
.will-change {
  transition: transform 0.3s;
}
.will-change:hover {
  transform: scale(1.5);
}
```

贴士：不能在当前元素的:hover伪类中设置will-change属性。

如果使用JavaScript代码添加will-change属性，则事件结束或动画完毕的时候一定要及时清除will-change属性：

```js
dom.onmousedown = function () {
  target.style.willChange = 'transform'
}
dom.onclick = function () {
  // target元素执行动画
}
target.onanimationend = function () {
  // 动画结束，用回调函数移除will-change属性
  this.style.willChange = 'auto'
}
```

## 解contain属性

在默认情况下，页面 DOM 树的某一个节点样式变化，会触发整个文档树的重绘和重计算，这是DOM渲染最大的性能开销。contain属性用于提高Web页面的渲染性能：它可以让局部的DOM树结构成为一个独立的部分，和页面其他的DOM树结构完全隔离，这样在这部分内容发生变化的时候，重绘与重计算只会在这个局部DOM树结构内部发生。于是，性能就会有非常显著的提升。contain属性非常适合用在复杂页面的某个小组件上，可以有效避免“牵一发而动全身”的情况出现。

contain 有四种限制类型：

- Size Containment
- Layout Containment
- Style Containment
- Paint Containment

对应语法：

```css
contain: none;
contain: strict;
contain: content;
contain: [ size || layout || style || paint];
```

strict表示对除style类型以外的类型都进行限制。此属性值等同于contain: size layout paint的设置。

content表示对除size和style类型以外的类型都进行限制。此属性值等同于contain: layout paint，表现为元素内内容渲染，元素外内容不渲染。

### Size Containment

`<img src="1.jpg">` 默认情况下会依据图片大小进行渲染，而加入了宽高就会让 img 元素的尺寸不会发生变化，即对其尺寸做了限制。
尺寸现在的实现机制就是：浏览器会无视元素内的内容，所以，SizeContainment状态下的元素的content-box尺寸都是0×0，如果没有设置边框等样式，这个元素就是不可见的。因此，实际开发的时候，应用Size Containment的元素一定是需要设置具体的width和height属性的，也就是必须设置具体的尺寸值。

适合用Size Containment的场景是使用JavaScript根据包含块元素的尺寸设置内部元素尺寸，这样可以有效避免某种“无限循环”，比如：

inline-block水平的元素的尺寸是根据元素里面的内容决定的，现在希望元素里面内容的尺寸永远比inline-block的尺寸小1px。按照字面上的需求，我们可以先使用JavaScript获取inline-block水平的尺寸，再去修改元素里面子元素的尺寸。但是，这种做法会带来一个问题，那就是inline-block的尺寸是根据元素里面子元素的尺寸变化的，如果子元素尺寸变小了，inline-block元素的尺寸也要变小，就会无限循环下去。

贴士：内部display类型是table的元素，`<td>、<th>、<tr>` 这些内部表格元素，常规的内联元素以及设置了display:contents和display:none的元素都不支持持Size Containment。

### Layout Containment

Layout Containment 会对元素的形成封闭效果：

- 会形成一个全新的包含块，无论是绝对定位元素还是固定定位元素的left和top偏移都会相对于这个包含块元素计算。transform属性也有这个特性，在transform属性值不是none的元素中的固定定位元素的样式表现如同绝对定位。contain:layout也可以让设置了position:fixed的固定定位元素像绝对定位元素那样表现，即left和top值是相对于设置了contain:layout的元素偏移的，而不是相对于浏览器窗体的，并且元素可以滚动，而不是位置固定。
- 会创建一个全新的层叠上下文，除了可以改变元素重叠时的层级表现，还可以限制混合模式等CSS特性的渲染范围。
- 会创建一个新的块状格式化上下文（Block Formatting Context，BFC），因此，Layout Containment状态下的元素是不会受到浮动元素干扰的。

贴士：Layout Containment同样对隐藏元素、表格元素（不包括table-cell元素）和纯内联元素无效。

### Style Containment

Style Containment 是指对CSS计数器、content 内容的特性进行限制：

- CSS计数器属性counter-increment和counter-set受到整个DOM树中的计数器影响
- open-quote、close-quote、no-open-quote和no-close-quote

例如，父元素执行一次counter-increment，子元素又执行一次counter-increment，则最终的计数值是父、子元素的累加值。但是，如果设置了Style Containment，则计数范围就会被限定在元素的子树上，而不是整个树。

```css
<div > </div > body {
  counter-reset: n 2;
}
div {
  contain: style;
  counter-reset: n;
}
div::before,
div::after {
  content: counters(n, '.') ' ';
}
div::after {
  counter-increment: n 2;
}
```

在这个例子中，counter-reset属性被限制在了div元素的子树中，外部元素设置的同名counter-reset则会被忽视，因此，最终并不会出现序号级联的效果。但是，如果删除contain:style
这段CSS样式，则计数器的范围限制就没有了，于是就有了序号级联的效果。

### Paint Containment

Paint Containment 和Layout Containment作用类似，都会成为绝对定位和固定定位元素的包含块，会创建新的层叠上下文和格式化上下文。但 Paint Containment不会渲染任何包含框以外的内容，哪怕overflow属性值是visible；并且Paint Containment依然会保留溢出内容对布局的影响（例如会改变元素的基线位置）：

```html
<button>基线对齐</button>
<p>
  紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁紫薯布丁
</p>

<style>
  p {
    display: inline-block;
    width: 150px;
    height: 36px;
    padding: 10px;
    background: skyblue;
  }
</style>
```

按钮就会和 p 元素保持基线对齐，而此时 p元素的基线就是内部文本的基线，然后给p元素设置contain:paint，结果溢出容器的文字内容直接不渲染了，表现为透明不可见：

```css
p {
  contain: paint;
}
```

## content-visibility

content-visibility属性可以让浏览器决定是否渲染视区以外的元素的内容，借此提高页面的渲染性能。比如：渲染时间是232 ms的网页使用content-visibility属性优化后可以降低到30 ms。

当浏览器决定不渲染某个元素里面的内容的时候，元素会开启Layout Containment、Style Containment和Paint Containment，如果元素没有设置具体的高、宽值，则尺寸可能是0。随着浏览器页面的滚动，元
素进入视区后会再次渲染，比不过此时就会出现内容跳动的情况，体验不好！

```css
section {
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
}
```
