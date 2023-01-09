# 13-TS 与 JS 的互操作

## 一 类型声明

### 1.1 类型声明的使用

当我们将一个 JS 项目迁移为 TS 项目时，或者 TS 项目中使用到了 JS 书写的第三方库时，为了类型安全，我们需要定义适配一些 TS 的类型，以让代码更加安全，这时候需要类型声明。

类型声明文件的扩展名是 `.d.ts`，配合 JSDoc 用来为无类型的 JavaScript 代码附加 TypeScript 类型。类型声明的规范：

- 类型声明中只能包含类型，不能有参数，所以不能实现函数、类、对象或变量，参数也不能有默认值
- 使用关键字 `declare` 可以声明 JavaScript 代码中的定义过的某个值
- 类型声明只需要声明使用方可见的类型，不导出的代码、函数内的局部变量无需为其声明类型

下面是一段原始的代码示例：

```ts
export class Obeservable {
  _observers: any[]
  constructor() {
    this._observers = []
  }

  static create() {
    return new Obeservable()
  }

  subscribe(observer: any) {
    this._observers.push(observer)
  }

  unsubscribe(observer: any) {
    this._observers = this._observers.filter((obs) => obs !== observer)
  }

  notify(data: any) {
    this._observers.forEach((observer) => observer(data))
  }
}
```

当使用编译命令 `tsc -d Obeservable.ts` 后，除了得到编译后的 js 文件外，还有一个 `Obeservable.d.ts` 的类型声明文件：

```ts
export declare class Obeservable {
  _observers: any[]
  constructor()
  static create(): Obeservable
  subscribe(observer: any): void
  unsubscribe(observer: any): void
  notify(data: any): void
}
```

这里新增了关键字 `declare`，这并不是真正的定义了一个 class 而是向编译器告知，会有一个类 `Obeservable` 存在。这个导出的类型声明文件对于当前项目来说没有太多意义，而是当项目作为第三方库被其他人使用时，API 调用者能够通过 TS 获取到更多的类型信息联想。

当 TS 项目启动时，会扫描读取所有的 `.d.ts` 文件，以为当前项目提供类型信息，并且无需编译 TS 书写的第三方库，能有效提升效率。

### 1.2 外参变量声明

类型声明在自己的项目中也可以直接使用，比如 Node 项目需要使用 `process` 类的成员时，则可以声明一个全局的 `process` 类，这时候无需显式导入即可享受到类型提示。没有声明时，直接使用 `process` 则会报错：`找不到名称“process”`。

当我们自己定义一个 `process` 对象时，则会提示不能增强全局对象：

```ts
process = {
  env: {
    NODE_ENV: 'dev',
  },
}
```

这里其实是 TS 防卫过当了，我们只需要新建一个 `polyfills.ts` 文件让 TS 项目自动扫描即可：

```ts
declare let process: {
  env: {
    NODE_ENV: 'dev'
  }
}

process = {
  env: {
    NODE_ENV: 'dev',
  },
}
```

这里是向 TS 告知了有个全局对象 process，且有属性 env 等。

贴士：TS 自带了 Node 的一些类型，安装 `npm i --save-dev @types/node` 即可。

### 1.3 外参模块声明

当我们需要给一些仓库提交类型声明时，可以把常规的类型声明放在 `declare module` 中：

```ts
declare module 'module-name' {
  export type name = string
  let defaultName: name
  export default defaultName
}
```

在项目中则需要导入模块才能使用：

```ts
// 使用方式一
import UtilModule from 'UtilModule'
const name: UtilModule.name = 'zs'

// 使用方式二
import { name } from 'UtilModule'
const name: name = 'zs'
```

模块的声明支持通配符，可以匹配指定模式的任何导入路径声明类型：

```ts
// webpack中json-loader导入的json类型
declare module 'json!*' {}

// webpack 中 style-loaer 导入的css
declare module '*.css' {}
```

接着配置构建系统，允许加载 json 和 css 文件，就可以使用 json 和 css 文件了：

```ts
import a from 'json!myFile'

import b from './widget.css'
```

## 二 JS 代码迁移到 TS 代码

### 2.0 迁移流程

如果我们要将 JS 项目迁移到 TS 项目，那么要做到的事代码都使用 TS 编写，类型做到全覆盖，依赖的第三方库也有严格的类型信息，以让 bug 在编译时捕获。

整体迁移流程可以概括为：

- 1、添加并配置 TSC 文件
- 2、对 JS 代码做类型检查
- 3、将 JS 代码改写为 TS 代码，一次改一个文件
- 4、为了依赖安装类型声明
- 5、代码开启严格模式

