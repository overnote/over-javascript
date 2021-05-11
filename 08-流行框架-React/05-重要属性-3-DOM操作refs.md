# 05-重要属性-3-DOM 操作 refs

## 一 refs 概念

MVVM 框架推崇以数据来驱动界面更新，而不是直接操作 DOM，但是 React 官方还是提供了 refs 属性，用来直接操作 DOM。

可以使用 `ref` 来标识 JSX 中的元素，组件会将标识了 ref 的元素收集到自身的 refs 属性中。

官方仍然不推荐不推荐大量使用 ref，这会导致当前页面绑定的耦合度过高，不利于后期扩展，维护。

## 二 refs 使用

### 2.1 使用方式一：字符串

在组件、DOM 节点上挂载函数：

```js
class Comp extends React.Component {
  showRefs = () => {
    console.log(this.refs)
    console.log(this.refs.input1.value)
  }
  render() {
    return (
      <div>
        <input ref=()=>{} type="text" />
        <input ref="input2" type="password" />
        <button onClick={this.showRefs}>点击获取refs</button>
      </div>
    )
  }
}
```

但是 react 已经不推荐使用该方式，用于理解 refs 属性即可。

### 2.2 使用方式二：回调函数（推荐）

```js
class Comp extends React.Component {
    cb = c => {
        console.log('c:', c) // c 为 input
        this.input1 = c
    }
    showRefs = () => {
        const { input1 } = this
        console.log(input1.value)
    }
    render() {
        return (
            <div>
                <input ref={this.cb} type="text" />
                <button onClick={this.showRefs}>点击获取refs</button>
            </div>
        )
    }
}
```

注意：如果 ref 的回调函数是以内联函数方式定义，在**更新**时会执行两次，第一次传入的是 null，第二次传入的是元素对象。因为每次渲染时会创建一个新的函数实例，所以 React 会清空旧的 ref 并且设置新的。

### 2.3 使用方式三：React.createRef() React16.3 提供的新方式

```js
class ClassComp extends React.Component {
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
