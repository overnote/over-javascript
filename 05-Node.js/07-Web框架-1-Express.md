# 07-Web 框架 -1-Express

## 一 Express 初识

安装方式：

```txt
# 初始化一个项目
mkdir myproject
cd myproject
npm init -y
npm install express -S
```

使用 express 启动一个 web 服务：

```js
var express = require('express')

var app = express()

app.get('/', function (req, res) {
  res.send('hello world!')
})

app.listen(3000)
```

## 二 Express 常见技术使用

### 2.1 静态服务

```JavaScript
app.use(express.static("./public"));
//一句话，就将public文件夹变为了静态服务文件夹。当然也可以指定访问路由名称：
app.use('/test',express.static('public'));  //test是虚拟路径
```

### 2.2 模板引擎

```JavaScript
app.set("view engine","ejs");
app.get("/",function(req,res){
    res.render("haha",{
        "news" : ["我是小新闻啊","我也是啊","哈哈哈哈"]
    });
});
//但是上述模板引擎定义后，我们使用的模板依然需要修改后缀为设定的引擎后缀，进行下列设定，无需修改html后缀：
app.engine('html',ejs.renderFile);
app.set('view engine','html');
```

### 2.3 错误处理

一般情况下，普通的错误，重定向或者展示一个错误页面即可，express 内部在执行路由时候，其实也是用到了 tyr catch。但是这些并不是真正的捕获了异常。如下无法捕获：

```JavaScript
app.get('/test', function (req, res) {
    process.nextTick(function () {
        throw new Error('error');
    });
});
```

该错误被推迟到 Node 空闲时执行，但是当 Node 空闲时，上下文已经不存在了，所以只能关闭服务器！！！出现未捕获异常，唯一能做的是关闭服务器，但是我们要保证服务器的正常关闭，且有故障转移，最容易的故障转移机制是集群。

正常关闭服务器办法，node 有 2 个：uncaughtException 事件和域，严重推荐后者。域是一个执行上下文，会捕获在其中发生的错误。

每个请求都在域中处理，能达到很好的错误处理，封装一个放在最前的中间件：

```JavaScript
const express = require('express');

let app = express();

app.use(function (req, res,next) {

    let domain = require('domain').create();    //为这个请求创建一个域
    domain.on('error',function (err) {
        console.log("domain err " + err.stack);
    });

    try  {

        setTimeout(function () {         //5秒内故障保护关机
            console.log('server shutdown');
        },5000);

        let worker = require('cluster').worker;
        if (worker) worker.disconnect();    //从集群断开

        server.close();             //停止接收新请求

        try {
            next(err);  //尝试使用express错误路由
        } catch (e) {
            console.log("express error failed " +e.stack);      //如果express错误路由失效
            res.statusCode = 500;
            res.setHeader('content-type','text/plain');
            res.end('Server error');
        }
    } catch (error) {
        console.log('Unable to send 500 ', error.stack);
    }

    domain.add(req);        //向域中添加请求、响应对象
    domain.add(res);
    domain.run(next);
});

app.get('/test', function (req, res) {
    process.nextTick(function () {
        throw new Error('error');
    });
});

app.listen(3000);
```

上面的代码中，一旦出现未捕获错误，就会调用该函数。

## 三 Express 路由

### 3.1 路由展示

```JavaScript
const express = require('express');
let app = express();

app.get('/',function (req,res) {
    res.send('hi');
});

app.get('/showname',function () {
    res.send('name si lisi');
});

app.get(/^\/student\/([\d]{10})$/,function(req,res){
    res.send("学生信息，学号" + req.params[0]);
});

app.get("/teacher/:gonghao",function(req,res){
    res.send("老师信息，工号" + req.params.gonghao);
});

app.listen(3000);

```

注意：express 使用 res.set 和 res.status 取代了原生的 res.writeHead()

### 3.2 常见路由 API

```js
app.get('网址', function (req, res) {}) //get 请求
app.post('网址', function (req, res) {}) //post 请求
app.all('网址', function () {}) //处理这个网址的任何类型请求
```

注意：

- 所有的 GET 参数，? 后面的都已经被忽略，锚点#也被忽略，路由到/a，实际/a?id=2&sex=nan 也能被处理；
- 正则表达式中，未知部分用圆括号分组，然后可以用 req.params[0]、[1] 得到，req.params 是一个类数组对象。

如果 get、post 回调函数中，没有 next 参数，那么就匹配上第一个路由，就不会往下匹配了。如果想往下匹配的话，那么需要写 next()：

```JavaScript
app.get("/",function(req,res,next){
    console.log("1");
    next();
});

app.get("/",function(req,res){
    console.log("2");
});
```

