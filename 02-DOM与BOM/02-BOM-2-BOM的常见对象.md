# 02-BOM-2-BOM 的常见对象

## 一 location 对象

### 1.1 location 基础使用

location 用户获取、设置窗体的 URL，以及解析 URL。location 对象既是 window 对象的属性，也是 document 对象的属性，即 window.location 和 document.location 引用的是同一个对象。

location 上常用的成员：

```js
location.host // "www.demo.com:80" 服务器名及端口号
location.hostname // "www.demo.com" 服务器名
location.href // "http:/www.demo.com" URL的触发地址
location.origin // "http://www.demo.com" URL 的只读源地址
location.pathname // /user/order
location.search // "?name=lisi"
location.hash // "#contents"
location.assign() // 重定向
location.replace() // 不记录历史，直接替换当前页面
location.reload() // 重载页面，也可能是从缓存加载
location.reload(true) // 重载页面，从服务器加载
```

### 1.2 解析查询参数

自定义一个解析函数：

```js
function getQueryStringArgs() {
  //取得查询字符串并去掉开头的问号
  let qs = location.search.length > 0 ? location.search.substring(1) : "",
    //保存数据的对象
    args = {},
    //取得每一项
    items = qs.length ? qs.split("&") : [],
    item = null,
    name = null,
    value = null,

  //逐个将每一项添加到 args 对象中
  for (let i = 0; i < items.length;; i++) {
    item = items[i].split("=");
    name = decodeURIComponent(item[0]);
    value = decodeURIComponent(item[1]);
    if (name.length) {
      args[name] = value;
    }
  }

  return args;
}

// 使用示例
let args = getQueryStringArgs()
console.log(args['username'])
```

浏览器也提供了标准的 url 参数构造对象 URLSearchParams：

```js
let qs = '?q=javascript&num=10'
let searchParams = new URLSearchParams(qs)
console.log(searchParams.toString()) // " q=javascript&num=10"
searchParams.has('num') // true
searchParams.get('num') // 10
searchParams.set('page', '3')
console.log(searchParams.toString()) // " q=javascript&num=10&page=3"
searchParams.delete('q')
console.log(searchParams.toString()) // " num=10&page=3"
```

大多数支持 URLSearchParams 的浏览器也支持将 URLSearchParams 的实例用作可迭代对象：

```js
let qs = '?q=javascript&num=10'
let searchParams = new URLSearchParams(qs)
for (let param of searchParams) {
  console.log(param)
}
// ["q", "javascript"]
// ["num", "10"]
```

## 二 navigator 对象

navigator 对象用于标识浏览器：

```js
navigator.appCodeName // 浏览器名称，通常为Mozilla
navigator.userAgent // 用户代理字符串
```

## 三 screen 对象

screen 对象保存了客户端的能力信息，如像素宽度、像素高度，很少使用。

## 四 H5 新增成员

### 4.1 storage 存储机制

传统 web 存储方式以 `document.cookie` 来进行，但是其存储大小只有 4k 左右，并且解析复杂。在 HTML5 规范中使用 Storage 存储，分别有两种存储方式：

```txt
会话存储：
    设置：window.sessionStorage.setItem("name","lisi");
    获取：window.sessionStorage.getItem("name");
    删除：window.sessionStorage.removeItem("name");
    清除：window.sessionStorage.clear();
    说明：生命周期为关闭浏览器窗口,在同一个窗口下数据可以共享，可存储大约5M

本地存储：
    获取：window.localStorage
    获取：window.localStorage.getItem("name");
    删除：window.localStorage.removeItem("name");
    清除：window.localStorage.clear();
    说明：永久生效，除非手动删除,可以多窗口共享,可存储大约20M
```

贴士：一些其他网络存储方案 WebSQL、IndexDB 已经被 w3c 放弃了。

### 4.1 history 历史状态

history 记录了用户曾经浏览过的页面(URL),并可以实现浏览器前进与后退相似导航的功能。

```js
// 后退一页
history.go(-1)
// 前进一页
history.go(1)
// 前进两页
history.go(2)

// 简写方法：后退一页
history.back()
// 简写方法：前进一页
history.forward()
```

在以前，通过 hashchange 事件，可以知道 URL 的参数什么时候发生了变化，H5 的 history 对象额外提供了历史状态管理功能，通过状态管理，可以改变浏览器访问的 历史：

```js
history.pushState({ name: 'Nicholas' }, "Nicholas' page", 'nicholas.html')
```

要更新当前状态，可以调用 replaceState()，传入的参数与 pushState()的前两个参数相同。调用这个方法不会在历史状态栈中创建新状态，只会重写当前状态。

```js
history.replaceState({ name: 'Greg' }, "Greg's page")
```

### 4.2 navigator.geolocation 地理位置

HTML5 提供了 Geolocation 地理位置支持。目前大多数浏览器都可以支持（IE9+）。出于安全考虑，部分最新的浏览器只允许通过 HTTPS 协议使用 GeolocationAPI，在 http 协议下回跑出异常，当然本地开发不会有问题。

```js
navigator.geolocation //会提示用户是否允许获取该API的权限
```

示例代码：

```js
//判断浏览器是否兼容代码
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function success(position) {
      console.log('获取位置成功，当前位置为：', position)
    },
    function errror(error) {
      console.log('获取位置错误，错误为：', error)
    },
    {
      timeout: 10000,
    }
  )
} else {
  //没有获取到地理位置执行的操作
}
```

获取位置后返回的信息：

```txt
# 获取成功，返回 position 参数对象，包含：
timestamp： 获取位置时的时间戳
ciirds：    坐标信息对象，内部包含：latitude（纬度），longitude（经度），accuracy（坐标精度，单位为米）

# 获取失败，返回 错误 对象，常见为：
code:   错误标识，1为用户拒绝分享位置 2为获取用户位置失败 3为获取超时 0为其他错误

# 传入的位置参数对象：
timeout:允许获取位置的超时时间，单位为毫秒
enableHighAccuracy： 布尔值是否获取高精度信息
maximumAge：用户位置信息缓存的最大时间，默认为0，单位是毫秒
```

当用户位置发生变化时，可以通过 watchPostion 方法监听用户的位置信息，该方法和 getCurrentPosition 使用方式一致：

```javascript
let watchID = navigator.geolocation.watchPosition(success, error, option)
//取消监听
navigator.geolocation.clearWatch(watchID)
```

### 4.3 onLine 检测用户网络状态

我们可以通过 window.onLine 来检测，用户当前的网络状况，返回一个布尔值

```js
window.online //用户网络连接时被调用
window.offline //用户网络断开时被调用
window.addEventListener('online', function () {
  console.log('已经建立了网络连接')
})
window.addEventListener('offline', function () {
  console.log('已经失去了网络连接')
})
```
