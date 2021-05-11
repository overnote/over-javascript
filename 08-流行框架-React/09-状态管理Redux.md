# 09-状态管理 Redux

## 一 Redux 概念

Redux 是一款集中状态管理库，适用于 React、Angular、Vue 等库，但经常与 React 配合使用。

![redux](../images/mvvm/redux-01.png)

**store**：store 用于维护 state，可以将 action 与 reducer 联系到一起，是整个 redux 的核心部分。

**action**：是负责将数据从应用传递到 store 的对象。触发 action 是唯一可以改变 state 的方法。给 store 发送 aciton 方式：`store.dispatch()`。

**reducer**：reducer 是一些纯函数，响应接收到的 action，返回新的 state 给 store。reducer 可以实现复用、顺序控制等。

注意：action 只是描述了事情要发生，并未描述如何去更新 state，更新方式位于对应的 reducer。

## 二 redux 简单示例

安装 redux 相关库：

```txt
npm i -S redux
npm i -S react-redux
npm i -D redux-devtools
```

应用中所有的 state 都以一个对象树的形式储存在一个单一的 store 中。 惟一改变 state 的办法是触发 action，一个描述发生什么的对象。 为了描述 action 如何改变 state 树，你需要编写 reducers。

```js
import { createStore } from 'redux'

// reducer
function counter(state = 0, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1
        case 'DECREMENT':
            return state - 1
        default:
            return state
    }
}

// 创建 Redux store 来存放应用的状态。
let store = createStore(counter)
store.subscribe(() => console.log(store.getState()))

// 改变内部 state 惟一方法是 dispatch 一个 action
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })
```

## 三 综合示例

### 3.1 示例目录

![redux](../images/mvvm/redux-02.png)

### 3.2 入口传递 store

入口通过 Provider 传递 store：

```js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import store from './redux/store'
import { Provider } from 'react-redux'

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
```

### 3.2 store

该文件专门用于暴露一个 store 对象，整个应用只有一个 store 对象:

```js
//引入createStore，专门用于创建redux中最为核心的store对象
import { createStore, applyMiddleware } from 'redux'
//引入为Count组件服务的reducer
import countReducer from './reducers/count_reducer'
//引入redux-thunk，用于支持异步action
import thunk from 'redux-thunk'
//暴露store
export default createStore(countReducer, applyMiddleware(thunk))
```

### 3.3 constants.js

该模块是用于定义 action 对象中 type 类型的常量值，目的只有一个：便于管理的同时防止程序员单词写错。

```js
export const INCREMENT = 'increment'
export const DECREMENT = 'decrement'
```

### 3.4 actions

actions 文件夹内全部是视图组件对应的各自 action 对象，以 count 组件对应的 acount_action.js 文件为例：

```js
import { INCREMENT, DECREMENT } from '../constatns'

//同步action，就是指action的值为Object类型的一般对象
export const createIncrementAction = data => ({ type: INCREMENT, data })
export const createDecrementAction = data => ({ type: DECREMENT, data })

//异步action，即action的值为函数,异步action不是必须要用的
export const createIncrementAsyncAction = (data, time) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(createIncrementAction(data))
        }, time)
    }
}
```

### 3.5 reducers

reducers 文件夹内全部是 actions 对应的 reducer，以 count 组件为例，acount_reducer.js 是 count_actions 对应的所有 reducer：

```js
import { INCREMENT, DECREMENT } from '../constatns'

const initState = 0 //初始化状态
export default function countReducer(preState = initState, action) {
    // console.log(preState);
    //从action对象中获取：type、data
    const { type, data } = action
    //根据type决定如何加工数据
    switch (type) {
        case INCREMENT: //如果是加
            return preState + data
        case DECREMENT: //若果是减
            return preState - data
        default:
            return preState
    }
}
```

### 3.6 组件中使用

count 组件：

```js
import React, { Component } from 'react'
import { connect } from 'react-redux' // connect 用于连接UI组件与redux

//引入action
import { createIncrementAction, createIncrementAsyncAction } from '../../redux/actions/count_action'

class Count extends Component {
    state = { carName: '奔驰c63' }

    //加法
    increment = () => {
        const { value } = this.selectNumber
        this.props.add(value * 1)
    }

    //异步加
    incrementAsync = () => {
        const { value } = this.selectNumber
        this.props.addAsync(value * 1, 500)
    }

    render() {
        //console.log('UI组件接收到的props是',this.props);
        return (
            <div>
                <h1>当前求和为：{this.props.count}</h1>
                <select ref={c => (this.selectNumber = c)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>&nbsp;
                <button onClick={this.increment}>+</button>&nbsp;
                <button onClick={this.incrementAsync}>异步加</button>&nbsp;
            </div>
        )
    }
}

//使用connect()()创建并暴露一个Count的容器组件
export default connect(
    state => ({ count: state }),

    //mapDispatchToProps的一般写法
    /* dispatch => ({
  add:number => dispatch(createIncrementAction(number)),
  addAsync:(number,time) => dispatch(createIncrementAsyncAction(number,time)),
 }) */

    //mapDispatchToProps的简写
    {
        add: createIncrementAction,
        addAsync: createIncrementAsyncAction,
    }
)(Count)
```

### 3.7 多个 reducer 合并共享数据

在 store 中合并 reducer：

```js
//引入为Count组件服务的reducer
import countReducer from './reducers/count'
//引入为Count组件服务的reducer
import personReducer from './reducers/person'

//汇总所有的reducer变为一个总的reducer
const allReducer = combineReducers({
    counter: countReducer,
    personer: personReducer,
})

//暴露store
export default createStore(allReducer, applyMiddleware(thunk))
```
