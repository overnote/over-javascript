# 08-React 路由

## 一 前端路由

### 1.1 前端路由概念

在后端中，路由的概念是：一个路由对应着一个接口，根据路由的不同，返回不同的响应数据。

前端路由的概念是依据 url 的不同，分配不同的界面组件。

React 中实现前端路由的库是：react-router-dom，通过管理 url，实现组件与 url 的对应，通过 url 进行组件之间的切换。

其本质是：用户事件与事件处理函数之间的对应关系！

贴士：react-router 是 react 中路由的核心 api，但是没有提供 dom 操作进行路由跳转的 api，react-router-dom 在使用上更加便利。

### 1.2 前端路由原理

前端路由分为：历史路由、哈希路由两种。二者都可以不制造页面刷新，但是表现形式与本质原理都不一致。

表现形式上：

```txt
哈希路由：localhost:3000/#/news/1001
历史路由：localhost:3000/news/1001
```

实现原理上：

```js
// 哈希路由原理：使用的是URL的哈希值
location.hash = 'about' // 地址为： /#/about
location.hash = 'news' // 地址为： /#/news

// 历史路由原理(栈结构)：使用的浏览器的history API，不兼容IE9
location.pushState({}, '', 'about') // 地址为： /about
location.pushState({}, '', 'news') // 地址为： /news
```

使用上，二者也有不同影响：

```txt
哈希路由：刷新会导致路由传递的state参数丢失，因为其没有history的API，无法在内存中保存state数据
历史路由：刷新没有任何影响。

此外：历史路由在路径错误页面上需要服务端支持，哈希路由不需要
```

## 二 react-router-dom 基础使用

安装 react-router-dom 库：

```txt
npm i react-router-dom -S
```

使用示例：

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Link, BrowserRouter, Route } from 'react-router-dom'
import Home from './component/Home'
import About from './component/About'

export default class App extends Component {
    render() {
        return (
            <div>
                <BrowserRouter>
                    <Link to="/home">home</Link>
                    <Link to="/about">about</Link>
                    <Route path="/home" component={Home} />
                    <Route path="/about" component={About} />
                </BrowserRouter>
            </div>
        )
    }
}
```

## 三 react-router-dom 使用简介

### 3.1 基础概念

react-router-dom 三个常见名词：

-   BrowserRouter：路由的根容器，所有路由相关的内容都要包裹在该标签中，除了 BrowserRouter 还有 HashRouter。
-   Route：表示一个路由规则，在 Route 上，有两个比较重要的属性，path，component
-   Link：表示路由的连接

### 3.2 推荐写法

注意：**一个项目必须交给一个路由器管理，所以可以在 `<App>` 组件最外侧包裹路由标签即可**。

### 3.3 路由组件与一般组件区别

路由组件与一般组件：

-   写法不同：路由组件是 `<Route path="/demo" component={Demo}>`
-   一般组件一般存放在 components 文件夹，路由组件一般存放在 pages 文件夹
-   路由组件接收的 props 为三个固定属性：history、location、match

### 3.4 注意事项

如果有多个相同的路由规则，但是对应组件不同，则匹配到该路由后，将会显示所有对应组件，这种情况在开发中不常见，也会有性能问题。如下所示当遇到 `/home` 路由时，不会停止，而是继续查询后续是否仍然有 home 路由：

```js
  <Route path="/home" component={Home}></Route>
  <Route path="/news" component={News}></Route>
  <Route path="/sports" component={Sports}></Route>
  <Route path="/home" component={About}></Route>
```

react-router-dom 提供了 Switch 组件来解决该问题，下列示例中只会显示 Home 组件内容：

```js
<Switch>
    <Route path="/home" component={Home}></Route>
    <Route path="/home" component={About}></Route>
</Switch>
```

路由的历史记录默认使用 push 方式，先进后出，会留下历史记录。修改为替换模式不会留下历史记录，即执行的不是入栈操作，而是替换栈顶的操作：

```js
<Link replace to=""></Link>
```

使用替换方式，当浏览器回退时，就可以回退到更远的历史记录中，适用的一些场景有：选项卡页面的整体回退。

## 四 封装自定义路由组件示例

封装一个导航标签：

```js
import React. {Component} from 'react'
import {NavLink} from 'react-router-dom'

export default class MyNavLink extends Component {
  render(){
    return (
      <NavLink activeClassName="active" {...this.props}/>
    )
  }
}
```

`...this.props` 展开的传入属性中包括了标签体内容 children，所以在使用该自定义导航组件可以直接如下使用：

```js
<MyNavLink to="/home">Home</MyNavLink>
<MyNavLink to="/about">About</MyNavLink>
```

## 五 路由匹配

`to="/a/home/b"` 这样的路由只会对 `/a` 进行匹配，如果要只匹配到`/a/home/b`，需要使用 exact 开启精准匹配：

```js
<Route exact path="/a/home/b" componet={Home} />
```

## 六 重定向

下列示例中，路由没有匹配到，则会进入 Redirect 中设定的路由：

```js
<Switch>
    <Route path="/home" component={Home}></Route>
    <Route path="/home" component={About}></Route>
    <Redirect to="/home"></Redirect>
</Switch>
```

## 七 嵌套路由

路由下如果要嵌套，必须带上父路由：

```js
<Switch>
    <Route path="/home/news" component={News}></Route>
    <Route path="/home/sports" component={Sports}></Route>
</Switch>
```

## 八 路由参数传递

### 8.1 search 参数方式传递

向路由组件传递 search 参数：

```js
<Link to={`/news/detail/?id=${id}&flag=${flag}`}><Link>
```

组件接收参数，search 是 ?id=1&flag=0：

```js
import qs from 'querystring'
const { search } = this.props.search
const { id, flag } = qs.parse(search.slice(1))
```

### 8.2 params 参数方式传递

向路由组件传递 params 参数：

```js
<Link to={`/news/detail/${id}/${flag}`}><Link>

{/* 声明接收params参数，不声明会产生模糊匹配 */}
<Route to={`/news/detail/:id/:flag`}><Route>
```

组件接收参数：

```js
const { id, flag } = this.props.match.params
```

### 8.3 state 方式传递

state 方式传递不会将参数暴露在网址中：

```js
<Link to={`/news/detail/`, state: {id:id, flag: flag}}><Link>
```

接收方式：

```js
const { id, flag } = this.props.location.state || {}
```

## 九 编程式导航

编程式导航常用场景：页面在延迟一定时间后跳转到另外一个页面。显然 `<Link>` 这样需要主动点击的标签就无法实现了。

编程式导航示例：

```js
// 以 replace 方式跳转
this.props.history.replace(`/home`)

// 以 push 方式跳转
this.props.history.push(`/home`)
```

常见的编程式导航 API：

```js
this.props.history.push()
this.props.history.replace()
this.props.history.go()
this.props.history.goback()
this.props.history.goForward()
```

**注意：一般组件上是不存在 history 这些属性的，如果要让一般组件在点击时可以实现跳转，需要借助 withRouter，此时一般组件内部就可以使用路由相关的 API 了：**

```js
import { withRouter } from 'react-router-dom'

class MyBox extends Component {}

export default withRouter(MyBox)
```

## 十 路由懒加载

路由组件可以通过懒加载提升性能。

组件引入方式：

```js
import React, { Component, lazy, Suspense } from 'react'

// import Home from './components/Home'
const Home = lazy(() => {
    import './components/Home'
})
```

组件使用方式：

```js
<div>
  <Suspense fallback={<h3>loading...<h3>}>
    <Route path="/home" component={Home} />
  </Suspense>
</div>
```
