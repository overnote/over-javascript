# 05-重要属性-1-状态 state

## 一 组件状态 state 概念

在 React 组件**实例**上，挂载了三个重要属性：

-   **state**：组件的状态
-   **props**：收集组件的外部数据
-   **refs**：操作组件的 DOM

组件的内部数据称为状态（state），**状态的更改能够驱动视图的变更**。不过状态是无法直接更改的，需要借助 API：`setState()`。

## 二 类式组件使用状态

类式组件使用状态示例：

```js
class Comp extends React.Component {
    constructor(props) {
        super(props)
        // 初始化状态
        this.state = {
            name: 'lisi',
            age: 13,
        }
    }
    change = () => {
        let { age } = this.state
        age += 1
        this.setState({ age: age }) // setState 会自动重新 render，而且是异步的！
    }
    render() {
        return (
            <div>
                <button onClick={this.change}>点击改变状态</button>
                <div>组件state数据：{this.state.age}</div>
            </div>
        )
    }
}
```

基于 ES6 类的语法，在构造器中书写状态可以如下简写：

```js
class Comp extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        name: 'lisi',
        age: 13,
    }

    // 其他代码...
}
```

## 三 函数式组件的状态

### 3.1 基本写法

函数式组件在 React16 之前无法使用状态，称为无状态组件，但是 HooksAPI 流行后，useState() 可以让函数式组件使用状态：

```js
import React from 'react'

export default function Count(props) {
    // useState 返回是数组，数组的两个元素是：状态值、更新状态的方法
    let [count, setCount] = React.useState(0)

    function add() {
        // 函数式写法：
        // setCount(count => {
        //     return count + 1
        // })

        // 常规写法：是参数写法的语法糖
        setCount(count + 1)
    }

    return (
        <div>
            状态值：{count}
            <button onClick={add}>点我修改状态</button>
        </div>
    )
}
```

### 3.2 多个状态写法

```js
import React from 'react'

export default function Count(props) {
    let [count, setCount] = React.useState(0)
    let [name, setName] = React.useState('Jack')

    function changeCount() {
        setCount(count + 1)
    }

    function changeName() {
        setName('Ross')
    }

    return (
        <div>
            count值：{count}
            <button onClick={changeCount}>点我修改count</button>
            <hr />
            name值：{name}
            <button onClick={changeName}>点我修改name</button>
        </div>
    )
}
```

### 3.3 状态的更新

react 的状态是异步更新的：

```js
state = { count: 0 }

// count 增加的触发函数
add = () => {
    const { count } = this.state
    this.setState({ count: count + 1 })
    console.log('count: ', this.state.count) // 仍然输出0
}
```

正确的写法是 setState 支持第二个参数，是一个 callback，代表状态改变之后执行的函数：

```js
state = { count: 0 }

// count 增加的触发函数
add = () => {
    const { count } = this.state
    this.setState({ count: count + 1 }, () => {
        console.log('count: ', this.state.count) // 仍然输出0
    })
}
```

callback 是在状态更新、render()执行之后才执行！
