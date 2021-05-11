# 09-客户端存储-3-IndexedDB

## 一 IndexedDB 概念

Indexed Database API 简称 IndexedDB，是浏览器中存储结构化数据的一个方案。 IndexedDB 用于代替目前已废弃的 Web SQL Database API。

IndexedDB 背后的思想是创造一套 API，方便 JavaScript 对象的存储和获取，同时也支持查询和搜索。IndexedDB 的设计几乎完全是异步的。为此，大多数操作以请求的形式执行，这些请求会异步执行，产生成功的结果或错误。绝大多数 IndexedDB 操作要求添加 onerror 和 onsuccess 事件处理程序来确定输出。

2017 年，新发布的主流浏览器（ Chrome、 Firefox、 Opera、 Safari）完全支持 IndexedDB。 IE10/11 和 Edge 浏览器部分支持 IndexedDB。

IndexedDB 是类似于 MySQL 或 Web SQL Database 的数据库。与传统数据库最大的区别在于，IndexedDB 使用对象存储而不是表格保存数据。 IndexedDB 数据库就是在一个公共命名空间下的一组对象存储，类似于 NoSQL 风格的实现。

## 二 IndexedDB 的使用

### 2.0 基本使用

使用 IndexedDB 数据库的第一步是调用 indexedDB.open()方法，并给它传入一个要打开的数据库名称。如果给定名称的数据库已存在，则会发送一个打开它的请求；如果不存在，则会发送创建并打开这个数据库的请求。这个方法会返回 IDBRequest 的实例，可以在这个实例上添加 onerror 和 onsuccess 事件处理程序。举例如下：

```js
let db,
    request,
    version = 1
request = indexedDB.open('admin', version)
request.onerror = event => alert(`Failed to open: ${event.target.errorCode}`)
request.onsuccess = event => {
    db = event.target.result
}
```

以前， IndexedDB 使用 setVersion()方法指定版本号。这个方法目前已废弃。如前面代码所示，要在打开数据库的时候指定版本。这个版本号会被转换为一个 unsigned long long 数值，因此不要使用小数，而要使用整数。

在两个事件处理程序中， event.target 都指向 request，因此使用哪个都可以。 如果 onsuccess 事件处理程序被调用，说明可以通过 event.target.result 访问数据库（ IDBDatabase）实例了，这个实例会保存到 db 变量中。之后，所有与数据库相关的操作都要通过 db 对象本身来进行。如果打开数据库期间发生错误， event.target.errorCode 中就会存储表示问题的错误码。

### 2.1 对象存储

建立了数据库连接之后，下一步就是使用对象存储。如果数据库版本与期待的不一致，那可能需要创建对象存储。不过，在创建对象存储前，有必要想一想要存储什么类型的数据。

假设要存储包含用户名、密码等内容的用户记录。可以用如下对象来表示一条记录：

```js
let user = {
    username: '007',
    firstName: 'James',
    lastName: 'Bond',
    password: 'foo',
}
```

观察这个对象，可以很容易看出最适合作为对象存储键的 username 属性。用户名必须全局唯一，它也是大多数情况下访问数据的凭据。这个键很重要，因为创建对象存储时必须指定一个键。

数据库的版本决定了数据库模式，包括数据库中的对象存储和这些对象存储的结构。如果数据库还不存在， open()操作会创建一个新数据库，然后触发 upgradeneeded 事件。可以为这个事件设置处理程序，并在处理程序中创建数据库模式。如果数据库存在，而你指定了一个升级版的版本号，则会立即触发 upgradeneeded 事件，因而可以在事件处理程序中更新数据库模式。

下面的代码演示了为存储上述用户信息如何创建对象存储：

```js
request.onupgradeneeded = event => {
    const db = event.target.result
    // 如果存在则删除当前 objectStore。测试的时候可以这样做
    // 但这样会在每次执行事件处理程序时删除已有数据
    if (db.objectStoreNames.contains('users')) {
        db.deleteObjectStore('users')
    }
    db.createObjectStore('users', { keyPath: 'username' })
}
```

这里第二个参数的 keyPath 属性表示应该用作键的存储对象的属性名。

