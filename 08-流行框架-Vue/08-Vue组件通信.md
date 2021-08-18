# 08-Vue 组件通信

## 一 父子组件通信

### 1.1 父组件向子组件传递数据

传递数据操作步骤：

- 第一步：父组件中使用 v-bind 绑定要传递的数据
- 第二步：子组件在 props 属性中定义传递过来的数据

```html
<div id="app">
  <father></father>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  // 定义父组件：将父组件数据 fatherMsg 绑定到了子组件属性 sonMsg 上，将父组件方法 fatherShow 绑定到子组件 sonClick上
  Vue.component('father', {
    data: function () {
      return {
        fatherMsg: '姓氏为李',
      }
    },
    // 父组件将数据绑定在子组件属性上
    template: `
      <div>
        <p>父组件</p>
        <son :sonMsg="fatherMsg"></son>
      </div>
    `,
  })

  // 定义子组件：在props中接收父组件数据，在template中使用
  Vue.component('son', {
    props: ['sonMsg'],
    data: function () {
      return {
        name: 'xxx',
      }
    },
    template: `
      <p>子组件,接收到的数据为：{{sonMsg}}</p>
    `,
  })

  new Vue({
    el: '#app',
    data: {},
  })
</script>
```

data 与 props 对比：

- data 中一般放置请求到的数据，props 里面放置的是传递过来的数据。
- data 中的数据都是可读写的，而 props 中的数据是只读的

贴士：在 props 中使用驼峰形式，模板中需要使用短横线拼接的形式，但字符串模板没有这个限制。

```html
<!-- props: userInfo -->
<template>
  <div>
    <h2 :user-info>{{userInfo}}</h2>
  </div>
</template>
```

### 1.2 子组件向父组件传数据

子组件要传递数据给父组件，需要利用函数传递。也可以变相的理解为父组件将自己的方法传递给了子组件，子组件在调用方法时，将自身的数据传递给了父组件。

传递方法操作步骤：

- 第一步：父组件中使用 v-on 绑定要传递的方法
- 第二步：子组件在 methods 中使用 \$emit 来触发父组件方法

```html
<div id="app">
  <father></father>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  // 定义父组件：将父组件数据 fatherMsg 绑定到了子组件属性 sonMsg 上，将父组件方法 fatherShow 绑定到子组件 sonClick上
  Vue.component('father', {
    // 父组件将数据绑定在子组件属性上
    template: `
      <div>
        <p>父组件</p>
        <son @sonClick="fatherShow"></son>
      </div>
    `,
    data: function () {
      return {
        fatherMsg: '姓氏为李',
      }
    },
    methods: {
      fatherShow: function (arg) {
        alert(arg)
      },
    },
  })

  // 定义子组件：在props中接收父组件数据，在template中使用
  Vue.component('son', {
    data: function () {
      return {
        name: 'xxx',
      }
    },
    props: ['sonMsg'],
    template: `<div @click="sonShow">子组件</div>`,
    methods: {
      sonShow: function () {
        this.$emit('sonClick', this.name)
      },
    },
  })

  new Vue({
    el: '#app',
    data: {},
  })
</script>
```

## 二 数据类型校验

数据在传递时还可以提前进行数据类型校验，以提升应用的安全性：

```js
props: {
    sonMsg: String,
    isMan: Boolean
},
```

类型校验时可以添加默认值：

```js
props: {
  name: {
    type: String,
    default: 'lisi',
    required: true
  }
  movies: {
    type: Array,
    default(){    // 对象与数组类型的默认值必须是一个工厂函数
      return []
    }
  }
}
```

## 三 父子通信的其他方式

### 3.1 ref 实现父访问子

ref 可以获取到原生节点，用于在父组件中直接操作子组件：

```html
<div id="app">
  <input type="text" ref="mytext" />
  <button @click="add">点击</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  new Vue({
    el: '#app',
    data: {},
    methods: {
      add() {
        alert(this.$refs.mytext.value)
      },
    },
  })
</script>
```

ref 如果放置在组件上，则获取到的是组件对象，这时候就可以实现组件通信!!

ref 通信方式需要在视图结构上添加 ref，不太推荐。

### 3.2 parent 实现子访问父

`this.$parent` 即是当前组件的父组件，该方法也不推荐使用。

## 四 非父子关系组件间通信

组件之间一般都存在着联系，一般都可以通过祖先组件等进行互相通信，但是该方式由于需要层层跨越，实现起来比较麻烦。

Vue 为非父子关系组件提供了事件总线机制来实现通信。事件总线独立于所有组件之外，其本质就是一个空的 Vue 实例:

```html
<div id="app">
  <publish></publish>
  <subcribe></subcribe>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>

<script>
  let bus = new Vue() // 新建中央事件总线

  Vue.component('publish', {
    template: `
                <div>
                    <input type="text" />
                    <button @click="handleClick()">发布</button>
                </div>`,
    methods: {
      handleClick() {
        bus.$emit('msg', 'helloworld')
      },
    },
  })

  Vue.component('subcribe', {
    template: `
                <div>
                    数据为：
                </div>`,
    mounted() {
      // 这里让组件尽早的订阅总线消息
      bus.$on('msg', (data) => {
        alert(data)
      })
    },
  })

  let app = new Vue({
    el: '#app',
    data: {},
  })
</script>
```
