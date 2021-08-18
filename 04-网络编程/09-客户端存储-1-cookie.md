# 09-客户端存储-1-cookie

## 一 cookie

### 1.1 cookie 概念

cookie 最初用于在客户端存储会话信息，服务器在响应 HTTP 请求时，通过发送 Set-Cookie HTTP 头部包含会话信息，这个 HTTP 响应会设置一个名为"name"，值为"value"的 cookie。名和值在发送时都会经过 URL 编码。浏览器会存储这些会话信息，并在之后的每个请求中都会通过 HTTP 头部 cookie 再将它们发回服
务器，比如：

```txt
GET /index.jsl HTTP/1.1
Cookie: name=value
Other-header: other-header-value
```

### 1.2 cookie 的限制

cookie 是与特定域绑定的。设置 cookie 后，它会与请求一起发送到创建它的域。这个限制能保证 cookie 中存储的信息只对被认可的接收者开放，不被其他域访问。

因为 cookie 存储在客户端机器上，所以为保证它不会被恶意利用，浏览器会施加限制。 同时， cookie 也不会占用太多磁盘空间。

常见限制：

```txt
对cookie的数量有限制，IE为50个，Chrome不限制。
每个 cookie 不超过 4096 字节；
每个域不超过 20 个 cookie；
每个域不超过 81 920 字节。
```

### 1.3 cookie 的构成

cookie 在浏览器中是由以下参数构成的：

```txt
名称：唯一标识 cookie 的名称。 cookie 名不区分大小写，因此 myCookie 和 MyCookie 是同一个名称。不过，实践中最好将 cookie 名当成区分大小写来对待，因为一些服务器软件可能这样对待它们。 cookie 名必须经过 URL 编码。

值：存储在 cookie 里的字符串值。这个值必须经过 URL 编码。

域： cookie 有效的域。发送到这个域的所有请求都会包含对应的 cookie。这个值可能包含子域（如www.wrox.com），也可以不包含（如.wrox.com 表示对 wrox.com 的所有子域都有效）。如果不明确设置，则默认为设置 cookie 的域。

路径：请求 URL 中包含这个路径才会把 cookie 发送到服务器。例如，可以指定 cookie 只能由http://www.wrox.com/books/访问，因此访问 http://www.wrox.com/下的页面就不会发送 cookie，即使请求的是同一个域。

过期时间：表示何时删除 cookie 的时间戳（即什么时间之后就不发送到服务器了）。默认情况下，浏览器会话结束后会删除所有 cookie。不过，也可以设置删除 cookie 的时间。这个值是 GMT 格式（ Wdy, DD-Mon-YYYY HH:MM:SS GMT），用于指定删除 cookie 的具体时间。这样即使关闭浏览器 cookie 也会保留在用户机器上。把过期时间设置为过去的时间会立即删除 cookie。

安全标志：设置之后，只在使用 SSL 安全连接的情况下才会把 cookie 发送到服务器。例如，请求 https://www.wrox.com 会发送 cookie，而请求 http://www.wrox.com 则不会。
```

这些参数在 Set-Cookie 头部中使用分号加空格隔开：

```txt
HTTP/1.1 200 OK
Content-type: text/html
Set-Cookie: name=value; expires=Mon, 22-Jan-07 07:10:24 GMT; domain=.wrox.com
Other-header: other-header-value
```

## 二 cookie 在前端的应用

### 2.1 document.cookie

document.cookie 返回包含页面中所有有效 cookie 的字符串（根据域、路径、过期时间和安全设置），以分号分隔：

```txt
# 所有名和值都是 URL 编码的，因此必须使用 decodeURIComponent()解码
name1=value1;name2=value2;name3=value3
```

在设置值时，可以通过 document.cookie 属性设置新的 cookie 字符串。这个字符串在被解析后会添加到原有 cookie 中。设置 document.cookie 不会覆盖之前存在的任何 cookie，除非设置了已有的 cookie。设置 cookie 的格式如下，与 Set-Cookie 头部的格式一样：

```txt
name=value; expires=expiration_time; path=domain_path; domain=domain_name; secure
```

在所有这些参数中，只有 cookie 的名称和值是必需的。下面是个简单的例子：

```js
document.cookie = 'name=Lisi'
```

这个 cookie 在每次客户端向服务器发送请求时都会被带上，在浏览器关闭时就会被删除。虽然这样直接设置也可以，因为不需要在名称或值中编码任何字符，但最好还是使用 encodeURIComponent()对名称和值进行编码，比如：

```js
document.cookie = encodeURIComponent('name') + '=' + encodeURIComponent('Lisi')
```

要为创建的 cookie 指定额外的信息，只要像 Set-Cookie 头部一样直接在后面追加相同格式的字符串即可：

