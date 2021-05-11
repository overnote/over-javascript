# 05-重要属性-1-状态 state

## 一 组件状态 state

### 1.1 组件状态概念

组件的内部数据称为状态（state），状态的更改能够驱动视图的变更。

状态是无法直接更改的，需要借助 API：`setState()`。

贴士：函数式组件在 React16 之前无法使用状态，称无状态组件。

### 1.2 使用状态

```js
class Comp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'lisi',
            age: 13,
        }
    }
    change = () => {
        let { age } = this.state
        age += 1
        this.setState({ age: age })
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

setState 会自动重新 render，而且是异步的！

### 1.3 状态简写

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

## 二 状态的异步更新

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

## 三 函数式 setState

setState 可以直接传递一个函数作为参数：

```js
state = { count: 0 }

// count 增加的触发函数
add = () => {
    // const { count } = this.state // 无需获取原状态
    this.setState((state, props) => {
        return { count: state.count + 1 }
    })
}
```

之前书写的对象式的 setState 是函数式 setState 的语法糖。
