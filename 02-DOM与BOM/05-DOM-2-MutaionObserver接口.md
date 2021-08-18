# 05-DOM-2-MutaionObserver 接口

## 一 MutaionObserver 接口基本用法

MutaionObserver 是 H5 新增的接口，可以在 DOM 背修改时异步执行回调，用来观察整个文档、DOM 树、某个元素、元素属性等变化。该接口可以取代以前的 MutationEvent。

```js
let observer = new MutationObserver(
  (mutationRecords) => console.log('监控到改变：', mutationRecords) // 监控到变化后输出
)
observer.observe(document.body, { attributes: true })

// 测试属性变化
document.body.className = 'foo'
console.log('属性改变了') // 先输出
```

贴士：

- 回调函数的第一个参数： MutationRecord 数组包含顺序入队的触发事件，而且连续的修改会生成多个 MutationRecord 实例。
- 回调函数的第二个参数：是观察变化的 MutationObserver 的实例

## 二 常见使用方法

### 2.1 disconnect()

被观察的元素如果没有被垃圾回收，在默认情况下监控到的 DOM 变化事件都会响应。但是使用 disconnect() 方法可以提前终止回调：

```js
let observer = new MutationObserver(() =>
  console.log('<body> attributes changed')
)
observer.observe(document.body, { attributes: true })

// 示例没有输出
document.body.className = 'foo'
observer.disconnect()
document.body.className = 'bar'
```

要想让已经加入任务队列的回调执行，可以使用 setTimeout()让已经入列的回调执行完毕再调用 disconnect()：

```js
let observer = new MutationObserver(() =>
  console.log('<body> attributes changed')
)
observer.observe(document.body, { attributes: true })

// 示例：<body> attributes changed
document.body.className = 'foo'
setTimeout(() => {
  observer.disconnect()
  document.body.className = 'bar'
}, 0)
```

### 2.2 复用 MutationObserver

多次调用 observe()方法，可以复用一个 MutationObserver 对象观察多个不同的目标节点。此时， MutationRecord 的 target 属性可以标识发生变化事件的目标节点：

```js
// 向页面主体添加两个子节点
let childA = document.createElement('div')
let childB = document.createElement('span')
document.body.appendChild(childA)
document.body.appendChild(childB)

// 观察两个子节点
let observer = new MutationObserver((mutationRecords) =>
  console.log(mutationRecords.map((x) => x.target))
)
observer.observe(childA, { attributes: true })
observer.observe(childB, { attributes: true })

// 示例输出：[<div>, <span>]
childA.setAttribute('foo', 'bar')
childB.setAttribute('foo', 'bar')
```

### 2.3 重用 MutationObserver

调用 disconnect()并不会结束 MutationObserver 的生命。还可以重新使用这个观察者，再将它关联到新的目标节点：

```js
let observer = new MutationObserver(() =>
  console.log('<body> attributeschanged')
)
observer.observe(document.body, { attributes: true })

// 这行代码会触发变化事件
document.body.setAttribute('foo', 'bar')

// 断开后不会触发变化事件
setTimeout(() => {
  observer.disconnect()
  document.body.setAttribute('bar', 'baz')
}, 0)

// 再次重用，可以再次监听
setTimeout(() => {
  observer.observe(document.body, { attributes: true })
  document.body.setAttribute('baz', 'qux')
}, 0)
```

## 三 MutationObserverInit 与观察范围

观察者可以观察的事件包括属性变化、文本变化和子节点变化：

```txt
subtree 布尔值，表示除了目标节点，是否观察目标节点的子树（后代）
        默认为 false，只观察目标节点的变化；如果是 true，则观察目标节点及其整个子树

attributes 布尔值，表示是否观察目标节点的属性变化，默认为 false

attributeFilter 字符串数组，表示要观察哪些属性的变化，默认为观察所有属性
        把这个值设置为 true 也会将 attributes 的值转换为 true

attributeOldValue 布尔值，默认为 false，表示 MutationRecord 是否记录变化之前的属性值
        把这个值设置为 true 也会将 attributes 的值转换为 true

characterData 布尔值，默认为 false，表示修改字符数据是否触发变化事件

characterDataOldValue 布尔值，默认为 false，表示 MutationRecord 是否记录变化之前的字符数据
        把这个值设置为 true 也会将 characterData 的值转换为 true

childList 布尔值，默认为 false，表示修改目标节点的子节点是否触发变化事件
```

## 四 MutationObserver 机制与性能问题

### 4.1 MutationObserver 解决的问题

在 MutationObserver 出现之前，DOM Level 2 规范中的 MutationEvent 定义了一组在 DOM 变化时触发的事件，该接口有严重的性能问题，MutationObserver 是为了解决这个问题而诞生的。

### 4.2 MutationObserver 原理

MutationObserver 接口的核心是异步回调与记录队列模型，为了在大量变化事件发生时不影响性能，每次变化的信息（由观察者实例决定）会保存在 MutationRecord 实例中，然后添加到记录队列。该队列可以保证即使变化事件被爆发式地触发，也不会显著地拖慢浏览器。

每次 MutationRecord 被添加到 MutationObserver 的记录队列时，仅当之前没有已排期的微任务回调时（队列中微任务长度为 0），才会将观察者注册的回调（在初始化 MutationObserver 时传入）作为微任务调度到任务队列上。这样可以保证记录队列的内容不会被回调处理两次。

回调执行后，这些 MutationRecord 就用不着了，因此记录队列会被清空，其内容会被丢弃。不过调用 MutationObserver 实例的 takeRecords()方法可以直接清空记录队列，取出并返回其中的所有 MutationRecord 实例：

```js
let observer = new MutationObserver((mutationRecords) =>
  console.log(mutationRecords)
)
observer.observe(document.body, { attributes: true })

document.body.className = 'foo'
document.body.className = 'bar'
document.body.className = 'baz'
console.log(observer.takeRecords())
console.log(observer.takeRecords())
// [MutationRecord, MutationRecord, MutationRecord]
// []
```

takeRecords() 常用的场合是 disconnect() 断开与观察者联系后，有需要处理抛弃队列中的 MutationRecord 实例。

### 4.3 MutationObserver 的问题

使用 MutationObserver 依然是有代价的，MutationObserver 对观察的目标节点之间是弱引用，即不会妨碍垃圾回收，但是目标节点对 MutationObserver 观察者却是强引用，如果目标节点从 DOM 中被移除，随后被垃圾回收，则关联的 MutationObserver 也会被垃圾回收。

此外记录队列中的每个 MutationRecord 实例至少包含对已有 DOM 节点的一个引用。如果变化是 childList 类型，则会包含多个节点的引用。记录队列和回调处理的默认行为是耗尽这个队列，处理每个 MutationRecord，然后让它们超出作用域并被垃圾回收。有时候可能需要保存某个观察者的完整变化记录，保存这些 MutationRecord 实例，也就会保存它们引用的节点，因而会妨碍这些节点被回收。如果需要尽快地释放内存，建议从每个 MutationRecord 中抽取出最有用的信息，然后保存到一个新对象中，最后抛弃 MutationRecord。
