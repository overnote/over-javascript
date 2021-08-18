# 13-Vue 动画

## 一 Vue 过渡动画

Vue 提供了 transition 的封装组件，在下列情形中，可以给任何元素和组件添加 进入/离开 过渡：

- 条件渲染 (使用 v-if)
- 条件展示 (使用 v-show)
- 动态组件
- 组件根节点

一个完整的动画分为了两部分：进入部分和离开部分。进入和离开部分都分为两个时间点和一个时间段。

进入部分：

```txt
v-enter：
        动画进入之前元素的初始状态。
        在元素被插入之前生效，在元素被插入之后的下一帧移除。

v-enter-to：
        动画进入完成之后的借宿状态；
        在元素被插入之后下一帧生效 (与此同时 v-enter 被移除)，在过渡/动画完成之后移除。

v-enter-active：
        进入动画的时间段。
        在整个进入过渡的阶段中应用，在元素被插入之前生效，在过渡/动画完成之后移除。这个类可以被用来定义进入过渡的过程时间，延迟和曲线函数。
```

离开部分：

```txt
v-leave：
      动画离开之前元素的初始状态；
      在离开过渡被触发时立刻生效，下一帧被移除。

v-leave-to：
      动画离开完成之后的借宿状态；
      在离开过渡被触发之后下一帧生效 (与此同时 v-leave 被删除)，在过渡/动画完成之后移除。

v-leave-active：
      离开动画的时间段；
      在整个离开过渡的阶段中应用，在离开过渡被触发时立刻生效，在过渡/动画完成之后移除。这个类可以被用来定义离开过渡的过程时间，延迟和曲线函数。
```

贴士：

- v-enter 和 v-leave-to 的状态是一致的；
- v-enter-to 和 v-leave 的状态是一致的；

## 二 元素过渡步骤

使用 transition 元素，把 需要被动画控制的元素 包裹起来，自定义两组样式，来控制 transition 内部元素实现动画；

```html
<button @click="flag=!flag">显示/隐藏</button>

<transition>
  <p v-show="flag">我想通过动画显示隐藏</p>
</transition>

<script>
  new Vue({
      data:{
          flag: true;
      }
  })
</script>

<style>
  .v-enter,
  .v-leave-to {
    opacity: 0;
  }
  .v-leave-active,
  .v-enter-active {
    transition: all 0.4s;
  }
</style>
```

## 三 自定义过渡类名

**8.2.1 步骤**：

- 在 transition 标签上添加 name 属性，并给 name 属性赋值，赋的值替换 ‘v-’ 来作为过渡类类名的前缀；
- 使用自定义过渡类名 定义两组样式，来控制 transition 内部元素实现动画；

```html
<button @click="flag=!flag">显示/隐藏</button>

<transition name="my">
  <p v-show="flag">我想通过动画显示隐藏</p>
</transition>

<script>
  new Vue({
      data:{
          flag: true;
      }
  })
</script>

<style>
  .my-enter,
  .my-leave-to {
    opacity: 0;
  }
  .my-leave-active,
  .my-enter-active {
    transition: all 0.4s;
  }
</style>
```

## 四 钩子函数实现动画

使用过渡类名和使用第三方的库来实现动画，都不能实现半场动画，有时候我们只需要半场，不需要整场动画（比如加入购物车动画），只能借助于钩子函数来实现。

钩子函数页可以说是动画的生命周期函数：
入场的钩子函数

```html
<transition
  v-on:before-enter="beforeEnter"
  v-on:enter="enter"
  v-on:after-enter="afterEnter"
  v-on:enter-cancelled="enterCancelled"
  v-on:before-leave="beforeLeave"
  v-on:leave="leave"
  v-on:after-leave="afterLeave"
  v-on:leave-cancelled="leaveCancelled"
>
  上面四个是入场的动画生命周期函数； 后面四个是出场的动画生命周期函数；
</transition>
```

当只用 JavaScript 过渡的时候，在 enter 和 leave 中必须使用 done 进行回调。否则，它们将被同步调用，过渡会立即完成。

```js
methods: {
  // 进入中

  beforeEnter: function (el) {
    // ...
  },
  // 当与 CSS 结合使用时
  // 回调函数 done 是可选的
  enter: function (el, done) {//此时的done其实就是afterEnter函数的引用
    // ...    // 当需要的操作完成之后，就会自动去调用done()，也就是立即调用 afterEnter函数；
    done()
  },
  afterEnter: function (el) {
    // ...
  },
  enterCancelled: function (el) {
    // ...
  },
```
