# 10-HooksAPI

## 一 HooksAPI 简介

hook 是 React16.8 新增的重要特性，其核心功能是让函数式组件能够使用状态。

贴士：函数式组件的状态可以是对象，也可是基础类型。

## 二 常用 HooksAPI

### 2.1 useState

示例：

```js
import React from 'react'

export default function Count(props) {
    // useState 返回是数组，数组的两个元素是：状态值、更新状态的方法
    let [count, setCount] = React.useState(0)

    function add() {
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

useState 也支持函数参数写法：

```js
function add() {
    setCount(count => {
        return count + 1
    })
}
```

多个参数写法：

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

### 2.2 useEffect()

函数组件没有生命周期函数，hoos 提供了 useEffect() 用于监控组件状态的变更。

2.1 中的示例添加 useEffect Hook：

```js
let [count, setCount] = React.useState(0)
let [name, setName] = React.useState('Jack')

React.useEffect(() => {
    console.log('useEffect...')
})
```

上述示例中，点击 count、name 2 个改变状态的按钮，都会让 useEffect 执行。

如果传入第二个数组参数，只会监测指定数据数据。若传入空数组，则只在第一次加载时，运行一次 useEffect：

```js
React.useEffect(() => {
    console.log('useEffect...')
}, [count]) // 只有count状态发生改变才会触发 useEffect
```

useEffect 的第一个函数参数内部也可以返回一个函数，这个返回的函数会在组件卸载时触发：

```js
React.useEffect(() => {
    console.log('useEffect...')
    return () => {
        console.log('component will unmount...')
    }
})
```

### 2.3 useRef

useRef 可以在函数式组件中存储、查找组件内的一些数据：

```js
import React from 'react'

export default function Count(props) {
    const myRef = React.useRef()

    function show() {
        console.log(myRef.current.value)
    }

    return (
        <div>
            <input type="text" ref={myRef} />
            <button onClick={show}>点我获取输入框数据</button>
        </div>
    )
}
```

## 三 其他 HooksAPI

### 3.1 传值 useContext

```js
const ctx = React.createContext()

function Son(){
  let count = React.useContext(ctx)
  return (<h3>{count}</h3>)
}

function Demo(){
  const [count, setCount] = React.useState(100)
  return (
    <div>
      <p>{count}<p>
      <button onClick={()=>{count+1}}>点击</buttom>
      <ctx.Provider value={count}>
        <Son />
      </ctx.Provider>
    </div>
  )
}
```

### 3.2 useReducer

```js
function Demo() {
    const [count, dispatch] = React.useReducer((state, action) => {
        switch (action) {
            case 'add':
                return state + 1
            case 'sub':
                return state - 1
            default:
                return state
        }
    }, 0)
    return (
        <div>
            <h3>count: {count}</h3>
            <button
                onClick={() => {
                    dispatch('add')
                }}
            >
                增加
            </button>
        </div>
    )
}
```

### 3.3 useReducer 和 useContext 的配合使用

useReducer 和 useContext 其实可以模拟出 Redux 效果：

-   useContext：可以访问全局状态，避免一层层传递，可以实现 Redux 状态全局化统一管理。
-   useReducer：可以实现类似 Redux 的 Reducer 部分

所以创建一个共享数据的组件：

```js
export const ctx = React.createContext()

export const UPDATE_NUM = 'UPDATE_NUM'

const reducer = (state, action)=>{
    switch (action.type) {
      case 'add':
        return state + 1
      case 'sub':
        return state - 1
      default:
        return state
    }
}

export function DemoRedux = props => {
  const [data, dispatch] = React.useReducer(reducer, 100)
  return (
    <div>
      <ctx.Provider value={{data, dispatch}}>
        {props.children}
      </ctx.Provider>
    </div>
  )
}
```

其他组件使用共享数据：

```js
<DemoRedux>
    <MyComp1 />
    <MyComp2 />
</DemoRedux>
```

MyComp1 中动态接收数据：

```js
function MyComp1() {
    const { data } = React.useContext(DemoRedux)

    return (
        <div>
            DemoRedux:{data}
            <button
                onClick={() => {
                    dispatcj((type: 'add'), (data: 20))
                }}
            >
                点击
            </button>
        </div>
    )
}
```
