# 12-内置对象 -3-Function

## 一 函数对象的内部对象

在函数内部有三个特殊对象：arguments、this、caller。

### 1.1 arguments

JS 在创建函数的同时，会在函数内部创建一个 arguments 对象实例，用来存储传递过来的实参。

arguments 对象是个伪数组，其长度由实参个数决定。

```js
function fn(a, b) {
  console.log(fn.length) //输出：函数的形参的个数 2
  console.log(arguments) //输出：{ '0': 1, '1': 2 }
  console.log(arguments.length) // 输出实参个数 1
}
fn(1)
```

示例：

```js
// 阶乘函数示例：该写法造成了内部函数与函数本身的耦合，且若修改了函数名，还要去内部修改一次递归调用明
function factorial(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * factorial(num - 1)
  }
}

// 替换写法
function factorial(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * arguments.callee(num - 1)
  }
}
```

### 1.2 this

this 对象是函数的执行环境对象，也可以称为具体某个实例。

### 1.3 caller

caller 对象中保存着调用当前函数的函数的引用，如果是在全局作用域中调用当前函数，其值为 null：

```js
// 下列代码会导致警告框中显示 outer() 函数的源代码，因为 outer() 调用了 inter()，所以 inner.caller 就指向 outer()。
function outer() {
  inner()
}

function inner() {
  alert(inner.caller)
}

outer()

// 使用 caller 实现松耦合
function outer() {
  inner()
}

function inner() {
  alert(arguments.callee.caller)
}

outer()
```

## 二 函数属性

函数也是对象，因此也有属性与方法。

每个函数都包含两个属性：

- length：表示函数命名参数的个数
- prototype：原型属性，每个函数都有原型，用于实现继承。要注意的是 prototype 属性不可枚举（即不能通过 for in 发现）

## 三 apply() call()

每个函数也都包含两个非继承而获得的方法：apply()、call()，都可以用来调用当前函数。

示例：

```js
let a = 20
let obj = {
  a: 40,
}

function fn() {
  console.log(this.a)
}

fn() // 输出 20，因为这里的 this 是全局的 window

// 修改 this 指向
fn.call(obj) // 40
fn.apply(obj) // 40
```

apply 与 call 都修改了函数内部 this 的指向，this 指向第一个参数，如果这个参数为 null，则 this 指向 window。

apply 与 call 的区别是：第二个参数及其后续参数传递形式不同。

- apply：第二个参数为数组，将函数执行需要的参数组装为数组再传入
- call：第二个及其之后的参数是函数执行需要的参数

但是其参数是不同的：

- apply 用于函数的形参个数不确定的情况：函数名.apply(绑定对象，函数参数列表数组);
- call 用于确定了函数的形参有多少个的时候使用：函数名.call(绑定对象，函数参数 1，参数 2，参数 3....);
- apply 和 call 的第一个参数都为 null 时，表示为函数调用模式，即 this 指向 window

使用案例一：求数组最大值

```javascript
let arr = [9, 1, 4, 10, 7]
let max1 = Math.max(9, 1, 4, 10, 7)
let max2 = Math.max.apply(null, arr)
console.log(max1) //输出 10
console.log(max2) //输出 10
```

使用案例二：伪数组

```javascript
//obj 是个伪数组，无法使用 obj.0 获取属性，也无法像数组那样用 obj[0] 获取
let obj = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
}
// [].concat(1,2,3) 会产生数组 [1,2,3]
let arr = [].concat.apply([], obj)
console.log(arr) //输出 ['a','b','c']
```

## 四 bind

ES5 增加了 bind 函数，也用来改变函数内部的 this 指向。但是 bind 函数与 call/apply 不同的是，返回的是一个新的函数，这个新函数与原函数有共同的函数体，但是并非原函数，所以不会像 call/apply 那样立即执行！！！！

```js
function fn(num1, num2) {
  return this.a + num1 + num1
}

let a = 20
let obj = {
  a: 40,
}

let _fn = fn.bind(obj, 1, 2)

console.log(_fn === fn) // false
_fn() // 43
_fn(1, 4) // 43，因为参数绑定，重新传入的参数是无效的
```

手动实现 bind：

```js
function myBind(context) {
  const that = this
  const args = Array.prototype.slice.call(arguments, 1)
  return function () {
    const innerArgs = Array.prototype.slice.call(arguments)
    return that.apply(context, args.concat(innerArgs))
  }
}
```
