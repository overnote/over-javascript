# 06-Vue 常见 API

## 一 常见选项属性

### 1.1 方法 methods

方法是绑定的事件的合集：

```js
new Vue({
  // ... 其他选项属性
  methods: {
    changeAge() {
      return this.age++
    },
  },
})
```

### 1.2 计算属性 computed

计算属性可以简化直接书写表达式带来的代码繁杂性。比如在实际开发中，后端返回的数据并不符合前端展示的需要，需要对这些数据进行处理：

```html
<div>{{msg.toUpperCase()}}</div>
```

在 Vue 中，为了简化、美观上述操作，给出了计算属性，用来做数据的处理：

```js
;<div>{{ getMsg }}</div> // 这里使用 getMsg，而不再是直接使用 msg与表达式

new Vue({
  el: '#app',
  data: {
    msg: 'hello',
  },
  computed: {
    getMsg() {
      return this.msg.toUpperCase()
    },
  },
})
```

我们也可以通过方法来实现上述操作：

```js
    <div>{{getMsg()}}</div>               // 方法必须加 () 执行调用

    new Vue({
        el: "#app",
        data: {
            msg: "hello"
        },
        methods: {                      // 这里是方法，而不是计算属性
            getMsg(){
                return this.msg.toUpperCase()
            }
        }
    })
```

注意：计算属性依赖的状态（数据）改变了，也会重新计算一遍，所以也会重新渲染新的数据。但是 methods 方法也可以做到，为什么还需要计算属性？

```js
// 视图中多个地方都需要同样的数据时，使用计算属性性能更高，如下所示两处地方，计算属性只会计算一次！而方法个地方都会调用一次！！
// 即：计算属性会将计算的结果保存在内存缓存中，视图需要的数据直接从缓存中获取，只有依赖的数据改变才会重新计算一次
<div>{{getMsg}}</div>
<div>{{getMsg}}</div>
```

贴士：计算属性还可以写在视图的指令中，如`<li v-for="data in getArr">`

### 1.3 侦听器 watch

侦听器用来监听数据，数据一旦发生变化，就会`通知`侦听器绑定的方法。

```js
new Vue({
  el: '#app',
  data: {
    msg: 'hello',
  },
  watch: {
    ageChange: function (val) {},
  },
})
```

侦听器一般用于处理一些异步、开销较大的操作。

### 1.4 过滤器 fliters

过滤器可以对传递过来的值进行过滤：

```html
<!--过滤器由管道符 `|` 表示，也支持多次调用：`{{count | myFormat(3,1) | test }}`-->
<div id="app">{{count | myFormat(3,1) }}</div>

<script>
  new Vue({
    el: "#app",
    data: {
      count: 2,
    },
    filters:{
      myFormat: function (count, num1, num2) {
        return count + num1 - num2;
      };
    }
  });
</script>
```

注意：如果出现了同名过滤器，将会依据就近原则调用（私有为准）

贴士：过滤器也可以全局使用：

```js
Vue.filter('myFormat', function (count, num1, num2) {
  return count + num1 - num2
})
```
