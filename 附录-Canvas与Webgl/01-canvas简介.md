# 01-canvas 简介

## 一 canvas 简介

canvas 是 html5 的一个画布标签，即一个矩形区域，可以控制其每一个像素，从而实现在网页绘制图像的功能。

注意：**IE8 不支持 canvas！**，此时会显示`后备文本`，即只会显示 canvas 标签内的文本。如果需要 IE8 以下浏览器支持 canvas，可以使用：

-   explorecanvas
-   Google Chrome Frame

与 Flash 相比，Canvas 更加轻量，使用 Canvas 绘制图形，在绘制成功后，canvas 就会像素化，无法修改，只能通过 API 得到画布的内容再次绘制。所以 canvas 图形如果要实现动画，需要的编程逻辑是：清屏-更新-重新渲染。

## 二 基本用法

示例代码：

```html
<canvas id="mycanvas" width="600" height="600">不兼容时显示该文字！</canvas>
<script>
    // 获得 canvas 上下文
    let ctx = document.querySelector('#mycanvas').getContext('2d')
    // ctx保存绘制环境，使用ctx绘制
    ctx.fillStyle = 'rgb(0,0,200)'
    ctx.fillRect(0, 0, 100, 100)
    setTimeout(() => {
        // 清除画布：0,0 代表从何处开始清除，600,600代表清除的位置和高度
        ctx.clearRect(0, 0, 600, 600)
    }, 5000)
</script>
```

canvas 元素本身拥有属性 width、height，不推荐使用 css 控制，会引起形变、失真，这是因为 canvas 元素实际上有两套尺寸：

-   元素本身大小：由 CSS 控制
-   元素绘制表面的大小：CSS 无法控制

canvas 的 width、height 属性会同时修改了该元素本身的大小和元素绘制表面的大小。

## 三 相关网址

-   [基于脚本的定时动画控制](https://www.w3.org/TR/animation-timing/)：使用 window.requestAnimationFrame()来制作基于网络的动画，这适用于对性能要求很高的动画。
