# 03-React 组件化开发

## 一 React 组件创建化开发思想

### 1.1 组件化思想

组件化是指从 UI 界面角度出发，合理重用 UI 组件。如果将一个页面中的业务逻辑放在一起，将会让项目变得难以维护、扩展，将页面拆分为一个个小的功能块，每个功能块具有完全独立的功能，不同功能块之间通过一些方法进行关联，这样更便于扩展、维护。

具体的实现细则：

```txt
将一个完整的页面拆分为多个功能块组件，每个组件用于实现页面的一个功能块
每个组件内部可以进一步进行划分为更加细小的组件
```

组件化为页面的开发实现了更好的抽象，达到复用效果，任何应用都可以被抽象为一棵组件树：

![组价树](../images/mvvm/vue-02.png)

### 1.2 react 中的组件化

组件都拥有自己独立的数据、行为，与其他组件之间互相独立，甚至相同组件的不同实例之间也是互相独立的。

组件的样式、行为等都会因为组件数据的改变而发生改变，维护组件这些数据的对象称为组件的状态（state）。

react 中定义组件有两种方式：

-   函数组件：定义组件简单方便，但是 React16 之前无法使用状态，只能用来作为基础模板使用，在 React16 hooks API 出来之后，函数组件逐渐兴起
-   类组件：使用 class 语法定义的组件，能够使用状态，但是书写较为臃肿

## 二 React 组件化开发初识

### 2.1 React 定义组件

组件放在根目录的 components 文件夹。

在 components 文件中新建 `FuncComp.js` 文件，内部导出一个函数组件：

```js
function FuncComp() {
    return <div>函数组件</div>
}

export default FuncComp
```

在 components 文件中新建 `ClaComp.js` 文件，内部导出一个类组件：
定义一个类组件：

```js
import React from 'react'

class ClaComp extends React.Component {
    render() {
        return <div>类组件</div>
    }
}

export default ClaComp
```

在页面中中使用组件，下列示例在 App.js 根组件中使用：

```js
import React from 'react'

import FuncComp from './components/FuncComp'
import ClaComp from './components/ClaComp'

function App() {
    return (
        <div className="App">
            <FuncComp></FuncComp>
            <ClaComp></ClaComp>
        </div>
    )
}

export default App
```

贴士：Reac 的组件文件后缀名也可以是 jsx。

### 2.2 标签额外引入问题

脚手架中引入组件时，如果不想因为需要一个额外的单独标签包裹，改变了页面结构，可以如下书写：

```js
return (
    <>
        <MyComp1 />
        <MyComp2 />
    </>
)
```

或者从 react 中引入 Fragment，使用 `<Fragment></Fragment>`包裹。

### 2.3 使用 css

推荐使用 `import comp1.css` 的方式引入 css。在 React 项目中，每个组件都有自己独立的文件夹，往往其自身的 CSS 文件也在其中，这时使用 import 方式引入 css，容易引起组件之间 CSS 冲突，这里 CSS 的引入也可以实现模块化。

实现方式一：如果脚手架目录并未显示 webpack 配置，可以直接在对 css 文件进行重命名为 `comp1.module.css`。使用方式：

```js
import comp1 from './comp1.module.css'

export default class Comp1 extends Component {
    render() {
        return <div className={comp1.box}>hello</div>
    }
}
```

方式二：在 webpack 中开启模块化，开启后使用方式与方式一相同。

```txt
    {test:/\.css$/, use:['style-loader','css-loader?modules']}
```

方式三：直接使用 less 等 css 库。

### 2.4 图片引入

若图片位于 public 目录，引入方式为：

```html
<img src="1.jpg" />
```

若图片位于 src 下，如 assets 目录中，引入方式为：

```js
import imgA from '../assets/1.jpg'
export default class Demo extends React.Component {
  render(){
    return (
      <div>
        <img src={imgA}>
        <img src={require('../assets/1.jpg')}>
      </div>
    )
  }
}
```
