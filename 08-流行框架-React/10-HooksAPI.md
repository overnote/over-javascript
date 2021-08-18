# 10-HooksAPI

## 一 HooksAPI 简介

函数式组件最大的问题是没有 this，即实例对象，这就造成了类组件中很多实例方法无法在函数式组件中得到使用。在最初，函数式组件只能用来定义那些没有 state 的简单组件。

hook 是 React16.8 新增的重要特性，其核心功能是让函数式组件能够使用状态、生命周期等特性，自此 React 的组件不再存在无状态属性这个概念。

增强后的函数式组件对比类组件：

- 代码可读性更强了：类组件的业务逻辑被分布在了不同的生命周期函数中，不利于维护，Hooks 可以将业务代码聚合
- 组件层级更浅：类组件需要使用 HOC/render props 等方式复用组件状态，增强功能，会增加组件的层级，Hooks 可以通过自定义 Hooks 实现。

## 二 状态 Hooks：useState()

### 2.1 基本写法

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

### 2.2 多个状态写法

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

### 2.3 状态的更新

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

## 三 生命周期 Hooks：useEffect()

### 3.1 useEffect()监控状态

函数组件没有生命周期函数，添加 useEffect Hook，示例将会在初次加载、任意状态改变时执行：

```js
let [count, setCount] = React.useState('Jack')
let [name, setName] = React.useState('Jack')

React.useEffect(() => {
  console.log('useEffect...')
}, [count, name])
```

第二个数组参数是可选的，意思是：监控该函数式组件内哪些状态。

- 空数组，则不会监控，只会在组件初次加载时执行 useEffect()。
- 数组参数不写，则监控所有状态。

useEffect() 可以在函数式组件中执行副作用操作，即监控组件状态的变更，模拟生命周期，比如在 React 中方发送 ajax，手动更改真实 DOM、启动定时器等，如下所示：

```js
useEffect(async () => {
  let data = await fetchUsers()
}, [])
```

### 3.2 需要清除的 effect

useEffect 的第一个函数参数内部也可以返回一个函数，这个返回的函数会在组件卸载时触发，推荐在 return 中书写清理定时器等方法：

```js
React.useEffect(() => {
  console.log('mount...')
  return () => {
    console.log('component will unmount...')
  }
})
```

如下示例，每次状态改变，都会给 document 添加一个事件处理函数，所以需要做清除处理：

```js
const [pos, setPos] = useState({ x: 0, y: 0 })

useEffect(() => {
    const update = e => {
        setPosition({ x: e.clientX, y: e.clientY })
    }
    document.addEventListener('click', update)
    return () => {
        document.removeEventListener('click', update)
    }
})

return ()   // JSX
```

### 3.3 自定义 hook

自定义 hook 通常以 use 开头命名：

```js
const useMyPosition = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const update = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    document.addEventListener('click', update)
    return () => {
      document.removeEventListener('click', update)
    }
  })

  return pos // 不再return JSX
}
export default useMyPosition
```

使用：

```js
function App() {
  const pos = useMyPosition()
  return <div>{pos.x}</div>
}
```

通常来说自定义 hook 返回一个函数，可以简化或者为 useEffect 这些 hooks 提供新功能。

### 3.4 高阶组件 HOC（Higher order component）与自定义 hook

一般组件都是接收 props 参数，将这些参数转化为组件数据来使用的，而高阶组件其实即接收了组件作为参数，返回了新的组件。

如下所示：

```js
// 制作一个高阶组件
const withLoader = (WrapperComponent, url) => {
  return class LoaderComponent extends React.Component {
    //  内部执行ajax
  }
}

// 使用该高阶组件
function App() {
  const WithLoaderComponent = withLoader(wrapper, '')
  return <WithLoaderComponent />
}
```

这里如果使用 hooksAPI 将会更加优雅，能够直接使用其返回值：

```js
// 制作自定义hooks
const useLoader = (url) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    axios.get(ulr).then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [url])

  return [data, loading]
}
export default useLoader

// 使用
const ShowHook = () => {
  const [data, loading] = useLoader('localhost')
  return <>{isLoading ? <p>读取中</p> : <p>加载完成</p>}</>
}
function App() {}
```