### 3.3 参数获取

GET 请求的参数在 URL 中，在原生 Node 中，需要使用 url 模块来识别参数字符串。在 Express 中，不需要使用 url 模块了。可以直接使用 req.query 对象。

POST 请求的参数在 express 中不能直接获得，必须使用 body-parser 模块。使用后，将可以用 req.body 得到参数。但是如果表单中含有文件上传，那么还是需要使用 formidable 模块。

冒号参数引起的路由问题：

```JavaScript
app.get("/:username/:id",function(req,res){    //express推荐使用冒号获得参数
    console.log("1");
    res.send("用户信息" + req.params.username);
});

app.get("/admin/login",function(req,res){
    console.log("2");
    res.send("管理员登录");
});

```

上面两个路由，感觉没有关系，但是实际上冲突了，因为 admin 可以当做用户名 login 可以当做 id。

```JavaScript
//解决方法1 交换位置。 也就是说，express中所有的路由（中间件）的顺序至关重要，匹配上第一个，就不会往下匹配了。 具体的往上写，抽象的往下写。
app.get("/admin/login",function(req,res){
    console.log("2");
    res.send("管理员登录");
});

app.get("/:username/:id",function(req,res){
    console.log("1");
    res.send("用户信息" + req.params.username);
});

//解决方法2：
app.get("/:username/:id",function(req,res,next){
    let username = req.params.username;
    //检索数据库，如果username不存在，那么next()
    if(检索数据库){
        console.log("1");
        res.send("用户信息");
    }else{
        next();
    }
});

app.get("/admin/login",function(req,res){
    console.log("2");
    res.send("管理员登录");
});
```

### 3.4 路由匹配

app.use() 他的网址不是精确匹配的，使用 user(path,fn()) 时候，user 内的路由，将匹配/path /path/images/ /path/images/1.png 等路由情况。

如果写一个 / 实际上就相当于"/"，就是所有网址，也可以直接不写该地址。

## 四 中间件

### 4.1 中间件概念

在业务系统中，往往接口都必须经过一些特殊方法进行处理后，才会执行下一步动作。而当多个接口都要应用到这些处理时，每个接口都书写一遍显然是不合适的。我们可以利用类似 Java 的 filter 原理，在 Node 中也制作类似的方法，让路由在执行控制器方法之前先执行这些通用方法。这些通用方法即是中间件。

由于中间件往往需要对请求的上下文，即请求对象 req、响应对象 res，进行一定的封装处理，所以中间件函数必须具备这 2 个参数，而且中间件也必须提供一种机制，在当前中间处理完成后，通知下一个中间件执行，在 Node 框架 Connect 中，通过尾触发方式实现了中间件：

```js
function middleware(req, res, next) {
  // 业务代码
  next()
}
```

### 4.2 Express 中的中间件

中间件是在管道中执行的，在 Express 中，使用 app.use() 向管道中插入中间件。中间件讲究顺序，匹配上第一个之后，就不会往后匹配了，next 函数才能够继续往后匹配。

模糊意义上讲，app.get()、app.post()、app.post() 等方法也属于中间件。

大坑：express 的中间件函数，不需要传入 req，res，他是在中间件函数执行回调的时候自动传入。

创建中间件：

```js
module.exports = function (req, res, next) {
  //中间件函数在这里调用
  next() //记得使用 next() 或者 next(route)
}
```

使用中间件：

```JavaScript
const test2 = require('./test1');
app.use(test2);

app.get('/',function (req, res) {//每次访问/调用一次中间件
    res.send("hello world!");
});
```

创建可配置的模块化中间件：

```JavaScript
module.exports = function (config) {
    if (!config) config= {}
    return function (req, res, next) {
        next();     //除非这个中间件是终点，否则需要next
    }
};
```

输出多个相互关联的中间件：

```JavaScript
module.exports = function (config) {
    if (config)  config= {}
    return {
        m1: function (req, res, next) {
            next();     //除非这个中间件是终点，否则需要next
        },
        m2: function (req, res, next) {
            next();     //除非这个中间件是终点，否则需要next
        }
    }
};
```

使用互相关联的中间件：

```JavaScript
const test2 = require('./test1')({option:'test'});
app.use(test2.m1);
app.use(test2.m2);

```

也可以将处理函数挂载在一个对象的原则上：

```JavaScript
//创建中间件
function Stuff(config) {
    this.config = config || {};
}

Stuff.prototype.m1 = function (req, res, next) {
    //注意这里的this最好别用
};
module.exports = Stuff;
//使用中间件
const test2 = require('./test1');
let stuff = new test2({option:"test"});
app.use(stuff.m1);
```

### 4.3 中间件的使用

