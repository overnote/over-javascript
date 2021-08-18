# 11-Node 与加密-2-加密通信

## 一 Node 中的 TCP 使用 TLS 服务

### 1.1 服务端

Node 的 tls 模块可以创建一个安全的 TCP 服务：

```js
const tls = require('tls')
const fs = require('fs')

let options = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
  requestCert: true,
  ca: [fs.readFileSync('./keys/ca.crt')],
}

const server = tls.createServer(options, function (stream) {
  console.log(
    'server connected',
    stream.authorized ? 'authorized' : 'unauthorized'
  )
  stream.write('welcome!\n')
  stream.setEncoding('utf8')
  stream.pipe(stream)
})

server.listen(8000, function () {
  console.log('server bound')
})
```

启动后测试证书：

```txt
openssl s_client -connect 127.0.0.1:8000
```

### 1.2 客户端

在构建客户端之前，需要为客户端生成属于自己的私钥和签名：

```txt
# 创建私钥
openssl genrsa -out client.key 1024

# 生成CSR
openssl req -new -key client.key -out client.csr

# 生成签名证书
openssl x509 -req -CA ca.crt -CAkey ca.key -CAcreateserial -in client.csr -out client.crt
```

构建客户端：

```js
const tls = require('tls')
const fs = require('fs')

let options = {
  key: fs.readFileSync('./keys/client.key'),
  cert: fs.readFileSync('./keys/client.crt'),
  ca: [fs.readFileSync('./keys/ca.crt')],
}

let stream = tls.connect(8000, options, function () {
  console.log(
    'client connected',
    stream.authorized ? 'authorized' : 'unauthorized'
  )
  process.stdin.pipe(stream)
})

stream.setEncoding('utf8')

stream.on('data', function (data) {
  console.log(data)
})

stream.on('end', function () {
  server.close()
})
```

## 二 Node 中使用 HTTPS 服务

### 2.1 服务端

HTTPS 服务器代码:

```js
const https = require('https')
const fs = require('fs')

let options = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
}

https
  .createServer(options, function (req, res) {
    res.writeHead(200)
    res.end('hello world\n')
  })
  .listen(8000)
```

启动后通过 curl 进行测试：

```txt
curl https://localhost:8000/
```

此时会爆出错误警告，因为 curl 工具无法验证服务端证书是否正确，解决方案：

- 加 -k 选项，忽略证书验证，这样仍然通过公钥加密传输，但是无法保证对方是否可靠，存在中间人攻击风险
- 使用：`curl --cacert keys/ca.crt https://localhost:8000/`

### 2.2 客户端

```js
const https = require('https')
const fs = require('fs')

let options = {
  hostname: 'localhost',
  port: 8000,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('./keys/client.key'),
  cert: fs.readFileSync('./keys/client.crt'),
  ca: [fs.readFileSync('./keys/ca.crt')],
}

options.agent = new https.Agent(options)

let req = https.request(options, function (res) {
  res.setEncoding('utf-8')
  res.on('data', function (d) {
    console.log(d)
  })
})

req.end()

req.on('error', function (e) {
  console.log(e)
})
```

如果不设置 ca 选项，则会得到异常：`Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE`。解决方案是添加选项属性：rejectUnauthorized 为 false，其效果与 curl 工具添加 -k 一致。