## 四 操作 DOMHooks：useRef()

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

## 五 改造 context 通信 Hooks：useContext()

createContext() 可以实现跨组件通信，useContext()可以在此基础上将原有的写法改造，不需要再依赖 consumer，解决 consumer 嵌套问题：

```js
const ctx = React.createContext()

function Son(){
  let count = React.useContext(ctx)
  return (<h3>{count}</h3>)
}

function Father(){
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

## 六 useReducer()

useRedcuer() 的使用方式类似 redux：

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

useReducer 和 useContext 其实可以模拟出 Redux 效果：

- useContext：可以访问全局状态，避免一层层传递，可以实现 Redux 状态全局化统一管理。
- useReducer：可以实现类似 Redux 的 Reducer 部分

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

## 七 记忆函数 useCallback()、useMemo()

### 7.0 组件更新问题

如下所示类组件的 React 代码：

```js
class Demo {
  render() {
    return (
      <div>
        <Comp
          style={{ fontSize: 14 }}
          handler={() => {
            console.log('run....')
          }}
        />
      </div>
    )
  }
}
```

在 React 中，父组件如果重新 render()，则其内部子组件的 render()也都会被相应调用。一旦 Demo 的 props、state 发生改变，触发 Demo 的 render()函数后，其子组件 Comp 的 style、handler 属性的值是一个新生成的引用，这时候会导致 Comp 重新渲染。如果该组件是一个大型组件树，则会造成性能损失，解决办法是将参数抽离为变量：

```js
const fontSizeStyle = { fontSize: 14 }
class Demo {
  handler = () => {
    console.log('run....')
  }
  render() {
    return (
      <div>
        <Comp style={ontSizeStyle} handler={this.handler} />
      </div>
    )
  }
}
```

在函数式组件中，没有 this 保存函数，所以函数式组件在每次渲染时，如果有传递函数的话都会重新渲染子组件：

```js
const fontSizeStyle = { fontSize: 14 }

function Demo() {
  const handler = () => {
    console.log('run....')
  }

  return (
    <div>
      <Comp style={ontSizeStyle} handler={handler} />
    </div>
  )
}
```

贴士：一般可以将函数式组件理解为类组件中 render 函数的语法糖，所以每次渲染时，哈术士组件内部所有代码都会重新执行一遍，对应到上述代码，每次 render，handler 都是一个新的引用，即其绑定的事件函数仍然一直在随着 render 发生变化！

### 7.1 记忆函数 useCallback()

useCallback() 可以获得一个记忆函数：

```js
const fontSizeStyle = { fontSize: 14 }

// 这里要对子组件做高阶组件化处理才能行得通
const MemComp = memo(Comp)

function Demo() {
  const handler = useCallback(() => {
    console.log('run....')
  }, []) // 空数组表示无论什么情况该函数都不会发生改变

  return (
    <div>
      <MemComp style={ontSizeStyle} handler={handler} />
    </div>
  )
}
```

useCallback()第二个参数数组中每一项发生改变，或者引用发生改变，useCallback()返回一个新的记忆函数提供给后面进行渲染。

memo()的第二个参数是一个回调函数，如果返回 true，则表示组件内的函数被永远缓存了下来：

```js
const MemComp = memo(Comp, () => {
  return true
})
```

### 7.2 记忆函数 useMemo()

useMemo()可以完全取代 useCallback：

```js
useMemo(() => {}, [])
```

二者的区别是：useCallback() 不会执行第一个参数函数，而是直接返回给你，useMemo()则会执行该函数，并将函数结果返回给你。

一般情况下：useCallback()用于事件的响应函数，useMemo()用于组件的缓存。

### 7.3 memoize-one

在未进行任何处理的情况下，父组件 render，总会导致子组件 render，即使子组件的 state/props 并未发生变化。在大列表筛选时，筛选逻辑复杂，这将是一个很重要的优化点。memoize-one 可以帮助：

<https://github.com/alexreardon/memoize-one>
