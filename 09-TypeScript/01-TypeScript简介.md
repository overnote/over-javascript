# 01-TypeScript 简介

## 一 JavaScript 弱类型

JavaScript 是一种弱类型的动态语言。

弱类型与强类型：

```txt
弱类型：变量的数据类型不固定，可以为其赋值任何类型的值。
强类型：变量的类型是严格固定的，给变量赋值其他类型的数据会引发错误.
```

动态类型与静态类型：语言的动静特性针对的是代码类型的检查方式。

```txt
动态类型：代码运行时进行类型检查。
静态类型：代码编译时进行类型检查，所以静态语言一般都需要先编译、再运行！
```

动态类型很容易造成一个现象，即代码错误不易被捕捉到：

```js
// 该函数参数数据类型并未限制，可以任意传递 对象、字符串、undefined，产生的结果也会千奇百怪
function add(num) {
  return num + 1
}
```

在实际企业开发中，我们往往需要对参数的类型进行判断、限制，这在 JS 语言中非常痛苦！

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

TypeScript 是 2012 年由微软发布的编程语言，是一门非常年轻的语言。

TypeScript 是 JavaScript 的超集，即：TS 会遵循 ECMAScript 的语法规范，但是额外扩展了原生 JS 语法，适合开发大型企业项目。

环境配置：

```txt
# 安装typescript
npm install -g typescript

# 测试环境：tsc是在安装typescript时默认安装的TS编译器
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

## 三 体验 TypeScript 的语法联想演示

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

## 四 TS 的配置

### 4.1 配置文件 tsconfig.json

使用 TS 开发的项目，其根目录都需要 ts 的配置文件：`tsconfig.json`。使用如下命令即可创建：

```txt
tsc --init
```

生成的配置文件一般需要将编译文件输出目录打开，并修正为：
demo

```json
"incremental": true,      /* 增量编译 */
"allowJs": true,           /* 支持JS编译 */
"outDir": "./dist",       /* 输出目录 */
"rootDir": "./src",       /* 源码目录 */
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

### 4.3 配置 vscode 自动编译 TS

步骤如下：

```txt
# 初始化tsconfig
tsc --init
"strict": false,

# 设置 tsconfig.json
"outDir": "./dist",
"strict": false,

# 设置vscode：
# 击vscode菜单->终端->运行任务->显示所有任务->tsc 监视
```
