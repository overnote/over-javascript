# 01-TypeScript 简介

## 一 JavaScript 弱类型

JavaScript 是一种弱类型的动态语言。

弱类型与强类型：

```txt
弱类型：变量的数据类型不固定，可以为其赋值任何类型的值。
强类型：变量的类型是严格固定的，给变量赋值其他类型的数据会引发错误。
```

动态类型与静态类型：语言的动静特性针对的是代码类型的检查方式。

```txt
动态类型：代码运行时进行类型检查。
静态类型：代码编译时进行类型检查，所以静态语言一般都需要先编译、再运行！
```

动态类型很容易造成一个现象，即代码错误不易被捕捉到：

```js
// 该函数参数数据类型并未限制，可以任意传递 对象、字符串、undefined，
// 产生的结果也会千奇百怪
function add(num) {
  return num + 1
}
```

在实际企业开发中，我们往往需要对参数的类型进行判断、限制，否则当数据类型不正确时，就会在运行阶段突然触发：类型错误等提示，这在 JS 语言中非常痛苦！

静态类型的语言在函数定义时会要求 num 必须是整数或者小数等，在书写代码阶段（其实就是编译：开发工具帮助提前编译），一旦出现非法参数，直接报错，无法通过编译，可以大大降低低级错误，而且动态类型语言在开发工具中也不能获得很好的代码提示。

```c
// 这是C语言中的一个函数
int add(int num) {
    return num + 1
}
```

所以弱类型的语言往往不适合大型项目的开发与协作，有这样一句经典的话来形容：动态一时爽，重构火葬场。

为了解决该问题，JavaScript 涌现了许多类型检查机制，常见的有：

- **Flow**：Facebook 推出的 JavaScript 静态类型检查工具，已渐渐式微
- **TypeScrip**t：微软推出的编程语言，是 JavaScript 的超集，当前热度极高。

## 二 TypeScript 初识

### 2.1 TypeScript 简介与安装

TypeScript 是 2012 年由微软发布的编程语言，是一门非常年轻的语言，为 JavaScript 的超集，即：TS 会遵循 ECMAScript 的语法规范，但是额外扩展了原生 JS 语法，适合开发大型企业项目。

环境配置：

```txt
# 安装 typescript
npm i -g typescript

# 测试环境：tsc 是在安装 typescript 时默认安装的 TS 编译器
tsc --version
```

### 2.2 HelloWorld

helloworld 案例：

```ts
//新建一个 hello.ts
export class Hello {
  run() {
    console.log('hello world!')
  }
}
new Hello().run()
```

TS 代码是无法直接运行的，因为目前还没有成熟的 TS 运行时（你知道 Deno 吗？），TS 的代码一般要先通过 `tsc`工具编译为 JS 代码才能真正执行。

上述代码执行步骤：

```txt
# 编译 ts 文件
tsc hello.ts

# 运行生成的 js 文件
node hello.js
```

### 2.3 体验 TypeScript 的语法联想演示

ts 代码如下：

```ts
interface Point {
  x: number
  y: number
}

function fn(p: Point): void {
  console.log(p.x + p.y) // 在输入 p. 时候会轻松联想出 x y
}

fn({ x: 1, y: 2 })
```

而到了 JS 中：

```js
let Point = {
  x: number,
  y: number,
}

function fn(p) {
  console.log(p.x + p.y) // 这里的联想出很多不必要的东西，甚至不会联想！
}

fn({ x: 1, y: 2 })
```

## 三 理解 TypeScript 的类型检查

### 3.1 编译器

编译器可以将代码文本转换成抽象语法树（abstract syntax tree，即 AST），AST 的本质是去除了空白、注释、缩进等制表符后的数据结构，AST 最终会被编译器转换为字节码（bytecode）底层程序，交给计算机执行。那么大多数编程语言整体执行过程，以 JS 为例为：

- 1、将 JavaScript 程序解析为 JavaScript AST
- 2、把 JavaScript AST 编译为字节码
- 3、运行时计算字节码

TypeScript 其他编程语言不同的是，其不直接生成字节码，而是编译成了 JavaScript 代码，接着再在浏览器或者 Node 等运行时中运行 JS 代码！TS 对代码安全性的保证就在 TS 编译器生成 AST 后，真正运行代码之前，会对代码做类型检查。所以，TS 编译器的解析步骤为：

- 1、将 TypeScript 程序解析为 TypeScript AST
- 2、类型检查器检查 TypeScript AST
- 3、把 TypeScript AST 编译为 JavaScript 源码
- 4、把 JavaScript AST 编译为字节码
- 5、运行时计算字节码

