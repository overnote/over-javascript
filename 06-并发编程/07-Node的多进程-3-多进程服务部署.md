# 07-Node 的多进程 -3-多进程服务部署

## 零 服务部署

使用多进程架构搭建了 Node 集群环境，充分利用了多核 CPU 资源，但是仍然有很多细节要考虑：

- 多个工作进程的存活状态管理
- 工作进程的平滑重启
- 配置数据的动态载入
- 等等

## 一 进程事件

send() 方法除了 message 事件外，还有其他以下事件：

- error：子进程无法被复制，无法被杀死，无法发送消息时触发
- exit：子进程退出时触发，如果是正常退出，该事件第一个参数为退出码，否则为 null。如果子进程是通过 kill 退出，则会得到第二个参数，表示杀死进程时的信号
- close：在子进程的标准输入、输出流终止时触发，参数与 exit 相同
- disconnect：在父进程或子进程中调用 disconnect() 方法时触发该事件，在调用该方法时将关闭监听 IPC 通道

kill() 方法并不能真正将通过 IPC 相连的子基础讷航杀死，只是给子进程发送了一个系统信号：

```js
// 子进程
child.kill([signal])

// 当前进程
process.kill(pid, [signal])
```

上述代码一个发送给子进程，一个发送给目标进程。Node 提供了大部分信号的事件操作用来通知进程：

```js
process.on('SIGTERM', function () {
  console.log('Got a SIGTERM, exiting...')
  process.exit(1)
})

console.log('server running with PID:', process.pid)

process.kill(process.pid, 'SIGTERM')
```

## 二 自动重启

### 2.1 自动重启的实现

有了父子进程之间的事件机制，可以通过监听子进程的 exit 事件来获知退出的信息，就可以重新启动一个工作进程来继续服务。

master 代码如下：

```js
var cp = require('child_process')
var os = require('os')
var net = require('net')

var server = net.createServer()
server.listen(1337)

var workers = {}

// 启动时，循环创建多个工作进程
var cpuNum = os.cpus().length
for (var i = 0; i < cpuNum; i++) {
  createWorker()
}

// 进程自己退出时，让所有工作进程退出
process.on('exit', function () {
  for (var pid in workers) {
    workers[pid].kill()
  }
})

function createWorker() {
  var worker = fork('./worker.js')

  // 退出时重新启动进程
  worker.on('exit', function () {
    delete workers[worker.pid]
    createWorker()
  })

  // 句柄转发
  worker.send('server', server)
  workers[worker.pid] = worker
}
```

此时产生的工作进程如果使用 kill 命令杀死，则会再次重新启动一个新的工作进程。

实际场景中，也会有 bug 导致的工作进程退出，需要对该异常进行处理，worker.js 如下：

```js
var http = require('http')

var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('handled by child, pid is ' + process.pid + '\n')
})

var worker

process.on('message', function (msg, tcpSocket) {
  if (msg === 'server') {
    worker = tcpSocket
    worker.on('connection', function (socket) {
      server.emit('connection', socket)
    })
  }
})

process.on('uncaughtException', function () {
  // 停止接收新的连接
  worker.close(function () {
    // 所有连接断开后，退出进程
    process.exit(1)
  })
})
```

在上述代码中，一旦有未捕获的异常出现，工作进程就会立即停止接收新的连接，当所有连接断开后，退出进程。主进程在真挺到工作进程的 exit 后，将会立即启动新的进程服务，以此保证整个集群中总是有进程在为用户服务。

### 2.2 自杀信号

在 2.1 中的代码，仍然有问题：所有连接断开后进程才退出，在极端场景下，所有工作进程都停止接收新的连接，全部处在等待退出状态，在此过程中，所有新来的请求都无法正常获得服务！

为了解决上述问题，必须不能再工作进程退出后才重新启动新的工作进程，当然更不能直接退出工作进程，这样会断开当前正在服务的用户。可以在退出流程中增加自杀信号（suicide），工作进程在得知要退出时，向主进程发送一个自杀信号，然后才停止接收新的连接，当所有连接断开后才退出。主进程接收到自杀信号后，立即创建新的工作进程服务。

worker.js：

```js
process.on('uncaughtException', function () {
  process.send({
    act: 'suicide',
  })

  // 停止接收新连接
  worker.close(function () {
    // 所有已有连接断开后，退出进程
    process.exit(1)
  })
})
```

master.js 的修改：

```js
// 进程自己退出时，让所有工作进程退出
process.on('exit', function () {
  for (var pid in workers) {
    workers[pid].kill()
  }
})

function createWorker() {
  var worker = fork('./worker.js')

  // 启动新进程
  worker.on('message', function (msg) {
    if (msg.act === 'suicide') {
      createWorker()
    }
  })

  // 退出时重新启动进程
  worker.on('exit', function () {
    delete workers[worker.pid]
    createWorker()
  })

  // 句柄转发
  worker.send('server', server)
  workers[worker.pid] = worker
}
```

