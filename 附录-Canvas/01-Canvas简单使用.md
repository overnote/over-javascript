# 01-Canvas 简单使用

## 一 Canvas 简介

canvas 是 html5 提供饿画布标签，该变迁内形成一个矩形区域，可以控制其每一个像素，从而实现在网页绘制图像的功能。

与 Flash 相比，Canvas 更加轻量，使用 Canvas 绘制图形，在绘制成功后，canvas 就会像素化，无法修改，只能通过 API 得到画布的内容再次绘制。所以 canvas 图形如果要实现动画，需要的编程逻辑是：清屏-更新 - 重新渲染。

注意：**IE8 不支持 canvas！**，此时会显示`后备文本`，即只会显示 canvas 标签内的文本。如果需要 IE8 以下浏览器支持 canvas，可以使用：

- explorecanvas
- Google Chrome Frame

## 二 基本用法

示例代码：

```html
<canvas id="mycanvas" width="600" height="600">不兼容时显示该文字！</canvas>
<script>
  // 获得 canvas 上下文
  let ctx = document.querySelector('#mycanvas').getContext('2d')
  // ctx 保存绘制环境，使用 ctx 绘制
  ctx.fillStyle = 'rgb(0,0,200)'
  ctx.fillRect(0, 0, 100, 100)
  setTimeout(() => {
    // 清除画布：0,0 代表从何处开始清除，600,600 代表清除的位置和高度
    ctx.clearRect(0, 0, 600, 600)
  }, 5000)
</script>
```

canvas 元素本身拥有属性 width、height，不推荐使用 css 控制，会引起形变、失真，这是因为 canvas 元素实际上有两套尺寸：

- 元素本身大小：由 CSS 控制
- 元素绘制表面的大小：CSS 无法控制

canvas 的 width、height 属性会同时修改了该元素本身的大小和元素绘制表面的大小，而 CSS 修改则只修改元素本身大小，绘制面大小不变，浏览器会对绘图面进行缩放，从而产生了失真。

## 四 canvas 元素 API

canvas 元素只提供了 2 个属性，3 个方法：

- width、height：元素的宽高。是个非负整数，不能给数值添加 px 后缀
- getContext()：返回与该 canvas 元素相关的绘图环境对象。每个 canvas 元素均有且有一个这样的环境对象。
- toDataURL(type, quality)：返回数据地址，可以将其设置为 img 元素的 src 属性值。type 表示图像类型，如 image/jpeg 或者 image/png(默认)。第二个参数是 0~1.0 之间的 double 值，表示 JPEG 图像的显示质量。
- toBlob(callback, type, quality...)：创建一个用于表示此 canvas 元素图像文件的 Blob。浏览器会调用参数一（this 为 blob）。

## 五 绘图环境

canvas 元素仅仅是个容器，其内部的绘图环境真正提供了全部的绘制功能，包括：

- 2d 绘图环境：getContext('2d') 获取。
- 3d 绘图环境：基于 WebGL 实现。

## 六 绘图原理

canvas 绘制图形步骤：

- 1、将图形/图像绘制到一个透明位图中。绘制时遵从当前的填充模式、描边模式、线条样式。
- 2、将图形/图像的每一个像素颜色分量，乘以绘图环境对象的 globalAlpha 属性值。
- 3、将绘有图形/图像的位图，合成到当前经过剪辑区剪辑且过的 canvas 位图上，在曹组时使用当前的合成操作符（composition operator）。

如果要启用引用效果，则会在 1、3 步骤之间加入：

- 将图形/图像的阴影绘制到另一幅位图中，在绘制时使用当前绘图环境的阴影设定
- 将阴影中每一个像素的 alpha 分量乘以绘图环境对象的 globalAlpha 属性值
- 将绘有阴影的位图与经过剪辑区域剪切过的 canvas 进行图像和成，操作时使用当前的合成模式参数
