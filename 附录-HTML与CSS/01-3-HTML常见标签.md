# 01.3-HTML-常见标签

## 一 标签分类

网页的内容都是由大量的 HTML 标签构成，按照标签的开合可以将标签分为分类：

- 单标签：只有开始没有结束，如：`<hr> <!-- --> <br> <hr>`
- 双标签：有开始有结束，如：`<p></p> <em></em>`

## 二 区域类标签

区域类标签只是笔者自己将一些类似作用的标签划分到了一起。这些标签不会对内容的样式产生较大影响，仅仅可以用来包裹一些网页结构。

div 与 span 是最常见的该类型标签，他们没有任何修饰意义：

```html
<!-- 代表块区 -->
<div>div内容</div>
<!-- 代表文本区 -->
<span>span内容</span>
```

## 三 常用标签

### 3.1 标题标签

标题用于显著展示内容，一般是文章的题目等，总计有六个，从上往下字体大小依次缩小：

```txt
<h1>标题1<h1>
<h2>标题2<h2>
<h3>标题3<h3>
<h4>标题4<h4>
<h5>标题5<h5>
<h6>标题6<h6>
```

### 3.2 段落标签

```txt
<p>
被格式化的 段 落
被格式化的 段 落
</p>
<pre>
被格式化的 段 落
被格式化的 段 落
</pre>
```

### 3.3 换行标签

`<br>` 标签用来强制换行，但是一般场景中会使用文档流自动换行。该标签是单标签。

### 3.4 图片标签

图片标签 img 示例：

```html
<img src="1.jpg" atl="我是图片" title="图片标题" width="200" height="300" />
```

img 标签常用属性：

```txt
alt：当图片无法显示时显示 alt 内的文字
src：图片路径，可以是绝对路径（/开头）或者相对路径（./开头，可以省略./）
```

图片的格式的不同是有区别的，理论环境下：

- gif 文件较大，且不清晰，但是支持动画
- jpg 格式则更加清晰，且文件更小，网页中的大图推荐使用 jpg
- png 是无损压缩，可以保持图片的星系，但是其文件较大，小图适合使用 png（比如 LOGO），当然小图标使用字体图标更加优秀。此外 png 还能支持图片透明。

### 3.5 链接标签

a 链接示例：

```html
<a href="http://www.baidu.com/">百度</a>
```

a 标签常用属性：

```txt
href：    值为#时不能跳转，值为一个文件时则可以实现下载功能
title：   鼠标划过时显示的文字
target：  网页打开方式，常见打开方式有：_self：默认值，在当前页打开，_blank：在新窗口中打开
```

锚链接位置跳转演示：

```html
<p id="test">你好</p>
<a href="#test">查看问候语</a>
```

a 链接特殊写法：可以制造点击不执行，一般在 tab 栏切换中使用

```html
<a href="”javascript:;”"></a> <a href="”javascript:void(0);”"></a>
```

### 3.6 列表标签

无序列表 ul：

```html
<ul>
  <li>新闻1</li>
  <li>新闻2</li>
</ul>
```

无序列表，默认无任何显示样式，但是可以添加一些样式：

```txt
type="square"：列表样式为小方块
type="circle"：列表样式为小圆圈
```

有序列表 ol:

```html
<ol type="a" start="3">
  <li>新闻1</li>
  <li>新闻2</li>
</ol>
```

有序列表的样式：

```txt
A,a：       分别以 A 或者 a 字幕顺序排序
I,i ：      分别以大小写罗马数字排列
start="3" ：li 前面的显示从第几个开始计数
```

自定义列表 dl：

```html
<dl>
  <dt>新闻汇总</dt>
  <dd>新闻1</dd>
  <dd>新闻2</dd>
</dl>
```

## 四 表格标签 table

表格标签在以前用来作为布局使用，现在已经被淘汰，只作为纯表格使用。

### 4.1 table 组成

```html
<table
  border="1"
  width="300"
  height="100"
  cellspacing="0"
  cellpadding="5"
  align="center"
  bgcolor="pink"
>
  <tr>
    <th>姓名</th>
    <th>性别</th>
  </tr>
  <tr>
    <td>111</td>
    <td>122</td>
  </tr>
  <tr>
    <td>211</td>
    <td>222</td>
  </tr>
</table>
```

表格结构:thead（表头）、tbody（主体）、tfoot（结尾）

```txt
cellspacing：用来设置单元格与单元格的距离（td），默认值为 2
cellpadding：设置内容距边框的距离（文字距离 td 左侧）
align：设置对齐方式，包括 left、right、center
```

注意：table 标签的标题标签是 caption，不能使用 title。td 内容垂直对齐使用 valign。

```html
<!-- valign的其他值有 top middle bottom -->
<td valign="bottom">123</td>
```

### 4.2 合并单元格

- 横向合并 colspan：设置 td 的横向合并
- 纵向合并 rowspan：设置 td 的纵向合并

```html
<table width="300" height="200" cellspacing="0" border="1">
  <tr>
    <td colspan="2">111</td>
    <td>122</td>
    <td>133</td>
  </tr>
  <tr>
    <td>211</td>
    <td>222</td>
    <td rowspan="2">233</td>
  </tr>
  <tr>
    <td>311</td>
    <td>322</td>
    <td>333</td>
  </tr>
</table>
```

## 五 H5 新增的多媒体标签

### 5.1 新增多媒体标签-音频标签

H5 支持在网页中直接嵌入多媒体标签。

音频标签为 `<audio>`，由于版权原因，各大浏览器支持播放格式为：

```txt
IE9：       MP3
Firefox：   Ogg、Wav
Chrome：    Ogg、MP3
Safari：    MP3、Wav
```

音屏标签常见属性：

```txt
autoplay：  值为 autoplay，自动播放
controls：  值为 controls，向用户显示控件，如播放按钮
loop：      值为 loop，当银屏结束时重新播放
src：       值为 资源地址
```

为了兼容，往往这样写：

```html
<audio controls="controls">
  <source src="demo.mp3" type="audio/mpeg" />
  <source src="demo.ogg" type="audio/ogg" />
  您的浏览器不兼容该音频格式
</audio>
```

### 5.2 新增多媒体标签-视频标签

视频标签为 `<video>`，视频格式的版权限制如下：

```txt
IE9：       MP4
Firefox：   Ogg、WebM
Chrome：    MP4、Ogg、WebM
Safari：    MP4
```

视频标签的常用属性：

```txt
autoplay：  值为 autoplay，自动播放
controls：  值为 controls，向用户显示控件，如播放按钮
loop：      值为 loop，当银屏结束时重新播放
src：       值为 资源地址
width、height
preload：   值为 auto 代表预先加载视频，值为none则不预加载
poster：    值为 图片地址，加载等待时的图片
muted：     值为 muted，静音播放
```

贴士：

- Chrome 将多媒体的自动播放禁止了
- 音频无法实现自定义播放
