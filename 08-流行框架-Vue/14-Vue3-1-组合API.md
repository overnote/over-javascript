# 14-Vue3-1-组合 API

## 一 Vue3 带来的变化

Vue3 核心变化：

- **按需编译**：使得 Vue3 项目的体积比 Vue2 小。
- **Composition API**：即组合式 API，用来更好的组织、复用业务代码，其目的是用来替代 vue2 的生命周期函数
- **性能提升**：性能相比 Vue2 提升较大

Vue3 其他新特性：

- 更先进的组件：Fragment、Teleport、Suspense
- 更好的 TypeScript 支持：Vue3 本身是由 TS 书写，其对 TS 的支持度更高
- 暴露了自定义渲染 API（Custom Renderer API）

## 二 Vue3 性能提升原因

### 2.1 diff 算法优化

Vue2 的虚拟 DOM 是进行全量对比的，Vue3 新增了静态标记（PatchFlag），在与上次的虚拟节点进行比较时，只对比带有 patch flag 的节点。flag 信息中更进一步也存储了具体要比较的具体内容。

### 2.2 组件渲染优化

Vue2 中的元素每次在更新都会重新创建，Vue3 对于不参与更新的元素，只会被创建一次。

Vue2 中节点渲染伪代码：

```js
export function render(){
  return (
    _createNode("p", null, "无变动节点1")
    _createNode("p", null, "无变动节点2")
    _createNode("p", null, "更新节点3")
  )
}
```

静态提升后渲染方式伪代码：

```js
const _hoisted_1 = _createNode('p', null, '无变动节点1')
const _hoisted_2 = _createNode('p', null, '无变动节点2')

export function render() {
  return (
    _hoisted_1,
    _hoisted_2,
    _createVNode('p', null, _toDisplayString('有变动节点3'))
  )
}
```

### 2.3 事件侦听优化

事件绑定函数在默认情况下是动态绑定的，会一直被追踪其变化，源码中使用一个静态标记进行标记。

但是同一个函数，若追踪无变化，组件重新渲染时，静态标记会被取消掉，即不再比较函数的变化。

### 2.4 静态内容缓存

当组件中包含大量静态内容时，这些内容会被当做纯字符串放在 buffer 内，比以前仍然创建虚拟 DOM 渲染快很多。

## 二 使用 Vue3

### 2.1 Vite 初始化项目

使用 vue-cli 可以在安装下项目时，选择 vue 的版本，不过笔者这里推荐使用 Vite 来初始化一个 vue3 项目。

Vite 是一个全新的 vue 脚手架工具，支持按需加载，类似一个 SSR 的 web 服务，启动速度很快：

```txt
npm init vite-app <project-name>
cd <project-name>
npm i
npm run dev
```

### 2.2 入口 的变化

入口方面使用 create 函数：

```js
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

createApp(App).mount('#app')
```

## 一 组合式 API

### 1.0 组合式 API 概念

组合式 API 文档：<https://composition-api.vuejs.org/zh/>

### 1.1 setup()

setup 函数是 vue3 组合 API 的入口函数，项目启动时会运行一次，其生命周期可以理解为位于：`beforeCreate`和`created`
之间，该函数中返回的对象可以作为组件的数据直接使用：

```html
<template>
  <h1>{{ data.count }}</h1>
</template>

<script>
  export default {
    name: 'HelloWorld',
    setup() {
      return {
        data: { count: 0 },
      }
    },
  }
</script>
```

### 1.2 ref() reactive() 定义响应式数据

在 setup()中直接返回的数据并不是响应式的，必须通过 ref()、reactive()函数的包装。

ref() 用来包装基本类型，reactive()用来包装引用类型：

```html
<template>
  <!-- ref包装的数据在模板中有语法糖支持，无需使用 count.value -->
  <h1>count:{{ count }}</h1>
  <h2>age:{{ person.age }}</h2>
  <button @click="updCount">count++</button>
  <button @click="updAge">age++</button>
</template>

<script>
  import { reactive, ref } from 'vue'
  export default {
    name: 'HelloWorld',
    setup() {
      let count = ref(10)
      let person = reactive({
        name: 'lisi',
        age: 30,
      })

      function updCount() {
        count.value++ // 基本类型被包装为了对象，键名即 value
      }

      function updAge() {
        person.age++
      }

      return {
        count, // 返回属性
        person,
        updCount, // 返回方法
        updAge,
      }
    },
  }
</script>
```

### 1.3 setup() 好处

使用 setup 时，数据变化的监控可以抽取为一个独立的函数，便于表达和维护。当需要对 count 进行设定时，无需再像以前那样在多个生命周期中来回穿梭，更加自由了。

所谓组合式 API 其实就是可以将各种业务进行无痛组合，不过其本质仍然是将监控的数据放置到 data、函数放置到 methods 中！

### 1.4 setup() 执行细节

setup() 在 beforeCreate 之前会执行一次，此时组件对象没有创建，所有 this 是 undefined，也就不能通过 this 来访问 data、methods、props、computed。

setup() 返回的对象中的方法，会与 methods 中的方法合并，如果有重名，则以 setup 优先。不过不推荐 setup 与 methods 混合使用。

### 1.5 自定义 hook 函数

vue3 的组合 api 可以封装为复杂的可复用的功能函数，类似 vue2 中的 mixin，但是更加清晰：

```js
// 新建一个hook文件夹，内部创建多个hookapi文件，如下示例
import { ref, onMounted, onUnmounted } from 'vue'

export default function useShowMousePosition() {
  const x = ref(-1)
  const y = ref(-1)

  const run = (e: MouseEvent) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    document.addEventListener('click', updPos)
  })

  onUnMounted(() => {
    document.addEventListener('click', updPos)
  })
}

// 业务代码中使用
export default {
  name: 'HelloWorld',
  setuo() {
    const { x, y } = useMousePosition()
  },
}
```
