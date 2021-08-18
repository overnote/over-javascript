# 05-接口规范-1-REST

## 一 RESTful 概念

REST 中文含义是表现层状态转换，符合 REST 规范的设计，都可以称呼为 RESTful。RESTful 的思想是将服务端提供和的内容实体看做资源，与 URL 进行一一对应，依据请求方式不同分别有增、删、改、查等方法。

比如一个用户地址：`/user/lisi`，代表了 lisi 这个用户在服务器上的个人信息相关的资源，对该资源进行操作，则请求为：

```txt
增加用户lisi    POST        /user/lisi
删除用户lisi    DELETE      /user/lisi
修改用户lisi    PUT         /user/lisi
查询用户lisi    GET         /user/lisi
```

而在过去，新增一个用户，往往其接口为：`/user/addUser`。

在 RESTful 设计中，资源的具体格式由请求报头中的 Accept 字段和服务端的支持情况决定，比如如果客户端同时接收 JSON 和 XML 格式的响应，则其 Accept 字段的值如下：

```txt
Accept: application/json,application/xml
```

## 二 设计 Node 的 RESTful 路由器

在上一节中，如果 use 方法是对所有请求方法的处理，那么在 RESTful 中，需要区分请求方法进行设计：

```js
const routes = {
  all: [],
}

const app = {}

app.use = function (path, action) {
  routes.all.push(pathRegexp(path), action)
}

const funcArr = ['get', 'put', 'delete', 'post']

funcArr.forEach(function (method) {
  routes[method] = []
  app[method] = function (path, action) {
    routes[method].push({
      regexp: pathRegexp(path),
      action: action,
    })
  }
})
```

上面的代码添加了 get()，put()，delete()，post()四个方法后，现在开始完成路由映射，并能达到类似下列的请求方式：

```js
app.post('/user/:username', addUser)
app.get('/user/:username', infoUser)
// ...
```

这样的路由能够识别请求方法，并将业务进行分发，为了让分发更简洁，必须将匹配的部分抽取为 match()方法：

```js
function match(pathname, routes) {
  for (var i = 0; i < routes.length; i++) {
    // 正则匹配
    let matched = red.exec(pathname)
    if (!matched) {
      return false
    }

    let reg = routes[i].regexp
    let keys = route[i].keys

    let params = {}
    for (let j = 0; j < kyes.length; j++) {
      let value = matched[j + 1]
      if (value) {
        params[keys[i]] = value
      }
    }

    req.params = params
    let action = routes[i].action
    action(req, res)
    return true
  }
}
```

分发部分的改进：

```js
function(req, res){

    let pathname = url.parse(req.url).pathname;
    let method = req.method.toLowerCase();

    if(routes.hadOwnPerperty(method)){

        // 根据请求方法分发
        if(match(pathname, routes[method])) {
            return
        } else {
            // 如果路径没有匹配成功，尝试让all()来处理
            if (match(pathname, routes.all)){
                return
            }
        }

    } else {
            if (match(pathname, routes.all)){
                return
            }
    }

    // 404处理
}
```

## 二 REST 设计理念

REST 与 RPC 请求不能混为一谈。REST 不是标准，只是一种 Web 应用的架构风格，或者说一种设计模式、约束，其核心思想是 **资源表述的转移**，数据和功能都可以视为资源。

REST 对服务资源的要求应该是无状态的！请求不要求服务器需要额外检索程序的上下文、状态；在连续的请求中，客户端也不依赖于同一台服务器。