现在模拟异常退出，将工作进程的业务处理代码改为抛出异常，一旦有用户请求，就会有一个工作进程退出：

```js
var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('handled by child, pid is ' + process.pid + '\n')
  throw new Error('throw exception')
})
```

上述方案：创建新的工作进程在前，退出异常进程在后，每个异常进程退出前，都有新的工作进程来替换！应用的健壮性就大幅提升。

### 2.3 长连接问题

在 2.2 中，如果不是 HTTP 短连接，而是长连接，等待长连接断开耗时较久，可以为已有连接的断开设置一个超时时间：

```js
process.on('uncaughtException', function () {
  // 记录一些系统日志

  // 发送自杀信号
  process.send({
    act: 'suicide',
  })

  // 停止接收新连接
  worker.close(function () {
    // 所有已有连接断开后，退出进程
    process.exit(1)
  })

  // 5 秒后退出进程
  setTimeout(function () {
    process.exit(1)
  }, 5000)
})
```

### 2.4 限量重启

还有一个极端情况：工作进程不能被无限制重启，比如一些程序 BUG 上线后导致频繁重启是无意义的，必须保证程序不能反复无意义重启。比如在规定在单位时间内只能重启多少次，超过触发 giveup 事件：

```js
var cp = require('child_process')
var os = require('os')
var net = require('net')

var server = net.createServer()
server.listen(1337)

var workers = {}

// 启动时，循环创建多个工作进程
var cpuNum = os.cpus().length
for (var i = 0; i < cpuNum; i++) {
  createWorker()
}

// 进程自己退出时，让所有工作进程退出
process.on('exit', function () {
  for (var pid in workers) {
    workers[pid].kill()
  }
})

var limit = 10 // 重启次数
var during = 60000 // 时间单位
var restart = [] //
function isTooFrequently() {
  // 记录重启时间
  var time = Date.now()
  var length = restart.push(time)
  if (length > limit) {
    // 取出最后 10 个记录
    restart = restart.slice(limit * -1)
  }

  // 最后一次重启到钱 10 次重启之间的时间间隔
  return (
    restart.length >= limit && restart[restart.length - 1] - restart[0] < during
  )
}

function createWorker() {
  // 检查是否太频繁
  if (isTooFrequently()) {
    process.emit('giveup', length, during)
    return
  }

  var worker = fork('./worker.js')

  // 启动新进程
  worker.on('message', function (msg) {
    if (msg.act === 'suicide') {
      createWorker()
    }
  })

  // 退出时重新启动进程
  worker.on('exit', function () {
    delete workers[worker.pid]
    createWorker()
  })

  // 句柄转发
  worker.send('server', server)
  workers[worker.pid] = worker
}
```

## 三 负载均衡

在多进程之间监听相同的端口，使得用户请求能够分散到多个进程上进行处理，让 CPU 被充分利用了，但是还有一个极端情况：某个特定的 CPU 还没处理完任务就被分配一个新的任务，久而久之，这个 CPU 相较于其他 CPU 负载更大。

负载均衡策略就是让各个工作进程能够合理分配到任务。Node 在 0.11 之后，引入的负载均衡策略是 Round-Robin，即轮叫调度：

```txt
由主进程接收连接，依次分发给工作进程
分发策略：在 N 个工作进程中，每次选择第 i = (i + 1)mod n 个进程来发送连接
```

启用轮叫调度的方式：

```txt
# 方式一：在 cluster 模块中启动
cluster.schedulingPolicy = cluster.SCHED_RR     # 关闭为：cluster.schedulingPolicy = cluster.SCHED_NONE

# 方式二：环境变量中设置 NODE_CLUSTER_SCHED_POLICY 的值
export NODE_CLUSTER_SCHED_POLICY=rr             # 关闭为：export NODE_CLUSTER_SCHED_POLICY=none
```

## 四 企业级进程管理工具 pm2

针对上面中 Node 的问题，有些第三方专业工具可以进行 Node 的多进程管理，如进程管理工具 pm2，pm2 可以有效的监控服务器状况，并让 node 服务器自动重启，支持守护进程。

安装 pm2：

```txt
npm install pm2 -g
```

使用 pm2：

```txt
开启：pm2 start ***.js                      # node 关闭窗口仍然运行，且会自动重启
参数启动：pm2 start **.js --name=”test”    # 启动应用程序并命名为 "api"
关闭：pm2 stop **.js
重启：pm2 restart **.js
```

pm2 可以监控并管理多个应用程序，并对其进行日志监控。

进程监控命令：`pm2 list`，监控界面：
![pm2 监控界面](/images/node/pm2list.png)

日志监控：`pm2 logs 项目名/id名`，监控界面：
![pm2 监控界面](/images/node/pm2logs.png)
