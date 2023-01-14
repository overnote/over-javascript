# 07-Web 框架 -2-Koa

## 一 Koa 简介

Koa 是 express 团队全新打造的更轻量级的 web 框架，内部没有任何功能模块封装，甚至没有路由模块，源码仅仅只有几千行。Koa 仅仅提供了简单的请求响应封装、中间件模型。

与 Express 不同的是：Koa 的请求、响应对象都被包装进了 context 对象中，且 Koa 的中间件模型是洋葱模型。

示例：

```js
const koa = require('koa')

let app = new koa()

app.use((ctx) => {
  ctx.body = 'hello world'
})

app.listen(3000)
```

koa 将 node 的 Request 和 Response 对象封装进了 Context 对象中，所以也可以把 Context 对象称为一次对话的上下文。Context 对象内部封装的常见属性：

```js
ctx // Context 对象，包含 req、res
ctx.request
ctx.response
ctx.status
ctx.throw(500) // 页面会抛出状态码为 500 的错误页面

this // Context 对象也可以直接写为 this
this.request
this.response
```

Koa 与 Express 的不同：

- Express 内部支持路由，Koa 没有路由管理
- Express 的中间件模型是传统的顺序式，而 Koa 是洋葱模型

## 二 洋葱模型

### 2.1 洋葱模型的执行

中间件函数是一个带有 ctx 和 next 两个参数的简单函数。next() 函数就是在其内部调用下一个中间件函数，返回的其实是一个 Promise 对象，该对象内部包裹了下一个中间件的返回结果。next 用于将中间件的执行权交给下游的中间件。

```js
const koa = require('koa')

let app = new koa()

app.use((ctx, next) => {
  console.log('1')
  next()
  console.log('2')
  ctx.body = 'hello world1'
})

app.use((ctx, next) => {
  console.log('3')
  ctx.body = 'hello world2'
  next()
  console.log('4')
})

app.listen(3000)
```

执行结果：按照顺序执行了中间件代码，再按反方向执行一遍 next 之后的代码，web 界面也输出的是 hello world2：

```txt
1
3
4
2
```

上述的执行方式，称之为洋葱模型：
![洋葱模型](/images/node/yangchong.png)

**Koa 中间件相比 Express 中间件：按照洋葱模型执行，中间件无论写在什么位置，都会先执行**。

### 2.2 生产实践

推荐所有的中间件的 next() 均使用 `async/await` 形式包裹，这是因为中间件中一般需要处理一些事情，包裹之后更方便编码，更关键的是：所有中间件如果都被包裹，则不会引发顺序错乱：

```js
app.use(async (ctx, next) => {
  console.log('2')
  await next()
  console.log('2')
  ctx.body = 'hello world1'
})

app.use(async (ctx, next) => {
  console.log('3')
  ctx.body = 'hello world2'
  await next()
  console.log('4')
})

// 顺序不变：1 3 4 2
```

如果不使用 async/await 的中间件与使用包裹的中间件进行了混用，则顺序就会发生变化：

```js
app.use((ctx, next) => {
  console.log('1')
  next()
  console.log('2')
  ctx.body = 'hello world1'
})

app.use(async (ctx, next) => {
  console.log('3')
  ctx.body = 'hello world2'
  await next()
  console.log('4')
})

// 顺序变了：1 3 2 4
```

## 2.3 洋葱模型的意义

为什么 Koa 被称为下一代 web 框架？本质上是舍弃了路由之后更基础的设计理念，以及洋葱模型带来的便利。

比如现在需要知道所有中间件加载的时间，可以直接在第一个中间件的 next 之后获取时间：

```js
// 第一个中间件
app.use(async (ctx, next) => {
  console.time()
  await next()
  // next 之后的代码表示 中间件已经全部执行完毕了
  console.timeEnd()
})
```

此时在 Express 中就没有这么多顺利了。

## 三 中间件应用

### 3.1 koa-compose 组合中间件

如果需要将中间件组合使用，可以使用 koa-compose

```js
function middleware1(ctx, next) {
  console.log('midlle1...')
  next()
}

function middleware2(ctx, next) {
  console.log('midlle2...')
  next()
}

const all = compose([middleware1, middleware2])

app.use(all)
```

### 3.2 koa 常用中间件

- koa-bodyparser:获取 POST 请求参数
- koa-router:路由中间件
- koa-static:静态文件目录
- koa-views:加载模板文件

综合案例：

```js
const koa = require('koa')
const path = require('path')
const ejs = require('ejs')
const views = require('koa-views')
const bodyParser = require('koa-bodyparser')
const static = require('koa-static')
const Router = require('koa-router')
const favicon = require('koa-favicon')

const app = new koa()
const router = new Router()

//加载静态资源
app.use(static(path.join(__dirname, 'static')))

//favicon
app.use(favicon(__dirname + '/static/favicon.ico'))

// 加载 ejs 模板引擎:ejs 后缀方式
// app.use(views(path.join(__dirname, './views'), {
//     extension: 'ejs'
// }));

// 加载 ejs 模板引擎:html 后缀方式
app.use(
  views(path.join(__dirname, 'views'), {
    map: { html: 'ejs' },
  })
)

//post 解析中间件
app.use(bodyParser())

//路由->渲染模板
router.get('/', async (ctx, next) => {
  await ctx.render('test', {
    msg: 'hello',
  })
})
router.post('/', (ctx, next) => {
  let data = ctx.request.body
  console.log(JSON.stringify(data))
  ctx.body = data
})

app.use(router.routes()) //启动路由中间件
app.use(router.allowedMethods()) //根据 ctx.status 设置响应头

//支持链式写法
// app.use(router.routes()).use(router.allowedMethods());

app.listen(3000)
```

