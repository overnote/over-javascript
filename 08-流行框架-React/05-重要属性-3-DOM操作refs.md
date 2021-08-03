# 05-重要属性-3-DOM 操作 refs

## 一 refs 概念

MVVM 框架推崇以数据来驱动界面更新，而不是直接操作 DOM，但是 React 官方还是提供了 refs 属性，用来直接操作 DOM。

在原生 JS 中，使用 id、class 等属性标识元素，即可操作该 DOM，在 React 中可以使用 `ref` 来标识 JSX 中的元素，组件会将标识了 ref 的元素收集到自身的 refs 属性中，开发者便可以操作对应 DOM 了，而且这里获取到的是真实 DOM！

不过官方仍然不推荐不推荐大量使用 ref，这会导致当前页面绑定的耦合度过高，不利于后期扩展，维护。

## 二 refs 使用

### 2.1 使用方式一：字符串

在组件、DOM 节点上使用字符串直接标识元素，但是该方式已经不被 React 官方推荐：

```js
class Comp extends React.Component {
    showRefs = () => {
        console.log(this.refs)
        console.log(this.refs.input1.value)
    }
    render() {
        return (
            <div>
                <input ref="input1" type="text" />
                <input ref="input2" type="password" />
                <button onClick={this.showRefs}>点击获取refs</button>
            </div>
        )
    }
}
```

过度使用 refs 属性会造成组件结构的臃肿、混乱，存在效率问题，依据层级关系合理使用 state 属性才是更恰当的。

### 2.2 使用方式二：回调函数

回调函数方式可以替换字符串方式：

```js
class Comp extends React.Component {
    cb = c => {
        console.log('被调用，c:', c) // c 为 input
        this.input1 = c
    }
    showRefs = () => {
        const { input1 } = this
        console.log(input1.value)
    }
    render() {
        return (
            <div>
                {/*<input ref={c=>this.input1 = c;console.log('被调用，c:',c)} type="text" />*/}
                <input ref={this.cb} type="text" />
                <button onClick={this.showRefs}>点击获取refs</button>
            </div>
        )
    }
}
```

上述的回调函数在页面被加载时，就会被调用一次，即输出：`被调用，c:`。

注意：如果 ref 是以内联函数形式存在，在以后组件**再更新**时会执行两次，第一次传入的是 null，第二次传入的是元素对象。因为每次渲染时会创建一个新的函数实例，所以 React 会清空旧的 ref 并且设置新的，上述直接书写的方式可以解决该问题。

### 2.3 使用方式三：React.createRef()

React16.3 提供了新的 refs 使用方式，即 React.createRef()：

```js
class Comp extends React.Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()
    }
    render() {
        return (
            <div>
                <input type="text" ref={this.myRef} />
                <button
                    onClick={() => {
                        console.log(this.myRef.current.value)
                    }}
                >
                    点击获取当前input数据
                </button>
            </div>
        )
    }
}
```
