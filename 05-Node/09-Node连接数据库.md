# 09-Node 连接数据库

## 一 Node 连接 mysql

### 1.1 原生连接

```JavaScript
let db=mysql.createConnection({host, port, user, password, database});
db.query('select * from user', (err, data)=>{});
```

连接池配置：

```JavaScript
const express = require('express');
const mysql = require('mysql');

let mysqlDB = mysql.createPool({
    host:'localhost',
    post:3306,
    user:'root',
    password:'root',
    database:'suibian'
});

let app = express();

app.get('/api',function (req,res) {
    let query = 'select * from students';
    mysqlDB.query(query,function (err,data) {
        let name = data[0].name;
        res.send(name);
    });
});

app.listen(3000);

```

### 1.2 ORM 框架 sequlize

```txt
sequelize框架需要额外安装mysql2 包
npm install mysql2 --save
npm install sequelize --save
```

```JavaScript
const Sequelize = require('sequelize');
const mysqlConfig = {
    database: 'lib1', // 使用哪个数据库
    username: 'root', // 用户名
    password: 'root', // 口令
    host: 'localhost', // 主机名
    port: 3306 // 端口号，MySQL默认3306
};
let sequelize = new Sequelize(
 mysqlConfig.database,
 mysqlConfig.username,
  mysqlConfig.password,
 {
      host: mysqlConfig.host,
      dialect: 'mysql',
      pool: {
          max: 5,
          min: 0,
          idle: 30000
    }
});

//sequelize与数据库直连
// (async ()=>{
//     let table = await sequelize.query("SELECT * FROM users");
//     console.log(table);
// })();

//ORM
let User = sequelize.define('user', {
 //sequelize会给user自动添加s后缀
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true
    },
    name: Sequelize.STRING(100),
    age: Sequelize.STRING(10),
}, {
    timestamps: false       //关闭sequelize默认的timestamp的功能
});

let name = 'ha';
let age = 22;
(async ()=>{
    let dog = await User.create({
        id:0,
        name:name,
        age:age
    });
})();


```

## 二 Node 连接 Redis

### 2.1 连接示例

Redis 官方推荐的 Node.js 连接 Redis 驱动包有 node_redis 和 ioredis。本文以 ioredis 为例。

```js
const Redis = require('ioredis')

// let redis = new Redis();
// 指定地址访问
// let redis = new Redis(6379, '127.0.0.1');
let redis = new Redis({
  port: 6379, // Redis port
  host: '1****', // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: 'test',
  db: 0,
})

redis.set('name', 'lisi', function () {
  redis.get('name', function (error, result) {
    console.log(result)
  })
})
```

ioredis 支持在 HMSET 命令中使用对象作为参数，对象的属性值只能是字符串，相应的 HGETALL 会返回一个对象。
对事务的支持：

```js
let multi = redis.multi()
multi.set('foo1', 'bar1')
multi.sadd('foo2', 'bar2')
multi.exec(function (err, replies) {
  console.log(replies) //[ [ null, 'OK' ], [ null, 1 ] ]
})

//或者链式调用：
redis
  .multi()
  .set('foo3', 'bar3')
  .sadd('set', 'b')
  .exec(function (err, replies) {
    console.log(replies) //[ [ null, 'OK' ], [ null, 1 ] ]
  })
```

发布订阅：创建两个连接，分别充当发布者和订阅者

```js
let pub = new Redis({})

let sub = new Redis({})

sub.subscribe('chat', function () {
  pub.publish('chat', 'hi!')
})

sub.on('message', function (channel1, message) {
  console.log('收到 ' + channel1 + ' 频道的消息：' + message) //收到 chat 频道的消息 hi
})
```

注意：redis 建立连接也是异步的。连接建立完成前的 redi 操作都会被加入到离线任务队列中，连接成功后，按顺序依次执行。

### 2.2 消息队列

一般来说，消息队列有两种场景：

- 发布订阅模式：发布者向某个频道发布一条消息后，多个订阅者都会收到同一个消息
- 生产消费模式：生产者生产消息放到队列里，消费者同时监听队列，如果队列里有了新的消息就将其取走，对于单条消息，只能由一个消费者消费

发布订阅模式：

```js
// publisher
let redis = require('redis')
let client = redis.createClient(6379, '127.0.0.1')
client.on('error', function (err) {
  console.log(err)
})
client.on('ready', function () {
  client.publish('channel1', 'hello')
})

//subsciber
let redis = require('redis')
let client = redis.createClient(6379, '127.0.0.1')
client.on('error', function (err) {
  console.log(err)
})
client.subscribe('channel1')
client.on('message', function (channel, message) {
  console.log('channel: ', channel)
  console.log('message: ', message)
})
```

## 三 Node 连接 mongodb

```JavaScript
const MongoClient = require('mongodb').MongoClient;
const MongoURL = 'mongodb://localhost:27017/';
function _connectDB(callback) {
    MongoClient.connect(MongoURL,function (err,db) {
        if(err){
            console.log('Mongo未连接');
            callback(err,'Mongo未连接');
            return;
        }
        console.log('Mongo已连接');
        callback(null, db);
    });
}

//插入一个数据
exports.insertOne = function (dbname,collectionName,json,callback) {
    _connectDB(function (err,db) {
        if(err){
            throw err;
            return;
        }
        let dbObj = db.db(dbname);
        dbObj.collection(collectionName).insertOne(json, function (err, result) {
            if (err) {
                throw err;
                db.close();
                return;
            }
            callback(null, result);
            db.close();
        });
    });
};

```

使用：

```JavaScript
const db = require('./db');
db.insertOne('testdb','teacher',{'name':'lisi'},function (err,result) {
    if(err){
        console.log(err);
        return;
    }
    console.log('sucess');
});

```