常见的场景是鉴权，比如有的页面需要登录才能访问，有的页面无需登录，如果现在封装一个是否登录的中间函数 isLogin()，那么在实际开发中的使用方式是：

```js
// 需要登录
app.get('/user/:username', isLogin, function (req, res) {})

// 不需要登录
app.get('/news/:date', isLogin, function (req, res) {})
```

isLogin 中间件的写法：

```js
function isLogin(req, res, next) {
  var cookie = req.headers.cookie
  var cookies = {}

  if (!cookie) {
    console.log('cookie 不存在')
    return
  }

  if (!cookie.isLogin) {
    console.log('用户未登录')
    return
  }

  next()
}
```

### 4.4 中间件的开发

中间件和具体业务应该都是不同的业务处理单元，现在改进上一节中 use 方法：

```js
app.use = function(){
    var handle = {
        path: pathR egexp(path),            // 第一个参数作为路径
        stack: Array.prototype.slice.call(arguments, 1)     // 其他的都是处理单元
    };
    routes.all.push(handle);
}
```

改进后的 use() 方法都将中间件存进了 stack 数组中，等待匹配后触发执行，匹配部分修改如下：

```js
function match(pathname, routes) {
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i]
    var reg = route.path.regexp
    var matched = reg.exec(pathname)

    if (matched) {
      handle(req, res, route.stack)
      return true
    }
  }

  return false
}
```

一旦匹配成功，中间件具体如何调用都交给了 handle() 方法处理，该方法封装后，递归性的执行数组中的中间件，每个中间件执行完成后，按照约定调用传入 next() 方法触发下一个中间执行：

```js
function handle(req, res, stack) {
  function next() {
    // 从 stack 数组中取出中间件并执行
    var middleware = stack.shift()
    if (middleware) {
      // 传入 next() 函数自身，使中间件能够执行结束后递归
      middleware(req, res, next)
    }
  }
  // 启动执行
  next()
}
```

### 4.5 通用中间件

有的中间件要在所有路由中触发，如果每个路由都要书写一遍该中间件，显然是不合理的，用户期望的使用方式是：

```js
app.use(isLogin)
```

现在修改 use() 方法，以实现更灵活的适应参数变化：

```js
app.use = function (path) {
  var handle

  if (typeof path === 'string') {
    handle = {
      // 第一个参数作为路径
      path: pathRegexp(path),
      // 其他的都是处理单元
      stack: Array.prototype.slice.call(arguments, 1),
    }
  } else {
    handle = {
      // 第一个参数作为路径
      path: pathRegexp('/'),
      // 其他的都是处理单元
      stack: Array.prototype.slice.call(arguments, 0),
    }
  }
  routes.all.push(handle)
}
```

改进匹配过程，之前的匹配是一旦一次匹配后就不再执行，现在需要将所有匹配到的中间都暂时保存起来：

```js
function match(pathname, routes) {
  var stacks = []

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i]
    var reg = route.path.regexp
    var matched = reg.exec(pathname)
    if (matched) {
      // 抽取具体值.....将中间件保存
      stacks = stacks.concat(route.stack)
    }
  }

  return stacks
}
```

高进分发过程：

```js
function (req, res) {

    var pathname = url.parse(req.url).pathname;
    var method = req.method.toLowerCase();

    // 获取 all() 方法里的中间件
    var stacks = match(pathname, routes.all);

    if (routes.hasOwnPerperty(method)) {
        // 根据请求方法分发，获取相关的中间件
        stacks.concat(match(pathname, routes[method]));
    }

    if (stacks.length) {
        handle(req, res, stacks);
    } else {
        // 处理 404 请求
        handle404(req, res);
    }
}
```

### 4.6 异常处理

中间件自身也可能出现错误，所以必须为 next() 方法添加 err 参数，捕获异常：

```js
function handle(req, res, stack) {
  function next(err) {
    if (err) {
      return handle500(err, req, res, stack)
    }

    // 从 stack 数组中取出中间件执行
    var middleware = stack.shift()
    if (middleware) {
      // 传入 next() 函数自身，使中间件能够执行结束后递归
      try {
        middleware(req, res, next)
      } catch (ex) {
        next(err)
      }
    }
  }

  // 启动执行
  next()
}
```

注意：异步方法的异常无法直接捕获，中间件异步产生的异常需要自己传递出来：

```js
function isLogin() {
  var uid = req.cookie.session_id

  // 假设是个异步方法，产生了错误
  store.get(uid, function (err, session) {
    if (err) {
      next(err)
      return
    }

    req.session = session
    next()
  })
}
```

所以异步的中间件往往有四个参数：

```js
function middleware(err, req, res, next) {
  // ...
  next()
}
```