### 2.1 添加并配置 TSC 文件

tsc 添加如下配置后即可让 TSC 编译 JS 文件了，此时 TSC 不会对 JS 文件做类型检查：

```json
{
  "compilerOptions": {
    "allowJs": true
  }
}
```

### 2.2 对 JS 代码做类型检查

这一步是可选的，如果我们要求更加严格，JS 文件也要做类型检查，则可以修改配置为：

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

此时 TS 编译 JS 文件时，会尽力推导类型，并做类型检查。如果代码量比较庞大，则很可能会出现错误，可以在出错的 JS 文件顶部加入以下注释禁用该功能：

```txt
// @ts-check
```

如果一个文件抛出的类型错误问题较多，暂时不想修正，则可以保留 checkJs 设置，在该文件顶部加入注释：

```txt
// ts-nocheck
```

TS 并不能推导出 JS 项目的全部类型信息，将会出现狠毒 any，如果启用了严格模式，迁移过程中可以临时允许隐式 any：

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noImplicitAny": false
  }
}
```

贴士：TSC 推导 JS 代码，类型限定要宽容一点：

- 所有的函数参数都是可选的
- 函数和类的属性无需事先声明，会根据场景推导
- 声明对象、类、函数后，可以再附加额外的属性。其背后原理是 TS 为各个类和函数声明生成了一个命名空间，为每个对象字面量自动添加一个索引签名

### 2.3 添加 JSDoc 注释

JSDoc 可以为某个 JS 函数添加类型注解，这在快速将一个 JS 文件转化为 TS 文件上有帮助，如下所示是一个 JS 文件，添加了 JSDoc 注释：

```js
/**
 * @param name {string} The name of the person
 * @param age {number} The age of the person
 * @returns {void} The name of the person
 */
export function test(name: string, age: number): void {
  console.log('Hello, world!')
}
```

这个 test 函数的类型会推导为：
在没有 JSDoc 时，TSC 会将其类型推导为：

```ts
// 没有JSDoc支持
(name:any, age:any)=>void

// 有JSDoc支持
(name:string, age:number)=>void
```

### 2.4 修改文件后缀为 ts

修改文件后缀名为 ts 可能会带来大量的报错提示，这时候我们可以根据提示一一修改，以彻底改进项目的类型支持，如果比较耗时则可以偷懒，将严格模式 `use strict` 设置为 false，最后逐个开启严格模式，如：`noImplicitAny`，`noImplicitThis`，`strictNullChecks`等。

### 2.5 启用严格类型检查策略

修改为 JS 切换 TS 带来的问题后，可以取消 JS 支持，开启严格 TS 检查：

```json
{
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false
  }
}
```

修正完此时出现的错误则 JS 项目成为了最终的优秀 TS 项目。

## 三 TS 项目中使用 JS 代码

TS 查找 JS 代码类型类型信息的规律是：

- 1、首先查找同一级目录中与 `.js` 文件同名的 `.d.ts` 文件，如果存在，则使用该文件作为 JS 文件的类型声明
- 2、如果不存在，且 tsc 配置中 allowJs 和 checkJs 的值为 true，推导 `.js` 推导 JS 的类型信息
- 3、如果无法推导，则整个模块都会被视为 any

导入第三方库的时，查找的原则少有不同：

- 1、在本地寻找模块的类型声明
- 2、本地未找到，则分析该第三方模块的 package.json 文件，这个文件中定义了 types 或 typings 的资源，则使用字段设置的 `.d.ts` 文件作为模块的类型声明
- 3、如果没有这些字段，则向上查找 node_modules/@types 文件夹，看看有没有类型声明
- 4、如果还没找到则，回到 TS 查找 JS 代码类型信息的规律中的 1、2、3 步骤。

## 四 使用第三方 JS 库

如果一个包自带了类型声明，且项目中设置了 `{"noImplicitAny":true}`，则导入时不会有错误提示。

如果一个包没有类型声明，则可以前往 NPM 查看是否有该包的对应类型库，都位于 `@types` 作用域下，以 lodash 为例：

```txt
// 安装lodash
npm i lodash -S

// 安装lodash声明
npm i @types/lodash -D
```

如果社区中也没有该包声明，则有以下几种办法：

- 在导入的文件中加上 `// @ts-ignore` 注释，即将文件添加到白名单中，TS 这时候使用无类型信息的模块（其实是 any）
- 新建一个类型声明文件，欺骗 TSC 已经有可导入的模块，比如新建 `types.d.ts`，内容为 `declare module 'UtilModule'`，这时候类型都是 any，也可以在该文件内新增具体的类型，以外参模块形式增强类型