### 2.2 事务

创建了对象存储之后，剩下的所有操作都是通过事务完成的。事务要通过调用数据库对象的 transaction()方法创建。任何时候，只要想要读取或修改数据，都要通过事务把所有修改操作组织起来。最简单的情况下，可以像下面这样创建事务：

```js
let transaction = db.transaction()
```

如果不指定参数，则对数据库中所有的对象存储有只读权限。更具体的方式是指定一个或多个要访问的对象存储的名称：

```js
let transaction = db.transaction('users')
```

这样可以确保在事务期间只加载 users 对象存储的信息。如果想要访问多个对象存储，可以给第一个参数传入一个字符串数组：

```js
let transaction = db.transaction(['users', 'anotherStore'])
```

如前所述，每个事务都以只读方式访问数据。要修改访问模式，可以传入第二个参数。这个参数应该是下列三个字符串之一： "readonly"、 "readwrite"或"versionchange"。比如：

```js
let transaction = db.transaction('users', 'readwrite')
```

这样事务就可以对 users 对象存储读写了。

有了事务的引用， 就可以使用 objectStore()方法并传入对象存储的名称以访问特定的对象存储。然后， 可以使用 add()和 put()方法添加和更新对象，使用 get()取得对象，使用 delete()删除对象，使用 clear()删除所有对象。其中， get()和 delete()方法都接收对象键作为参数，这 5 个方法都创建新的请求对象。来看下面的例子：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    request = store.get('007')
request.onerror = event => alert('Did not get the object!')
request.onsuccess = event => alert(event.target.result.firstName)
```

因为一个事务可以完成任意多个请求，所以事务对象本身也有事件处理程序： onerror 和 oncomplete。这两个事件可以用来获取事务级的状态信息：

```js
transaction.onerror = event => {
    // 整个事务被取消
}
transaction.oncomplete = event => {
    // 整个事务成功完成
}
```

注意，不能通过 oncomplete 事件处理程序的 event 对象访问 get()请求返回的任何数据。因此，仍然需要通过这些请求的 onsuccess 事件处理程序来获取数据。

### 2.3 插入对象

拿到了对象存储的引用后，就可以使用 add()或 put()写入数据了。这两个方法都接收一个参数，即要存储的对象，并把对象保存到对象存储。这两个方法只在对象存储中已存在同名的键时有区别。这种情况下， add()会导致错误，而 put()会简单地重写该对象。更简单地说，可以把 add()想象成插入新值，而把 put()想象为更新值。因此第一次初始化对象存储时，可以这样做：

```js
// users 是一个用户数据的数组
for (let user of users) {
    store.add(user)
}
```

每次调用 add()或 put()都会创建对象存储的新更新请求。如果想验证请求成功与否，可以把请求对象保存到一个变量，然后为它添加 onerror 和 onsuccess 事件处理程序：

```js
// users 是一个用户数据的数组
let request,
    requests = []
for (let user of users) {
    request = store.add(user)
    request.onerror = () => {
        // 处理错误
    }
    request.onsuccess = () => {
        // 处理成功
    }
    requests.push(request)
}
```

创建并填充了数据后，就可以查询对象存储了。

### 2.4 通过游标查询

使用事务可以通过一个已知键取得一条记录。如果想取得多条数据，则需要在事务中创建一个游标。游标是一个指向结果集的指针。与传统数据库查询不同，游标不会事先收集所有结果。相反，游标指向第一个结果，并在接到指令前不会主动查找下一条数据。

需要在对象存储上调用 openCursor()方法创建游标。与其他 IndexedDB 操作一样， openCursor()方法也返回一个请求，因此必须为它添加 onsuccess 和 onerror 事件处理程序。例如：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    request = store.openCursor()
request.onsuccess = event => {
    // 处理成功
}
request.onerror = event => {
    // 处理错误
}
```

在调用 onsuccess 事件处理程序时，可以通过 event.target.result 访问对象存储中的下一条记录，这个属性中保存着 IDBCursor 的实例（有下一条记录时）或 null（没有记录时）。这个 IDBCursor 实例有几个属性：

