# 05-重要属性-2-数据 props

## 一 props 概念

props 属性用于接收外部传入组件的数据。

react 组件内可以引用其他组件，这就形成了组件树，下层组件可以利用 props 来使用上层组件传递过来的数据，所以 props 数据对当前组件来说是只读的，如果要修改 props 数据，只能由其父组件修改。

## 二 props 使用示例

### 2.0 外部传递数据示例

```js
function App() {
    let data = 'lisi'
    return (
        <div className="App">
            <FuncComp name={data}></FuncComp>
            <ClasComp name={data}></ClasComp>
        </div>
    )
}
```

### 2.1 函数组件使用 props 示例

```js
function FuncComp(props) {
    return <div>传递过来的数据：{props.name}</div>
}
```

### 2.2 类组件使用 props 示例

```js
class ClaComp extends React.Component {
    render() {
        return <div>组件props数据：{this.props.name}</div>
    }
}
```

## 三 props 使用注意事项

### 3.1 props 默认值

函数类型组件定默认值：

```js
function FuncComp(props) {
    // 若参数props无name属性，则显示默认属性值
    return <div>默认数据：{props.name}</div>
}

FuncComp.defaultProps = {
    name: 'zs',
}
```

贴士：在 React15 版本及其之前，默认参数使用 `||`方式，如下所示：

```js
props.name = props.name || '默认值'
```

### 3.2 批量传递标签属性 props

传递多个参数时可以使用 ES6 的扩展运算符:

```js
let data = {
    name: 'lisi',
    age: 30,
}
return (
    <div className="App">
        <FuncComp {...data}></FuncComp>
    </div>
)
```

### 3.3 props 验证

props 验证用来验证传递的数据类型是否符合要求。验证不会对运行产生影响，而是会在控制台打印错误信息，推荐在生产环境中取消 props 验证。

使用 props 验证需要先下载 prop-types 包：

```txt
npm i prop-types -S
```

验证示例：

```js
import ReactTypes from 'prop-types'

class Comp extends React.Component {
    // 类型限制
    static propTypes = {
        name: PropTypes.string,
        age: PropTypes.number,
        info: PropTypes.func,
    }
    // 默认值
    static defaultProps = {
        age: 18,
    }
}
```

### 3.4 构造器中的 props

构造器 props 的书写与否并不会影响组件的创建于使用，但是构造器只有接受了 props，且使用`supre(props)`，组价的实例才能获取到 props，该用方法几乎用不到。
