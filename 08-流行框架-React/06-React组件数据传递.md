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
// box 组件内传递数据
  render(){
    return (
      <A render={(name)=> <B name={name}/>}></A>
    )
  }

// A 组件内部修改
  render(){
    const { name } = this.state
    return (
      <div>
        {this.props.render(name) }
      </div>
    )
  }


//  B 组件正常使用数据
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

不过在 HooksAPI 支持下，可以使用 useContext 简化，无需使用 Consumer 进行嵌套：

```js
// 创建一个用于保存用户名的上下文
const MyCtx = React.createContext()

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
        <button onClick={this.props.fn.bind(this, this.state.num)}>
          点我发送数据给父组件
        </button>
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
      num: 0, // 默认值为 0
    }
  }
  fn = (data) => {
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
    return <div>来自兄弟的数据：{this.state.num}</div>
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

## 五 状态提升

在树形组件结构中，a->b->c->d，四个组件，d 和 b 都用到了某个状态，那么状态应该存储在 a 组件中。

状态提升也有助于实现 props 改变触发组件更新，这也是推荐做法：

```js
const Father = () => {
  const [params, setParams] = useState({
    id: 0,
    name: '',
  })

  return (
    <div>
      <Son params={params} setParams={setParams} />
    </div>
  )
}

const Son = (props) => {
  const { params, setParams } = props

  const changeSonData = () => {
    setParams({
      id: Math.random() * 10,
      name: 'lisi',
    })
  }

  return (
    <div>
      params: {params.id}
      <button onClick={changeSonData}>点击改变 Son 接收到的数据</button>
    </div>
  )
}
```

## 六 props 变化触发组件更新

### 6.0 示例

一个用户列表，可以新增和编辑用户：

```js
class Father extends React.Component {
  state = {
    users: [
      { id: 1, name: 'zs' },
      { id: 2, name: 'lisi' },
    ],
    targetUser: {},
  }

  onSubmit = (user) => {
    const { users } = this.state
    const target = users.find((u) => u.id === user.id)

    if (target) {
      this.setState({
        users: [
          ...users.slice(0, users.indexOf(target)),
          user,
          ...users.slice(users.indexOf(target) + 1),
        ],
      })
    } else {
      const id = Math.max(...users.map((u) => u.id)) + 1
      this.setState({
        users: [
          ...users,
          {
            ...user,
            id,
          },
        ],
      })
    }
  }

  render() {
    const { users, targetUser } = this.state
    return (
      <div>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.name}
              <button
                onClick={() => {
                  this.setState({ targetUser: u })
                }}
              >
                编辑
              </button>
            </li>
          ))}
        </ul>
        <Son user={targetUser} onSubmit={this.onSubmit} />
      </div>
    )
  }
}

class Son extends React.Component {
  state = {
    user: this.props.user,
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      user: nextProps.user,
    })
  }

  handleChange = (e) => {
    this.setState({
      user: {
        ...this.state.user,
        name: e.target.value,
      },
    })
  }

  render() {
    const { onSubmit } = this.props
    const { user } = this.state
    return (
      <div>
        <input value={user.name || ''} onChange={this.handleChange} />
        <button
          onClick={() => {
            onSubmit(user)
          }}
        >
          提交
        </button>
      </div>
    )
  }
}
```

需要实现 props 改变引发 state 更新，需要在子组件添加：

```js
// 方式一
componentWillReceiveProps(nextProps) {
 this.setState({
  user: nextProps.user
 });
}

// 方式二：
static getDerivedStateFromProps(props, state) {
 return {
  user: props.user
 };
}
```

这时候会产生新的问题：

- 当在修改一个用户的时候，点击‘确定'按钮，输入框里的文字又变成了修改之前的文字。这是因为点击提交，App 会 re-render，App 又将之前的 user 作为 props 传递给了 Son。我们当然可以在每次点击确定之后将 targetUser 重置为一个空对象，
- 假设页面加载完成后，会异步请求一些数据然后更新页面，如果用户在请求完成页面刷新之前已经在输入框中输入了一些文字，随着页面的刷新输入框中的文字会被清除。

比如：

```js
componentDidMount() {
 setTimeout(() => {
  this.setState({
   text: 'fake request'
  })
 }, 5000);
}
```

导致这个问题的原因在于，当异步请求完成，setState 后 App 会 re-render，而组件的 componentWillReceiveProps 会在父组件每次 render 的时候执行，而此时传入的 user 是一个空对象，所以 Son 的内容被清空了。而 getDerivedStateFromProps 调用的更频繁，会在组件每次 render 的时候调用，所以也会产生该问题。

为了解决这个问题我们可以在 componentWillReceiveProps 中判断新传入的 user 和当前的 user 是否一样，如果不一样才设置 state：

```js
componentWillReceiveProps(nextProps) {
 if (nextProps.user.id !== this.props.user.id) {
  this.setState({
   user: nextProps.user
  });
 }
}
```

### 6.1 使用状态提升

```js
class Son extends React.Component {
  render() {
    const { user, onConfirm, onChange } = this.props
    return (
      <div>
        <input value={user.name || ''} onChange={onChange} />
        <button
          onClick={() => {
            onSubmit(user)
          }}
        >
          确定
        </button>
      </div>
    )
  }
}

// 父类中使用该组件
;<Son
  user={targetUser}
  onChange={(e) => {
    this.setState({
      targetUser: {
        id: targetUser.id,
        name: e.target.value,
      },
    })
  }}
  onSubmit={this.onSubmit}
/>
```

### 6.2 数据由子组件管理

组件的数据完全由自己管理，因此 componentWillReceiveProps 中的代码都可以移除，但保留传入 props 来设置 state 初始值：

```js
class Son extends React.Component {
  state = {
    user: this.props.user,
  }

  onChange = (e) => {
    this.setState({
      user: {
        ...this.state.user,
        name: e.target.value,
      },
    })
  }

  render() {
    const { user } = this.state
    const { onConfirm } = this.props
    return (
      <div>
        <input value={user.name || ''} onChange={this.onChange} />
        <button
          onClick={() => {
            onSubmit(user)
          }}
        >
          确定
        </button>
      </div>
    )
  }
}

// 父类调用
;<Son user={targetUser} onConfirm={this.onSubmit} key={targetUser.id} />
```

如果某些情况下没有合适的属性作为 key，那么可以传入一个随机数或者自增的数字作为 key，或者我们可以在组件中定义一个设置 state 的方法并通过 ref 暴露给父组件使用。