```txt
direction：字符串常量，表示游标的前进方向以及是否应该遍历所有重复的值。可能的值包括：
    NEXT("next")、 NEXTUNIQUE("nextunique")、 PREV("prev")、 PREVUNIQUE("prevunique")。

key：对象的键。

value：实际的对象。

primaryKey：游标使用的键。可能是对象键或索引键
```

可以像下面这样取得一个结果：

```js
request.onsuccess = event => {
    const cursor = event.target.result
    if (cursor) {
        // 永远要检查
        console.log(`Key: ${cursor.key}, Value: ${JSON.stringify(cursor.value)}`)
    }
}
```

注意，这个例子中的 cursor.value 保存着实际的对象。正因为如此，在显示它之前才需要使用 JSON 来编码。

游标可用于更新个别记录。 update()方法使用指定的对象更新当前游标对应的值。与其他类似操作一样，调用 update()会创建一个新请求，因此如果想知道结果，需要为 onsuccess 和 onerror 赋值：

```js
request.onsuccess = event => {
    const cursor = event.target.result
    let value, updateRequest
    if (cursor) {
        // 永远要检查
        if (cursor.key == 'foo') {
            value = cursor.value // 取得当前对象
            value.password = 'magic!' // 更新密码
            updateRequest = cursor.update(value) // 请求保存更新后的对象
            updateRequest.onsuccess = () => {
                // 处理成功
            }
            updateRequest.onerror = () => {
                // 处理错误
            }
        }
    }
}
```

也可以调用 delelte()来删除游标位置的记录，与 update()一样，这也会创建一个请求：

```js
request.onsuccess = event => {
    const cursor = event.target.result
    let value, deleteRequest
    if (cursor) {
        // 永远要检查
        if (cursor.key == 'foo') {
            deleteRequest = cursor.delete() // 请求删除对象
            deleteRequest.onsuccess = () => {
                // 处理成功
            }
            deleteRequest.onerror = () => {
                // 处理错误
            }
        }
    }
}
```

如果事务没有修改对象存储的权限， update()和 delete()都会抛出错误。默认情况下，每个游标只会创建一个请求。要创建另一个请求，必须调用下列中的一个方法：

```txt
continue(key)：移动到结果集中的下一条记录。参数 key 是可选的。如果没有指定 key，游标就移动到下一条记录；如果指定了，则游标移动到指定的键。

advance(count)：游标向前移动指定的 count 条记录。
```

这两个方法都会让游标重用相同的请求，因此也会重用 onsuccess 和 onerror 处理程序，直至不再需要。例如，下面的代码迭代了一个对象存储中的所有记录：

```js
request.onsuccess = event => {
    const cursor = event.target.result
    if (cursor) {
        // 永远要检查
        console.log(`Key: ${cursor.key}, Value: ${JSON.stringify(cursor.value)}`)
        cursor.continue() // 移动到下一条记录
    } else {
        console.log('Done!')
    }
}
```

调用 cursor.continue()会触发另一个请求并再次调用 onsuccess 事件处理程序。在没有更多记录时， onsuccess 事件处理程序最后一次被调用，此时 event.target.result 等于 null。

### 2.5 键范围

使用游标会给人一种不太理想的感觉，因为获取数据的方式受到了限制。使用键范围（ key range）可以让游标更容易管理。键范围对应 IDBKeyRange 的实例。有四种方式指定键范围，第一种是使用 only()方法并传入想要获取的键：

```js
const onlyRange = IDBKeyRange.only('007')
```

这个范围保证只获取键为"007"的值。使用这个范围创建的游标类似于直接访问对象存储并调用 get("007")。

第二种键范围可以定义结果集的下限。下限表示游标开始的位置。例如，下面的键范围保证游标从"007"这个键开始，直到最后：

```js
// 从"007"记录开始，直到最后
const lowerRange = IDBKeyRange.lowerBound('007')
```

如果想从"007"后面的记录开始，可以再传入第二个参数 true：

```js
// 从"007"的下一条记录开始，直到最后
const lowerRange = IDBKeyRange.lowerBound('007', true)
```

