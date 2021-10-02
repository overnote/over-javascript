# 10-路由-2-VueRouter

## 一 路由常见配置

### 1.1 路由模式

路由模式有两种：

- hash 模式：默认的 vue 路由模式，地址为需要有#号："#/home"
- history 模式

如下所示：

```js
let router = new VueRouter({
  mode: 'history', // 默认是hash，此时设置为history模式
  routes: [
    {
      path: '/home',
      component: Home,
    },
  ],
})
```

### 1.2 路由别名

路由中的 name 属性是个可选项，作用是给路由起个名字。

name 的使用场景一：

```js
let router = new VueRouter({
  routes: [
    {
      path: '/home',
      component: Home,
      name: 'Home', // 可选项
      alias: '/index', // 别名：访问/index渲染Home
    },
    {
      path: '*',
      redirect: { name: 'Home' },
    },
  ],
})
```

name 的使用场景二：

```html
<router-link :to="{name:'路由的名字'}"></router-link>
```

### 1.3 路由重定向

重定向设置：

```js
let router = new VueRouter({
  routes: [
    {
      path: '/home',
      component: Home,
      name: 'Home',
      alias: '/index',
    },
    {
      path: '*', // 配置在最后，当所有路由都未被匹配到则如何处理
      // component: Error,          // 可以直接调转到错误提示页

      // redirect会替换掉浏览器中的地址，alias不会
      // redirect: '/index'         // 也可以配置重定向
      // redirect: {path: '/home'} // 重定向方式二
      // redirect: {name: 'Home'}   // 重定向方式三，name是路由的名字
      redirect: (to) => {
        // 重定向方式四,动态设置重定向的目标；
        //     console.log(to);       // to目标路由对象，就是访问的路径的路由信息
        //     return '/home'         // return值也可以写为  {path:} 或 {name:}

        //除了可以直接return重定向的路由外，还可以通过 path\hash\query 等判断，动态设置重定向的目标路由：

        if (to.path === '/123') {
          return '/home'
        } else if (to.path === '/456') {
          return { path: '/document' }
        } else {
          return { name: 'about' }
        }
      },
    },
  ],
})
```

### 1.4 动态路由

路由中直接设定参数：

```js
routes: [{ path: '/user/:uid', component: User }]
```

### 1.5 $router 与 $route

- `$router`：VueRouter 的实例，用于路由切换，如`$router.push`
- `$route`：用于获取当前路由跳转对象中的 name、path、query、params 等

## 二 router-link

### 2.1 router-link 的作用

采用 history 模式会带来新的问题：a 连接会引起页面刷新。vue 为了解决这个问题，提供了 router-link 标签，该标签仍然会被解析为 a 链接，但是其默认行为(刷新页面)被阻止了。在 hash 模式下，使用 router-link 也无需修改跳转地址为 "#/home"！

```html
<div id="app">
  <router-link to="/home">显示home</router-link>
  <router-view></router-view>
</div>
```

### 2.2 router-link 的常见配置

- to 的书写支持多种形式：`:to="home"`，`:to="{path: '/home'}"`
- 默认的触发组件事件是点击事件，也可以修改为别的事件：添加属性：`event="mouseover"`
- 添加`exact`属性会让样式渲染变为不包含形式（即精确匹配），`<router-link to="about" exact tag="li"> </router-link>`

router-link 默认生成的是 a 标签，也可以生成 div、p 等标签，添加属性：`tag="div"`，此时 div 会自动拥有监听点击事件的功能。很多导航中，使用导航标签既包含图标又包含文字，router-link 可以这样配置：

```html
<router-link :to="home" tag="li">
  <i><img src="" /></i>
  <span>首页</span>
</router-link>
```

### 2.3 router-link 配置当前激活状态的 class 名

router-link 生成的 li 元素，被点击的 li 上会带有 router-link-active 的 class 属性，用来配置激活状态的样式。这个 class 名字很长可以自己配置新名字：

```js
// 第一种：全局配置方式：在router里面修改，linkActiveClass:“” ， 所有生成的元素的router-link-active都被修改
let router = new VueRouter({
    linkActiveClass: 'isActive',            // 此时class名为isActive
})

// 第二种：局部修改：在router-link标签上添加属性 active-class=“” ，只支持当前组件
<router-link to="/home" active-class="isActive">显示home</router-link>
```

### 2.4 router-link 配置路由跳转模式

浏览器的历史记录以压栈的方式进行跳转，模式有：push（默认）、replace 两种，默认 push 模式点击浏览器回退按钮时，会移动栈顶指针的位置为上一个位置。

replace 操作则在入栈时会将原本的栈顶指针替换为要跳转的路由！配置方式：

```html
<router-link replace to="/user"></router-link>
```

### 2.5 router-view 保活

