# 09-Vue 插槽 slot

## 一 插槽 slot 的作用

假设定义了一个组件 comp，在视图中还要额外添加信息：

```js
<comp>
    <div>新增内容<div>
</comp>
```

此时添加的 div 信息是不显示的，因为 Vue 在 new 的时候，去查找 comp 的 template 内容，从而直接对视图中的 `comp` 标签进行了替换。

现在有这样的需求：comp 组件内部需要依据数据列表循环显示多个数据，slot 是最为快捷的实现方式：

```html
<div id="app">
  <comp>
    <list></list>
  </comp>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  Vue.component('comp', {
    template: `
                <div>
                    <p>comp内容：</>
                    <slot></slot>
                </div>`,
  })

  Vue.component('list', {
    template: `
                <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                </ul>`,
  })

  new Vue({
    el: '#app',
    data: {},
  })
</script>
```

由上看出，插槽就是封装好的组件预留了一定的空间给调用者自定义使用。

## 二 具名插槽

多个插槽共同使用时，如果需要对单独的插槽进行个性设计，就需要给插槽命名：

```html
<div id="app">
  <!--表示插槽使用名字为 right 的插槽来替换，如果没有该名字，则使用无名字的查抄替换-->
  <comp slot="right"><span>替换</span></comp>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  Vue.component('comp', {
    template: `
                <div>
                    <p>comp内容：</>
                    <slot name="left"><span>左边slot</span></slot>
                    <slot name="right"><span>右边slot</span></slot>
                    <slot><span>没有名字的slot</span></slot>
                </div>`,
  })

  new Vue({
    el: '#app',
    data: {},
  })
</script>
```

## 三 作用域插槽

组件在编译时，其数据的来源有作用域限制，如果现在父组件需要对子组件内容进行加工处理，就需要设定作用域：

```html
<div id="app">
  <comp v-show="isShow">
    <p v-show="isShow">slot也会显示</p>
  </comp>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  Vue.component('comp', {
    template: `<div>
                <div>会显示</div>
                <slot></slot>
            </div>`,
    data() {
      return {
        isShow: false, // 子组件数据要求不显示
      }
    },
  })

  new Vue({
    el: '#app',
    data: {
      isShow: true, // 父组件数据要求显示
    },
  })
</script>
```

comp 位于 组件 `#app` 中，所以默认会使用根组件中的 data 数据，而不会使用模板中的数据。

如果现在要使用组件中的属性值，则需要为插槽定义属性：

```html
<div id="app">
  <comp v-show="isShow">
    <template slot-scope="myslot">
      <p v-show="myslot.data">slot不会显示</p>
    </template>
  </comp>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  Vue.component('comp', {
    template: `<div>
                <div>会显示</div>
                <slot :data="isShow">
                </slot>
            </div>`,
    data() {
      return {
        isShow: false,
      }
    },
  })

  new Vue({
    el: '#app',
    data: {
      isShow: true,
    },
  })
</script>
```

## 四 vue2.6 之后的插槽变化

在 vue2.6 之后，为了兼容性，普通插槽与作用域插槽基本没有了太大区别。

插槽在 vue2.6 前后的写法对比

- 普通插槽：
  - 2.6 之前：`<template slot="xxx"></template>`
  - 2.6 之后：`<template v-slot:"xxx"></template>`
- 作用域插槽：
  - 2.6 之前：`<template slot="xxx" slot-scope="props"></template>`
  - 2.6 之后：`<template v-slot:xxx="props"></template>`
