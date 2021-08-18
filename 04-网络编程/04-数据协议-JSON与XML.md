# 04-数据协议-JSON 与 XML

## 一 数据交互协议

最常见的前后端数据交互方式有两种：

- JSON：轻量的通用数据格式，是目前互联网领域的主流数据交互格式
- XML：曾经的互联网数据传输事实标准

## 二 JSON

### 2.1 JSON 简介

JSON（JavaScript Object Notation）是 JS 的严格子集，可以用来替代以前的标准数据方案 XML，因为 **JSON 可以直接传给 eval()而不需要创建 DOM**。

贴士： JSON 不属于 JavaScript，它们只是拥有相同的语法而已。 JSON 也不是只能在 JavaScript 中使用，它是一种通用数据格式。很多语言都有解析和序列化 JSON 的内置能力。

### 2.2 JSON 语法

JSON 语法支持表示 3 种类型的值。

```txt
简单值：字符串、数值、布尔值和 null 可以在 JSON 中出现，特殊值 undefined 不可以。如："Hello world!"
对象：第一种复杂数据类型，对象表示有序键/值对。每个值可以是简单值，也可以是复杂类型。
数组：第二种复杂数据类型，数组表示可以通过数值索引访问的值的有序列表。数组的值可以是任意类型，包括简单值、对象，甚至其他数组。
```

ES5 新增了 JSON 解析全局对象 `JSON`，该对象提供了 2 个方法：

- stringify()：将 JS 序列化为 JSON 字符串
- parse()：将 JSON 字符串解析为原生 JS，若字符串无效，则会解析错误。

### 2.3 序列化方法 stringify()

```js
let obj = {
  id: 1001,
  name: 'Li',
  brothers: ['WW', 'ZS'],
}
// 参数二可选，表示只序列化哪些： JSON.stringify(book, ["name", "brothers"])
let objStr = JSON.stringify(obj)
console.log(objStr)
```

参数二可以是一个函数，具备过滤功能：

```js
let jsonText = JSON.stringify(obj, (key, value) => {
  switch (key) {
    case 'name':
      return value.join('-')
    case 'id':
      return 100
    default:
      return value
  }
})
```

toJSON() 方法可以自定义序列化：

```js
let obj = {
  id: 1001,
  name: 'Li',
  brothers: ['WW', 'ZS'],
  toJSON: function () {
    return this.name
  },
}
```

toJSON()方法可以与过滤函数一起使用，因此理解不同序列化流程的顺序非常重要。在把对象传给 JSON.stringify()时会执行如下步骤。

```txt
(1) 如果可以获取实际的值，则调用 toJSON()方法获取实际的值，否则使用默认的序列化。
(2) 如果提供了第二个参数，则应用过滤。传入过滤函数的值就是第(1)步返回的值。
(3) 第(2)步返回的每个值都会相应地进行序列化。
(4) 如果提供了第三个参数，则相应地进行缩进
```

### 2.4 解析方法 parse()

JSON.parse()方法也可以接收一个额外的参数，这个函数会针对每个键/值对都调用一次。为区别于传给 JSON.stringify()的起过滤作用的替代函数（ replacer），这个函数被称为还原函数（ reviver）。实际上它们的格式完全一样，即还原函数也接收两个参数，属性名（ key）和属性值（ value），另外也
需要返回值。

如果还原函数返回 undefined，则结果中就会删除相应的键。如果返回了其他任何值，则该值就会成为相应键的值插入到结果中。还原函数经常被用于把日期字符串转换为 Date 对象。例如：

```js
let book = {
  id: 1001,
  name: 'Li',
  brothers: ['WW', 'ZS'],
  date: new Date(2020, 12, 11),
}

let objText = JSON.stringify(obj)

let objCopy = JSON.parse(objText, (key, value) =>
  key == 'date' ? new Date(value) : value
)
console.log(objCopy.date.getFullYear())
```

## 三 XML

### 3.1 创建 XML 文档

DOM Level 2 中可以直接创建 XML 文档，要创建一个 document 对象标签名为`<root>`的新 XML 文档，示例如下：

```js
let xmldom = document.implementation.createDocument('', 'root', null)
console.log(xmldom.documentElement.tagName) // "root"

let child = xmldom.createElement('child')
xmldom.documentElement.appendChild(child)
```

### 3.2 XML 解析为 DOM

DOMParser 类型是 Firefox 中把 XML 解析为 DOM 文档的类，现在大多浏览器都已实现：

```js
let parser = new DOMParser()
let xmldom = parser.parseFromString('<root><child/></root>', 'text/xml')

console.log(xmldom.documentElement.tagName) // "root"
console.log(xmldom.documentElement.firstChild.tagName) // "child"

let anotherChild = xmldom.createElement('child')
xmldom.documentElement.appendChild(anotherChild)
let children = xmldom.getElementsByTagName('child')
console.log(children.length) // 2
```

在发生解析错误时， parseFromString()方法仍会返回一个 Document 对象，只不过其 document 元素是`<parsererror>`，该元素的内容为解
析错误的描述。

### 3.3 DOM 解析为 XML

要序列化 DOM 文档，必须创建 XMLSerializer 的新实例，然后把文档传给 serializeToString()方法：

```js
let serializer = new XMLSerializer()
let xml = serializer.serializeToString(xmldom)
console.log(xml)
```