```js
document.cookie =
  encodeURIComponent('name') +
  '=' +
  encodeURIComponent('Lisi') +
  '; domain=.wrox.com; path=/'
```

### 2.2 CookieUtil

因为在 JavaScript 中读写 cookie 不是很直观，所以可以通过辅助函数来简化相应的操作。与 cookie 相关的基本操作有读、写和删除。这些在 CookieUtil 对象中表示如下：

```js
class CookieUtil {
  static get(name) {
    let cookieName = `${encodeURIComponent(name)}=`,
      cookieStart = document.cookie.indexOf(cookieName),
      cookieValue = null
    if (cookieStart > -1) {
      let cookieEnd = document.cookie.indexOf(';', cookieStart)
      if (cookieEnd == -1) {
        cookieEnd = document.cookie.length
      }
      cookieValue = decodeURIComponent(
        document.cookie.substring(cookieStart + cookieName.length, cookieEnd)
      )
    }
    return cookieValue
  }
  static set(name, value, expires, path, domain, secure) {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    if (expires instanceof Date) {
      cookieText += `; expires=${expires.toGMTString()}`
    }
    if (path) {
      cookieText += `; path=${path}`
    }
    if (domain) {
      cookieText += `; domain=${domain}`
    }
    if (secure) {
      cookieText += '; secure'
    }
    document.cookie = cookieText
  }
  static unset(name, path, domain, secure) {
    CookieUtil.set(name, '', new Date(0), path, domain, secure)
  }
}
```

### 2.3 删除 cookie

没有直接删除已有 cookie 的方法。为此，需要再次设置同名 cookie（包括相同路径、域和安全选项），但要将其过期时间设置为某个过去的时间。 CookieUtil.unset()方法实现了这些处理。这个方法接收 4 个参数：要删除 cookie 的名称、可选的路径、可选的域和可选的安全标志。

这些参数会传给 CookieUtil.set()，将 cookie 值设置为空字符串，将过期时间设置为 1970 年 1 月 1 日（以 0 毫秒初始化的 Date 对象的值）。这样可以保证删除 cookie。

```js
// 设置 cookie
CookieUtil.set('name', 'Nicholas')
CookieUtil.set('book', 'Professional JavaScript')
// 读取 cookie
alert(CookieUtil.get('name')) // "Nicholas"
alert(CookieUtil.get('book')) // "Professional JavaScript"
// 删除 cookie
CookieUtil.unset('name')
CookieUtil.unset('book')
// 设置有路径、域和过期时间的 cookie
CookieUtil.set(
  'name',
  'Nicholas',
  '/books/projs/',
  'www.wrox.com',
  new Date('January 1, 2010')
)
// 删除刚刚设置的 cookie
CookieUtil.unset('name', '/books/projs/', 'www.wrox.com')
// 设置安全 cookie
CookieUtil.set('name', 'Nicholas', null, null, null, true)
```

## 三 子 cookie

### 3.1 子 cookie 概念

为绕过浏览器对每个域 cookie 数的限制，有些开发者提出了子 cookie 的概念。子 cookie 是在单个 cookie 存储的小块数据，本质上是使用 cookie 的值在单个 cookie 中存储多个名/值对。最常用的子 cookie 模式如下：

```txt
name=name1=value1&name2=value2&name3=value3&name4=value4&name5=value5
```

子 cookie 的格式类似于查询字符串。这些值可以存储为单个 cookie，而不用单独存储为自己的名/值对。结果就是网站或 Web 应用程序能够在单域 cookie 数限制下存储更多的结构化数据。

### 3.2 SubCookieUtil

要操作子 cookie，就需要再添加一些辅助方法。解析和序列化子 cookie 的方式不一样，且因为对子 cookie 的使用而变得更复杂。比如，要取得某个子 cookie，就需要先取得 cookie，然后在解码值之前需要先像下面这样找到子 cookie：

```js
class SubCookieUtil {
  static get(name, subName) {
    let subCookies = SubCookieUtil.getAll(name)
    return subCookies ? subCookies[subName] : null
  }
  static getAll(name) {
    let cookieName = encodeURIComponent(name) + '=',
      cookieStart = document.cookie.indexOf(cookieName),
      cookieValue = null,
      cookieEnd,
      subCookies,
      parts,
      result = {}
    if (cookieStart > -1) {
      cookieEnd = document.cookie.indexOf(';', cookieStart)
      if (cookieEnd == -1) {
        cookieEnd = document.cookie.length
      }
      cookieValue = document.cookie.substring(
        cookieStart + cookieName.length,
        cookieEnd
      )
      if (cookieValue.length > 0) {
        subCookies = cookieValue.split('&')
        for (let i = 0, len = subCookies.length; i < len; i++) {
          parts = subCookies[i].split('=')
          result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1])
        }
        return result
      }
    }
    return null
  }
  // 省略其他代码
}
```

