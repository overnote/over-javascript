# 03-Vue 组件化开发

## 一 Vue 组件创建化开发思想

### 1.1 组件化思想

组件化是指从 UI 界面角度出发，合理重用 UI 组件。如果将一个页面中的业务逻辑放在一起，将会让项目变得难以维护、扩展，将页面拆分为一个个小的功能块，每个功能块具有完全独立的功能，不同功能块之间通过一些方法进行关联，这样更便于扩展、维护。

具体的实现细则：

```txt
将一个完整的页面拆分为多个功能块组件，每个组件用于实现页面的一个功能块
每个组件内部可以进一步进行划分为更加细小的组件
```

组件化为页面的开发实现了更好的抽象，达到复用效果，任何应用都可以被抽象为一棵组件树：

![组价树](../images/mvvm/vue-02.png)

### 1.2 vue 中组件化开发步骤

vue 中使用组件的步骤：

- 第一步：`Vue.extend()`创建组件构造器
- 第二步：`Vue.component()`注册组件
- 第三步：类似 HTML 标签一样使用组件

注意：组件化与模块化都是软件工程的思想，但是完全不是一个概念。组件化是从 UI 界面角度出发，实现 UI 元素的复用，模块化是从代码组织角度出发，便于代码的复用与维护。

## 二 注册组件

### 2.1 注册全局组件

```html
<div id="div">
  <!--驼峰命名的组件名，在html中引用使用 - 连接符，并修改为小写-->
  <my-comp></my-comp>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<script>
  // 依次传入组件名、组件各种属性
  Vue.component('myComp', {
    data: function () {
      return {
        count: 0,
      }
    },
    template: `<button @click="count++">{{count}}</button>`,
  })

  const app = new Vue({
    el: '#div',
  })
</script>
```

在上述案例中，并没有先创建构造函数、再注册的步骤，这是 Vue2.x 提供的语法糖，方便书写，其内部本质上仍然是如下代码：

```js
// 第一步：创建组件构造器。依次传入 组件名、组件内容：内部数据、模板、函数等等
const myComp = Vue.extend({
  data: function () {
    return {
      count: 0,
    }
  },
  template: `<button @click="count++">{{count}}</button>`,
})

// 第二步：注册组件。依次传入组件名、组件内容
Vue.component('myComp', myComp)
```

### 2.2 注册私有组件

示例：

```js
new Vue({
  el: '#app',
  components: {
    myCom: {
      template: '<h3>私有组件</h3>',
    },
  },
})
```

贴士：由上看出，局部组件是挂载在了 Vue 的实例上，而且只能在注册他的父组件中使用！

## 三 组件注册的注意事项

### 3.1 常见重要注意点

Vue2.x 中组件的根元素只能有一个。

组件命名时：若没有使用驼峰式命名，则该名称可以直接使用；若使用了驼峰命名，在引用组件的时候，需要把大写的驼峰改为小写的字母，同时两个单词之间使用 `-` 连接。

### 3.2 组件的 data 属性

组件是一个单独的功能模块的封装，所以不能直接访问 Vue 实例的数据对象 data，组件自己的数据应该由自己存储，即组件自身的 data 函数。

**组件的 data 属性必须是一个函数，且返回一个对象。**

因为：函数能够形成独立的作用域环境，避免污染。如：某个组件在界面中使用了多次，这些组件之间内部的数据是不应该共用一个 data 对象的，而是每次在界面中使用了该组件，就应该创建一个全新的数据对象，所以只能是函数形式，在函数内部返回一个数据对象。

### 3.3 引用 template

template 属性也可以直接引用其他已经定义好的 template。

```html
<div id="app">
  <my-com3></my-com3>
</div>

<template id="tmp1">
  <h3>组件</h3>
</template>

<script>
  Vue.component('myCom3', {
    template: '#tmp1',
  })

  new Vue({
    el: '#app',
  })
</script>
```

## 四 动态组件

### 4.1 动态组件实现组件切换

除了可以使用自定义 true/false 方式来切换组件外，vue 本身也提供了组件切换机制：在 component 里展示对应名称的组件

```html
<div id="app">
  <span @click="who='com1'">显示组件1</span>
  <span @click="who='com2'">显示组件2</span>
  <component :is="who"></component>
</div>

<script>
  Vue.component('com1', {
    template: '<h3>111</h3>',
  })

  Vue.component('com2', {
    template: '<h3>222</h3>',
  })

  let vm = new Vue({
    el: '#app',
    data: {
      who: 'com1',
    },
  })
</script>
```
