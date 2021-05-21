# 07-Web 安全

## 一 安全问题汇总

## 方案一 设置 cookie 为 http-only

可以让本地无法获取 cookie：

```js
// 服务端设置
res.cookie('sid', '10002343&^&*%21212e&', { httpOnly: true })

// 本地无法获取，值为空字符串
document.cookie
```

但不能从根本上解决 XSS，只是不能让本地获取 cookie。

## 方案二：用户内容编码

防线一：对提交的数据进行转义，当然前后台都需要进行过滤

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

## 跨站脚本攻击

用户点开了一个比较吸引人的网站，其内部内嵌了一个没有宽高不会被发现的内容：

```html
<div>吸引人的内容</div>
<iframe src="http://hack.com" style="width:0;height:0"></iframe>
```

`http://hack.com` 在等待一定时间后向正规网站提交数据（如向正规转账页面提供用户数据，此时 cookie 是有效的）

解决方案：

第一道防线：验证码，每次提交都要提交新的验证码，用户体验较差

第二道防线：服务端检查 refer，不可靠，容易被绕过

```js
let referer = req.headers['referer']
if(referer == ){

}
```

第三种：token，是目前主流方案。
