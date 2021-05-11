# 06-Web 编程-1-http 包

## 一 简单的 Node Web 程序

简单的 Web 服务器示例：

```js
var http = require('http')

var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain;charset=UTF8' })
    res.end('hello world')
})

server.listen(8000)
```

以上简单的几行代码就能开启一个 web 服务，访问 <http://localhost:8000> ，即可看到页面输出 8000 端口。

Node 与传统的 web 开发最大的不同是，Node 代码不需要 Web 容器来运行：

```txt
Java：  Java开发的 Web 软件，需要先将源码打包为 war 包，然后将 war 包放置在其专用 web 服务器 Tomcat 中，由 Tomcat 来运行。
Php：   Php开发的 Web 软件，需要将源码放置在其专用的 web 服务器 Apache 中，由 Apache 来运行。
```

## 二 http 模块

### 2.1 createServer

`http.createServer()` 方法返回的是 http 模块封装的一个基于事件的 http 服务器。

`req`，`res` 分别是 http.IncomingMessage 和 http.ServerResponse 的实例。

http.Server 的主要事件有：

-   request：客户端发起请求时，被处罚，提供 req，res 参数
-   connection：TCP 建立连接时候处罚，提供一个 scoket 参数，是 net.Socket 的实例。
-   close：服务器关闭时，触发。

http.createServer()方法其实就是添加了一个 Reuqest 事件监听，如下所示：

```js
var http = require('http')

var server = http.createServer()

server.on('error', function (err) {
    console.log(err)
})

server.on('request', function (req, res) {
    console.log('有用户请求了')
    console.log(req)
})

server.listen(8081, function () {
    console.log('server run...')
})
```

### 2.2 http 模块常见 api

`http.IncomingMessage` 是 http 请求信息，提供了 3 个事件：

-   data：当请求数据到来时触发；
-   end：当请求体数据传输完毕时候触发；
-   close：当用户请求结束时候触发。

`http.IncomingMessage` 提供的属性有：

-   method：请求方式
-   headers：请求头
-   url：请求路径
-   httpVersion：http 版本

`http.ServerResponse` 是返回客户端的信息，主要方法有：

-   `res.writeHead(statusCode,[headers];`：向请求的客户端发送响应头
-   `res.write(data,[encoding]);`：向请求发送内容
-   `res.end([data],[encoding);`：结束请求

## 一 请求处理参数处理

### 1.1 GET 请求参数处理

GET 请求的参数封装在 `req.url` 中，只要将该字段的值解析为 json 即可：

```js
var http = require('http')
var url = require('url')

var server = http.createServer(function (req, res) {
    //true代表直接将结果解析为json
    var params = url.parse(req.url, true).query
    console.log(params) // GET请求参数被解析为json对象，如：{name:'lisi'}

    res.end('hello')
})

server.listen(8000)
```

### 1.2 POST 请求参数处理

POST 请求的参数封装在请求体中，Node 需要不断监听，每当接收到请求体数据，就累加到 post 参数的变量中：

```js
var http = require('http');
var querystring = require('querystring');

http.createServer( function(req,res){

    var str = '';

    req.on('data',function(data){
         str += data;
    });

    req.on('end',function{

        // 将post请求体数据转换为json格式
        var params = querystring.parse(str);
        console.log(params);

    });

    res.end();

}).listen(8000);
```

## 二 响应处理

### 2.1 返回响应结果

示例：

```js
var http = require('http')

var server = http.createServer(function (req, res) {
    res.write('<h1>hello world</h1>')
    res.end()
})

server.listen(8000)
```

`res.write()` 中的参数即返回给浏览器的字符串，浏览器可以识别字符串中的标签，然后进行渲染。当然 `res.end()` 也可以返回这些数据，会追加在 `write()` 渲染的界面之后。

### 2.2 编码处理

Node 本身的编码与浏览器的编码一致，才能使返回结果正确的渲染在界面上，该场景尤其提现在返回结果包含中文时：

```js
res.setHeader('Content-Type', 'text/html; charset=utf-8')
res.end('你好')
```

### 2.3 响应头其他格式

上述示例中，响应头默认都是 `text/html` 格式，只能返回普通的 html 文档，一些特殊文件，如多媒体，则需要对响应头进行特殊处理。

响应 png 图片：

```js
res.setHeader('Content-Type', 'image/png')
res.end()
```

响应 CSS：

```js
res.setHeader('Content-Type', 'text/css')
res.end()
```

### 2.4 writeHead()

无论是 `res.statusCode = 200`, 还是 `res.setHeader()` 等方法，其最终在内部都会调用 `res.writeHead()` 方法将之前的一些响应头设置写入响应数据中。

## 三 Node 请求报文解析

### 3.0 报文解析原理

Node 的 http 模块其实是对 HTTP 报文的头进行解析，然后触发了 request 事件。如果请求中还带有内容部分（如 POST 请求具有报头、内容），内容部分需要用户自行接收和解析，通过报头的 Transfer-Encoding 或者 Content-Length 即可判断请求中是否带有内容：

```js
function hasBody(req) {
    return 'transter-encoding' in req.headers || 'content-length' in req.headers
}
```

在 HTTP_Parser 解析报头结束后，报文内容部分会通过 data 事件触发，用户以流的方式处理即可：

```js
function (req, res){

    if (!hasBody(req)) {
        console.log("没有数据报文可解析");
        return
    }

    var bufs = [];

    req.on('data', function(chunk){
        bufs.push(chunk);
    });

    req.on('end', function(){
        // 将接受到的Buffer列表转换为Buffer对象，再转换为没有乱码的字符串，暂时存放于rawBody属性处
        req.rawBody = Buffer.concat(buffers).toString();
    })

}
```

### 3.1 普通表单数据解析

有了上面的函数，就可以用来直接解析表单中的数据了：

```js
function handle(req, res){
    if(req.headers['contengt-type]' === 'application/x-www-form-urlencoded'){
        req.body = querystring.parse(req.rawBody);
    }
    // 业务代码
}
```

### 3.2 解析 json 数据

如果提交的数据是 JSON，在 Node 中直接就可以处理，但是需要注意的是，Content-Type 中可能还附带了如下的编码信息：

```txt
Content-Type:application/json;charset=utf-8
```

在判断时就需要注意区分：

```js
function(req, res){
    if(req.headers['contengt-type]' === 'application/json'){
        var str = req.headers['content-type'] || '';
        console.log("json参数为：", str.split(';')[0]);
    }
}
```

Node 直接解析 JSON 文件：

```js
function handle(req, res) {
    if (mime(req) === 'application/json') {
        try {
            req.body = JSON.parse(req.rawBody)
        } catch (e) {
            res.writeHead(400)
            res.end('Invalid JSON')
            return
        }
    }
    // 业务代码
}
```

### 3.3 Node 解析 XML 文件

同样 XML 的请求类型是`application/xml`，但是 Node 不能直接解析 XML，需要借助第三方库，如`xml2js`：

```js
var xml2js = require('xml2js')

function handle(req, res) {
    if (mime(req) === 'application/xml') {
        xm2js.parseString(req.rawBody, function (err, xml) {
            if (err) {
                console.log('解析XML异常：', err)
                res.writeHead(400)
                res.end('Invalid XML')
                return
            }

            req.body = xml
            // 业务代码
        })
    }
}
```