随着路由的切换，router-view 中的组件也会随之销毁，如果被切换的组件是输入框，且已经输入了内容，切换路由后再次切换回来，之前输入框的内容就不存在了。为了解决该问题，可以使用 keep-alive：

```html
<!-- include 用于设置哪些组件保活，不设置该属性则 router-view 中组件全部被保活--->
<keep-alive include="User"> <!-- 组件名 -->
  <router-view \>
</keep-alive>
```

缓存多个写法：`:include="['User', 'News']"`。

## 三 路由传参

### 3.1 query 方式传参

```html
<!--发送方式一-->
<router-link :to="`/user?id=${id}}&age=${age}`"></router-link>
<!--发送方式二-->
<router-link :to="{path:'/user'}, query:{id: 13, age:21}"></router-link>

<!--接收-->
<template>
  <div>id={{$router.query.id}}</div>
</template>
```

### 3.2 params 方式传递参数

```html
<!---路由层级配置:动态路由-->
{ path: '/user/:id/:age' }

<!--发送方式一-->
<router-link :to="`/user/${id}/${age}`"></router-link>
<!--发送方式二:此处只能用name，不能用path-->
<router-link
  :to="{name:'userComponent'}, params:{id: 13, age:21}"
></router-link>

<!--接收-->
<template>
  <div>id={{$router.params.id}}</div>
</template>
```

### 3.3 props 统一接收

在路由中，props 属性可以将对象中所有的 kv 都以 props 形式传递给对应配置的组件：

```js
{
  name: 'father',
  path: '/user/info',
  component: Son,
  // 写法一：直接传递参数，一般不使用
  // props: {name: 1, id: 1001}

  // 写法二：此时会把路由组件收到的所有params参数，以props形式传递给 Son 组件
  // props: true

  // 写法三：返回值成为子组件的props
  // props(){
  //   return {id: 1001, name: 'zs'}
  // }

  // 写法三：变更。不推荐
  props({$route}){
    return {id: $route.query.id}
  }
}
```

## 四 router-view

router-view 是组件渲染的地方。

**同时给子组件添加相同的类名**：在 router-view 标签添加 class="center"，那么所有子组件渲染的时候，外层根节点标签就会自动添加 class="center"；

```html
<!-- 配置样式 -->
<router-view class="center"></router-view>
```

## 五 嵌套路由

路由往往有嵌套的情况，如下所示：

```html
<ul class="nav">
  <router-link to="/about" tag="li">
    <a>study</a>
  </router-link>

  <router-link to="/about/work" tag="li">
    <a>work</a>
  </router-link>

  <router-link to="/about/tel" tag="li">
    <a>tel</a>
  </router-link>
</ul>
```

对应的路由控制：

```js
{
    path: '/about',
    component: about,
    children: [
        {
            path: '',          // 当访问 /about也会默认渲染children第一个
            component: study,
            name: about       // 父路由的name要放在默认的子路由上
        },
        {
            path: 'work',          // 匹配地址为： /about/work
            component: work,
            name: work
        },
        {
            path: 'tel',          // 匹配地址为： /about/tel
            component: tel,
            name: tel
        }
    ]
}
```

path 值前面添加斜杠 '/'，表示相对于根路径。

## 六 编程式导航

> 声明式导航：通过点击链接实现的导航，如 html 中的 `<a></a>` 链接，vue 中的 `<router-link></router-link>`
> 编程式导航：通过调用 JS 的 API 实现的导航，如 `location.href`

**router 实例提供的方法：**

- back 回退一步
- forward 前进一步
- go 指定 前进/回退 步数
- push 导航到不同的 url，向 history 栈 添加一个新的记录
- replace 导航到不同的 url，替换 history 栈 中当前记录

```html
<div>
  <input type="button" value="后退" @click="backHandle" />
  <input type="button" value="前进" @click="forwardHandle" />
  <input type="button" value="前进/后退 到指定步数" @click="goHandle" />
  <input type="button" value="控制指定的导航 push" @click="pushHandle" />
  <input type="button" value="控制指定的导航 replace" @click="replaceHandle" />
</div>

<script>
  export default {
    methods: {
      backHandle() {
        this.$router.back()
      },
      forwardHandle() {
        this.$router.forward()
      },
      goHandle() {
        this.$router.go(-2) // 负数是后退，正数是前进，0是刷新当前页面，超过步数的话没有效果；
      },
      pushHandle() {
        this.$router.push('/document') // 目标链接 -- 字符串形式
        this.$router.push({ path: '/document', query: { uid: '1' } }) // 目标链接 -- 对象形式
      },
      replaceHandle() {
        this.$router.replace('/document') // 目标链接 -- 字符串形式
        this.$router.replace({ path: '/document', query: { uid: '1' } }) // 目标链接 -- 对象形式
      },
    },
  }
</script>
```
