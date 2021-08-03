# 06-React 组件数据传递

## 一 有关联级别的组件通信

### 1.1 父传子-props

父传子最简单的方式便是使用 props：

```js
// 父组件传递数据
render(){
  <div>
    <Son text="hi" />
  </div>
}

// 子组件接收数据
render(){
  <div>
    {this.props.text}
  </div>
}
```

有一种特殊写法，可以让两个不相关的组件产生父子关系，其传递数据方式如下：

```js
export default Box extends Component {
  render(){
    return (
      <A><B></B></A>
    )
  }
}
```

此时 A 组件如果要向 B 组件传递数据，需要如下方式：

```js
// box组件内传递数据
  render(){
    return (
      <A render={(name)=> <B name={name}/>}></A>
    )
  }

// A组件内部修改
  render(){
    const { name } = this.state
    return (
      <div>
        {this.props.render(name) }
      </div>
    )
  }


//  B组件正常使用数据
  render(){
    return (
      <h3>{this.props.name}</h3>
    )
  }
```

### 1.2 祖传孙-context

context 对象必须放在祖孙组件都能访问到的区域：

```js
// 创建一个用于保存用户名的上下文
const MyCtx = React.createContext()
const { Provider } = MyCtx

// 祖先组件中传递数据
render(){
  <Provider value={ this.state.username }>
  {/* 子孙组件 */}
  </Provider>
}

// 子孙组件接收数据
static contextType = MyCtx
render(){
  console.log(this.context.username)
}
```

上述书写方式只适用于类组件，下面的方式既可以用于类组件，也可以用于函数式组件：

```js
// 创建一个用于保存用户名的上下文
const MyCtx = React.createContext()
const { Provider, Consumer } = MyCtx

// 祖先组件中传递数据
render(){
  <Provider value={ this.state.username }>
  {/* 子孙组件 */}
  </Provider>
}

// 子孙组件接收数据
render(){
  <Consumer>
    {
      value => {
        return `${value.username}`
      }
    }
  </Consumer>
}
```

## 二 子传父

子：

```js
import React from 'react'

export default class Son extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            num: 100,
        }
    }
    render() {
        return (
            <div>
                <button onClick={this.props.fn.bind(this, this.state.num)}>点我发送数据给父组件</button>
            </div>
        )
    }
}
```

父：

```js
import React from 'react'

import Son from './Son'

export default class Father extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            num: 0, // 默认值为0
        }
    }
    fn = data => {
        console.log('收到子组件数据：', data)
        this.setState({
            num: data,
        })
    }
    render() {
        return (
            <div>
                num: {this.state.num}
                <Son fn={this.fn} />
            </div>
        )
    }
}
```

## 三 同级传值

安装库：npm i pubsub-js -S

```js
import React from 'react'
import PubSub from 'pubsub-js'

export default class Son1 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            num: 100,
        }
    }
    fn = () => {
        PubSub.publish('evt', this.state.num)
    }
    render() {
        return (
            <div>
                <button onClick={this.fn}>点我发送数据给兄弟</button>
            </div>
        )
    }
}
```

接收者：

```js
import React from 'react'
import PubSub from 'pubsub-js'

export default class Son2 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            num: 0,
        }
        PubSub.subscribe('evt', (e, data) => {
            console.log('data:', data)
        })
    }
    render() {
        return <div>来自兄弟的数据: {this.state.num}</div>
    }
}
```

## 四 插槽

如果有下列方式的组件使用：

```js
render(){
    return {
        <div className="father">
            <A>
                <B></b>
            </A>
        </div>
    }
}
```

A 与 B 也同样构成了父子关系，这时候如何传值？

```js
render(){
    return {
        <div className="father">
            <A render={ (name) => <B name={name}/> }/>
        </div>
    }
}
```