第三种键范围可以定义结果集的上限，通过调用 upperBound()方法可以指定游标不会越过的记录。下面的键范围保证游标从头开始并在到达键为"ace"的记录停止：

```js
// 从头开始，到"ace"记录为止
const upperRange = IDBKeyRange.upperBound('ace')
```

如果不想包含指定的键，可以在第二个参数传入 true：

```js
// 从头开始，到"ace"的前一条记录为止
const upperRange = IDBKeyRange.upperBound('ace', true)
```

要同时指定下限和上限，可以使用 bound()方法。这个方法接收四个参数：下限的键、上限的键、可选的布尔值表示是否跳过下限和可选的布尔值表示是否跳过上限。下面是几个例子：

```js
// 从"007"记录开始，到"ace"记录停止
const boundRange = IDBKeyRange.bound('007', 'ace')
// 从"007"的下一条记录开始，到"ace"记录停止
const boundRange = IDBKeyRange.bound('007', 'ace', true)
// 从"007"的下一条记录开始，到"ace"的前一条记录停止
const boundRange = IDBKeyRange.bound('007', 'ace', true, true)
// 从"007"记录开始，到"ace"的前一条记录停止
const boundRange = IDBKeyRange.bound('007', 'ace', false, true)
```

定义了范围之后，把它传给 openCursor()方法，就可以得到位于该范围内的游标：

```js
const store = db.transaction('users').objectStore('users'),
    range = IDBKeyRange.bound('007', 'ace')
request = store.openCursor(range)
request.onsuccess = function (event) {
    const cursor = event.target.result
    if (cursor) {
        // 永远要检查
        console.log(`Key: ${cursor.key}, Value: ${JSON.stringify(cursor.value)}`)
        cursor.continue() // 移动到下一条记录
    } else {
        console.log('Done!')
    }
}
```

这个例子只会输出从键为"007"的记录开始到键为"ace"的记录结束的对象，比上一节的例子要少。

### 2.6 设置游标方向

openCursor()方法实际上可以接收两个参数，第一个是 IDBKeyRange 的实例，第二个是表示方向的字符串。通常，游标都是从对象存储的第一条记录开始，每次调用 continue()或 advance()都会向最后一条记录前进。这样的游标其默认方向为"next"。如果对象存储中有重复的记录，可能需要游标跳过那些重复的项。为此，可以给 openCursor()的第二个参数传入"nextunique"：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    request = store.openCursor(null, 'nextunique')
```

注意， openCursor()的第一个参数是 null，表示默认的键范围是所有值。此游标会遍历对象存储中的记录，从第一条记录开始迭代，到最后一条记录，但会跳过重复的记录。

另外，也可以创建在对象存储中反向移动的游标，从最后一项开始向第一项移动。此时需要给 openCursor()传入"prev"或"prevunique"作为第二个参数（后者的意思当然是避免重复）。例如：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    request = store.openCursor(null, 'prevunique')
```

在使用"prev"或"prevunique"打开游标时，每次调用 continue()或 advance()都会在对象存储中反向移动游标。

### 2.7 索引

对某些数据集，可能需要为对象存储指定多个键。例如，如果同时记录了用户 ID 和用户名，那可能需要通过任何一种方式来获取用户数据。为此，可以考虑将用户 ID 作为主键，然后在用户名上创建索引。要创建新索引，首先要取得对象存储的引用，然后像下面的例子一样调用 createIndex()：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    index = store.createIndex('username', 'username', { unique: true })
```

createIndex()的第一个参数是索引的名称，第二个参数是索引属性的名称，第三个参数是包含键 unique 的 options 对象。这个选项中的 unique 应该必须指定，表示这个键是否在所有记录中唯一。因为 username 可能不会重复，所以这个键是唯一的。

createIndex()返回的是 IDBIndex 实例。在对象存储上调用 index()方法也可以得到同一个实例。例如，要使用一个已存在的名为"username"的索引，可以像下面这样：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    index = store.index('username')
```

