# 02-JSX 简介

## 一 JSX 概念

HTML 语言直接写在 JavaScript 语言之中，不加任何引号，这就是 JSX 的语法。

JSX 实质上这只是一个语法糖，每一个标签都会被 JSX 转换成纯 Javascript 代码，当然你想直接使用纯 Javascript 代码写也是可以的，只是利用 JSX，组件的结构和组件之间的关系看上去更加清晰，组件写起来类似 HTML，极为简单。

JSX 优势示例：

```js
// 传统书写方式
const vdom = React.createElement('h1', {id: 'title', React.createElement('span', {},'Hello World!')})

// jsx书写方式
const vdom = <h1 id="title"><span>Hello World!</span></h1>
```

## 二 JSX 基础语法

### 2.1 插值表达式

插值表达式中只能使用 JS 表达式，并不能直接书写 JS 语句，如 for 循环等。JS 表达式会产生一个值，可以放在任何需要该值的地方。

常见的表达式有：

- `num`
- `num++`
- `fn(num)`（这是函数表达式）
- `arr.map()`

示例：

```js
function App() {
  let title = 'hello' // 在JSX中使用表达式

  let fn = function (obj) {
    console.log(obj.name)
  }

  let user = {
    age: 21,
    name: 'lisi',
  }

  return (
    <div className="App">
      <h2>{title} world</h2>
      <div>{fn(user)}</div>
    </div>
  )
}
```

贴士：后续代码一般都是修改根组件 App 内的内容，多行标签外部需要使用 `()` 包裹。

### 2.2 注释

JSX 的注释写法：

```js
(
  <h1>{/* 注释 */}Hello World</h1>

  <h1>
    {
      //注释
    }
    Hello World
  </h1>
)
```

## 三 JSX 与 HTML

JSX 中只能书写一个根标签。

类似 `<input>` 这样的标签需要使用闭合形式：

```js
<input \>
```

## 四 JSX 与 CSS

### 4.1 class 类名与 for

JSX 中给组件添加类名，无需表达式，直接书写即可，但是由于 class 是 JS 的关键字，需要使用 className 代替：

```js
const vdom = <div className="box"></div>
```

同理，CSS 中的 for 需要使用 htmlFor 代替。

### 4.2 行内样式书写格式

行内样式不能像类名那样直接书写，需要使用 `style={{key: value}}`格式：

```js
const vdom = <div style={{ color: 'red', fontSize: '20px' }}></div>
```

### 4.3 CSS 属性

如果在 JSX 中使用的属性不存在于 HTML 的规范中，这个属性会被忽略。如果要使用自定义属性，可以用 data- 前缀。

## 五 JSX 与 JS

## 5.1 遍历循环

在 JSX 中如果要渲染一个列表，需要生成一个数组数据，推荐使用 map 来遍历：

```js
function App() {
  let myDom = [1, 2, 3].map((item, index) => {
    return <p key={index}>{item}</p>
  })
  return <div className="App">{myDom}</div>
}
```

注意一：如果要渲染的 dom 在 return 之后有换行需求，需要将 jsx 语句用小括号包裹。

注意二：React 要求遍历时，必须要有唯一的 key 属性值。

当然传统的循环方式也是可行的：

```js
let myDom = []
for (let i in [1, 2, 3]) {
  myDom.push(<p key={i}>{[1, 2, 3][i]}</p>)
}
```

### 5.2 绑定事件函数

注意事件函数 on 之后的单词必须大写：

```js
<div onClick={() => {}}></div>
```

事件函数的默认参数即事件对象。
