# 05-Vue 与样式

## 一 Vue 设置样式

### 1.1 内联方式 `:style`

内联方式有以下几种形式：

```html
<div id="app">
  <h2 :style="{'background-color': 'green'}">test1</h2>
  <h2 :style="styleObj1">test2</h2>
  <h2 :style="[styleObj1,styleObj2]">test3</h2>
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      msg: 'hello',
      isActive: true,
      styleObj1: { 'background-color': 'green' },
      styleObj2: { 'font-size': '100px' },
    },
    methods: {},
  })
</script>
```

**注意：如果属性带有横线“-”，则此属性必须用冒号引起来；**

### 1.2 类名方式 `:class`

```html
<style>
  .green {
    background-color: green;
  }
  .big {
    font-weigth: 200;
  }
  .active {
    letter-spacing: 0.5em;
  }
</style>

<div id="app">
  <h2 :class="['green', 'big']">test1</h2>
  <h2 :class="['green', 'big', isActive?'active':'']">test2</h2>
  <h2 :class="['green', 'big', {'active': isActive}]">test3</h2>
  <h2 :class="{ green:true, big:true }">test4</h2>
  <h2 :class="classObj">test5</h2>
</div>

<script>
      new Vue({
      el: "#app",
      data: {
          msg: "hello",
          isActive: true，
          classObj: { green:true, big:true }
      }
  });
</script>
```

### 1.3 .vue 文件中直接设置 class

如果使用了组件化开发模式，则可以在 `.vue` 后缀的文件中直接设置 class：

```html
<template>
  <div>
    <p class="green">绿色</p>
  </div>
</template>

<script></script>

<!-- 直接在此处设置 -->
<style>
  .green {
    background-color: green;
  }
</style>
```

### 1.4 引入 css 文件

在 js 文件中可以直接引用 css 文件：

```js
import 'element-ui/lib/theme-default/index.css'
```

如果使用了组件化开发模式，在 .vue 文件中有三种引入方式 css 文件的方式：

```html
<!-- 方式一：在 script 标签中引入 -->
<script>
  import '../static/css/global.css'
</script>

<!-- 方式二：在 style 中引入样式 -->
<style scoped>
  @import '../css/style.css';
</style>

<!-- 方式三：在 style 标签的 src上引入 -->
<style scoped src="../static/css/user.css"></style>
```

## 二 样式的作用域

默认情况下引入的样式也是全局的，如果想要组件的样式私有化，就要添加 scoped，如：

```html
<style scoped>
  /* 添加scoped后，此处的样式只是针对此组件的，不会污染全局 */
  .h1 {
    color: red;
  }
</style>
```

注意： 使用 scoped 后，父组件的样式将不会渗透到子组件中。想要在子组件中重新设置父组件的样式，可以使用深度作用选择器 /deep/，如：

```html
<style scoped>
  /deep/ .text-box input {
    width: 166px;
  }
</style>
```

## 三 css 预处理器的使用

在 style 标签上设置属性 lang 的值，如：lang="less"

```html
<style lang="less" scoped>
  .text-box {
    input {
      width: 166px;
    }
  }
</style>
```