上述步骤中，1-3 步为 TSC 编译器执行，4-5 步为浏览器/Node 执行。这意味着程序中的类型类型只在类型检查这一步起到作用，对程序输出没有任何影响，这是 TS 与传统编译型语言最大的不同，也是其巧妙之处。（ Node 之父创建的 Deno 能直接运行 TS 是另外一个故事了）

### 3.2 类型系统设计

在 TS 编译代码运行步骤中的第 2 步，使用的类型检查器其实是一套程序分配类型的规则。一般有两种类型系统：

- 显式设置类型（type annotation，类型注解）：如 Java 需要显式设置几乎所有类型！
- 自动推导类型（type interface， 类型推断）：如 JS、Python 等在运行时推导类型，Haskell 在编译时推导检查类型

这两种方式都各有利弊，TS 都支持了，这样在开发者这里就可以依据需求设计类型。而且 TS 是渐进式类型语言，在编译前不需要知道全部类型，即便是没有类型的程序，TS 也能推导出一部分类型，捕获部分错误。

示例：

```ts
// 类型注解
const count: number
// 声明时也可以直接赋值
let age: number = 30

// 类型推断：声明变量之后，再使用时，鼠标移入 num 查看，会显示为 number 类型
let num = 123
```

贴士：在实际开发中，如果一个变量拥有了固定的值，推荐让 TS 自动推导，无需手动设置其变量类型。

变量的类型乍一看有点鸡肋，其作用其实很大程度上体现在函数中，比如如下函数，如果参数没有类型，函数内部的运算就会有隐藏问题，如 undefined 等，且其在一连串的函数调用时会引起连锁错误。一般情况下，我们需要对函数的参数进行类型注解，返回值则可以直接推断出来：

```ts
function total(num1: number, num2: number) {
  return num1 + num2
}

// res 的值类型可以推断出来
let res = total(1, 2)
```

不过要注意 typescript 对类型的严格限定：

```ts
let num1: number
console.log(num1) //声明没有赋值报错

let num2: undefined
console.log(num2) //undefined 类型直接输出不会报错

let num3: number | undefined
console.log(num3) //不会报错

let num: null
num = null //正确
num = 123 //报错，定义一个变量为 null 时，变量的值只能是 null
```

在隐式转换方面，TS 能发现无效操作，并在**运行代码前就会及时报错**，如：

```txt
// 报错
const a = 3 + [1]

// 正确输出31，因为意图清晰，可以推导
(3).toStiring +[1].toString()
```

而 JS 在运行上述代码则会导致难以追踪的错误！

## 四 TS 的配置

### 4.1 配置文件 tsconfig.json

使用 TS 开发的项目，其根目录都需要 ts 的配置文件：`tsconfig.json`。使用如下命令即可创建：

```txt
tsc --init
```

常见配置有：

```json
{
  "compilerOptions": {
    "lib": ["es2018", "dom"],  /* tsc假定运行环境中包含哪些API */
    "incremental": true /* 增量编译 */,
    "allowJs": true /* 支持 JS 编译 */,
    "outDir": "./dist" /* 输出目录 */,
    "rootDir": "./src", /* 源码目录 */
     "target": "es2015",  /* tsc编译为哪个版本 */
  },
  "include": {  /* tsc 在哪个文件夹寻找TS文件 */
    "src"
  }
}
```

在上述配置文件支持下，项目中的 TS 文件都会被统一编译到 `./dist`目录下。

贴士：运行 `tsc 具体某一文件名`是不会受 ts 配置文件控制的，而是在根目录中直接运行 `tsc` 才会受到配置文件控制。

package.json 中配置运行脚本：

```json
"scripts": {
  "compile": "tsc -w",
  "build": "nodemon node ./dist/main.js",
  "start": "concurrently npm:compile & npm:build"
}
```

nodemon 是自动重启的 node 包，concurrently 是并行执行程序的包，需要开发者自行安装。

### 4.2 ts-node

`ts-node` 模块可以帮助用户直接运行 ts：

```txt
# 安装
npm i -g ts-node

# 运行
ts-node hello.ts
```

### 4.3 使用 webpack 处理 typescript

如果项目中用到 webpack，则推荐使用官方的 loader：

```txt
npm i -D ts-loader
```

tsconfig.json 配置：

```js
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "allowJs": true
    },
    "include": [
        "./src/*"
    ],
    "exclude": [
        "./node_module"
    ]
}

```

webpack 配置：

```js
{
  test: /\.tsx?$/,
  use: {
    loader: 'ts-loader'
  }
}
```