索引非常像对象存储。可以在索引上使用 openCursor()方法创建新游标，这个游标与在对象存储上调用 openCursor()创建的游标完全一样。只是其 result.key 属性中保存的是索引键，而不是主键。下面看一个例子：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    index = store.index('username'),
    request = index.openCursor()
request.onsuccess = event => {
    // 处理成功
}
```

使用 openKeyCursor()方法也可以在索引上创建特殊游标，只返回每条记录的主键。这个方法接收的参数与 openCursor()一样。最大的不同在于， event.result.key 是索引键，且 event.result.value 是主键而不是整个记录:

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    index = store.index('username'),
    request = index.openKeyCursor()
request.onsuccess = event => {
    // 处理成功
    // event.result.key 是索引键， event.result.value 是主键
}
```

可以使用 get()方法并传入索引键通过索引取得单条记录，这会创建一个新请求：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    index = store.index('username'),
    request = index.get('007')
request.onsuccess = event => {
    // 处理成功
}
request.onerror = event => {
    // 处理错误
}
```

如果想只取得给定索引键的主键，可以使用 getKey()方法。这样也会创建一个新请求，但 result.value 等于主键而不是整个记录：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    index = store.index('username'),
    request = index.getKey('007')
request.onsuccess = event => {
    // 处理成功
    // event.target.result.key 是索引键， event.target.result.value 是主键
}
```

在这个 onsuccess 事件处理程序中， event.target.result.value 中应该是用户 ID。

任何时候，都可以使用 IDBIndex 对象的下列属性取得索引的相关信息:

```txt
name：索引的名称。
keyPath：调用 createIndex()时传入的属性路径。
objectStore：索引对应的对象存储。
unique：表示索引键是否唯一的布尔值。
```

对象存储自身也有一个 indexNames 属性，保存着与之相关索引的名称。使用如下代码可以方便地了解对象存储上已存在哪些索引：

```js
const transaction = db.transaction('users'),
    store = transaction.objectStore('users'),
    indexNames = store.indexNames
for (let indexName in indexNames) {
    const index = store.index(indexName)
    console.log(`Index name: ${index.name} KeyPath: ${index.keyPath} Unique: ${index.unique}`)
}
```

以上代码迭代了每个索引并在控制台中输出了它们的信息。

在对象存储上调用 deleteIndex()方法并传入索引的名称可以删除索引：

```js
const transaction = db.transaction("users"),
store = transaction.objectStore("users"),
store.deleteIndex("username");
```

因为删除索引不会影响对象存储中的数据，所以这个操作没有回调。

## 三 并发问题

IndexedDB 虽然是网页中的异步 API，但仍存在并发问题。如果两个不同的浏览器标签页同时打开了同一个网页，则有可能出现一个网页尝试升级数据库而另一个尚未就绪的情形。有问题的操作是设置数据库为新版本，而版本变化只能在浏览器只有一个标签页使用数据库时才能完成。

第一次打开数据库时，添加 onversionchange 事件处理程序非常重要。另一个同源标签页将数据库打开到新版本时，将执行此回调。对这个事件最好的回应是立即关闭数据库，以便完成版本升级。例如：

```js
let request, database
request = indexedDB.open('admin', 1)
request.onsuccess = event => {
    database = event.target.result
    database.onversionchange = () => database.close()
}
```

应该在每次成功打开数据库后都指定 onversionchange 事件处理程序。 记住， onversionchange 有可能会被其他标签页触发。

通过始终都指定这些事件处理程序，可以保证 Web 应用程序能够更好地处理与 IndexedDB 相关的并发问题。

## 四 限制

IndexedDB 的很多限制实际上与 Web Storage 一样。首先， IndexedDB 数据库是与页面源（协议、域和端口）绑定的，因此信息不能跨域共享。这意味着 www.wrox.com 和 p2p.wrox.com 会对应不同的数据存储。

其次，每个源都有可以存储的空间限制。当前 Firefox 的限制是每个源 50MB，而 Chrome 是 5MB。移动版 Firefox 有 5MB 限制，如果用度超出配额则会请求用户许可。

Firefox 还有一个限制——本地文本不能访问 IndexedDB 数据库。 Chrome 没有这个限制。
