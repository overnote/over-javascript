# 01-canvas 简介

## 一 简介

canvas 是 html5 的一个画布标签，可以使用 JavaScript 在网页上绘制图像。
画布是一个矩形区域，我们可以控制其每一像素。canvas 拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法。

注意：**IE8 不支持 canvas！**，此时会显示`后备文本`，即显示 canvas 标签内的文本。
想要 I8 以下支持 canvas 的话，有两个选择：一是使用 explorecanvas，另一个是使用 Google Chrome Frame

## 二 基本用法

示例代码：

```html
<style>
    /* canvas 可以直接设置大小等属性 */
    #mycanvas {
        width: 600px;
        height: 300px;
        background-color: #fff;
    }
</style>

<body>
    <canvas id="mycanvas">不兼容时显示该文字！</canvas>
    <script>
        let mycanvas = document.querySelector('#mycanvas')
        // 获得 canvas 上下文
        let ctx = mycanvas.getContext('2d')
        // ctx保存绘制环境，使用ctx绘制
        ctx.fillStyle = 'rgb(0,0,200)'
        ctx.fillRect(0, 0, 100, 100)
    </script>
</body>
```

canvas 元素实际上有两套尺寸，一个是元素本身大小，一个是元素绘制表面的大小：

-   直接设置 width 和 height 属性修改大小时，实际上是同时修改了该元素本身的大小和元素绘制表面的大小。
-   通过 css 来设定 canvas 大小，只会改变元素本身大小，不会改变元素绘制表面大小。
-   当 canvas 大小不符合绘制表面大小时，浏览器就会对绘制表面进行缩放；

## 三 相关网址

-   [基于脚本的定时动画控制](https://www.w3.org/TR/animation-timing/)：使用 window.requestAnimationFrame()来制作基于网络的动画，这适用于对性能要求很高的动画。