## 三 路由管理

### 3.1 koa-router 基本使用

```js
const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router({
  prefix: '/test', //路由前缀---全局的
})

router.get('/', function (ctx, next) {
  ctx.body = 'index....'
})
router.get('/todo', function (ctx, next) {
  ctx.body = 'todo....'
})

app.use(router.routes()) //启动路由中间件
app.use(router.allowedMethods()) //根据 ctx.status 设置响应头

app.listen(3000)
```

### 3.2 路由前缀

```js
let home = new Router() //子路由
let page = new Router() //子路由

home
  .get('/test', async (ctx) => {
    //http://localhost:8000/home/test
    ctx.body = 'home test...'
  })
  .get('/todo', async (ctx) => {
    //http://localhost:8000/home/todo
    ctx.body = 'home todo...'
  })

page.get('/test', async (ctx) => {
  ctx.body = 'page router...'
})

//父路由
let router = new Router()

//装载子路由
router.use('/home', home.routes())
router.use('/page', page.routes())
```

### 3.3 RESTful 规范

关于 RESTful：koa-router 作者推荐使用该风格，即所有的事物都应该被抽象为资源，每个资源对应唯一的 URL

比如对 url 的增删改查：

```txt
/users                  # post 方式：新增用户
/users/:id              # delete 方式：删除用户
/users/:id              # put 方式：修改用户
/users/:id              # get 方式：获取用户
```

上述以 `/:id` 参数接收方式的路由也可以称呼为**动态路由**。

### 3.4 router.all()

router.all() 可以用来模糊匹配

```js
router.get('/', async (ctx, next) => {
  console.log('111')
  ctx.response.body = '111'
  await next() // 如果 注释该段，则不执行 all
  console.log('222')
})

router.all('/', async (ctx, next) => {
  console.log('all...111')
  await next()
  console.log('all...222')
})
```

### 3.5 路由中多中间件处理方式

```js
router.get('/', middleware, midlleware, (ctx) => {})
```

### 3.6 嵌套路由

嵌套路由也可以实现类似路由前缀的功能，但是能够额外添加动态参数

```js
const userRouter = new Router()
const userAction = new Router()

userAction.get('/:pid', (ctx, next) => {
  console.log('/:pid')
})

// /user/123/login/123    /user/123/login
userRouter.use(
  '/user/:fid/login',
  userAction.routes(),
  userAction.allowedMethods()
)

app.use(userRouter.routes())
```

### 3.7 多路由文件实践

当项目中有多个路由时，可以进行分文件开发，便于维护：

```js
// userRouter.js  user 模块路由
const Router = require('koa-router')
const userRouter = new Router()
userRouter.get('/users', () => {})
userRouter.post('/users/:uid', () => {})
module.exports = userRouter

// orderRouter.js order 模块路由
const Router = require('koa-router')
const orderRouter = new Router()
orderRouter.get('/orders', () => {})
orderRouter.post('/ords/:oid', () => {})
module.exports = orderRouter
```

此时在 app.js，或者单独引设置一个 routes.js 内引入这些路由：

```js
const Koa = require('koa')
const Router = require('koa-router')
const userRouter = require('./routers/userRouter')
const orderRouter = require('./routers/orderRouter')

const app = new Koa()
const router = new Router()

app.use(userRouter.routes())
app.use(orderRouter.routes())
app.use(router.allowedMethods()) //根据 ctx.status 设置响应头

app.listen(3000)
```

为了减少重复书写 `app.use(userRouter.routes())` 这样的路由加载，可以使用 `require-directory` 库进行整合：

```js
requireDirectory(module, './routers', { visit: whenLoadModule })

function whenLoadModule(obj) {
  if (obj instanceof Router) {
    app.use(obj.routes())
  }
}
```

注意：**笔者不推荐这种整合方式，该库长久不更新，且每个 router 文件 都要导出，路由排查困难。**

## 四 参数处理

示例：

```js
app.use(async function (ctx) {
  console.log(ctx.url) //login?name=lisi
  console.log(ctx.querystring) //name=lisi

  // 参数方式一： /login?name=lisi
  console.log(ctx.query) //{ name: 'lisi' }

  // 参数方式二：/login/:name   实际路由：/login/lisi
  console.log(ctx.params) // 获取动态路由参数

  // 参数方式三：body 传参
  console.log(ctx.body) // 获取动态路由参数

  // 参数方式四：headers 传参
  console.log(ctx.header)
})
```