取得子 cookie 有两个方法： get()和 getAll()。 get()用于取得一个子 cookie 的值， getAll()用于取得所有子 cookie，并以对象形式返回，对象的属性是子 cookie 的名称，值是子 cookie 的值。 get()方法接收两个参数： cookie 的名称和子 cookie 的名称。这个方法先调用 getAll()取得所有子 cookie，然后返回要取得的子 cookie（如果不存在则返回 null）。

SubCookieUtil.getAll()方法在解析 cookie 值方面与 CookieUtil.get()方法非常相似。不同的是 SubCookieUtil.getAll()方法不会立即解码 cookie 的值，而是先用和号（ &）拆分，将所有子 cookie 保存到数组。然后，再基于等号（ =）拆分每个子 cookie，使 parts 数组的第一个元素是子 cookie 的名称，第二个元素是子 cookie 的值。两个元素都使用 decodeURIComponent()解码，并添加到 result 对象，最后返回 result 对象。如果 cookie 不存在则返回 null。

```js
// 假设 document.cookie=data=name=Lisi&des=hello%20word
// 取得所有子 cookie
let data = SubCookieUtil.getAll('data')
alert(data.name) // "Lisi"
alert(data.des) // hello world
// 取得个别子 cookie
alert(SubCookieUtil.get('data', 'name')) // "Nicholas"
alert(SubCookieUtil.get('data', 'book')) // "Professional JavaScript"
```

要写入子 cookie，可以使用另外两个方法： set()和 setAll()。这两个方法的实现如下：

```js
class SubCookieUtil {
  // 省略之前的代码
  static set(name, subName, value, expires, path, domain, secure) {
    let subcookies = SubCookieUtil.getAll(name) || {}
    subcookies[subName] = value
    SubCookieUtil.setAll(name, subcookies, expires, path, domain, secure)
  }
  static setAll(name, subcookies, expires, path, domain, secure) {
    let cookieText = encodeURIComponent(name) + '=',
      subcookieParts = new Array(),
      subName
    for (subName in subcookies) {
      if (subName.length > 0 && subcookies.hasOwnProperty(subName)) {
        subcookieParts.push(
          '${encodeURIComponent(subName)}=${encodeURIComponent(subcookies[subName])}'
        )
      }
    }
    if (cookieParts.length > 0) {
      cookieText += subcookieParts.join('&')
      if (expires instanceof Date) {
        cookieText += `; expires=${expires.toGMTString()}`
      }
      if (path) {
        cookieText += `; path=${path}`
      }
      if (domain) {
        cookieText += `; domain=${domain}`
      }
      if (secure) {
        cookieText += '; secure'
      }
    } else {
      cookieText += `; expires=${new Date(0).toGMTString()}`
    }
    document.cookie = cookieText
  }
  // 省略其他代码
}
```

使用示例：

```js
// 假设 document.cookie=data=name=Nicholas&book=Professional%20JavaScript
// 设置两个子 cookie
SubCookieUtil.set('data', 'name', 'Nicholas')
SubCookieUtil.set('data', 'book', 'Professional JavaScript')
// 设置所有子 cookie 并传入过期时间
SubCookieUtil.setAll(
  'data',
  { name: 'Nicholas', book: 'Professional JavaScript' },
  new Date('January 1, 2010')
)
// 修改"name"的值并修改整个 cookie 的过期时间
SubCookieUtil.set('data', 'name', 'Michael', new Date('February 1, 2010'))
```

### 3.3 删除子 coookie

常规 cookie 可以通过直接设置过期时间为某个过去的时间删除，但删除子 cookie 没有这么简单。为了删除子 cookie，需要先取得所有子 cookie，把要删除的那个删掉，然后再把剩下的子 cookie 设置回去。下面是相关方法的实现：

```js
class SubCookieUtil {
  // 省略之前的代码
  static unset(name, subName, path, domain, secure) {
    let subcookies = SubCookieUtil.getAll(name)
    if (subcookies) {
      delete subcookies[subName] // 删除
      SubCookieUtil.setAll(name, subcookies, null, path, domain, secure)
    }
  }
  static unsetAll(name, path, domain, secure) {
    SubCookieUtil.setAll(name, null, new Date(0), path, domain, secure)
  }
}
```

## 四 http-only

还有一种叫作 HTTP-only 的 cookie。 HTTP-only 可以在浏览器设置，也可以在服务器设置，但只能在服务器上读取，这是因为 JavaScript 无法取得这种 cookie 的值。因为所有 cookie 都会作为请求头部由浏览器发送给服务器，所以在 cookie 中保存大量信息可能会影响特定域浏览器请求的性能。保存的 cookie 越大，请求完成的时间就越长。即使浏览器对 cookie 大小有限制，最好还是尽可能只通过 cookie 保存必要信息，以避免性能问题。
