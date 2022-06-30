# 07-Web 安全

## 一 网络安全概述

## 二 XSS

### 2.0 XSS 概述

XSS 安全包括：反射型 XSS、存储型 XSS。

### 2.1 反射型 XSS

反射型 XSS 过程：

```txt
黑客将带有 url 地址发送给用户，但是该地址中携带着特殊参数：恶意脚本
用户点击此链接，请求信息被发送到服务端
服务端使用恶意参数后，黑客需要的数据被响应到前台
```

示例：

```js
// 反射型 XSS：/goods?category=<script>alert(1)</script>
app.get('/goods', (req, res) => {
  let { category } = req.query

  let goods = {
    books: [{ name: '木许传' }, { name: '金平没' }],
    tools: [{ name: 'ipad' }, { name: 'iphone' }],
  }
  let currentGoods = goods[category]

  let detail = ''
  if (currentGoods) {
    detail = currentGoods.map((item) => `<li>${item.name}</li>`).join('')
  } else {
    detail = `此分类下没有商品`
  }
  res.setHeader('Content-Type', 'text/html;charset=utf8')
  res.send(`
        <h1>商品分类：${category}</h1>
        <ul>${detail}</ul>
    `)
})
```

反射型 XSS 必须听过用户点击才能发起，其本质其实是服务端没有对恶意的用户输入内容进行安全处理，导致响应了不改响应的内容。

现代浏览器一般内置了 XSS 过滤器，可以防止大部分反射型 XSS 攻击。

### 2.2 存储型 XSS

存储型 XSS 过程：

```txt
黑客将恶意脚本代码上传到了服务端
当用户访问视，服务端读取恶意数据并直接使用（如：返回含有恶意脚本的页面）
```

示例：

```js
// 持久型 XSS：常见于用户评论
app.get('/comments', (req, res) => {
  // 假设用户提交了一个评论如下：
  let commont = '你好啊<script>alert(1)</script>'
  // 后台渲染该评论
  res.send(`
        <h1>评论列表</h1>
        <ul>
            <li>${commont}</li>
        </ul>
    `)
})
```

### 2.3 DOM-Based 型 XSS

该类型 XSS 由于是修改 DOM 结构导致，所以不需要服务端支持。过程如下：

```txt
用户打开带有恶意的链接
浏览器在解析 DOM 时，使用恶意数据
```

DOM-Based 型 XSS 常见触发场景是：修改 `innerHTML`、`outerHTML`、`document.write()` 。

### 2.4 XSS 解决方案

方案一：设置 cookie 为 http-only

可以让本地无法获取 cookie：

```js
// 服务端设置
res.cookie('sid', '10002343&^&*%21212e&', { httpOnly: true })

// 本地无法获取，值为空字符串
document.cookie
```

但不能从根本上解决 XSS，只是不能让本地获取 cookie。

方案二：对提交的数据进行转义，当然前后台都需要进行过滤

```js
function encode(str) {
  return String(str)
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/'/g, '&#39')
    .replace(/"/g, '&quot;')
    .replace(/$/g, '&amp;')
}
```

## 三 跨站请求伪造 CSRF

### 3.1 原理

跨站请求伪造 CSRF（Cross Site Request Forgery），一般是用户点开了一个比较吸引人的网站，其内部内嵌了一个没有宽高不会被发现的内容，过程如下：

```txt
用户 A 登录网站，登录成功后设置 cookie
用户 A 点击了黑客站点，返回一个页面，该页面伪造一个请求到目的网站（如银行）
```

示例：

```html
<div>吸引人的内容</div>
<iframe src="http://hack.com" style="width:0;height:0"></iframe>
```

`http://hack.com` 在等待一定时间后向正规网站提交数据（如向正规转账页面提供用户数据，此时 cookie 是有效的）

### 3.2 解决方案

第一道防线：验证码，每次提交都要提交新的验证码，用户体验较差

第二道防线：服务端检查 refer，不可靠，容易被绕过

```js
let referer = req.headers['referer']
if(referer == ){

}
```

第三种：token，是目前主流方案。
